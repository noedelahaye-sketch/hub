import { echapper } from './format.js';
import { porte } from './partenaires-suivi.js';
import { construireFormulaire } from './gabarits.js';
import { construireAVenir, construireBanque, construirePubliees } from './publications.js';

export const RETROPLANNING = 'https://docs.google.com/spreadsheets/d/1j2T9YDXAL-Wws34A1MJroRaetMOmHTzoaOeDet4Wx84/edit?usp=sharing';
// Dates et communes transcrites du planning officiel 2026/2027.
// Les alternatives restent explicites : aucune date définitive n'est déduite.
export const EVENEMENTS_CLUB = [
  { id: 'petanque-septembre-2026', titre: 'Concours de pétanque', date: '26 septembre 2026', lieu: 'Beaumont' },
  { id: 'tournoi-rose-2026', titre: 'Tournoi rose', date: '17 octobre 2026', lieu: 'Beaumont' },
  { id: 'noel-2026', titre: 'Goûter de Noël et présentation des équipes', date: '19 décembre 2026', lieu: 'Chanos' },
  { id: 'futsal-seniors-2027', titre: 'Tournoi futsal séniors', date: '9 janvier 2027', lieu: 'Mercurol' },
  { id: 'futsal-jeunes-2027', titre: 'Tournoi futsal jeunes', date: '10 janvier 2027', lieu: 'Mercurol' },
  { id: 'loto-2027', titre: 'Loto', date: '13 ou 20 février 2027', lieu: 'Mercurol', incertain: true },
  { id: 'saucisses-2027', titre: 'Matinée saucisses', date: '11 ou 18 avril 2027', lieu: 'Beaumont', incertain: true },
  { id: 'petanque-juin-2027', titre: 'Concours de pétanque', date: '12 juin 2027', lieu: 'Chanos' },
  { id: 'journee-club-2027', titre: 'Journée du club', date: '26 juin 2027', lieu: 'Beaumont' },
];
export const rubriqueEvenement = (e) => `Évènement · ${e.titre} · ${e.date}`;
export const estRubriqueEvenement = (rubrique) => EVENEMENTS_CLUB.some((e) => rubriqueEvenement(e) === rubrique);
function repereEvenement(e) {
  const morceaux = e.date.split(' ');
  const mois = morceaux.slice(-2).join(' ');
  const jour = morceaux.slice(0, -2).join(' ');
  return `<span class="evenement-repere"><span class="evenement-jour">${jour}</span><span>${mois}</span></span>`;
}
export function construireEvenementsClub(selection, publications, reseaux, formats) {
  const e = EVENEMENTS_CLUB.find((e) => e.id === selection);
  if (!e) return `<section class="bloc fch-sans-tuile"><h2>Les évènements · 2026/2027</h2>
    <div class="fch-hall evenements-galerie">${EVENEMENTS_CLUB.map((item) => {
      const nombre = publications.filter((p) => p.rubrique === rubriqueEvenement(item)).length;
      return porte(`#hermitage/evenements/${item.id}`, item.titre, '',
        `<span class="fch-hall-quoi">${item.lieu}${item.incertain ? ' · Date à confirmer' : ''}</span><span class="fch-hall-quoi">${nombre ? `${nombre} communication${nombre > 1 ? 's' : ''}` : 'Communication à préparer'}</span>`, repereEvenement(item));
    }).join('')}</div></section>`;
  const liees = publications.filter((p) => p.rubrique === rubriqueEvenement(e));
  const idees = liees.filter((p) => !p.date_prevue && p.statut !== 'publie');
  const prevues = liees.filter((p) => p.date_prevue && p.statut !== 'publie');
  const publiees = liees.filter((p) => p.statut === 'publie');
  return `<article class="evenement-fiche">
    <a class="lien-discret projet-club-retour" href="#hermitage/evenements">← Tous les évènements</a>
    <header class="evenement-entete">${repereEvenement(e)}<div>
      <h2>${echapper(e.titre)}</h2><p>${e.lieu}${e.incertain ? ' · Date à confirmer' : ''}</p></div></header>
    <div class="fch-hall evenement-outils">
      <div class="fch-hall-porte"><span class="fch-hall-tete"><span class="fch-hall-nom">La communication</span><span class="fch-hall-compte">${liees.length}</span></span>
        <div class="evenement-bilan"><span><strong>${idees.length}</strong> idées</span><span><strong>${prevues.length}</strong> prévues</span><span><strong>${publiees.length}</strong> publiées</span></div></div>
      <a class="fch-hall-porte" href="${RETROPLANNING}" target="_blank" rel="noopener noreferrer"><span class="fch-hall-tete"><span class="fch-hall-nom">Le rétroplanning</span><span aria-hidden="true">↗</span></span><span class="fch-hall-quoi">Organisation et échéances de l’évènement</span><span class="fch-hall-compte">Google Drive</span></a>
    </div>
    <section class="bloc evenement-communication"><h2>Préparer la communication</h2>
      <p class="discret">De l’annonce au bilan, toutes les publications de l’évènement.</p>
      ${construireFormulaire({ id: `communication-${e.id}`, action: 'noter-idee', libelle: 'Ajouter une communication', bouton: 'Enregistrer',
        extra: `<input type="hidden" name="rubrique" value="${echapper(rubriqueEvenement(e))}">`,
        champs: [
          { nom: 'titre', libelle: 'Publication à prévoir', type: 'text', requis: true, valeur: `${e.titre} — ` },
          { nom: 'reseau', libelle: 'Réseau', type: 'choix', options: reseaux, valeur: 'instagram' },
          { nom: 'format', libelle: 'Format', type: 'choix', options: formats, valeur: 'carrousel' },
          { nom: 'date_prevue', libelle: 'Date de publication (facultative)', type: 'date' },
          { nom: 'notes', libelle: 'Message, visuels et informations à préparer', type: 'textarea' },
        ] })}
      <div class="evenement-publications">${liees.length ? `${prevues.length ? `<h3>À venir</h3>${construireAVenir(prevues, { ouvrable: true, pastille: true })}` : ''}${idees.length ? `<h3>Les idées</h3>${construireBanque(idees, { ouvrable: true })}` : ''}${construirePubliees(publiees, { ouvrable: true })}` : '<p class="discret evenement-vide">La première publication commence ici : une annonce, un rappel ou une idée à garder pour plus tard.</p>'}</div>
    </section></article>`;
}
