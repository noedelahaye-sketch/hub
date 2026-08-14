// Tous les appels Supabase du hub passent par ce fichier.
// Rien d'autre dans le site ne doit importer supabase-js directement.

// supabase-js vit dans le dépôt (`js/vendor/`, rapatrié par
// `tools/telecharger-supabase.py`), comme les polices : le hub n'appelle aucun
// CDN. Deux raisons, pas une seule — un fichier distant est le seul morceau que
// le service worker ne peut pas garantir hors ligne, et le « @2 » d'avant
// suivait la dernière version publiée, donc pouvait casser l'application un
// matin sans que personne n'ait rien poussé. La version est écrite dans
// `js/vendor/VERSION` ; on en change en relançant l'outil.
import { createClient } from './vendor/supabase-js.js';
import { versDateISO } from './format.js';

// URL du projet et clé publique (anon) : ces deux valeurs sont publiques par
// conception. Sans session, elles ne donnent accès à rien — les politiques RLS
// réservent toutes les opérations au rôle `authenticated`.
const SUPABASE_URL = 'https://dpkyealzuabwchccdqcv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwa3llYWx6dWFid2NoY2NkcWN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5NjUwNzcsImV4cCI6MjEwMTU0MTA3N30.dJxWsuKZlvyc8uoCLhJVm80TfUg_BLX7IEdwe6VxMf4';

// persistSession + autoRefreshToken sont les valeurs par défaut de supabase-js :
// la session est gardée dans le localStorage et le token rafraîchi tout seul.
// On les écrit quand même, c'est le comportement dont dépend le site.
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// --- Authentification -------------------------------------------------------

export async function sessionCourante() {
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function connexion(email, motDePasse) {
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password: motDePasse,
  });
  if (error) throw error;
  return data.session;
}

export async function deconnexion() {
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

// Rappelle `callback(session)` à chaque changement d'état : connexion,
// déconnexion, rafraîchissement de token, ou session restaurée dans un autre
// onglet. Renvoie une fonction pour se désabonner.
export function surChangementSession(callback) {
  const { data } = client.auth.onAuthStateChange((_evenement, session) => {
    callback(session);
  });
  return () => data.subscription.unsubscribe();
}

// --- Données ----------------------------------------------------------------
// Une fonction par usage. `data` est renvoyé tel quel, les erreurs remontent.

function verifier({ data, error }) {
  if (error) throw error;
  return data;
}

// Humeur — une entrée par jour, la contrainte UNIQUE sur `date` fait le reste.

export async function humeurDuJour(dateISO) {
  return verifier(
    await client.from('humeur').select('*').eq('date', dateISO).maybeSingle(),
  );
}

export async function enregistrerHumeur(dateISO, niveau, note = null) {
  return verifier(
    await client
      .from('humeur')
      .upsert({ date: dateISO, niveau, note }, { onConflict: 'date' })
      .select()
      .single(),
  );
}

export async function humeurDepuis(dateISO) {
  return verifier(
    await client
      .from('humeur')
      .select('date, niveau, note')
      .gte('date', dateISO)
      .order('date'),
  );
}

// Victoires — tous projets confondus, perso au même rang que le reste.

export async function dernieresVictoires(limite = 5) {
  return verifier(
    await client
      .from('victoires')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limite),
  );
}

// `sauf` écarte une source. Le Carnet de terrain s'en sert : ses moments sont
// déjà dans la liste, leurs victoires n'ont pas à occuper la limite et à
// repousser hors du fil les victoires d'avant le carnet.
export async function victoiresDuProjet(projet, limite = 10, { sauf = null } = {}) {
  let requete = client.from('victoires').select('*').eq('projet', projet);
  if (sauf) requete = requete.neq('source', sauf);

  return verifier(
    await requete
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limite),
  );
}

export async function supprimerVictoire(id) {
  const { error } = await client.from('victoires').delete().eq('id', id);
  if (error) throw error;
}

