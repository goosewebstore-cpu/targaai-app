# TargaAI by AutoEsperto — PWA

App completa, GRATIS al 100%, installabile su Android e iOS.
Nessun abbonamento, nessun account: tutte le funzioni sono incluse.

## File inclusi
- index.html — App principale (design scuro, ottimizzato mobile)
- app.js — Logica: foto targa, report, garage, PDF, galleria "La flotta"
- manifest.json — Configurazione PWA
- sw.js — Service Worker per offline
- icon-192.svg / icon-512.svg — Icone app
- Le foto dei veicoli sono generate come SVG in locale (niente upload, funziona offline)

## Come pubblicare (gratis)

### Opzione A — Vercel CLI (consigliata)
1. Installa Vercel CLI: npm i -g vercel
2. vercel login
3. Nella cartella del progetto: vercel --prod --yes
4. Ottieni un URL tipo https://targaai-app.vercel.app

### Opzione B — Netlify Drop (zero comandi)
1. Vai su https://app.netlify.com/drop
2. Trascina questa cartella intera
3. Ottieni un URL tipo https://targaai-abc123.netlify.app

## Per APK (Android)
1. Vai su https://www.pwabuilder.com
2. Inserisci l'URL del deploy
3. Scarica il pacchetto Android e genera l'APK (Android Studio, gratis)

## Note
- Cambia G-XXXXXXXXXX con il tuo ID Google Analytics reale (index.html)
- Cambia il numero WhatsApp (cerca 391234567890 in index.html)
- Il dominio https://targaai.app è un segnaposto: aggiornalo nel deploy se lo possiedi
- I report sono DEMO generati localmente: le foto sono illustrazioni SVG, non foto reali