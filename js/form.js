// ===============================
//  HomeSecure Sales Form Logic
// ===============================

import { app } from "./firebase-init.js";
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore(app);

// DOM elements
const agentInput = document.getElementById("agent");
const upfrontInput = document.getElementById("upfront");
const monitoringInput = document.getElementById("monitoring");
const submitButton = document.getElementById("submit-sale");
const successMessage = document.getElementById("success-message");

// ===============================
//  SUBMIT SALE
// ===============================

submitButton.addEventListener("click", async () => {
    const agent = agentInput.value;
    const upfront = Number(upfrontInput.value);
    const monitoring = Number(monitoringInput.value);

    // Basic validation
    if (!agent || upfront <= 0 || monitoring <= 0) {
        alert("Please fill out all fields correctly.");
        return;
    }

    // Add a human-readable date string (fixes dashboard issues)
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

    try {
        await addDoc(collection(db, "sales"), {
            agent: agent,
            upfront: upfront,
            monitoring: monitoring,
            date: dateStr,
            timestamp: serverTimestamp()
        });

        // Show success
        successMessage.style.display = "block";

        // Clear inputs
        agentInput.value = "";
        upfrontInput.value = "";
        monitoringInput.value = "";

        // Hide success after 2 sec
        setTimeout(() => {
            successMessage.style.display = "none";
        }, 2000);

    } catch (err) {
        console.error("Error adding sale:", err);
        alert("Error submitting sale.");
    }
});