// Décocher une tâche retire la victoire qu'elle avait créée. Le dashboard le
// fait déjà, mais il garde l'identifiant sous la main — il vient de la créer.
// L'espace Tâches rouvre des tâches terminées il y a des jours : il faut la
// retrouver par sa source. Une victoire pour un travail défait serait fausse,
// et le hub montre ce qui est accompli, pas ce qui l'a paru.
export async function supprimerVictoireDeLaTache(tacheId) {
  const { error } = await client
    .from('victoires')
    .delete()
    .eq('source', 'tache')
    .eq('source_id', tacheId);
  if (error) throw error;
}

export async function ajouterVictoire({ projet, titre, source = 'manuel', source_id = null }) {
  return verifier(
    await client
      .from('victoires')
      .insert({ projet, titre, source, source_id })
      .select()
      .single(),
  );
}

// Objectifs — avec leurs jalons, la progression se calcule côté client.

export async function objectifsActifs({ projet = null } = {}) {
  let requete = client
    .from('objectifs')
    .select('*, jalons(id, titre, echeance, atteint, date_atteint, ordre)')
    .eq('statut', 'actif')
    .order('echeance', { nullsFirst: false })
    .order('ordre', { referencedTable: 'jalons' });

  if (projet) requete = requete.eq('projet', projet);
  return verifier(await requete);
}

// Événements — bornes en ISO complet, `date_debut` étant un timestamptz.

export async function evenementsEntre(debutISO, finISO, { projet = null } = {}) {
  let requete = client
    .from('evenements')
    .select('*')
    .gte('date_debut', debutISO)
    .lte('date_debut', finISO)
    .order('date_debut');

  if (projet) requete = requete.eq('projet', projet);
  return verifier(await requete);
}

// Tâches.

export async function tachesActives({ projet = null } = {}) {
  let requete = client
    .from('taches')
    .select('*')
    .eq('statut', 'actif')
    .order('echeance', { nullsFirst: false })
    .order('created_at');

  if (projet) requete = requete.eq('projet', projet);
  return verifier(await requete);
}

// Les tâches datées jusqu'à `finISO`, celles déjà faites mises de côté. Sans
// borne basse : une échéance passée reste visible plutôt que de disparaître.
export async function tachesEcheanceJusqua(finISO, { projet = null } = {}) {
  let requete = client
    .from('taches')
    .select('*')
    .neq('statut', 'fait')
    .not('echeance', 'is', null)
    .lte('echeance', finISO)
    .order('echeance');

  if (projet) requete = requete.eq('projet', projet);
  return verifier(await requete);
}

// TOUTES les tâches, sans exception : datées ou non, faites ou non, tous
// projets. C'est la seule lecture du hub qui ne cache rien — l'espace Tâches
// est fait pour ça, et le tri se décide à l'affichage plutôt qu'ici.
export async function tachesToutes() {
  return verifier(
    await client
      .from('taches')
      .select('*')
      .order('priorite')
      .order('echeance', { nullsFirst: false })
      .order('created_at', { ascending: false }),
  );
}

// Toutes les tâches en cours d'un projet, actives et backlog confondus. L'ordre
// met les actives d'abord, puis les plus anciennes du backlog.
export async function tachesEnCours(projet) {
  return verifier(
    await client
      .from('taches')
      .select('*')
      .eq('projet', projet)
      .neq('statut', 'fait')
      .order('statut')
      .order('echeance', { nullsFirst: false })
      .order('created_at'),
  );
}

export const MAX_TACHES_ACTIVES = 3;

// Terminer une tâche crée sa victoire. Si l'insertion de la victoire échoue, la
// tâche reste faite : on ne la rouvre pas, mais l'erreur remonte pour être vue.
export async function terminerTache(tache) {
  const faite = verifier(
    await client
      .from('taches')
      .update({ statut: 'fait', date_fait: new Date().toISOString() })
      .eq('id', tache.id)
      .select()
      .single(),
  );

  const victoire = await ajouterVictoire({
    projet: faite.projet,
    titre: faite.titre,
    source: 'tache',
    source_id: faite.id,
  });

  return { tache: faite, victoire };
}

// Défaire une tâche terminée : elle redevient active et perd sa date. La règle
// des 3 actives n'est pas revérifiée ici, volontairement — la tâche était active
// il y a quelques secondes, on la remet exactement où elle était.
export async function rouvrirTache(tache) {
  return verifier(
    await client
      .from('taches')
      .update({ statut: 'actif', date_fait: null })
      .eq('id', tache.id)
      .select()
      .single(),
  );
}

