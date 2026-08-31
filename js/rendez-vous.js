// Le rendez-vous du dimanche : le premier écran de l'orientation.
//
// Il ouvre le dimanche à 20 h et reste jusqu'à ce que Noé l'ait validé — au
// plus tard la fin du lundi (son choix, 27 août 2026). Passé ce délai il se
// tait : le hub ne relance pas, il ne compte pas les rendez-vous manqués.
//
// LA RÈGLE DE FORME, sans exception : aucun constat sans proposition. « Rien
// pour toi cette semaine » tout seul est un reproche ; suivi de « caler tes
// trois séances » c'est une aide. Et accepter doit coûter UN geste — sinon ce
// n'est pas une proposition, c'est encore un constat.
//
// Ce module ne touche ni au réseau ni à la session : il transforme un
// diagnostic (js/orientation.js) en lignes, puis les lignes en HTML. Les deux
// se vérifient seuls.

import { echapper, dureeLisible, echeanceLisible, depuisDateISO } from './format.js';

// L'intervalle de la semaine, en toutes lettres. `echeanceLisible` ne convient
// pas ici : il parle en relatif — « aujourd'hui », « dans 4 jours » —, ce qui
// est juste pour une échéance et absurde pour une borne de calendrier.
function bornesLisibles({ debut, fin }) {
  const jour = (iso, options) =>
    depuisDateISO(iso).toLocaleDateString('fr-FR', options).replace(/^1 /, '1er ');
  const memeMois = debut.slice(0, 7) === fin.slice(0, 7);
  return `${jour(debut, memeMois ? { day: 'numeric' } : { day: 'numeric', month: 'long' })} au ${jour(
    fin,
    { day: 'numeric', month: 'long' },
  )}`;
}
import { PLANCHER_PERSO } from './orientation.js';

const HEURE_OUVERTURE = 20;

// Dimanche à partir de 20 h, ou lundi. `getDay()` : 0 = dimanche, 1 = lundi.
export function fenetreOuverte(jour = new Date()) {
  const semaine = jour.getDay();
  if (semaine === 1) return true;
  return semaine === 0 && jour.getHours() >= HEURE_OUVERTURE;
}

const enHeures = (minutes) => dureeLisible(Math.round(minutes));

const NOMS = { fch: 'le club', formation: 'la formation', photo: 'Yuno', perso: 'toi' };

// La flèche du geste : le seul signe de la carte, et il ne dit qu'une chose —
// ceci mène quelque part. En trait plutôt qu'en glyphe, pour ne pas dépendre
// d'une police de secours choisie par le navigateur.
const FLECHE = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none"
  stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true" focusable="false"><path d="M5 12h13M13 6l6 6-6 6"></path></svg>`;

