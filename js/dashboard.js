// ===============================
//  HomeSecure Dashboard Engine
// ===============================

import { db } from "./firebase-init.js";
import {
    getFirestore,
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore(app);

// TEAM DEFINITIONS
const CORE = ["Craig", "Jamie", "Johnny", "Lar", "Shane"];
const SWEEP = ["Bradley", "John", "Keith", "Ross"];

// Utility to format values
function formatEuro(value) {
    return "€" + value.toFixed(2);
}

// ===============================
//  LOAD SALES + BUILD BASE STATS
// ===============================

async function loadSales() {
    const salesRef = collection(db, "sales");
    const q = query(salesRef, orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    // STEP 1 — preload every agent with zero stats
    const stats = {};

    [...CORE, ...SWEEP].forEach(agent => {
        stats[agent] = {
            agent,
            team: CORE.includes(agent) ? "CORE" : "SWEEP",
            daily: 0,
            weekly: 0,
            monthly: 0,
            yearly: 0,
            upfrontTotal: 0,
            monitoringTotal: 0,
            saleCount: 0,
            avgUpfront: 0,
            avgMonitoring: 0,
            badges: []
        };
    });

    // Today's date
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Monday of this week
    const monday = new Date(today);
    monday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));

    // First day of this month
    const firstMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // First day of this year
    const firstYear = new Date(today.getFullYear(), 0, 1);

    // STEP 2 — aggregate sales
    snapshot.forEach(doc => {
        const sale = doc.data();
        const agent = sale.agent;

        if (!stats[agent]) return;

        const saleDate = sale.date;
        if (!saleDate) return;

        const saleD = new Date(saleDate);

        // DAILY
        if (saleDate === todayStr) {
            stats[agent].daily++;
        }

        // WEEKLY (Mon–Sun)
        if (saleD >= monday && saleD <= today) {
            stats[agent].weekly++;
        }

        // MONTHLY
        if (saleD >= firstMonth) {
            stats[agent].monthly++;
        }

        // YEARLY
        if (saleD >= firstYear) {
            stats[agent].yearly++;
        }

        // AVERAGES
        stats[agent].upfrontTotal += Number(sale.upfront || 0);
        stats[agent].monitoringTotal += Number(sale.monitoring || 0);
        stats[agent].saleCount++;
    });

    // STEP 3 — compute averages
    Object.keys(stats).forEach(agent => {
        const s = stats[agent];
        if (s.saleCount > 0) {
            s.avgUpfront = s.upfrontTotal / s.saleCount;
            s.avgMonitoring = s.monitoringTotal / s.saleCount;
        }
    });

    return stats;
}

// ===============================
//  PROCESS + SORT + RANK
// ===============================

function processTeams(stats) {
    const core = CORE.map(a => stats[a]);
    const sweep = SWEEP.map(a => stats[a]);

    // Check if EVERYONE in both teams has zero monthly sales
    const everyoneZero =
        core.every(a => a.monthly === 0) &&
        sweep.every(a => a.monthly === 0);

    // If everyone has zero monthly → alphabetical
    if (everyoneZero) {
        core.sort((a, b) => a.agent.localeCompare(b.agent));
        sweep.sort((a, b) => a.agent.localeCompare(b.agent));
    } 
    else {
        // Otherwise → rank by MONTHLY DESC
        core.sort((a, b) => b.monthly - a.monthly || a.agent.localeCompare(b.agent));
        sweep.sort((a, b) => b.monthly - a.monthly || a.agent.localeCompare(b.agent));
    }

    // Assign ranks (separate for each team)
    core.forEach((a, i) => a.rank = i + 1);
    sweep.forEach((a, i) => a.rank = i + 1);

    // Apply badges AFTER ranking
    core.forEach(assignBadges);
    sweep.forEach(assignBadges);

    return { core, sweep };
}

// ===============================
//  BADGE ENGINE
// ===============================

function assignBadges(agent) {
    const badges = [];

    // DAILY STREAK
    if (agent.daily >= 7) badges.push("🔥 POWER");
    else if (agent.daily >= 5) badges.push("🔥 ON FIRE");
    else if (agent.daily >= 3) badges.push("🔥 HOT");

    // TEAM LEADER (Rank 1)
    if (agent.rank === 1) {
        badges.push("👑");
    }

    // WEEKLY PERFORMANCE
    if (agent.team === "CORE") {
        if (agent.weekly >= 20) badges.push("💥 DESTROYER");
        else if (agent.weekly >= 15) badges.push("🚀 ROCKET");
    } else {
        if (agent.weekly >= 8) badges.push("💥 DESTROYER");
        else if (agent.weekly >= 6) badges.push("🚀 ROCKET");
    }

    // Assign final badge set
    agent.badges = badges;
}

// ===============================
//  UPDATE KPI BAR
// ===============================

function updateKPIs(core, sweep) {
    const all = [...core, ...sweep];

    const monthly = all.reduce((sum, a) => sum + a.monthly, 0);
    const yearly = all.reduce((sum, a) => sum + a.yearly, 0);

    const upfronts = all.filter(a => a.saleCount > 0).map(a => a.avgUpfront);
    const monitorings = all.filter(a => a.saleCount > 0).map(a => a.avgMonitoring);

    const avgUpfront = upfronts.length ? 
        upfronts.reduce((a, b) => a + b, 0) / upfronts.length : 0;

    const avgMonitoring = monitorings.length ? 
        monitorings.reduce((a, b) => a + b, 0) / monitorings.length : 0;

    document.getElementById("kpi-monthly-value").textContent = monthly;
    document.getElementById("kpi-yearly-value").textContent = yearly;
    document.getElementById("kpi-upfront-value").textContent = "€" + avgUpfront.toFixed(2);
    document.getElementById("kpi-monitoring-value").textContent = "€" + avgMonitoring.toFixed(2);
}

// ===============================
//  RENDER TEAM TABLE
// ===============================

function renderTeam(teamData, tbodyId) {
    const tbody = document.getElementById(tbodyId);
    tbody.innerHTML = "";

    teamData.forEach(agent => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${agent.agent}</td>
            <td class="badge-cell">${agent.badges.join(" ")}</td>
            <td>${agent.daily}</td>
            <td>${agent.weekly}</td>
            <td>${agent.monthly}</td>
            <td>${formatEuro(agent.avgUpfront)}</td>
            <td>${formatEuro(agent.avgMonitoring)}</td>
            <td>${agent.yearly}</td>
            <td>${agent.rank}</td>
        `;

        tbody.appendChild(tr);
    });
}

// ===============================
//  CELEBRATION BANNER
// ===============================

function showCelebration(message) {
    const root = document.getElementById("celebration-root");

    const banner = document.createElement("div");
    banner.className = "celebration-banner";
    banner.textContent = message;

    root.appendChild(banner);

    setTimeout(() => {
        banner.classList.add("fade-out");
        setTimeout(() => banner.remove(), 800);
    }, 3000);
}

// ===============================
//  MAIN INITIALIZER
// ===============================

async function init() {
    const stats = await loadSales();
    const { core, sweep } = processTeams(stats);

    updateKPIs(core, sweep);
    renderTeam(core, "core-team-body");
    renderTeam(sweep, "sweep-team-body");
}

init();
