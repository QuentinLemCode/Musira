/// <reference types='vitest' />
import { defineConfig } from 'vite';
import swc from 'unplugin-swc';

// import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/api',

  plugins: [swc.vite({ module: { type: 'es6' } })],

  // plugins: [nxViteTsPaths()]

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  test: {
    globals: true,
    root: __dirname,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],

    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/api',
      provider: 'v8',
    },
  },

  resolve: {
    alias: {
      '@musira/api-interfaces': '../../libs/api-interfaces/src/index.ts',
    },
  },
});
