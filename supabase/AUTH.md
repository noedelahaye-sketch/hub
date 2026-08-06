# Authentification — état et étapes restantes

Le hub a un seul utilisateur : Noé. Aucune inscription publique.

## Ce qui est en place (par migration, versionné)

- RLS activée sur les 6 tables.
- Politiques `select` / `insert` / `update` / `delete` réservées au rôle `authenticated`.
- Privilèges Postgres accordés à `authenticated` uniquement. `anon` n'a aucun
  privilège : sans session, la clé publique ne donne accès à rien.

Vérifié le 6 août 2026 : une requête REST avec la clé publique et sans session
renvoie `401 permission denied` en lecture comme en écriture, sur toutes les tables.

## Configuration Auth du projet

Ces réglages relèvent de la configuration Auth et non du schéma SQL : ils ne
peuvent pas être écrits dans une migration. Faits à la main dans le dashboard le
6 août 2026, puis vérifiés :

- **Un seul compte**, `noedelahaye@gmail.com`, confirmé.
- **Inscriptions publiques fermées** : `disable_signup` vaut `true`.
- **Seul le provider e-mail est actif** ; aucun provider externe, et les sessions
  anonymes sont désactivées.

Vérification reproductible — la tentative doit renvoyer `422 signup_disabled`, et
le nombre de comptes rester à 1 :

```
curl -X POST "https://dpkyealzuabwchccdqcv.supabase.co/auth/v1/signup" \
  -H "apikey: <clé publique>" -H "Content-Type: application/json" \
  -d '{"email":"verif-signup@example.com","password":"..."}'
```

L'état courant se lit aussi sans effet de bord sur
`GET /auth/v1/settings` avec la clé publique.

### Si le compte doit être recréé un jour

Authentication → Users → Add user, en cochant « Auto Confirm User » ; puis
Authentication → Sign In / Providers → Email → désactiver « Allow new users to
sign up ». Dans cet ordre : inscriptions fermées, la création échoue.

## Côté site (à venir)

Le site affiche un écran de connexion simple si la session est absente. La session
persiste entre les visites (comportement par défaut de `supabase-js`, qui la stocke
dans le `localStorage` et rafraîchit le token).
