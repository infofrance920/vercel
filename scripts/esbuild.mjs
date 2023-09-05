import ts from 'typescript';
import * as path from 'path';
import { build } from 'esbuild';

function parseTsConfig(tsconfigPath) {
  const parsedConfig = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (parsedConfig.error) {
    console.error(
      'Error parsing tsconfig:',
      ts.flattenDiagnosticMessageText(parsedConfig.error.messageText, '\n')
    );
    return;
  }

  const result = ts.parseJsonConfigFileContent(
    parsedConfig.config,
    ts.sys,
    path.dirname(tsconfigPath)
  );
  if (result.errors && result.errors.length > 0) {
    for (const error of result.errors) {
      console.error(ts.flattenDiagnosticMessageText(error.messageText, '\n'));
    }
    return;
  }
  return result;
}

const cwd = process.cwd();
const configPath = path.join(cwd, 'tsconfig.json');
const tsconfig = parseTsConfig(configPath);

if (!tsconfig) {
  process.exit(1);
}

await build({
  entryPoints: tsconfig.fileNames,
  bundle: process.argv.includes('--bundle'),
  format: 'cjs',
  outdir: tsconfig.options.outDir,
  platform: 'node',
  target: ts.ScriptTarget[tsconfig.options.target],
  sourcemap: tsconfig.options.sourceMap,
});
