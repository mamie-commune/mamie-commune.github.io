// Lecteur PDF des livres (pdf.js) : pages en défilement continu, rendues à la demande.
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const id = new URLSearchParams(location.search).get("livre") || "";
  const book = (window.LIVRES || []).find((b) => b.slug === id);
  const pagesEl = $("rPages"), msg = $("rMsg");

  if (!book) {
    $("rTitle").textContent = "Livre introuvable";
    msg.innerHTML = 'Ce livre n\'existe pas. <a href="bibliotheque/#livres">Voir tous les livres</a>.';
    return;
  }
  const url = `livres/pdf/${book.slug}.pdf`;
  document.title = `${book.t} · Lecteur · Mamie Commune`;
  $("rTitle").innerHTML = `<b>${book.t}</b> <span>${book.by}</span>`;
  $("rDl").href = url;
  $("rBack").href = `livres/${book.slug}`;
  $("rBack").textContent = "← Version web";

  if (!window.pdfjsLib) { msg.textContent = "Le lecteur n'a pas pu se charger. Télécharge le PDF avec le bouton en haut."; return; }
  pdfjsLib.GlobalWorkerOptions.workerSrc = "assets/vendor/pdf.worker.min.js";

  const KEY = "Mamie Commune.lecteur." + book.slug;
  let pdf, scale = 1, fit = true, slots = [], current = 1;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function fitScale(page) {
    const w = pagesEl.clientWidth - 32;
    return Math.max(0.4, Math.min(2.2, w / page.getViewport({ scale: 1 }).width));
  }

  async function layout() {
    const first = await pdf.getPage(1);
    if (fit) scale = fitScale(first);
    $("rZoom").textContent = Math.round(scale * 100) + " %";
    const vp = first.getViewport({ scale });
    slots.forEach((s) => {
      s.el.style.width = vp.width + "px"; s.el.style.height = vp.height + "px";
      s.rendered = 0; s.el.innerHTML = `<span class="reader__num">${s.n}</span>`;
    });
    observe();
  }

  let io;
  function observe() {
    io?.disconnect();
    io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) render(slots[Number(e.target.dataset.n) - 1]); });
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (vis) setCurrent(Number(vis.target.dataset.n));
    }, { root: pagesEl, rootMargin: "600px 0px", threshold: [0, 0.5] });
    slots.forEach((s) => io.observe(s.el));
  }

  async function render(s) {
    if (!s || s.rendered === scale) return;
    s.rendered = scale;
    const page = await pdf.getPage(s.n);
    const vp = page.getViewport({ scale: scale * dpr });
    const c = document.createElement("canvas");
    c.width = vp.width; c.height = vp.height;
    c.style.width = "100%"; c.style.height = "100%";
    await page.render({ canvasContext: c.getContext("2d"), viewport: vp }).promise;
    if (s.rendered !== scale) return;
    s.el.querySelector("canvas")?.remove();
    s.el.prepend(c);
  }

  function setCurrent(n) {
    current = n; $("rPage").value = n;
    try { localStorage.setItem(KEY, String(n)); } catch {}
  }
  function go(n) {
    n = Math.max(1, Math.min(pdf.numPages, n));
    slots[n - 1].el.scrollIntoView({ block: "start" });
    setCurrent(n);
  }

  pdfjsLib.getDocument(url).promise.then(async (doc) => {
    pdf = doc;
    msg.remove();
    $("rCount").textContent = "/ " + pdf.numPages;
    $("rPage").max = pdf.numPages;
    for (let n = 1; n <= pdf.numPages; n++) {
      const el = document.createElement("div");
      el.className = "reader__sheet"; el.dataset.n = n;
      pagesEl.appendChild(el); slots.push({ n, el, rendered: 0 });
    }
    await layout();
    let saved = 1; try { saved = Number(localStorage.getItem(KEY)) || 1; } catch {}
    if (saved > 1) go(saved);
  }).catch(() => {
    msg.innerHTML = `Le PDF n'a pas pu s'ouvrir. <a href="${url}" download>Télécharge-le</a> ou lis la <a href="livres/${book.slug}">version web</a>.`;
  });

  $("rPrev").onclick = () => pdf && go(current - 1);
  $("rNext").onclick = () => pdf && go(current + 1);
  $("rPage").onchange = (e) => pdf && go(Number(e.target.value) || 1);
  $("rIn").onclick = () => { if (!pdf) return; fit = false; scale = Math.min(3, scale + 0.15); layout(); };
  $("rOut").onclick = () => { if (!pdf) return; fit = false; scale = Math.max(0.4, scale - 0.15); layout(); };
  $("rFit").onclick = () => { if (!pdf) return; fit = true; layout().then(() => go(current)); };
  let rt; window.addEventListener("resize", () => { if (!fit || !pdf) return; clearTimeout(rt); rt = setTimeout(() => layout().then(() => go(current)), 200); });
  document.addEventListener("keydown", (e) => {
    if (!pdf || e.target.tagName === "INPUT") return;
    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); go(current + 1); }
    if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(current - 1); }
  });
})();
