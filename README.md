# WriteSpace

WriteSpace is a local-first writing and community blog application built with Vite, React, and JavaScript. It includes public post previews, local account registration and login, protected blog reading and authoring, and administrator account management.

## Requirements

- Node.js 20 or newer
- npm

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`).

## Demo administrator

- Username: `admin`
- Password: `admin`

You can also create a local writer account from the registration page.

## Data and security note

This is a browser-local demonstration. Posts, accounts, and the active session are stored in the browser's `localStorage`; account passwords are not suitable for real credentials. Do not use real passwords or sensitive information. Clearing browser storage removes the local demo data. This application does not provide server-side authentication, shared persistence, or production security controls.

## Features

- Public landing page with the three newest post previews
- Local registration and demo administrator login
- Authenticated newest-first blog list and full post reader
- Create and edit posts with ownership checks and validation
- Administrator dashboard with community counts and recent posts
- Administrator account creation and protected deletion
- Responsive navigation and mobile account-management cards

## Verification

Run unit/component tests:

```bash
cd frontend
node node_modules/vitest/vitest.mjs run
```

Run browser E2E tests (requires Playwright Chromium installed):

```bash
cd frontend
node node_modules/@playwright/test/cli.js test
```

Build the production frontend:

```bash
cd frontend
node node_modules/vite/bin/vite.js build
```

The Developer verification report is in `test_report.yaml`.