// Passer une tâche en 'actif' ou la renvoyer au backlog. La règle des 3 actives
// est vérifiée ici, en plus de l'être dans l'interface : on ne s'appuie pas sur
// le seul écran pour tenir une règle métier.
export async function changerStatutTache(tache, statut) {
  if (statut === 'actif') {
    const actives = await tachesActives({ projet: tache.projet });
    const dejaActive = actives.some((candidate) => candidate.id === tache.id);
    if (!dejaActive && actives.length >= MAX_TACHES_ACTIVES) {
      throw new Error(
        `Déjà ${MAX_TACHES_ACTIVES} tâches actives sur ce projet. ` +
          'Termines-en une, ou renvoie-la au backlog.',
      );
    }
  }

  return verifier(
    await client.from('taches').update({ statut }).eq('id', tache.id).select().single(),
  );
}

// --- Création ---------------------------------------------------------------
// 'perso' n'apparaît volontairement pas dans les tâches ni les jalons : l'espace
// perso n'en a pas, et l'interface ne doit pas permettre d'en créer.

export async function creerObjectif({ projet, titre, pourquoi = null, cible = null, echeance = null }) {
  return verifier(
    await client
      .from('objectifs')
      .insert({ projet, titre, pourquoi, cible, echeance })
      .select('*, jalons(id, titre, echeance, atteint, date_atteint, ordre)')
      .single(),
  );
}

export async function creerJalon({ objectif_id, titre, echeance = null, ordre = null }) {
  return verifier(
    await client
      .from('jalons')
      .insert({ objectif_id, titre, echeance, ordre })
      .select()
      .single(),
  );
}

// `priorite` vaut 4 par défaut, comme en base : une tâche n'est pas prioritaire
// parce qu'elle existe.
export async function creerTache({
  projet,
  titre,
  statut = 'backlog',
  echeance = null,
  heure = null,
  priorite = 4,
  objectif_id = null,
}) {
  return verifier(
    await client
      .from('taches')
      .insert({ projet, titre, statut, echeance, heure, priorite, objectif_id })
      .select()
      .single(),
  );
}

export async function creerEvenement({
  projet,
  titre,
  date_debut,
  date_fin = null,
  lieu = null,
  notes = null,
  recurrence = null,
  recurrence_fin = null,
}) {
  return verifier(
    await client
      .from('evenements')
      .insert({ projet, titre, date_debut, date_fin, lieu, notes, recurrence, recurrence_fin })
      .select()
      .single(),
  );
}

// --- Publications (calendrier éditorial Yuno) --------------------------------
// Une idée est une publication sans date : même table, deux vues.

export async function publicationsToutes(projet) {
  let requete = client
    .from('publications')
    .select('*')
    .order('date_prevue', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (projet) requete = requete.eq('projet', projet);
  return verifier(await requete);
}

// Les publications planifiées d'une période, pour « Ta semaine » du dashboard.
// Les publiées n'y figurent plus : c'est fait, le dashboard montre l'à-venir.
export async function publicationsEntre(debutISO, finISO, { projet = null } = {}) {
  let requete = client
    .from('publications')
    .select('*')
    .not('date_prevue', 'is', null)
    .gte('date_prevue', debutISO)
    .lte('date_prevue', finISO)
    .neq('statut', 'publie')
    .order('date_prevue');

  if (projet) requete = requete.eq('projet', projet);
  return verifier(await requete);
}

// pilier, preuve et pourquoi_moi sont propres à Yuno : le FCH les laisse vides.
export async function creerPublication({
  projet,
  titre,
  reseau = 'instagram',
  format = 'post',
  rubrique = null,
  notes = null,
  date_prevue = null,
  heure = null,
  pilier = null,
  preuve = null,
  pourquoi_moi = null,
}) {
  return verifier(
    await client
      .from('publications')
      .insert({
        projet, titre, reseau, format, rubrique, notes,
        date_prevue, heure, pilier, preuve, pourquoi_moi,
      })
      .select()
      .single(),
  );
}

export async function modifierPublication(id, champs) {
  return verifier(
    await client.from('publications').update(champs).eq('id', id).select().single(),
  );
}

export async function supprimerPublication(id) {
  const { error } = await client.from('publications').delete().eq('id', id);
  if (error) throw error;
}

// --- Le Carnet de terrain (Yuno) ---------------------------------------------
// Les moments vécus : matchs couverts, concerts, sorties. Les compteurs de
// l'accueil s'en déduisent — rien n'est stocké, des faits accumulés ne peuvent
// que monter.

export async function momentsTous() {
  return verifier(
    await client
      .from('moments')
      .select('*, rencontres(id, nom, contact_id)')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false }),
  );
}

