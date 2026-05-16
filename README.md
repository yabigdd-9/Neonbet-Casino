# NeonBet Casino Website

This is a React + Vite + Tailwind casino-style landing page and lobby.

## Important

This project is a static frontend. It does not include a gambling backend, account database, wallet connection, payment processor, automated verification, deposits, withdrawals, or game-provider integrations.

The site includes a static manual crypto verification panel for a 75 USD account verification fee, plus marketing copy for a free 100 USD sign-up bonus, 300% welcome match, and 10x bonus rollover requirement. Bonus eligibility, provider availability, verification, and regional access should be governed by your published terms.

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
