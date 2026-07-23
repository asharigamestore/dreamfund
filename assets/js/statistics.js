/* ============================================
   DreamFund - Statistics Page JavaScript
   Analytics and charts functionality
   ============================================ */

// ============================================
// Global Variables
// ============================================
let categoryChart = null;
let monthlyChart = null;
let progressChart = null;
let distributionChart = null;

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Render statistics page
    renderStatisticsPage();
});

// ============================================
// Page Rendering
// ============================================

/**
 * Render entire statistics page
 */
function renderStatisticsPage() {
    const data = getData();
    
    // Update overview stats
    updateOverviewStats(data);
    
    // Initialize charts
    initCategoryChart(data);
    initMonthlyChart(data);
    initProgressChart(data);
    initDistributionChart(data);
    
    // Render detail table
    renderStatsTable(data.targets);
    
    // Render summary cards
    renderSummaryCards(data);
}

/**
 * Update overview statistics
 */
function updateOverviewStats(data) {
    const totalEl = document.getElementById('stat-total-targets');
    const activeEl = document.getElementById('stat-active-targets');
    const doneEl = document.getElementById('stat-done-targets');
    const rateEl = document.getElementById('stat-success-rate');
    
    const total = data.targets.length;
    const active = data.targets.filter(t => !t.completed).length;
    const done = data.targets.filter(t => t.completed).length;
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;
    
    if (totalEl) totalEl.textContent = total;
    if (activeEl) activeEl.textContent = active;
    if (doneEl) doneEl.textContent = done;
    if (rateEl) rateEl.textContent = rate + '%';
}

/**
 * Render stats table
 */
