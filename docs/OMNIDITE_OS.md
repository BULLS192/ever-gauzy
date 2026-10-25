# Omnidite OS — internal pilot v0.1

**Status: source change only. No production deployment, full-stack build, or security acceptance test has run.**

## Intent

Run Omnidite's internal business operations with Ever Gauzy as the system of record. This is not a commercial SaaS. The app preserves the Gauzy data model, login, permissions, tenant/organization context, and existing finance/CRM/project screens.

## Implemented in this branch

- Authenticated new command center at /pages/os, under the existing Gauzy page route guards.
- /pages redirects to /pages/os after successful authentication.
- Existing dashboard retained at /pages/dashboard.
- New Omnidite OS navigation section in the main sidebar.
- Contextual active-organization label using the existing Gauzy Store observable.
- Live, organization-scoped counts for projects, contacts and tasks using Gauzy's existing Angular services. Failure or missing permission is shown as unavailable, not zero. Responses from a previous organization are discarded.
- Preview of up to five organization projects from the real Gauzy project API. Selecting no organization clears the displayed data.
- Responsive blue/navy Omnidite command center.
- Actual links to Gauzy contacts, sales pipeline, organization projects, tasks, invoices, expenses, vendors and dashboard reports.
- Searchable shortcuts to Omnidite, SGBuddy, Aedificatus Atlas, Providence and Space City Darts.
- Web document title and PWA manifest brand metadata.

These links are not backend integrations: they open existing functionality. No new client, project, or accounting database is created.

## Not yet implemented

- Complete application rebrand including login, menus, images, app icons, desktop installers. The O shown in the new page is a temporary CSS treatment, not the approved brand logo.
- Detailed financial KPIs and external-app data sync, unified sign-on, workflow automation, alerts.
- Replacement of any existing Omnidite applications.
- Commerce extension security fixes and production validation.
- Deployment, migration, end-to-end tests or a green CI build.

## Branch and build

This work lives only on feature/omnidite-os-v0.1. Keep develop synced to upstream Gauzy.

The upstream prebuilt Docker images do NOT contain this new route; they run Gauzy upstream unchanged. Build this branch's frontend against a separately configured Gauzy API to test it.

1. Clone the fork and check out feature/omnidite-os-v0.1.
2. Follow the repository .nvmrc (Node 26.12.1) and root package.json Yarn version.
3. Install dependencies with yarn install --frozen-lockfile.
4. Configure a private Gauzy API and database with unique credentials and secrets according to the upstream README. Do not expose demo credentials.
5. Generate the development frontend environment with yarn config:dev.
6. Build with yarn build:gauzy and run the application per upstream developer instructions.
7. After logging in to the private instance, navigate to /pages/os.

Large Nx builds can be RAM intensive; do not run inherited upstream CI on your hosted infrastructure without reviewing runner configuration.

## Security and acceptance checks

- Frontend compiled and strict-template validation green
- Login required to visit /pages/os
- Active organization updates when switched
- The Gauzy API returns actual scoped project, contact and task counts
- Counts for denied permissions show unavailable, not a misleading zero
- Switching organizations during a slow request does not show stale results
- Module routes enforce existing permissions and feature flags
- No sensitive information in front-end source
- No default/demo passwords on any exposed installation
- Search works and external shortcuts open separate tabs
- Tablet and phone views usable with keyboard and screen reader
- AGPL-3.0 notices and Ever Co attributions retained
- No unverified payment/inventory commerce extension deployed
- Deployment/cost plan approved before hosting

## Next implementation

Use existing Gauzy services for organization-scoped KPIs, project status and financial summaries. Then add a business workflow from incoming lead to proposal, project and invoice. External apps stay isolated until per-app integration interfaces are explicitly specified and reviewed.

## Licensing

Based on the Ever Gauzy Community Edition under AGPL-3.0. Preserve the original project license and copyright notices. This modification is not a claim of ownership of the underlying Gauzy source.
