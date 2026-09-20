// Organigramme lisible par domaine, portraits des exports du club et fiches par personne.
import { PERSONNES, GROUPES } from './organigramme-fch-data.js';
import {
  CADRE_MISSIONS, missionsParTheme, missionsDeLaCommission, missionsDeLaPersonne,
  commissionsDuPole,
} from './missions-fch.js';
import { POLES_FCH } from './projet-fch.js';
import { echapper } from './format.js';

const ADRESSE = '#hermitage/commissions';
// LA PAGE D'UN PÔLE, qui EST celle de sa commission depuis la fusion du
// 20 septembre 2026. Écrite ici plutôt qu'importée de js/projet-club.js : ce
// module-là importe déjà `portrait` d'ici, et un import en retour ferait un
// cycle.
const PAGE_DU_POLE = '#hermitage/projet-club/pole-';
const domaines = [['bureau', 'Bureau et référents'], ['commissions', 'Commissions'], ['sportif', 'Équipes sportives']];
const groupesDe = (id) => GROUPES.filter((g) => g.membres.includes(id));
const responsable = (g, id) => g.responsables.includes(id);
// Les trois référents de pôle encadrent les catégories qui suivent : ils font
// un rang à eux, et une équipe assise à côté d'eux brouillerait la lecture.
const POLES = ['ecole', 'preformation', 'formation'];
// Ils sont donc réunis dans un RANG, et non séparés par un saut de ligne : un
// élément de pleine largeur et de hauteur nulle finit la ligne, mais fabrique
// deux écarts de ligne au lieu d'un, et sa marge négative ne les rattrape pas —
// elle déplace l'élément, pas la ligne. Le rang, lui, donne l'écart juste.
const rang = (dedans) => `<div class="orga-rang">${dedans}</div>`;
function fonctionDans(g, id) {
  if (g.id === 'presidence') return 'Coprésident';
  if (g.id === 'secretariat') return id === 'benoit' ? 'Secrétaire' : 'Vice-secrétaire';
  if (g.id === 'tresorerie') return 'Trésorier';
  if (g.id === 'sportif') return 'Responsable sportif';
  if (POLES.includes(g.id)) return g.aide;
  if (g.id === 'gardiens') return 'Entraîneur des gardiens';
  return `${responsable(g, id) ? 'Responsable' : g.type === 'sportif' ? 'Encadrement' : 'Membre'} · ${g.nom}`;
}
// L'ÉTIQUETTE D'UNE PASTILLE DE RÔLE : le nom du groupe, sans le mot qui dit
// le rang — c'est le dessin de la pastille qui le dit maintenant. Une fonction
// du bureau, elle, porte un NOM (Coprésident, Trésorier) : il reste, parce que
// ce n'est pas un rang mais un titre, et que rien d'autre ne le dirait.
const RANGS = ['Responsable', 'Encadrement', 'Membre'];
function etiquetteDe(g, id) {
  const dit = fonctionDans(g, id);
  const coupe = dit.indexOf(' · ');
  return coupe > 0 && RANGS.includes(dit.slice(0, coupe)) ? dit.slice(coupe + 3) : dit;
}
// L'étoile est le second signe du responsable, et c'est elle qui rend la
// pastille lisible sans légende : un fond plein ne se comprend qu'en le
// comparant à un voisin creux, une étoile se comprend seule. Dessinée et non
// en émoji, donc elle prend la couleur de son texte.
const ETOILE = '<svg class="orga-etoile" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'
  + '<path d="m12 3 2.6 6.1 6.6.6-5 4.3 1.5 6.5L12 17l-5.7 3.5 1.5-6.5-5-4.3 6.6-.6z"/></svg>';