// --- Du diagnostic aux lignes -------------------------------------------------
//
// Chaque ligne porte son constat ET son geste. `creer` ouvre la tuile de
// capture pré-remplie ; `lien` mène à l'écran où le réglage se fait. Une ligne
// sans l'un ou l'autre n'a rien à faire ici.
export function lignesDuRendezVous(diagnostic) {
  const lignes = [];
  const { charge, formation, perso, inferences = [] } = diagnostic;

  // 1. LA FORME DE LA SEMAINE. Le club d'abord : c'est lui qui déborde.
  const club = charge.fch;
  if (club.total || club.vise) {
    const trop = club.ecart > 0;
    lignes.push({
      cle: 'charge-fch',
      espace: 'fch',
      chiffre: `${enHeures(club.total)} / ${enHeures(club.vise)}`,
      mot: club.seances ? `Le club, ${club.seances} séances` : 'Le club cette semaine',
      constat: `Le club est à ${enHeures(club.total)} sur ${enHeures(club.vise)} visées`
        + (club.seances ? `, dont ${club.seances} séances et leur traitement.` : '.'),
      precision: club.nonChiffre
        ? `${club.nonChiffre} lignes sans durée : ce total est un plancher, pas un compte.`
        : null,
      ton: trop ? 'tendu' : 'calme',
      // Même quand tout tient, la ligne porte une porte : c'est la règle, et
      // elle n'a pas d'exception. Un constat sans geste, même de bonne
      // nouvelle, apprend à lire le rendez-vous sans rien en attendre.
      proposition: trop
        ? { libelle: 'Voir ce qui peut attendre', lien: '#taches' }
        : { libelle: 'Voir la semaine', lien: '#calendrier' },
    });
  }

  // 2. LA COURBE DE LA FORMATION. Le chiffre qui dit « trop ambitieux », et le
  //    seul qui le dise.
  if (formation.prochain) {
    const p = formation.prochain;
    lignes.push({
      cle: 'formation',
      espace: 'formation',
      chiffre: enHeures(p.besoin),
      mot: p.nom,
      constat: `« ${p.nom} » demande ${enHeures(p.besoin)} cette semaine —`
        + ` ${enHeures(p.reste)} restent d'ici ${echeanceLisible(depuisDateISO(p.echeance))}.`,
      precision:
        formation.lisse < p.besoin
          ? `Un rythme régulier de ${enHeures(formation.lisse)} suffirait à tout tenir :`
            + ` c'est l'échéance qui est en grappe, pas le volume.`
          : null,
      ton: 'calme',
      proposition: {
        libelle: 'Bloquer un créneau',
        creer: { nature: 'tache', espace: 'formation', titre: p.nom },
      },
    });
  }

  // 3. LE PLANCHER PERSO. Une ligne par famille qui manque, jamais un compteur
  //    global — celui-ci se laisserait remplir par la plus facile.
  const MOTS = {
    corps: { vide: 'Aucune séance', compte: 'séances', geste: 'Caler une séance', titre: 'Sport' },
    calme: {
      vide: 'Aucun moment de calme',
      compte: 'moments de calme',
      geste: 'Poser un moment',
      titre: 'Lire, marcher, écrire',
    },
    lien: {
      vide: 'Personne de vu',
      compte: 'moments avec quelqu’un',
      geste: 'Poser un moment',
      titre: 'Voir quelqu’un',
    },
  };

  // Les trois familles vides tiennent en UNE ligne : trois reproches d'affilée
  // au même endroit, c'est un mur, et le hub n'en dresse pas. Dès qu'une seule
  // est tenue, les manquantes redeviennent des lignes à elles — il n'y a plus
  // de mur, et chacune mérite son geste.
  if (perso.manques.length === Object.keys(PLANCHER_PERSO).length) {
    lignes.push({
      cle: 'perso-rien',
      espace: 'perso',
      chiffre: 'Rien',
      mot: 'pour toi cette semaine',
      constat: 'Rien pour toi cette semaine.',
      precision: 'Ni séance, ni moment de calme, ni personne de vu.',
      ton: 'calme',
      proposition: {
        libelle: 'Caler une séance',
        creer: { nature: 'tache', espace: 'perso', titre: 'Sport', famille: 'corps' },
      },
    });
  } else {
    for (const manque of perso.manques) {
      const mot = MOTS[manque.famille];
      lignes.push({
        cle: `perso-${manque.famille}`,
        espace: 'perso',
        chiffre: `${manque.pose ?? 0} / ${manque.attendu}`,
        mot: mot.titre,
        constat: manque.pose
          ? `${manque.pose} ${mot.compte} sur ${manque.attendu} cette semaine.`
          : `${mot.vide} cette semaine.`,
        precision: null,
        ton: 'calme',
        proposition: {
          libelle: mot.geste,
          creer: { nature: 'tache', espace: 'perso', titre: mot.titre, famille: manque.famille },
        },
      });
    }
  }

  if (perso.nonClasses) {
    lignes.push({
      cle: 'perso-non-classes',
      espace: 'perso',
      chiffre: String(perso.nonClasses),
      mot: 'moments sans famille',
      constat: `${perso.nonClasses} moments perso ne disent pas à quelle famille ils appartiennent.`,
      precision: 'Sans ça, le hub ne peut pas savoir si ta semaine t’a reposé.',
      ton: 'calme',
      proposition: { libelle: 'Les ranger', lien: '#perso' },
    });
  }

  // 4. LES INFÉRENCES — ce que Noé ne voit pas. Trois au plus, déjà coupées.
  for (const inference of inferences) {
    lignes.push({
      cle: inference.cle,
      espace: inference.espace,
      chiffre: inference.chiffre,
      mot: inference.mot,
      constat: inference.constat,
      precision: inference.consequence,
      dou: inference.dou,
      ton: 'calme',
      proposition: propositionDeLInference(inference),
    });
  }

  // 5. PLUS D'ARBITRAGE ICI (28 août 2026). Le rendez-vous fermait sa liste sur
  //    « le club et la formation demandent plus que tes 35 h — lequel cède ? ».
  //    Noé a tranché : « ça ne me sert à rien, c'est LE BUT d'une période
  //    d'intensité, j'en fais plus que d'habitude ». La question disparaissait
  //    de `#objectifs` le même jour ; la laisser revenir le dimanche soir
  //    aurait été la déplacer, pas la retirer.
  //
  //    Le calcul reste entier (`tensionDeLaPeriode`, js/orientation.js) : c'est
  //    la mesure qu'on garde, c'est le reproche qu'on enlève.

  return lignes;
}

