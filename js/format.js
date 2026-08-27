// Petits utilitaires partagés par les espaces : dates et échappement HTML.

const MS_PAR_JOUR = 86400000;

// Une colonne `date` de Postgres arrive en "AAAA-MM-JJ". `new Date()` la lirait
// comme minuit UTC, ce qui décale le jour selon le fuseau : on la construit à la
// main en date locale.
export function depuisDateISO(texte) {
  const [annee, mois, jour] = texte.split('-').map(Number);
  return new Date(annee, mois - 1, jour);
}

// L'inverse : une date locale vers "AAAA-MM-JJ", sans passer par UTC.
export function versDateISO(date = new Date()) {
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const jour = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mois}-${jour}`;
}

export function ajouterJours(date, nombre) {
  const resultat = new Date(date);
  resultat.setDate(resultat.getDate() + nombre);
  return resultat;
}

function minuit(date) {
  const resultat = new Date(date);
  resultat.setHours(0, 0, 0, 0);
  return resultat;
}

export function joursDEcart(date, reference = new Date()) {
  return Math.round((minuit(date) - minuit(reference)) / MS_PAR_JOUR);
}

// "jeudi 6 août" — l'en-tête du jour.
export function dateLongue(date = new Date()) {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

// Une échéance, dite sobrement. Jamais d'alarme, jamais de compteur de retard :
// une date passée se lit comme une date, pas comme un reproche.
export function echeanceLisible(date, reference = new Date()) {
  const ecart = joursDEcart(date, reference);
  if (ecart === 0) return "aujourd'hui";
  if (ecart === 1) return 'demain';
  if (ecart === -1) return 'hier';
  if (ecart > 1 && ecart <= 7) return `dans ${ecart} jours`;
  const memeAnnee = date.getFullYear() === reference.getFullYear();
  return `le ${date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    ...(memeAnnee ? {} : { year: 'numeric' }),
  })}`;
}

// "lun. 10 août, 18:30" — pour les événements de la semaine.
export function momentLisible(date) {
  const jour = date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const heure = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  // Un événement calé sur minuit est une date sans heure : on n'affiche pas 00:00.
  const sansHeure = date.getHours() === 0 && date.getMinutes() === 0;
  return sansHeure ? jour : `${jour}, ${heure}`;
}

// Les titres viennent de la base : ils passent par ici avant d'entrer en HTML.
export function echapper(texte) {
  return String(texte ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export const NOMS_ESPACES = {
  formation: 'Formation',
  photo: 'Yuno',
  fch: 'FC Hermitage',
  perso: 'Perso',
};

// --- Les répétitions ---------------------------------------------------------
// Événements, tâches et publications se répètent avec les mêmes mots et le
// même pas (les publications depuis le 26 août 2026). Le
// vocabulaire et l'arithmétique vivent ICI, dans le module sans dépendance :
// `js/api.js` en a besoin pour faire glisser une tâche récurrente, et
// `js/calendrier-commun.js` pour déplier une série — or celui-ci importe
// l'API, et l'inverse ferait un cycle.

export const RECURRENCES = {
  '': 'Une seule fois',
  hebdo: 'Chaque semaine',
  quinzaine: 'Toutes les deux semaines',
  mensuel: 'Chaque mois',
};

const PAS_EN_JOURS = { hebdo: 7, quinzaine: 14 };

// L'occurrence suivante (ou précédente, avec un sens négatif — c'est ce qui
// permet d'annuler une coche). Le mensuel avance de mois en mois et non de
// 30 jours : un rendez-vous du 15 reste le 15.
export function decalerOccurrence(date, recurrence, sens = 1) {
  const suite = new Date(date);
  const pas = PAS_EN_JOURS[recurrence];
  if (pas) suite.setDate(suite.getDate() + pas * sens);
  else suite.setMonth(suite.getMonth() + sens);
  return suite;
}

// Les dates d'une série, dans une fenêtre bornée. Sans borne, une répétition
// sans fin déclarée produirait une liste infinie ; la borne de tours est une
// ceinture, pour qu'une date de fin aberrante ne fasse pas tourner sans fin.
export function occurrencesEntre(depart, recurrence, finISO, plancher, plafondParDefaut) {
  if (!recurrence) return [new Date(depart)];

  const plafond = finISO ? depuisDateISO(finISO) : plafondParDefaut;
  const dates = [];
  let curseur = new Date(depart);

  for (let tour = 0; tour < 400 && curseur <= plafond; tour += 1) {
    if (curseur >= plancher) dates.push(new Date(curseur));
    curseur = decalerOccurrence(curseur, recurrence);
  }

  return dates;
}

// --- Les durées --------------------------------------------------------------
// Une durée en minutes plutôt que deux sélecteurs d'heure : on pense « un match
// dure deux heures », pas « de 15 h à 17 h ». Elle ne vaut qu'avec une heure —
// sans heure, la chose tient la journée et il n'y a pas de créneau à mesurer.
//
// Ici plutôt que dans la tuile du calendrier, pour la même raison que les
// répétitions juste au-dessus : l'espace Tâches a besoin de ces mots et
// n'importe pas le calendrier.
// Ce qu'un ÉVÉNEMENT sait durer : de 1 h à 4 h, plus la journée entière
// (demande de Noé, 26 août 2026). La demi-heure est partie — rien de ce que
// Noé pose au calendrier ne dure trente minutes : un match, un entraînement,
// une réunion, un rendez-vous, c'est une heure au moins.
//
// « Toute la journée » vaut NEUF HEURES, et c'est un choix : il faut un
// nombre, parce que la hauteur de la barre en vue semaine se calcule. Neuf
// heures, c'est une journée telle qu'on l'occupe, pas les vingt-quatre du
// cadran. À ne pas confondre avec un événement SANS heure, qui tient le jour
// sans occuper de créneau — c'est le cas d'à côté, et il ne passe pas par ici.
export const DUREES = {
  60: '1 heure',
  90: '1 h 30',
  120: '2 heures',
  150: '2 h 30',
  180: '3 heures',
  240: '4 heures',
  540: 'Toute la journée',
};

// Une TÂCHE ne répond pas à cette question de la même façon (26 août 2026).
// Un événement dure ce que dure un match : une liste fermée suffit. Une tâche
// dure ce qu'elle dure — vingt minutes, une heure et quart, une matinée —, et
// Noé l'a demandé explicitement : **on la tape en minutes**, et les
// propositions ne sont qu'un raccourci pour les cas fréquents, de 1 h à 3 h.
//
// Une liste, donc, et non une table : ce ne sont pas les seules valeurs
// possibles, seulement celles qui s'offrent en un appui.
export const DUREES_PROPOSEES = [60, 90, 120, 150, 180];

// Les raccourcis de la question posée APRÈS coup — « combien de temps ça a
// pris ? ». Ils commencent plus bas que ceux d'une tâche qu'on planifie : on
// ne se réserve pas un créneau de trente minutes, mais un appel passé en
// trente minutes, ça arrive tous les jours. Au-delà, on tape les minutes.
export const DUREES_FAITES = [30, 60, 90, 120, 180];

// La durée en toutes lettres, à partir des minutes. Court, parce que ça
// s'écrit dans une pastille et dans la ligne de service d'une tâche :
// « 1 h 30 », pas « 1 heure et 30 minutes ». Zéro et nul ne disent rien —
// une tâche sans durée n'a pas de durée à annoncer.
export function dureeLisible(minutes) {
  const total = Number(minutes);
  if (!Number.isFinite(total) || total <= 0) return '';

  const heures = Math.floor(total / 60);
  const reste = total % 60;
  if (!heures) return `${reste} min`;
  return reste ? `${heures} h ${String(reste).padStart(2, '0')}` : `${heures} h`;
}
