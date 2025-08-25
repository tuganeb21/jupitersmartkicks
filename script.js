// Utilities
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

document.addEventListener('DOMContentLoaded', () => {
  // Header: mobile nav toggle
  const navToggle = $('.nav-toggle');
  const siteNav = $('#site-nav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const open = siteNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    // Close menu when clicking a link (mobile)
    siteNav.addEventListener('click', (e) => {
      if (e.target.matches('a')) {
        siteNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        siteNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Active link highlighting (index sections only)
  const sections = $$('#home, #services, #legitimacy, #testimonials');
  const navLinks = $$('.nav-link');
  const setActive = () => {
    let current = sections.findLast?.(sec => window.scrollY + 120 >= sec.offsetTop) || sections[0];
    if (!current) return;
    navLinks.forEach(l => l.classList.remove('active'));
    const found = $(`.nav-link[href="#${current.id}"]`);
    if (found) found.classList.add('active');
  };
  if (sections.length) {
    setActive();
    window.addEventListener('scroll', setActive, { passive: true });
  }

  // Reveal on scroll
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('reveal-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('reveal-visible'));
  }

  // Back to top button
  const toTop = $('.to-top');
  const toggleToTop = () => {
    if (!toTop) return;
    const show = window.scrollY > 400;
    toTop.classList.toggle('visible', show);
  };
  window.addEventListener('scroll', toggleToTop, { passive: true });
  if (toTop) {
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // Footer year
  const yearSpan = $('#year');
  if (yearSpan) yearSpan.textContent = String(new Date().getFullYear());

  // Contact form handling (mailto fallback)
  const form = $('#contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Fields
      const name = $('#name');
      const email = $('#email');
      const phone = $('#phone');
      const subject = $('#subject');
      const message = $('#message');
      const consent = $('#consent');
      const status = $('.form-status');

      // Reset errors
      $$('.error', form).forEach(el => (el.textContent = ''));

      // Validation
      let ok = true;
      const setErr = (id, msg) => { const el = $(`#err-${id}`); if (el) el.textContent = msg; ok = false; };

      if (!name.value.trim()) setErr('name', 'Please enter your full name.');
      if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) setErr('email', 'Enter a valid email address.');
      if (!subject.value.trim()) setErr('subject', 'Add a brief subject.');
      if (!message.value.trim()) setErr('message', 'Tell us a bit about your needs.');
      if (!consent.checked) setErr('consent', 'Please consent so we can contact you.');

      if (!ok) {
        if (status) status.textContent = 'Please fix the highlighted fields.';
        return;
      }

      // Build mailto link (adjust recipient)
      const to = 'hello@example.com';
      const body = [
        `Name: ${name.value}`,
        `Email: ${email.value}`,
        phone.value ? `Phone: ${phone.value}` : '',
        '',
        message.value
      ].filter(Boolean).join('%0D%0A');

      const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject.value)}&body=${body}`;
      window.location.href = mailto;

      if (status) status.textContent = 'Opening your email client...';
    });
  }
});
document.addEventListener("scroll", () => {
    document.querySelectorAll(".reveal").forEach(el => {
      let rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        el.classList.add("active");
      }
    });
  });
  document.addEventListener("scroll", () => {
    document.querySelectorAll(".reveal").forEach(el => {
      let rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        el.classList.add("active");
      }
    });
  });