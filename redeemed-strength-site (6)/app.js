// year
  document.getElementById('yr').textContent = new Date().getFullYear();

  // nav scroll state
  const hdr = document.getElementById('hdr');
  const onScroll = () => hdr.classList.toggle('scrolled', window.scrollY > 30);
  onScroll(); window.addEventListener('scroll', onScroll, {passive:true});

  // mobile menu
  const burger = document.getElementById('burger');
  const links = document.getElementById('navlinks');
  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open'); burger.classList.remove('open');
    burger.setAttribute('aria-expanded', false);
  }));

  // scroll reveal
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
  }, {threshold:0.12, rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // contact form -> Formspree (AJAX, no page reload)
  const form = document.getElementById('contactForm');
  if (form) {
    const status = document.getElementById('formStatus');
    const btn = document.getElementById('cfSubmit');
    const show = (msg, ok) => {
      status.textContent = msg;
      status.className = 'form-status show ' + (ok ? 'ok' : 'err');
    };
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      // guard against un-configured endpoint
      if (form.action.includes('YOUR_FORM_ID')) {
        show("This form isn't connected yet — add your Formspree form ID to start receiving messages.", false);
        return;
      }
      const original = btn.innerHTML;
      btn.disabled = true; btn.textContent = 'Sending…';
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          form.reset();
          show("Thank you! Your message is on its way — I'll be in touch soon. 🌿", true);
          btn.innerHTML = original;
        } else {
          const data = await res.json().catch(() => ({}));
          const m = data.errors ? data.errors.map(x => x.message).join(', ')
                                : "Something went wrong. Please try again or email me directly.";
          show(m, false);
          btn.disabled = false; btn.innerHTML = original;
        }
      } catch (err) {
        show("Network error — please check your connection and try again.", false);
        btn.disabled = false; btn.innerHTML = original;
      }
    });
  }

// community gallery lightbox (only runs on the Community page)
(function () {
  const grid = document.querySelector('.results-grid');
  if (!grid) return;
  const imgs = Array.from(grid.querySelectorAll('.result img'));
  if (!imgs.length) return;
  let idx = 0;
  const ov = document.createElement('div');
  ov.className = 'lb-overlay';
  ov.innerHTML =
    '<button class="lb-btn lb-close" aria-label="Close">\u2715</button>' +
    '<button class="lb-btn lb-prev" aria-label="Previous">\u2039</button>' +
    '<img class="lb-img" alt="Client transformation">' +
    '<button class="lb-btn lb-next" aria-label="Next">\u203A</button>' +
    '<div class="lb-count"></div>';
  document.body.appendChild(ov);
  const lbImg = ov.querySelector('.lb-img');
  const count = ov.querySelector('.lb-count');
  const show = (i) => { idx = (i + imgs.length) % imgs.length; lbImg.src = imgs[idx].src; count.textContent = (idx + 1) + ' / ' + imgs.length; };
  const open = (i) => { show(i); ov.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const close = () => { ov.classList.remove('open'); document.body.style.overflow = ''; };
  imgs.forEach((im, i) => im.addEventListener('click', () => open(i)));
  ov.querySelector('.lb-next').addEventListener('click', (e) => { e.stopPropagation(); show(idx + 1); });
  ov.querySelector('.lb-prev').addEventListener('click', (e) => { e.stopPropagation(); show(idx - 1); });
  ov.querySelector('.lb-close').addEventListener('click', close);
  ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
  document.addEventListener('keydown', (e) => {
    if (!ov.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowRight') show(idx + 1);
    else if (e.key === 'ArrowLeft') show(idx - 1);
  });
  // basic swipe on touch
  let sx = null;
  ov.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  ov.addEventListener('touchend', (e) => {
    if (sx === null) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    sx = null;
  }, { passive: true });
})();
