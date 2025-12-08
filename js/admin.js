// ================================================
// HomeSecure Admin Control Panel
// Allows editing & deleting individual sales
// ================================================

import { app } from "./firebase-init.js";
import {
    getFirestore,
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore(app);

// DOM elements for the modal
const editModal = document.getElementById("edit-modal");
const closeModal = document.getElementById("close-modal");
const saveBtn = document.getElementById("save-edit");
const deleteBtn = document.getElementById("delete-sale");

let currentSaleId = null;

// ===============================
// LOAD ALL SALES INTO ADMIN TABLE
// ===============================

async function loadAdminTable() {
    const tbody = document.getElementById("admin-sales-body");
    tbody.innerHTML = "";

    const q = query(collection(db, "sales"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);

    snapshot.forEach(docSnap => {
        const sale = docSnap.data();
        const id = docSnap.id;

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${id}</td>
            <td>${sale.agent}</td>
            <td>${sale.date || "No date"}</td>
            <td>€${sale.upfront}</td>
            <td>€${sale.monitoring}</td>
            <td>${sale.timestamp?.toDate ? sale.timestamp.toDate().toLocaleString() : ""}</td>
        `;

        tr.addEventListener("click", () => openEditModal(id, sale));

        tbody.appendChild(tr);
    });
}

// ===============================
// OPEN EDIT MODAL WITH SALE DATA
// ===============================

function openEditModal(id, sale) {
    currentSaleId = id;

    document.getElementById("edit-agent").value = sale.agent;
    document.getElementById("edit-upfront").value = sale.upfront;
    document.getElementById("edit-monitoring").value = sale.monitoring;

    editModal.style.display = "flex";
}

// ===============================
// CLOSE MODAL
// ===============================

closeModal.addEventListener("click", () => {
    editModal.style.display = "none";
});

// ===============================
// SAVE UPDATED SALE
// ===============================

saveBtn.addEventListener("click", async () => {
    if (!currentSaleId) return;

    const ref = doc(db, "sales", currentSaleId);

    await updateDoc(ref, {
        agent: document.getElementById("edit-agent").value,
        upfront: Number(document.getElementById("edit-upfront").value),
        monitoring: Number(document.getElementById("edit-monitoring").value),
    });

    alert("Sale updated!");
    editModal.style.display = "none";
    loadAdminTable();
});

// ===============================
// DELETE SALE COMPLETELY
// ===============================

deleteBtn.addEventListener("click", async () => {
    if (!currentSaleId) return;

    if (!confirm("Are you sure you want to delete this sale?")) return;

    await deleteDoc(doc(db, "sales", currentSaleId));

    alert("Sale deleted.");
    editModal.style.display = "none";
    loadAdminTable();
});

// ===============================
// INIT ADMIN PANEL
// ===============================

loadAdminTable();
