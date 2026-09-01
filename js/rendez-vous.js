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

import {
  echapper,
  dureeLisible,
  echeanceLisible,
  depuisDateISO,
  rangDEspace,
} from './format.js';

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
      court: `Le club : ${enHeures(club.total)} sur ${enHeures(club.vise)} visées.`,
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
      court: `« ${p.nom} » demande ${enHeures(p.besoin)} cette semaine.`,
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
      court: 'Rien pour toi cette semaine.',
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
        court: manque.pose
          ? `${manque.pose} ${mot.compte} sur ${manque.attendu}.`
          : `${mot.vide} cette semaine.`,
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
      court: `${perso.nonClasses} moments perso sans famille.`,
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
      court: inference.court ?? inference.constat,
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

  // TRIÉES PAR ESPACE (1er septembre 2026, demande de Noé). C'est l'ordre des
  // journées de Noé — le club, la formation, Yuno, puis lui —, celui de la
  // galerie des caps et du calendrier, et il vit dans `rangDEspace`. Sans lui,
  // les lignes sortaient dans l'ordre où le diagnostic les avait trouvées : la
  // charge, la formation, le perso, puis les inférences en vrac. **Un ordre qui
  // ne veut rien dire est un ordre qu'on relit à chaque fois** ; avec, la liste
  // se lit par blocs, comme une journée.
  //
  // `sort` est STABLE en JavaScript : à espace égal, l'ordre de construction
  // tient — la charge avant la formation, le plancher perso avant ses
  // inférences. On range les espaces sans mélanger ce qu'ils contiennent.
  lignes.sort((a, b) => rangDEspace(a.espace) - rangDEspace(b.espace));

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
// UNE PHRASE, ET LE DÉTAIL AU CLIC (1er septembre 2026, Noé : « je n'aime pas
// la forme des propositions, on ne comprend pas vraiment ce que ça veut dire ;
// il ne faut pas avoir un titre et un petit descriptif, plutôt une petite
// phrase, et quand on clique dessus on voit un détail de la proposition avec
// l'action proposée associée »).
//
// CE QUE ÇA RENVERSE. Depuis le 31 août, la carte tenait en deux lignes — un
// chiffre en gros, trois mots en dessous :
//
//     ● 16 h 30 / 26 h            ↗
//       Le club, 3 séances
//
// La forme était juste sur un point : elle se comprenait d'un REGARD. Mais un
// regard ne dit pas ce qu'il faut en faire. « 2 · moments sans famille » ne
// veut rien dire pour qui ne connaît pas déjà la règle des familles, et le
// constat complet — qui, lui, l'explique — était rangé dans un `title` que
// personne n'ouvre. **On avait déplacé le sens jusqu'à le perdre.**
//
// LA PHRASE REVIENT DONC AU PREMIER PLAN, et c'est elle la carte. Ce qui part
// à sa place, c'est la précision, le « d'après » et le libellé du geste : ils
// vivent dans le DÉTAIL, qu'un appui ouvre.
//
// ACCEPTER COÛTE UN GESTE DE PLUS, et c'est le prix assumé de la demande. La
// règle du rendez-vous — aucun constat sans proposition — ne bouge pas d'un
// pouce : elle change seulement d'endroit. Le geste n'est plus la carte, il est
// le bouton du détail, où on le lit en toutes lettres au lieu de le deviner
// derrière une flèche.

export function construireRendezVous(diagnostic, { intro = true, valider = true } = {}) {
  const lignes = lignesDuRendezVous(diagnostic);
  const { semaine } = diagnostic;

  if (!lignes.length) {
    return `<p class="vide">Rien à signaler sur cette semaine — elle est à toi.</p>`;
  }

  // LA CARTE NE PORTE QUE SA PHRASE. Pas de chiffre en vedette, pas de mot en
  // dessous : une phrase se lit, et c'est tout ce qu'on lui demande ici.
  //
  // ELLE EST TOUJOURS UN BOUTON, quelle que soit sa proposition — un lien
  // mènerait ailleurs, or l'appui ouvre maintenant le détail et rien d'autre.
  // C'est le détail qui porte le lien ou la tuile de capture.
  const carte = (ligne) => `
    <li><button type="button"
      class="rdv-carte${ligne.ton === 'tendu' ? ' rdv-tendu' : ''}"
      data-espace="${echapper(ligne.espace ?? '')}"
      data-rdv-ouvrir="${echapper(ligne.cle)}">
      <span class="rdv-phrase">${echapper(ligne.court ?? ligne.constat)}</span>
      <span class="rdv-fleche" aria-hidden="true">${FLECHE}</span>
    </button></li>`;

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

// LE DÉTAIL D'UNE PROPOSITION (1er septembre 2026, demande de Noé : « quand on
// clique dessus on voit un détail de la proposition avec l'action proposée
// associée »).
//
// Il dit tout ce que la carte ne dit plus, et dans cet ordre : le constat en
// entier, ce qu'il implique, d'où il sort, puis ce qu'on peut en faire.
//
// LE « D'APRÈS » N'EST PAS DE LA COQUETTERIE : c'est ce qui rend le constat
// vérifiable. Un hub qui affirme sans dire d'où il tient ce qu'il affirme finit
// par être cru — ou ignoré —, et aucun des deux ne vaut mieux que l'autre.
//
// L'ACTION EST ÉCRITE EN TOUTES LETTRES, en pastille d'accent : c'est la seule
// chose de cette fenêtre sur laquelle on appuie, et son libellé dit ce qui va
// se passer. Un lien mène ailleurs, un bouton ouvre la tuile de capture — la
// commande prend la forme de ce qu'elle fait, comme la carte le faisait avant.
export function construireDetailProposition(ligne) {
  if (!ligne) return '';

  const proposition = ligne.proposition ?? null;
  const geste = proposition?.lien
    ? `<a class="bouton rdv-geste" href="${echapper(proposition.lien)}" data-rdv-fermer>
         ${echapper(proposition.libelle)}
       </a>`
    : proposition?.creer
      ? `<button type="button" class="bouton rdv-geste" data-rdv-creer="${echapper(
          JSON.stringify(proposition.creer),
        )}">${echapper(proposition.libelle)}</button>`
      : '';

  return `
    <div class="rdv-detail" data-espace="${echapper(ligne.espace ?? '')}">
      <p class="rdv-detail-constat">${echapper(ligne.constat)}</p>
      ${ligne.precision ? `<p class="rdv-detail-precision">${echapper(ligne.precision)}</p>` : ''}
      ${
        ligne.dou
          ? `<p class="rdv-detail-dou discret">D’après ${echapper(ligne.dou)}.</p>`
          : ''
      }
      ${geste}
    </div>`;
}

export { PLANCHER_PERSO };
