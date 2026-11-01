// Lettres de rançon : chaque lettre des titres .ransom sur son propre bout de papier, toujours dans le même ordre (pas de hasard).
document.querySelectorAll(".ransom").forEach(function (el) {
  var n = 0, mots = el.textContent.trim().split(/\s+/);
  el.textContent = "";
  mots.forEach(function (mot) {
    var w = document.createElement("span"); w.className = "w";
    Array.from(mot).forEach(function (c) {
      var s = document.createElement("span");
      s.className = "l l" + ((n * 5 + 1) % 6);
      s.style.transform = "rotate(" + (((n * 7) % 5) - 2) * 1.6 + "deg)";
      s.textContent = c; w.appendChild(s); n++;
    });
    el.appendChild(w);
  });
});
