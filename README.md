# listryx-ui

The Angular app for Listryx — lists of anything, created from reusable templates. The API lives
in `listryx-api`.

The screen that matters is the list detail page, and it is built for one hand on a phone: the
checkbox is the tap target for checking something off and the rest of the row opens the editor,
the quick-add box is pinned to the bottom and keeps focus after each submit, and price and
quantity stay behind a tap so nothing stands between you and adding an item.

## Stack

- **Angular 22**, standalone components and signals throughout. No NgRx — `httpResource` for
  reads, `HttpClient` for writes.
- **PrimeNG 22** with the Aura preset, **Tailwind 4** (CSS-first, no config file), **primeicons**.
- **Transloco** for en-US and pt-BR.
- **keycloak-angular** against the `listryx` realm.
- **Chart.js** for the two trend charts.
- **Vitest** through `@angular/build:unit-test`.

## Getting started

The API stack must be running first — one command brings up PostgreSQL, Keycloak and the API
together:

```bash
cd ../listryx-api && docker compose up -d
cd ../listryx-ui && yarn install && yarn start --port 4201
```

Port 4201, because planelyx-ui holds 4200.

## Environments

The API and Keycloak URLs are compiled in, not read at runtime.

| configuration | file | apiUrl |
|---|---|---|
| development | `src/environments/environment.ts` | `http://localhost:8088/api` |
| production | `src/environments/environment.production.ts` | `https://listryx.com/api` |

Because the file is compiled into the bundle, **a build is environment-specific**: the Docker
image carries `environment.production.ts` inside it, so a different environment needs its own
build rather than different runtime variables.

## Authentication

Every route sits under one guarded parent, so everything except the 404 page requires a session.
There is no in-app login form — `authGuard` redirects to Keycloak, and `public/silent-check-sso.html`
backs the hidden iframe that refreshes it.

`/profile` edits the account itself. The profile is held by Keycloak, not by Listryx, so the page
reads and writes `GET`/`PUT /api/me` and the API forwards to Keycloak's Admin API; the username is
read-only and passwords are left to Keycloak's own account page, opened by `accountManagement()`.

**The bearer token is attached to exactly one host.** `keycloak.providers.ts` anchors the
interceptor condition to `environment.apiUrl` with the URL escaped, so the access token cannot
reach a third-party host the app might call later.

## Data access

Reads go through `httpResource` and expose `computed()` projections; writes go through
`HttpClient` and either reload the resource or set the response straight into it.

Every item write returns the **whole list**, and `ListDetailPage` writes that response back into
its resource rather than refetching. Checking something off changes the list's `checkedTotal`, so
the alternative is a second request on every tap.

The cost of that is everything *else* derived from those writes — the counts and totals on the
lists overview, and both trend charts — which nothing would otherwise refresh, because the
services are root singletons whose resources outlive the pages that read them. So those two pages
call `reload()` when they are entered. `Resource.reload()` no-ops while a resource is idle or
loading, so the first visit still fetches exactly once.

**Locale-sensitive formatting never goes through Angular's pipes.** `DatePipe` and friends read
the static `LOCALE_ID`, which cannot follow a language switch made at runtime, so dates, money and
quantities all format through `Intl` and `currentLocale()` in `shared/util/`. PrimeNG's
`p-inputnumber` takes the same value through its `[locale]` input — without it a price renders
`R$90.00` on a page that is otherwise Portuguese.

Money is a **decimal string** end to end — the API computes every total in PostgreSQL, and
`shared/util/money.ts` only formats and parses at the edges. Nothing here adds two prices.

## Layout

A fixed sidenav on `lg` and up, and the same links behind a drawer below it — the header keeps
only the brand, the theme toggle and the account menu. `layout/nav-items.ts` is the single list
both render from, so a new section is one entry rather than two templates.

## Branding

`public/favicon.svg` and `shared/ui/logo.ts` are the same mark — a checklist on the emerald
rounded square — drawn from the same geometry so the tab icon and the in-app header cannot drift
apart. `favicon.ico` and `apple-touch-icon.png` are rasterized from that SVG.

## Theming

PrimeNG Aura CSS variables are the design tokens; Tailwind arbitrary values consume them
(`text-[var(--p-text-muted-color)]`). Dark mode is a manual `app-dark` class on `<html>`, agreed
in three places: `darkModeSelector` in `providePrimeNG`, `@custom-variant dark` in `styles.css`,
and `DARK_CLASS` in `core/theme.service.ts`. It is seeded from `prefers-color-scheme` and
persisted under `listryx.theme`.

The charts follow the same switch: `shared/ui/chart.ts` holds a validated palette per mode and
rebuilds the chart when the theme changes, because Chart.js paints to a canvas and cannot inherit
a CSS variable. Both charts ship a data table beside them, so the numbers are readable without
seeing colour at all.

## Internationalization

All user-facing strings are Transloco keys in `public/i18n/{en-US,pt-BR}.json`; route `title`
values are keys resolved by `TranslatedTitleStrategy`. The two files must hold the same key set.

**Currency is a separate preference from language, on purpose.** Language is what you read;
currency is what you spend, and a Brazilian reading the English UI still pays in reais. Tying the
two together would relabel a stored `450` as `R$450` or `$450` depending on the UI language —
the same number claiming to be roughly five times more money. So `shared/util/currency.ts` holds
its own signal, persisted under `listryx.currency` alongside `listryx.locale` and `listryx.theme`,
and the account menu offers both pickers side by side (BRL and USD). Language still drives separators and symbol
placement: `R$ 450,00` in pt-BR, `R$450.00` in en-US.

Nothing converts. The currency only decides how the stored amounts are *labelled*, so changing it
relabels history rather than recomputing it — which is correct for a single person who shops in
one currency, and the reason there is no currency column in the database.

## Scripts

| command | does |
|---|---|
| `yarn start` | dev server |
| `yarn build` | production build |
| `yarn test` | Vitest |
| `yarn lint` / `yarn format` | ESLint (zero warnings) / Prettier |

## Docker

Built to static files and served by nginx inside the container, under `/ui/`. The host nginx
forwards `/ui/` verbatim, so the in-container server owns the prefix end to end and nothing is
rewritten. `index.html` is never cached; hashed assets are immutable for a year.

The production budget is 900kB rather than the CLI default 500kB. PrimeNG, keycloak-js and
Transloco are all in the initial bundle by nature, and every feature route is already lazy.

## Project structure

```
src/
  app/
    core/       auth (Keycloak), http (resource base, error interceptor), i18n, theme
    layout/     shell — sidenav on desktop, drawer on phones
    features/
      lists/       overview, the phone-in-hand detail page, create and save-as-template dialogs
      templates/   overview and the item editor
      insights/    the two trend charts
      settings/    the profile page, backed by /api/me
    shared/     ui (card, page header, empty state, field, chart, logo), models, util
  environments/
public/i18n/    en-US and pt-BR
```
