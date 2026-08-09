import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const entry = path.join(projectRoot, 'public', 'react', 'index.jsx');
const outfile = path.join(projectRoot, 'public', 'js', 'react-widgets.js');

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  format: 'iife',
  globalName: 'ABCSolutionsCompanyReact',
  outfile,
  logLevel: 'info'
});
