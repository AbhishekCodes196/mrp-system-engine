const BASE_URL = 'http://localhost:8083';

document.addEventListener('DOMContentLoaded', () => {
    loadParts();
    loadActiveBomLinks();
});

/**
 * 1. ITEM CATALOG & INVENTORY MANAGEMENT
 */
function loadParts() {
    fetch(`${BASE_URL}/parts`)
        .then(res => res.json())
        .then(parts => {
            displayPartsTable(parts);
            populateDropdowns(parts);
        })
        .catch(err => console.error('Error loading parts:', err));
}

function displayPartsTable(parts) {
    const tbody = document.getElementById('partTableBody');
    tbody.innerHTML = '';

    if (parts.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No items registered.</td></tr>`;
        return;
    }

    parts.forEach(part => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${part.id}</td>
            <td><strong>${part.partName}</strong></td>
            <td>${part.currentStock}</td>
            <td>${part.leadTimeDays} Days</td>
            <td class="actions-cell">
                <button onclick="editPart(${part.id}, '${part.partName}', ${part.currentStock}, ${part.leadTimeDays})" 
                        style="background: #4b5563; font-size: 0.75rem; padding: 4px 8px;">Edit</button>
                <button onclick="showDetails(${part.id})" 
                        style="background: #2563eb; font-size: 0.75rem; padding: 4px 8px;">BOM Tree</button>
                <button onclick="deletePart(${part.id})" 
                        style="background: #dc2626; font-size: 0.75rem; padding: 4px 8px;">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function populateDropdowns(parts) {
    const parentSelect = document.getElementById('parentPart');
    const childSelect = document.getElementById('childPart');
    const mrpSelect = document.getElementById('mrpTargetPart');

    parentSelect.innerHTML = '<option value="">Select Parent Assembly...</option>';
    childSelect.innerHTML = '<option value="">Select Sub-Component...</option>';
    mrpSelect.innerHTML = '<option value="">Select Target Finished Good...</option>';

    parts.forEach(part => {
        const optionText = `${part.partName} (ID: ${part.id})`;
        parentSelect.innerHTML += `<option value="${part.id}">${optionText}</option>`;
        childSelect.innerHTML += `<option value="${part.id}">${optionText}</option>`;
        mrpSelect.innerHTML += `<option value="${part.id}">${optionText}</option>`;
    });
}

function savePart() {
    const id = document.getElementById('partId').value;
    const partName = document.getElementById('partName').value;
    const currentStock = parseInt(document.getElementById('stock').value);
    const leadTimeDays = parseInt(document.getElementById('leadTime').value);

    if (!partName || isNaN(currentStock) || isNaN(leadTimeDays)) {
        alert('Please complete all item fields before saving.');
        return;
    }

    const payload = { partName, currentStock, leadTimeDays };
    if (id) payload.id = parseInt(id);

    const url = id ? `${BASE_URL}/parts/${id}` : `${BASE_URL}/parts`;
    const method = id ? 'PUT' : 'POST';

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(() => {
        clearPartForm();
        loadParts();
    })
    .catch(err => console.error('Error saving item:', err));
}

function deletePart(id) {
    if (confirm('Delete this item from inventory?')) {
        fetch(`${BASE_URL}/parts/${id}`, { method: 'DELETE' })
            .then(() => {
                loadParts();
                loadActiveBomLinks();
            })
            .catch(err => console.error('Error deleting item:', err));
    }
}

function editPart(id, name, stock, leadTime) {
    document.getElementById('partId').value = id;
    document.getElementById('partName').value = name;
    document.getElementById('stock').value = stock;
    document.getElementById('leadTime').value = leadTime;
}

function clearPartForm() {
    document.getElementById('partId').value = '';
    document.getElementById('partName').value = '';
    document.getElementById('stock').value = '';
    document.getElementById('leadTime').value = '';
}

/**
 * 2. BILL OF MATERIALS (BOM) HIERARCHY
 */
function saveBomLink() {
    const parentItemId = document.getElementById('parentPart').value;
    const childItemId = document.getElementById('childPart').value;
    const quantityRequired = parseInt(document.getElementById('bomQuantity').value);

    if (!parentItemId || !childItemId || isNaN(quantityRequired)) {
        alert('Please select both parent/child items and enter quantity.');
        return;
    }

    if (parentItemId === childItemId) {
        alert('An item cannot be a component of itself.');
        return;
    }

    const payload = {
        parentItemId: parseInt(parentItemId),
        childItemId: parseInt(childItemId),
        quantityRequired: quantityRequired
    };

    fetch(`${BASE_URL}/bom/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(() => {
        document.getElementById('bomQuantity').value = '';
        loadActiveBomLinks();
    })
    .catch(err => console.error('Error establishing BOM link:', err));
}

function loadActiveBomLinks() {
    fetch(`${BASE_URL}/bom-links`)
        .then(res => res.json())
        .then(links => {
            const tbody = document.getElementById('bomLinksTableBody');
            tbody.innerHTML = '';

            if (links.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted); font-style: italic;">No BOM hierarchy links defined yet.</td></tr>`;
                return;
            }

            links.forEach(link => {
                const parentId = link.parentItemId || (link.parentItem ? link.parentItem.id : 'N/A');
                const childId = link.childItemId || (link.childItem ? link.childItem.id : 'N/A');
                const qty = link.quantityRequired || link.quantity || 0;

                const row = `<tr>
                    <td><strong>#${link.id}</strong></td>
                    <td>Parent ID: ${parentId}</td>
                    <td>Child ID: ${childId}</td>
                    <td><span class="badge-ok">${qty} per assembly</span></td>
                </tr>`;
                tbody.insertAdjacentHTML('beforeend', row);
            });
        })
        .catch(err => console.error('Error fetching BOM links:', err));
}

