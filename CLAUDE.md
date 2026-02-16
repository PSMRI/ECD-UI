# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ECD-UI is the Angular frontend for the AMRIT Early Childhood Development (ECD) Call Centre module. It's a role-based call center application where agents (Associate/ANM/MO) make outbound calls to mothers/caregivers, supervisors manage call allocation/configuration, and quality auditors review call quality.

## Commands

| Task | Command |
|------|---------|
| Dev server | `npm start` (serves on port 4209) |
| Build (dev) | `npm run build-dev` |
| Build (prod) | `npm run build-prod` |
| Build (CI) | `npm run build-ci` |
| Build (test) | `npm run build-test` |
| Lint | `npm run lint` |
| Unit tests | `npm test` (Karma + Jasmine, Chrome) |
| WAR package | `mvn -B package --file pom.xml -P <profile>` (profiles: dev, local, test, ci, uat) |
| Commitizen commit | `npm run commit` |

## Commit Conventions

Husky enforces two git hooks:
- **pre-commit**: runs `lint-staged` (ESLint --fix on staged `*.ts` files)
- **commit-msg**: runs `commitlint` with Conventional Commits

Allowed commit types: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`. Header max 100 chars, no sentence-case/start-case/pascal-case/upper-case in subject.

## Architecture

### Tech Stack
- Angular 16.2, TypeScript 5.1, Angular Material 16, Bootstrap 5 (CSS only)
- Charts: echarts 5; PDF: jspdf + html2canvas; Telephony: Czentrix CTI iframe + Jitsi video

### Module Structure (src/app/app-modules/)

Each user role has a **lazy-loaded feature module** with its own routing:
- `associate-anm-mo/` — Call agents, ANM, Medical Officers (outbound calls, questionnaires, beneficiary registration)
- `supervisor/` — Call allocation, configurations, questionnaire management, reports
- `quality-supervisor/` — Quality monitoring config, charts, agent-auditor mapping
- `quality-auditor/` — Call audit worklist, ratings, case sheets

Eagerly loaded modules:
- `core/` — Header, Footer, Dashboard, Spinner, CommonDialog, chart components
- `user-login/` — Login, forgot password, set password, security questions, role selection
- `material/` — Aggregates all Angular Material imports for re-export
- `shared/` — Validator directives (email, mobile, name, password, etc.) and `UtcdatePipe`

### Common-UI (Git Submodule)

`Common-UI/` at project root is a shared cross-app Git submodule. Resolved via TypeScript `baseUrl: "./"` — imports use `Common-UI/src/...` paths directly.

Provides:
- **SessionStorageService** (`Common-UI/src/registrar/`) — Encrypted session storage via `ng-cryptostore` using `environment.encKey`
- **TrackingModule** (`Common-UI/src/tracking/`) — Matomo/GA analytics, configured via `TrackingModule.forRoot()`
- **FeedbackModule** (`Common-UI/src/feedback/`) — Post-logout feedback page (lazy-loaded at `/feedback`)

### Dynamic Component Loading Pattern

Each role's "innerpage" component (`AgentsInnerpageComponent`, `InnerpageSupervisorComponent`, etc.) uses `ComponentFactoryResolver` to dynamically insert/swap child components into a `ViewContainerRef`. This is the primary in-role navigation mechanism — not Angular Router sub-routes.

### State Management

No formal state library. State flows through:
- **BehaviorSubjects in services** — `AssociateAnmMoService` has 10+ BehaviorSubjects for inter-component communication (call closure, component switching, questionnaire loading, etc.)
- **In-memory service properties** — `LoginserviceService` holds user session data; `MasterService` caches lookup data
- **Encrypted SessionStorage** — via `ng-cryptostore` for auth tokens, user info, role data

### Services (src/app/app-modules/services/)

- `auth.service.ts` — Raw login/logout HTTP calls to COMMON_API
- `loginservice/` — Login orchestration, in-memory user state, session key validation
- `auth-guard/` — Route guard via `validateSessionKey()`
- `http-inteceptor/` — Single interceptor: auth header injection, spinner toggle, 401/403/500 handling, session timeout (27-min timer with extend/logout dialog), status code 5002 = session expired
- `cti/` — Czentrix telephony integration (login, agent state polling, call control)
- `associate-anm-mo/` — Agent call operations, BehaviorSubject-based component communication
- `supervisor/` — All supervisor CRUD + report blob downloads
- `quality-supervisor/` — Quality config + chart data
- `quality-auditor/` — Audit worklist, call rating CRUD
- `masterService/` — All lookup/master data (questionnaire types, demographics, roles, etc.)
- `confirmation/` — Opens `CommonDialogComponent` as Material Dialog (actions: error, info, confirm, sessionTimeOut)
- `set-language/` — Fetches `assets/English.json` or `assets/Hindi.json`, stores in `languageData`
- `captcha-service/` — Dynamic CAPTCHA script loading

### i18n

Custom JSON-based approach (not Angular i18n or ngx-translate):
- Language files: `src/assets/English.json`, `src/assets/Hindi.json`
- `SetLanguageService.getLanguageData(language)` fetches and caches the JSON
- Components store a `currentLanguageSet` property and often use `ngDoCheck()` to pick up language changes
- Default language set via `environment.language`

### Environment Configuration

Files in `src/environments/` — swapped via `angular.json` `fileReplacements`:
- `environment.ts` — default (dev/UAT)
- `environment.local.ts` — local development
- `environment.prod.ts` — production
- `environment.test.ts` — test
- `environment.ci.ts` — generated from `environment.ci.ts.template` by `scripts/ci-prebuild.js`

Key env vars: API base URLs (`COMMON_API`, `ECD_API`, `ADMIN_API`), `encKey` (session encryption), `ctiUrl`/`ctiEventUrl` (telephony), `language`, `extendSessionUrl`, tracking config, CAPTCHA config, `vcDomain` (video consultation).

## ESLint Rules

- Component selector: `app-` prefix, kebab-case
- Directive selector: `app` prefix, camelCase
- `@typescript-eslint/no-explicit-any` and `no-unused-vars` are disabled
- `eqeqeq` is a warning (not error)

## Key File Paths

- App entry: `src/main.ts` → `src/app/app.module.ts`
- Routing: `src/app/app-routing.module.ts`
- HTTP interceptor: `src/app/app-modules/services/http-inteceptor/http-interceptor.service.ts` (note: directory is misspelled as "inteceptor")
- Login flow: `src/app/app-modules/user-login/login/login.component.ts`
- All services: `src/app/app-modules/services/`
- Language files: `src/assets/English.json`, `src/assets/Hindi.json`
- Environment configs: `src/environments/`
- CI prebuild script: `scripts/ci-prebuild.js`
