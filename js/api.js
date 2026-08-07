// Tous les appels Supabase du hub passent par ce fichier.
// Rien d'autre dans le site ne doit importer supabase-js directement.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

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

export async function victoiresDuProjet(projet, limite = 10) {
  return verifier(
    await client
      .from('victoires')
      .select('*')
      .eq('projet', projet)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limite),
  );
}

export async function supprimerVictoire(id) {
  const { error } = await client.from('victoires').delete().eq('id', id);
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

export async function creerTache({ projet, titre, statut = 'backlog', echeance = null, objectif_id = null }) {
  return verifier(
    await client
      .from('taches')
      .insert({ projet, titre, statut, echeance, objectif_id })
      .select()
      .single(),
  );
}

export async function creerEvenement({ projet, titre, date_debut, date_fin = null, lieu = null, notes = null }) {
  return verifier(
    await client
      .from('evenements')
      .insert({ projet, titre, date_debut, date_fin, lieu, notes })
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

export async function creerPublication({ projet, titre, reseau = 'instagram', format = 'post', rubrique = null, notes = null, date_prevue = null }) {
  return verifier(
    await client
      .from('publications')
      .insert({ projet, titre, reseau, format, rubrique, notes, date_prevue })
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

// Livrer une commande crée sa victoire, comme une tâche terminée ou un jalon
// atteint (docs/yuno-spec.md, §4).
export async function livrerCommande(commande) {
  const livree = await modifierCommande(commande.id, { statut: 'livree' });
  const victoire = await ajouterVictoire({
    projet: 'photo',
    titre: `Commande livrée — ${livree.titre}`,
    source: 'manuel',
  });
  return { commande: livree, victoire };
}

// --- Le calendrier : tout ce qui porte une date ------------------------------
// Règle commune : on montre ce qui reste à vivre ou à faire. Un événement passé
// est passé ; une tâche ou une publication en retard de date reste affichée
// (sobrement — jamais en alerte) tant qu'elle n'est pas faite.

export async function evenementsDepuis(debutISO, { projet = null } = {}) {
  let requete = client
    .from('evenements')
    .select('*')
    .gte('date_debut', debutISO)
    .order('date_debut');

  if (projet) requete = requete.eq('projet', projet);
  return verifier(await requete);
}

export async function tachesDatees({ projet = null } = {}) {
  let requete = client
    .from('taches')
    .select('*')
    .neq('statut', 'fait')
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