function propositionDeLInference(inference) {
  if (inference.cle === 'terrain-sans-tri') {
    return {
      libelle: 'Poser le tri',
      creer: { nature: 'tache', espace: 'fch', titre: 'Trier les photos de la séance' },
    };
  }
  if (inference.cle.startsWith('maillon-') || inference.cle.startsWith('jalon-')) {
    return { libelle: 'Ouvrir le cap', lien: '#objectifs' };
  }
  if (inference.cle.startsWith('silence-')) {
    return { libelle: 'Ouvrir le cap', lien: '#objectifs' };
  }
  if (inference.cle.startsWith('rythme-')) {
    return { libelle: 'Revoir le rythme', lien: '#taches' };
  }
  return null;
}

// --- Le dessin ----------------------------------------------------------------
//
// DES CARTES, PAS DES PARAGRAPHES (31 août 2026, Noé : « leur forme est
// catastrophique, elles prennent trop de place, il n'y a rien de visuel qui
// permette de comprendre sans lire — quel espace, quelle info importante »).
//
// Chaque constat tient maintenant en DEUX LIGNES, et se comprend d'un regard
// avant d'être lu :
//
//     ● 16 h 30 / 26 h            ↗
//       Le club, 3 séances
//
//   — la PASTILLE donne l'espace par sa couleur, comme partout dans le hub ;
//   — le CHIFFRE est ce qu'on vient chercher : il est en Geist Mono, gros,
//     posé seul sur sa ligne ;
//   — le MOT dit de quoi il s'agit en trois mots, jamais en trois phrases.
//
// LE CONSTAT COMPLET N'EST PAS PERDU, IL EST DÉPLACÉ : il passe dans le `title`
// et dans le nom accessible, avec sa précision et son « d'après ». C'est la
// parade déjà employée sur la ligne d'une habitude — le sens survit à la
// place qu'on lui reprend, et un écran qu'on ouvre chaque dimanche n'a pas
// besoin qu'on lui réexplique ses propres chiffres.
//
// TOUTE LA CARTE PORTE LE GESTE, et c'est ce qui fait tenir les deux lignes :
// un libellé de bouton (« Bloquer un créneau », « Voir ce qui peut attendre »)
// coûtait une troisième ligne à lui seul. La règle du rendez-vous ne bouge
// pas — aucun constat sans proposition, accepter coûte UN geste : ici, le
// geste est la carte elle-même, et la flèche le dit.

export function construireRendezVous(diagnostic, { intro = true, valider = true } = {}) {
  const lignes = lignesDuRendezVous(diagnostic);
  const { semaine } = diagnostic;

  if (!lignes.length) {
    return `<p class="vide">Rien à signaler sur cette semaine — elle est à toi.</p>`;
  }

  const carte = (ligne) => {
    // Ce que le survol et le lecteur d'écran reçoivent : la phrase entière,
    // puis ce que le geste va faire. Deux informations, un seul texte.
    const entier = [ligne.constat, ligne.precision, ligne.dou ? `d’après ${ligne.dou}` : null]
      .filter(Boolean)
      .join(' ');
    const libelle = ligne.proposition?.libelle ?? '';
    const dedans = `
      ${ligne.chiffre ? `<span class="rdv-chiffre chiffre">${echapper(ligne.chiffre)}</span>` : ''}
      <span class="rdv-mot">${echapper(ligne.mot ?? ligne.constat)}</span>
      ${libelle ? `<span class="rdv-fleche" aria-hidden="true">${FLECHE}</span>` : ''}`;

    const attributs =
      `class="rdv-carte${ligne.ton === 'tendu' ? ' rdv-tendu' : ''}"` +
      ` data-espace="${echapper(ligne.espace ?? '')}"` +
      ` title="${echapper(libelle ? `${entier} — ${libelle}` : entier)}"` +
      ` aria-label="${echapper(libelle ? `${entier} ${libelle}` : entier)}"`;

    // Un lien mène ailleurs, un bouton ouvre la tuile de capture : la carte
    // prend la forme de ce qu'elle fait. Sans proposition — le cas n'existe pas
    // aujourd'hui, la règle l'interdit — elle reste un simple bloc.
    if (ligne.proposition?.lien) {
      return `<li><a ${attributs} href="${echapper(ligne.proposition.lien)}">${dedans}</a></li>`;
    }
    if (ligne.proposition?.creer) {
      return `<li><button type="button" ${attributs} data-rdv-creer="${echapper(
        JSON.stringify(ligne.proposition.creer),
      )}">${dedans}</button></li>`;
    }
    return `<li><span ${attributs}>${dedans}</span></li>`;
  };

  return `
    ${intro ? `<p class="rdv-intro">Du ${echapper(bornesLisibles(semaine))}.</p>` : ''}

    <ul class="rdv-cartes">${lignes.map(carte).join('')}</ul>

    ${
      valider
        ? `<button type="button" class="bouton-secondaire rdv-valider" data-valider-semaine>
             C’est ma semaine
           </button>`
        : ''
    }`;
}

export { PLANCHER_PERSO };
