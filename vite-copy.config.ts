import { defineConfig } from 'vite';
import path from 'path';
import packageJson from './package.json';
import VueDevTools from 'vite-plugin-vue-devtools'
import { viteStaticCopy } from 'vite-plugin-static-copy';
import vue from '@vitejs/plugin-vue';
import vueI18n from '@intlify/unplugin-vue-i18n/vite';
import { del } from '@kineticcafe/rollup-plugin-delete';
//import { DominionContentGenerate, HandleLocaleGenerateAndMerge } from './plugins/vite-dominion-content';

const devServerPort = 5173
const publicationDir = 'dist'


export default defineConfig( ({ mode}) => {

  let base_URL = './'
  if (mode === 'production') base_URL='/Vite-KingdomCreator-New'
  console.log ('\nbuild mode is', mode)
  console.log('process.env.VITE_BASE_URL', process.env.VITE_BASE_URL,'\n')
  console.log('Base_URL', base_URL ,'\n')
  {
    //DominionContentGenerate(publicationDir);
    let ArgGenLocale = "Merge"
    if (process.argv.slice(3)[0] == "Gen") {
        ArgGenLocale = "Gen&Merge"
    }
    //HandleLocaleGenerateAndMerge(ArgGenLocale, publicationDir)
  }

  return {
    appType: 'spa',
    publicDir: false,
    base: base_URL, // Utilise la variable d'environnement si elle est définie,
    /*
    Do not use publicDir feature to avoid duplcation of all image and pdf files.
    */
    define: {
      'Pkgejson_Version': JSON.stringify(packageJson.version),
      'Pkgejson_Name': JSON.stringify(packageJson.name),
      'Pkgejson_URL': JSON.stringify(packageJson.repository.url),
      'Pkgejson_Date': JSON.stringify(new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'numeric' }))
    },
    plugins: [
      { name: 'add-datetime',
        transformIndexHtml(html) {
          const datetime = new Date().toISOString();
          console.log('\nGenerate Date and Time: ', datetime);
          return html.replace(/id="datetime">/, `id="datetime">${datetime}`);
        }
      },
      vue(),
      //VueDevTools(),
      vueI18n({
        include: path.resolve(__dirname, './'+ publicationDir +'/locales/*.json'),
        compositionOnly: true, 
        fullInstall: true,
        allowDynamic: true,
        runtimeOnly: false
      }),
      del({
        targets: [publicationDir +'/*',
          '!'+ publicationDir +'/rules',
          '!'+ publicationDir +'/rules.fr',
          '!'+ publicationDir +'/rules.de',
          '!'+ publicationDir +'/img',
          '!'+ publicationDir +'/favicon.ico',
          '!'+ publicationDir +'/dominion-content.js',
          '!'+ publicationDir +'/locales',
          '!'+ publicationDir +'/locales/??.json',
          '!'+ publicationDir +'/CNAME',
          '!'+ publicationDir +'/.nojekyll',
          '!'+ publicationDir +'/ads.txt'],
        verbose: false
      }), 
       viteStaticCopy({
         targets: [ { src: 'styles/normalize-v8.css', dest: 'assets/' },
        ]
       }),
    ],
    optimizeDeps: {
      include: ['vue', 'vue-i18n']
    },
    resolve: {
      //extensions: ['.ts', '.vue'],
      alias: {
        // Alias pour les modules non-Esbuild compatibles avec Vite
        //'@': fileURLToPath(new URL('./src', import.meta.url)),
        //'vue-i18n': 'vue-i18n/dist/vue-i18n.esm-bundler.js',
        //'vue': 'vue/dist/vue.esm-bundler.js', 
      },
    },
    build: {
      minify: false,
      outDir: publicationDir,
      emptyOutDir: false,
      sourcemap: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]'
        }
      },
    },
    server: {
      open: '/',
      proxy: {
        '^/$': {
          target: 'http://localhost:' + devServerPort,
          rewrite: () => '/index.html',
        },
        '/dominion-content.js': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) => path.replace(/^\/dominion-content.js/, '/'+ publicationDir +'/dominion-content.js'),
        },
        '/normalize': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) => path.replace(/^\/normalize/, '/'+ publicationDir +'/normalize'),
        },
        '/favicon.ico': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) => path.replace(/^\/favicon.ico/, '/'+ publicationDir +'/favicon.ico'),
        },
        '/img': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) => path.replace(/^\/img/, '/'+ publicationDir +'/img'),
        },
        '/rules': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) => path.replace(/^\/rules/, '/'+ publicationDir +'/rules'),
        },
        '/locales': {
          target: 'http://localhost:' + devServerPort,
          rewrite: (path) => path.replace(/^\/locales/, '/'+ publicationDir +'/locales'),
        },
        '/?': {
          target: 'http://localhost:' + devServerPort,
          // rewrite: (path) => path.replace(/^\/?/, '/docs/index.html?'),
          rewrite: (path) => path.replace(/^\/?/, '/index.html?'),
        },
      },
    },
    preview: {
     proxy:{}
    }
  }
});