// Loguer un moment crée sa victoire : dans ce système, une victoire EST un
// moment vécu. Elle remonte au dashboard du hub, au même rang que les autres.
// Le titre est fabriqué par l'appelant : le vocabulaire appartient à l'écran.
export async function creerMoment({ moment, rencontres = [], titre }) {
  const cree = verifier(
    await client.from('moments').insert(moment).select().single(),
  );

  const lignes = rencontres.length
    ? verifier(
        await client
          .from('rencontres')
          .insert(
            rencontres.map(({ nom, contact_id = null }) => ({
              moment_id: cree.id,
              nom,
              contact_id,
            })),
          )
          .select(),
      )
    : [];

  const victoire = await ajouterVictoire({
    projet: 'photo',
    titre,
    source: 'moment',
    source_id: cree.id,
  });

  return { moment: { ...cree, rencontres: lignes }, victoire };
}

// --- Les photos des moments --------------------------------------------------
// Le bucket est PRIVÉ : ce sont ses photos, et le site est public. On n'y
// accède que par une URL signée, fabriquée à la lecture pour une session
// connectée — jamais par un lien qu'on pourrait recopier ailleurs.

// Le côté long visé, et la qualité JPEG. Mesuré sur les photos de Noé
// (2160 × 2880, 5,3 Mo) : à 2400/85 le fichier tombe à ~820 Ko, sept fois plus
// léger, et rien ne se voit. La marge est large — la photo n'est jamais
// affichée à plus de 1158 × 900, même sur un écran qui dessine trois pixels par
// point. Le décider ici et nulle part ailleurs.
export const COTE_LONG_PHOTO = 2400;
export const QUALITE_PHOTO = 0.85;

// Redimensionne avant l'envoi. Une photo de 5 Mo n'a aucune raison d'entrer
// dans le bucket : c'est le poste le plus lourd du site, très loin devant tout
// le reste. L'original n'est pas conservé (choix de Noé, 12 août 2026) — le hub
// n'est pas son archive, ses fichiers de boîtier restent chez lui.
//
// Trois précautions :
//   — `imageOrientation: 'from-image'` applique la rotation EXIF. Sans elle,
//     une photo prise en portrait au téléphone repartirait couchée ;
//   — une image déjà sous la barre n'est pas ré-encodée : la recompresser lui
//     ferait perdre de la qualité pour rien ;
//   — si le décodage échoue (un HEIC que le navigateur ne sait pas lire), on
//     renvoie le fichier d'origine. Mieux vaut une photo lourde que pas de
//     photo.
export async function reduirePourLeCarnet(fichier) {
  if (!fichier.type.startsWith('image/')) return fichier;

  let bitmap;
  try {
    bitmap = await createImageBitmap(fichier, { imageOrientation: 'from-image' });
  } catch {
    return fichier;
  }

  const cote = Math.max(bitmap.width, bitmap.height);
  if (cote <= COTE_LONG_PHOTO) {
    bitmap.close?.();
    return fichier;
  }

  const echelle = COTE_LONG_PHOTO / cote;
  const toile = document.createElement('canvas');
  toile.width = Math.round(bitmap.width * echelle);
  toile.height = Math.round(bitmap.height * echelle);
  toile.getContext('2d').drawImage(bitmap, 0, 0, toile.width, toile.height);
  bitmap.close?.();

  const reduite = await new Promise((donner) =>
    toile.toBlob(donner, 'image/jpeg', QUALITE_PHOTO),
  );
  // Un encodage qui échoue, ou qui rend plus lourd que l'original : on garde
  // l'original. La réduction est une optimisation, pas une obligation.
  if (!reduite || reduite.size >= fichier.size) return fichier;

  return new File([reduite], fichier.name.replace(/\.[^.]+$/, '') + '.jpg', {
    type: 'image/jpeg',
  });
}

