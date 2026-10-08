import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
export async function build() {
  const [html, css, js] = await Promise.all(['index.html', 'styles.css', 'app.js'].map(name => readFile(path.join(root, 'src', name), 'utf8')));
  const styleTag = '<link rel="stylesheet" href="./styles.css">';
  const scriptTag = '<script type="module" src="./app.js"></script>';
  if (html.split(styleTag).length !== 2 || html.split(scriptTag).length !== 2) throw new Error('Source entry must contain exactly one stylesheet and application module reference.');
  // Callbacks preserve literal $ sequences in source code.
  const output = html.replace(styleTag, () => '<style>' + css + '</style>').replace(scriptTag, () => '<script type="module">' + js + '</script>');
  await mkdir(path.join(root, 'dist'), { recursive: true });
  const target = path.join(root, 'dist', '节拍工作台.html');
  await writeFile(target, output, 'utf8');
  return target;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) console.log(await build());
