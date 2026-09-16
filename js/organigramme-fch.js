// Organigramme lisible par domaine, portraits des exports du club et fiches par personne.
import { PERSONNES, GROUPES } from './organigramme-fch-data.js';
import { echapper } from './format.js';

const ADRESSE = '#hermitage/commissions';
const domaines = [['bureau', 'Bureau et référents'], ['commissions', 'Commissions'], ['sportif', 'Équipes sportives']];
const groupesDe = (id) => GROUPES.filter((g) => g.membres.includes(id));
const responsable = (g, id) => g.responsables.includes(id);
function fonctionDans(g, id) {
  if (g.id === 'presidence') return 'Coprésident';
  if (g.id === 'secretariat') return id === 'benoit' ? 'Secrétaire' : 'Vice-secrétaire';
  if (g.id === 'tresorerie') return 'Trésorier';
  if (g.id === 'sportif') return 'Responsable sportif';
  if (['ecole', 'preformation', 'formation'].includes(g.id)) return g.aide;
  if (g.id === 'gardiens') return 'Entraîneur des gardiens';
  return `${responsable(g, id) ? 'Responsable' : g.type === 'sportif' ? 'Encadrement' : 'Membre'} · ${g.nom}`;
}
function portrait(p) {
  if (!p.photo) return `<span class="orga-photo orga-initiales" aria-hidden="true">${echapper(p.nom[0])}</span>`;
  const { src, cadre, largeur, hauteur } = p.photo;
  // Fenêtre SVG sur le portrait original : aucun visage retouché ni recomposé.
  return `<svg class="orga-photo" viewBox="${cadre.join(' ')}" aria-hidden="true" focusable="false">
    <image href="${src}" width="${largeur}" height="${hauteur}" /></svg>`;
}
function carte(id, role) {
  const p = PERSONNES[id];
  const morceaux = p.nom.split(' ');
  return `<a class="orga-personne" href="${ADRESSE}/${id}">
    ${portrait(p)}<span class="orga-nom">${echapper(morceaux.shift())} <strong>${echapper(morceaux.join(' '))}</strong></span>
    <span class="orga-role">${echapper(role)}</span></a>`;
}
function groupe(g) {
  return `<section class="orga-groupe" style="--orga-couleur:${g.couleur}">
    <h2>${echapper(g.nom)}</h2>${g.aide ? `<p class="orga-service">${echapper(g.aide)}</p>` : ''}
    <div class="orga-personnes">${g.membres.map((id) => carte(id, fonctionDans(g,id))).join('')}</div>
  </section>`;
}
function bureau() {
  const pres = GROUPES.find((g) => g.id === 'presidence');
  const admin = ['remy','benoit','sandy'];
  const refs = ['djamel','sandrine','lorenzo','hicham','loic','noe','christophe'];
  return groupe(pres) + `<section class="orga-groupe" style="--orga-couleur:#b83f4b"><h2>Administration</h2>
    <div class="orga-personnes">${admin.map((id) => carte(id, id === 'remy' ? 'Trésorier' : id === 'benoit' ? 'Secrétaire' : 'Vice-secrétaire')).join('')}</div></section>
    <section class="orga-groupe orga-large" style="--orga-couleur:#d8a333"><h2>Responsables des commissions</h2>
    <div class="orga-personnes">${refs.map((id) => carte(id, groupesDe(id).filter((g) => g.type !== 'sportif' && responsable(g,id)).map((g) => fonctionDans(g,id)).join(' · '))).join('')}</div></section>`;
}
function fiche(id) {
  const p = PERSONNES[id];
  const groupes = groupesDe(id);
  const missions = Object.entries(p.missions);
  const sportifs = groupes.filter((g) => g.type === 'sportif');
  const domaine = groupes.some((g) => g.type === 'bureau') ? 'bureau' : missions.length ? 'commissions' : 'sportif';
  return `<article class="orga-fiche">
    <a class="lien-discret" href="${ADRESSE}/${domaine}">← Qui fait quoi</a>
    <header class="orga-identite">${portrait(p)}<div><p class="etiquette">Au FC Hermitage</p>
      <h2>${echapper(p.nom)}</h2><p>${groupes.map((g) => echapper(fonctionDans(g,id))).join('<br>')}</p></div></header>
    ${missions.length ? `<h3 class="titre-section">Ses missions au club</h3><div class="orga-missions">${missions.map(([cle,items]) => {
      const g = GROUPES.find((g) => g.id === cle);
      return `<section class="fch-tuile"><h4><span style="--orga-couleur:${g.couleur}">${echapper(g.nom)}</span></h4>
        <ul>${items.map((item) => `<li>${echapper(item)}</li>`).join('')}</ul></section>`;
    }).join('')}</div>` : ''}
    ${sportifs.length ? `<h3 class="titre-section">Ses rôles sportifs</h3><div class="orga-missions">${sportifs.map((g) => `<section class="fch-tuile">
      <h4><span style="--orga-couleur:${g.couleur}">${echapper(g.nom)}</span></h4>
      <p>${echapper(fonctionDans(g,id))}</p>
      ${g.aide && g.aide !== fonctionDans(g,id) ? `<p class="discret">${echapper(g.aide)}</p>` : ''}
      <p class="discret">${g.membres.length > 1 ? 'Avec ' + g.membres.filter((autre) => autre !== id).map((autre) => `<a href="${ADRESSE}/${autre}">${echapper(PERSONNES[autre].nom)}</a>`).join(', ') + '.' : 'Référent de ce pôle dans l’organigramme sportif.'}</p>
      <a class="lien-discret" href="#hermitage/entrainements">Voir les entraînements →</a>
    </section>`).join('')}</div>` : ''}
    ${!missions.length ? `<p class="discret orga-note">${sportifs.length ? 'Les fonctions ci-dessus figurent dans l’organigramme sportif 2026–2027.' : 'Membre de ' + groupes.map(g=>echapper(g.nom)).join(', ') + ' dans l’organigramme 2026–2027.'} Le document des responsabilités ne détaille pas de missions individuelles pour cette personne.</p>` : ''}
    <details class="orga-sources"><summary>Documents de référence</summary>
      ${missions.length ? '<p>Responsabilités FCH · répartition individuelle, pages 1 à 3.</p>' : ''}
      <p>Organigrammes du bureau, des commissions et du sportif · saison 2026–2027.</p>
    </details>
  </article>`;
}
export function construireOrganigramme(selection) {
  if (PERSONNES[selection]) return fiche(selection);
  const domaine = domaines.some(([id]) => id === selection) ? selection : 'bureau';
  return `<div class="organigramme-fch">
    <p class="orga-intro">Un besoin, un visage, la bonne personne. Choisis un nom pour voir tous ses rôles.</p>
    <label class="orga-recherche">Chercher une personne ou une mission
      <input type="search" data-recherche-organigramme placeholder="Nom, licences, matériel, U13…" autocomplete="off" aria-controls="orga-resultats">
    </label>
    <nav class="orga-domaines" aria-label="Parcourir l’organigramme">${domaines.map(([id,nom]) => `<a href="${ADRESSE}/${id}" ${domaine===id?'aria-current="page"':''}>${nom}</a>`).join('')}</nav>
    <p class="orga-compteur" role="status" aria-live="polite" data-compteur-organigramme></p>
    <div id="orga-resultats" class="orga-personnes" hidden></div>
    <div class="orga-grille" data-organigramme-groupes>${domaine === 'bureau' ? bureau() : GROUPES.filter((g) => domaine === 'commissions' ? ['commissions','bureau'].includes(g.type) && !['presidence','secretariat','tresorerie'].includes(g.id) : g.type === domaine).map(groupe).join('')}</div>
    <p class="discret orga-note">Saison 2026–2027 · Les responsables sont nommés sous leur portrait. Une personne peut contribuer à plusieurs équipes.</p>
  </div>`;
}
const normaliser = (mot) => mot.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function rechercherOrganigramme(section, valeur) {
  const mots = normaliser(valeur).trim().split(/\s+/).filter(Boolean);
  const resultat = section.querySelector('#orga-resultats');
  if (!resultat) return;
  section.querySelector('[data-organigramme-groupes]').hidden = mots.length > 0;
  resultat.hidden = !mots.length;
  const compteur = section.querySelector('[data-compteur-organigramme]');
  if (!mots.length) { resultat.innerHTML = ''; compteur.textContent = ''; return; }
  const trouvees = Object.values(PERSONNES).filter((p) => {
    const texte = normaliser([p.nom,...groupesDe(p.id).map(g=>`${g.nom} ${g.aide} ${fonctionDans(g,p.id)}`),...Object.values(p.missions).flat()].join(' '));
    return mots.every((mot) => texte.includes(mot));
  });
  resultat.innerHTML = trouvees.map((p) => carte(p.id, groupesDe(p.id).map(g=>g.nom).join(' · '))).join('');
  compteur.textContent = trouvees.length ? `${trouvees.length} personne${trouvees.length>1?'s':''}` : 'Aucune personne trouvée. Essaie un nom, une catégorie ou une mission.';
}