export async function televerserPhotoMoment(fichier) {
  const photo = await reduirePourLeCarnet(fichier);
  const extension = photo.name.split('.').pop()?.toLowerCase() || 'jpg';
  const chemin = `${crypto.randomUUID()}.${extension}`;

  const { error } = await client.storage
    .from('moments')
    .upload(chemin, photo, { contentType: photo.type || undefined });
  if (error) throw error;

  return chemin;
}

// Une signature d'une heure : le temps d'une visite, pas davantage.
export async function urlsDesPhotos(chemins) {
  if (!chemins.length) return {};

  const { data, error } = await client.storage.from('moments').createSignedUrls(chemins, 3600);
  if (error) throw error;

  return Object.fromEntries(
    data.filter((entree) => entree.signedUrl).map((entree) => [entree.path, entree.signedUrl]),
  );
}

// Corriger un moment déjà logué : la date, le type, le lieu, la note, la case
// « œuvre finie ». Ni la photo ni les rencontres — l'une vit dans le stockage,
// les autres dans leur propre table ; elles demandent chacune leur geste.
// Le titre de la victoire est le reflet du moment : il suit, sinon le dashboard
// du hub garderait l'ancien nom pour toujours.
export async function modifierMoment(id, champs, titre) {
  const modifie = verifier(
    await client.from('moments').update(champs).eq('id', id).select().single(),
  );

  const { error } = await client
    .from('victoires')
    .update({ titre, date: champs.date })
    .eq('source', 'moment')
    .eq('source_id', id);
  if (error) console.error('Victoire du moment non mise à jour', error);

  return modifie;
}

// Effacer un seul fichier du stockage, sans toucher au moment. Sert quand une
// photo en remplace une autre : l'ancienne n'est plus référencée par personne.
export async function supprimerPhotoMoment(chemin) {
  const { error } = await client.storage.from('moments').remove([chemin]);
  if (error) console.error('Ancienne photo non supprimée du stockage', error);
}

export async function supprimerMoment(id, chemin = null) {
  // La photo part avec son moment : personne d'autre ne s'en sert.
  if (chemin) {
    const { error } = await client.storage.from('moments').remove([chemin]);
    if (error) console.error('Photo non supprimée du stockage', error);
  }

  return supprimerLigneMoment(id);
}

async function supprimerLigneMoment(id) {
  // La victoire d'un moment n'est que son reflet au dashboard : elle part avec
  // lui. Les rencontres suivent d'elles-mêmes (ON DELETE CASCADE).
  const { error: erreurVictoire } = await client
    .from('victoires')
    .delete()
    .eq('source', 'moment')
    .eq('source_id', id);
  if (erreurVictoire) throw erreurVictoire;

  const { error } = await client.from('moments').delete().eq('id', id);
  if (error) throw error;
}

// Une rencontre notée au vol devient une fiche du carnet : la photo est un pont
// vers les gens, encore faut-il que le pont mène quelque part.
export async function ouvrirFichePourRencontre(rencontre) {
  const contact = await creerContact({
    nom: rencontre.nom,
    // Ils se sont vus en vrai : le contact est établi, ce n'est pas un envoi
    // à froid. Le reste de la fiche se complète dans Réseau.
    statut: 'contact_etabli',
    dernier_echange: versDateISO(),
  });

  const liee = verifier(
    await client
      .from('rencontres')
      .update({ contact_id: contact.id })
      .eq('id', rencontre.id)
      .select()
      .single(),
  );

  return { contact, rencontre: liee };
}

// --- Carnet réseau (Yuno) ----------------------------------------------------

export async function contactsTous() {
  return verifier(await client.from('contacts').select('*').order('nom'));
}

export async function creerContact(champs) {
  return verifier(await client.from('contacts').insert(champs).select().single());
}

export async function modifierContact(id, champs) {
  return verifier(
    await client.from('contacts').update(champs).eq('id', id).select().single(),
  );
}

