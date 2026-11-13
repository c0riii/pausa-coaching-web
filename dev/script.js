const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Abrir menú' : 'Cerrar menú');
  navigation.classList.toggle('is-open', !isOpen);
});

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menú');
    navigation.classList.remove('is-open');
  });
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !reducedMotion) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

document.querySelector('#year').textContent = new Date().getFullYear();

(function () {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  if (!localStorage.getItem('cookie-consent')) {
    setTimeout(() => banner.classList.add('is-visible'), 600);
  }
  document.getElementById('cookie-accept').addEventListener('click', () => {
    localStorage.setItem('cookie-consent', 'accepted');
    banner.classList.remove('is-visible');
  });
  document.getElementById('cookie-reject').addEventListener('click', () => {
    localStorage.setItem('cookie-consent', 'necessary');
    banner.classList.remove('is-visible');
  });
})();

document.querySelector('#contact-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;

  const recipient = 'miriam.vicente.salud@gmail.com';
  const name = form.elements.name.value.trim();
  const email = form.elements.email.value.trim();
  const message = form.elements.message.value.trim();
  const subject = encodeURIComponent(`Consulta de acompañamiento — ${name}`);
  const body = encodeURIComponent(`Hola,\n\n${message}\n\nPuedes responderme a: ${email}\n\nUn saludo,\n${name}`);
  const status = document.querySelector('#form-note');
  if (recipient.includes('PENDIENTE')) {
    status.textContent = 'El formulario está preparado, pero el correo de contacto sigue pendiente de configurar.';
    return;
  }
  status.textContent = 'Se abrirá tu aplicación de correo con el mensaje preparado.';
  window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
});

// Asistente FAQ determinista: no llama a una IA ni envía/guarda las consultas.
(function () {
  const launcher = document.querySelector('#chat-launcher');
  const panel = document.querySelector('#chat-panel');
  const closeButton = document.querySelector('#chat-close');
  const form = document.querySelector('#chat-form');
  const input = document.querySelector('#chat-input');
  const messages = document.querySelector('#chat-messages');
  const suggestions = document.querySelector('#chat-suggestions');
  if (!launcher || !panel || !form) return;

  const replies = {
    acompanamiento: 'Es un espacio cuidado para parar, entender qué te está pasando y explorar nuevas formas de relacionarte contigo. Cada proceso es distinto y se adapta a tus necesidades.',
    empezar: 'El primer contacto es para conoceros, escuchar qué te trae y resolver tus dudas, sin compromiso ni necesidad de tenerlo todo claro. Puedes escribir a Miriam desde el formulario de contacto, por email o WhatsApp.',
    'para-quien': 'Está pensado especialmente para mujeres que viven bajo la exigencia del día a día y quieren reconectar con su ritmo, priorizar su salud integral y tratarse con más amabilidad.',
    precio: 'La web no indica tarifas. Lo mejor es preguntárselo directamente a Miriam; puedes hacerlo desde el formulario de contacto o por WhatsApp.',
    online: 'La web indica que el acompañamiento es online. Para consultar cómo se organizan las sesiones, puedes contactar directamente con Miriam.',
    psicoterapia: 'Este acompañamiento no se presenta como psicoterapia ni sustituye atención psicológica o sanitaria. Si necesitas atención clínica, consulta con un profesional sanitario cualificado.',
    contacto: 'Puedes escribir a miriam.vicente.salud@gmail.com, enviar un WhatsApp al +34 656 306 038 o usar el formulario de contacto de esta página.'
  };
  const normalize = (text) => text.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  function answerFor(question) {
    const text = normalize(question);
    if (/precio|cuanto cuesta|tarifa|coste|sesion/.test(text)) return replies.precio;
    if (/empez|primer paso|contact|hablar|cita|reserv/.test(text)) return replies.empezar;
    if (/para quien|a quien|mujer|encaja/.test(text)) return replies['para-quien'];
    if (/psicolog|terapia|psicoterapia|crisis|diagnost|medic/.test(text)) return replies.psicoterapia;
    if (/online|presencial|donde|modalidad/.test(text)) return replies.online;
    if (/email|correo|whatsapp|telefono|contactar/.test(text)) return replies.contacto;
    if (/acompan|consiste|que ofrece|como funciona|trabaj/.test(text)) return replies.acompanamiento;
    return 'No tengo información fiable para responder a eso. Miriam podrá orientarte personalmente; puedes escribirle desde la sección de contacto. No compartas aquí información sensible.';
  }
  function addMessage(text, kind) {
    const bubble = document.createElement('p');
    bubble.className = `chat-bubble chat-bubble--${kind}`;
    bubble.textContent = text;
    messages.append(bubble);
    messages.scrollTop = messages.scrollHeight;
  }
  function ask(question) {
    const cleanQuestion = question.trim();
    if (!cleanQuestion) return;
    addMessage(cleanQuestion, 'user');
    addMessage(answerFor(cleanQuestion), 'bot');
    suggestions.hidden = true;
  }
  function setOpen(open) {
    panel.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', String(!open));
    panel.inert = !open;
    launcher.setAttribute('aria-expanded', String(open));
    if (open) input.focus(); else launcher.focus();
  }
  launcher.addEventListener('click', () => setOpen(launcher.getAttribute('aria-expanded') !== 'true'));
  closeButton.addEventListener('click', () => setOpen(false));
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    ask(input.value);
    input.value = '';
    input.focus();
  });
  suggestions.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-question]');
    if (button) ask(button.textContent);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && launcher.getAttribute('aria-expanded') === 'true') setOpen(false);
  });
})();
