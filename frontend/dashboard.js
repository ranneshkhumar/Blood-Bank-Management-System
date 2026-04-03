// ============================================
// BLOOD BANK MS — Staff Dashboard Script
// Connects to backend APIs for real data
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Auth check
    if (!checkAuth(['staff', 'admin', 'superadmin'])) return;

    const user = getUser();

    // ============================================
    // DOM REFERENCES
    // ============================================
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const modalOverlay = document.getElementById('modalOverlay');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalClose = document.getElementById('modalClose');
    const modalCancel = document.getElementById('modalCancel');
    const modalSubmit = document.getElementById('modalSubmit');
    const currentDateEl = document.getElementById('currentDate');

    // Set user info in navbar
    const userName = document.querySelector('.user-name');
    const userRole = document.querySelector('.user-role');
    const avatarInitials = document.querySelector('.avatar-initials');
    if (userName) userName.textContent = user.name;
    if (userRole) userRole.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    if (avatarInitials) {
        const names = user.name.split(' ');
        avatarInitials.textContent = names.map(n => n[0]).join('').substring(0, 2).toUpperCase();
    }

    // ============================================
    // SET DATE
    // ============================================
    const now = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = now.toLocaleDateString('en-US', dateOptions);

    const donationDateLabel = document.getElementById('donationDateLabel');
    if (donationDateLabel) {
        donationDateLabel.textContent = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }

    // ============================================
    // LOAD DATA FROM API
    // ============================================
    let inventoryData = [];
    let alertsData = {};
    let donorsData = [];

    async function loadAllData() {
        try {
            const [invRes, alertRes, donorRes] = await Promise.all([
                apiCall('/inventory'),
                apiCall('/alerts'),
                apiCall('/donors')
            ]);

            inventoryData = invRes;
            alertsData = alertRes;
            donorsData = donorRes;

            renderInventoryGrid(invRes.summary);
            renderExpiringTable(alertRes.expiring);
            renderLowStockTable(alertRes.lowStock);
            renderDonationsTable(donorRes.donors);
            updateStats(invRes, alertRes);
            updateNotificationBadge(alertRes.unreadCount);
            animateCounters();
        } catch (err) {
            console.error('Failed to load data:', err);
            showToast('Failed to load dashboard data', 'error');
        }
    }

    // ============================================
    // RENDER: Blood Inventory Grid
    // ============================================
    function renderInventoryGrid(summary) {
        const grid = document.getElementById('inventoryGrid');
        grid.innerHTML = '';

        const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        const capacity = 50; // default display capacity

        allGroups.forEach((group, index) => {
            const item = summary.find(s => s.blood_group === group);
            const units = item ? item.total_units : 0;
            const percent = Math.min(Math.round((units / capacity) * 100), 100);

            let status = 'good';
            if (units <= 2) status = 'critical';
            else if (units <= 5) status = 'warning';

            let statusLabel = 'Adequate';
            if (status === 'warning') statusLabel = 'Low';
            if (status === 'critical') statusLabel = 'Critical';

            const card = document.createElement('div');
            card.className = `blood-card status-${status}`;
            card.style.animationDelay = `${index * 0.08}s`;
            card.innerHTML = `
                <div class="blood-type">${group}</div>
                <div class="blood-units">${units} units</div>
                <div class="blood-progress">
                    <div class="blood-progress-bar" data-width="${percent}"></div>
                </div>
                <span class="blood-status-label">${statusLabel}</span>
            `;
            grid.appendChild(card);
        });

        // Animate progress bars
        requestAnimationFrame(() => {
            setTimeout(() => {
                document.querySelectorAll('.blood-progress-bar').forEach(bar => {
                    bar.style.width = bar.getAttribute('data-width') + '%';
                });
            }, 200);
        });
    }

    // ============================================
    // RENDER: Expiring Blood Table
    // ============================================
    function renderExpiringTable(expiring) {
        const tbody = document.getElementById('expiringTableBody');
        const countEl = document.getElementById('expiringCount');
        tbody.innerHTML = '';
        countEl.textContent = `${expiring.length} units`;

        if (expiring.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--slate-400);padding:2rem">No expiring units</td></tr>';
            return;
        }

        expiring.forEach(item => {
            let daysClass = 'days-ok';
            if (item.days_left <= 2) daysClass = 'days-urgent';
            else if (item.days_left <= 4) daysClass = 'days-warning';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><code style="font-size:0.8rem;background:var(--slate-100);padding:0.15rem 0.4rem;border-radius:4px;color:var(--slate-600)">BU-${String(item.blood_unit_id).padStart(3,'0')}</code></td>
                <td><strong>${item.blood_group}</strong></td>
                <td>${formatDate(item.expiry_date)}</td>
                <td class="${daysClass}">${item.days_left} day${item.days_left !== 1 ? 's' : ''}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // ============================================
    // RENDER: Low Stock Table
    // ============================================
    function renderLowStockTable(lowStock) {
        const tbody = document.getElementById('lowStockTableBody');
        const countEl = document.getElementById('lowStockCount');
        tbody.innerHTML = '';
        countEl.textContent = `${lowStock.length} groups`;

        if (lowStock.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--slate-400);padding:2rem">All stock levels adequate</td></tr>';
            return;
        }

        lowStock.forEach(item => {
            const needed = item.threshold - item.current_stock;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong style="color:var(--red-600)">${item.blood_group}</strong></td>
                <td>${item.current_stock} units</td>
                <td>${item.threshold} units</td>
                <td><span style="color:var(--red-600);font-weight:700">+${needed > 0 ? needed : 0} needed</span></td>
            `;
            tbody.appendChild(row);
        });
    }

    // ============================================
    // RENDER: Recent Donors / Donations Table
    // ============================================
    function renderDonationsTable(donors) {
        const tbody = document.getElementById('donationsTableBody');
        tbody.innerHTML = '';

        if (!donors || donors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--slate-400);padding:2rem">No donors registered</td></tr>';
            return;
        }

        donors.slice(0, 15).forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td><strong>${item.blood_group}</strong></td>
                <td>${item.phone || '—'}</td>
                <td>${formatDate(item.last_donation_date)}</td>
                <td>
                    <span class="status-badge ${item.eligible ? 'badge-stored' : 'badge-processing'}">
                        <span class="badge-dot"></span>
                        ${item.eligible ? 'Eligible' : 'Not Eligible'}
                    </span>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // ============================================
    // UPDATE STAT CARDS
    // ============================================
    function updateStats(invRes, alertRes) {
        const totalUnits = invRes.summary.reduce((sum, s) => sum + s.total_units, 0);
        document.querySelector('#statTotalUnits .stat-value').setAttribute('data-target', totalUnits);
        document.querySelector('#statTodayDonations .stat-value').setAttribute('data-target', invRes.units.length);
        document.querySelector('#statExpiring .stat-value').setAttribute('data-target', alertRes.expiring.length);
        document.querySelector('#statLowStock .stat-value').setAttribute('data-target', alertRes.lowStock.length);
    }

    // ============================================
    // ANIMATED STAT COUNTERS
    // ============================================
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-value');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'), 10);
            const duration = 1200;
            const start = performance.now();

            function update(currentTime) {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - (1 - progress) * (1 - progress);
                counter.textContent = Math.round(eased * target).toLocaleString();
                if (progress < 1) requestAnimationFrame(update);
            }
            requestAnimationFrame(update);
        });
    }

    // ============================================
    // NOTIFICATION BADGE
    // ============================================
    function updateNotificationBadge(count) {
        const badge = document.getElementById('notifBadge');
        badge.textContent = count;
        badge.style.display = count === 0 ? 'none' : 'flex';
    }

    // ============================================
    // SIDEBAR TOGGLE
    // ============================================
    sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.add('mobile-open');
        sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    sidebarOverlay.addEventListener('click', closeMobileSidebar);

    function closeMobileSidebar() {
        sidebar.classList.remove('mobile-open');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ============================================
    // MODAL SYSTEM
    // ============================================
    let currentModalAction = null;

    function openModal(title, bodyHTML, onSubmit) {
        modalTitle.textContent = title;
        modalBody.innerHTML = bodyHTML;
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        currentModalAction = onSubmit || null;

        // Reset submit button
        modalSubmit.textContent = 'Submit';
        modalSubmit.style.background = '';
        modalSubmit.style.boxShadow = '';

        const firstInput = modalBody.querySelector('input, select, button');
        if (firstInput) setTimeout(() => firstInput.focus(), 100);
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
        currentModalAction = null;
    }

    modalClose.addEventListener('click', closeModal);
    modalCancel.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modalOverlay.classList.contains('active')) closeModal(); });

    modalSubmit.addEventListener('click', async () => {
        if (currentModalAction) {
            modalSubmit.textContent = 'Saving...';
            try {
                await currentModalAction();
                modalSubmit.textContent = '✓ Saved!';
                modalSubmit.style.background = 'linear-gradient(135deg, #22C55E, #16A34A)';
                modalSubmit.style.boxShadow = '0 2px 8px rgba(34,197,94,0.3)';
                setTimeout(() => { closeModal(); loadAllData(); }, 800);
            } catch (err) {
                modalSubmit.textContent = 'Error!';
                modalSubmit.style.background = 'linear-gradient(135deg, #EF4444, #DC2626)';
                showToast(err.message || 'Operation failed', 'error');
                setTimeout(() => {
                    modalSubmit.textContent = 'Submit';
                    modalSubmit.style.background = '';
                    modalSubmit.style.boxShadow = '';
                }, 1500);
            }
        }
    });

    // ============================================
    // QUICK ACTION BUTTONS
    // ============================================
    document.getElementById('btnAddUnit').addEventListener('click', () => {
        const today = new Date().toISOString().split('T')[0];
        openModal('Add Blood Unit', `
            <div class="modal-field">
                <label for="addBloodGroup">Blood Group</label>
                <select id="addBloodGroup">
                    <option value="">Select blood group</option>
                    <option value="A+">A+</option><option value="A-">A−</option>
                    <option value="B+">B+</option><option value="B-">B−</option>
                    <option value="AB+">AB+</option><option value="AB-">AB−</option>
                    <option value="O+">O+</option><option value="O-">O−</option>
                </select>
            </div>
            <div class="modal-field">
                <label for="addUnits">Number of Units</label>
                <input type="number" id="addUnits" min="1" max="10" value="1" placeholder="1">
            </div>
            <div class="modal-field">
                <label for="addCollectionDate">Collection Date</label>
                <input type="date" id="addCollectionDate" value="${today}">
            </div>
            <div class="modal-field">
                <label for="addExpiryDate">Expiry Date</label>
                <input type="date" id="addExpiryDate">
            </div>
        `, async () => {
            const blood_group = document.getElementById('addBloodGroup').value;
            const quantity = parseInt(document.getElementById('addUnits').value) || 1;
            const collection_date = document.getElementById('addCollectionDate').value;
            const expiry_date = document.getElementById('addExpiryDate').value;

            if (!blood_group || !collection_date || !expiry_date) {
                throw new Error('Please fill all required fields');
            }

            await apiCall('/inventory', {
                method: 'POST',
                body: JSON.stringify({ blood_group, quantity, collection_date, expiry_date })
            });
            showToast('Blood unit added successfully!');
        });
    });

    document.getElementById('btnRegisterDonor').addEventListener('click', () => {
        openModal('Register New Donor', `
            <div class="modal-field">
                <label for="donorName">Full Name</label>
                <input type="text" id="donorName" placeholder="Enter donor's full name">
            </div>
            <div class="modal-field">
                <label for="donorPhone">Phone Number</label>
                <input type="tel" id="donorPhone" placeholder="+91 XXXXX XXXXX">
            </div>
            <div class="modal-field">
                <label for="donorEmail">Email Address</label>
                <input type="email" id="donorEmail" placeholder="donor@example.com">
            </div>
            <div class="modal-field">
                <label for="donorBlood">Blood Group</label>
                <select id="donorBlood">
                    <option value="">Select blood group</option>
                    <option value="A+">A+</option><option value="A-">A−</option>
                    <option value="B+">B+</option><option value="B-">B−</option>
                    <option value="AB+">AB+</option><option value="AB-">AB−</option>
                    <option value="O+">O+</option><option value="O-">O−</option>
                </select>
            </div>
            <div class="modal-field">
                <label for="donorAge">Age</label>
                <input type="number" id="donorAge" min="18" max="65" placeholder="18 – 65">
            </div>
            <div class="modal-field">
                <label for="donorGender">Gender</label>
                <select id="donorGender">
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
            </div>
        `, async () => {
            const name = document.getElementById('donorName').value;
            const phone = document.getElementById('donorPhone').value;
            const blood_group = document.getElementById('donorBlood').value;

            if (!name || !phone || !blood_group) {
                throw new Error('Name, phone, and blood group are required');
            }

            await apiCall('/donors', {
                method: 'POST',
                body: JSON.stringify({
                    name, phone, blood_group,
                    email: document.getElementById('donorEmail').value || null,
                    age: parseInt(document.getElementById('donorAge').value) || null,
                    gender: document.getElementById('donorGender').value || null
                })
            });
            showToast('Donor registered successfully!');
        });
    });

    document.getElementById('btnUpdateInventory').addEventListener('click', () => {
        openModal('Update Inventory', `
            <div class="modal-field">
                <label for="updateBloodGroup">Blood Group</label>
                <select id="updateBloodGroup">
                    <option value="">Select blood group</option>
                    <option value="A+">A+</option><option value="A-">A−</option>
                    <option value="B+">B+</option><option value="B-">B−</option>
                    <option value="AB+">AB+</option><option value="AB-">AB−</option>
                    <option value="O+">O+</option><option value="O-">O−</option>
                </select>
            </div>
            <div class="modal-field">
                <label for="updateAction">Action</label>
                <select id="updateAction">
                    <option value="">Select action</option>
                    <option value="used">Mark as Used (Transfusion)</option>
                    <option value="expired">Mark as Expired</option>
                    <option value="discarded">Mark as Discarded</option>
                </select>
            </div>
            <div class="modal-field">
                <label for="updateNotes">Notes</label>
                <input type="text" id="updateNotes" placeholder="Optional notes or reason">
            </div>
        `, async () => {
            const blood_group = document.getElementById('updateBloodGroup').value;
            const status = document.getElementById('updateAction').value;

            if (!blood_group || !status) throw new Error('Please select blood group and action');

            // Find first available unit of this group
            const unit = inventoryData.units.find(u => u.blood_group === blood_group && u.status === 'available');
            if (!unit) throw new Error(`No available ${blood_group} units`);

            await apiCall(`/inventory/${unit.blood_unit_id}`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            });
            showToast(`${blood_group} unit marked as ${status}`);
        });
    });

    document.getElementById('btnViewStock').addEventListener('click', () => {
        let stockHTML = '<div style="max-height:400px;overflow-y:auto;">';
        stockHTML += '<table class="data-table"><thead><tr><th>Blood Group</th><th>In Stock</th><th>Status</th></tr></thead><tbody>';

        const allGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
        allGroups.forEach(group => {
            const item = inventoryData.summary.find(s => s.blood_group === group);
            const units = item ? item.total_units : 0;
            let badgeClass = 'badge-stored';
            let label = 'Adequate';
            if (units <= 2) { badgeClass = 'badge-collected'; label = 'Critical'; }
            else if (units <= 5) { badgeClass = 'badge-processing'; label = 'Low'; }

            stockHTML += `<tr>
                <td><strong>${group}</strong></td>
                <td>${units} units</td>
                <td><span class="status-badge ${badgeClass}"><span class="badge-dot"></span>${label}</span></td>
            </tr>`;
        });
        stockHTML += '</tbody></table></div>';
        openModal('Full Stock Overview', stockHTML);
    });

    // ============================================
    // SEARCH FILTERING
    // ============================================
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().trim();
            document.querySelectorAll('.blood-card').forEach(card => {
                const type = card.querySelector('.blood-type').textContent.toLowerCase();
                card.style.display = type.includes(query) || query === '' ? '' : 'none';
            });
            document.querySelectorAll('#donationsTableBody tr').forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(query) || query === '' ? '' : 'none';
            });
        });
    }

    // ============================================
    // NAV LINK ACTIVE STATE
    // ============================================
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.id === 'navLogout') {
                e.preventDefault();
                logout();
                return;
            }
            e.preventDefault();
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            this.parentElement.classList.add('active');
            if (window.innerWidth <= 960) closeMobileSidebar();
        });
    });

    // ============================================
    // INITIALIZE
    // ============================================
    loadAllData();
});
