# TargaAI by AutoEsperto — PWA

App completa, GRATIS al 100%, installabile su Android e iOS.
Nessun abbonamento, nessun account: tutte le funzioni sono incluse.

## LIVE
https://goosewebstore-cpu.github.io/targaai-app/
(aggiungi #demo all'URL per un report di esempio)

## File inclusi
- index.html — App principale (design scuro, ottimizzato mobile)
- app.js — Logica: foto targa, report, garage, PDF, galleria "La flotta"
- manifest.json — Configurazione PWA
- sw.js — Service Worker per offline
- icon-192.svg / icon-512.svg — Icone app
- og-image.svg — Banner condivisione social
- Le foto dei veicoli sono generate come SVG in locale (niente upload, funziona offline)

## Come aggiornare il deploy (gratis, GitHub Pages)
1. git add . && git commit -m "descrizione"
2. git push origin main
3. GitHub Pages pubblica automaticamente in ~1 minuto

## Per APK (Android)
1. Vai su https://www.pwabuilder.com
2. Inserisci l'URL del deploy
3. Scarica il pacchetto Android e genera l'APK (Android Studio, gratis)

## Note
- Cambia G-XXXXXXXXXX con il tuo ID Google Analytics reale (index.html)
- Cambia il numero WhatsApp (cerca 391234567890 in index.html)
- Aggiorna le URL og:image/twitter:image se cambi dominio
- I report sono DEMO generati localmente: le foto sono illustrazioni SVG, non foto reali