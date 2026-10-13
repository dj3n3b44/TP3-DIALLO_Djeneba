# Démonstration orale — 2 à 3 minutes

## Préparation (avant la séance)

Deux terminaux ouverts à la racine du dépôt :

```bash
npm ci
npm run dev -w @trace/api      # terminal 1 → http://localhost:3000
npm run dev -w @trace/web      # terminal 2 → http://localhost:5173
```

Laisser ensuite le navigateur ouvert sur <http://localhost:5173>.

## Déroulé

1. **Vue d'ensemble (20 s).** Ouvrir `#/`. Présenter l'affaire : un cargo, une caisse scellée,
   des scellés brisés. Montrer les chiffres du dossier et les contradictions prioritaires.

2. **Recherche et preuve (40 s).** Aller dans **Documents**, taper `coton`. Les occurrences sont
   surlignées (accents/ligatures gérés). Ouvrir une pièce. Depuis **Contradictions**, cliquer
   « Ouvrir la source » : le document s'ouvre et **l'extrait exact est mis en évidence**
   (`Extrait cité`). C'est le cœur de la crédibilité : chaque contradiction cite ses preuves.

3. **Chronologie (30 s).** Ouvrir **Chronologie**. Filtrer par personne ou lieu (ex. un docker, le
   quai 7). Déplier une carte d'évènement pour lire le détail.

4. **Graphe (30 s).** Ouvrir **Graphe**. Zoomer / déplacer. Sélectionner un nœud : la fiche et les
   connexions s'affichent. Masquer un calque (légende). Montrer que les nœuds se sélectionnent au
   clavier (`Tab` puis `Entrée`).

5. **Solidité (30 s).** Tester des entrées absurdes : route inconnue (`#/inconnu` → vue d'ensemble),
   document inexistant (→ message d'erreur + « Réessayer »), recherche sans résultat (→ état vide),
   graphe tous calques masqués (→ état vide). Rien ne casse.

6. **Le filet et la chaîne (20 s).** Dans un terminal :

   ```bash
   npm.cmd run check
   ```

   Montrer lint + typecheck + tests qui passent. Mentionner le harness : agents `architect`,
   `reviewer`, `tester`, la commande `/check`, le plugin de garde et la CI.

## Points à souligner

- Zéro dépendance runtime ajoutée (React + workspace `@trace/core` seulement).
- API et logique partagée entièrement testées (150 tests).
- Erreurs réseau / 400 / 404 gérées avec des états visibles.