function pastilleDeRole(g, id) {
  const chef = responsable(g, id);
  const dit = `${chef ? 'Responsable' : 'Membre'} · ${g.nom}`;
  return `<li><span class="orga-role-pastille${chef ? ' est-responsable' : ''}"
    style="--orga-couleur:${g.couleur}" title="${echapper(dit)}">${chef ? ETOILE : ''}<span
    class="hors-ecran">${echapper(chef ? 'Responsable · ' : 'Membre · ')}</span>${echapper(etiquetteDe(g, id))}</span></li>`;
}
// CHAQUE AFFICHAGE MONTRE LE PORTRAIT DE SON ORGANIGRAMME (20 septembre 2026,
// demande de Noé : « les photos dans l'affichage des commissions doivent être
// celles-ci, avec fond bleu… le fond rouge est gardé pour l'affichage bureau et
// référents et pour la page de la personne », puis « pareil pour l'affichage
// équipes sportives »).
//
// LA COULEUR DE LA PASTILLE N'EST PAS UN CHOIX DU HUB, c'est celle de
// l'organigramme d'origine — rouge au bureau, bleue aux commissions, or au
// sportif. Le club exporte un dossier par organigramme, une même personne y a
// donc plusieurs portraits, et jusqu'ici le hub n'en gardait qu'un : celui du
// bureau quand il existait. **Les onglets se contredisaient donc entre eux** —
// on passait aux commissions et les visages restaient rouges, sauf les quatre
// personnes qui ne sont QUE dans les commissions.
//
// LE DÉFAUT EST LE PORTRAIT HISTORIQUE, et c'est ce qui rend le passage sûr : une
// personne sans portrait dans l'organigramme regardé garde celui qu'elle avait —
// jamais de trou, jamais d'initiale à la place d'un visage. C'est aussi ce que
// lisent la fiche d'une personne et la pile du hall, qui n'ont pas d'organigramme
// à eux.
//
// EXPORTÉ parce que le hall du club en montre une pile (16 septembre 2026) : un
// portrait se découpe d'une seule façon, et une seconde fenêtre SVG écrite à
// côté finirait par ne plus cadrer les visages pareil.
export function portrait(p, domaine = null) {
  const photo = (domaine && p.photos?.[domaine]) ?? p.photo;
  if (!photo) return `<span class="orga-photo orga-initiales" aria-hidden="true">${echapper(p.nom[0])}</span>`;
  const { src, cadre, largeur, hauteur } = photo;
  // Fenêtre SVG sur le portrait original : aucun visage retouché ni recomposé.
  return `<svg class="orga-photo" viewBox="${cadre.join(' ')}" aria-hidden="true" focusable="false">
    <image href="${src}" width="${largeur}" height="${hauteur}" /></svg>`;
}
function carte(id, role, domaine = null) {
  const p = PERSONNES[id];
  const morceaux = p.nom.split(' ');
  return `<a class="orga-personne" href="${ADRESSE}/${id}">
    ${portrait(p, domaine)}<span class="orga-nom">${echapper(morceaux.shift())} <strong>${echapper(morceaux.join(' '))}</strong></span>
    <span class="orga-role">${echapper(role)}</span></a>`;
}
// La largeur d'une tuile suit ce qu'elle porte : trois pôles à une personne
// tiennent sur une ligne, un groupe de cinq prend la place qu'il lui faut.
// C'est une BASE, pas une largeur — les tuiles d'une ligne s'y partagent le
// reste, donc une ligne se remplit toujours jusqu'au bord.
// La base est CE QU'IL FAUT POUR TENIR L'EFFECTIF SUR UN RANG : un portrait fait
// 110 px, l'écart au voisin 10, la tuile 14 de chaque côté. Une base plus courte
// promettrait un groupe qu'elle ne sait pas montrer — mesuré avant correction,
// U9 et ses trois éducateurs se repliaient en deux rangs plus un.
// Le plancher de 220 px est celui du titre : « Pôle école de foot » ne se coupe
// pas en deux, et trois tuiles à une personne tiennent encore de front sur 800.
// Le plafond de cinq garde le reste : au-delà, la tuile prend la ligne entière
// et ses rangs se justifient d'eux-mêmes.
const baseDuGroupe = (n) => Math.max(220, 120 * Math.min(n, 5) + 18);
// LE RÉCAPITULATIF D'UNE COMMISSION (20 septembre 2026, demande de Noé : « dans
// les pages des commissions tu dois mettre un espace où on voit un récap des
// responsabilités et missions comme dans le document »).
//
// LA FORME EST CELLE DU DOCUMENT : une colonne par THÈME, une carte par
// mission, et sur chaque carte la personne qui en répond. C'est ce qui rend la
// page lisible d'un regard — *qui fait quoi, et ce qui n'est porté par
// personne se voit tout de suite.*
//
// C'EST LA MÊME LISTE QUE LES MISSIONS D'UNE PERSONNE, groupée autrement : une
// phrase corrigée dans js/missions-fch.js bouge des deux côtés à la fois. C'est
// l'exigence de Noé, et c'est aussi la seule façon tenable — cent trente-cinq
// missions recopiées en deux endroits, c'est cent trente-cinq occasions de
// diverger.
//
// IL SE REPLIE, et il s'ouvre fermé : la page des commissions répond d'abord à
// « qui est dans quelle commission », et neuf récapitulatifs dépliés en feraient
// un document à faire défiler. C'est la règle des deux rangs, dans une page.
//
// LE NOM DE LA PERSONNE EST UN LIEN vers sa fiche : une mission qu'on lit
// appelle la question « et quoi d'autre ? », et la réponse est chez elle.
// EXPORTÉ, parce que la page d'un pôle le montre aussi — et c'est même sa place
// principale (20 septembre 2026, correction de Noé : « c'est dans ces pages là
// que je veux que ça apparaisse »). Un pôle et sa commission sont la même chose
// depuis ce jour-là ; le récapitulatif appartient donc à la page qui les porte.
// Deux gabarits écrits côte à côte finiraient par ne plus ranger les colonnes
// pareil.
// CE QU'UN PÔLE MONTRE, et c'est là que « Organisation du club » se distingue :
// il rassemble TROIS commissions — présidence, secrétariat, trésorerie —, quand
// les autres n'en ont qu'une (20 septembre 2026, demande de Noé).
//
// ON GROUPE PAR COMMISSION D'ABORD, PAR THÈME ENSUITE, et l'ordre compte : les
// trois écrivent chacune un thème « Coordonner et déléguer », et les fondre en
// une seule colonne mettrait sous un même titre les délégations du président,
// du secrétaire et du trésorier. Ce ne sont pas les mêmes.
//
// UNE SEULE COMMISSION NE PORTE PAS SON NOM : la page le dit déjà en grand.
export function missionsDuPole(id) {
  const commissions = commissionsDuPole(id).filter((cle) => missionsDeLaCommission(cle).length);
  if (!commissions.length) return '';
  const seule = commissions.length === 1;
  return commissions.map((cle) => `${seule ? '' : `<h3 class="orga-recap-commission">${
    echapper(GROUPES.find((g) => g.id === cle)?.nom ?? cle)}</h3>`}${colonnesDesMissions(cle)}`).join('');
}

