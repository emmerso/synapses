/* ============================================
   Nexbridge Pay — shared behaviour
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  if (window.location.pathname.endsWith('/training.html')) {
    document.body.classList.add('training-page');
  }

  /* ---------- mobile nav ---------- */
  const toggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    const syncMenuState = () => {
      const isOpen = navLinks.classList.contains('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
      toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
      toggle.classList.toggle('open', isOpen);
    };

    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      syncMenuState();
    });

    syncMenuState();
  }

  /* Products dropdown: hover on desktop, tap on mobile */
  document.querySelectorAll('.has-dropdown').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      if (window.innerWidth <= 920) {
        e.preventDefault();
        trigger.parentElement.classList.toggle('open');
      }
    });
  });

  /* close mobile menu when a plain link is tapped */
  document.querySelectorAll('.nav-links a:not(.has-dropdown)').forEach(a => {
    a.addEventListener('click', () => {
      navLinks?.classList.remove('open');
      toggle?.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
      toggle?.setAttribute('aria-label', 'Open menu');
    });
  });

  /* ---------- reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in-view'));
  }

  /* ---------- hero slider ---------- */
  const heroSlider = document.querySelector('.hero-slider');
  if (heroSlider) {
    const slides = [...heroSlider.querySelectorAll('.slide')];
    const dotsWrap = heroSlider.querySelector('.slide-dots');
    let current = 0;
    let timer;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      if (i === 0) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = [...dotsWrap.children];

    function goTo(index) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (index + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
      resetTimer();
    }
    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }
    function resetTimer() {
      clearInterval(timer);
      timer = setInterval(next, 5500);
    }

    heroSlider.querySelector('.hero-next')?.addEventListener('click', next);
    heroSlider.querySelector('.hero-prev')?.addEventListener('click', prev);
    resetTimer();
  }

  /* ---------- generic carousel (testimonials / team) ---------- */
  document.querySelectorAll('.carousel').forEach(carousel => {
    const track = carousel.querySelector('.carousel-track');
    const items = [...track.children];
    const dotsWrap = carousel.querySelector('.carousel-dots');
    const perView = () => track.classList.contains('per3') && window.innerWidth >= 760 ? 3 : 1;
    let index = 0;

    function pages() { return Math.max(1, items.length - perView() + 1); }

    function render() {
      dotsWrap.innerHTML = '';
      for (let i = 0; i < pages(); i++) {
        const dot = document.createElement('button');
        if (i === index) dot.classList.add('active');
        dot.addEventListener('click', () => go(i));
        dotsWrap.appendChild(dot);
      }
      update();
    }
    function update() {
      const itemWidth = items[0].getBoundingClientRect().width;
      track.style.transform = `translateX(-${index * itemWidth}px)`;
      [...dotsWrap.children].forEach((d, i) => d.classList.toggle('active', i === index));
    }
    function go(i) {
      index = Math.max(0, Math.min(i, pages() - 1));
      update();
    }
    carousel.querySelector('.carousel-prev')?.addEventListener('click', () => go(index - 1 < 0 ? pages() - 1 : index - 1));
    carousel.querySelector('.carousel-next')?.addEventListener('click', () => go(index + 1 >= pages() ? 0 : index + 1));

    window.addEventListener('resize', render);
    render();

    /* autoplay */
    setInterval(() => {
      go(index + 1 >= pages() ? 0 : index + 1);
    }, 6000);
  });

  /* ---------- forms (static demo — no backend) ---------- */
  document.querySelectorAll('form[data-demo-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const note = form.querySelector('.form-note');
      const whatsappNumber = form.dataset.whatsappNumber;
      const emailAddress = form.dataset.emailAddress;
      if (whatsappNumber) {
        const name = form.querySelector('[id$="name"]')?.value || '';
        const email = form.querySelector('[id$="email"]')?.value || '';
        const subject = form.querySelector('[id$="subject"]')?.value || '';
        const message = form.querySelector('[id$="message"]')?.value || '';
        const whatsappMessage = `Hello SDA Consultancy, my name is ${name}. Email: ${email}. Enquiry: ${subject}. ${message}`;
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank', 'noopener');
      }
      if (note) {
        note.textContent = form.dataset.successMessage || 'Thanks — we\'ll be in touch shortly.';
        note.classList.add('show');
      }
      form.reset();
    });

    form.querySelector('.email-btn')?.addEventListener('click', () => {
      const emailAddress = form.dataset.emailAddress;
      if (!emailAddress) return;
      const name = form.querySelector('[id$="name"]')?.value || '';
      const subject = form.querySelector('[id$="subject"]')?.value || 'SDA Consultancy enquiry';
      const message = form.querySelector('[id$="message"]')?.value || '';
      const body = `Name: ${name}\n\n${message}`;
      window.location.href = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  });

  /* ---------- back to top ---------- */
  const topBtn = document.querySelector('.top-btn');
  if (topBtn) {
    window.addEventListener('scroll', () => {
      topBtn.classList.toggle('show', window.scrollY > 500);
    });
    topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- header shadow on scroll ---------- */
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 10 ? '0 8px 20px -16px rgba(21,36,71,.4)' : 'none';
    });
  }
});
(function () {
  const viewport = document.querySelector('.prod-track-viewport');
  const track = document.getElementById('prodTrack');
  const prevBtn = document.querySelector('.carousel-arrow.prev');
  const nextBtn = document.querySelector('.carousel-arrow.next');
  if (!track || !viewport) return;

  // clone first/last card so the loop feels continuous
  const realSlides = Array.from(track.children);
  const firstClone = realSlides[0].cloneNode(true);
  const lastClone = realSlides[realSlides.length - 1].cloneNode(true);
  track.appendChild(firstClone);
  track.insertBefore(lastClone, track.firstChild);

  const slides = Array.from(track.children);
  let index = 1; // start on the first real card
  let isJumping = false;

  function setActive() {
    slides.forEach((el, i) => el.classList.toggle('is-active', i === index));
  }

  function moveTo(newIndex, animate = true) {
    track.style.transition = animate ? 'transform 0.6s ease' : 'none';
    const active = slides[newIndex];
    const offset = viewport.offsetWidth / 2 - (active.offsetLeft + active.offsetWidth / 2);
    track.style.transform = `translateX(${offset}px)`;
    index = newIndex;
    setActive();
  }

  function next() { if (!isJumping) moveTo(index + 1); }
  function prev() { if (!isJumping) moveTo(index - 1); }

  track.addEventListener('transitionend', () => {
    if (index === slides.length - 1) {
      isJumping = true;
      moveTo(1, false);
      requestAnimationFrame(() => { isJumping = false; });
    } else if (index === 0) {
      isJumping = true;
      moveTo(slides.length - 2, false);
      requestAnimationFrame(() => { isJumping = false; });
    }
  });

  let timer = setInterval(next, 4000);
  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(next, 4000);
  }

  nextBtn.addEventListener('click', () => { next(); resetTimer(); });
  prevBtn.addEventListener('click', () => { prev(); resetTimer(); });

  slides.forEach((slide, i) => {
    slide.addEventListener('click', (e) => {
      if (i !== index) {
        e.preventDefault();
        moveTo(i);
        resetTimer();
      }
    });
  });

  window.addEventListener('resize', () => moveTo(index, false));
  window.addEventListener('load', () => moveTo(index, false));
  moveTo(index, false);
})();