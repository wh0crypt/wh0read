# wh0read

A minimal, responsive PDF library ready for the web, PWA, and Android through Capacitor.

## Features

- Supabase Auth for sign-up, sign-in, and sign-out.
- A private per-user library with PDFs stored in Supabase Storage.
- Automatically synchronized reading progress.
- Synchronized favorite pages.
- Dark interface mode and dark document reading mode.
- Responsive reader with navigation controls and touch swipe gestures.
- Static Next.js export compatible with Vercel and Capacitor.

## Local setup

1. Create a Supabase project and run [`supabase/schema.sql`](./supabase/schema.sql) in the SQL Editor.
2. Create a private Storage bucket named `pdfs`. The schema includes the access policy.
3. In Supabase Authentication, keep email authentication enabled. If email confirmation is enabled, users must confirm their address before signing in.
4. Copy `.env.example` to `.env.local` and fill in the project's public credentials.
5. Install and start the development server:

```bash
npm install
npm run dev
```

The `NEXT_PUBLIC_*` values are not secrets. Document security is provided by the RLS and Storage policies. Never expose a Supabase service-role key in this application.

## Web deployment

On Vercel, use `npm run build` as the build command. The project uses `output: 'export'`, so the generated static site is written to `out/`. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as project environment variables. Older projects can use `NEXT_PUBLIC_SUPABASE_ANON_KEY` instead.

## Android APK

Install Node.js, Android Studio, an Android SDK, and a Java 17 JDK first:

```bash
npm run build
npx cap add android       # first run only
npx cap sync android
npx cap open android
```

The [`build-apk.yml`](./.github/workflows/build-apk.yml) workflow builds a debug APK and publishes it as a GitHub Release whenever `main` is updated, or when the workflow is manually dispatched. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as repository secrets.

Release versions are generated automatically from the major and minor values in `package.json` plus the GitHub Actions run number. For example, package version `0.1.0` and run `42` produce tag `v0.1.42`. The same value is written to the Android APK as its `versionName`, while the run number is used as its `versionCode`. GitHub automatically generates the release notes from the commits since the previous release. The versioned APK is attached directly to the release and is not kept as a workflow artifact.

The workflow explicitly installs Android SDK platform 34, build-tools 34.0.0, and platform-tools. This avoids the obsolete SDK package name `tools`, which is no longer available in current GitHub-hosted runners.

## Offline storage

The authentication session and theme preference are persisted locally. The reader uses short-lived signed URLs so private documents are not exposed. Full persistent PDF caching for offline reading is not implemented yet; it can be added later with Cache Storage or IndexedDB. Reading progress is written whenever the page changes and is available again when the application is opened with a connection.

## Architecture and current scope

The application is a static Next.js client using Supabase directly:

- `documents` stores PDF metadata and ownership.
- `reading_progress` stores the last page per user and document.
- `bookmarks` stores favorite pages.
- The private `pdfs` bucket stores the actual files.
- Row-level security restricts every database and Storage operation to the authenticated owner.

Cloudflare R2 is not required by the current implementation. It can replace Supabase Storage later, but that would require a server-side signing layer because R2 credentials must never be shipped to the browser.

## Validation

Run the production checks locally:

```bash
npm run build
```

This validates TypeScript, Next.js static generation, and the exported routes.
