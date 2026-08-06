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

export const NOMS_PROJETS = {
  formation: 'Formation',
  photo: 'Photo',
  fch: 'FC Hermitage',
  perso: 'Perso',
};