export async function supprimerContact(id) {
  const { error } = await client.from('contacts').delete().eq('id', id);
  if (error) throw error;
}

// --- La Passerelle (Yuno) ----------------------------------------------------
// L'aller-vers se muscle par micro-doses. On mesure ce que Noé contrôle — ce
// qu'il envoie — et jamais ce qu'il subit : cette table n'a pas de colonne
// « répondu », et aucune fonction d'ici ne compte un silence.

export async function envoisTous() {
  return verifier(
    await client.from('journal_envois').select('*').order('date', { ascending: false }),
  );
}

// Un envoi de plus : une ligne au journal, et la fiche qui se met à jour. Le
// statut est décidé par l'appelant — la progression d'une relation est une
// règle d'écran, pas de base.
export async function enregistrerEnvoi({ contact, statut }) {
  const date = versDateISO();

  const envoi = verifier(
    await client
      .from('journal_envois')
      .insert({ contact_id: contact.id, date })
      .select()
      .single(),
  );

  const misAJour = await modifierContact(contact.id, { statut, date_dernier_envoi: date });
  return { envoi, contact: misAJour };
}

// --- Le rendez-vous stats (Yuno) ---------------------------------------------
// Les chiffres des réseaux ne vivent QUE là. Ils ne se lisent pas ailleurs dans
// le site, et rien d'autre n'appelle ces deux fonctions : la surveillance
// devient un rituel hebdomadaire au lieu d'un réflexe.

export async function statsHebdoTous() {
  return verifier(await client.from('stats_hebdo').select('*').order('date'));
}

export async function enregistrerStats({ date, abonnes, reach, top_post, reponse_rituelle }) {
  return verifier(
    await client
      .from('stats_hebdo')
      .upsert({ date, abonnes, reach, top_post, reponse_rituelle }, { onConflict: 'date' })
      .select()
      .single(),
  );
}

// --- Les modèles de messages (Yuno) ------------------------------------------
// La friction du premier message est le principal mur de l'aller-vers : un
// modèle à personnaliser abaisse le coût d'entrée de chaque envoi.

export async function modelesTous() {
  return verifier(
    await client
      .from('modeles_messages')
      .select('*')
      .order('ordre', { nullsFirst: false })
      .order('created_at'),
  );
}

export async function creerModele(champs) {
  return verifier(
    await client.from('modeles_messages').insert(champs).select().single(),
  );
}

export async function modifierModele(id, champs) {
  return verifier(
    await client.from('modeles_messages').update(champs).eq('id', id).select().single(),
  );
}

export async function supprimerModele(id) {
  const { error } = await client.from('modeles_messages').delete().eq('id', id);
  if (error) throw error;
}

// --- Commandes (Yuno) --------------------------------------------------------

export async function commandesToutes() {
  return verifier(
    await client
      .from('commandes')
      .select('*')
      .order('echeance', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false }),
  );
}

export async function creerCommande(champs) {
  return verifier(await client.from('commandes').insert(champs).select().single());
}

export async function modifierCommande(id, champs) {
  return verifier(
    await client.from('commandes').update(champs).eq('id', id).select().single(),
  );
}

export async function supprimerCommande(id) {
  const { error } = await client.from('commandes').delete().eq('id', id);
  if (error) throw error;
}

// Faire avancer une commande d'un cran. Le cycle appartient à l'écran ; ce
// qu'on sait ici, c'est que livrer crée une victoire, comme une tâche terminée
// ou un jalon atteint (docs/yuno-spec.md, §4). Encaisser n'en crée pas une
// seconde : c'est le même travail, et l'argent est une conséquence, pas un juge.
export async function avancerCommande(commande, suivant) {
  const misAJour = await modifierCommande(commande.id, { statut: suivant });

  const victoire =
    suivant === 'livree'
      ? await ajouterVictoire({
          projet: 'photo',
          titre: `Commande livrée — ${misAJour.titre}`,
          source: 'manuel',
        })
      : null;

  return { commande: misAJour, victoire };
}

