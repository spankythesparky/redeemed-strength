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
