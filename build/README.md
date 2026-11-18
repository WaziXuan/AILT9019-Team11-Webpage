# Building index.html

`index.html` is generated. Edit `page.src.html`, then rebuild.

1. `explorer.json` holds the interactive "pick an item" answers. Regenerate it from the code repo root
   (hryLiuYibo/AILT9019_Team11_Project) so every answer is real classifier output:
   `python path/to/gen_explorer.py > path/to/explorer.json`
2. `python build.py page.src.html explorer.json ../index.html`
3. Upload `index.html` + `img/` (zip with forward-slash paths) to the Cloudflare Pages project `ailt9019-team11`.

## Screenshots (img/*.png, img/*_dark.png)

`shoot.mjs` drives headless Chrome over the DevTools Protocol at 3x device pixel ratio.
Run the app (`python src/app.py 8123 --offline`), start
`chrome --headless=new --remote-debugging-port=9333 --user-data-dir=<tmp>`, then
`node shoot.mjs 9333 http://localhost:8123/ ../img`.
For the dark set, start a second headless Chrome with
`--enable-features=WebContentsForceDark --force-dark-mode` on port 9334 and run
`node shoot.mjs 9334 http://localhost:8123/ ../img _dark`.
