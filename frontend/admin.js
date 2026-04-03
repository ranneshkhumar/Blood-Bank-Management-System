// ============================================
// BLOOD BANK MS — Admin Dashboard Script
// Managing transfers, emergency requests, & alerts
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Auth check
    if (!checkAuth(['admin', 'superadmin'])) return;

    const user = getUser();
    const now = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', dateOptions);

    // Navbar user info
    document.querySelector('.user-name').textContent = user.name;
    document.querySelector('.user-role').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    
    const initials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    document.querySelector('.avatar-initials').textContent = initials;

    // Cache data
    let appData = { inventory: [], alerts: {}, donors: [], emergency: [], transfers: [], banks: [] };

    // ============================================
    // NAVIGATION
    // ============================================
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const sections = ['overview', 'inventory', 'emergency', 'transfers', 'donors'];

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            
            // UI Update
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            link.parentElement.classList.add('active');

            sections.forEach(s => {
                document.getElementById('section' + s.charAt(0).toUpperCase() + s.slice(1)).style.display = (s === sectionId) ? 'block' : 'none';
            });

            // Re-render appropriate section if needed
            if (sectionId === 'overview') renderOverview();
            if (sectionId === 'inventory') renderInventory();
            if (sectionId === 'emergency') renderEmergency();
            if (sectionId === 'transfers') renderTransfers();
            if (sectionId === 'donors') renderDonors();
        });
    });

    document.getElementById('navLogout').addEventListener('click', (e) => { e.preventDefault(); logout(); });

    // ============================================
    // DATA LOADING
    // ============================================
    async function loadAllData() {
        try {
            const [inv, alerts, donors, emergency, transfers, banks] = await Promise.all([
                apiCall('/inventory'),
                apiCall('/alerts'),
                apiCall('/donors'),
                apiCall('/emergency'),
                apiCall('/transfers'),
                apiCall('/banks')
            ]);

            appData = { inventory: inv, alerts, donors: donors.donors, emergency: emergency.requests, transfers: transfers.transfers, banks: banks.banks };

            renderOverview();
            updateNotificationBadge(alerts.unreadCount);
        } catch (err) {
            showToast('Error loading admin data', 'error');
        }
    }

    // ============================================
    // RENDERING FUNCTIONS
    // ============================================
    function renderOverview() {
        const { inventory, alerts, emergency, transfers } = appData;
        
        // Stats
        const totalUnits = inventory.summary.reduce((a, b) => a + b.total_units, 0);
        document.querySelector('#statTotalUnits .stat-value').setAttribute('data-target', totalUnits);
        document.querySelector('#statExpiring .stat-value').setAttribute('data-target', alerts.expiring.length);
        document.querySelector('#statEmergency .stat-value').setAttribute('data-target', emergency.filter(e => e.status === 'pending').length);
        document.querySelector('#statTransfers .stat-value').setAttribute('data-target', transfers.filter(t => t.status === 'in_transit').length);
        
        animateCounters();

        // Expiring Table
        const expireBody = document.getElementById('expiringTableBody');
        expireBody.innerHTML = alerts.expiring.length ? alerts.expiring.slice(0, 5).map(u => `
            <tr>
                <td><code>BU-${u.blood_unit_id}</code></td>
                <td><strong>${u.blood_group}</strong></td>
                <td>${formatDate(u.expiry_date)}</td>
                <td class="${u.days_left <= 2 ? 'days-urgent' : 'days-warning'}">${u.days_left}d</td>
            </tr>
        `).join('') : '<tr><td colspan="4" class="empty-state">No urgent expiries</td></tr>';

        // Low Stock Table
        const lowBody = document.getElementById('lowStockTableBody');
        lowBody.innerHTML = alerts.lowStock.length ? alerts.lowStock.slice(0, 5).map(l => `
            <tr>
                <td><strong>${l.blood_group}</strong></td>
                <td>${l.current_stock}</td>
                <td>${l.threshold}</td>
                <td style="color:var(--red-600);font-weight:700">+${l.threshold - l.current_stock}</td>
            </tr>
        `).join('') : '<tr><td colspan="4" class="empty-state">Levels are healthy</td></tr>';

        // Notifications
        const notifBody = document.getElementById('notificationsTableBody');
        notifBody.innerHTML = alerts.notifications.slice(0, 8).map(n => `
            <tr>
                <td>${n.message}</td>
                <td><span class="notif-type type-${n.type}">${n.type}</span></td>
                <td>${formatDateTime(n.created_at)}</td>
                <td>${n.is_read ? 'Read' : '<strong>New</strong>'}</td>
            </tr>
        `).join('');
    }

    function renderInventory() {
        const grid = document.getElementById('adminInventoryGrid');
        grid.innerHTML = '';
        const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        
        allGroups.forEach(g => {
            const item = appData.inventory.summary.find(s => s.blood_group === g) || { total_units: 0 };
            const status = item.total_units <= 2 ? 'critical' : item.total_units <= 5 ? 'warning' : 'good';
            grid.innerHTML += `
                <div class="blood-card status-${status}">
                    <div class="blood-type">${g}</div>
                    <div class="blood-units">${item.total_units} units</div>
                    <div class="blood-progress"><div class="blood-progress-bar" style="width: ${Math.min(item.total_units * 10, 100)}%"></div></div>
                </div>
            `;
        });

        const unitsBody = document.getElementById('allUnitsTableBody');
        unitsBody.innerHTML = appData.inventory.units.slice(0, 50).map(u => `
            <tr>
                <td><code>BU-${u.blood_unit_id}</code></td>
                <td><strong>${u.blood_group}</strong></td>
                <td>${u.quantity}</td>
                <td>${formatDate(u.collection_date)}</td>
                <td>${formatDate(u.expiry_date)}</td>
                <td><span class="status-pill pill-${u.status}">${u.status}</span></td>
                <td>${u.bank_name || 'Main Bank'}</td>
            </tr>
        `).join('');
    }

    function renderEmergency() {
        const body = document.getElementById('emergencyTableBody');
        body.innerHTML = appData.emergency.map(e => `
            <tr>
                <td><code>REQ-${e.request_id}</code></td>
                <td>${e.hospital_name}</td>
                <td><strong>${e.blood_group}</strong></td>
                <td>${e.units_required}</td>
                <td><span class="status-pill pill-${e.status}">${e.status}</span></td>
                <td>${formatDate(e.created_at)}</td>
                <td>
                    ${e.status === 'pending' ? `
                        <button class="action-btn-sm btn-approve" onclick="updateEmergencyStatus(${e.request_id}, 'approved')">Approve</button>
                        <button class="action-btn-sm btn-reject" onclick="updateEmergencyStatus(${e.request_id}, 'rejected')">Reject</button>
                    ` : e.status === 'approved' ? `
                        <button class="action-btn-sm btn-complete" onclick="updateEmergencyStatus(${e.request_id}, 'fulfilled')">Mark Fulfilled</button>
                    ` : '—'}
                </td>
            </tr>
        `).join('');
    }

    function renderTransfers() {
        const body = document.getElementById('transfersTableBody');
        body.innerHTML = appData.transfers.map(t => `
            <tr>
                <td><code>TRF-${t.transfer_id}</code></td>
                <td>${t.from_bank_name}</td>
                <td>${t.to_bank_name}</td>
                <td><strong>${t.blood_group}</strong></td>
                <td>${t.units}</td>
                <td><span class="status-pill pill-${t.status}">${t.status}</span></td>
                <td>
                    ${t.status === 'pending' ? `
                        <button class="action-btn-sm btn-transit" onclick="updateTransferStatus(${t.transfer_id}, 'in_transit')">Dispatch</button>
                    ` : t.status === 'in_transit' ? `
                        <button class="action-btn-sm btn-complete" onclick="updateTransferStatus(${t.transfer_id}, 'completed')">Arrived</button>
                    ` : '—'}
                </td>
            </tr>
        `).join('');
    }

    function renderDonors() {
        const body = document.getElementById('donorsTableBody');
        body.innerHTML = appData.donors.map(d => `
            <tr>
                <td><code>DON-${d.donor_id}</code></td>
                <td>${d.name}</td>
                <td><strong>${d.blood_group}</strong></td>
                <td>${d.phone}</td>
                <td>${d.email || '—'}</td>
                <td>${formatDate(d.last_donation_date)}</td>
                <td><span class="status-badge ${d.eligible ? 'badge-stored' : 'badge-processing'}">${d.eligible ? 'Eligible' : 'Recent'}</span></td>
            </tr>
        `).join('');
    }

    // ============================================
    // ACTIONS
    // ============================================
    window.updateEmergencyStatus = async (id, status) => {
        try {
            await apiCall(`/emergency/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
            showToast(`Emergency request ${status}`);
            loadAllData();
        } catch (err) { showToast(err.message, 'error'); }
    }

    window.updateTransferStatus = async (id, status) => {
        try {
            await apiCall(`/transfers/${id}`, { method: 'PUT', body: JSON.stringify({ status }) });
            showToast(`Transfer status updated to ${status}`);
            loadAllData();
        } catch (err) { showToast(err.message, 'error'); }
    }

    document.getElementById('btnMarkRead').addEventListener('click', async () => {
        try {
            await apiCall('/alerts/read', { method: 'PUT' });
            showToast('All notifications marked as read');
            loadAllData();
        } catch (err) { showToast(err.message, 'error'); }
    });

    document.getElementById('btnNewTransfer').addEventListener('click', () => {
        const banksOptions = appData.banks.map(b => `<option value="${b.bank_id}">${b.name}</option>`).join('');
        openModal('Initiate Blood Transfer', `
            <div class="modal-field"><label>From Bank</label><select id="fromBank">${banksOptions}</select></div>
            <div class="modal-field"><label>To Bank</label><select id="toBank">${banksOptions}</select></div>
            <div class="modal-field"><label>Blood Group</label>
                <select id="trfGroup"><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option>
                <option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option></select>
            </div>
            <div class="modal-field"><label>Units</label><input type="number" id="trfUnits" min="1" value="1"></div>
        `, async () => {
            const data = {
                from_bank: parseInt(document.getElementById('fromBank').value),
                to_bank: parseInt(document.getElementById('toBank').value),
                blood_group: document.getElementById('trfGroup').value,
                units: parseInt(document.getElementById('trfUnits').value)
            };
            await apiCall('/transfers', { method: 'POST', body: JSON.stringify(data) });
            showToast('Transfer initiated');
        });
    });

    document.getElementById('btnNewEmergency').addEventListener('click', () => {
        openModal('New Emergency Request', `
            <div class="modal-field"><label>Hospital Name</label><input type="text" id="hospName"></div>
            <div class="modal-field"><label>Blood Group</label>
                <select id="reqGroup"><option value="A+">A+</option><option value="O-">O-</option></select>
            </div>
            <div class="modal-field"><label>Units Required</label><input type="number" id="reqUnits" min="1" value="1"></div>
            <div class="modal-field"><label>Contact Phone</label><input type="tel" id="reqPhone"></div>
        `, async () => {
            const data = {
                hospital_name: document.getElementById('hospName').value,
                blood_group: document.getElementById('reqGroup').value,
                units_required: parseInt(document.getElementById('reqUnits').value),
                contact_phone: document.getElementById('reqPhone').value
            };
            await apiCall('/emergency', { method: 'POST', body: JSON.stringify(data) });
            showToast('Emergency request submitted');
        });
    });

    // Sidebar Toggles
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
    mobileMenuBtn.addEventListener('click', () => { sidebar.classList.add('mobile-open'); sidebarOverlay.classList.add('active'); });
    sidebarOverlay.addEventListener('click', () => { sidebar.classList.remove('mobile-open'); sidebarOverlay.classList.remove('active'); });

    // Modal
    const modalOverlay = document.getElementById('modalOverlay');
    const modalSubmit = document.getElementById('modalSubmit');
    const modalCancel = document.getElementById('modalCancel');
    const modalClose = document.getElementById('modalClose');
    let onModalSubmit = null;

    window.openModal = (title, body, submitFn) => {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = body;
        modalOverlay.classList.add('active');
        onModalSubmit = submitFn;
    };

    const closeModal = () => modalOverlay.classList.remove('active');
    modalCancel.onclick = closeModal;
    modalClose.onclick = closeModal;
    modalSubmit.onclick = async () => { if (onModalSubmit) { await onModalSubmit(); closeModal(); loadAllData(); } };

    // Counters
    function animateCounters() {
        document.querySelectorAll('.stat-value').forEach(c => {
            const target = +c.getAttribute('data-target');
            let count = 0;
            const inc = target / 30;
            const upd = () => { if(count < target) { count += inc; c.textContent = Math.ceil(count); setTimeout(upd, 20); } else c.textContent = target; };
            upd();
        });
    }

    function updateNotificationBadge(count) {
        const b = document.getElementById('notifBadge');
        b.textContent = count;
        b.style.display = count > 0 ? 'flex' : 'none';
    }

    loadAllData();
});
