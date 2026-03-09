import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  server: {
    proxy: {
      // Dev-CORS korjaus: selaimesta kutsutaan /api/* samaan originin,
      // Vite valittaa pyynnot taustalla backendiin 127.0.0.1:3000.
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      // Monisivuinen build (erilliset HTML-entryt).
      input: {
        main: resolve(__dirname, 'index.html'),
        bmi: resolve(__dirname, 'bmi.html'),
        contact: resolve(__dirname, 'yhteystiedot.html'),
        harjoituket: resolve(__dirname, 'harjoitukset.html'),
      },
    },
  },
  // Julkinen base-polku tuotantobuildille.
  // base: '/~saaraidk/hyte/',
  base: './',
});
