# Anatomy SVG core

This is a selected, unmodified copy of the MIT-licensed SVG drawing core from
[wheresryan22/anatomy](https://github.com/wheresryan22/anatomy).
The original [license](LICENSE) and copyright notice are retained.
[MANIFEST.json](MANIFEST.json) records the SHA-256 of every copied file.
All 12 copied files were verified against upstream commit
[`e9488296a44211c42701ff71705b7901470ec78f`](https://github.com/wheresryan22/anatomy/tree/e9488296a44211c42701ff71705b7901470ec78f).

The selection provides cameras, solid geometry, four-tone shading, face text,
springs, readouts, round bodies, tubes, and geometry audits. It also provides
browser screenshot, scripted interaction, and line-end checks. All relative
runtime imports resolve inside this directory. No npm package is needed.

WebGL, true 3D, React wrappers, community publishing, and the upstream example
gallery are outside this bundle. The merged skill does not require them.
The original instruction file is not included: use the merged skill's
[Anatomy adapter](../../references/anatomy-adapter.md), which changes the original
rules about minimum part counts, labels, and automatic motion.

Start with the original, rebuildable
[spring example](../../examples/spring-balance/build.mjs). Its source imports
`kit/iso-kit.mjs` and embeds that runtime in the finished HTML. The example is
new work; it is not an upstream Anatomy example.

Builds need Node.js 20.10 or later. Browser checks use Chrome or Chromium.
Node.js 22 or later is recommended for the check scripts' native WebSocket.
Set `CHROME_PATH` if the browser is not in a standard install location.
These check scripts launch a separate, temporary browser profile.

From the repository root, while a local HTTP server is serving the repository:

```sh
node vendor/anatomy/scripts/capture.mjs http://127.0.0.1:8000/examples/spring-balance/ --select main --out /tmp/spring-desktop.png
node vendor/anatomy/scripts/capture.mjs http://127.0.0.1:8000/examples/spring-balance/ --select main --width 390 --out /tmp/spring-phone.png
node vendor/anatomy/scripts/drive.mjs --help
```

Select the whole explanation (`--select main`) so that captions and adjacent
prose are checked too. Run geometry and line-end audits where applicable;
passing them does not prove the physics model or instructional accuracy.
