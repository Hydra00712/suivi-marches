# 📘 DOSSIER DE CONCEPTION
## Système de Suivi des Marchés Publics

---

**Réalisé par :** Mohamed Adam Benaddi - Yahya Cherakoui - Mehdi Doukkali  
**Encadrant :** Younes ElBouzekri  
**Date :** Novembre 2025  
**Établissement :** Université Internationale de Rabat

---

# 📑 Table des Matières

1. [Cahier des Charges Modélisé](#1-cahier-des-charges-modélisé)
2. [Diagramme des Cas d'Utilisation](#2-diagramme-des-cas-dutilisation)
3. [Diagramme de Classes UML](#3-diagramme-de-classes-uml)
4. [Schéma Entité-Relation (Base de Données)](#4-schéma-entité-relation-base-de-données)
5. [Architecture de l'Application](#5-architecture-de-lapplication)
6. [Justification UI/UX](#6-justification-uiux)
7. [Diagramme d'Activité](#7-diagramme-dactivité)
8. [Diagramme de Séquence](#8-diagramme-de-séquence)
9. [Diagramme de Gantt](#9-diagramme-de-gantt)

---

# 1. Cahier des Charges Modélisé

## 1.1 Objectif du Système

Le système **"Suivi Marchés"** est une application web permettant la gestion et le suivi des marchés publics au sein d'une entreprise. Il offre une plateforme collaborative pour :

- Créer et gérer des projets de marché
- Suivre les tâches associées à chaque projet
- Permettre aux employés de valider ou signaler les tâches
- Offrir au chef de service une vue globale avec dashboard et statistiques
- Gérer les échéances et notifications
- Maintenir un historique complet des activités

## 1.2 Acteurs et Leurs Rôles

### 👤 Employé (Utilisateur Standard)

| Responsabilité | Description |
|----------------|-------------|
| Créer des projets | Soumettre de nouveaux besoins avec cahier des charges |
| Gérer les tâches | Créer, modifier et suivre les tâches |
| Valider les tâches | Approuver les tâches réalisées |
| Signaler les problèmes | Marquer une tâche comme "non pertinente" |
| Ajouter des commentaires | Commenter avec 3 niveaux de priorité |
| Consulter les notifications | Recevoir des alertes sur les échéances |

### 👔 Chef de Service (Administrateur)

| Responsabilité | Description |
|----------------|-------------|
| Tous les droits employé | Hérite de toutes les fonctionnalités employé |
| Valider les projets | Approbation finale des projets |
| Consulter le dashboard | Vue statistiques et graphiques |
| Voir les stats employés | Performance par employé |
| Superviser tous les projets | Vision globale du service |

## 1.3 Exigences Fonctionnelles

### EF-01 : Authentification
- Connexion par email et mot de passe
- Inscription avec choix du rôle
- Verrouillage après 5 tentatives échouées
- Déconnexion sécurisée

### EF-02 : Gestion des Projets
- Création avec titre, description, budget, deadline, durée
- Upload de cahier des charges (PDF, DOC, XLS)
- Visualisation et téléchargement du CPS
- Modification et suppression
- Validation finale par le chef

### EF-03 : Gestion des Tâches
- Création avec titre, date finale, durée, état
- 4 états possibles : En attente, En cours, Validée, Non validée
- Validation par les employés du service
- Signalement comme "non pertinent"
- Code couleur par état

### EF-04 : Système de Commentaires
- 3 types de commentaires :
  - 🔴 **Urgent** : Persiste pour alerter le chef
  - 🟡 **Quotidien** : Remarques courantes
  - 🔵 **Informatif** : Notes pour le maître d'œuvre

### EF-05 : Matrice d'Approbation
- Grille employé × tâche
- Visualisation des validations
- Calcul du pourcentage d'approbation
- Condition pour validation projet : toutes tâches validées

### EF-06 : Timeline/Gantt des Tâches
- Vue chronologique des tâches
- Barres de progression colorées
- Indicateur "Aujourd'hui"
- Durée et dates visibles

### EF-07 : Dashboard (Chef uniquement)
- Statistiques générales (projets, tâches, budget)
- Graphique tendance mensuelle
- Camembert des états de tâches
- Top 5 des projets par complétion
- Budget par service
- Échéances dans les 15 jours

### EF-08 : Notifications
- Alertes 15 jours avant échéance
- Notifications de validation
- Centre de notifications
- Préférences personnalisables

### EF-09 : Historique d'Activité
- Journal d'audit complet
- Actions tracées avec horodatage
- Filtrage par type d'action

## 1.4 Exigences Non Fonctionnelles

| Code | Exigence | Description |
|------|----------|-------------|
| **ENF-01** | Performance | Temps de réponse < 2 secondes |
| **ENF-02** | Disponibilité | Application accessible 24/7 |
| **ENF-03** | Sécurité | Mots de passe hachés, sessions sécurisées |
| **ENF-04** | Compatibilité | Chrome, Firefox, Edge, Safari |
| **ENF-05** | Responsive | Adaptation mobile/tablette/desktop |
| **ENF-06** | Accessibilité | Navigation clavier, contrastes |
| **ENF-07** | Maintenabilité | Code modulaire, TypeScript typé |
| **ENF-08** | Persistance | Données sauvegardées (localStorage/DB) |

## 1.5 Description des Processus

### Processus 1 : Création et Validation d'un Projet

```
1. L'employé crée un nouveau projet
2. L'employé ajoute le cahier des charges (CPS)
3. L'employé crée les tâches associées
4. Les employés du service valident les tâches
5. Quand toutes les tâches sont validées → projet prêt
6. Le chef de service valide le projet
7. Le projet passe en état "Validé"
```

### Processus 2 : Gestion des Tâches

```
1. Création de la tâche (état: en_attente)
2. Travail en cours (état: en_cours)
3. Employés ajoutent des commentaires
4. Employés valident ou signalent "non pertinent"
5. Si majorité valide → état: validee
6. Si problème → état: non_validee
```

### Processus 3 : Système de Notifications

```
1. Système vérifie quotidiennement les échéances
2. Si tâche à < 15 jours → notification créée
3. Utilisateur consulte ses notifications
4. Marque comme lue ou agit
```

## 1.6 Contraintes

| Type | Contrainte |
|------|------------|
| **Technique** | Angular 16+, TypeScript, localStorage (demo) |
| **Temporelle** | Développement en 4 semaines |
| **Organisationnelle** | 1-2 développeurs |
| **Sécurité** | Authentification obligatoire |
| **Données** | Maximum 1000 projets, 10000 tâches |

## 1.7 Règles Métier

| Code | Règle |
|------|-------|
| **RM-01** | Un projet ne peut être validé que si TOUTES ses tâches sont approuvées |
| **RM-02** | Seul le chef de service peut valider un projet |
| **RM-03** | Un employé ne peut valider que les tâches de son service |
| **RM-04** | Les commentaires "Urgents" persistent jusqu'à résolution |
| **RM-05** | Une tâche doit avoir une date finale et une durée |
| **RM-06** | Le budget d'un projet doit être positif |
| **RM-07** | Un compte est verrouillé après 5 tentatives de connexion échouées |
| **RM-08** | Les notifications sont générées 15 jours avant échéance |

---

# 2. Diagramme des Cas d'Utilisation

## 2.1 Description

Le diagramme des cas d'utilisation présente les interactions entre les acteurs (Employé, Chef de Service) et le système.

### Cas d'utilisation principaux :

| Acteur | Cas d'utilisation |
|--------|-------------------|
| **Employé** | S'authentifier, Créer projet, Gérer tâches, Valider tâche, Ajouter commentaire, Consulter notifications |
| **Chef** | (Tous les cas employé) + Valider projet, Consulter dashboard, Voir stats employés |
| **Système** | Générer notifications, Calculer statistiques, Vérifier échéances |

---

### 📊 [INSÉRER DIAGRAMME DES CAS D'UTILISATION ICI]

> **Espace réservé pour le diagramme Use Case**
>
> Dimensions recommandées : Largeur 100%, Hauteur ~400px
>
> ![Diagramme Use Case](./diagrams/use-case-diagram.png)

---

# 3. Diagramme de Classes UML

## 3.1 Description des Classes

| Classe | Attributs Principaux | Responsabilité |
|--------|---------------------|----------------|
| **Employee** | id, name, email, role, serviceId | Utilisateur du système |
| **Project** | id, title, budget, deadline, validatedByChef | Projet de marché |
| **Task** | id, title, state, validatedBy[], finalDate | Tâche d'un projet |
| **Comment** | id, content, type, userId | Commentaire sur tâche |
| **OrgService** | id, name | Service de l'entreprise |
| **CahierDeCharge** | fileName, base64, mimeType | Fichier CPS |
| **Notification** | id, type, message, read | Alerte utilisateur |

## 3.2 Relations

- **Employee** (1) --- (N) **Project** : Un employé crée plusieurs projets
- **Project** (1) --- (N) **Task** : Un projet contient plusieurs tâches
- **Task** (1) --- (N) **Comment** : Une tâche a plusieurs commentaires
- **Employee** (N) --- (N) **Task** : Validation (validatedBy[])
- **OrgService** (1) --- (N) **Employee** : Un service contient plusieurs employés
- **Project** (1) --- (0..1) **CahierDeCharge** : Fichier optionnel

---

### 📊 [INSÉRER DIAGRAMME DE CLASSES UML ICI]

> **Espace réservé pour le diagramme de classes**
>
> Dimensions recommandées : Largeur 100%, Hauteur ~500px
>
> ![Diagramme de Classes](./diagrams/class-diagram.png)

---

# 4. Schéma Entité-Relation (Base de Données)

## 4.1 Entités et Attributs

### Table: employees
```sql
CREATE TABLE employees (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('employe', 'chef') NOT NULL,
    service_id VARCHAR(36) REFERENCES services(id),
    failed_login_attempts INT DEFAULT 0,
    locked_until DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Table: projects
```sql
CREATE TABLE projects (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    owner_id VARCHAR(36) REFERENCES employees(id),
    service_id VARCHAR(36) REFERENCES services(id),
    budget DECIMAL(12,2),
    deadline DATE,
    duration_days INT,
    validated_by_chef BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Table: tasks
```sql
CREATE TABLE tasks (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) REFERENCES projects(id),
    title VARCHAR(200) NOT NULL,
    final_date DATE,
    duration INT,
    state ENUM('en_attente', 'en_cours', 'validee', 'non_validee'),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Table: task_validations
```sql
CREATE TABLE task_validations (
    task_id VARCHAR(36) REFERENCES tasks(id),
    employee_id VARCHAR(36) REFERENCES employees(id),
    validation_type ENUM('validated', 'not_pertinent'),
    validated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, employee_id)
);
```

### Table: comments
```sql
CREATE TABLE comments (
    id VARCHAR(36) PRIMARY KEY,
    task_id VARCHAR(36) REFERENCES tasks(id),
    user_id VARCHAR(36) REFERENCES employees(id),
    content TEXT NOT NULL,
    type ENUM('urgent', 'quotidien', 'informatif'),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### 📊 [INSÉRER SCHÉMA ENTITÉ-RELATION ICI]

> **Espace réservé pour le diagramme ER**
>
> Dimensions recommandées : Largeur 100%, Hauteur ~450px
>
> ![Schéma ER](./diagrams/er-diagram.png)

---

# 5. Architecture de l'Application

## 5.1 Vue d'Ensemble

L'application est construite avec **Angular 16** suivant une architecture modulaire et le pattern **Smart/Dumb Components**.

```
┌─────────────────────────────────────────────────────────────┐
│                      PRÉSENTATION                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Login     │  │  Dashboard  │  │   Projects  │   ...   │
│  │  Component  │  │  Component  │  │  Component  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
├─────────────────────────────────────────────────────────────┤
│                       SERVICES                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  Auth    │ │ Project  │ │  Task    │ │  Toast   │ ...  │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
├─────────────────────────────────────────────────────────────┤
│                      STOCKAGE                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  localStorage                        │   │
│  │    employees | projects | tasks | notifications      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 5.2 Structure des Modules

```
src/app/
├── 📁 core/                    # Cœur de l'application
│   ├── 📁 models/              # Interfaces TypeScript (7 fichiers)
│   │   ├── employee.model.ts
│   │   ├── project.model.ts
│   │   ├── task.model.ts
│   │   ├── comment.model.ts
│   │   ├── notification.model.ts
│   │   ├── cahier.model.ts
│   │   └── service.model.ts
│   ├── 📁 services/            # Services injectables (10 fichiers)
│   │   ├── auth.service.ts
│   │   ├── project.service.ts
│   │   ├── task.service.ts
│   │   ├── notification.service.ts
│   │   ├── search.service.ts
│   │   ├── activity-log.service.ts
│   │   ├── theme.service.ts
│   │   ├── confetti.service.ts
│   │   └── ...
│   └── 📁 guards/              # Protections de routes
│       ├── auth.guard.ts
│       ├── chef.guard.ts
│       └── employee.guard.ts
│
├── 📁 features/                # Modules fonctionnels
│   ├── 📁 auth/                # Authentification
│   │   ├── login/
│   │   └── register/
│   ├── 📁 projects/            # Gestion projets
│   │   ├── project-list/
│   │   ├── project-detail/
│   │   ├── project-form/
│   │   ├── approval-matrix/
│   │   ├── task-timeline/
│   │   └── activity-history/
│   ├── 📁 dashboard/           # Tableaux de bord
│   ├── 📁 tasks/               # Gestion tâches
│   ├── 📁 notifications/       # Centre notifications
│   └── 📁 settings/            # Préférences
│
├── 📁 shared/                  # Composants réutilisables
│   └── 📁 components/
│       ├── toast/
│       ├── global-search/
│       ├── splash-screen/
│       ├── confetti/
│       ├── keyboard-shortcuts/
│       └── theme-toggle/
│
└── app.module.ts               # Module racine
```

## 5.3 Services et Injection de Dépendances

Tous les services utilisent le pattern **Singleton** avec `providedIn: 'root'` :

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser$ = new BehaviorSubject<Employee | null>(null);
  // ...
}
```

### Services Principaux :

| Service | Responsabilité | Pattern |
|---------|---------------|---------|
| **AuthService** | Authentification, gestion sessions | BehaviorSubject |
| **ProjectService** | CRUD projets | BehaviorSubject + localStorage |
| **TaskService** | CRUD tâches, validations | BehaviorSubject |
| **NotificationService** | Alertes, échéances | Polling 30s |
| **SearchService** | Recherche globale | Pure function |
| **ThemeService** | Dark/Light mode | BehaviorSubject |
| **ConfettiService** | Célébrations | Subject (event) |

## 5.4 Routing et Navigation

```typescript
const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Routes Employé (protégées)
  {
    path: 'projects',
    canActivate: [AuthGuard, EmployeeGuard],
    children: [
      { path: '', component: ProjectListComponent },
      { path: 'new', component: ProjectFormComponent },
      { path: ':id', component: ProjectDetailComponent }
    ]
  },

  // Routes Chef (protégées)
  {
    path: 'chef',
    canActivate: [AuthGuard, ChefGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'projects', component: ChefProjectsComponent },
      { path: 'stats/employes', component: EmployeeStatsComponent }
    ]
  }
];
```

## 5.5 Guards de Protection

| Guard | Rôle |
|-------|------|
| **AuthGuard** | Vérifie si l'utilisateur est connecté |
| **ChefGuard** | Vérifie si l'utilisateur est chef de service |
| **EmployeeGuard** | Vérifie si l'utilisateur est employé |

## 5.6 Stockage des Données

En mode démonstration, l'application utilise **localStorage** :

```typescript
// Clés de stockage
const STORAGE_KEYS = {
  EMPLOYEES: 'sm_employees',
  PROJECTS: 'sm_projects',
  TASKS: 'sm_tasks',
  SERVICES: 'sm_services',
  NOTIFICATIONS: 'sm_notifications',
  ACTIVITY_LOG: 'sm_activity_log',
  CURRENT_USER: 'sm_current_user',
  THEME: 'theme'
};
```

---

# 6. Justification UI/UX

## 6.1 Principes Respectés

Le professeur a demandé :
> "Simplifier au maximum l'utilisation → convivialité… images… réduire clics… vues selon profil"

### ✅ Simplicité d'Utilisation

| Critère | Implémentation |
|---------|----------------|
| **Navigation claire** | Sidebar avec icônes + texte |
| **Actions visibles** | Boutons colorés, états clairs |
| **Feedback immédiat** | Toast notifications |
| **Recherche rapide** | Ctrl+K pour recherche globale |

### ✅ Convivialité

| Élément | Description |
|---------|-------------|
| **Splash Screen** | Accueil animé professionnel |
| **Confetti** | Célébration lors validation projet |
| **Thème Dark/Light** | Confort visuel personnalisé |
| **Raccourcis clavier** | Navigation rapide (?, G+D, G+P) |

### ✅ Réduction des Clics

| Action | Nombre de clics |
|--------|-----------------|
| Créer un projet | 1 clic (bouton "Nouveau") |
| Valider une tâche | 1 clic (bouton "Valider") |
| Rechercher | 0 clic (Ctrl+K) |
| Changer de thème | 1 clic (toggle) |
| Voir les détails | 1 clic (ligne du tableau) |

### ✅ Vues Selon le Profil

| Rôle | Vue |
|------|-----|
| **Employé** | Mes Projets, Mes Notifications, Paramètres |
| **Chef** | Dashboard, Tous les Projets, Stats Employés, Notifications |

## 6.2 Éléments Visuels

### Codes Couleur des États

| État | Couleur | Code |
|------|---------|------|
| En attente | 🟠 Orange | `#f59e0b` |
| En cours | 🔵 Bleu | `#3b82f6` |
| Validée | 🟢 Vert | `#22c55e` |
| Non validée | 🔴 Rouge | `#ef4444` |

### Animations

| Animation | Usage |
|-----------|-------|
| Splash screen | Chargement initial |
| Confetti | Validation projet |
| Page transitions | Navigation fluide |
| Hover effects | Interactivité |
| Loading shimmer | Chargement données |

### Icônes Emoji

Utilisation d'emojis natifs pour une meilleure lisibilité :
- 📊 Dashboard
- 📁 Projets
- ✅ Validation
- 🔔 Notifications
- ⚙️ Paramètres
- 🔴🟡🔵 Types de commentaires

---

# 7. Diagramme d'Activité

## 7.1 Description

Le diagramme d'activité illustre le **workflow de validation d'un projet**, depuis sa création jusqu'à sa validation finale par le chef de service.

### Étapes du Processus :

```
┌─────────────────┐
│  Début          │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Créer Projet    │ ◄── Employé
└────────┬────────┘
         ▼
┌─────────────────┐
│ Uploader CPS    │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Créer Tâches    │
└────────┬────────┘
         ▼
┌─────────────────┐
│ Employés        │
│ valident tâches │
└────────┬────────┘
         ▼
    ┌────◆────┐
    │ Toutes  │
    │validées?│
    └────┬────┘
    Non/ \Oui
      /   \
     ▼     ▼
┌────────┐ ┌─────────────┐
│Attendre│ │Chef valide  │
│        │ │projet       │
└───┬────┘ └──────┬──────┘
    │             ▼
    │      ┌────────────┐
    └─────►│   Fin      │
           └────────────┘
```

---

### 📊 [INSÉRER DIAGRAMME D'ACTIVITÉ ICI]

> **Espace réservé pour le diagramme d'activité**
>
> Dimensions recommandées : Largeur 100%, Hauteur ~500px
>
> ![Diagramme d'Activité](./diagrams/activity-diagram.png)

---

# 8. Diagramme de Séquence

## 8.1 Description

Le diagramme de séquence montre les **interactions entre les acteurs et le système** lors du processus de validation d'une tâche.

### Scénario : Validation d'une Tâche

```
┌────────┐          ┌────────┐          ┌────────┐          ┌────────┐
│Employé │          │   UI   │          │TaskSvc │          │Storage │
└───┬────┘          └───┬────┘          └───┬────┘          └───┬────┘
    │                   │                   │                   │
    │ 1. Clic "Valider" │                   │                   │
    │──────────────────►│                   │                   │
    │                   │                   │                   │
    │                   │ 2. validate(      │                   │
    │                   │    taskId, odId)  │                   │
    │                   │──────────────────►│                   │
    │                   │                   │                   │
    │                   │                   │ 3. update task    │
    │                   │                   │──────────────────►│
    │                   │                   │                   │
    │                   │                   │ 4. OK             │
    │                   │                   │◄──────────────────│
    │                   │                   │                   │
    │                   │ 5. emit update    │                   │
    │                   │◄──────────────────│                   │
    │                   │                   │                   │
    │ 6. Toast "Validé" │                   │                   │
    │◄──────────────────│                   │                   │
    │                   │                   │                   │
    │ 7. UI mise à jour │                   │                   │
    │◄──────────────────│                   │                   │
```

### Scénario : Validation du Projet par le Chef

```
┌──────┐        ┌────────┐        ┌──────────┐        ┌────────┐        ┌──────────┐
│ Chef │        │   UI   │        │ProjectSvc│        │ConfettiSvc     │  Storage │
└──┬───┘        └───┬────┘        └────┬─────┘        └────┬───┘        └────┬─────┘
   │                │                  │                   │                 │
   │ 1. Clic        │                  │                   │                 │
   │ "Valider"      │                  │                   │                 │
   │───────────────►│                  │                   │                 │
   │                │                  │                   │                 │
   │                │ 2. Vérifier      │                   │                 │
   │                │ toutes tâches OK │                   │                 │
   │                │─────────────────►│                   │                 │
   │                │                  │                   │                 │
   │                │ 3. true          │                   │                 │
   │                │◄─────────────────│                   │                 │
   │                │                  │                   │                 │
   │                │ 4. update(       │                   │                 │
   │                │ validatedByChef) │                   │                 │
   │                │─────────────────►│                   │                 │
   │                │                  │ 5. save           │                 │
   │                │                  │────────────────────────────────────►│
   │                │                  │                   │                 │
   │                │ 6. fire()        │                   │                 │
   │                │─────────────────────────────────────►│                 │
   │                │                  │                   │                 │
   │ 7. 🎉 Confetti │                  │                   │                 │
   │◄───────────────│                  │                   │                 │
   │                │                  │                   │                 │
   │ 8. Toast       │                  │                   │                 │
   │ "Projet validé"│                  │                   │                 │
   │◄───────────────│                  │                   │                 │
```

---

### 📊 [INSÉRER DIAGRAMME DE SÉQUENCE ICI]

> **Espace réservé pour le diagramme de séquence**
>
> Dimensions recommandées : Largeur 100%, Hauteur ~450px
>
> ![Diagramme de Séquence](./diagrams/sequence-diagram.png)

---

# 9. Diagramme de Gantt

## 9.1 Planification du Projet

Le diagramme de Gantt présente les phases de développement du système "Suivi Marchés".

### Phases de Développement :

| Phase | Durée | Semaine |
|-------|-------|---------|
| **Phase 1 : Analyse** | 1 semaine | S1 |
| - Recueil des besoins | 2 jours | |
| - Rédaction cahier des charges | 2 jours | |
| - Modélisation UML | 1 jour | |
| **Phase 2 : Conception** | 1 semaine | S2 |
| - Architecture technique | 2 jours | |
| - Design UI/UX | 2 jours | |
| - Schéma base de données | 1 jour | |
| **Phase 3 : Développement** | 2 semaines | S3-S4 |
| - Setup Angular + Structure | 1 jour | |
| - Module Auth | 2 jours | |
| - Module Projects | 3 jours | |
| - Module Tasks | 2 jours | |
| - Module Dashboard | 2 jours | |
| - Composants spéciaux | 2 jours | |
| - Tests & Debug | 2 jours | |
| **Phase 4 : Livraison** | 2 jours | S4 |
| - Documentation | 1 jour | |
| - Déploiement | 1 jour | |

### Représentation Textuelle :

```
Semaine      │ S1  │ S2  │ S3  │ S4  │
─────────────┼─────┼─────┼─────┼─────┤
Analyse      │████ │     │     │     │
Conception   │     │████ │     │     │
Développement│     │     │████████████│
Livraison    │     │     │     │  ██ │
─────────────┴─────┴─────┴─────┴─────┘
```

---

### 📊 [INSÉRER DIAGRAMME DE GANTT ICI]

> **Espace réservé pour le diagramme de Gantt**
>
> Dimensions recommandées : Largeur 100%, Hauteur ~350px
>
> ![Diagramme de Gantt](./diagrams/gantt-diagram.png)

---

# 📎 Annexes

## A. Captures d'Écran de l'Application

### A.1 Page de Connexion

> **[INSÉRER CAPTURE : Login]**

### A.2 Dashboard (Vue Chef)

> **[INSÉRER CAPTURE : Dashboard]**

### A.3 Liste des Projets

> **[INSÉRER CAPTURE : Projects List]**

### A.4 Détail d'un Projet

> **[INSÉRER CAPTURE : Project Detail]**

### A.5 Matrice d'Approbation

> **[INSÉRER CAPTURE : Approval Matrix]**

### A.6 Timeline des Tâches

> **[INSÉRER CAPTURE : Task Timeline]**

### A.7 Splash Screen

> **[INSÉRER CAPTURE : Splash Screen]**

### A.8 Mode Sombre

> **[INSÉRER CAPTURE : Dark Mode]**

---

## B. Technologies Utilisées

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| Framework | Angular | 16.2.0 |
| Langage | TypeScript | 5.1.3 |
| Réactivité | RxJS | 7.8.0 |
| Styling | SCSS | - |
| Build | Angular CLI | 16.2.16 |
| Storage | localStorage | - |

---

## C. Comptes de Démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Chef de Service | chef@demo.com | Demo123! |
| Employé | employe@demo.com | Demo123! |

---

## D. Raccourcis Clavier

| Raccourci | Action |
|-----------|--------|
| `?` | Afficher l'aide |
| `Ctrl+K` | Recherche globale |
| `G` puis `D` | Aller au Dashboard |
| `G` puis `P` | Aller aux Projets |
| `G` puis `N` | Aller aux Notifications |
| `Esc` | Fermer les modals |

---

**Fin du Dossier de Conception**

---

*Document généré le : Novembre 2025*
*Version : 1.0*

