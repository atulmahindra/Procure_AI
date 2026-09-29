# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Backend connection (Quotation Ranking API)
The upload page (Page 2) sends the PDFs to the backend and Page 3 is rendered entirely from its response.

1. Local, one command: run `run.bat` in the parent folder (backend serves the built app from `dist/`).
   Live editing: copy `.env.example` to `.env.local` (`VITE_API_URL=http://localhost:8000`), run the backend, then `npm run dev`.
2. Vercel: Settings → Environment Variables → `VITE_API_URL` = your Render backend URL (no trailing `/`) → Redeploy.

Files involved: `src/modules/after-login/quotationApi.ts` (API calls + types), `Upload.tsx`, `CompareQuotations.tsx`.
