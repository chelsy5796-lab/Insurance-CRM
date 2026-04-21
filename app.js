window.CRM_VERSION = "4.0.2";
// Initial Data Configuration
const INITIAL_CLIENTS = [
    { id: 'c1', name: 'Alice Tan', email: 'alice@example.com', phone: '+6012-3456789', policy: 'Medical Gold', status: 'Active', category: 'Existing', dob: '1990-05-15', gender: 'Female', job: 'Engineer', isSmoker: 'No', income: '8,000' },
    { id: 'c2', name: 'Bob Lim', email: 'bob@example.com', phone: '+6011-2345678', policy: 'Life Secure', status: 'Active', category: 'Referral', dob: '1985-11-20', gender: 'Male', job: 'Manager', isSmoker: 'Yes', income: '12,000' },
    { id: 'c4', name: 'David Lee', email: 'david@example.com', phone: '+6013-4455667', policy: 'Medical Platinum', status: 'Active', category: 'Cold Market', sourceTag: 'WhatsApp', dob: '1995-02-10', gender: 'Male', job: 'Sales', isSmoker: 'No', income: '5,500' },
    { id: 'c5', name: 'Eva Green', email: 'eva@example.com', phone: '+6017-1122334', policy: 'Critical Illness', status: 'Inactive', category: 'Cold Market', sourceTag: 'Social Media', dob: '1988-08-30', gender: 'Female', job: 'Designer', isSmoker: 'No', income: '7,200' }
];

const INITIAL_CLAIMS = [
    { 
        id: 'cl1', 
        clientId: 'c1', 
        submitDate: '2026-04-10', 
        status: 'Processing', 
        missingDocs: ['IC Copy', 'Medical Report'], 
        amount: 5000 
    },
    { 
        id: 'cl2', 
        clientId: 'c2', 
        submitDate: '2026-04-15', 
        status: 'Paid', 
        missingDocs: [], 
        amount: 12500 
    },
    { 
        id: 'cl3', 
        clientId: 'c4', 
        submitDate: '2026-04-16', 
        status: 'Pending', 
        missingDocs: ['Doctor Certification'], 
        amount: 3000 
    }
];

const INITIAL_ACTIVITIES = [
    { id: 'a1', clientId: 'c1', date: new Date().toISOString().split('T')[0], type: 'Call', title: 'Follow-up on Medical Claim', weight: 1 },
    { id: 'a2', clientId: 'c2', date: new Date().toISOString().split('T')[0], type: 'Meeting', title: 'Policy Renewal Discussion', weight: 5 },
    { id: 'a3', clientId: 'c4', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], type: 'Call', title: 'Initial Consultation', weight: 1 }
];

const INITIAL_FOLLOWUPS = [
    { id: 'f1', clientId: 'c1', timestamp: new Date(Date.now() - 172800000).toLocaleString(), remark: 'Sent medical claim forms. Client requested a follow-up in 3 days.', nextDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], status: 'Pending' },
    { id: 'f2', clientId: 'c2', timestamp: new Date(Date.now() - 345600000).toLocaleString(), remark: 'Discussed policy renewal. Bob is happy but needs to talk to his wife.', nextDate: new Date(Date.now() + 259200000).toISOString().split('T')[0], status: 'Pending' }
];

const INITIAL_GOALS = [
    { id: 'g1', type: 'Monthly', title: 'Monthly Sales Target', target: 50000, current: 15000, reward: 'Team Dinner at Haidilao', isCompleted: false },
    { id: 'g2', type: 'Yearly', title: 'Million Dollar Round Table (MDRT)', target: 1000000, current: 250000, reward: 'Luxury Watch / Europe Trip', isCompleted: false }
];

class CRMApp {
    constructor() {
        this.clients = JSON.parse(localStorage.getItem('crm_clients')) || INITIAL_CLIENTS;
        this.claims = JSON.parse(localStorage.getItem('crm_claims')) || INITIAL_CLAIMS;
        this.activities = JSON.parse(localStorage.getItem('crm_activities')) || INITIAL_ACTIVITIES;
        this.followups = JSON.parse(localStorage.getItem('crm_followups')) || INITIAL_FOLLOWUPS;
        this.goals = JSON.parse(localStorage.getItem('crm_goals')) || INITIAL_GOALS;
        this.currentView = 'dashboard';
        this.currentCategory = 'All';
        this.currentGoalType = 'Monthly';
        this.searchTerm = '';
        this.currentDate = new Date();
        
        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.render();
    }

    cacheDOM() {
        this.navItems = document.querySelectorAll('.nav-item');
        this.viewContent = document.getElementById('view-content');
        this.breadcrumbParent = document.getElementById('breadcrumb-parent');
        this.breadcrumbCurrent = document.getElementById('breadcrumb-current');
        this.btnGlobalAdd = document.getElementById('btn-add-global');
        this.searchInput = document.querySelector('.search-bar input');
        this.sidebar = document.querySelector('.sidebar');
        this.menuToggle = document.getElementById('menu-toggle');
        this.sidebarOverlay = document.getElementById('sidebar-overlay');
        
        // Modal elements
        this.modalOverlay = document.getElementById('modal-container');
        this.modalTitle = document.getElementById('modal-title');
        this.modalContent = document.getElementById('modal-content');
        this.btnCloseModal = document.getElementById('btn-close-modal');
        this.btnCancelModal = document.getElementById('btn-cancel');
        this.btnSaveModal = document.getElementById('btn-save');
    }

