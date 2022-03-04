import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import checker from 'vite-plugin-checker';
import viteCompression from 'vite-plugin-compression';
import svgr from 'vite-plugin-svgr';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, 'env');

  /**
   * Custom plugin used to support using env-variables in `.html`-files like index.html
   * How to use: `%VITE_ENV_VARIABLE%`
   */
  const htmlPlugin = () => {
    return {
      name: 'html-transform',
      transformIndexHtml(html: string) {
        return html.replace(/%(.*?)%/g, function (match, p1) {
          return env[p1];
        });
      },
    };
  };

  return {
    esbuild: {
      treeShaking: true,
      jsxInject: mode === 'production' ? `import React from 'react'` : undefined,
    },
    build: {
      outDir: 'build',
      assetsDir: 'static',
      sourcemap: true,
      rollupOptions: {
        output: {
          entryFileNames: `static/js/[name].[hash].js`,
          chunkFileNames: `static/js/[name].[hash].js`,
          assetFileNames: ({ name }) => {
            if (name && name.endsWith('.css')) {
              return 'static/css/[name].[hash].[ext]';
            }

            return 'static/media/[name].[hash].[ext]';
          },
          sourcemap: true,
        },
      },
    },
    /**
     * htmlPlugin -> Use env-variables in `.html`-files
     * react -> Enables fast refresh on save and jsx-syntax
     * svgr -> Allows import of SVG-files as React-components
     * tsconfigPaths -> Adds support for absolute file import with Typescript
     * checker -> Checks that Typescript and ESLint has no errors/warnings
     * viteCompression -> Compresses files with brotli to minimize bundle size
     */
    plugins: [
      htmlPlugin(),
      svgr(),
      tsconfigPaths(),
      ...(mode === 'development' ? [react()] : []),
      checker({ typescript: true, eslint: { lintCommand: 'eslint "./src/**/*.{ts,tsx}"' }, overlay: false }),
      viteCompression({ algorithm: 'brotliCompress' }),
    ],
  };
});
