# site

Static personal site. SvelteKit + mdsvex + adapter-static.

```bash
npm install && npm run dev
```

`npm run build` outputs a static site to `build/`.

## Editing

- **About / name / resume link** — `src/lib/content/about.md` (frontmatter + body)
- **Writings** — add a `.md` file to `src/lib/content/writings/`; frontmatter needs
  `title` and `date`. It appears on the home page and at `/w/<filename>`.
- **Type and palette** — the tokens in `src/app.css`. Cardo (self-hosted in
  `static/fonts/`) for the name, system grotesk for everything else;
  gray ink on warm white, modeled on jyopari.github.io, ahidas.com, jeffreygwang.com.
- **Side sketches** — `src/lib/sketches/{sf,la}.svg`, traced from the source PNGs with
  `potrace`. Both share a 1000:170 canvas with the horizon line at 160/170 of the height,
  so the two horizons align across the page as long as the side columns stay equal width.
  Replacing one means matching that convention (the measured horizon is in `data-baseline`,
  in the file's own viewBox units).
- **Resume** — drop `resume.pdf` in `static/`.
