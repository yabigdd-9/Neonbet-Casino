# NeonBet Casino Website

This is a React + Vite + Tailwind casino-style landing page and lobby.

## Important

This project can run as a static frontend, or connect to Supabase for real user accounts, admin review, verification submissions, transaction hash storage, statuses, admin notes, and bonus/rollover tracking. It does not include a wallet connection, payment processor, automated verification, deposits, withdrawals, or real game-provider integrations.

The site includes browser-only simulated slot gameplay, a static manual crypto verification panel for a 75 USD account verification fee, plus marketing copy for a free 100 USD sign-up bonus, 300% welcome match, and 10x bonus rollover requirement. Bonus eligibility, provider availability, verification, and regional access should be governed by your published terms.

## Gameplay

The featured game cards open a local simulated slot modal. The slot engine is tuned for frequent small wins and updates a browser-only balance. It is not connected to deposits, withdrawals, real provider servers, or a backend ledger.

## Login and registration

The Login and Register buttons open an in-app account modal. With Supabase configured, users sign up or log in with email/password, then the app shows their verification status, latest transaction submission, bonus balance, and 10x rollover progress.

Without Supabase environment variables, the app falls back to browser-only local account storage for previewing the UI.

## Supabase backend setup

1. Create a free Supabase project.
2. In Supabase SQL Editor, run `supabase/schema.sql`.
3. Copy `.env.example` to `.env.local`.
4. Fill in:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

5. Sign up once through the site, then make your account admin in Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin'
where email = 'your-email@example.com';
```

The admin dashboard appears inside the site only for accounts with `role = 'admin'`.

## Verification workflow

Users choose a crypto asset/network, send the $75 USD verification payment manually, paste the transaction hash into the verification form, and submit it for review. The app stores the hash in `verification_submissions` with `pending`, `verified`, or `rejected` status.

Admins log in, review the transaction externally, add an admin note, then mark the submission pending, verified, or rejected. The user account status updates in their account panel.

## Terms summary

The site includes an on-page `Bonus & Verification Rules` section covering the $100 sign-up bonus, 300% welcome match, 10x rollover, $75 verification fee, crypto network warnings, proof instructions, account approval, withdrawal review, and feature availability. Replace this practical summary with final legal terms before operating with real users.

The verification panel currently includes these deposit options:

```text
USDT / BSC: 0x3f8bf0bd8516773cc12cf462622fa601cf8a7d29
BTC / BTC:  1PjtLkUfRnuLEG6qiSz6KUdM77bz1AU3Sx
ETH / ETH:  0x3f8bf0bd8516773cc12cf462622fa601cf8a7d29
BNB / BSC:  0x3f8bf0bd8516773cc12cf462622fa601cf8a7d29
```

Only send the selected asset on the displayed network unless the payment details are changed in `src/main.jsx`.

## Run it

```bash
npm install
npm run dev
```

Open the local URL Vite gives you.

## Build

```bash
npm run build
```

## GitHub Pages environment

For the deployed GitHub Pages build, add these repository secrets in GitHub:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Go to Settings -> Secrets and variables -> Actions -> New repository secret. The workflow reads those secrets during `npm run build`.

The production build is written to `dist/`.

## GitHub Pages deployment

This project includes a GitHub Actions workflow at `.github/workflows/deploy.yml`. It builds the Vite site and deploys `dist/` to GitHub Pages on every push to the `main` branch.

First-time setup:

```bash
git init
git add .
git commit -m "Set up GitHub Pages deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

Then in GitHub:

1. Open the repository settings.
2. Go to Pages.
3. Set the source to GitHub Actions.
4. Wait for the `Deploy to GitHub Pages` workflow to finish.

The deployed site will be available at the GitHub Pages URL shown in the workflow or repository Pages settings.

## Telegram and WhatsApp previews

`index.html` includes Open Graph and Twitter metadata for mobile link previews. The preview image is `public/social-preview.png`.

After deployment, share the GitHub Pages URL in Telegram and WhatsApp to confirm the title, description, and image render correctly. Some apps cache previews aggressively, so changes may take time to refresh.

## Manual verification process

1. Visitor sends the 75 USD equivalent in an accepted crypto method.
2. Visitor messages their Telegram or WhatsApp username plus transaction hash.
3. Admin checks the transaction externally on the relevant network explorer.
4. Admin manually confirms or rejects account verification.

The verification fee must not be treated as an instant deposit, withdrawal, casino credit purchase, wager, or automated gambling transaction.

## Contact buttons

The Telegram and WhatsApp buttons are configured in `src/main.jsx`:

```js
contactLinks: {
  telegram: "https://t.me/yabigdd",
  whatsapp: "https://wa.me/642904556680?text=Hi%20NeonBet%2C%20I%20want%20to%20verify%20my%20account.",
}
```

WhatsApp numbers should include the country code and no punctuation.
