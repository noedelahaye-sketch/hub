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

export function construireRendezVous(diagnostic) {
  const lignes = lignesDuRendezVous(diagnostic);
  const { semaine } = diagnostic;

  const geste = (proposition) => {
    if (!proposition) return '';
    if (proposition.lien) {
      return `<a class="rdv-geste" href="${echapper(proposition.lien)}">${echapper(
        proposition.libelle,
      )}</a>`;
    }
    return `<button type="button" class="rdv-geste" data-rdv-creer="${echapper(
      JSON.stringify(proposition.creer),
    )}">${echapper(proposition.libelle)}</button>`;
  };

  return `
    <p class="rdv-intro">Du ${echapper(bornesLisibles(semaine))}.</p>

    <ul class="rdv-lignes">
      ${lignes
        .map(
          (ligne) => `
        <li class="rdv-ligne${ligne.ton === 'tendu' ? ' rdv-tendu' : ''}">
          <span class="rdv-constat">${echapper(ligne.constat)}</span>
          ${ligne.precision ? `<span class="rdv-precision">${echapper(ligne.precision)}</span>` : ''}
          ${ligne.dou ? `<span class="rdv-dou">d’après ${echapper(ligne.dou)}</span>` : ''}
          ${geste(ligne.proposition)}
        </li>`,
        )
        .join('')}
    </ul>

    <button type="button" class="bouton-secondaire rdv-valider" data-valider-semaine>
      C’est ma semaine
    </button>`;
}

export { PLANCHER_PERSO };
