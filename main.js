/* ============================================
   JERRY PADILLA JR. — main.js (shared)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* Enable enhanced motion only after JavaScript is available. */
  document.body.classList.add('reveal-enabled');
  if (window.lucide) {
    window.lucide.createIcons({ attrs: { 'stroke-width': 1.7 } });
  }

  /* ── Sticky Nav ── */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 40));
  }

  /* ── Mobile Menu ── */
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuToggle && mobileMenu) {
    let open = false;
    menuToggle.addEventListener('click', () => {
      open = !open;
      mobileMenu.classList.toggle('open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      const spans = menuToggle.querySelectorAll('span');
      if (open) {
        spans[0].style.transform = 'translateY(7px) rotate(45deg)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
      } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    });
    document.querySelectorAll('.mobile-link').forEach(l => {
      l.addEventListener('click', () => {
        open = false; mobileMenu.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        menuToggle.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      });
    });
  }

  /* ── Scroll Reveal ── */
  const reveals = document.querySelectorAll('.reveal');
  document.querySelectorAll('.hero .reveal, .page-hero .reveal').forEach(el => {
    el.classList.add('visible');
  });
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const siblings = [...(entry.target.parentElement?.querySelectorAll('.reveal:not(.visible)') || [])];
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('visible'), Math.max(0, idx) * 80);
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(el => revealObs.observe(el));

  /* ── Proficiency Bars (tools page) ── */
  const toolCards = document.querySelectorAll('.tool-card');
  if (toolCards.length) {
    const barObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          barObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    toolCards.forEach(c => barObs.observe(c));
  }

  /* ── Contact Form ── */
  const form = document.getElementById('contactForm');
  const emailDialog = document.getElementById('emailDialog');
  if (form && emailDialog) {
    const fields = {
      name: {
        input: form.elements.name,
        error: document.getElementById('nameError'),
        message: 'Enter your name (at least 2 characters).',
        valid: value => value.length >= 2,
      },
      email: {
        input: form.elements.email,
        error: document.getElementById('emailError'),
        message: 'Enter a complete email address, such as name@example.com.',
        valid: value => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value),
      },
      subject: {
        input: form.elements.subject,
        error: document.getElementById('subjectError'),
        message: 'Add a subject (at least 3 characters).',
        valid: value => value.length >= 3,
      },
      message: {
        input: form.elements.message,
        error: document.getElementById('messageError'),
        message: 'Add a little more detail (at least 10 characters).',
        valid: value => value.length >= 10,
      },
    };

    const validateField = (field) => {
      const value = field.input.value.trim();
      const valid = field.valid(value);
      field.input.setAttribute('aria-invalid', String(!valid));
      field.input.classList.toggle('input-error', !valid);
      field.error.textContent = valid ? '' : field.message;
      return valid;
    };

    Object.values(fields).forEach(field => {
      field.input.addEventListener('blur', () => validateField(field));
      field.input.addEventListener('input', () => {
        if (field.input.getAttribute('aria-invalid') === 'true') validateField(field);
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const fieldList = Object.values(fields);
      const validationResults = fieldList.map(field => validateField(field));
      const invalidField = fieldList[validationResults.indexOf(false)];
      if (invalidField) {
        document.getElementById('formStatus').textContent = 'Please correct the highlighted fields.';
        invalidField.input.focus();
        return;
      }

      const data = new FormData(form);
      const senderName = String(data.get('name') || '').trim();
      const senderEmail = String(data.get('email') || '').trim();
      const subject = String(data.get('subject') || '').trim();
      const message = String(data.get('message') || '').trim();
      const emailBody = [
        `Name: ${senderName}`,
        `Reply-to: ${senderEmail}`,
        '',
        message,
      ].join('\n');
      const mailto = `mailto:gerardo.padilla.work@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
      const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=gerardo.padilla.work@gmail.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
      const outlook = `https://outlook.office.com/mail/deeplink/compose?to=gerardo.padilla.work@gmail.com&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;

      document.getElementById('emailAppLink').href = mailto;
      document.getElementById('gmailLink').href = gmail;
      document.getElementById('outlookLink').href = outlook;
      document.getElementById('formStatus').textContent = 'Message validated. Choose an email option to finish sending.';
      if (typeof emailDialog.showModal === 'function') emailDialog.showModal();
      else emailDialog.setAttribute('open', '');
    });

    const closeEmailDialog = () => {
      if (typeof emailDialog.close === 'function') emailDialog.close();
      else emailDialog.removeAttribute('open');
    };
    document.getElementById('closeEmailDialog').addEventListener('click', closeEmailDialog);
    emailDialog.addEventListener('click', (event) => {
      if (event.target === emailDialog) closeEmailDialog();
    });
  }

  const printResume = document.getElementById('printResume');
  if (printResume) {
    printResume.addEventListener('click', () => window.print());
  }

  /* ── Hero Parallax ── */
  const glow = document.querySelector('.hero-glow');
  if (glow) {
    document.addEventListener('mousemove', e => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      glow.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  /* ── Active Nav ── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

});
