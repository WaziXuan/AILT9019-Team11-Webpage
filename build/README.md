# Building index.html

`index.html` is generated. Edit `page.src.html`, then rebuild.

1. `explorer.json` holds the interactive "pick an item" answers. Regenerate it from the code repo root
   (hryLiuYibo/AILT9019_Team11_Project) so every answer is real classifier output:
   `python path/to/gen_explorer.py > path/to/explorer.json`
2. `python build.py page.src.html explorer.json ../index.html`
3. Upload `index.html` + `img/` (zip with forward-slash paths) to the Cloudflare Pages project `ailt9019-team11`.