export function colonnesDesMissions(id) {
  const missions = missionsDeLaCommission(id);
  if (!missions.length) return '';
  return `<div class="orga-recap-themes">${missionsParTheme(missions).map(({ theme, missions: lignes }) => `
      <section class="orga-recap-theme">
        <h4>${echapper(theme)}</h4>
        <ul>${lignes.map((mission) => `<li>
          <span class="orga-recap-texte">${echapper(mission.texte)}</span>
          <span class="orga-recap-qui">${mission.qui.map((qui) => `<a
            href="${ADRESSE}/${qui}">${echapper(PERSONNES[qui].nom.split(' ')[0])}</a>`).join('')}</span>
        </li>`).join('')}</ul>
      </section>`).join('')}</div>`;
}

function groupe(g, domaine = null) {
  // LE TITRE MÈNE À LA PAGE DE LA COMMISSION (20 septembre 2026, demande de
  // Noé : « lorsque l'on clique sur le titre de la commission depuis cette page
  // ça renvoie à la page détail de la commission »). C'est la suite de la
  // correction précédente : le récapitulatif a quitté cet onglet pour la page du
  // pôle, et le titre est le chemin qui y mène.
  //
  // LA RÈGLE EST CELLE DES DOMAINES, et pas `type === 'commissions'` — c'est la
  // nuance que l'écran a montrée tout de suite : **« Direction sportive » est un
  // groupe de type BUREAU** dans l'organigramme, alors qu'elle a bel et bien sa
  // page de pôle. *Mesuré : son titre restait seul sans lien parmi les six.*
  //
  // Un domaine est un PÔLE DU PROJET ou une commission — c'est la définition de
  // `DOMAINES` (js/projet-club.js), reprise ici sur ses deux sources plutôt
  // qu'importée : ce module-là importe déjà `portrait` d'ici, et un import en
  // retour ferait un cycle. Les trois groupes du bureau restent sans lien — ce
  // sont des fonctions, pas des domaines —, et les groupes sportifs non plus.
  const aSaPage = POLES_FCH.some((pole) => pole.id === g.id) || g.type === 'commissions';
  const titre = aSaPage
    ? `<a href="${PAGE_DU_POLE}${g.id}">${echapper(g.nom)}</a>`
    : echapper(g.nom);
  return `<section class="orga-groupe" style="--orga-couleur:${g.couleur};--orga-base:${baseDuGroupe(g.membres.length)}px">
    <h2>${titre}</h2>${g.aide ? `<p class="orga-service">${echapper(g.aide)}</p>` : ''}
    <div class="orga-personnes">${g.membres.map((id) => carte(id, fonctionDans(g,id), domaine)).join('')}</div>
  </section>`;
}
function bureau() {
  const pres = GROUPES.find((g) => g.id === 'presidence');
  const admin = ['remy','benoit','sandy'];
  const refs = ['djamel','sandrine','lorenzo','hicham','loic','noe','christophe'];
  // LES MISSIONS DU BUREAU ONT LEUR PAGE (20 septembre 2026, demande de Noé :
  // « les tâches de la présidence et de l'administration doivent être dans
  // organisation du club »). Elles ont eu un repli ici, le temps d'une heure,
  // faute de mieux — la présidence, le secrétariat et la trésorerie n'étaient
  // des domaines de rien. Elles en ont un maintenant, et cet onglet redevient ce
  // qu'il est : QUI est où.
  return groupe(pres) + `<section class="orga-groupe" style="--orga-couleur:#b83f4b;--orga-base:${baseDuGroupe(admin.length)}px"><h2>Administration</h2>
    <div class="orga-personnes">${admin.map((id) => carte(id, id === 'remy' ? 'Trésorier' : id === 'benoit' ? 'Secrétaire' : 'Vice-secrétaire')).join('')}</div>
</section>
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
    <a class="lien-discret" href="${ADRESSE}/${domaine}">← Les organigrammes</a>
    <header class="orga-identite">${portrait(p)}<div>
      <h2>${echapper(p.nom)}</h2>
      ${/* CE QU'ELLE PORTE D'ABORD (demande de Noé) : responsable en tête, membre
           ensuite. Le tri est STABLE, donc à rang égal l'ordre de l'organigramme
           tient — on range les rangs sans mélanger ce qu'ils contiennent. */''}
      <ul class="orga-roles">${[...groupes]
        .sort((a, b) => responsable(b, id) - responsable(a, id))
        .map((g) => pastilleDeRole(g, id)).join('')}</ul></div></header>
    ${/* LE THÈME ENTRE DANS LA FICHE (20 septembre 2026) : c'est le titre de
          colonne du document, et il range les missions d'une personne comme il
          range celles d'une commission. Les deux pages lisent la même liste —
          seul le groupement change, et c'est tout l'objet du changement. */''}
    ${missions.length ? `<h3 class="titre-section">Ses missions au club</h3><div class="orga-missions">${missions.map(([cle]) => {
      const g = GROUPES.find((g) => g.id === cle);
      const siennes = missionsDeLaPersonne(id).filter((mission) => mission.commission === cle);
      return `<section class="fch-tuile"><h4><span style="--orga-couleur:${g.couleur}">${echapper(g.nom)}</span></h4>
        ${missionsParTheme(siennes).map(({ theme, missions: lignes }) => `
          <p class="orga-theme">${echapper(theme)}</p>
          <ul>${lignes.map((mission) => `<li>${echapper(mission.texte)}</li>`).join('')}</ul>`).join('')}</section>`;
    }).join('')}</div>` : ''}
    ${sportifs.length ? `<h3 class="titre-section">Ses rôles sportifs</h3><div class="orga-missions">${sportifs.map((g) => `<section class="fch-tuile">
      <h4><span style="--orga-couleur:${g.couleur}">${echapper(g.nom)}</span></h4>
      ${/* Le rang ne se réécrit plus ici : la pastille de la tête le dit, et « Responsable ·
            U15 · Entente FCH–COC » sous un titre qui dit déjà « U15 · Entente FCH–COC »
            écrivait le nom du groupe deux fois dans la même tuile. Ce qui reste est ce
            que le titre ne dit PAS — « Référent U7–U9 », « Entraîneur des gardiens ». */
        etiquetteDe(g,id) !== g.nom ? `<p>${echapper(etiquetteDe(g,id))}</p>` : ''}
      ${g.aide && g.aide !== etiquetteDe(g,id) ? `<p class="discret">${echapper(g.aide)}</p>` : ''}
      <p class="discret">${g.membres.length > 1 ? 'Avec ' + g.membres.filter((autre) => autre !== id).map((autre) => `<a href="${ADRESSE}/${autre}">${echapper(PERSONNES[autre].nom)}</a>`).join(', ') + '.' : 'Référent de ce pôle dans l’organigramme sportif.'}</p>
      <a class="lien-discret" href="#hermitage/entrainements">Voir les entraînements →</a>
    </section>`).join('')}</div>` : ''}
    ${!missions.length ? `<p class="discret orga-note">${sportifs.length ? 'Les fonctions ci-dessus figurent dans l’organigramme sportif 2026–2027.' : 'Membre de ' + groupes.map(g=>echapper(g.nom)).join(', ') + ' dans l’organigramme 2026–2027.'} Le document des responsabilités ne détaille pas de missions individuelles pour cette personne.</p>` : ''}
    <details class="orga-sources"><summary>Documents de référence</summary>
      ${missions.length ? '<p>Responsabilités FCH · saison 2026–2027, répartition par personne (p. 1–3) et par commission (p. 4–6).</p>' : ''}
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
    ${/* LE CADRE OUVRE L'ONGLET DES COMMISSIONS, et c'est la moitié la plus
          importante du document : *« cette répartition est un cadre d'aide…
          l'objectif n'est pas de rajouter de la pression »*. Une liste de cent
          trente-cinq missions sans lui se lit comme une liste de comptes à
          rendre — exactement ce que le club a écrit qu'elle n'était pas.
          Il est REPLIÉ : on le lit une fois, pas à chaque visite. */''}
    ${domaine === 'commissions' ? `<details class="orga-cadre">
      <summary>Ce que cette répartition est — et ce qu’elle n’est pas</summary>
      ${CADRE_MISSIONS.map((phrase) => `<p>${echapper(phrase)}</p>`).join('')}
    </details>` : ''}
    <div class="orga-grille" data-organigramme-groupes>${domaine === 'bureau' ? bureau() : (() => {
      const retenus = GROUPES.filter((g) => domaine === 'commissions' ? ['commissions','bureau'].includes(g.type) && !['presidence','secretariat','tresorerie'].includes(g.id) : g.type === domaine);
      const poles = retenus.filter((g) => POLES.includes(g.id));
      // `.map(groupe)` passerait l'INDEX en second argument, donc un nombre là
      // où l'on attend le nom d'un organigramme. Les deux appels écrivent leur
      // lambda — c'est le piège déjà noté sur `ligneAction`.
      // LE RÉCAPITULATIF A QUITTÉ CET ONGLET (20 septembre 2026, correction de
      // Noé) : il vit sur la page du pôle, qui EST la page de la commission
      // depuis la fusion du même jour. Ici on vient voir QUI est où — et neuf
      // récapitulatifs, même repliés, en faisaient un sommaire de document.
      const dessiner = (g) => groupe(g, domaine);
      return (poles.length ? rang(poles.map(dessiner).join('')) : '')
        + retenus.filter((g) => !POLES.includes(g.id)).map(dessiner).join('');
    })()}</div>
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
