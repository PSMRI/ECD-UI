# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AMRIT ECD (Early Childhood Development) UI -- an Angular-based call centre application for managing ECD-related outbound calls, beneficiary registration, and questionnaire workflows. Part of the AMRIT healthcare EHR platform by Piramal Swasthya. Licensed under GPL v3.

## Common Commands

```bash
npm start              # Dev server on http://localhost:4209
npm run build-dev      # Development build with AOT
npm run build-prod     # Production build with AOT
npm run build-ci       # CI build (generates environment.ci.ts from template + env vars)
npm test               # Karma + Jasmine tests (watch mode, Chrome)
npm run lint           # ESLint (Angular + Prettier rules)
npm run commit         # Interactive Commitizen commit (conventional commits)
```

## Git Submodule

The `Common-UI/` directory is a git submodule from `https://github.com/PSMRI/Common-UI`. After cloning, initialize with:
```bash
git submodule update --init
```
It provides shared utilities and the `FeedbackModule`, imported as `'Common-UI/src/...'`.

## Commit Conventions

Conventional Commits enforced via Husky + commitlint. Pre-commit hook runs `lint-staged` (ESLint --fix on staged `.ts` files). Allowed types: `feat`, `fix`, `build`, `chore`, `ci`, `docs`, `perf`, `refactor`, `revert`, `style`, `test`. Header max 100 chars.

## Architecture

**Angular 16 (NgModule-based)** -- not standalone components. Dev server port: **4209**.

### Routing

```
/login                      -> LoginComponent
/set-security-questions     -> SetSecurityQuestionsComponent
/forgot-password            -> ForgotPasswordComponent
/set-password               -> SetPasswordComponent
/role-selection             -> RoleSelectionComponent [AuthGuard]
/dashboard                  -> DashboardComponent [AuthGuard]
/dashboardQuestionare       -> EcdQuestionnaireComponent [AuthGuard]
/supervisor                 -> lazy-loaded SupervisorModule [AuthGuard]
/quality-supervisor         -> lazy-loaded QualitySupervisorModule [AuthGuard]
/quality-auditor            -> lazy-loaded QualityAuditorModule [AuthGuard]
/associate-anm-mo           -> lazy-loaded AssociateAnmMoModule [AuthGuard]
/feedback                   -> lazy-loaded FeedbackModule (from Common-UI)
```

### Key Directory Layout

- **`src/app/app-modules/associate-anm-mo/`** -- Agent/ANM/MO workflows: beneficiary registration, call history, ECD questionnaire.
- **`src/app/app-modules/supervisor/`** -- Supervisor module: call allocation, call configuration (create/edit), innerpage layout.
- **`src/app/app-modules/quality-supervisor/`** -- Quality supervisor module (lazy-loaded).
- **`src/app/app-modules/quality-auditor/`** -- Quality auditor module (lazy-loaded).
- **`src/app/app-modules/core/`** -- Core module with dashboard component.
- **`src/app/app-modules/user-login/`** -- Login, password reset, security questions, role selection.
- **`src/app/app-modules/services/`** -- Shared services including AuthGuard.
- **`src/app/app-modules/shared/`** -- Shared components/directives.
- **`src/app/app-modules/material/`** -- Centralized Angular Material barrel module.

### State Management

No external state library. Uses service-based state with BehaviorSubject/Subject patterns and encrypted sessionStorage (`ng-cryptostore`).

### Environment Configuration

Environment files in `src/environments/`. CI builds use `environment.ci.ts.template` (EJS) rendered by `scripts/ci-prebuild.js`.

### Common Patterns

- **Dialogs:** `ConfirmationDialogsService` wrapping `MatDialog`.
- **HTTP Interceptor:** Attaches `Authorization` header, manages spinner, handles session expiry (status code `5002`), 27-minute idle timer.
- **Material imports:** Centralized `MaterialModule` barrel.
- **Component prefix:** `app-`.

### Build / Deploy

Packaged as a WAR file via Maven (`pom.xml`). `WEB-INF/` directory is copied into the dist output. Bundle size budgets: 5MB warning / 6MB error for initial bundle.