function renderStatsTable(targets) {
    const tbody = document.getElementById('stats-table-body');
    if (!tbody) return;
    
    if (targets.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">
                    <i class="fas fa-inbox me-2"></i>Belum ada target
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = targets.map(target => {
        const percent = formatPercent(target.currentAmount, target.targetAmount);
        const daysLeft = Math.ceil((new Date(target.deadline) - new Date()) / (1000 * 60 * 60 * 24));
        const isOverdue = daysLeft < 0 && !target.completed;
        
        const statusBadge = target.completed 
            ? '<span class="badge-custom success"><i class="fas fa-check-circle me-1"></i>Selesai</span>'
            : isOverdue 
                ? '<span class="badge-custom danger"><i class="fas fa-exclamation-circle me-1"></i>Lewat</span>'
                : '<span class="badge-custom warning"><i class="fas fa-spinner me-1"></i>Berjalan</span>';
        
        const daysText = target.completed 
            ? 'Selesai' 
            : isOverdue 
                ? `<span class="text-danger">${Math.abs(daysLeft)} hari lewat</span>`
                : `${daysLeft} hari`;
        
        const progressColor = percent >= 100 ? 'var(--success)' : percent >= 50 ? 'var(--primary)' : 'var(--warning)';
        
        return `
            <tr>
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <div style="width: 8px; height: 8px; border-radius: 50%; background: ${target.color || getCategoryColor(target.category)};"></div>
                        <span class="fw-semibold">${target.name}</span>
                    </div>
                </td>
                <td>
                    <span class="small">
                        <i class="fas ${getCategoryIcon(target.category)} me-1" style="color: ${getCategoryColor(target.category)};"></i>
                        ${getCategoryLabel(target.category)}
                    </span>
                </td>
                <td class="fw-semibold">${formatCurrency(target.targetAmount)}</td>
                <td class="text-success fw-semibold">${formatCurrency(target.currentAmount)}</td>
                <td style="min-width: 150px;">
                    <div class="d-flex align-items-center gap-2">
                        <div class="progress-custom flex-grow-1">
                            <div class="progress-bar" style="width: ${percent}%; background: ${progressColor};"></div>
                        </div>
                        <span class="small fw-semibold" style="min-width: 35px;">${percent}%</span>
                    </div>
                </td>
                <td>${statusBadge}</td>
                <td>${daysText}</td>
            </tr>
        `;
    }).join('');
}

/**
 * Render summary cards
 */
function renderSummaryCards(data) {
    const avgEl = document.getElementById('stat-avg-saving');
    const biggestNameEl = document.getElementById('stat-biggest-target');
    const biggestAmountEl = document.getElementById('stat-biggest-amount');
    
    // Average saving per transaction
    const savings = data.history.filter(h => h.type === 'saving');
    const avgSaving = savings.length > 0 
        ? savings.reduce((sum, h) => sum + h.amount, 0) / savings.length 
        : 0;
    
    // Biggest target
    const biggest = data.targets.reduce((max, t) => t.targetAmount > max.targetAmount ? t : max, data.targets[0] || null);
    
    if (avgEl) avgEl.textContent = formatCurrency(avgSaving);
    if (biggestNameEl) biggestNameEl.textContent = biggest ? biggest.name : '-';
    if (biggestAmountEl) biggestAmountEl.textContent = biggest ? formatCurrency(biggest.targetAmount) : 'Rp 0';
}

// ============================================
// Chart.js Charts
// ============================================

/**
 * Initialize category doughnut chart
 */
function initCategoryChart(data) {
    const ctx = document.getElementById('category-chart');
    if (!ctx) return;
    
    // Group targets by category
    const categoryTotals = {};
    data.targets.forEach(t => {
        if (!categoryTotals[t.category]) categoryTotals[t.category] = 0;
        categoryTotals[t.category] += t.currentAmount;
    });
    
    const labels = Object.keys(categoryTotals).map(c => getCategoryLabel(c));
    const values = Object.values(categoryTotals);
    const colors = Object.keys(categoryTotals).map(c => getCategoryColor(c));
    
    const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderColor: isDark ? '#151B2B' : '#FFFFFF',
                borderWidth: 2,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: { family: "'Poppins', sans-serif", size: 11 }
                    }
                },
                tooltip: {
                    backgroundColor: isDark ? '#1E293B' : '#fff',
                    titleColor: isDark ? '#F1F5F9' : '#0F172A',
                    bodyColor: isDark ? '#94A3B8' : '#64748B',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 12,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percent = total > 0 ? Math.round((context.parsed / total) * 100) : 0;
                            return `${context.label}: ${formatCurrency(context.parsed)} (${percent}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Initialize monthly savings bar chart
 */
function initMonthlyChart(data) {
    const ctx = document.getElementById('monthly-chart');
    if (!ctx) return;
    
    // Generate last 6 months data
    const months = [];
    const savings = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthLabel = date.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
        months.push(monthLabel);
        
        // Sum savings in this month
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
        
        const monthSavings = data.history
            .filter(h => {
                if (h.type !== 'saving') return false;
                const hDate = new Date(h.date);
                return hDate >= monthStart && hDate <= monthEnd;
            })
            .reduce((sum, h) => sum + h.amount, 0);
        
        savings.push(monthSavings);
    }
    
    const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.8)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.8)');
    
    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Tabungan',
                data: savings,
                backgroundColor: gradient,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: isDark ? '#1E293B' : '#fff',
                    titleColor: isDark ? '#F1F5F9' : '#0F172A',
                    bodyColor: isDark ? '#94A3B8' : '#64748B',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 12,
                    callbacks: {
                        label: function(context) {
                            return 'Tabungan: ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { family: "'Poppins', sans-serif", size: 11 } }
                },
                y: {
                    grid: {
                        color: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.5)'
                    },
                    ticks: {
                        font: { family: "'Poppins', sans-serif", size: 11 },
                        callback: function(value) {
                            return formatCurrencyShort(value);
                        }
                    }
                }
            }
        }
    });
}

/**
 * Initialize progress comparison horizontal bar chart
 */
function initProgressChart(data) {
    const ctx = document.getElementById('progress-chart');
    if (!ctx) return;
    
    const activeTargets = data.targets.filter(t => !t.completed).slice(0, 6);
    
    const labels = activeTargets.map(t => t.name);
    const progress = activeTargets.map(t => formatPercent(t.currentAmount, t.targetAmount));
    const remaining = activeTargets.map(t => 100 - formatPercent(t.currentAmount, t.targetAmount));
    const colors = activeTargets.map(t => t.color || getCategoryColor(t.category));
    
    const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    
    progressChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Tercapai',
                    data: progress,
                    backgroundColor: colors,
                    borderRadius: 4,
                    barPercentage: 0.6
                },
                {
                    label: 'Sisa',
                    data: remaining,
                    backgroundColor: isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(226, 232, 240, 0.8)',
                    borderRadius: 4,
                    barPercentage: 0.6
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true, font: { family: "'Poppins', sans-serif", size: 11 } }
                },
                tooltip: {
                    backgroundColor: isDark ? '#1E293B' : '#fff',
                    titleColor: isDark ? '#F1F5F9' : '#0F172A',
                    bodyColor: isDark ? '#94A3B8' : '#64748B',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 12,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.parsed.x + '%';
                        }
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    max: 100,
                    grid: {
                        color: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.5)'
                    },
                    ticks: {
                        callback: function(value) { return value + '%'; },
                        font: { family: "'Poppins', sans-serif", size: 10 }
                    }
                },
                y: {
                    stacked: true,
                    grid: { display: false },
                    ticks: { font: { family: "'Poppins', sans-serif", size: 11 } }
                }
            }
        }
    });
}

/**
 * Initialize distribution polar area chart
 */
function initDistributionChart(data) {
    const ctx = document.getElementById('distribution-chart');
    if (!ctx) return;
    
    // Count targets per category
    const categoryCounts = {};
    data.targets.forEach(t => {
        if (!categoryCounts[t.category]) categoryCounts[t.category] = 0;
        categoryCounts[t.category]++;
    });
    
    const labels = Object.keys(categoryCounts).map(c => getCategoryLabel(c));
    const values = Object.values(categoryCounts);
    const colors = Object.keys(categoryCounts).map(c => getCategoryColor(c));
    
    const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    
    distributionChart = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors.map(c => c + 'CC'),
                borderColor: isDark ? '#151B2B' : '#FFFFFF',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: { family: "'Poppins', sans-serif", size: 11 }
                    }
                },
                tooltip: {
                    backgroundColor: isDark ? '#1E293B' : '#fff',
                    titleColor: isDark ? '#F1F5F9' : '#0F172A',
                    bodyColor: isDark ? '#94A3B8' : '#64748B',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 12
                }
            },
            scales: {
                r: {
                    grid: {
                        color: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.5)'
                    },
                    ticks: {
                        display: false,
                        backdropColor: 'transparent'
                    }
                }
            }
        }
    });
}