// --- Les préparations (Yuno) -------------------------------------------------
// La feuille d'une sortie : trois phases de cases à cocher (avant, pendant,
// après), copiées d'un modèle à la création — modifier le modèle ensuite ne
// réécrit pas les feuilles passées. Le bilan (deux questions) vit sur la
// feuille. Rien ici ne compte les manqués : un item non coché n'est pas un
// raté, et aucune fonction ne le mesure.

// L'ordre des items est décidé ici, en JS, plutôt que par un `order` sur la
// table imbriquée : une option d'ordre mal nommée ne renvoie pas d'erreur, elle
// est ignorée en silence — même piège que les transformations d'images.
function trierItemsPreparation(items = []) {
  return [...items].sort(
    (a, b) =>
      (a.ordre ?? Number.MAX_SAFE_INTEGER) - (b.ordre ?? Number.MAX_SAFE_INTEGER) ||
      String(a.created_at).localeCompare(String(b.created_at)),
  );
}

export async function modelesPreparationTous() {
  const modeles = verifier(
    await client
      .from('modeles_preparation')
      .select('*, items:modeles_preparation_items(id, phase, texte, ordre, created_at)')
      .order('created_at'),
  );
  return modeles.map((modele) => ({ ...modele, items: trierItemsPreparation(modele.items) }));
}

