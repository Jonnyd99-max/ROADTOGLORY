import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {VitePWA} from 'vite-plugin-pwa';
export default defineConfig({base:'/ROADTOGLORY/',plugins:[react(),VitePWA({registerType:'autoUpdate',includeAssets:['crest.svg'],manifest:{name:'Road to Glory: Football Dynasty',short_name:'Road to Glory',start_url:'.',display:'standalone',background_color:'#101216',theme_color:'#a51e35',icons:[{src:'icon-192.png',sizes:'192x192',type:'image/png'},{src:'icon-512.png',sizes:'512x512',type:'image/png',purpose:'any maskable'}]},workbox:{globPatterns:['**/*.{js,css,html,svg,png,woff2}']}})]});
