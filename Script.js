let state = {
    health: { carbon: 100, uv: 100 },
    inventory: { carbon: 2, uv: 1 }, // User's stock
    liters: 0,
    autoSimInterval: null
};

function log(msg) {
    const out = document.getElementById('console-output');
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // We wrap each message in a <div> so the CSS margin-bottom works
    out.innerHTML += `<div><span style="color: #666;">[${timestamp}]</span> > ${msg}</div>`;
    
    // Target the parent box (the one with the height: 300px)
    const logContainer = document.querySelector('.system-log');
    
    // Auto-scroll to the bottom
    logContainer.scrollTop = logContainer.scrollHeight;
}

function drainSystem(amount = 10) {
    state.health.carbon = Math.max(0, state.health.carbon - (Math.floor(Math.random() * 10) + 5));
    state.health.uv = Math.max(0, state.health.uv - (Math.floor(Math.random() * 3) + 2));
    state.liters += amount;
    log(`Processed ${amount}L. Verifying Safety...`);
    updateUI();
}

function toggleAutoSim() {
    if (state.autoSimInterval) {
        clearInterval(state.autoSimInterval);
        state.autoSimInterval = null;
        log("Auto-Wear Mode: OFF");
    } else {
        state.autoSimInterval = setInterval(() => drainSystem(5), 2000);
        log("Auto-Wear Mode: ON");
    }
}

function updateUI() {
    // Update mini-bars on the image
    document.getElementById('bar-carbon').style.width = state.health.carbon + "%";
    document.getElementById('bar-uv').style.width = state.health.uv + "%";

    // Update Dashboard & Inventory
    document.getElementById('liters-val').innerText = `${state.liters} L`;
    document.getElementById('inv-carbon').innerText = state.inventory.carbon;
    document.getElementById('inv-uv').innerText = state.inventory.uv;

    const carbonZone = document.getElementById('carbon-zone');
    const uvZone = document.getElementById('uv-zone');
    const light = document.getElementById('status-light');

    // Logic for states and image blinking
    if (state.health.carbon <= 0 || state.health.uv <= 0) {
        light.className = "light red";
        document.getElementById('status-text').innerText = "SYSTEM LOCKED: REPLACE POD";
        if(state.health.carbon <= 0) carbonZone.classList.add('critical-error');
        if(state.health.uv <= 0) uvZone.classList.add('critical-error');
        document.getElementById('manual-modal').style.display = "block"; 
    } else if (state.health.carbon < 35 || state.health.uv < 35) {
        light.className = "light yellow";
        document.getElementById('status-text').innerText = "MAINTENANCE DUE SOON";
    } else {
        light.className = "light green";
        document.getElementById('status-text').innerText = "SYSTEM OPTIMAL";
        carbonZone.classList.remove('critical-error');
        uvZone.classList.remove('critical-error');
    }
}

function buyPod(type) {
    state.inventory[type]++;
    log(`Stock Updated: New ${type} pod added.`);
    updateUI();
}

// User clicks the hotspot on the image to repair
function attemptRepair(type) {
    if (state.inventory[type] > 0) {
        log(`Installing ${type} pod... [SNAP-CLICK]`);
        state.inventory[type]--;
        state.health[type] = 100;
        updateUI();
        log(`${type.toUpperCase()} restored. System Safe.`);
    } else {
        log(`REPAIR FAILED: No spare ${type} pods!`);
        const zone = document.getElementById(`${type}-zone`);
        zone.style.borderColor = "#ef4444";
        setTimeout(() => { zone.style.borderColor = ""; }, 500);
    }
}

function closeManual() { document.getElementById('manual-modal').style.display = "none"; }
window.onload = updateUI;

// This prevents the "Transport" issue
document.querySelectorAll('.hotspot').forEach(zone => {
    zone.addEventListener('click', function(event) {
        // 1. Stop the click from reaching the <a> link
        event.preventDefault(); 
        event.stopPropagation(); 
        
        // 2. Run your repair logic
        const type = this.id.includes('carbon') ? 'carbon' : 'uv';
        attemptRepair(type);
    });
});