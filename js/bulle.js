// La bulle du kit Yuno (19 novembre 2026) : le message posé AU-DESSUS du bouton
// qui l'a déclenché, avec une petite pointe vers lui. Claire et floutée — blanc
// à 82 %, flou de 14 px, arrondi de 14 —, un titre en gras et une phrase. Elle
// se ferme d'un toucher, ou d'elle-même au bout de sept secondes.
//
// POURQUOI AU-DESSUS DU BOUTON, et pas en tête de page comme avant : le message
// parle du geste qu'on vient de faire. Posé sous la barre du haut, il arrivait
// loin du doigt — souvent hors de l'écran sur un téléphone qu'on a fait
// défiler —, et l'on ne savait plus de quoi il parlait.
//
// Reprise de `tip` (kit, reference/outils-communs.js), adaptée en module : elle
// ne touche à aucune donnée et ne connaît aucun écran.

const DUREE_MS = 7000;

let enCours = null;

/**
 * @param {string} titre   — en gras, quelques mots.
 * @param {string} phrase  — une phrase, ce qui s'est passé ou ce qu'il faut faire.
 * @param {Element|DOMRect|null} ancre — le bouton concerné, ou sa boîte mesurée
 *   au moment du geste. Sans ancre (ou une ancre qui n'est plus à l'écran), la
 *   bulle se pose en bas, au milieu.
 */
export function bulle(titre, phrase, ancre = null) {
  enCours?.remove();

  const el = document.createElement('div');
  el.className = 'bulle-kit';
  el.setAttribute('role', 'status');
  el.innerHTML = '<b></b><span></span><i class="bulle-kit-pointe" aria-hidden="true"></i>';
  el.querySelector('b').textContent = titre;
  el.querySelector('span').textContent = phrase;
  document.body.appendChild(el);
  enCours = el;

  const r = ancre instanceof Element ? ancre.getBoundingClientRect() : ancre;
  const visible = r && r.width && r.bottom > 0 && r.top < window.innerHeight;
  if (visible) {
    const largeur = el.offsetWidth;
    const centre = r.left + r.width / 2;
    const gauche = Math.max(12, Math.min(centre - 28, window.innerWidth - largeur - 12));
    el.style.left = gauche + 'px';
    el.style.bottom = (window.innerHeight - r.top + 12) + 'px';
    el.querySelector('.bulle-kit-pointe').style.left = (centre - gauche - 7) + 'px';
  } else {
    el.classList.add('bulle-kit-libre');
  }

  const partir = () => {
    if (el.classList.contains('bulle-kit-sort')) return;
    el.classList.add('bulle-kit-sort');
    setTimeout(() => {
      el.remove();
      if (enCours === el) enCours = null;
    }, 250);
  };
  el.addEventListener('click', partir);
  setTimeout(partir, DUREE_MS);
  return partir;
}

// LE DERNIER BOUTON TOUCHÉ, mesuré au moment du geste. Une écriture qui échoue
// répond une demi-seconde plus tard, et entre-temps l'écran s'est souvent
// redessiné — le bouton d'origine n'existe plus. Sa BOÎTE, elle, dit toujours
// où était le doigt.
let dernier = { boite: null, quand: 0 };

export function suivreLesGestes(racine = document) {
  racine.addEventListener('pointerdown', (e) => {
    const cible = e.target.closest?.('button, a, summary, [role="button"]');
    if (cible) dernier = { boite: cible.getBoundingClientRect(), quand: Date.now() };
  }, true);
}

// La boîte du dernier geste, s'il est assez récent pour que le message en
// parle encore (dix secondes) ; sinon rien, et la bulle se pose en bas.
export function dernierGeste() {
  return Date.now() - dernier.quand < 10000 ? dernier.boite : null;
}

// LE MESSAGE COURT du kit (`toast`) : une ligne en bas de l'écran, pour les
// confirmations très brèves seulement — « Place n°3 mise à jour ». Tout ce qui
// demande d'être lu va dans la bulle.
export function messageCourt(texte, duree = 2600) {
  document.querySelector('.message-court')?.remove();
  const el = document.createElement('div');
  el.className = 'message-court';
  el.setAttribute('role', 'status');
  el.textContent = texte;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), duree);
}
