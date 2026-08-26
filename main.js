/* ============================================
   JERRY PADILLA JR. — main.js (shared)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* Enable enhanced motion only after JavaScript is available. */
  document.body.classList.add('reveal-enabled');

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
  const successMsg = document.getElementById('formSuccess');
  if (form && successMsg) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

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

      successMsg.classList.add('show');
      window.location.href = mailto;
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