/**
 * 3. RECURSIVE MRP CALCULATION & NET REQUIREMENT
 */
function calculateMRP() {
    const partId = document.getElementById('mrpTargetPart').value;
    const quantity = parseInt(document.getElementById('mrpQuantity').value);

    if (!partId || isNaN(quantity) || quantity <= 0) {
        alert('Please specify both a target finished good and order quantity.');
        return;
    }

    fetch(`${BASE_URL}/mrp/calculate?partId=${partId}&quantity=${quantity}`)
        .then(res => res.json())
        .then(results => {
            const tbody = document.getElementById('mrpResultsBody');
            tbody.innerHTML = '';

            if (results.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); font-style: italic;">No component requirements found.</td></tr>`;
                return;
            }

            results.forEach(item => {
                const tr = document.createElement('tr');
                const isShortage = item.netRequirement > 0;

                if (isShortage) {
                    tr.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                }

                tr.innerHTML = `
                    <td>${item.id}</td>
                    <td><strong>${item.partName}</strong></td>
                    <td>${item.grossRequirement}</td>
                    <td>${item.currentStock}</td>
                    <td><strong style="color: ${isShortage ? '#f87171' : '#34d399'}">${item.netRequirement}</strong></td>
                    <td>${item.leadTimeDays} Days</td>
                    <td>
                        <span class="${isShortage ? 'badge-warning' : 'badge-ok'}">
                            ${isShortage ? `⚠️ Purchase ${item.netRequirement} units` : '✅ Stock Adequate'}
                        </span>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error('Error running MRP calculation:', err));
}

/**
 * 4. BOM TREE EXPLOSION MODAL
 */
function showDetails(partId) {
    fetch(`${BASE_URL}/explode/${partId}`)
        .then(res => {
            if (!res.ok) throw new Error("No BOM tree found.");
            return res.json();
        })
        .then(data => {
            let treeOutput = `BOM Tree Structure for Item ID ${data.partId}\n`;
            treeOutput += `Base Required Quantity: ${data.quantity}\n\n`;

            if (data.children && data.children.length > 0) {
                treeOutput += `Sub-Components:\n`;
                data.children.forEach(child => {
                    treeOutput += ` └── Component ID: ${child.partId} | Required Qty: ${child.quantity}\n`;
                });
            } else {
                treeOutput += `(This item is a base raw material with no child dependencies)`;
            }

            alert(treeOutput);
        })
        .catch(() => {
            alert(`Item ID ${partId} is a base raw material or has no sub-assembly links.`);
        });
}

/**
 * 5. RESET SYSTEM
 */
function resetDatabase() {
    if (confirm('Reset system data back to default initial state?')) {
        fetch(`${BASE_URL}/parts/reset`, { method: 'POST' })
            .then(() => {
                loadParts();
                loadActiveBomLinks();
                document.getElementById('mrpResultsBody').innerHTML = `
                    <tr><td colspan="7" style="text-align: center; color: var(--text-muted); font-style: italic;">No calculation run yet.</td></tr>`;
            })
            .catch(err => console.error('Error resetting database:', err));
    }
}
