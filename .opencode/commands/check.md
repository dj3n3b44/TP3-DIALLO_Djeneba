---
description: Exécute les contrôles du socle (lint + typecheck + test) et analyse le résultat.
agent: tester
---

Exécute `npm run check` à la racine du dépôt. Analyse la sortie :

- Si tous les contrôles passent, confirme-le brièvement et signale le cas échéant l'état d'avancement.
- Sinon, liste les erreurs par contrôle et propose des corrections ciblées.

Corrige uniquement les fichiers nécessaires, puis relance `npm run check` jusqu'à ce qu'il réussisse.
Ne fais aucun commit ni push. Ne modifie pas `docs/sujet-tp3.pdf`, ne lis ni ne modifie les dépôts TP1/TP2, ne crée pas de fichier `.env`.
