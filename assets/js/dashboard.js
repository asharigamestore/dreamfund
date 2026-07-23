/* ============================================
   DreamFund - Dashboard Page JavaScript
   Dashboard-specific functionality
   ============================================ */

// ============================================
// Global Variables
// ============================================
let savingsChart = null;
let addTargetModal = null;
let addSavingModal = null;

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap modals
    addTargetModal = new bootstrap.Modal(document.getElementById('addTargetModal'));
    addSavingModal = new bootstrap.Modal(document.getElementById('addSavingModal'));
    
    // Set greeting text
    setGreeting();
    
    // Render dashboard
    renderDashboard();
    
    // Initialize chart
    initSavingsChart();
    
    // Display quote
    displayQuote('quote-container');
    
    // Setup chart period buttons
    setupChartPeriodButtons();
    
    // Setup global search
    setupGlobalSearch();
});

// ============================================
// Greeting
// ============================================

/**
 * Set greeting based on time of day
 */
function setGreeting() {
    const hour = new Date().getHours();
    const greetings = document.getElementById('greeting-text');
    if (!greetings) return;
    
    let text = 'Selamat datang kembali!';
    if (hour >= 5 && hour < 11) text = 'Selamat pagi! Semangat memulai hari.';
    else if (hour >= 11 && hour < 15) text = 'Selamat siang! Jangan lupa istirahat.';
    else if (hour >= 15 && hour < 18) text = 'Selamat sore! Waktunya review progress.';
    else text = 'Selamat malam! Istirahat yang cukup ya.';
    
    greetings.textContent = text;
}

// ============================================
// Dashboard Rendering
// ============================================

/**
 * Render entire dashboard
 */
function renderDashboard() {
    const data = getData();
    const stats = getDashboardStats();
    
    // Update stat cards
    updateStatCards(stats);
    
    // Update circular progress
    updateCircularProgress(stats.overallProgress);
    
    // Render target progress list
    renderTargetProgressList(data.targets);
    
    // Render recent activity
    renderRecentActivity(data.history.slice(0, 5));
    
    // Render recent wishlist
    renderRecentWishlist(data.wishlists.slice(0, 4));
    
    // Render achievements
    renderAchievements(data.achievements);
    
    // Update saving target select
    updateSavingTargetSelect(data.targets);
    
    // Update notification count
    updateNotificationCount();
}

/**
 * Update stat cards with data
 */
function updateStatCards(stats) {
    const totalTargetEl = document.getElementById('total-target');
    const totalSavedEl = document.getElementById('total-saved');
    const completedCountEl = document.getElementById('completed-count');
    const wishlistCountEl = document.getElementById('wishlist-count');
    const activeBadgeEl = document.getElementById('active-targets-badge');
    const progressBadgeEl = document.getElementById('progress-badge');
    const targetCountEl = document.getElementById('target-count');
    const transactionCountEl = document.getElementById('transaction-count');
    
    if (totalTargetEl) totalTargetEl.textContent = formatCurrency(stats.totalTarget);
    if (totalSavedEl) totalSavedEl.textContent = formatCurrency(stats.totalSaved);
    if (completedCountEl) completedCountEl.textContent = stats.completedTargets;
    if (wishlistCountEl) wishlistCountEl.textContent = stats.totalWishlists;
    
    if (activeBadgeEl) activeBadgeEl.textContent = `${stats.activeTargets} Aktif`;
    if (progressBadgeEl) progressBadgeEl.textContent = `${stats.overallProgress}%`;
    if (targetCountEl) targetCountEl.textContent = stats.activeTargets + stats.completedTargets;
    if (transactionCountEl) transactionCountEl.textContent = stats.totalTransactions;
}

/**
 * Update circular progress SVG
 */
