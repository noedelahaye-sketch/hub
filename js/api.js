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
import { versDateISO, depuisDateISO, ajouterJours, occurrencesEntre } from './format.js';

// URL de l'espace et clé publique (anon) : ces deux valeurs sont publiques par
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

// Toute ligne qui appartient à une série repart avec la règle de celle-ci : les
// écrans continuent de lire `tache.recurrence` sans savoir que la règle vit
// désormais dans `series`. Une seule porte, plutôt que trente lectures à
// habiller une par une. Voir « Les séries », plus bas.
function verifier({ data, error }) {
  if (error) throw error;
  if (Array.isArray(data)) return data.map(garnirUne);
  return data && typeof data === 'object' ? garnirUne(data) : data;
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

// Victoires — tous espaces confondus, perso au même rang que le reste.

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
export async function victoiresDeLEspace(espace, limite = 10, { sauf = null } = {}) {
  let requete = client.from('victoires').select('*').eq('espace', espace);
  if (sauf) requete = requete.neq('source', sauf);

  return verifier(
    await requete
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limite),
  );
}

// TOUTES les victoires, pour « Le chemin » (28 août 2026). Sans limite : c'est
// la seule page dont l'objet est de tout montrer, et le fil s'arrête de lui-même
// à la première — il n'y en aura jamais des milliers.
export async function victoiresToutes() {
  return verifier(
    await client
      .from('victoires')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false }),
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

// Même règle pour un jalon sur lequel on revient : la galerie du cap permet de
// le décocher, et une victoire pour une marche qu'on n'a pas franchie serait
// fausse. (Le geste n'existait pas avant le 27 août 2026 : la page d'avant ne
// savait que marquer atteint.)
export async function supprimerVictoireDuJalon(jalonId) {
  const { error } = await client
    .from('victoires')
    .delete()
    .eq('source', 'jalon')
    .eq('source_id', jalonId);
  if (error) throw error;
}

export async function ajouterVictoire({ espace, titre, source = 'manuel', source_id = null }) {
  return verifier(
    await client
      .from('victoires')
      .insert({ espace, titre, source, source_id })
      .select()
      .single(),
  );
}

// Objectifs — avec leurs jalons, la progression se calcule côté client.

export async function objectifsActifs({ espace = null } = {}) {
  let requete = client
    .from('objectifs')
    .select('*, jalons(id, titre, echeance, atteint, date_atteint, ordre)')
    .eq('statut', 'actif')
    .order('echeance', { nullsFirst: false })
    .order('ordre', { referencedTable: 'jalons' });

  if (espace) requete = requete.eq('espace', espace);
  return verifier(await requete);
}

// Événements — bornes en ISO complet, `date_debut` étant un timestamptz.

export async function evenementsEntre(debutISO, finISO, { espace = null } = {}) {
  let requete = client
    .from('evenements')
    .select('*')
    .gte('date_debut', debutISO)
    .lte('date_debut', finISO)
    .order('date_debut');

  if (espace) requete = requete.eq('espace', espace);
  return verifier(await requete);
}

// Tâches.

export async function tachesActives({ espace = null } = {}) {
  let requete = client
    .from('taches')
    .select('*')
    .eq('statut', 'actif')
    .order('echeance', { nullsFirst: false })
    .order('created_at');

  if (espace) requete = requete.eq('espace', espace);
  return verifier(await requete);
}

// Les tâches datées jusqu'à `finISO`, celles déjà faites mises de côté. Sans
// borne basse : une échéance passée reste visible plutôt que de disparaître.
export async function tachesEcheanceJusqua(finISO, { espace = null } = {}) {
  let requete = client
    .from('taches')
    .select('*')
    .neq('statut', 'fait')
    .not('echeance', 'is', null)
    .lte('echeance', finISO)
    .order('echeance');

  if (espace) requete = requete.eq('espace', espace);
  return verifier(await requete);
}

// TOUTES les tâches, sans exception : datées ou non, faites ou non, tous
// espaces. C'est la seule lecture du hub qui ne cache rien — l'espace Tâches
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

// Toutes les tâches en cours d'un espace, actives et backlog confondus. L'ordre
// met les actives d'abord, puis les plus anciennes du backlog.
// Toutes les tâches d'un espace, faites comprises : une page qui compte ce qui
// a été accompli a besoin des faites, que `tachesEnCours` écarte par nature.
export async function tachesDeLEspace(espace) {
  return verifier(
    await client
      .from('taches')
      .select('*')
      .eq('espace', espace)
      .order('statut')
      .order('echeance', { nullsFirst: false })
      .order('created_at'),
  );
}

