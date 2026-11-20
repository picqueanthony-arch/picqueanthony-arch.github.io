// Le site lu dans le Guide de l'appli Dante OS (hors ligne) : on le sait avant le premier affichage, pour cacher ce qui
// sert à le télécharger (si on est là, on l'a déjà). Rien d'autre.
if (/DanteOSGuide/.test(navigator.userAgent)) document.documentElement.classList.add("in-app");
