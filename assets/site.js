const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } })
  }, { threshold: 0.15 })
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el))

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

  // court lines draw as the camp section scrolls through the viewport
  const camp = document.getElementById('camp'), court = camp && camp.querySelector('.court')
  function drawCourt(){
    const r = camp.getBoundingClientRect(), vh = innerHeight
    const t = Math.min(1, Math.max(0, (vh - r.top) / (vh * .9 + r.height * .35)))
    court.style.setProperty('--draw', (1 - t).toFixed(3))
  }
  if (court && !reduce) { addEventListener('scroll', drawCourt, { passive: true }); drawCourt() }

  if (document.getElementById('shot')) {
  // the shot: a JS-driven arc along the dotted path, then through the net
  const shot = document.getElementById('shot'), ball = document.getElementById('shotball'), net = document.getElementById('net')
  const arc = shot.querySelector('.arc'), arcLen = arc.getTotalLength()
  let flying = false
  function place(x, y, rot){ ball.setAttribute('transform', `translate(${x} ${y}) rotate(${rot})`) }
  function shoot(){
    if (reduce || flying) return
    flying = true
    const t0 = performance.now(), dur = 1100, drop = 280
    function frame(now){
      const t = (now - t0) / dur
      if (t < 1) {
        const e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
        const pt = arc.getPointAtLength(e * arcLen)
        place(pt.x, pt.y, e * 540)
        requestAnimationFrame(frame)
      } else if (t < 1 + drop / dur) {
        if (!net.classList.contains('swish')) net.classList.add('swish')
        const d = (t - 1) * dur / drop
        place(520, 112 + d * 70, 540 + d * 90)
        requestAnimationFrame(frame)
      } else {
        setTimeout(() => { net.classList.remove('swish'); place(60, 230, 0); flying = false }, 700)
      }
    }
    requestAnimationFrame(frame)
  }
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { setTimeout(shoot, 300); o.disconnect() } }, { threshold: .6 }).observe(shot)
  shot.addEventListener('click', shoot)

  }
  if (document.getElementById('lb')) {
  // photo viewer
  let figs = () => [...document.querySelectorAll('.masonry figure:not([hidden])')], lb = document.getElementById('lb')
  const lbImg = lb.querySelector('img'), lbCap = lb.querySelector('p')
  let cur = 0, lastFocus = null
  function show(i){ const F = figs(); cur = (i + F.length) % F.length; const f = F[cur]; lbImg.src = f.dataset.full; lbImg.alt = f.querySelector('img').alt; lbCap.textContent = f.querySelector('figcaption').textContent }
  function open(i){ lastFocus = document.activeElement; show(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; lb.querySelector('.x').focus() }
  function close(){ lb.classList.remove('open'); document.body.style.overflow = ''; lastFocus && lastFocus.focus() }
  document.querySelectorAll('.masonry figure').forEach((f) => { const go = () => open(figs().indexOf(f)); f.addEventListener('click', go); f.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go() } }) })
  lb.querySelector('.x').onclick = close
  lb.querySelector('.prev').onclick = (e) => { e.stopPropagation(); show(cur - 1) }
  lb.querySelector('.next').onclick = (e) => { e.stopPropagation(); show(cur + 1) }
  lb.addEventListener('click', (e) => { if (e.target === lb) close() })
  addEventListener('keydown', (e) => { if (!lb.classList.contains('open')) return; if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1) })
  let tx = 0; lb.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX }, { passive: true })
  lb.addEventListener('touchend', (e) => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) show(cur + (d < 0 ? 1 : -1)) })

  }

  // gallery filters
  const fbar = document.querySelector('.filters')
  if (fbar) fbar.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return
    fbar.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b))
    const c = b.dataset.cat
    document.querySelectorAll('.masonry figure').forEach((f) => { f.hidden = c !== 'all' && f.dataset.cat !== c })
  })
