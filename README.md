# Curriculum Vitae Static

Pure static version of the CV website with the same layout, behavior, Wordle game, and mobile responsiveness as the original Flask app.

## What Is Preserved

- Same visual layout and styling
- Same tabs behavior
- Same Wordle game functionality and word bank
- Same PDF download
- Same GA4 script integration
- Mobile responsive behavior preserved

## Project Structure

- `dist/`: generated deploy-ready static site output
- `src/data/curriculum_vitae.json`: editable CV content source
- `src/templates/index.template.html`: template used at build time
- `scripts/build.mjs`: build script that generates `dist/index.html`
- `static/`: styles, scripts, assets, and PDF

## Local Usage

1. Install dependencies:

```bash
npm install
```

2. Build static page:

```bash
npm run build
```

3. Preview locally:

```bash
npm run preview
```

Open http://127.0.0.1:8080.

## Edit Workflow

1. Update data in `src/data/curriculum_vitae.json`
2. Run `npm run build`
3. Commit and push

## Deployment: Cloudflare Pages (Recommended)

1. Push this project to a GitHub repository
2. In Cloudflare Pages, create a new project and connect the repository
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Deploy

Cloudflare Pages serves static files globally with edge caching and high availability.

## Optional Deployment: GitHub Pages

1. Push repository to GitHub
2. Enable Pages from repository settings
3. Set source to GitHub Actions or branch root
4. Ensure `npm run build` is executed before publishing

## Notes

- No backend runtime is required
- Wordle analytics uses GA4 only (no backend event endpoint)
