/* ============================================================
   MAKE TOMORROW — Horizon interactions (vanilla JS, no deps)
   ============================================================ */
(() => {
  'use strict';

  const header        = document.getElementById('header');
  const menuToggle     = document.getElementById('menuToggle');
  const nav            = document.getElementById('nav');
  const horizonFill    = document.getElementById('horizonFill');
  const sunDisc        = document.getElementById('sunDisc');
  const donationModal  = document.getElementById('donationModal');
  const modalClose     = document.getElementById('modalClose');
  const donateTrigger  = document.getElementById('donateTrigger');
  const donateCard     = document.getElementById('donateCard');
  const footerDonate   = document.getElementById('footerDonate');

  /* ---------- Mobile menu ---------- */
  function closeMenu(){
    nav.classList.remove('active');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
  function toggleMenu(){
    const isActive = nav.classList.toggle('active');
    menuToggle.classList.toggle('active', isActive);
    menuToggle.setAttribute('aria-expanded', String(isActive));
  }
  menuToggle.addEventListener('click', toggleMenu);

  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 980 && nav.classList.contains('active') &&
        !nav.contains(e.target) && !menuToggle.contains(e.target)) {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) closeMenu();
  });

  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

  /* ---------- Smooth scroll for in-page anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = window.innerWidth <= 980 ? 70 : 90;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    });
  });

  /* ---------- Donation modal ---------- */
  function openModal(){
    donationModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    closeMenu();
  }
  function closeModalFn(){
    donationModal.classList.remove('active');
    document.body.style.overflow = '';
  }
  [donateTrigger, donateCard, footerDonate].forEach(el => {
    if (el) el.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
  });
  modalClose.addEventListener('click', closeModalFn);
  donationModal.addEventListener('click', (e) => { if (e.target === donationModal) closeModalFn(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModalFn(); });

  /* ---------- Copy to clipboard ---------- */
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.getAttribute('data-copy') || '';
      const finish = () => {
        const original = btn.textContent;
        btn.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(finish).catch(() => fallbackCopy(text, finish));
      } else {
        fallbackCopy(text, finish);
      }
    });
  });

  function fallbackCopy(text, done){
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (err) { /* no-op */ }
    document.body.removeChild(ta);
    done();
  }

  /* ---------- Header state + horizon scroll progress + sun rise ---------- */
  function onScroll(){
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
    horizonFill.style.width = pct + '%';

    header.classList.toggle('scrolled', scrollTop > 80);

    if (sunDisc) {
      const heroHeight = document.querySelector('.hero').offsetHeight;
      const heroProgress = Math.min(1, scrollTop / (heroHeight * 0.9));
      const rise = heroProgress * 45; // rises up to 45px within the hero
      sunDisc.setAttribute('cy', 230 - rise);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  const revealTargets = document.querySelectorAll(
    '.row, .pillar-card, .mini-card, .mode-card, .stat, .section-head'
  );
  revealTargets.forEach(el => el.setAttribute('data-reveal', ''));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealTargets.forEach(el => revealObserver.observe(el));

  /* ---------- Animated stat counters ---------- */
  const statNums = document.querySelectorAll('.stat-num');

  function animateCount(el){
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const duration = 1400;
    const start = performance.now();

    function tick(now){
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString('en-IN');
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  statNums.forEach(el => statObserver.observe(el));

})();