    bindEvents() {
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.getAttribute('data-view');
                this.switchView(view);
                // Auto-close sidebar on mobile after navigation
                this.closeMobileMenu();
            });
        });

        // Mobile hamburger menu
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', () => this.toggleMobileMenu());
        }
        if (this.sidebarOverlay) {
            this.sidebarOverlay.addEventListener('click', () => this.closeMobileMenu());
        }

        this.btnGlobalAdd.addEventListener('click', () => this.openAddModal());
        this.searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.render();
        });
        this.btnCloseModal.addEventListener('click', () => this.closeModal());
        this.btnCancelModal.addEventListener('click', () => this.closeModal());
        this.btnSaveModal.addEventListener('click', () => this.handleSave());
    }

    toggleMobileMenu() {
        this.sidebar.classList.toggle('open');
        this.sidebarOverlay.classList.toggle('active');
    }

    closeMobileMenu() {
        this.sidebar.classList.remove('open');
        this.sidebarOverlay.classList.remove('active');
    }

    saveState() {
        localStorage.setItem('crm_clients', JSON.stringify(this.clients));
        localStorage.setItem('crm_claims', JSON.stringify(this.claims));
        localStorage.setItem('crm_activities', JSON.stringify(this.activities));
        localStorage.setItem('crm_followups', JSON.stringify(this.followups));
        localStorage.setItem('crm_goals', JSON.stringify(this.goals));
    }

    switchView(view) {
        this.currentView = view;
        this.navItems.forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-view') === view);
        });
        
        // Update breadcrumbs
        this.breadcrumbCurrent.textContent = view.charAt(0).toUpperCase() + view.slice(1);
        
        this.render();
    }

    render() {
        this.viewContent.innerHTML = '';
        
        switch(this.currentView) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'clients':
                this.renderClients();
                break;
            case 'claims':
                this.renderClaims();
                break;
            case 'schedule':
                this.renderSchedule();
                break;
            case 'follow-up':
                this.renderFollowUp();
                break;
            case 'goals':
                this.renderGoals();
                break;
            case 'export':
                this.renderExport();
                break;
        }
        
        // Finalize icon rendering
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    // View Renderers
    renderDashboard() {
        const totalClaims = this.claims.length;
        const processingClaims = this.claims.filter(c => c.status === 'Processing').length;
        const totalAmount = this.claims.filter(c => c.status === 'Paid').reduce((sum, c) => sum + c.amount, 0);
        
        const upcomingFollowups = this.followups.filter(f => f.status === 'Pending').slice(0, 3);

        this.viewContent.innerHTML = `
            <div class="dashboard-grid">
                <div class="stat-card">
                    <h4>Total Active Claims</h4>
                    <div class="value">${totalClaims}</div>
                    <div class="trend up"><i data-lucide="trending-up"></i> +2 this week</div>
                </div>
                <div class="stat-card">
                    <h4>Under Processing</h4>
                    <div class="value">${processingClaims}</div>
                    <div class="trend"><i data-lucide="clock"></i> Awaiting documents</div>
                </div>
                <div class="stat-card">
                    <h4>Total Compensation</h4>
                    <div class="value">RM ${totalAmount.toLocaleString()}</div>
                    <div class="trend up"><i data-lucide="trending-up"></i> High efficiency</div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
                <div>
                    <h3 style="margin-bottom: 20px;">Recent Claim Activity</h3>
                    <div class="data-table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Client Name</th>
                                    <th>Process Status</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.claims.slice(0, 5).map(claim => {
                                    const client = this.clients.find(c => c.id === claim.clientId);
                                    return `
                                        <tr>
                                            <td>${client ? client.name : 'Unknown'}</td>
                                            <td><span class="badge badge-${claim.status.toLowerCase()}">${claim.status}</span></td>
                                            <td>RM ${claim.amount.toLocaleString()}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div>
                    <h3 style="margin-bottom: 20px;">Due Follow-ups</h3>
                    <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px;">
                        ${upcomingFollowups.length > 0 ? upcomingFollowups.map(f => {
                            const client = this.clients.find(c => c.id === f.clientId);
                            const isOverdue = new Date(f.nextDate) < new Date();
                            return `
                                <div class="timeline-item" style="padding: 12px 12px 12px 40px; border-radius: 8px; font-size: 0.875rem;">
                                    <div style="font-weight: 600; margin-bottom: 4px;">${client ? client.name : 'Unknown'}</div>
                                    <div style="color: #666; font-size: 0.75rem; margin-bottom: 8px;">${f.remark.slice(0, 30)}...</div>
                                    <div class="reminder-date ${isOverdue ? 'overdue' : ''}" style="display: inline-flex; padding: 2px 8px; border-radius: 4px;">
                                        <i data-lucide="clock" style="width: 12px; height: 12px; margin-right: 4px;"></i> ${f.nextDate}
                                    </div>
                                </div>
                            `;
                        }).join('') : '<p style="color: #666; font-size: 0.875rem;">No pending follow-ups today!</p>'}
                    </div>

                    <h3 style="margin-bottom: 20px;">Goal Snapshot</h3>
                    ${this.goals.filter(g => g.type === 'Yearly').slice(0, 1).map(g => {
                        const progress = Math.min(100, Math.round((g.current / g.target) * 100));
                        return `
                            <div class="goal-card" style="padding: 16px; border-radius: 12px; border: 1px solid var(--border-color);">
                                <div style="font-weight: 700; font-family: 'Outfit'; margin-bottom: 12px; font-size: 0.9rem;">${g.title}</div>
                                <div class="progress-bar-bg" style="height: 8px;">
                                    <div class="progress-bar-fill" style="width: ${progress}%"></div>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 0.75rem; font-weight: 600;">
                                    <span>${progress}%</span>
                                    <span>RM ${g.current.toLocaleString()}</span>
                                </div>
                                <div class="reward-content" style="margin-top: 12px; font-size: 0.75rem; color: var(--accent-blue);">
                                    <i data-lucide="gift" style="width: 14px; height: 14px;"></i> ${g.reward}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    renderClients() {
        const categories = ['All', 'Existing', 'Cold Market', 'Referral'];
        const filteredClients = this.clients.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(this.searchTerm) || 
                                 c.email.toLowerCase().includes(this.searchTerm) ||
                                 c.phone.includes(this.searchTerm) ||
                                 (c.job && c.job.toLowerCase().includes(this.searchTerm));
            const matchesCategory = this.currentCategory === 'All' || c.category === this.currentCategory;
            return matchesSearch && matchesCategory;
        });

        this.viewContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 24px;">
                <div class="view-tabs" style="margin-bottom: 0;">
                    ${categories.map(cat => `
                        <div class="tab-item ${this.currentCategory === cat ? 'active' : ''}" onclick="app.setCategory('${cat}')">
                            ${cat}
                        </div>
                    `).join('')}
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-ghost" onclick="app.openImportModal()"><i data-lucide="upload"></i> Import</button>
                    <button class="btn btn-primary" onclick="app.openAddClientModal()">+ New Client</button>
                </div>
            </div>
            
            <div class="data-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name / Profile</th>
                            <th>Contact</th>
                            <th>Job / Income</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredClients.map(client => `
                            <tr>
                                <td>
                                    <div style="font-weight: 600;">${client.name}</div>
                                    <div style="font-size: 0.75rem; color: #666;">
                                        ${client.gender || 'N/A'} • ${client.dob || 'DOB N/A'} • ${client.isSmoker === 'Yes' ? '🚬 Smoker' : '🚭 Non-Smoker'}
                                    </div>
                                </td>
                                <td>
                                    <div>${client.phone}</div>
                                    <div style="font-size: 0.75rem; color: #666;">${client.email}</div>
                                </td>
                                <td>
                                    <div>${client.job || 'N/A'}</div>
                                    <div style="font-size: 0.75rem; color: #666;">RM ${client.income || '0'}</div>
                                </td>
                                <td>
                                    <span class="badge tag-${client.category.toLowerCase().replace(' ', '-')}">${client.category}</span>
                                    ${client.sourceTag ? `<span class="source-tag tag-${client.sourceTag.toLowerCase().replace(' ', '-')}">${client.sourceTag}</span>` : ''}
                                </td>
                                <td><span class="badge badge-${client.status.toLowerCase()}">${client.status}</span></td>
                                <td><button class="btn btn-ghost" onclick="app.openEditClient('${client.id}')">Edit</button></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    setCategory(cat) {
        this.currentCategory = cat;
        this.render();
    }

    renderClaims() {
        const filteredClaims = this.claims.filter(claim => {
            const client = this.clients.find(c => c.id === claim.clientId);
            const clientName = client ? client.name.toLowerCase() : '';
            return clientName.includes(this.searchTerm) || 
                   claim.status.toLowerCase().includes(this.searchTerm) ||
                   claim.missingDocs.some(doc => doc.toLowerCase().includes(this.searchTerm));
        });

        this.viewContent.innerHTML = `
            <div class="data-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Client Name</th>
                            <th>Date Submitted</th>
                            <th>Missing Documents</th>
                            <th>Process Status</th>
                            <th>Compensation</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredClaims.map(claim => {
                            const client = this.clients.find(c => c.id === claim.clientId);
                            return `
                                <tr>
                                    <td><strong>${client ? client.name : 'Unknown'}</strong></td>
                                    <td>${claim.submitDate}</td>
                                    <td>
                                        <div class="missing-docs-list">
                                            ${claim.missingDocs.length > 0 
                                                ? claim.missingDocs.map(doc => `<span class="doc-tag">${doc}</span>`).join('') 
                                                : '<span style="color: #10b981; font-size: 0.75rem;">None</span>'}
                                        </div>
                                    </td>
                                    <td><span class="badge badge-${claim.status.toLowerCase()}">${claim.status}</span></td>
                                    <td>RM ${claim.amount.toLocaleString()}</td>
                                    <td><button class="btn btn-ghost" onclick="app.openEditClaim('${claim.id}')">Edit</button></td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    renderSchedule() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(this.currentDate);
        
        // Activity Volume for the chart (last 90 days)
        const volumeData = this.getActivityVolume(90);

        this.viewContent.innerHTML = `
            <div class="calendar-view-container">
                <div class="volume-card">
                    <div class="volume-header">
                        <h4 style="margin: 0;">Activity Volume (Last 90 Days)</h4>
                        <span style="font-size: 0.75rem; color: #666;">Level 1-4 reflects activity points</span>
                    </div>
                    <div class="volume-grid">
                        ${volumeData.map(v => `
                            <div class="volume-day volume-level-${v.level}" title="${v.date}: ${v.points} pts"></div>
                        `).join('')}
                    </div>
                </div>

                <div class="calendar-controls">
                    <div class="calendar-month-title">${monthName} ${year}</div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-ghost" onclick="app.changeMonth(-1)"><i data-lucide="chevron-left"></i></button>
                        <button class="btn btn-ghost" onclick="app.changeMonth(1)"><i data-lucide="chevron-right"></i></button>
                        <button class="btn btn-primary" onclick="app.openAddActivity()">+ Activity</button>
                    </div>
                </div>

                <div class="calendar-list" id="calendar-list">
                    ${this.generateCalendarDays(year, month)}
                </div>

                <!-- Scroll Buttons -->
                <div class="calendar-scroll-btns">
                    <button class="scroll-btn" onclick="app.scrollCalendar(-150)" title="Scroll Up">
                        <i data-lucide="chevron-up"></i>
                    </button>
                    <button class="scroll-btn" onclick="app.scrollCalendar(150)" title="Scroll Down">
                        <i data-lucide="chevron-down"></i>
                    </button>
                </div>

                <div class="sync-section">
                    <h4><i data-lucide="refresh-cw"></i> Link External Calendar</h4>
                    <p style="font-size: 0.875rem; color: #666; margin-top: 8px;">
                        Sync with Google Calendar or Outlook to see your personal events here.
                    </p>
                    <button class="btn btn-ghost" style="margin-top: 12px; border: 1px solid var(--border-color);" onclick="alert('Google Calendar Sync feature coming soon! You can also paste your iCal URL in Settings.')">
                        Connect Calendar
                    </button>
                </div>
            </div>
        `;
    }

    getActivityVolume(days) {
        let data = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dailyPoints = this.activities
                .filter(a => a.date === dateStr)
                .reduce((sum, a) => sum + (a.weight || 1), 0);
            
            let level = 0;
            if (dailyPoints > 10) level = 4;
            else if (dailyPoints > 5) level = 3;
            else if (dailyPoints > 2) level = 2;
            else if (dailyPoints > 0) level = 1;

            data.push({ date: dateStr, points: dailyPoints, level });
        }
        return data;
    }

    generateCalendarDays(year, month) {
        let daysHtml = '';
        const todayStr = new Date().toISOString().split('T')[0];
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

        for (let i = 1; i <= daysInMonth; i++) {
            try {
                const dateObj = new Date(year, month, i);
                const dayName = dayNames[dateObj.getDay()];
                const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
                
                const isToday = cellDateStr === todayStr;
                const dailyActs = this.activities.filter(a => a && a.date === cellDateStr);
                
                daysHtml += `
                    <div class="calendar-row ${isToday ? 'today' : ''}" onclick="app.openAddActivity('${cellDateStr}')">
                        <div class="calendar-row-info">
                            <div class="calendar-row-day">${dayName}</div>
                            <div class="calendar-row-date">${String(i).padStart(2, '0')}</div>
                        </div>
                        <div class="calendar-row-content">
                            ${dailyActs.length > 0 ? dailyActs.map(a => {
                                const type = (a.type || 'call').toLowerCase();
                                return `<div class="activity-chip chip-${type}">${a.title || 'Untitled'}</div>`;
                            }).join('') : '<div style="color: #ccc; font-size: 0.8rem;">No activities</div>'}
                        </div>
                    </div>
                `;
            } catch (err) {
                console.error(`[CRM Debug] Error rendering row ${i}:`, err);
            }
        }
        return daysHtml;
    }

    scrollCalendar(amount) {
        const container = document.getElementById('calendar-list');
        if (container) {
            container.scrollBy({ top: amount, behavior: 'smooth' });
        }
    }

    changeMonth(delta) {
        this.currentDate.setMonth(this.currentDate.getMonth() + delta);
        this.render();
    }

    openAddActivity(date) {
        this.modalTitle.textContent = 'Add Activity';
        this.modalContent.innerHTML = `
            <div class="form-group">
                <label>Date</label>
                <input type="date" id="act-date" value="${date || new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
                <label>Type</label>
                <select id="act-type">
                    <option value="Call">Call (1 pt)</option>
                    <option value="Meeting">Meeting (5 pts)</option>
                    <option value="Proposal">Proposal (3 pts)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Title</label>
                <input type="text" id="act-title" placeholder="e.g., Follow up with Tan">
            </div>
            <div class="form-group">
                <label>Client (Optional)</label>
                <select id="act-client">
                    <option value="">None</option>
                    ${this.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
            </div>
        `;
        this.modalOverlay.classList.remove('hidden');
        
        // Update Save handler for activities
        this.btnSaveModal.onclick = () => {
            const newAct = {
                id: 'a' + Date.now(),
                date: document.getElementById('act-date').value,
                type: document.getElementById('act-type').value,
                title: document.getElementById('act-title').value,
                clientId: document.getElementById('act-client').value,
                weight: document.getElementById('act-type').value === 'Meeting' ? 5 : (document.getElementById('act-type').value === 'Proposal' ? 3 : 1)
            };
            this.activities.push(newAct);
            this.saveState();
            this.closeModal();
            this.render();
        };
    }

    renderFollowUp() {
        this.viewContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h2 style="font-family: 'Outfit';">Follow-up History</h2>
                <button class="btn btn-primary" onclick="app.openAddFollowUp()">+ New Entry</button>
            </div>
            
            <div class="data-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Client Name</th>
                            <th>Meeting Time</th>
                            <th>Next Follow-up</th>
                            <th>Remark</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.followups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map(f => {
                            const client = this.clients.find(c => c.id === f.clientId);
                            const isOverdue = new Date(f.nextDate) < new Date() && f.status === 'Pending';
                            return `
                                <tr>
                                    <td><strong>${client ? client.name : 'Unknown'}</strong></td>
                                    <td>${f.timestamp}</td>
                                    <td>
                                        <div class="reminder-date ${isOverdue ? 'overdue' : ''}">
                                            <i data-lucide="${f.status === 'Done' ? 'check-circle' : 'clock'}"></i> ${f.nextDate}
                                        </div>
                                    </td>
                                    <td><div style="max-width: 300px; font-size: 0.875rem;">${f.remark}</div></td>
                                    <td>
                                        <button class="btn btn-ghost btn-sm" onclick="app.openEditFollowUp('${f.id}')">Edit</button>
                                        ${f.status === 'Pending' 
                                            ? `<button class="btn btn-ghost btn-sm" onclick="app.closeFollowUp('${f.id}')">Done</button>` 
                                            : '<span style="color: #10b981; font-size: 0.75rem; margin-left:8px;">Completed</span>'}
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    openAddFollowUp() {
        this.modalTitle.textContent = 'New Follow-up Log';
        this.modalContent.innerHTML = `
            <div class="form-group">
                <label>Client</label>
                <select id="follow-client">
                    ${this.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>What did you talk about? (Remark)</label>
                <textarea id="follow-remark" rows="4" style="width:100%; padding:10px; border-radius:8px; border:1px solid var(--border-color); font-family:inherit;"></textarea>
            </div>
            <div class="form-group">
                <label>Remind me to follow up in...</label>
                <select id="follow-interval">
                    <option value="3">3 Days</option>
                    <option value="7">1 Week</option>
                    <option value="14">2 Weeks</option>
                    <option value="30">1 Month</option>
                </select>
            </div>
        `;
        this.btnSaveModal.onclick = () => {
            const days = parseInt(document.getElementById('follow-interval').value);
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + days);
            
            const newLog = {
                id: 'f' + Date.now(),
                clientId: document.getElementById('follow-client').value,
                timestamp: new Date().toLocaleString(),
                remark: document.getElementById('follow-remark').value,
                nextDate: nextDate.toISOString().split('T')[0],
                status: 'Pending'
            };
            
            this.followups.push(newLog);
            this.saveState();
            this.closeModal();
            this.render();
        };
        this.modalOverlay.classList.remove('hidden');
    }

    openEditFollowUp(id) {
        const f = this.followups.find(x => x.id === id);
        if(!f) return;

        this.openAddFollowUp();
        this.modalTitle.textContent = 'Edit Follow-up Log';
        
        document.getElementById('follow-client').value = f.clientId;
        document.getElementById('follow-remark').value = f.remark;
        // Interval is not easily reverse-calculated from date without knowing original timestamp, 
        // but we can just let them set a new interval or handle custom dates if needed.
        
        this.btnSaveModal.onclick = () => {
            const days = parseInt(document.getElementById('follow-interval').value);
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + days);
            
            f.clientId = document.getElementById('follow-client').value;
            f.remark = document.getElementById('follow-remark').value;
            f.nextDate = nextDate.toISOString().split('T')[0];
            
            this.saveState();
            this.closeModal();
            this.render();
        };
    }

    closeFollowUp(id) {
        const index = this.followups.findIndex(f => f.id === id);
        if (index !== -1) {
            this.followups[index].status = 'Done';
            // Also add a system activity log if desired
            this.saveState();
            this.render();
        }
    }

    renderGoals() {
        const filteredGoals = this.goals.filter(g => g.type === this.currentGoalType);

        this.viewContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 32px;">
                <div class="view-tabs" style="margin-bottom: 0;">
                    <div class="tab-item ${this.currentGoalType === 'Monthly' ? 'active' : ''}" onclick="app.setGoalType('Monthly')">Monthly Goals</div>
                    <div class="tab-item ${this.currentGoalType === 'Yearly' ? 'active' : ''}" onclick="app.setGoalType('Yearly')">Yearly Vision</div>
                </div>
                <button class="btn btn-primary" onclick="app.openAddGoalModal()">+ New Goal</button>
            </div>

            <div class="goals-grid">
                ${filteredGoals.map(g => {
                    const progress = Math.min(100, Math.round((g.current / g.target) * 100));
                    const isCompleted = progress === 100;
                    return `
                        <div class="goal-card ${isCompleted ? 'goal-completed' : ''}">
                            <div class="goal-header">
                                <span class="goal-title">${g.title}</span>
                                <button class="btn btn-ghost btn-sm" onclick="app.openEditGoalModal('${g.id}')"><i data-lucide="edit-3"></i></button>
                            </div>
                            
                            <div class="progress-container">
                                <div class="progress-stats">
                                    <span>${progress}% Complete</span>
                                    <span>RM ${g.current.toLocaleString()} / RM ${g.target.toLocaleString()}</span>
                                </div>
                                <div class="progress-bar-bg">
                                    <div class="progress-bar-fill" style="width: ${progress}%"></div>
                                </div>
                            </div>

                            <div class="reward-section">
                                <div class="reward-title">Achievement Reward</div>
                                <div class="reward-content">
                                    <i data-lucide="${isCompleted ? 'party-popper' : 'gift'}"></i>
                                    <span>${g.reward || 'No reward set'}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    setGoalType(type) {
        this.currentGoalType = type;
        this.render();
    }

    openAddGoalModal() {
        this.modalTitle.textContent = 'Set New Goal';
        this.modalContent.innerHTML = `
            <div class="form-group">
                <label>Goal Type</label>
                <select id="goal-type">
                    <option value="Monthly" ${this.currentGoalType === 'Monthly' ? 'selected' : ''}>Monthly</option>
                    <option value="Yearly" ${this.currentGoalType === 'Yearly' ? 'selected' : ''}>Yearly</option>
                </select>
            </div>
            <div class="form-group">
                <label>Goal Title</label>
                <input type="text" id="goal-title" placeholder="e.g. Sales Target April">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Target Amount (RM)</label>
                    <input type="number" id="goal-target" value="0">
                </div>
                <div class="form-group">
                    <label>Current Status (RM)</label>
                    <input type="number" id="goal-current" value="0">
                </div>
            </div>
            <div class="form-group">
                <label>Reward for Completing</label>
                <input type="text" id="goal-reward" placeholder="e.g. New iPhone, Vacation">
            </div>
        `;
        this.btnSaveModal.onclick = () => {
            const newGoal = {
                id: 'g' + Date.now(),
                type: document.getElementById('goal-type').value,
                title: document.getElementById('goal-title').value,
                target: parseFloat(document.getElementById('goal-target').value) || 0,
                current: parseFloat(document.getElementById('goal-current').value) || 0,
                reward: document.getElementById('goal-reward').value,
                isCompleted: false
            };
            this.goals.push(newGoal);
            this.saveState();
            this.closeModal();
            this.render();
        };
        this.modalOverlay.classList.remove('hidden');
    }

    openEditGoalModal(id) {
        const g = this.goals.find(x => x.id === id);
        if (!g) return;

        this.openAddGoalModal();
        this.modalTitle.textContent = 'Edit Goal Details';
        
        document.getElementById('goal-type').value = g.type;
        document.getElementById('goal-title').value = g.title;
        document.getElementById('goal-target').value = g.target;
        document.getElementById('goal-current').value = g.current;
        document.getElementById('goal-reward').value = g.reward;

        this.btnSaveModal.onclick = () => {
            g.type = document.getElementById('goal-type').value;
            g.title = document.getElementById('goal-title').value;
            g.target = parseFloat(document.getElementById('goal-target').value) || 0;
            g.current = parseFloat(document.getElementById('goal-current').value) || 0;
            g.reward = document.getElementById('goal-reward').value;
            
            this.saveState();
            this.closeModal();
            this.render();
        };
    }

    renderExport() {
        this.viewContent.innerHTML = `
            <h2 style="font-family: 'Outfit'; margin-bottom: 8px;">Export to Notion</h2>
            <p style="color: var(--text-secondary); margin-bottom: 24px;">Download your data as CSV files to import them into your Notion workspace.</p>

            <div class="export-grid">
                <div class="export-card">
                    <div>
                        <h4><i data-lucide="users"></i> Clients Database</h4>
                        <p style="font-size: 0.8rem; color: #666;">Export all ${this.clients.length} client profiles with full details.</p>
                    </div>
                    <button class="btn btn-primary btn-sm" style="margin-top:16px;" onclick="app.doExport('clients')">Download CSV</button>
                </div>

                <div class="export-card">
                    <div>
                        <h4><i data-lucide="folder-kanban"></i> Claims Records</h4>
                        <p style="font-size: 0.8rem; color: #666;">Export all ${this.claims.length} claim submissions and statuses.</p>
                    </div>
                    <button class="btn btn-primary btn-sm" style="margin-top:16px;" onclick="app.doExport('claims')">Download CSV</button>
                </div>

                <div class="export-card">
                    <div>
                        <h4><i data-lucide="history"></i> Follow-up Logs</h4>
                        <p style="font-size: 0.8rem; color: #666;">Export your interaction history with clients.</p>
                    </div>
                    <button class="btn btn-primary btn-sm" style="margin-top:16px;" onclick="app.doExport('followups')">Download CSV</button>
                </div>

                <div class="export-card">
                    <div>
                        <h4><i data-lucide="target"></i> Business Goals</h4>
                        <p style="font-size: 0.8rem; color: #666;">Export your monthly and yearly targets.</p>
                    </div>
                    <button class="btn btn-primary btn-sm" style="margin-top:16px;" onclick="app.doExport('goals')">Download CSV</button>
                </div>
            </div>

            <div class="notion-import-guide">
                <h3 style="display: flex; align-items: center; gap: 8px;"><i data-lucide="help-circle"></i> How to import into Notion?</h3>
                <div class="guide-step">
                    <div class="step-number">1</div>
                    <div>Download the <strong>CSV</strong> file for the database you want to move.</div>
                </div>
                <div class="guide-step">
                    <div class="step-number">2</div>
                    <div>Open your <strong>Notion</strong> page (e.g., your "Happy Folder").</div>
                </div>
                <div class="guide-step">
                    <div class="step-number">3</div>
                    <div>Simply <strong>Drag and Drop</strong> the CSV file directly onto the Notion page. Choose <strong>"Import as Database"</strong>.</div>
                </div>
            </div>

            <h3 style="font-family: 'Outfit'; margin-top: 40px; margin-bottom: 16px;">一键导入 / Restore from Backup</h3>
            <div class="upload-zone" id="drop-zone" onclick="document.getElementById('file-input').click()">
                <i data-lucide="upload-cloud" style="width: 48px; height: 48px;"></i>
                <p><strong>Click to Upload</strong> or drag and drop your CSV backup here</p>
                <p style="font-size: 0.7rem; margin-top: 8px;">Supports: Clients, Claims, Follow-ups, and Goals exports</p>
                <input type="file" id="file-input" class="hidden" accept=".csv" onchange="app.handleCSVUpload(event)">
            </div>
        `;
    }

    handleCSVUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            this.processOneClickImport(text, file.name);
        };
        reader.readAsText(file);
    }

    processOneClickImport(text, filename) {
        const rows = text.trim().split('\n');
        if (rows.length < 2) {
            alert('File is empty or invalid.');
            return;
        }

        const headers = rows[0].toLowerCase();
        let count = 0;

        if (headers.includes('phone') && headers.includes('email')) {
            // It's a Clients file
            this.pendingImport = [];
            rows.slice(1).forEach(row => {
                const cols = row.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
                if (cols.length >= 3) {
                    this.pendingImport.push({
                        id: 'c' + (Date.now() + Math.random()),
                        name: cols[0], email: cols[1], phone: cols[2], 
                        category: cols[3] || 'Existing', sourceTag: cols[4] || '',
                        dob: cols[5] || '', gender: cols[6] || '', job: cols[7] || '', 
                        income: cols[8] || '', isSmoker: cols[9] || '', status: cols[10] || 'Active',
                        policy: 'Imported'
                    });
                }
            });
            this.processImport(); // Reuses our existing overwrite logic!
            return;
        }

        if (headers.includes('submission date') || headers.includes('amount')) {
            // It's a Claims file
            const newClaims = rows.slice(1).map(row => {
                const cols = row.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
                return {
                    id: 'cl' + (Date.now() + Math.random()),
                    clientId: cols[0], submitDate: cols[1], status: cols[2], 
                    amount: parseFloat(cols[3]) || 0, missingDocs: cols[4] ? cols[4].split('|') : []
                };
            });
            this.claims = [...this.claims, ...newClaims];
            count = newClaims.length;
        } else if (headers.includes('timestamp') || headers.includes('remark')) {
            // It's a Followups file
            const newFollows = rows.slice(1).map(row => {
                const cols = row.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
                return {
                    id: 'f' + (Date.now() + Math.random()),
                    clientId: cols[0], timestamp: cols[1], remark: cols[2], 
                    nextDate: cols[3], status: cols[4] || 'Pending'
                };
            });
            this.followups = [...this.followups, ...newFollows];
            count = newFollows.length;
        } else if (headers.includes('target') || headers.includes('reward')) {
            // It's a Goals file
            const newGoals = rows.slice(1).map(row => {
                const cols = row.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
                return {
                    id: 'g' + (Date.now() + Math.random()),
                    type: cols[0], title: cols[1], target: parseFloat(cols[2]) || 0, 
                    current: parseFloat(cols[3]) || 0, reward: cols[4], isCompleted: false
                };
            });
            this.goals = [...this.goals, ...newGoals];
            count = newGoals.length;
        }

        this.saveState();
        this.render();
        alert(`One-click Import Success! Automatically restored ${count} records from ${filename}.`);
    }

    doExport(type) {
        let csvContent = "";
        let filename = "";

        if (type === 'clients') {
            const headers = "Name,Email,Phone,Category,Source,DOB,Gender,Job,Income,Smoker,Status\n";
            const rows = this.clients.map(c => `"${c.name}","${c.email}","${c.phone}","${c.category}","${c.sourceTag || ''}","${c.dob || ''}","${c.gender || ''}","${c.job || ''}","${c.income || ''}","${c.isSmoker || ''}","${c.status}"`).join("\n");
            csvContent = headers + rows;
            filename = "crm_clients_export.csv";
        } else if (type === 'claims') {
            const headers = "Client ID,Submission Date,Status,Amount,Missing Docs\n";
            const rows = this.claims.map(c => `"${c.clientId}","${c.submitDate}","${c.status}","${c.amount}","${(c.missingDocs || []).join(', ')}"`).join("\n");
            csvContent = headers + rows;
            filename = "crm_claims_export.csv";
        } else if (type === 'followups') {
            const headers = "Client ID,Timestamp,Remark,Next Date,Status\n";
            const rows = this.followups.map(f => `"${f.clientId}","${f.timestamp}","${f.remark.replace(/"/g, '""')}","${f.nextDate}","${f.status}"`).join("\n");
            csvContent = headers + rows;
            filename = "crm_followups_export.csv";
        } else if (type === 'goals') {
            const headers = "Type,Title,Target,Current,Reward\n";
            const rows = this.goals.map(g => `"${g.type}","${g.title}","${g.target}","${g.current}","${g.reward}"`).join("\n");
            csvContent = headers + rows;
            filename = "crm_goals_export.csv";
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    openAddModal() {
        if (this.currentView === 'claims') {
            this.openAddClaimModal();
        } else if (this.currentView === 'clients') {
            this.openAddClientModal();
        } else if (this.currentView === 'follow-up') {
            this.openAddFollowUp();
        } else if (this.currentView === 'goals') {
            this.openAddGoalModal();
        } else {
            alert('Please switch to Clients, Claims, Follow-up or Goals to add data.');
        }
    }

    openAddClientModal() {
        this.modalTitle.textContent = 'Add New Client';
        this.modalContent.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="client-name" placeholder="Client Name">
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="client-email" placeholder="email@example.com">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="text" id="client-phone" placeholder="e.g. +60123456789">
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <select id="client-category" onchange="app.toggleSourceTag(this.value)">
                        <option value="Existing">Existing Client</option>
                        <option value="Cold Market">Cold Market</option>
                        <option value="Referral">Referral</option>
                    </select>
                </div>
            </div>
            <div id="source-tag-group" class="form-group hidden">
                <label>Source Media (Cold Market Only)</label>
                <select id="client-source">
                    <option value="Social Media">Social Media</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Door to Door">Door to Door</option>
                    <option value="Roadshow/booth">Roadshow/booth</option>
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Date of Birth</label>
                    <input type="date" id="client-dob">
                </div>
                <div class="form-group">
                    <label>Gender</label>
                    <select id="client-gender">
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Occupation</label>
                    <input type="text" id="client-job" placeholder="Work/Job">
                </div>
                <div class="form-group">
                    <label>Monthly Income Range (RM)</label>
                    <select id="client-income">
                        <option value="< 3,000">&lt; 3,000</option>
                        <option value="3,000 - 5,000">3,000 - 5,000</option>
                        <option value="5,000 - 10,000">5,000 - 10,000</option>
                        <option value="10,000 - 20,000">10,000 - 20,000</option>
                        <option value="> 20,000">&gt; 20,000</option>
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Does Smoke?</label>
                    <select id="client-smoker">
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Client Status</label>
                    <select id="client-status">
                        <option value="Active">Active</option>
                        <option value="Pending">Pending</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </div>
        `;
        this.btnSaveModal.onclick = () => this.saveClient();
        this.modalOverlay.classList.remove('hidden');
    }

    toggleSourceTag(val) {
        const group = document.getElementById('source-tag-group');
        if (val === 'Cold Market') group.classList.remove('hidden');
        else group.classList.add('hidden');
    }

    saveClient(id = null) {
        const clientData = {
            id: id || 'c' + Date.now(),
            name: document.getElementById('client-name').value,
            email: document.getElementById('client-email').value,
            phone: document.getElementById('client-phone').value,
            category: document.getElementById('client-category').value,
            sourceTag: document.getElementById('client-category').value === 'Cold Market' ? document.getElementById('client-source').value : '',
            dob: document.getElementById('client-dob').value,
            gender: document.getElementById('client-gender').value,
            job: document.getElementById('client-job').value,
            income: document.getElementById('client-income').value,
            isSmoker: document.getElementById('client-smoker').value,
            status: document.getElementById('client-status').value,
            policy: 'New Policy' // Default for new clients
        };

        if (id) {
            const index = this.clients.findIndex(c => c.id === id);
            this.clients[index] = clientData;
        } else {
            this.clients.push(clientData);
        }

        this.saveState();
        this.closeModal();
        this.render();
    }

    openEditClient(id) {
        this.openAddClientModal();
        const c = this.clients.find(x => x.id === id);
        this.modalTitle.textContent = 'Edit Client Profile';
        
        document.getElementById('client-name').value = c.name;
        document.getElementById('client-email').value = c.email || '';
        document.getElementById('client-phone').value = c.phone || '';
        document.getElementById('client-category').value = c.category;
        this.toggleSourceTag(c.category);
        if (c.category === 'Cold Market') document.getElementById('client-source').value = c.sourceTag;
        document.getElementById('client-dob').value = c.dob || '';
        document.getElementById('client-gender').value = c.gender || 'Male';
        document.getElementById('client-job').value = c.job || '';
        document.getElementById('client-income').value = c.income || '';
        document.getElementById('client-smoker').value = c.isSmoker || 'No';
        document.getElementById('client-status').value = c.status || 'Active';

        this.btnSaveModal.onclick = () => this.saveClient(id);
    }

    openImportModal() {
        this.modalTitle.textContent = 'Bulk Import Clients';
        this.modalContent.innerHTML = `
            <div class="template-hint">
                <strong>Format Needed:</strong> Name, Email, Phone, Category, Job, Income, Gender, Smoker(Yes/No)<br>
                <em>Example: Tan Ah Kao, tan@mail.com, 0123456789, Existing, Manager, 8000, Male, No</em>
            </div>
            <div class="import-area">
                <textarea id="import-data" class="import-textarea" placeholder="Paste your data here..."></textarea>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <button class="btn btn-ghost btn-sm" onclick="app.downloadTemplate()">Download Template CSV</button>
                    <button class="btn btn-primary btn-sm" onclick="app.previewImport()">Preview Records</button>
                </div>
            </div>
            <div id="import-preview" class="preview-container hidden">
                <table class="preview-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Category</th>
                        </tr>
                    </thead>
                    <tbody id="preview-body"></tbody>
                </table>
            </div>
        `;
        this.btnSaveModal.textContent = 'Confirm Import';
        this.btnSaveModal.onclick = () => this.processImport();
        this.modalOverlay.classList.remove('hidden');
    }

    downloadTemplate() {
        const headers = "Name,Email,Phone,Category,Job,Income,Gender,Smoker\n";
        const sample = "Alice Tan,alice@example.com,+6012345678,Existing,Engineer,8000,Female,No\nBob Lim,bob@example.com,+6011122233,Cold Market,Sales,5000,Male,Yes";
        const blob = new Blob([headers + sample], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', 'crm_import_template.csv');
        a.click();
    }

    previewImport() {
        const text = document.getElementById('import-data').value;
        const rows = text.trim().split('\n');
        const previewBody = document.getElementById('preview-body');
        const previewContainer = document.getElementById('import-preview');
        
        previewBody.innerHTML = '';
        this.pendingImport = [];

        rows.forEach(row => {
            const cols = row.split(',').map(c => c.trim());
            if (cols.length >= 3) {
                const client = {
                    id: 'c' + (Date.now() + Math.random()),
                    name: cols[0],
                    email: cols[1],
                    phone: cols[2],
                    category: cols[3] || 'Cold Market',
                    job: cols[4] || '',
                    income: cols[5] || '',
                    gender: cols[6] || 'Male',
                    isSmoker: cols[7] || 'No',
                    status: 'Active',
                    policy: 'New Policy'
                };
                this.pendingImport.push(client);
                
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${client.name}</td><td>${client.email}</td><td>${client.phone}</td><td>${client.category}</td>`;
                previewBody.appendChild(tr);
            }
        });

        if (this.pendingImport.length > 0) {
            previewContainer.classList.remove('hidden');
        } else {
            alert('No valid data found. Please check the format.');
        }
    }

    processImport() {
        if (!this.pendingImport || this.pendingImport.length === 0) {
            this.previewImport();
        }
        
        if (this.pendingImport.length > 0) {
            let updatedCount = 0;
            let addedCount = 0;

            this.pendingImport.forEach(newClient => {
                const existingIndex = this.clients.findIndex(c => c.phone === newClient.phone);
                if (existingIndex !== -1) {
                    // Overwrite existing client data
                    this.clients[existingIndex] = { ...this.clients[existingIndex], ...newClient, id: this.clients[existingIndex].id };
                    updatedCount++;
                } else {
                    this.clients.push(newClient);
                    addedCount++;
                }
            });

            this.saveState();
            this.closeModal();
            this.render();
            alert(`Import Complete!\nAdded: ${addedCount}\nUpdated (Overwritten): ${updatedCount}`);
            this.pendingImport = [];
            this.btnSaveModal.textContent = 'Save Changes';
        }
    }

    openAddClaimModal() {
        this.modalTitle.textContent = 'Add New Claim';
        this.modalContent.innerHTML = `
            <div class="form-group">
                <label>Client</label>
                <select id="form-client">
                    ${this.clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Submission Date</label>
                <input type="date" id="form-date" value="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="form-status">
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Paid">Paid</option>
                    <option value="Rejected">Rejected</option>
                </select>
            </div>
            <div class="form-group">
                <label>Missing Documents (Comma separated)</label>
                <input type="text" id="form-docs" placeholder="e.g. IC Copy, Policy Doc">
            </div>
            <div class="form-group">
                <label>Compensation Amount (RM)</label>
                <input type="number" id="form-amount" value="0">
            </div>
        `;
        this.btnSaveModal.onclick = () => this.handleSave();
        this.modalOverlay.classList.remove('hidden');
    }

    openEditClaim(id) {
        const claim = this.claims.find(c => c.id === id);
        if (!claim) return;
        
        this.editingId = id;
        this.modalTitle.textContent = 'Edit Claim Process';
        this.modalContent.innerHTML = `
            <div class="form-group">
                <label>Submission Date</label>
                <input type="date" id="form-date" value="${claim.submitDate}">
            </div>
            <div class="form-group">
                <label>Status</label>
                <select id="form-status">
                    <option value="Pending" ${claim.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Processing" ${claim.status === 'Processing' ? 'selected' : ''}>Processing</option>
                    <option value="Paid" ${claim.status === 'Paid' ? 'selected' : ''}>Paid</option>
                    <option value="Rejected" ${claim.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                </select>
            </div>
            <div class="form-group">
                <label>Missing Documents (Comma separated)</label>
                <input type="text" id="form-docs" value="${claim.missingDocs.join(', ')}">
            </div>
            <div class="form-group">
                <label>Compensation Amount (RM)</label>
                <input type="number" id="form-amount" value="${claim.amount}">
            </div>
        `;
        this.btnSaveModal.onclick = () => this.handleSave();
        this.modalOverlay.classList.remove('hidden');
    }

    handleSave() {
        if (this.currentView === 'claims') {
            const date = document.getElementById('form-date').value;
            const status = document.getElementById('form-status').value;
            const docs = document.getElementById('form-docs').value.split(',').map(d => d.trim()).filter(d => d !== '');
            const amount = parseFloat(document.getElementById('form-amount').value) || 0;
            
            if (this.editingId) {
                const index = this.claims.findIndex(c => c.id === this.editingId);
                this.claims[index] = { ...this.claims[index], submitDate: date, status, missingDocs: docs, amount };
                this.editingId = null;
            } else {
                const clientId = document.getElementById('form-client').value;
                const newClaim = {
                    id: 'cl' + Date.now(),
                    clientId,
                    submitDate: date,
                    status,
                    missingDocs: docs,
                    amount
                };
                this.claims.push(newClaim);
            }
            
            this.saveState();
            this.closeModal();
            this.render();
        }
    }

    closeModal() {
        this.modalOverlay.classList.add('hidden');
        this.editingId = null;
    }
}

const app = new CRMApp();
window.app = app; // For onclick handlers
