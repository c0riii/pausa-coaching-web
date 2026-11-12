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
