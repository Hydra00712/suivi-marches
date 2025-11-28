# 📊 Suivi Marchés - Rapport Technique Complet

## 📋 Table des Matières

1. [Présentation du Projet](#présentation-du-projet)
2. [Stack Technologique](#stack-technologique)
3. [Architecture de l'Application](#architecture-de-lapplication)
4. [Fonctionnalités Principales](#fonctionnalités-principales)
5. [Modèles de Données](#modèles-de-données)
6. [Services et Logique Métier](#services-et-logique-métier)
7. [Composants UI Spéciaux](#composants-ui-spéciaux)
8. [Sécurité et Authentification](#sécurité-et-authentification)
9. [Animations et Effets Visuels](#animations-et-effets-visuels)
10. [Guide d'Installation](#guide-dinstallation)

---

## 🎯 Présentation du Projet

**Suivi Marchés** est un système de gestion des marchés publics permettant le suivi des projets, des tâches et des validations au sein d'une entreprise. L'application gère deux rôles principaux :

- **Employé** : Peut créer des projets, gérer des tâches, ajouter des commentaires et valider les tâches
- **Chef de Service** : Possède tous les droits des employés + validation finale des projets, accès au dashboard et aux statistiques

### Spécifications Fonctionnelles

| Fonctionnalité | Description |
|----------------|-------------|
| Gestion des Projets | CRUD complet avec cahier des charges (CPS) |
| Gestion des Tâches | Création, modification, validation, timeline Gantt |
| Système de Commentaires | 3 types : Urgent, Quotidien, Informatif |
| Matrice d'Approbation | Visualisation des validations par employé |
| Notifications | Alertes pour les échéances à 15 jours |
| Dashboard Dynamique | Graphiques générés depuis les données réelles |

---

## 🛠️ Stack Technologique

### Framework Principal

| Technologie | Version | Rôle |
|-------------|---------|------|
| **Angular** | 16.2.0 | Framework frontend SPA |
| **TypeScript** | 5.1.3 | Langage de programmation typé |
| **RxJS** | 7.8.0 | Programmation réactive |
| **Zone.js** | 0.13.0 | Change detection Angular |

### Outils de Build

| Outil | Version | Rôle |
|-------|---------|------|
| **Angular CLI** | 16.2.16 | CLI de développement |
| **Webpack** | (intégré) | Bundler de modules |
| **TypeScript Compiler** | 5.1.3 | Compilation TS → JS |

### Styling

| Technologie | Utilisation |
|-------------|-------------|
| **SCSS/Sass** | Préprocesseur CSS avec variables et mixins |
| **CSS Variables** | Thèmes dark/light dynamiques |
| **CSS Animations** | Keyframes pour effets visuels |
| **Flexbox/Grid** | Layout responsive |

### Stockage des Données

| Solution | Utilisation |
|----------|-------------|
| **localStorage** | Persistance des données (demo) |
| **sessionStorage** | État de session (splash screen) |
| **Base64 Encoding** | Stockage des fichiers CPS |

---

## 🏗️ Architecture de l'Application

```
src/
├── app/
│   ├── core/                    # Services et modèles globaux
│   │   ├── models/              # Interfaces TypeScript
│   │   │   ├── employee.model.ts
│   │   │   ├── project.model.ts
│   │   │   ├── task.model.ts
│   │   │   ├── comment.model.ts
│   │   │   ├── service.model.ts
│   │   │   ├── cahier.model.ts
│   │   │   └── notification.model.ts
│   │   └── services/            # Services injectables
│   │       ├── auth.service.ts
│   │       ├── project.service.ts
│   │       ├── task.service.ts
│   │       ├── employee.service.ts
│   │       ├── notification.service.ts
│   │       ├── search.service.ts
│   │       ├── activity-log.service.ts
│   │       ├── confetti.service.ts
│   │       └── theme.service.ts
│   ├── features/                # Modules fonctionnels
│   │   ├── auth/                # Login, Register
│   │   ├── projects/            # CRUD Projets, Tâches
│   │   ├── dashboard/           # Tableaux de bord
│   │   ├── notifications/       # Centre de notifications
│   │   └── settings/            # Préférences utilisateur
│   ├── shared/                  # Composants réutilisables
│   │   └── components/
│   │       ├── toast/
│   │       ├── global-search/
│   │       ├── splash-screen/
│   │       ├── confetti/
│   │       ├── keyboard-shortcuts/
│   │       └── theme-toggle/
│   └── app.module.ts            # Module racine
├── assets/                      # Ressources statiques
└── styles.scss                  # Styles globaux
```

### Pattern d'Architecture

L'application suit le pattern **Smart/Dumb Components** :
- **Smart Components** : Gèrent la logique métier (ProjectDetailComponent, DashboardComponent)
- **Dumb Components** : Affichage pur (ToastComponent, ConfettiComponent)

### Injection de Dépendances

Tous les services utilisent le decorator `@Injectable({ providedIn: 'root' })` pour un singleton global.

---

## ⚡ Fonctionnalités Principales

### 1. Authentification Multi-Rôles

```typescript
// auth.service.ts
interface LoginCredentials {
  email: string;
  password: string;
}

// Fonctionnalités:
- Hachage des mots de passe (simulation)
- Verrouillage après 5 tentatives échouées
- Comptes de démonstration
- Gestion des rôles (employe/chef)
```

### 2. Gestion des Projets

| Fonctionnalité | Description |
|----------------|-------------|
| Création | Formulaire avec titre, description, budget, deadline, durée |
| Cahier des Charges | Upload de fichiers PDF/DOC/XLS avec preview |
| Timeline Gantt | Visualisation temporelle des tâches |
| Matrice d'Approbation | Grille employé × tâche avec validations |
| Historique d'Activité | Log complet des actions (audit trail) |

### 3. Système de Tâches

```typescript
interface Task {
  id: string;
  projectId: string;
  title: string;
  finalDate: string;      // Date limite
  duration: number;       // Durée en jours
  state: TaskState;       // en_attente | en_cours | validee | non_validee
  validatedBy: string[];  // IDs des employés ayant validé
  notPertinentBy: string[]; // IDs des employés ayant signalé
  comments: Comment[];
}
```

### 4. Commentaires Typés

| Type | Icône | Usage |
|------|-------|-------|
| **Urgent** 🔴 | Persiste pour alerter le chef |
| **Quotidien** 🟡 | Remarques courantes |
| **Informatif** 🔵 | Notes pour le maître d'œuvre |

### 5. Dashboard Dynamique

Tous les graphiques sont générés à partir des données réelles :

| Graphique | Source de Données |
|-----------|-------------------|
| Tendance mensuelle | `projects.createdAt` groupé par mois |
| Camembert états | `tasks.state` agrégé |
| Top 5 Projets | Classement par % de tâches validées |
| Budget par Service | `projects.budget` groupé par `serviceId` |
| Échéances proches | `tasks.finalDate` dans les 15 jours |

---

## 📊 Modèles de Données

### Employee (Utilisateur)

```typescript
interface Employee {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'employe' | 'chef';
  serviceId: string;
  notificationPrefs?: NotificationPrefs;
  failedLoginAttempts?: number;
  lockedUntil?: string;
}
```

### Project

```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  serviceId: string;
  budget: number;
  deadline: string;
  durationDays: number;
  validatedByChef: boolean;
  cahier?: CahierDeCharge;
  createdAt: string;
}
```

### CahierDeCharge (CPS)

```typescript
interface CahierDeCharge {
  fileName: string;
  mimeType: string;
  size: number;
  base64: string;  // Contenu encodé
}
```

### Notification

```typescript
interface AppNotification {
  id: string;
  userId: string;
  type: 'deadline' | 'validation' | 'comment' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  relatedProjectId?: string;
  relatedTaskId?: string;
}
```

---

## 🔧 Services et Logique Métier

### AuthService

| Méthode | Description |
|---------|-------------|
| `login(email, password)` | Authentification avec vérification du hash |
| `register(data)` | Création de compte avec validation |
| `logout()` | Déconnexion et nettoyage de session |
| `currentUser()` | Retourne l'utilisateur connecté |
| `isChef()` / `isEmployee()` | Vérification du rôle |

### ProjectService

| Méthode | Description |
|---------|-------------|
| `all()` | Liste tous les projets |
| `byId(id)` | Récupère un projet par ID |
| `create(data)` | Crée un nouveau projet |
| `update(id, data)` | Met à jour un projet |
| `delete(id)` | Supprime un projet |
| `setCahier(id, cahier)` | Attache un CPS |
| `areAllTasksValidatedForProject(id)` | Vérifie si toutes les tâches sont approuvées |

### TaskService

| Méthode | Description |
|---------|-------------|
| `byProject(projectId)` | Tâches d'un projet |
| `create(data)` | Crée une tâche |
| `validate(taskId, employeeId)` | Valide une tâche |
| `markNotPertinent(taskId, employeeId)` | Signale comme non pertinent |
| `addComment(taskId, comment)` | Ajoute un commentaire |

### SearchService

```typescript
// Recherche globale multi-entités
search(query: string): SearchResult[] {
  // Recherche dans: projets, tâches, employés
  // Retourne résultats triés par pertinence
}
```

### ActivityLogService

```typescript
// Journal d'audit complet
log(projectId: string, action: ActivityAction, details?: string): void

// Actions tracées:
type ActivityAction =
  | 'project_created' | 'project_validated' | 'project_invalidated'
  | 'task_created' | 'task_validated' | 'task_not_pertinent'
  | 'comment_added' | 'cps_uploaded' | 'cps_replaced';
```

---

## 🎨 Composants UI Spéciaux

### 1. Splash Screen Animé

**Fichiers** : `splash-screen.component.ts`, `splash-screen.component.scss`

| Élément | Animation |
|---------|-----------|
| Logo | Float up/down + pulsing rings |
| Titre | Gradient text + cursor blink |
| Progress bar | Shimmer effect |
| Features | Fade-in séquentiel |
| Particles | Rising animation |
| Exit | Slide-out vers le haut |

```scss
// Animations clés
@keyframes float { 0%, 100% { translateY(0); } 50% { translateY(-10px); } }
@keyframes ring-pulse { 0% { scale(0.8); opacity: 1; } 100% { scale(1.2); opacity: 0; } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
```

### 2. Confetti Celebration

**Fichiers** : `confetti.component.ts`, `confetti.service.ts`

- 150 particules colorées
- Couleurs aléatoires : violet, vert, jaune, rouge, bleu, rose, orange
- Animation de chute avec rotation
- Déclenché lors de la validation d'un projet

```typescript
// Déclenchement
this.confettiService.fire();

// Génération
confetti = Array.from({ length: 150 }, () => ({
  x: Math.random() * 100,
  color: randomColor(),
  delay: Math.random() * 0.5,
  duration: 2 + Math.random() * 2,
  size: 8 + Math.random() * 8,
  rotation: Math.random() * 360
}));
```

### 3. Theme Toggle (Dark/Light Mode)

**Fichiers** : `theme-toggle.component.ts`, `theme.service.ts`

| Mode | Caractéristiques |
|------|------------------|
| **Dark** 🌙 | Fond sombre, étoiles animées |
| **Light** ☀️ | Fond clair, nuages flottants |

```typescript
// ThemeService
toggle() {
  const newTheme = this.current === 'dark' ? 'light' : 'dark';
  document.body.classList.add(`${newTheme}-theme`);
  localStorage.setItem('theme', newTheme);
}
```

### 4. Keyboard Shortcuts Modal

**Fichier** : `keyboard-shortcuts.component.ts`

| Raccourci | Action |
|-----------|--------|
| `?` | Afficher/masquer l'aide |
| `Ctrl+K` | Recherche globale |
| `G` + `D` | Aller au Dashboard |
| `G` + `P` | Aller aux Projets |
| `G` + `N` | Aller aux Notifications |
| `G` + `S` | Aller aux Paramètres |
| `Esc` | Fermer les modals |

### 5. Global Search (Ctrl+K)

**Fichiers** : `global-search.component.ts`, `search.service.ts`

- Recherche multi-entités (projets, tâches, employés)
- Navigation clavier (↑↓ Enter)
- Résultats avec icônes et badges
- Highlight du texte correspondant

### 6. Toast Notifications

**Fichiers** : `toast.component.ts`, `toast.service.ts`

| Type | Couleur | Usage |
|------|---------|-------|
| `success` | Vert | Actions réussies |
| `error` | Rouge | Erreurs |
| `info` | Bleu | Informations |

---

## 🔒 Sécurité et Authentification

### Mécanismes Implémentés

| Mécanisme | Description |
|-----------|-------------|
| **Hachage des mots de passe** | Simulation de bcrypt (demo) |
| **Verrouillage de compte** | Après 5 tentatives échouées |
| **Guards de route** | Protection des routes par rôle |
| **Validation des entrées** | Formulaires avec validators Angular |

### Route Guards

```typescript
// auth.guard.ts - Protège les routes authentifiées
canActivate(): boolean {
  return !!this.auth.currentUser();
}

// chef.guard.ts - Protège les routes chef uniquement
canActivate(): boolean {
  return this.auth.isChef();
}
```

### Validation des Formulaires

```typescript
// Exemple: formulaire d'inscription
this.form = new FormGroup({
  name: new FormControl('', [Validators.required, Validators.minLength(2)]),
  email: new FormControl('', [Validators.required, Validators.email]),
  password: new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.pattern(/[A-Z]/),  // Au moins une majuscule
    Validators.pattern(/[0-9]/)   // Au moins un chiffre
  ])
});
```

---

## ✨ Animations et Effets Visuels

### CSS Animations Utilisées

| Animation | Fichier | Effet |
|-----------|---------|-------|
| `float` | splash-screen.scss | Flottement du logo |
| `ring-pulse` | splash-screen.scss | Anneaux pulsants |
| `blink` | splash-screen.scss | Curseur clignotant |
| `shimmer` | splash-screen.scss | Brillance progress bar |
| `particle-rise` | splash-screen.scss | Particules montantes |
| `confetti-fall` | confetti.component.ts | Chute des confettis |
| `twinkle` | theme-toggle.component.ts | Étoiles scintillantes |
| `fadeIn` | keyboard-shortcuts.scss | Apparition modale |
| `slideUp` | keyboard-shortcuts.scss | Glissement modal |
| `pageEnter` | styles.scss | Transition de page |

### Transitions CSS

```scss
// Transitions fluides globales
transition: all 0.2s ease;
transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Effets Visuels

| Effet | Technique |
|-------|-----------|
| Glassmorphism | `backdrop-filter: blur(10px)` |
| Gradients | `linear-gradient(135deg, ...)` |
| Shadows | `box-shadow` multi-couches |
| Hover states | Scale, color, background transitions |

---

## 📦 Guide d'Installation

### Prérequis

- **Node.js** : v16.x ou supérieur
- **npm** : v8.x ou supérieur
- **Angular CLI** : v16.x

### Installation

```bash
# 1. Cloner le repository
git clone https://github.com/[username]/suivi-marches.git
cd suivi-marches

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
ng serve

# 4. Ouvrir dans le navigateur
http://localhost:4200
```

### Comptes de Démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Chef** | chef@demo.com | Demo123! |
| **Employé** | employe@demo.com | Demo123! |

### Build Production

```bash
# Build optimisé
ng build --configuration production

# Les fichiers sont générés dans dist/
```

---

## 📈 Métriques du Projet

| Métrique | Valeur |
|----------|--------|
| Composants Angular | ~25 |
| Services | 10 |
| Modèles TypeScript | 7 |
| Lignes de code (estimé) | ~5000 |
| Taille du bundle | ~500 KB |

---

## 🎓 Conclusion

Ce projet démontre une maîtrise complète du framework Angular avec :

✅ Architecture modulaire et scalable
✅ Gestion d'état réactive avec RxJS
✅ UI/UX moderne avec animations fluides
✅ Système d'authentification robuste
✅ Fonctionnalités métier complètes
✅ Code TypeScript typé et maintenable
✅ Effets visuels impressionnants (splash screen, confetti, thèmes)

---

**Développé avec ❤️ en Angular 16**