export async function preparationsToutes() {
  const feuilles = verifier(
    await client
      .from('preparations')
      .select('*, items:preparations_items(id, phase, texte, fait, ordre, created_at)')
      .order('date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false }),
  );
  return feuilles.map((feuille) => ({ ...feuille, items: trierItemsPreparation(feuille.items) }));
}

// Créer une feuille, c'est COPIER le modèle : la feuille doit se relire telle
// qu'elle a été préparée, même si le modèle change après. Titre et date sont
// copiés de l'événement pour la même raison.
export async function creerPreparation({
  modele = null,
  evenement_id = null,
  commande_id = null,
  titre,
  date = null,
}) {
  const feuille = verifier(
    await client
      .from('preparations')
      .insert({ modele_id: modele?.id ?? null, evenement_id, commande_id, titre, date })
      .select()
      .single(),
  );

  const aCopier = (modele?.items ?? []).map(({ phase, texte, ordre }) => ({
    preparation_id: feuille.id,
    phase,
    texte,
    ordre,
  }));
  const items = aCopier.length
    ? verifier(await client.from('preparations_items').insert(aCopier).select())
    : [];

  return { ...feuille, items: trierItemsPreparation(items) };
}

export async function modifierItemPreparation(id, champs) {
  return verifier(
    await client.from('preparations_items').update(champs).eq('id', id).select().single(),
  );
}

export async function ajouterItemPreparation({ preparation_id, phase, texte, ordre = null }) {
  return verifier(
    await client
      .from('preparations_items')
      .insert({ preparation_id, phase, texte, ordre })
      .select()
      .single(),
  );
}

export async function supprimerItemPreparation(id) {
  const { error } = await client.from('preparations_items').delete().eq('id', id);
  if (error) throw error;
}

// Le bilan s'écrit (et se réécrit) d'un coup : deux questions, une date. Pas de
// victoire ici — la victoire d'une sortie, c'est le moment logué au carnet.
export async function noterBilan(id, { bilan_bien = null, bilan_mieux = null }) {
  return verifier(
    await client
      .from('preparations')
      .update({ bilan_bien, bilan_mieux, bilan_date: versDateISO() })
      .eq('id', id)
      .select()
      .single(),
  );
}

export async function supprimerPreparation(id) {
  // Les items partent avec la feuille (ON DELETE CASCADE).
  const { error } = await client.from('preparations').delete().eq('id', id);
  if (error) throw error;
}

// --- Le calendrier : tout ce qui porte une date ------------------------------
// Règle commune : on montre ce qui reste à vivre ou à faire. Un événement passé
// est passé ; une tâche ou une publication en retard de date reste affichée
// (sobrement — jamais en alerte) tant qu'elle n'est pas faite.

// Le calendrier en grille se promène dans le passé comme dans l'avenir : il lui
// faut tout, pas seulement ce qui reste à vivre. C'est ce qui distingue une
// grille d'une liste de rappels — et sans ça, un événement posé sur aujourd'hui
// à minuit disparaissait au rechargement.
export async function evenementsTous({ projet = null } = {}) {
  let requete = client.from('evenements').select('*').order('date_debut');
  if (projet) requete = requete.eq('projet', projet);
  return verifier(await requete);
}

export async function evenementsDepuis(debutISO, { projet = null } = {}) {
  let requete = client
    .from('evenements')
    .select('*')
    .gte('date_debut', debutISO)
    .order('date_debut');

  if (projet) requete = requete.eq('projet', projet);
  return verifier(await requete);
}

// Les tâches faites RESTENT au calendrier, barrées : ce site ne fait jamais
// disparaître ce qui a été accompli. C'est aussi ce qui permet de décocher une
// tâche cochée par erreur.
export async function tachesDatees({ projet = null } = {}) {
  let requete = client
    .from('taches')
    .select('*')
    .not('echeance', 'is', null)
    .order('echeance');

  if (projet) requete = requete.eq('projet', projet);
  return verifier(await requete);
}

export async function publicationsDatees({ projet = null } = {}) {
  let requete = client
    .from('publications')
    .select('*')
    .not('date_prevue', 'is', null)
    .neq('statut', 'publie')
    .order('date_prevue');

  if (projet) requete = requete.eq('projet', projet);
  return verifier(await requete);
}

// --- Modification et suppression --------------------------------------------
// Les objectifs sont les seuls à se modifier vraiment : leur « pourquoi », leur
// cible et leur échéance évoluent avec le temps. Une tâche ou un événement mal
// écrit se supprime et se recrée en cinq secondes — pas besoin d'un écran de
// plus pour ça.

export async function modifierObjectif(id, champs) {
  return verifier(
    await client.from('objectifs').update(champs).eq('id', id).select().single(),
  );
}

export async function supprimerObjectif(id) {
  // Les jalons partent avec lui (ON DELETE CASCADE) ; les tâches liées sont
  // conservées, simplement détachées (ON DELETE SET NULL).
  const { error } = await client.from('objectifs').delete().eq('id', id);
  if (error) throw error;
}

export async function supprimerTache(id) {
  const { error } = await client.from('taches').delete().eq('id', id);
  if (error) throw error;
}

export async function supprimerEvenement(id) {
  const { error } = await client.from('evenements').delete().eq('id', id);
  if (error) throw error;
}

export async function supprimerJalon(id) {
  const { error } = await client.from('jalons').delete().eq('id', id);
  if (error) throw error;
}

// Depuis le calendrier, tout ce qui porte une date se corrige sur place : une
// date mal posée se répare, elle ne se supprime pas pour se recréer.

export async function modifierEvenement(id, champs) {
  return verifier(
    await client.from('evenements').update(champs).eq('id', id).select().single(),
  );
}

export async function modifierTache(id, champs) {
  return verifier(await client.from('taches').update(champs).eq('id', id).select().single());
}

export async function modifierJalon(id, champs) {
  return verifier(await client.from('jalons').update(champs).eq('id', id).select().single());
}

// Atteindre un objectif crée sa victoire — le troisième et dernier automatisme
// du CLAUDE.md, après la tâche terminée et le jalon atteint.
export async function atteindreObjectif(objectif) {
  const atteint = verifier(
    await client
      .from('objectifs')
      .update({ statut: 'atteint', date_atteint: new Date().toISOString().slice(0, 10) })
      .eq('id', objectif.id)
      .select()
      .single(),
  );

  const victoire = await ajouterVictoire({
    projet: atteint.projet,
    titre: atteint.titre,
    source: 'objectif',
    source_id: atteint.id,
  });

  return { objectif: atteint, victoire };
}

// Atteindre un jalon crée sa victoire, comme pour une tâche terminée.
export async function atteindreJalon(jalon, projet) {
  const atteint = verifier(
    await client
      .from('jalons')
      .update({ atteint: true, date_atteint: new Date().toISOString().slice(0, 10) })
      .eq('id', jalon.id)
      .select()
      .single(),
  );

  const victoire = await ajouterVictoire({
    projet,
    titre: atteint.titre,
    source: 'jalon',
    source_id: atteint.id,
  });

  return { jalon: atteint, victoire };
}
