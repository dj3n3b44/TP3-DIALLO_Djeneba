# TRACE — Règles du projet

## Contexte

- Monorepo npm (workspaces) : `apps/*` (web, api) et `packages/*` (core).
- Projet type : `apps/web` (React + Vite), `apps/api` (Node.js + TypeScript), `packages/core` (logique partagée TypeScript).
- Sujet pédagogique : `docs/sujet-tp3.pdf`. Ne jamais le modifier.

## Périmètre et interdits

- Travailler **exclusivement** dans ce dépôt (`C:\Users\djeneba\Documents\cours\ia\projet`).
- **Ne jamais lire ni modifier** les dépôts voisins TP1 et TP2 (hors périmètre).
- Ne jamais lire, afficher ou copier des secrets. Ne pas créer de fichier `.env` réel.
- Ne jamais faire de `git commit` ni `git push` sauf demande explicite de l'utilisateur.

## Commandes

Exécuter les contrôles depuis la racine du dépôt (sans changer de répertoire) :

- `npm run lint` — ESLint (flat config, `--max-warnings 0`).
- `npm run typecheck` — TypeScript strict sur les trois workspaces (`tsc --noEmit`).
- `npm run test` — Vitest (tests de démonstration de l'infrastructure).
- `npm run check` — exécute lint + typecheck + test, échoue si l'un échoue.

Sur Windows, utiliser `npm.cmd` si le shell est PowerShell (politique d'exécution bloquant les shims `.ps1`).

## Conventions

- TypeScript **strict** (`tsconfig.base.json`). Ne pas désactiver `strict`, `noUncheckedIndexedAccess`, ni les contrôles `noUnused*`.
- Config et scripts en `type: "module"`.
- Les packages partagés s'importent par nom de workspace : `@trace/core`.
- Formatage : Prettier (`.prettierrc.json`). Vérifier le format avant de terminer une tâche.
- Chaque controleur ESLint utilisé doit être justifié ; aucune dépendance inutile.

## État d'avancement

- Étape 0 : socle technique minimal (infrastructure, pas de fonctionnalité métier TRACE).
- Ne pas développer de logique métier TRACE avant l'étape suivante.
