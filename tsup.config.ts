import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  target: 'node20',
  outDir: 'dist',
  clean: true,
  bundle: true,
  noExternal: [/.*/],
  minify: false,
  sourcemap: true,
  splitting: false,
  shims: true,
});
