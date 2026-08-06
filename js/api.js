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
// Les lectures et écritures des 6 tables (objectifs, jalons, taches,
// evenements, victoires, humeur) viendront ici, une fonction par usage.
