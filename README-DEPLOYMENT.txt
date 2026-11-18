NITIRAJSINH WEBSITE — PORTABLE SOURCE BACKUP

WHAT THIS ZIP CONTAINS
- The current website source, pesticide database data, local crop/weed images, and bundled calculator/recommendation tools.
- Project scripts and database migration files needed to rebuild the site.
- No Git history, installed packages, private environment file, or workspace metadata.

QUICK START
1. Extract this ZIP.
2. Install Node.js 22 or newer (or Bun 1.4 or newer).
3. In the nitirajsinh-website folder, install dependencies: npm install
4. Create the hosting provider's environment settings (see below).
5. Build with: npm run build
6. Follow the selected provider's instructions to run the server output.
   For local development, use: npm run dev

HOSTING COMPATIBILITY
This is a full-stack TanStack Start website. Its current project build is configured with Nitro and defaults to the Cloudflare target. A source backup can be adapted to a hosting provider that supports the appropriate TanStack Start/Nitro server runtime; it is not one universal prebuilt upload folder. Static-only hosting cannot run the registration server function by itself. For another provider, configure its supported Nitro adapter/runtime and deployment command before publishing. Provider-specific deployment was not tested as part of this backup.

DATABASE / SETTINGS
The live database is separate from this ZIP. The existing site reads these settings from the hosting environment (do not commit their values into source):
- VITE_SUPABASE_URL
- VITE_SUPABASE_PUBLISHABLE_KEY
- SUPABASE_URL
- SUPABASE_PUBLISHABLE_KEY

The browser VITE_ settings must point to the same backend as the server settings. To move registration storage to a different backend, create the table and insert-only access policy using drizzle/migrations/0000_create_farmer_registrations.sql, then configure the new backend's URL and publishable key. Existing hosted records are not included in this source archive and must be migrated separately if needed.

SECURITY
The private .env file was deliberately excluded. Do not paste private keys into source files or commit environment values. The publishable key is intended for client use; any private server key, if ever required by a future change, belongs only in the hosting provider's secret settings.

PACKAGE MANAGERS
The project includes bun.lock. npm install is also available from package.json, but may resolve newer compatible dependency versions than the original Bun lock. For a lockfile-reproducible install, use Bun and run: bun install --frozen-lockfile
