# Diagramme de Gantt - Suivi des Marchés

## Version Mermaid (Recommandée)

```mermaid
gantt
    dateFormat  YYYY-MM-DD
    title Suivi des Marchés - Planning Projet

    section Phase 1: Analyse
    Recueil des besoins           :done, p1a, 2025-10-28, 2d
    Rédaction cahier des charges  :done, p1b, 2025-10-30, 2d
    Modélisation UML              :done, p1c, 2025-11-01, 1d

    section Phase 2: Conception
    Architecture technique        :done, p2a, 2025-11-04, 2d
    Design UI/UX                  :done, p2b, 2025-11-06, 2d
    Schéma base de données        :done, p2c, 2025-11-08, 1d

    section Phase 3: Développement
    Setup Angular + Structure     :done, p3a, 2025-11-11, 1d
    Module Authentification       :done, p3b, 2025-11-12, 2d
    Module Projects               :done, p3c, 2025-11-14, 3d
    Module Tasks                  :done, p3d, 2025-11-17, 2d
    Module Dashboard              :done, p3e, 2025-11-19, 2d
    Composants spéciaux           :done, p3f, 2025-11-21, 2d
    Tests & Debug                 :done, p3g, 2025-11-23, 2d

    section Phase 4: Livraison
    Documentation                 :active, p4a, 2025-11-25, 1d
    Déploiement                   :p4b, 2025-11-26, 1d
```

## Légende

| Statut | Couleur | Description |
|--------|---------|-------------|
| `done` | 🟢 Vert | Tâche terminée |
| `active` | 🔵 Bleu | Tâche en cours |
| (vide) | ⬜ Gris | Tâche à faire |

## Comment utiliser

1. **GitHub/GitLab** : Copiez ce fichier dans votre repo, le Gantt s'affiche automatiquement
2. **VS Code** : Installez l'extension "Markdown Preview Mermaid Support"
3. **En ligne** : Collez sur https://mermaid.live pour exporter en PNG/SVG