export async function tachesEnCours(espace) {
  return verifier(
    await client
      .from('taches')
      .select('*')
      .eq('espace', espace)
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
  // Une tâche répétée se termine désormais comme les autres (27 août 2026).
  // Avant, elle n'avait qu'une ligne : la cocher faisait GLISSER son échéance,
  // faute de quoi « Courir » aurait été fait à jamais après une seule course.
  // Chaque occurrence est maintenant une ligne à elle — celle du jour se coche,
  // celle de la semaine prochaine attend son tour, et la série garde la trace
  // de ce qui a été fait.
  const faite = verifier(
    await client
      .from('taches')
      .update({ statut: 'fait', date_fait: new Date().toISOString() })
      .eq('id', tache.id)
      .select()
      .single(),
  );

  // LA TÂCHE EST LE GESTE, `oeuvre_finie` EST L'ÉTAT (29 août 2026). Cocher
  // « Trier les photos de Clermont – Sochaux » pose l'état sur la sortie —
  // exactement comme terminer une tâche écrit sa victoire. Sans ce lien, le
  // Carnet de terrain et l'accueil suivraient la même chose chacun de son côté
  // et finiraient par se contredire.
  //
  // Chez Yuno seulement : `oeuvre_finie` appartient à la face vécue d'une
  // sortie, et l'écrire sur une séance du club mettrait des données du FCH dans
  // une colonne qui n'est pas la sienne. Son échec ne rouvre pas la tâche —
  // elle est faite — mais il remonte.
  if (faite.origine === 'tri' && faite.evenement_id && faite.espace === 'photo') {
    await modifierEvenement(faite.evenement_id, { oeuvre_finie: true });
  }

  const victoire = await ajouterVictoire({
    espace: faite.espace,
    titre: faite.titre,
    source: 'tache',
    source_id: faite.id,
  });

  return { tache: garnirUne(faite), victoire };
}

// Défaire une tâche terminée : elle redevient active et perd sa date. La règle
// des 3 actives n'est pas revérifiée ici, volontairement — la tâche était active
// il y a quelques secondes, on la remet exactement où elle était.
export async function rouvrirTache(tache) {
  // Rien de particulier pour une occurrence de série : elle se rouvre comme
  // n'importe quelle tâche, à sa place dans la semaine.
  return garnirUne(
    verifier(
      await client
        .from('taches')
        .update({ statut: 'actif', date_fait: null })
        .eq('id', tache.id)
        .select()
        .single(),
    ),
  );
}

// Passer une tâche en 'actif' ou la renvoyer au backlog. La règle des 3 actives
// est vérifiée ici, en plus de l'être dans l'interface : on ne s'appuie pas sur
// le seul écran pour tenir une règle métier.
export async function changerStatutTache(tache, statut) {
  if (statut === 'actif') {
    const actives = await tachesActives({ espace: tache.espace });
    const dejaActive = actives.some((candidate) => candidate.id === tache.id);
    if (!dejaActive && actives.length >= MAX_TACHES_ACTIVES) {
      throw new Error(
        `Déjà ${MAX_TACHES_ACTIVES} tâches actives sur cet espace. ` +
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

export async function creerObjectif({ espace, titre, pourquoi = null, cible = null, echeance = null }) {
  return verifier(
    await client
      .from('objectifs')
      .insert({ espace, titre, pourquoi, cible, echeance })
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

// --- Le rendez-vous du dimanche -----------------------------------------------
//
// Une ligne par semaine validée, identifiée par son lundi. Sans cette trace, le
// rendez-vous reviendrait à chaque ouverture — et un rituel qui redemande ce
// qu'on vient de lui donner cesse très vite d'être un rituel.

export async function semainesValidees() {
  return verifier(await client.from('semaines').select('*').order('debut', { ascending: false }));
}

export async function validerLaSemaine(debut, notes = null) {
  return verifier(
    await client.from('semaines').upsert({ debut, notes }, { onConflict: 'debut' }).select().single(),
  );
}

// --- La disposition des blocs d'une semaine -----------------------------------
//
// LES BLOCS SE GARDENT D'UNE VISITE À L'AUTRE (1er septembre 2026, demande de
// Noé). Ce qui est enregistré, c'est ce qu'il a ARRANGÉ — jamais ce que
// l'algorithme a calculé : tant qu'il n'a rien touché, il n'y a pas de ligne et
// le hub propose. « Reproposer les blocs » efface la ligne, et c'est exactement
// ce que ce bouton veut dire.

export async function blocsGardes(debut) {
  const lignes = verifier(
    await client.from('semaines_blocs').select('blocs').eq('debut', debut).limit(1),
  );
  return lignes[0]?.blocs ?? null;
}

export async function garderLesBlocs(debut, blocs) {
  return verifier(
    await client
      .from('semaines_blocs')
      .upsert({ debut, blocs, posee_le: new Date().toISOString() }, { onConflict: 'debut' })
      .select()
      .single(),
  );
}

export async function oublierLesBlocs(debut) {
  return verifier(await client.from('semaines_blocs').delete().eq('debut', debut).select());
}

// --- Les arbitrages : ce que Noé a tranché ------------------------------------
//
// Le hub pose la question, Noé tranche. Sans trace, il la reposerait le
// dimanche suivant — et une question qu'on repose après y avoir répondu n'est
// plus une question.

export async function arbitragesTous() {
  return verifier(
    await client.from('arbitrages').select('*').order('created_at', { ascending: false }),
  );
}

export async function trancher({
  cle,
  question,
  portee_debut,
  portee_fin,
  reponse,
  espace_retenu = null,
  espace_cede = null,
}) {
  return verifier(
    await client
      .from('arbitrages')
      .insert({ cle, question, portee_debut, portee_fin, reponse, espace_retenu, espace_cede })
      .select()
      .single(),
  );
}

// Revenir sur un arbitrage : la question redevient posable. C'est la seule
// façon de changer d'avis sans que le hub fasse comme si de rien n'était.
export async function rouvrirArbitrage(id) {
  const { error } = await client.from('arbitrages').delete().eq('id', id);
  if (error) throw error;
}

// --- Les périodes : l'arbitrage en amont --------------------------------------
//
// Une période dit ce qu'on attend d'un mois, espace par espace. Sa vraie
// fonction n'est pas de régler des chiffres : déclarer une période, c'est déjà
// arbitrer — et le hub le dit AU MOMENT OÙ ON L'ÉCRIT, trois semaines avant le
// mur. Le calcul vit dans js/orientation.js, qui ne touche à rien.

export async function periodesToutes() {
  return verifier(await client.from('periodes').select('*').order('debut'));
}

export async function creerPeriode({ nom, debut, fin, regimes = {}, notes = null }) {
  return verifier(
    await client.from('periodes').insert({ nom, debut, fin, regimes, notes }).select().single(),
  );
}

export async function modifierPeriode(id, champs) {
  return verifier(await client.from('periodes').update(champs).eq('id', id).select().single());
}

export async function supprimerPeriode(id) {
  const { error } = await client.from('periodes').delete().eq('id', id);
  if (error) throw error;
}

// --- Les projets : le comment d'un cap ---------------------------------------
//
// L'étage entre le jalon et la tâche (27 août 2026). Il existe parce qu'UNE
// tâche sur trente-six était rattachée à un objectif : « trier les photos U15 »
// ne sert pas directement « 1 000 abonnés », elle sert l'album du club.
//
// Un projet ne calcule AUCUNE progression — celle d'un objectif reste
// « jalons atteints / jalons totaux ». Il porte la CHARGE, et il oriente.

export async function projetsTous() {
  return verifier(
    await client
      .from('projets')
      .select('*, cibles:projets_cibles(id, objectif_id, jalon_id), etapes:projets_etapes(id, titre, ordre, atteint, date_atteint)')
      .order('espace')
      .order('nom')
      .order('ordre', { referencedTable: 'projets_etapes' }),
  );
}

export async function projetsDeLEspace(espace) {
  return verifier(
    await client
      .from('projets')
      .select('*, cibles:projets_cibles(id, objectif_id, jalon_id), etapes:projets_etapes(id, titre, ordre, atteint, date_atteint)')
      .eq('espace', espace)
      .order('nom')
      .order('ordre', { referencedTable: 'projets_etapes' }),
  );
}

export async function creerProjet({
  espace,
  nom,
  resultat = null,
  charge_minutes = null,
  charge_hebdo = null,
  echeance = null,
  statut = 'actif',
}) {
  return verifier(
    await client
      .from('projets')
      .insert({ espace, nom, resultat, charge_minutes, charge_hebdo, echeance, statut })
      .select('*, cibles:projets_cibles(id, objectif_id, jalon_id), etapes:projets_etapes(id, titre, ordre, atteint, date_atteint)')
      .single(),
  );
}

export async function modifierProjet(id, champs) {
  return verifier(
    await client
      .from('projets')
      .update(champs)
      .eq('id', id)
      .select('*, cibles:projets_cibles(id, objectif_id, jalon_id), etapes:projets_etapes(id, titre, ordre, atteint, date_atteint)')
      .single(),
  );
}

// Supprimer un projet ne supprime rien d'autre : ses tâches perdent leur
// rattachement (ON DELETE SET NULL) et restent à faire. Un projet abandonné
// n'annule pas le travail déjà écrit.
export async function supprimerProjet(id) {
  const { error } = await client.from('projets').delete().eq('id', id);
  if (error) throw error;
}

export async function lierProjet(projet_id, { objectif_id = null, jalon_id = null }) {
  return verifier(
    await client
      .from('projets_cibles')
      .insert({ projet_id, objectif_id, jalon_id })
      .select()
      .single(),
  );
}

export async function delierProjet(id) {
  const { error } = await client.from('projets_cibles').delete().eq('id', id);
  if (error) throw error;
}

// --- La page du jour ---------------------------------------------------------
//
// ELLE SE CONSTRUIT TOUTE SEULE : le hub connaît déjà tout ce qu'elle montre.
// Une seule requête par table, pour le seul jour demandé — la page s'ouvre
// exprès, elle n'a pas à précharger trois mois.

export async function journeeDe(jourISO) {
  const debut = `${jourISO}T00:00:00`;
  const fin = `${jourISO}T23:59:59`;

  const [mot, humeur, taches, evenements, victoires, faits, seances] = await Promise.all([
    verifier(await client.from('journees').select('mot').eq('jour', jourISO).maybeSingle()),
    verifier(await client.from('humeur').select('*').eq('date', jourISO).maybeSingle()),
    // Les tâches TERMINÉES ce jour-là, pas celles qui y étaient dues : la page
    // regarde en arrière, elle ne redresse pas les comptes.
    verifier(
      await client
        .from('taches')
        .select('id, titre, espace, date_fait, duree')
        .gte('date_fait', debut)
        .lte('date_fait', fin),
    ),
    verifier(
      await client
        .from('evenements')
        .select('id, titre, espace, date_debut, lieu, famille')
        .gte('date_debut', debut)
        .lte('date_debut', fin),
    ),
    verifier(await client.from('victoires').select('*').eq('date', jourISO)),
    verifier(
      await client
        .from('habitudes_faits')
        .select('habitude_id, jour')
        .eq('jour', jourISO),
    ),
    verifier(
      await client
        .from('livres_seances')
        .select('id, livre_id, pages, jour')
        .eq('jour', jourISO),
    ),
  ]);

  return { mot: mot?.mot ?? null, humeur, taches, evenements, victoires, faits, seances };
}

// La ligne libre. `upsert` sur la clé du jour : on écrit et on réécrit sans
// avoir à savoir si la journée existait déjà.
export async function noterLeMot(jour, mot) {
  return verifier(
    await client.from('journees').upsert({ jour, mot }, { onConflict: 'jour' }).select().single(),
  );
}

// --- La bibliothèque ---------------------------------------------------------
//
// Les pages lues d'un livre sont la SOMME de ses séances, jamais une colonne à
// part : deux endroits pour un même nombre finissent toujours par se
// contredire. Le journal sert aussi le rythme et la page du jour.

export async function livresTous() {
  return verifier(
    await client
      .from('livres')
      .select('*, citations:livres_citations(id, texte, page)')
      .order('created_at', { ascending: false }),
  );
}

export async function livresSeancesDepuis(dateISO) {
  return verifier(
    await client
      .from('livres_seances')
      .select('id, livre_id, jour, pages')
      .gte('jour', dateISO)
      .order('jour'),
  );
}

// Toutes les séances d'un livre, sans borne de date : l'avancée d'un livre
// commencé il y a un an doit rester juste.
export async function seancesDuLivre(livre_id) {
  return verifier(
    await client
      .from('livres_seances')
      .select('id, livre_id, jour, pages')
      .eq('livre_id', livre_id),
  );
}

// NOTER DES PAGES COCHE L'HABITUDE DE LECTURE. C'est la preuve qu'on a lu :
// redemander de cocher « lire un peu » juste après serait demander deux fois la
// même chose. L'habitude concernée se déclare elle-même (`automatique`), donc
// rien n'est câblé sur un nom.
export async function noterDesPages(livre_id, pages, jour = versDateISO()) {
  const seance = verifier(
    await client.from('livres_seances').insert({ livre_id, pages, jour }).select().single(),
  );

  const [habitude] = verifier(
    await client.from('habitudes').select('id').eq('automatique', 'lecture').limit(1),
  );
  if (habitude) await marquerHabitude(habitude.id, jour);

  return seance;
}

export async function creerLivre({
  titre,
  auteur = null,
  pages = null,
  statut = 'a_lire',
  commence_le = null,
}) {
  return verifier(
    await client
      .from('livres')
      .insert({ titre, auteur, pages, statut, commence_le })
      .select('*, citations:livres_citations(id, texte, page)')
      .single(),
  );
}

export async function modifierLivre(id, champs) {
  return verifier(
    await client
      .from('livres')
      .update(champs)
      .eq('id', id)
      .select('*, citations:livres_citations(id, texte, page)')
      .single(),
  );
}

export async function supprimerLivre(id) {
  const { error } = await client.from('livres').delete().eq('id', id);
  if (error) throw error;
}

// Terminer un livre écrit une victoire : finir un livre en est une, et le
// perso compte au même rang que le reste (philosophie du hub).
export async function terminerLivre(livre, note = null) {
  const fini = verifier(
    await client
      .from('livres')
      .update({ statut: 'lu', note, fini_le: versDateISO() })
      .eq('id', livre.id)
      .select('*, citations:livres_citations(id, texte, page)')
      .single(),
  );

  await ajouterVictoire({
    espace: 'perso',
    titre: `Fini « ${livre.titre} »`,
    source: 'manuel',
  });

  return fini;
}

export async function garderUneCitation(livre_id, texte, page = null) {
  return verifier(
    await client.from('livres_citations').insert({ livre_id, texte, page }).select().single(),
  );
}

export async function retirerUneCitation(id) {
  const { error } = await client.from('livres_citations').delete().eq('id', id);
  if (error) throw error;
}

// --- Les habitudes de l'espace perso -----------------------------------------
//
// Trois mesures dont aucune ne peut s'effondrer — élan, série en semaines,
// cumul et paliers. Elles se CALCULENT dans js/orientation.js, qui ne touche ni
// au réseau ni au DOM : la règle du jeu doit rester éprouvable hors écran, et
// celle-ci plus que les autres, puisque c'est elle qui décide de ce qui motive.

export async function habitudesToutes() {
  return verifier(await client.from('habitudes').select('*').order('ordre'));
}

// Les faits sur une fenêtre : soixante jours suffisent à l'élan, un an à la
// série. On lit l'année — quelques centaines de lignes au plus, et le calcul
// n'a alors plus rien à redemander.
export async function habitudesFaitsDepuis(dateISO) {
  return verifier(
    await client
      .from('habitudes_faits')
      .select('habitude_id, jour')
      .gte('jour', dateISO)
      .order('jour'),
  );
}

// Cocher une habitude. `ignoreDuplicates` sur la contrainte d'unicité : deux
// appuis rapprochés, ou l'accueil et perso ouverts en même temps, ne comptent
// pas double — et ce refus ne doit pas ressembler à une erreur.
export async function marquerHabitude(habitude_id, jour) {
  return verifier(
    await client
      .from('habitudes_faits')
      .upsert({ habitude_id, jour }, { onConflict: 'habitude_id,jour', ignoreDuplicates: true })
      .select(),
  );
}

export async function demarquerHabitude(habitude_id, jour) {
  const { error } = await client
    .from('habitudes_faits')
    .delete()
    .eq('habitude_id', habitude_id)
    .eq('jour', jour);
  if (error) throw error;
}

export async function creerHabitude({
  nom,
  famille = null,
  cadence = null,
  pourquoi = null,
  ordre = null,
  // Le signe qui la représente sur l'accueil, à la place de son nom (30 août
  // 2026). Facultatif : sans lui, le nom reste affiché.
  emoji = null,
}) {
  return verifier(
    await client
      .from('habitudes')
      .insert({ nom, famille, cadence, pourquoi, ordre, emoji })
      .select()
      .single(),
  );
}

export async function modifierHabitude(id, champs) {
  return verifier(await client.from('habitudes').update(champs).eq('id', id).select().single());
}

// Une habitude qu'on met de côté s'ARCHIVE : son histoire et ses paliers
// restent. La suppression existe aussi, mais elle emporte les faits — le hub ne
// jette pas ce qui a été fait sans qu'on le lui demande deux fois.
export async function supprimerHabitude(id) {
  const { error } = await client.from('habitudes').delete().eq('id', id);
  if (error) throw error;
}

// Franchir un palier écrit une victoire, comme une étape de projet ou un jalon.
// C'est le SEUL moment où une habitude parle dans « Le chemin » : la cocher
// tous les jours y écrirait du bruit, franchir la cinquantième est un fait.
export async function victoireDePalier(habitude, palier) {
  return ajouterVictoire({
    espace: 'perso',
    titre: `${habitude.nom} — ${palier} fois`,
    source: 'habitude',
    source_id: habitude.id,
  });
}

// --- Les étapes d'un projet ---------------------------------------------------
//
// LE DÉCOUPAGE QU'ON DÉCLARE (29 août 2026, décision de Noé). Ce sont elles qui
// mesurent l'avancée d'un projet, avant sa charge et à la place des tâches :
// leur nombre est écrit UNE FOIS, donc ajouter une tâche ne fait plus reculer
// la barre. Voir `avanceeDuProjet` (js/orientation.js) pour la cascade.
//
// Mêmes gestes que les jalons d'un cap, volontairement : c'est le même motif un
// étage plus bas, et deux mécaniques différentes pour deux choses identiques
// finiraient par diverger.

export async function creerEtape({ projet_id, titre, ordre = null }) {
  return verifier(
    await client.from('projets_etapes').insert({ projet_id, titre, ordre }).select().single(),
  );
}

export async function modifierEtape(id, champs) {
  return verifier(
    await client.from('projets_etapes').update(champs).eq('id', id).select().single(),
  );
}

export async function supprimerEtape(id) {
  const { error } = await client.from('projets_etapes').delete().eq('id', id);
  if (error) throw error;
}

// L'ORDRE DES ÉTAPES SE CHANGE (29 août 2026, demande de Noé). Un découpage ne
// se pense pas dans le bon ordre du premier coup : on pose les étapes comme
// elles viennent, puis on les range.
//
// On RENUMÉROTE la liste entière plutôt que d'échanger deux valeurs : `ordre`
// naît de la longueur de la liste au moment où l'étape est posée, donc une
// étape supprimée au milieu laisse un trou, et deux étapes peuvent finir avec
// le même numéro. Un échange de deux valeurs jumelles ne change alors rien du
// tout, et le défaut serait invisible jusqu'au jour où il se voit.
//
// Seules les lignes qui bougent vraiment sont écrites : dans le cas ordinaire
// — une étape qui monte d'un rang — cela fait deux requêtes, pas dix.
export async function reordonnerEtapes(etapes) {
  const modifs = etapes
    .map((etape, rang) => ({ etape, ordre: rang + 1 }))
    .filter(({ etape, ordre }) => etape.ordre !== ordre);

  await Promise.all(
    modifs.map(async ({ etape, ordre }) =>
      verifier(
        await client.from('projets_etapes').update({ ordre }).eq('id', etape.id).select().single(),
      ),
    ),
  );

  for (const { etape, ordre } of modifs) etape.ordre = ordre;
  return modifs.length;
}

// Franchir une étape écrit sa victoire, comme un jalon atteint et une tâche
// terminée. Une étape est un vrai morceau de travail fini — la laisser muette
// alors que le jalon parle aurait fait une exception à expliquer.
export async function franchirEtape(etape, espace) {
  const atteinte = verifier(
    await client
      .from('projets_etapes')
      .update({ atteint: true, date_atteint: new Date().toISOString().slice(0, 10) })
      .eq('id', etape.id)
      .select()
      .single(),
  );

  const victoire = await ajouterVictoire({
    espace,
    titre: atteinte.titre,
    source: 'etape',
    source_id: atteinte.id,
  });

  return { etape: atteinte, victoire };
}

// Revenir sur une étape retire sa victoire — sinon le hub garderait la trace
// d'un travail défait. Même règle que pour un jalon.
export async function supprimerVictoireDeLEtape(etapeId) {
  const { error } = await client
    .from('victoires')
    .delete()
    .eq('source', 'etape')
    .eq('source_id', etapeId);
  if (error) throw error;
}

// --- Les séries : la répétition fabrique de vraies lignes ---------------------
//
// Une série porte LA RÈGLE et LE MODÈLE ; chaque occurrence est une ligne à
// part, qu'on supprime et qu'on modifie seule (demande de Noé, 27 août 2026).
// Avant, une tâche répétée était une ligne unique dont on déplaçait l'échéance :
// on ne pouvait ni en retirer une occurrence, ni en changer une seule, ni
// savoir ce qui avait réellement été fait — la ligne ne gardait aucune trace.
//
// Ce que les ÉCRANS voient ne change pas : les lignes portent toujours
// `recurrence` et `recurrence_fin`, que `garnirUne` recopie depuis la série.
// C'est le stockage qui a changé, pas la forme.

const TABLE_DE_LA_NATURE = {
  tache: 'taches',
  evenement: 'evenements',
  publication: 'publications',
};

// Seize semaines devant. Le chiffre n'est pas rond par hasard : il couvre tout
// ce qui a une échéance ce trimestre, jusqu'au QCM du 8 décembre, et c'est aussi
// la fenêtre que regarde la courbe d'atterrissage (docs/orientation-spec.md).
//
// Plus loin serait payé cher au mauvais endroit : une série hebdomadaire pose
// une ligne par semaine, et l'espace Tâches ne cache rien — un an devant, il
// afficherait cinquante « Contacter les clubs » d'affilée. Seize semaines en
// posent seize, et le rattrapage du démarrage repousse la fenêtre chaque jour.
const HORIZON_SERIE_JOURS = 16 * 7;

let seriesEnCache = new Map();

export async function chargerLesSeries() {
  const series = verifier(await client.from('series').select('*'));
  seriesEnCache = new Map(series.map((serie) => [serie.id, serie]));
  return series;
}

// La règle de la série, recopiée sur son occurrence. Une série ARRÊTÉE n'en
// dit rien : ses occurrences déjà posées restent, mais plus rien ne se répète.
function garnirUne(ligne) {
  const serie = ligne?.serie_id ? seriesEnCache.get(ligne.serie_id) : null;
  if (!serie || serie.arretee) return ligne;
  return { ...ligne, recurrence: serie.recurrence, recurrence_fin: serie.recurrence_fin };
}

function decalerDUnJour(date, sens = 1) {
  const suite = new Date(date);
  suite.setDate(suite.getDate() + sens);
  return suite;
}

function horizonDeSerie() {
  return decalerDUnJour(new Date(), HORIZON_SERIE_JOURS);
}

// Les champs d'une occurrence, tirés du modèle. C'est le seul endroit qui sait
// traduire une DATE en colonnes : échéance pour une tâche, date prévue pour une
// publication, début et fin pour un événement.
// Exportée pour être vérifiable seule : elle ne touche ni au réseau ni à la
// session, elle ne fait que traduire une DATE en colonnes.
export function occurrenceDepuisModele(serie, date) {
  const modele = { ...(serie.modele ?? {}) };
  const jour = versDateISO(date);
  const commun = { espace: serie.espace, serie_id: serie.id };

  if (serie.nature === 'tache') {
    return { ...modele, ...commun, echeance: jour, statut: 'actif' };
  }
  if (serie.nature === 'publication') {
    return { ...modele, ...commun, date_prevue: jour };
  }

  // Un événement ne porte pas de durée : elle est dans sa fin. Le modèle garde
  // donc l'heure et le nombre de minutes, et on reconstruit les deux bouts.
  const { duree_minutes: minutes, heure, ...reste } = modele;
  const debut = new Date(`${jour}T${heure || '00:00'}:00`);
  return {
    ...reste,
    ...commun,
    date_debut: debut.toISOString(),
    date_fin: minutes ? new Date(debut.getTime() + minutes * 60000).toISOString() : null,
  };
}

// Poser les occurrences manquantes, jusqu'à l'horizon. On ne génère QU'APRÈS
// `genere_jusqu_au` : c'est ce curseur qui fait qu'une occurrence supprimée ne
// repousse jamais.
export async function genererOccurrences(serie) {
  if (serie.arretee) return [];

  const dates = occurrencesEntre(
    depuisDateISO(serie.depart),
    serie.recurrence,
    serie.recurrence_fin,
    decalerDUnJour(depuisDateISO(serie.genere_jusqu_au)),
    horizonDeSerie(),
  );
  if (!dates.length) return [];

  const posees = verifier(
    await client
      .from(TABLE_DE_LA_NATURE[serie.nature])
      .insert(dates.map((date) => occurrenceDepuisModele(serie, date)))
      .select(),
  );

  const majee = verifier(
    await client
      .from('series')
      .update({ genere_jusqu_au: versDateISO(dates[dates.length - 1]) })
      .eq('id', serie.id)
      .select()
      .single(),
  );
  seriesEnCache.set(majee.id, majee);
  return posees;
}

// Au démarrage : chaque série vivante rattrape son retard. Une seule lecture et,
// la plupart du temps, aucune écriture — les occurrences de l'année sont déjà là.
export async function rafraichirLesSeries() {
  const series = await chargerLesSeries();
  for (const serie of series) {
    if (!serie.arretee) await genererOccurrences(serie);
  }
  return series;
}

// `premierePosee` : la ligne du jour de départ existe déjà (on répète une chose
// déjà écrite). Le curseur part alors DU départ, et la génération reprend au pas
// suivant — sans quoi on poserait un doublon sur le premier jour.
export async function creerSerie(
  nature,
  { espace, recurrence, depart, recurrence_fin = null, modele = {}, premierePosee = false },
) {
  const depuis = depuisDateISO(depart);
  const serie = verifier(
    await client
      .from('series')
      .insert({
        nature,
        espace,
        recurrence,
        depart,
        recurrence_fin: recurrence_fin || null,
        genere_jusqu_au: versDateISO(premierePosee ? depuis : decalerDUnJour(depuis, -1)),
        modele,
      })
      .select()
      .single(),
  );
  seriesEnCache.set(serie.id, serie);
  return { serie, occurrences: await genererOccurrences(serie) };
}

// Arrêter une série : les occurrences déjà passées restent — elles ont eu lieu —
// mais celles d'APRÈS le jour donné s'en vont, et plus rien ne se génère.
const COLONNE_DU_JOUR = {
  tache: 'echeance',
  publication: 'date_prevue',
  evenement: 'date_debut',
};

export async function arreterSerie(serie, jourISO = null) {
  // Sans jour donné — une publication qu'on renvoie à la banque d'idées, par
  // exemple — on coupe à partir d'aujourd'hui : ce qui est passé a eu lieu.
  const borne = jourISO || versDateISO(new Date());
  const { error } = await client
    .from(TABLE_DE_LA_NATURE[serie.nature])
    .delete()
    .eq('serie_id', serie.id)
    .gt(COLONNE_DU_JOUR[serie.nature], borne);
  if (error) throw error;

  const arretee = verifier(
    await client.from('series').update({ arretee: true }).eq('id', serie.id).select().single(),
  );
  seriesEnCache.set(arretee.id, arretee);
  return arretee;
}

// RATTACHER UNE SÉRIE À UNE RUBRIQUE (29 août 2026, pour « La saison » du site
// FCH). Deux séries hebdomadaires du club tournaient depuis le 9 septembre sans
// qu'aucune ne porte de rubrique : le rythme existait, il n'était rattaché à
// rien, donc rien n'était comptable par rubrique.
//
// ELLE ÉCRIT AUX DEUX ÉTAGES, et c'est tout son objet :
//   — le MODÈLE de la série, pour que les occurrences À NAÎTRE la portent ;
//   — les occurrences DÉJÀ POSÉES et encore à venir, sinon les quinze
//     parutions déjà générées resteraient orphelines et le compte par rubrique
//     mentirait pendant seize semaines.
//
// Ce qui est PASSÉ ne bouge pas : une parution déjà sortie a eu lieu sous le
// nom qu'elle portait, et la réécrire falsifierait l'histoire. C'est la même
// borne que `arreterSerie`, et pour la même raison.
export async function rubriquerSerie(serie, rubrique) {
  const valeur = (rubrique ?? '').trim() || null;
  const borne = versDateISO(new Date());

  const { error } = await client
    .from(TABLE_DE_LA_NATURE[serie.nature])
    .update({ rubrique: valeur })
    .eq('serie_id', serie.id)
    .gte(COLONNE_DU_JOUR[serie.nature], borne);
  if (error) throw error;

  const rubriquee = verifier(
    await client
      .from('series')
      .update({ modele: { ...(serie.modele ?? {}), rubrique: valeur } })
      .eq('id', serie.id)
      .select()
      .single(),
  );
  seriesEnCache.set(rubriquee.id, rubriquee);
  return rubriquee;
}

// Le modèle d'une série née d'une ligne déjà écrite : on reprend ses champs, en
// laissant dehors ce qui appartient à l'occurrence (son identité, sa date, son
// état) et non à la série.
const HORS_MODELE = new Set([
  'id', 'created_at', 'serie_id', 'statut', 'date_fait', 'echeance',
  'date_prevue', 'lien_publie', 'date_debut', 'date_fin',
  'vecu', 'photo_chemin', 'note', 'oeuvre_finie', 'recurrence', 'recurrence_fin',
]);

function modeleDepuisLaLigne(nature, ligne) {
  const modele = {};
  for (const [nom, valeur] of Object.entries(ligne)) {
    if (!HORS_MODELE.has(nom)) modele[nom] = valeur;
  }
  if (nature === 'evenement') {
    const debut = new Date(ligne.date_debut);
    modele.heure = `${String(debut.getHours()).padStart(2, '0')}:${String(debut.getMinutes()).padStart(2, '0')}`;
    modele.duree_minutes = ligne.date_fin
      ? Math.round((new Date(ligne.date_fin) - debut) / 60000)
      : null;
  }
  return modele;
}

// Poser, changer ou retirer la répétition d'une ligne existante. Trois cas, et
// un seul geste possible sur une série en cours : l'arrêter à partir de cette
// ligne, puis en repartir une neuve. Modifier la règle d'une série en place
// reviendrait à déplacer des occurrences déjà posées, que Noé a peut-être déjà
// changées une à une.
async function reglerLaRepetition(nature, ligne, jourISO, recurrence, recurrence_fin) {
  const table = TABLE_DE_LA_NATURE[nature];
  const ancienne = ligne.serie_id ? seriesEnCache.get(ligne.serie_id) : null;
  const vivante = ancienne && !ancienne.arretee;

  if (
    vivante &&
    ancienne.recurrence === (recurrence || null) &&
    (ancienne.recurrence_fin ?? null) === (recurrence_fin || null)
  ) {
    return ligne;
  }

  if (vivante) await arreterSerie(ancienne, jourISO);
  if (!recurrence || !jourISO) return ligne;

  const { serie } = await creerSerie(nature, {
    espace: ligne.espace,
    recurrence,
    depart: jourISO,
    recurrence_fin: recurrence_fin || null,
    modele: modeleDepuisLaLigne(nature, ligne),
    premierePosee: true,
  });

  return verifier(
    await client.from(table).update({ serie_id: serie.id }).eq('id', ligne.id).select().single(),
  );
}

export async function creerTache({
  espace,
  titre,
  statut = 'backlog',
  echeance = null,
  heure = null,
  duree = null,
  priorite = 4,
  objectif_id = null,
  projet_id = null,
  // Espace perso seulement : ce que ce moment sert (corps, calme, lien,
  // intendance). Cette liste est une LISTE BLANCHE — un champ absent d'ici
  // tombe en silence, c'est le piège déjà raconté plus bas pour l'heure et la
  // priorité d'un événement.
  famille = null,
  recurrence = null,
  recurrence_fin = null,
}) {
  const champs = {
    espace,
    titre,
    echeance,
    heure,
    // Une durée sans heure ne mesure rien : la tâche arrive dans la journée
    // sans occuper de créneau (26 août 2026).
    duree: heure ? duree || null : null,
    priorite,
    objectif_id,
    projet_id,
    famille: espace === 'perso' ? famille : null,
  };

  // Une répétition sans échéance n'a rien à répéter : sans jour, il n'y a pas
  // de série, seulement une tâche ordinaire.
  if (echeance && recurrence) {
    const { occurrences } = await creerSerie('tache', {
      espace,
      recurrence,
      depart: echeance,
      recurrence_fin: recurrence_fin || null,
      modele: {
        titre,
        heure,
        duree: heure ? duree || null : null,
        priorite,
        objectif_id,
        projet_id,
        famille: espace === 'perso' ? famille : null,
      },
    });
    if (occurrences.length) return garnirUne(occurrences[0]);
  }

  return verifier(
    await client.from('taches').insert({ ...champs, statut }).select().single(),
  );
}

export async function creerEvenement({
  espace,
  titre,
  date_debut,
  date_fin = null,
  lieu = null,
  notes = null,
  recurrence = null,
  recurrence_fin = null,
  // Yuno seulement : le type du moment qui naîtra de cette sortie.
  type_moment = null,
  // Yuno seulement : les deux clubs d'un match, posés à la création depuis le
  // calendrier officiel. Le titre, lui, est COPIÉ de l'affiche et vit sa vie —
  // le réécrire ne touche pas aux liens.
  club_recevant = null,
  club_visiteur = null,
  // FCH seulement : la face réunion — l'objet est le marqueur, l'animation ne
  // vit pas sans lui. Deux colonnes à ne pas oublier ICI : cette liste est une
  // liste blanche, et un champ absent tombe en silence — c'est exactement le
  // piège de l'heure et de la priorité, déjà raconté plus haut.
  reunion_objet = null,
  // Cet événement produit des photos à trier (29 août 2026). C'est une LISTE
  // BLANCHE ici : un champ absent tomberait en silence — le piège déjà raconté
  // pour l'heure et la priorité.
  avec_photos = false,
  reunion_animee = false,
  projet_id = null,
  // Espace perso seulement : la famille du moment. Même liste blanche, même
  // piège — un champ oublié ici s'écrit à l'écran et jamais en base.
  famille = null,
}) {
  const champs = {
    espace, titre, date_debut, date_fin, lieu, notes,
    type_moment, club_recevant, club_visiteur, reunion_objet, reunion_animee, projet_id,
    avec_photos,
    famille: espace === 'perso' ? famille : null,
  };

  if (recurrence) {
    const debut = new Date(date_debut);
    const { occurrences } = await creerSerie('evenement', {
      espace,
      recurrence,
      depart: versDateISO(debut),
      recurrence_fin: recurrence_fin || null,
      modele: {
        titre, lieu, notes, type_moment, club_recevant, club_visiteur,
        reunion_objet, reunion_animee, projet_id,
        famille: espace === 'perso' ? famille : null,
        heure: `${String(debut.getHours()).padStart(2, '0')}:${String(debut.getMinutes()).padStart(2, '0')}`,
        duree_minutes: date_fin ? Math.round((new Date(date_fin) - debut) / 60000) : null,
      },
    });
    if (occurrences.length) return garnirUne(occurrences[0]);
  }

  return verifier(await client.from('evenements').insert(champs).select().single());
}

// --- Publications (calendrier éditorial Yuno) --------------------------------
// Une idée est une publication sans date : même table, deux vues.

export async function publicationsToutes(espace) {
  let requete = client
    .from('publications')
    .select('*')
    .order('date_prevue', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (espace) requete = requete.eq('espace', espace);
  return verifier(await requete);
}

// Les publications planifiées d'une période, pour « Ta semaine » du dashboard.
// Les publiées n'y figurent plus : c'est fait, le dashboard montre l'à-venir.
export async function publicationsEntre(debutISO, finISO, { espace = null } = {}) {
  let requete = client
    .from('publications')
    .select('*')
    .not('date_prevue', 'is', null)
    .gte('date_prevue', debutISO)
    .lte('date_prevue', finISO)
    .neq('statut', 'publie')
    .order('date_prevue');

  if (espace) requete = requete.eq('espace', espace);
  return verifier(await requete);
}

// pilier, preuve et pourquoi_moi sont propres à Yuno : le FCH les laisse vides.
export async function creerPublication({
  espace,
  titre,
  reseau = 'instagram',
  format = 'carrousel',
  rubrique = null,
  notes = null,
  date_prevue = null,
  heure = null,
  recurrence = null,
  recurrence_fin = null,
  pilier = null,
  preuve = null,
  pourquoi_moi = null,
  projet_id = null,
}) {
  const champs = {
    espace, titre, reseau, format, rubrique, notes,
    date_prevue, heure, pilier, preuve, pourquoi_moi, projet_id,
  };

  // Sans date, c'est une idée dans la banque : il n'y a rien à répéter.
  if (date_prevue && recurrence) {
    const { occurrences } = await creerSerie('publication', {
      espace,
      recurrence,
      depart: date_prevue,
      recurrence_fin: recurrence_fin || null,
      modele: {
        titre, reseau, format, rubrique, notes, heure, pilier, preuve, pourquoi_moi, projet_id,
      },
    });
    if (occurrences.length) return garnirUne(occurrences[0]);
  }

  return verifier(await client.from('publications').insert(champs).select().single());
}

export async function modifierPublication(id, champs) {
  const { recurrence, recurrence_fin, ...reste } = champs;
  const ligne = verifier(
    await client.from('publications').update(reste).eq('id', id).select().single(),
  );
  if (!('recurrence' in champs)) return ligne;
  return reglerLaRepetition('publication', ligne, ligne.date_prevue, recurrence, recurrence_fin);
}

export async function supprimerPublication(id) {
  const { error } = await client.from('publications').delete().eq('id', id);
  if (error) throw error;
}

// --- Le Carnet de terrain (Yuno) ---------------------------------------------
// Une sortie vécue EST un événement (fusion du 14 août 2026) : matchs
// couverts, concerts, sorties. `vecu` dit qu'on y était, et il ne se pose que
// par un geste — jamais par le temps qui passe. Les compteurs de l'accueil s'en
// déduisent : rien n'est stocké, des faits accumulés ne peuvent que monter.

// Les rencontres d'une sortie, insérées ensemble. Rendues telles quelles pour
// que l'écran les affiche sans relire la table.
async function poserLesRencontres(evenementId, rencontres) {
  if (!rencontres.length) return [];
  return verifier(
    await client
      .from('rencontres')
      .insert(
        rencontres.map(({ nom, contact_id = null }) => ({
          evenement_id: evenementId,
          nom,
          contact_id,
        })),
      )
      .select(),
  );
}

// Inscrire au carnet une sortie qui n'était PAS au calendrier : elle y entre
// par la même occasion, déjà vécue. C'est la capture du Journal.
// Le titre de la victoire est fabriqué par l'appelant : le vocabulaire
// appartient à l'écran.
export async function creerSortieVecue({ evenement, rencontres = [], titre }) {
  const cree = verifier(
    await client
      .from('evenements')
      .insert({ ...evenement, espace: 'photo', vecu: true })
      .select()
      .single(),
  );

  const lignes = await poserLesRencontres(cree.id, rencontres);
  const victoire = await ajouterVictoire({
    espace: 'photo',
    titre,
    source: 'moment',
    source_id: cree.id,
  });

  return { evenement: { ...cree, rencontres: lignes }, victoire };
}

// Inscrire au carnet une sortie DÉJÀ au calendrier : le bilan d'une
// préparation, ou l'invite acceptée. L'événement ne bouge pas de place ; il
// gagne sa face vécue. Une victoire naît, comme pour toute sortie vécue.
export async function marquerSortieVecue(id, champs, { rencontres = [], titre }) {
  const misAJour = verifier(
    await client
      .from('evenements')
      .update({ ...champs, vecu: true })
      .eq('id', id)
      .select()
      .single(),
  );

  const lignes = await poserLesRencontres(id, rencontres);
  const victoire = await ajouterVictoire({
    espace: 'photo',
    titre,
    source: 'moment',
    source_id: id,
  });

  return { evenement: { ...misAJour, rencontres: lignes }, victoire };
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
//
// Resserré le 21 août 2026 (2400 px / 0,85 → 1600 px / 0,82) : Supabase a
// écrit — la bande passante du plan gratuit part presque toute dans les photos.
// 1600 px couvrent un plein écran de téléphone Retina (≈400 px CSS × 3) ; le
// hub montre le souvenir, il n'archive pas le fichier de boîtier, qui reste
// chez Noé.
export const COTE_LONG_PHOTO = 1600;
export const QUALITE_PHOTO = 0.82;

// Au-dessus de ce poids, on ré-encode MÊME une image déjà sous la barre des
// 1600 px : un JPEG peu compressé de 1500 px peut peser 2 Mo, et il partait
// tel quel — c'est lui qui brûlait la bande passante, pas les grandes images.
export const POIDS_CONFORT_PHOTO = 500 * 1024;

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
  // Sous la barre ET déjà légère : le ré-encodage ne ferait que perdre de la
  // qualité. Sous la barre mais lourde : on ré-encode sans redimensionner.
  if (cote <= COTE_LONG_PHOTO && fichier.size <= POIDS_CONFORT_PHOTO) {
    bitmap.close?.();
    return fichier;
  }

  const echelle = Math.min(1, COTE_LONG_PHOTO / cote);
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

// Des signatures d'UN MOIS, gardées et réutilisées (décision de Noé, 21 août
// 2026 — le mail de Supabase). Elles duraient une heure et se redemandaient à
// chaque session : chaque visite recevait des adresses NEUVES, et le navigateur,
// qui met en cache par adresse, retéléchargeait toutes les photos qu'il avait
// déjà. C'était l'essentiel de la bande passante du site.
//
// Le garde-manger vit dans le localStorage : tant qu'une adresse a moins de
// 25 jours, on la ressert telle quelle — le navigateur reconnaît l'adresse et
// ressort l'image de son cache, rien ne descend. Les 5 jours de marge couvrent
// l'onglet qui reste ouvert : une adresse servie à 25 jours reste valable 5
// jours de plus.
//
// Le coût, assumé : un lien qui fuirait resterait valable un mois au lieu d'une
// heure. Les photos restent privées — sans lien signé, le bucket ne répond pas.
const CLE_PHOTOS_SIGNEES = 'yuno-photos-signees';
export const DUREE_SIGNATURE_PHOTOS = 30 * 24 * 3600;
export const REUTILISATION_PHOTOS = 25 * 24 * 3600 * 1000;

function lireLesSignatures() {
  try {
    return JSON.parse(localStorage.getItem(CLE_PHOTOS_SIGNEES)) ?? {};
  } catch {
    return {};
  }
}

export async function urlsDesPhotos(chemins) {
  if (!chemins.length) return {};

  const maintenant = Date.now();
  const gardees = lireLesSignatures();
  const fraiches = Object.fromEntries(
    chemins
      .filter((c) => gardees[c] && maintenant - gardees[c].le < REUTILISATION_PHOTOS)
      .map((c) => [c, gardees[c].url]),
  );

  const manquants = chemins.filter((c) => !(c in fraiches));
  if (!manquants.length) return fraiches;

  const { data, error } = await client.storage
    .from('moments')
    .createSignedUrls(manquants, DUREE_SIGNATURE_PHOTOS);
  if (error) throw error;

  const neuves = Object.fromEntries(
    data.filter((entree) => entree.signedUrl).map((entree) => [entree.path, entree.signedUrl]),
  );

  // On réécrit le garde-manger sans ses entrées périmées : il ne grossit pas
  // avec les photos disparues. Un localStorage qui refuse n'empêche rien —
  // on perd seulement la réutilisation.
  try {
    const suite = {};
    for (const [c, entree] of Object.entries(gardees)) {
      if (maintenant - entree.le < REUTILISATION_PHOTOS) suite[c] = entree;
    }
    for (const [c, url] of Object.entries(neuves)) suite[c] = { url, le: maintenant };
    localStorage.setItem(CLE_PHOTOS_SIGNEES, JSON.stringify(suite));
  } catch {
    // Tant pis : la prochaine visite resignera.
  }

  return { ...fraiches, ...neuves };
}

// Corriger une sortie vécue : sa date, son type, son lieu, sa note, la case
// « œuvre finie », sa photo. C'est un événement — le titre de la victoire est
// son reflet et suit, sinon le dashboard du hub garderait l'ancien nom pour
// toujours. `date` est celle de la victoire (une date nue), tirée du début.
export async function modifierSortie(id, champs, titre, dateISO) {
  const modifie = verifier(
    await client.from('evenements').update(champs).eq('id', id).select().single(),
  );

  const { error } = await client
    .from('victoires')
    .update({ titre, date: dateISO })
    .eq('source', 'moment')
    .eq('source_id', id);
  if (error) console.error('Victoire de la sortie non mise à jour', error);

  return modifie;
}

// Effacer un seul fichier du stockage, sans toucher à la sortie. Sert quand une
// photo en remplace une autre : l'ancienne n'est plus référencée par personne.
// Le bucket s'appelle toujours `moments` — c'est un nom de stockage, pas un mot
// d'interface, et le renommer casserait les chemins déjà écrits en base.
export async function supprimerPhotoMoment(chemin) {
  const { error } = await client.storage.from('moments').remove([chemin]);
  if (error) console.error('Ancienne photo non supprimée du stockage', error);
}

// Retirer une sortie DU CARNET, sans la retirer du calendrier (fusion du
// 14 août 2026). C'est tout l'intérêt de la fusion : l'événement a eu lieu, il
// reste à sa date ; seule sa face vécue s'efface — la photo, la note, l'œuvre
// finie, les rencontres, et la victoire qui n'en était que le reflet.
export async function retirerDuCarnet(id, chemin = null) {
  if (chemin) {
    const { error } = await client.storage.from('moments').remove([chemin]);
    if (error) console.error('Photo non supprimée du stockage', error);
  }

  const { error: erreurVictoire } = await client
    .from('victoires')
    .delete()
    .eq('source', 'moment')
    .eq('source_id', id);
  if (erreurVictoire) throw erreurVictoire;

  const { error: erreurRencontres } = await client
    .from('rencontres')
    .delete()
    .eq('evenement_id', id);
  if (erreurRencontres) throw erreurRencontres;

  return verifier(
    await client
      .from('evenements')
      .update({ vecu: false, photo_chemin: null, note: null, oeuvre_finie: false })
      .eq('id', id)
      .select()
      .single(),
  );
}

// Une rencontre notée au vol devient une fiche du carnet : la photo est un pont
// vers les gens, encore faut-il que le pont mène quelque part.
//
// La fiche est écrite par le formulaire (`creerContact`), pas ici : depuis le
// 14 août 2026, le « + » d'une rencontre ouvre la fiche complète au lieu d'en
// poser une qui ne porterait qu'un nom. Il ne reste donc que le raccord.
export async function relierRencontreAuContact(rencontreId, contactId) {
  return verifier(
    await client
      .from('rencontres')
      .update({ contact_id: contactId })
      .eq('id', rencontreId)
      .select()
      .single(),
  );
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

// Le vivier de pistes : les clubs à contacter, définis avec Noé (15 août
// 2026). Une piste avance par faits — choisie pour la fournée, puis contactée
// (datée) — et « contactée » ne redescend jamais.

export async function pistesToutes() {
  return verifier(await client.from('pistes').select('*').order('nom'));
}

export async function modifierPiste(id, champs) {
  return verifier(
    await client.from('pistes').update(champs).eq('id', id).select().single(),
  );
}

// La fournée d'une semaine passée retourne au vivier, d'un seul UPDATE
// (décision de Noé, 21 août 2026). Le site est statique, il n'a pas de minuit
// à lui : c'est la première visite de la semaine qui fait le ménage.
// `fournee_semaine` reste posée — c'est `en_fournee` qui dit l'état, la date
// ne sert qu'à savoir si la semaine est finie.
export async function viderLaFournee(ids) {
  if (!ids.length) return;
  const { error } = await client
    .from('pistes')
    .update({ en_fournee: false })
    .in('id', ids);
  if (error) throw error;
}

// LE prochain match de chaque club du vivier — la vue fait le tri, jamais plus
// d'une ligne par piste. L'adversaire et la journée sont sûrs ; la date est
// celle du calendrier publié, elle peut glisser avec la télévision.
export async function prochainsMatchsParPiste() {
  return verifier(await client.from('prochain_match_par_piste').select('*'));
}

// Toutes les rencontres d'une période, pour la vue week-end du calendrier.
// `domicile = true` suffit à les avoir TOUTES sans doublon : chaque match a
// exactement une ligne côté club qui reçoit — c'est ce que la table
// dénormalisée donne gratuitement.
export async function matchsEntre(debutISO, finISO) {
  return verifier(
    await client
      .from('matchs_pistes')
      .select('*')
      .eq('domicile', true)
      .gte('date', debutISO)
      .lte('date', finISO)
      .order('date'),
  );
}

// Les prochains matchs d'UN club, pour sa fiche : on n'en charge que là, et
// seulement ceux à venir — le passé du calendrier ne se pose plus.
export async function matchsAVenirDUnClub(pisteId, combien = 6) {
  return verifier(
    await client
      .from('matchs_pistes')
      .select('*')
      .eq('piste_id', pisteId)
      .gte('date', versDateISO())
      .order('date')
      .limit(combien),
  );
}

// Un premier message parti au compte du club, sans personne nommée : l'envoi
// compte quand même — le compteur mesure l'effort, pas le carnet d'adresses.
export async function enregistrerEnvoiLibre() {
  return verifier(
    await client.from('journal_envois').insert({ date: versDateISO() }).select().single(),
  );
}

// Le rendez-vous stats a été retiré du site le 15 août 2026 (demande de Noé).
// `statsHebdoTous` et `enregistrerStats` partent avec lui : plus rien ne les
// appelait. **La table `stats_hebdo` reste en base**, avec ses lignes — le
// besoin peut revenir, sous une autre forme, et rien ne justifie de détruire
// des relevés pour retirer un écran.

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
          espace: 'photo',
          titre: `Commande livrée — ${misAJour.titre}`,
          source: 'manuel',
        })
      : null;

  return { commande: misAJour, victoire };
}

// --- Le matériel (Yuno) ------------------------------------------------------
// Ce que l'équipement a coûté. Une seule raison d'être : donner sa CIBLE à
// l'objectif « Rembourser mon matériel », qui n'en avait pas de mesurable.
// La somme des prix est la cible, la somme des prestations encaissées est la
// progression — d'où le fait qu'acheter relève la barre au lieu de la remplir.

export async function materielTout() {
  return verifier(
    await client
      .from('materiel')
      .select('*')
      .order('date_achat', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false }),
  );
}

export async function creerMateriel(champs) {
  return verifier(await client.from('materiel').insert(champs).select().single());
}

export async function modifierMateriel(id, champs) {
  return verifier(
    await client.from('materiel').update(champs).eq('id', id).select().single(),
  );
}

export async function supprimerMateriel(id) {
  const { error } = await client.from('materiel').delete().eq('id', id);
  if (error) throw error;
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
      // L'espace de l'événement voyage avec la feuille : c'est lui qui
      // permet au site Yuno d'écarter les feuilles de réunion du FCH —
      // la table n'a pas de colonne espace à elle.
      .select(
        '*, items:preparations_items(id, phase, texte, fait, ordre, created_at), evenement:evenements(espace)',
      )
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

// La feuille se corrige — aujourd'hui, son modèle de référence : « Changer ou
// compléter » depuis la feuille (demande de Noé, 24 août 2026).
export async function modifierPreparation(id, champs) {
  return verifier(
    await client.from('preparations').update(champs).eq('id', id).select().single(),
  );
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
// `bilan_animation` : la troisième question des réunions animées (FCH). Les
// bilans de Yuno ne la passent pas — elle reste alors intouchée.
export async function noterBilan(
  id,
  { bilan_bien = null, bilan_mieux = null, bilan_animation } = {},
) {
  return verifier(
    await client
      .from('preparations')
      .update({
        bilan_bien,
        bilan_mieux,
        bilan_date: versDateISO(),
        ...(bilan_animation !== undefined ? { bilan_animation } : {}),
      })
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

// Les modèles s'éditent depuis le site : nom, et items par phase. Supprimer un
// modèle ne touche pas les feuilles déjà créées — elles portent leurs copies,
// et leur `modele_id` passe à NULL (ON DELETE SET NULL).

export async function creerModelePreparation({ nom }) {
  const modele = verifier(
    await client.from('modeles_preparation').insert({ nom }).select().single(),
  );
  return { ...modele, items: [] };
}

export async function modifierModelePreparation(id, champs) {
  return verifier(
    await client.from('modeles_preparation').update(champs).eq('id', id).select().single(),
  );
}

export async function supprimerModelePreparation(id) {
  const { error } = await client.from('modeles_preparation').delete().eq('id', id);
  if (error) throw error;
}

export async function ajouterItemModele({ modele_id, phase, texte, ordre = null }) {
  return verifier(
    await client
      .from('modeles_preparation_items')
      .insert({ modele_id, phase, texte, ordre })
      .select()
      .single(),
  );
}

export async function modifierItemModele(id, champs) {
  return verifier(
    await client.from('modeles_preparation_items').update(champs).eq('id', id).select().single(),
  );
}

export async function supprimerItemModele(id) {
  const { error } = await client.from('modeles_preparation_items').delete().eq('id', id);
  if (error) throw error;
}

// --- Les fiches de réunion (FCH) ---------------------------------------------
// La structure du guide « Réunions efficaces » : le contrat avant (type,
// objectif, ordre du jour orienté action), le compte-rendu court après, et le
// tableau permanent des actions du club. Voir docs/fch-spec.md.

export async function fichesReunionToutes() {
  const fiches = verifier(
    await client
      .from('fiches_reunion')
      .select('*, points:fiches_reunion_points(*)')
      .order('date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false }),
  );
  return fiches.map((fiche) => ({
    ...fiche,
    points: (fiche.points ?? []).sort(
      (a, b) =>
        (a.ordre ?? 0) - (b.ordre ?? 0) ||
        String(a.created_at).localeCompare(String(b.created_at)),
    ),
  }));
}

// Titre et date sont copiés de l'événement, comme pour une feuille de
// préparation : la fiche se lit seule, et survit à son événement.
export async function creerFicheReunion({ evenement_id = null, titre, date = null }) {
  const fiche = verifier(
    await client
      .from('fiches_reunion')
      .insert({ evenement_id, titre, date })
      .select()
      .single(),
  );
  return { ...fiche, points: [] };
}

export async function modifierFicheReunion(id, champs) {
  return verifier(
    await client.from('fiches_reunion').update(champs).eq('id', id).select().single(),
  );
}

export async function supprimerFicheReunion(id) {
  // Les points partent avec la fiche (CASCADE) ; les actions restent — le
  // tableau du club est une mémoire, pas une annexe (SET NULL).
  const { error } = await client.from('fiches_reunion').delete().eq('id', id);
  if (error) throw error;
}

export async function ajouterPointReunion({
  fiche_id,
  titre,
  type_point = null,
  minutes = null,
  sortie = null,
  ordre = null,
}) {
  return verifier(
    await client
      .from('fiches_reunion_points')
      .insert({ fiche_id, titre, type_point, minutes, sortie, ordre })
      .select()
      .single(),
  );
}

export async function modifierPointReunion(id, champs) {
  return verifier(
    await client.from('fiches_reunion_points').update(champs).eq('id', id).select().single(),
  );
}

export async function supprimerPointReunion(id) {
  const { error } = await client.from('fiches_reunion_points').delete().eq('id', id);
  if (error) throw error;
}

export async function actionsClubToutes() {
  return verifier(
    await client
      .from('actions_club')
      .select('*')
      .order('echeance', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true }),
  );
}

export async function ajouterActionClub({
  fiche_id = null,
  texte,
  responsable = null,
  echeance = null,
  tache_id = null,
}) {
  return verifier(
    await client
      .from('actions_club')
      .insert({ fiche_id, texte, responsable, echeance, tache_id })
      .select()
      .single(),
  );
}

export async function modifierActionClub(id, champs) {
  return verifier(
    await client.from('actions_club').update(champs).eq('id', id).select().single(),
  );
}

export async function supprimerActionClub(id) {
  const { error } = await client.from('actions_club').delete().eq('id', id);
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
// `avecRencontres` : le site Yuno lit ses événements avec leur face vécue
// complète — une sortie vécue EST un événement depuis la fusion, et le carnet
// n'a donc plus de table à lui. Les autres espaces s'en passent.
export async function evenementsTous({ espace = null, avecRencontres = false } = {}) {
  let requete = client
    .from('evenements')
    .select(avecRencontres ? '*, rencontres(id, nom, contact_id)' : '*')
    .order('date_debut');
  if (espace) requete = requete.eq('espace', espace);
  return verifier(await requete);
}

export async function evenementsDepuis(debutISO, { espace = null } = {}) {
  let requete = client
    .from('evenements')
    .select('*')
    .gte('date_debut', debutISO)
    .order('date_debut');

  if (espace) requete = requete.eq('espace', espace);
  return verifier(await requete);
}

// Les tâches faites RESTENT au calendrier, barrées : ce site ne fait jamais
// disparaître ce qui a été accompli. C'est aussi ce qui permet de décocher une
// tâche cochée par erreur.
export async function tachesDatees({ espace = null } = {}) {
  let requete = client
    .from('taches')
    .select('*')
    .not('echeance', 'is', null)
    .order('echeance');

  if (espace) requete = requete.eq('espace', espace);
  return verifier(await requete);
}

// Le calendrier DU HUB — accueil et espace Calendrier. Il garde les publiées
// (25 août 2026) : leur état se règle depuis la tuile, il faut donc pouvoir le
// lire et y revenir. Et une publication partie ne s'efface pas du planning
// plus qu'une tâche faite ne s'efface de sa journée — elle se barre, comme
// elle. Les deux sites, eux, continuent d'écarter les publiées de leur
// calendrier : ils les rangent sous leur propre pli.
export async function publicationsDatees({ espace = null } = {}) {
  let requete = client
    .from('publications')
    .select('*')
    .not('date_prevue', 'is', null)
    .order('date_prevue');

  if (espace) requete = requete.eq('espace', espace);
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
  const { recurrence, recurrence_fin, ...reste } = champs;
  const ligne = verifier(
    await client.from('evenements').update(reste).eq('id', id).select().single(),
  );
  if (!('recurrence' in champs)) return ligne;
  const jour = ligne.date_debut ? versDateISO(new Date(ligne.date_debut)) : null;
  return reglerLaRepetition('evenement', ligne, jour, recurrence, recurrence_fin);
}

export async function modifierTache(id, champs) {
  const { recurrence, recurrence_fin, ...reste } = champs;
  const ligne = verifier(
    await client.from('taches').update(reste).eq('id', id).select().single(),
  );
  if (!('recurrence' in champs)) return ligne;
  return reglerLaRepetition('tache', ligne, ligne.echeance, recurrence, recurrence_fin);
}

export async function modifierJalon(id, champs) {
  return verifier(await client.from('jalons').update(champs).eq('id', id).select().single());
}

// L'ordre des jalons se change comme celui des étapes (29 août 2026) — même
// geste, même précaution : on RENUMÉROTE plutôt que d'échanger deux valeurs,
// parce que rien ne garantit que les numéros soient uniques ni sans trou.
// Voir `reordonnerEtapes`, dont ceci est le jumeau un étage plus haut.
export async function reordonnerJalons(jalons) {
  const modifs = jalons
    .map((jalon, rang) => ({ jalon, ordre: rang + 1 }))
    .filter(({ jalon, ordre }) => jalon.ordre !== ordre);

  await Promise.all(
    modifs.map(async ({ jalon, ordre }) =>
      verifier(await client.from('jalons').update({ ordre }).eq('id', jalon.id).select().single()),
    ),
  );

  for (const { jalon, ordre } of modifs) jalon.ordre = ordre;
  return modifs.length;
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
    espace: atteint.espace,
    titre: atteint.titre,
    source: 'objectif',
    source_id: atteint.id,
  });

  return { objectif: atteint, victoire };
}

// Atteindre un jalon crée sa victoire, comme pour une tâche terminée.
export async function atteindreJalon(jalon, espace) {
  const atteint = verifier(
    await client
      .from('jalons')
      .update({ atteint: true, date_atteint: new Date().toISOString().slice(0, 10) })
      .eq('id', jalon.id)
      .select()
      .single(),
  );

  const victoire = await ajouterVictoire({
    espace,
    titre: atteint.titre,
    source: 'jalon',
    source_id: atteint.id,
  });

  return { jalon: atteint, victoire };
}

// --- Les tâches que l'événement fait naître ----------------------------------
//
// LA RÈGLE (29 août 2026, formulée par Noé) : ce qu'il a DÉCLARÉ devient une
// tâche, ce que le hub DÉDUIT devient un message. Ici, les deux déclarations :
//
//   la PRÉPARATION, à J-2   parce qu'une réunion du club ou une sortie de Yuno
//                           a une feuille, et qu'on ne la remplit pas la veille
//                           au soir. Le seuil de 48 h ne s'invente pas : il
//                           existait déjà chez Yuno (`AVANT_MONTE_A`,
//                           js/yuno.js, 26 août) pour montrer la phase
//                           « Avant ». Il sort de Yuno et devient la règle.
//
//   le TRI DES PHOTOS, à J+1  parce que Noé a coché « photos » à la création.
//                           Le lendemain et non le soir même : on ne trie pas
//                           en rentrant d'un match à 22 h.
//
// Ce sont de VRAIES lignes : elles se cochent, se reportent, se rattachent, et
// « Le temps » les compte. Une fausse tâche incapable de ces gestes serait une
// exception à expliquer sur chaque écran.
//
// JAMAIS POUR LE PERSO, ni pour la formation. L'espace perso ne mesure rien :
// un rendez-vous avec soi ne se prépare pas et ne se trie pas.
//
// REJOUABLE À CHAQUE OUVERTURE, comme `rafraichirLesSeries` : l'index unique
// (evenement_id, origine) fait que poser deux fois ne pose qu'une ligne. Une
// tâche supprimée à la main ne revient pas — la contrainte l'en empêche tant
// qu'elle existe, et une fois retirée c'est une décision de Noé qu'on ne
// défait pas... sauf à rouvrir le même événement, ce qui est cohérent : il
// redemande la préparation en la redemandant.
export const PREPARATION_MONTE_A = 2;
export const TRI_TOMBE_A = 1;

// Le tri ne remonte pas plus loin que le bandeau de l'après (quinze jours,
// `SUITE_REMONTE_A` dans js/orientation.js) : au-delà, poser une tâche pour un
// match d'il y a trois semaines, c'est fabriquer du retard, pas du travail.
export const TRI_REMONTE_A = 15;

// LE POST QUI SUIT UN MATCH (29 août 2026, demande de Noé). Même jour que le
// tri, et ce n'est pas un hasard : c'est le lendemain du match que les images
// existent et que le match intéresse encore quelqu'un.
export const POST_TOMBE_A = 1;

const SANS_TACHE_AUTO = ['perso', 'formation'];

// Une réunion du club, une sortie de Yuno : les deux natures qui ont une
// feuille. Ce sont les MÊMES que celles du bandeau de l'après (`suiteDuJour`,
// js/orientation.js), et c'est voulu — ce qui se prépare est ce qui se
// débriefe.
function seDeclarePreparable(evenement) {
  if (SANS_TACHE_AUTO.includes(evenement.espace)) return false;
  if (evenement.espace === 'photo') return true;
  return evenement.espace === 'fch' && Boolean(evenement.reunion_objet);
}

// UN MATCH DE YUNO, ET LUI SEUL (29 août 2026, demande de Noé : « après chaque
// évènement match yuno, il faut programmer un post sur le match à J+1 »).
//
// La DÉCLARATION est la pastille « match » de la tuile de capture, comme
// « photos » déclare le tri : le hub ne devine pas qu'une sortie est un match —
// un concert et une séance n'appellent pas le même post, et lui seul le sait.
//
// Ni le FCH, ni la formation, ni le perso : le club a son propre calendrier
// éditorial, nourri par sa chaîne à trois états, et rien n'a demandé qu'un
// entraînement y fasse naître une parution.
function meriteUnPostDeMatch(evenement) {
  return evenement.espace === 'photo' && evenement.type_moment === 'match';
}

export async function poserCeQuUnEvenementFaitNaitre(jour = new Date()) {
  const aujourdhui = versDateISO(jour);
  const horizon = versDateISO(ajouterJours(jour, PREPARATION_MONTE_A));
  const plancher = versDateISO(ajouterJours(jour, -TRI_REMONTE_A));

  const evenements = verifier(
    await client
      .from('evenements')
      .select('id, titre, espace, date_debut, reunion_objet, avec_photos, type_moment, projet_id')
      .gte('date_debut', `${plancher}T00:00:00`)
      .lte('date_debut', `${horizon}T23:59:59`),
  );
  if (!evenements.length) return 0;

  const dejaPosees = verifier(
    await client
      .from('taches')
      .select('evenement_id, origine')
      .in('evenement_id', evenements.map((evenement) => evenement.id))
      .not('origine', 'is', null),
  );
  // Ce qui est déjà né de ces événements, tables confondues : le rattrapage se
  // rejoue à chaque ouverture, et c'est l'index unique de chaque table qui le
  // rend inoffensif. Une seule clé pour les deux — un événement ne peut pas
  // avoir une tâche et une parution de même origine.
  const dejaPubliees = verifier(
    await client
      .from('publications')
      .select('evenement_id, origine')
      .in('evenement_id', evenements.map((evenement) => evenement.id))
      .not('origine', 'is', null),
  );

  const dejaNees = new Set(
    [...dejaPosees, ...dejaPubliees].map((ligne) => `${ligne.evenement_id}:${ligne.origine}`),
  );

  const aPoser = [];
  const postsAPoser = [];
  for (const evenement of evenements) {
    const jourDe = versDateISO(new Date(evenement.date_debut));

    // La préparation : dans les 48 h, et pas après. Passé l'événement, préparer
    // n'a plus d'objet — on ne la pose donc pas rétroactivement.
    if (
      seDeclarePreparable(evenement) &&
      jourDe >= aujourdhui &&
      jourDe <= horizon &&
      !dejaNees.has(`${evenement.id}:preparation`)
    ) {
      aPoser.push({
        espace: evenement.espace,
        titre: `Préparer ${evenement.titre}`,
        statut: 'actif',
        // À J-2, pas au jour de l'événement : c'est le moment de la faire, pas
        // celui de la constater.
        echeance: versDateISO(ajouterJours(new Date(evenement.date_debut), -PREPARATION_MONTE_A)),
        priorite: 4,
        evenement_id: evenement.id,
        origine: 'preparation',
      });
    }

    // Le tri : le lendemain de l'événement, et seulement s'il portait des
    // photos. Il se pose APRÈS coup — c'est la seule tâche du hub qui regarde
    // en arrière.
    if (
      evenement.avec_photos &&
      !SANS_TACHE_AUTO.includes(evenement.espace) &&
      jourDe < aujourdhui &&
      jourDe >= plancher &&
      !dejaNees.has(`${evenement.id}:tri`)
    ) {
      aPoser.push({
        espace: evenement.espace,
        titre: `Trier les photos de ${evenement.titre}`,
        statut: 'actif',
        echeance: versDateISO(ajouterJours(new Date(evenement.date_debut), TRI_TOMBE_A)),
        priorite: 4,
        evenement_id: evenement.id,
        origine: 'tri',
      });
    }

    // LE POST DU MATCH, le lendemain. La troisième chose que le hub pose, et la
    // première qui ne soit pas une tâche : ce n'est pas du travail à cocher,
    // c'est une PARUTION, et une parution vit au calendrier éditorial avec son
    // réseau, son format et son cycle d'états.
    //
    // APRÈS COUP, comme le tri et non comme la préparation. Un post posé
    // d'avance sur un match où Noé n'ira pas est une promesse fausse, et le hub
    // a déjà tranché ce genre de question — `vecu` ne se pose jamais par le
    // temps qui passe. Conséquence assumée : la parution naît le jour même où
    // elle est prévue. Elle naît en « idée », donc rien ne part sans lui.
    if (
      meriteUnPostDeMatch(evenement) &&
      jourDe < aujourdhui &&
      jourDe >= plancher &&
      !dejaNees.has(`${evenement.id}:match`)
    ) {
      postsAPoser.push({
        espace: evenement.espace,
        titre: `Post ${evenement.titre}`,
        reseau: 'instagram',
        // Carrousel, et non « post » : c'est le format qui reste depuis le
        // 15 août, et un match donne plusieurs images par nature.
        format: 'carrousel',
        // Le premier état du cycle Yuno : le hub programme la parution, il
        // n'écrit pas à la place de Noé.
        statut: 'idee',
        date_prevue: versDateISO(ajouterJours(new Date(evenement.date_debut), POST_TOMBE_A)),
        // Le match sert peut-être un projet ; sa parution sert le même.
        projet_id: evenement.projet_id ?? null,
        evenement_id: evenement.id,
        origine: 'match',
      });
    }
  }

  if (postsAPoser.length) {
    verifier(
      await client
        .from('publications')
        .upsert(postsAPoser, { onConflict: 'evenement_id,origine', ignoreDuplicates: true })
        .select('id'),
    );
  }

  if (!aPoser.length) return postsAPoser.length;

  // `ignoreDuplicates` : deux onglets ouverts le même matin poseraient la même
  // ligne deux fois. L'index unique refuse la seconde, et on ne veut pas que ce
  // refus fasse échouer l'ouverture du hub.
  verifier(
    await client
      .from('taches')
      .upsert(aPoser, { onConflict: 'evenement_id,origine', ignoreDuplicates: true })
      .select('id'),
  );

  return aPoser.length + postsAPoser.length;
}
