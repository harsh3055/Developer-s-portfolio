(function () {

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  const root = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle');
  if (localStorage.getItem('theme') === 'dark') root.classList.remove('light');
  toggleBtn.addEventListener('click', () => {
    root.classList.toggle('light');
    localStorage.setItem('theme', root.classList.contains('light') ? 'light' : 'dark');
  });

  /* mobile nav drawer */
  const drawer = document.getElementById('nav-drawer');
  const overlay = document.getElementById('nav-overlay');
  const menuBtn = document.getElementById('nav-menu-btn');
  const closeBtn = document.getElementById('nav-drawer-close');

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  window.closeDrawer = function () {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  if (menuBtn) menuBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', window.closeDrawer);

  const pinList = [...document.querySelectorAll('.pin')];
  const cardList = [...document.querySelectorAll('.sk-row')];
  const pinIdx = new Map(pinList.map((p, i) => [p, i]));
  const cardIdx = new Map(cardList.map((c, i) => [c, i]));

  let pageJustLoaded = true;
  setTimeout(() => {
    pageJustLoaded = false;
  }, 100);

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const instant = pageJustLoaded;
      if (e.target.classList.contains('pin')) {
        const delay = instant ? 0 : (pinIdx.get(e.target) % 3) * 80;
        setTimeout(() => e.target.classList.add('vis'), delay);
      } else if (e.target.classList.contains('sk-row')) {
        const delay = instant ? 0 : cardIdx.get(e.target) * 60;
        setTimeout(() => e.target.classList.add('vis'), delay);
      } else {
        e.target.classList.add('vis');
      }
      io.unobserve(e.target);
    });
  }, {
    threshold: 0.1
  });
  document.querySelectorAll('.appear, .appear-left').forEach(el => io.observe(el));

  function countUp(el, target, dur) {
    const start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(ease * target).toLocaleString();
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }
  const heroLc = document.getElementById('hero-lc');
  if (heroLc) countUp(heroLc, 650, 1600);

  const lcEl = document.getElementById('lc-count');
  if (lcEl) {
    const lcIO = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      countUp(lcEl, 650, 1800);
      document.querySelectorAll('.d-fill').forEach(b => {
        b.style.width = b.dataset.w + '%';
      });
      lcIO.disconnect();
    }, {
      threshold: 0.3
    });
    lcIO.observe(lcEl);
  }

  const navAs = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');
  const secIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      navAs.forEach(a => {
        const active = a.getAttribute('href') === `#${id}`;
        a.style.color = active ? 'var(--ink)' : '';
        a.style.background = active ? 'var(--sand)' : '';
      });
    });
  }, {
    threshold: 0.4
  });
  sections.forEach(s => secIO.observe(s));

  const masonry = document.querySelector('.masonry');
  if (masonry) {
    masonry.addEventListener('mouseover', e => {
      const pin = e.target.closest('.pin');
      if (!pin) return;
      pinList.forEach(p => {
        p.style.opacity = p !== pin ? '.8' : '';
      });
    });
    masonry.addEventListener('mouseleave', () => {
      pinList.forEach(p => {
        p.style.opacity = '';
      });
    });
  }

  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    nav.style.height = window.scrollY > 60 ? '52px' : '60px';
  }, {
    passive: true
  });

  /* hero image 3D tilt */
  const imgWrap = document.querySelector('.hero-img-wrap');
  if (imgWrap) {
    const MAX = 14;
    imgWrap.addEventListener('mousemove', e => {
      const {
        left,
        top,
        width,
        height
      } = imgWrap.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;
      const rotY = x * MAX;
      const rotX = -y * MAX;
      imgWrap.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.04,1.04,1.04)`;
      imgWrap.style.boxShadow = `${-rotY * 1.2}px ${rotX * 1.2}px 40px rgba(0,0,0,.45), 0 2px 8px rgba(0,0,0,.3)`;
    });
    imgWrap.addEventListener('mouseleave', () => {
      imgWrap.style.transform = '';
      imgWrap.style.boxShadow = '';
    });
  }
})();