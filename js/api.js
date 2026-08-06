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