function updateCircularProgress(percentage) {
    const circle = document.getElementById('progress-circle');
    const percentText = document.getElementById('progress-percent');
    
    if (!circle || !percentText) return;
    
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    
    circle.style.strokeDasharray = `${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;
    
    // Animate after a short delay
    setTimeout(() => {
        circle.style.strokeDashoffset = offset;
    }, 300);
    
    // Animate percentage text
    animateCounter(percentText, percentage, 1500, '', '%');
}

/**
 * Render target progress list
 */
function renderTargetProgressList(targets) {
    const container = document.getElementById('target-progress-list');
    if (!container) return;
    
    const activeTargets = targets.filter(t => !t.completed).slice(0, 4);
    
    if (activeTargets.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <p class="text-muted mb-0">Belum ada target aktif</p>
                <button class="btn btn-sm btn-primary mt-2" onclick="openAddTargetModal()">
                    <i class="fas fa-plus me-1"></i>Buat Target
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = activeTargets.map(target => {
        const percent = formatPercent(target.currentAmount, target.targetAmount);
        const daysLeft = Math.ceil((new Date(target.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        const daysText = daysLeft > 0 ? `${daysLeft} hari lagi` : 'Deadline lewat';
        
        return `
            <div class="mb-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <div class="d-flex align-items-center gap-2">
                        <div style="width: 10px; height: 10px; border-radius: 50%; background: ${target.color || getCategoryColor(target.category)};"></div>
                        <span class="fw-semibold small">${target.name}</span>
                    </div>
                    <span class="small text-muted">${formatCurrencyShort(target.currentAmount)} / ${formatCurrencyShort(target.targetAmount)}</span>
                </div>
                <div class="progress-custom">
                    <div class="progress-bar bg-primary" style="width: ${percent}%; background: linear-gradient(90deg, ${target.color || getCategoryColor(target.category)}, ${target.color || getCategoryColor(target.category)}aa) !important;"></div>
                </div>
                <div class="d-flex justify-content-between mt-1">
                    <span class="small text-muted">${percent}%</span>
                    <span class="small ${daysLeft < 30 ? 'text-danger' : 'text-muted'}">${daysText}</span>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Render recent activity
 */
function renderRecentActivity(history) {
    const container = document.getElementById('recent-activity-list');
    if (!container) return;
    
    if (history.length === 0) {
        container.innerHTML = `
            <div class="empty-state py-3">
                <div class="empty-state-icon" style="width: 60px; height: 60px; font-size: 1.5rem;">
                    <i class="fas fa-history"></i>
                </div>
                <p class="text-muted small mb-0">Belum ada aktivitas</p>
            </div>
        `;
        return;
    }
    
    const typeIcons = {
        saving: { icon: 'fa-piggy-bank', color: 'success', label: 'Menabung' },
        completed: { icon: 'fa-trophy', color: 'warning', label: 'Target Tercapai' },
        created: { icon: 'fa-plus-circle', color: 'primary', label: 'Target Baru' },
        wishlist: { icon: 'fa-heart', color: 'danger', label: 'Wishlist Baru' },
        edit: { icon: 'fa-edit', color: 'info', label: 'Diubah' },
        delete: { icon: 'fa-trash', color: 'danger', label: 'Dihapus' }
    };
    
    container.innerHTML = history.map(item => {
        const typeInfo = typeIcons[item.type] || typeIcons.created;
        const amountText = item.amount > 0 ? `<span class="fw-semibold text-success">+${formatCurrency(item.amount)}</span>` : '';
        
        return `
            <div class="d-flex align-items-center gap-3 py-3 border-bottom" style="border-color: var(--border-color) !important;">
                <div class="flex-shrink-0">
                    <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(var(--${typeInfo.color}-rgb), 0.1); color: var(--${typeInfo.color}); display: flex; align-items: center; justify-content: center;">
                        <i class="fas ${typeInfo.icon}"></i>
                    </div>
                </div>
                <div class="flex-grow-1 min-width-0">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <div class="fw-semibold small text-truncate">${item.targetName || item.note}</div>
                            <div class="text-muted small">${typeInfo.label} &bull; ${formatRelativeTime(item.date)}</div>
                        </div>
                        ${amountText}
                    </div>
                    ${item.note && item.type !== 'created' ? `<div class="small text-muted mt-1 text-truncate">${item.note}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Render recent wishlist
 */
function renderRecentWishlist(wishlists) {
    const container = document.getElementById('recent-wishlist-list');
    if (!container) return;
    
    if (wishlists.length === 0) {
        container.innerHTML = `
            <div class="empty-state py-3">
                <div class="empty-state-icon" style="width: 60px; height: 60px; font-size: 1.5rem;">
                    <i class="fas fa-heart"></i>
                </div>
                <p class="text-muted small mb-0">Belum ada wishlist</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = wishlists.map(item => {
        const categoryColor = getCategoryColor(item.category);
        const daysLeft = Math.ceil((new Date(item.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="d-flex align-items-center gap-3 py-3 border-bottom" style="border-color: var(--border-color) !important;">
                <div class="flex-shrink-0">
                    <div style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, ${categoryColor}22, ${categoryColor}11); border: 1px solid ${categoryColor}33; display: flex; align-items: center; justify-content: center; color: ${categoryColor};">
                        <i class="fas ${getCategoryIcon(item.category)}"></i>
                    </div>
                </div>
                <div class="flex-grow-1 min-width-0">
                    <div class="fw-semibold small text-truncate">${item.name}</div>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="small text-muted">${formatCurrency(item.price)}</span>
                        <span class="badge-custom ${getStatusBadge(item.status)}">${getStatusLabel(item.status)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Render achievements
 */
function renderAchievements(earnedAchievements) {
    const container = document.getElementById('achievements-list');
    if (!container) return;
    
    const earnedIds = earnedAchievements.map(a => a.id);
    const displayAchievements = DreamFund.achievementsList.slice(0, 6);
    
    container.innerHTML = displayAchievements.map(achievement => {
        const isEarned = earnedIds.includes(achievement.id);
        const earnedData = earnedAchievements.find(a => a.id === achievement.id);
        
        return `
            <div class="col-6 col-md-4 col-lg-2">
                <div class="text-center p-3 rounded-3 ${isEarned ? '' : 'opacity-50'}" 
                     style="background: ${isEarned ? `linear-gradient(135deg, rgba(var(--${achievement.color}-rgb), 0.1), rgba(var(--${achievement.color}-rgb), 0.05))` : 'var(--bg-body)'}; 
                     border: 1px solid ${isEarned ? `rgba(var(--${achievement.color}-rgb), 0.2)` : 'var(--border-color)'};">
                    <div style="width: 48px; height: 48px; border-radius: 12px; background: ${isEarned ? `linear-gradient(135deg, var(--${achievement.color}), var(--${achievement.color}))` : 'var(--border-color)'}; 
                         display: flex; align-items: center; justify-content: center; 
                         color: ${isEarned ? 'white' : 'var(--text-muted)'}; margin: 0 auto 0.75rem; font-size: 1.25rem;">
                        <i class="fas ${achievement.icon}"></i>
                    </div>
                    <div class="fw-bold small ${isEarned ? '' : 'text-muted'}">${achievement.name}</div>
                    <div class="small text-muted" style="font-size: 0.7rem;">${achievement.description}</div>
                    ${earnedData ? `<div class="small text-success mt-1" style="font-size: 0.7rem;"><i class="fas fa-check-circle me-1"></i>${formatDateShort(earnedData.earnedAt)}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Update saving target select options
 */
function updateSavingTargetSelect(targets) {
    const select = document.getElementById('saving-target-select');
    if (!select) return;
    
    const activeTargets = targets.filter(t => !t.completed);
    
    select.innerHTML = '<option value="">Pilih Target Tabungan</option>' +
        activeTargets.map(t => `<option value="${t.id}">${t.name} (${formatCurrencyShort(t.targetAmount - t.currentAmount)} lagi)</option>`).join('');
}

/**
 * Update notification count
 */
function updateNotificationCount() {
    const badge = document.getElementById('notification-count');
    if (!badge) return;
    
    const data = getData();
    const notifications = data.targets.filter(t => {
        if (t.completed) return false;
        const daysLeft = Math.ceil((new Date(t.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        return daysLeft <= 7 && daysLeft > 0;
    }).length;
    
    badge.textContent = notifications;
    badge.style.display = notifications > 0 ? 'block' : 'none';
}

// ============================================
// Modal Functions
// ============================================

/**
 * Open add target modal
 */
function openAddTargetModal() {
    if (addTargetModal) addTargetModal.show();
}

/**
 * Open add saving modal
 */
function openAddSavingModal() {
    const data = getData();
    const activeTargets = data.targets.filter(t => !t.completed);
    
    if (activeTargets.length === 0) {
        showToast('Buat target terlebih dahulu!', 'warning');
        return;
    }
    
    updateSavingTargetSelect(data.targets);
    if (addSavingModal) addSavingModal.show();
}

/**
 * Submit add target form
 */
function submitAddTarget() {
    const form = document.getElementById('add-target-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const formData = new FormData(form);
    const data = getData();
    
    const newTarget = {
        id: generateId(),
        name: formData.get('name'),
        targetAmount: parseInt(formData.get('targetAmount')),
        currentAmount: parseInt(formData.get('currentAmount') || 0),
        category: formData.get('category'),
        deadline: formData.get('deadline'),
        description: formData.get('description') || '',
        createdAt: new Date().toISOString(),
        completed: false,
        color: getCategoryColor(formData.get('category'))
    };
    
    data.targets.push(newTarget);
    saveData(data);
    
    // Add history
    addHistory('created', newTarget.id, newTarget.name, 0, 'Target baru dibuat');
    
    // Check achievements
    checkAchievements();
    
    // If initial saving > 0, add saving history
    if (newTarget.currentAmount > 0) {
        addHistory('saving', newTarget.id, newTarget.name, newTarget.currentAmount, 'Tabungan awal');
        checkAchievements();
    }
    
    // Close modal and reset form
    addTargetModal.hide();
    form.reset();
    
    // Refresh dashboard
    renderDashboard();
    updateSavingsChart();
    
    showToast('Target berhasil ditambahkan!', 'success');
}

/**
 * Submit add saving form
 */
function submitAddSaving() {
    const form = document.getElementById('add-saving-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const formData = new FormData(form);
    const data = getData();
    
    const targetId = formData.get('targetId');
    const amount = parseInt(formData.get('amount'));
    const note = formData.get('note') || '';
    
    const target = data.targets.find(t => t.id === targetId);
    if (!target) {
        showToast('Target tidak ditemukan!', 'error');
        return;
    }
    
    // Check if amount would exceed target
    const newAmount = target.currentAmount + amount;
    const wasCompleted = target.completed;
    
    target.currentAmount = newAmount;
    
    // Check if target is completed
    if (target.currentAmount >= target.targetAmount && !target.completed) {
        target.completed = true;
        target.completedAt = new Date().toISOString();
        
        addHistory('completed', target.id, target.name, target.currentAmount, 'Target tercapai! Selamat!');
        triggerConfetti();
        showToast(`🎉 Selamat! Target "${target.name}" telah tercapai!`, 'success');
    } else {
        addHistory('saving', target.id, target.name, amount, note);
        showToast(`Tabungan ${formatCurrency(amount)} berhasil ditambahkan!`, 'success');
    }
    
    saveData(data);
    
    // Check achievements
    checkAchievements();
    
    // Close modal and reset form
    addSavingModal.hide();
    form.reset();
    
    // Refresh dashboard
    renderDashboard();
    updateSavingsChart();
}

// ============================================
// Chart.js Integration
// ============================================

/**
 * Initialize savings chart
 */
function initSavingsChart() {
    const ctx = document.getElementById('savings-chart');
    if (!ctx) return;
    
    const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    
    const gradientFill = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradientFill.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
    gradientFill.addColorStop(1, 'rgba(37, 99, 235, 0)');
    
    const chartData = generateChartData(7);
    
    savingsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: 'Total Tabungan',
                data: chartData.data,
                borderColor: '#2563EB',
                backgroundColor: gradientFill,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#2563EB',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: isDark ? '#1E293B' : '#fff',
                    titleColor: isDark ? '#F1F5F9' : '#0F172A',
                    bodyColor: isDark ? '#94A3B8' : '#64748B',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return 'Tabungan: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: "'Poppins', sans-serif",
                            size: 11
                        }
                    }
                },
                y: {
                    grid: {
                        color: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.5)'
                    },
                    ticks: {
                        font: {
                            family: "'Poppins', sans-serif",
                            size: 11
                        },
                        callback: function(value) {
                            return formatCurrencyShort(value);
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

/**
 * Generate chart data based on period
 */
function generateChartData(days) {
    const data = getData();
    const labels = [];
    const values = [];
    
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        const dateStr = date.toISOString().split('T')[0];
        const dayLabel = date.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
        labels.push(dayLabel);
        
        // Calculate cumulative savings up to this date
        let cumulative = 0;
        data.targets.forEach(target => {
            const targetDate = new Date(target.createdAt).toISOString().split('T')[0];
            if (targetDate <= dateStr) {
                // Estimate based on linear progress
                const totalDays = Math.ceil((new Date(target.deadline) - new Date(target.createdAt)) / (1000 * 60 * 60 * 24));
                const daysPassed = Math.ceil((date - new Date(target.createdAt)) / (1000 * 60 * 60 * 24));
                const progressRatio = Math.min(1, Math.max(0, daysPassed / totalDays));
                cumulative += target.targetAmount * progressRatio * (target.currentAmount / target.targetAmount);
            }
        });
        
        values.push(Math.round(cumulative) || data.targets.reduce((sum, t) => sum + t.currentAmount, 0) * (1 - i / days));
    }
    
    // Ensure last point matches actual total
    const actualTotal = data.targets.reduce((sum, t) => sum + t.currentAmount, 0);
    values[values.length - 1] = actualTotal;
    
    return { labels, data: values };
}

/**
 * Update savings chart
 */
function updateSavingsChart() {
    if (!savingsChart) return;
    
    const activePeriod = document.querySelector('[data-chart-period].active');
    const days = activePeriod ? parseInt(activePeriod.dataset.chartPeriod) : 7;
    const chartData = generateChartData(days);
    
    savingsChart.data.labels = chartData.labels;
    savingsChart.data.datasets[0].data = chartData.data;
    savingsChart.update('active');
}

/**
 * Setup chart period buttons
 */
function setupChartPeriodButtons() {
    const buttons = document.querySelectorAll('[data-chart-period]');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', function() {
            buttons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const days = parseInt(this.dataset.chartPeriod);
            const chartData = generateChartData(days);
            
            if (savingsChart) {
                savingsChart.data.labels = chartData.labels;
                savingsChart.data.datasets[0].data = chartData.data;
                savingsChart.update('active');
            }
        });
    });
}

// ============================================
// Global Search
// ============================================

/**
 * Setup global search functionality
 */
function setupGlobalSearch() {
    const searchInput = document.getElementById('global-search');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        if (query.length < 2) return;
        
        const data = getData();
        const results = [];
        
        // Search targets
        data.targets.forEach(t => {
            if (t.name.toLowerCase().includes(query)) {
                results.push({ type: 'target', name: t.name, id: t.id });
            }
        });
        
        // Search wishlists
        data.wishlists.forEach(w => {
            if (w.name.toLowerCase().includes(query)) {
                results.push({ type: 'wishlist', name: w.name, id: w.id });
            }
        });
        
        // For now, just log results - could show dropdown
        if (results.length > 0 && query.length > 2) {
            console.log('Search results:', results);
        }
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = this.value.trim();
            if (query) {
                showToast(`Mencari "${query}"...`, 'info');
            }
        }
    });
}

// ============================================
// Target Management (Dashboard View)
// ============================================

/**
 * Edit target
 */
function editTarget(targetId) {
    const data = getData();
    const target = data.targets.find(t => t.id === targetId);
    if (!target) return;
    
    // This would open an edit modal - simplified for now
    showToast('Fitur edit tersedia di halaman Celengan Saya', 'info');
}

/**
 * Delete target
 */
function deleteTarget(targetId) {
    showConfirm('Hapus Target?', 'Target yang dihapus tidak dapat dikembalikan.').then(result => {
        if (result.isConfirmed) {
            const data = getData();
            const target = data.targets.find(t => t.id === targetId);
            
            data.targets = data.targets.filter(t => t.id !== targetId);
            saveData(data);
            
            if (target) {
                addHistory('delete', targetId, target.name, target.currentAmount, 'Target dihapus');
            }
            
            renderDashboard();
            updateSavingsChart();
            showToast('Target berhasil dihapus', 'success');
        }
    });
}

/**
 * Add saving to specific target
 */
function quickAddSaving(targetId) {
    const data = getData();
    const target = data.targets.find(t => t.id === targetId);
    if (!target || target.completed) return;
    
    Swal.fire({
        title: `Tambah Tabungan - ${target.name}`,
        input: 'number',
        inputLabel: 'Nominal Tabungan',
        inputPlaceholder: '1000000',
        inputAttributes: {
            min: 1000,
            step: 1000
        },
        showCancelButton: true,
        confirmButtonText: 'Simpan',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#2563EB',
        background: getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim(),
        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim(),
        inputValidator: (value) => {
            if (!value || value < 1000) {
                return 'Minimal tabungan Rp 1.000';
            }
        }
    }).then(result => {
        if (result.isConfirmed) {
            const amount = parseInt(result.value);
            target.currentAmount += amount;
            
            if (target.currentAmount >= target.targetAmount && !target.completed) {
                target.completed = true;
                target.completedAt = new Date().toISOString();
                addHistory('completed', target.id, target.name, target.currentAmount, 'Target tercapai! Selamat!');
                triggerConfetti();
                showToast(`🎉 Selamat! Target "${target.name}" telah tercapai!`, 'success');
            } else {
                addHistory('saving', target.id, target.name, amount, 'Tabungan cepat');
                showToast(`Tabungan ${formatCurrency(amount)} ditambahkan!`, 'success');
            }
            
            saveData(data);
            checkAchievements();
            renderDashboard();
            updateSavingsChart();
        }
    });
}
