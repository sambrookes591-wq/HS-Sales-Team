// =======================================
//  TV MODE — Fullscreen + Cursor Hide
//  + Auto-Refresh Every 60 Seconds
// =======================================

// FULLSCREEN BUTTON
const fullscreenBtn = document.getElementById("fullscreen-btn");

if (fullscreenBtn) {
    fullscreenBtn.addEventListener("click", () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    });
}

// =======================================
//  KIOSK MODE — HIDE CURSOR AFTER 10 SEC
// =======================================

let cursorTimer;

function resetCursorTimer() {
    clearTimeout(cursorTimer);
    document.body.classList.remove("hide-cursor");

    cursorTimer = setTimeout(() => {
        document.body.classList.add("hide-cursor");
    }, 10000); // 10 seconds
}

window.addEventListener("mousemove", resetCursorTimer);
window.addEventListener("keydown", resetCursorTimer);

// Start immediately
resetCursorTimer();

console.log("TV mode loaded — fullscreen + cursor hide enabled.");

// =======================================
//  AUTO-REFRESH EVERY 60 SECONDS
// =======================================

const REFRESH_INTERVAL = 60000; // 60 sec

function fadeOutAndReload() {
    document.body.style.transition = "opacity 0.8s";
    document.body.style.opacity = "0";

    setTimeout(() => {
        location.reload();
    }, 800);
}

setInterval(() => {
    fadeOutAndReload();
}, REFRESH_INTERVAL);

// Ensure fade-in on page load
document.addEventListener("DOMContentLoaded", () => {
    document.body.style.opacity = "1";
});
