# wallet-health-connect

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_VFOYteTs6MtsugQbeHv0e4VidrEL)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## External Integrations

This dashboard can read live data from:

- HealthConnectGateway v2
- Budget Bakers Wallet API

The app now proxies both integrations through internal Next.js API routes so you can keep tokens server-side and avoid browser CORS issues.

### Configuration priority

1. Values saved in the settings dialog (`localStorage` in the browser)
2. Server-side environment variables from `.env.local`
3. Built-in mock data

If no credentials are available, or if a provider is temporarily unavailable, the UI stays usable with mock charts and cards.

### `.env.local`

Create a `.env.local` file based on `.env.example`.

Recommended values for your setup:

```env
HCGATEWAY_BASE_URL=https://health.tereredev.com
HCGATEWAY_TOKEN=your_healthconnectgateway_token
WALLET_API_TOKEN=your_budget_bakers_wallet_token
```

Notes:

- `HCGATEWAY_BASE_URL` should be the host only. The app adds `/api/v2/...` internally.
- Wallet API calls are sent to `https://rest.budgetbakers.com/wallet/v1/api`.
- You can still override these values per browser session from the in-app settings dialog.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/marcosferr/wallet-health-connect" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>
