/* ============================================
   DreamFund - History Page JavaScript
   Activity history tracking functionality
   ============================================ */

// ============================================
// Global Variables
// ============================================
let currentHistory = [];
let displayedCount = 0;
const ITEMS_PER_PAGE = 10;

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Render history page
    renderHistoryPage();
    
    // Setup filters
    setupHistoryFilters();
});

// ============================================
// Page Rendering
// ============================================

/**
 * Render entire history page
 */
function renderHistoryPage() {
    const data = getData();
    currentHistory = [...data.history];
    
    // Update stats
    updateHistoryStats(data.history);
    
    // Reset display count
    displayedCount = 0;
    
    // Render timeline
    renderHistoryTimeline(currentHistory.slice(0, ITEMS_PER_PAGE));
    displayedCount = Math.min(ITEMS_PER_PAGE, currentHistory.length);
    
    // Update showing count
    updateShowingCount();
    
    // Show/hide load more button
    updateLoadMoreButton();
}

/**
 * Update history statistics
 */
function updateHistoryStats(history) {
    const totalEl = document.getElementById('stat-total-history');
    const savingsEl = document.getElementById('stat-total-savings');
    const completedEl = document.getElementById('stat-completed-targets');
    const monthEl = document.getElementById('stat-this-month');
    
    const total = history.length;
    const totalSavings = history
        .filter(h => h.type === 'saving')
        .reduce((sum, h) => sum + h.amount, 0);
    const completed = history.filter(h => h.type === 'completed').length;
    
    // This month count
    const now = new Date();
    const thisMonth = history.filter(h => {
        const hDate = new Date(h.date);
        return hDate.getMonth() === now.getMonth() && hDate.getFullYear() === now.getFullYear();
    }).length;
    
    if (totalEl) totalEl.textContent = total;
    if (savingsEl) savingsEl.textContent = formatCurrency(totalSavings);
    if (completedEl) completedEl.textContent = completed;
    if (monthEl) monthEl.textContent = thisMonth;
}

/**
 * Render history timeline
 */
function renderHistoryTimeline(historyItems, append = false) {
    const container = document.getElementById('history-timeline');
    if (!container) return;
    
    if (historyItems.length === 0 && !append) {
        container.innerHTML = `
            <div class="empty-state py-5">
                <div class="empty-state-icon">
                    <i class="fas fa-history"></i>
                </div>
                <h4 class="empty-state-title">Belum Ada Riwayat</h4>
                <p class="empty-state-desc">Mulai buat target dan tabung untuk melihat riwayat aktivitasmu.</p>
                <a href="dashboard.html" class="btn btn-primary">
                    <i class="fas fa-rocket me-2"></i>Ke Dashboard
                </a>
            </div>
        `;
        return;
    }
    
    // Group by date
    const grouped = groupHistoryByDate(historyItems);
    
    let html = append ? container.innerHTML : '';
    
    Object.entries(grouped).forEach(([dateLabel, items]) => {
        html += `
            <div class="history-date-group mb-4">
                <div class="history-date-label d-flex align-items-center gap-3 mb-3">
                    <div class="history-date-line flex-grow-1" style="height: 1px; background: var(--border-color);"></div>
                    <span class="badge bg-secondary bg-opacity-10 text-secondary px-3 py-2 rounded-pill" style="font-size: 0.8rem;">
                        <i class="fas fa-calendar-day me-1"></i>${dateLabel}
                    </span>
                    <div class="history-date-line flex-grow-1" style="height: 1px; background: var(--border-color);"></div>
                </div>
                <div class="history-items">
                    ${items.map((item, index) => renderHistoryItem(item, index)).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Render single history item
 */
function renderHistoryItem(item, index) {
    const typeConfig = getHistoryTypeConfig(item.type);
    const timeStr = new Date(item.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    
    // Amount display
    let amountHtml = '';
    if (item.amount > 0) {
        const amountColor = item.type === 'completed' ? 'text-success' : 
                           item.type === 'delete' ? 'text-danger' : 'text-success';
        const prefix = item.type === 'delete' ? '-' : '+';
        amountHtml = `<span class="fw-bold ${amountColor}">${prefix}${formatCurrency(item.amount)}</span>`;
    }
    
    return `
        <div class="history-item d-flex align-items-start gap-3 py-3 px-3 rounded-3 mb-2" 
             style="background: var(--bg-body); border: 1px solid var(--border-color); transition: all 0.2s ease;"
             onmouseenter="this.style.background='var(--bg-hover)'" 
             onmouseleave="this.style.background='var(--bg-body)'">
            
            <!-- Icon -->
            <div class="flex-shrink-0">
                <div style="width: 44px; height: 44px; border-radius: 12px; 
                     background: ${typeConfig.bg}; color: ${typeConfig.color};
                     display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
                    <i class="fas ${typeConfig.icon}"></i>
                </div>
            </div>
            
            <!-- Content -->
            <div class="flex-grow-1 min-width-0">
                <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <div>
                        <div class="fw-semibold mb-1">${item.targetName || item.note || 'Aktivitas'}</div>
                        <div class="d-flex align-items-center gap-2 flex-wrap">
                            <span class="badge-custom ${typeConfig.badge}">
                                <i class="fas ${typeConfig.icon} me-1" style="font-size: 0.6rem;"></i>
                                ${typeConfig.label}
                            </span>
                            ${item.note && item.type !== 'created' && item.type !== 'delete' ? 
                                `<span class="small text-muted text-truncate" style="max-width: 200px;">${item.note}</span>` : ''}
                        </div>
                    </div>
                    <div class="text-end flex-shrink-0">
                        ${amountHtml}
                        <div class="small text-muted mt-1">
                            <i class="fas fa-clock me-1" style="font-size: 0.7rem;"></i>${timeStr}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Get history type configuration
 */
function getHistoryTypeConfig(type) {
    const configs = {
        saving: {
            icon: 'fa-piggy-bank',
            color: '#22C55E',
            bg: 'rgba(34, 197, 94, 0.1)',
            label: 'Menabung',
            badge: 'success'
        },
        completed: {
            icon: 'fa-trophy',
            color: '#F59E0B',
            bg: 'rgba(245, 158, 11, 0.1)',
            label: 'Target Tercapai',
            badge: 'warning'
        },
        created: {
            icon: 'fa-plus-circle',
            color: '#2563EB',
            bg: 'rgba(37, 99, 235, 0.1)',
            label: 'Target Baru',
            badge: 'info'
        },
        wishlist: {
            icon: 'fa-heart',
            color: '#EF4444',
            bg: 'rgba(239, 68, 68, 0.1)',
            label: 'Wishlist',
            badge: 'danger'
        },
        edit: {
            icon: 'fa-edit',
            color: '#06B6D4',
            bg: 'rgba(6, 182, 212, 0.1)',
            label: 'Diubah',
            badge: 'info'
        },
        delete: {
            icon: 'fa-trash',
            color: '#EF4444',
            bg: 'rgba(239, 68, 68, 0.1)',
            label: 'Dihapus',
            badge: 'danger'
        }
    };
    
    return configs[type] || configs.created;
}

/**
 * Group history items by date
 */
function groupHistoryByDate(items) {
    const groups = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    items.forEach(item => {
        const itemDate = new Date(item.date);
        const itemDay = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
        
        let label;
        if (itemDay.getTime() === today.getTime()) {
            label = 'Hari Ini';
        } else if (itemDay.getTime() === yesterday.getTime()) {
            label = 'Kemarin';
        } else {
            label = formatDate(item.date);
        }
        
        if (!groups[label]) {
            groups[label] = [];
        }
        groups[label].push(item);
    });
    
    return groups;
}

// ============================================
// Pagination
// ============================================

/**
 * Load more history items
 */
function loadMoreHistory() {
    const nextItems = currentHistory.slice(displayedCount, displayedCount + ITEMS_PER_PAGE);
    
    if (nextItems.length > 0) {
        // Get existing grouped items to avoid duplicate date headers
        const container = document.getElementById('history-timeline');
        const existingGroups = container.querySelectorAll('.history-date-group');
        const lastGroup = existingGroups[existingGroups.length - 1];
        
        // Check if last date group matches first new item
        const firstNewItem = nextItems[0];
        const firstNewDate = new Date(firstNewItem.date);
        const firstNewDay = new Date(firstNewDate.getFullYear(), firstNewDate.getMonth(), firstNewDate.getDate());
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        let newLabel;
        if (firstNewDay.getTime() === today.getTime()) newLabel = 'Hari Ini';
        else if (firstNewDay.getTime() === yesterday.getTime()) newLabel = 'Kemarin';
        else newLabel = formatDate(firstNewItem.date);
        
        // Check if we should append to last group or create new
        const lastLabel = lastGroup ? lastGroup.querySelector('.history-date-label span').textContent.trim() : '';
        
        if (lastLabel === newLabel && lastGroup) {
            // Append to existing group
            const itemsContainer = lastGroup.querySelector('.history-items');
            const newHtml = nextItems.map((item, idx) => renderHistoryItem(item, idx)).join('');
            itemsContainer.insertAdjacentHTML('beforeend', newHtml);
        } else {
            // Create new group(s)
            const grouped = groupHistoryByDate(nextItems);
            let html = '';
            
            Object.entries(grouped).forEach(([dateLabel, items]) => {
                html += `
                    <div class="history-date-group mb-4">
                        <div class="history-date-label d-flex align-items-center gap-3 mb-3">
                            <div class="history-date-line flex-grow-1" style="height: 1px; background: var(--border-color);"></div>
                            <span class="badge bg-secondary bg-opacity-10 text-secondary px-3 py-2 rounded-pill" style="font-size: 0.8rem;">
                                <i class="fas fa-calendar-day me-1"></i>${dateLabel}
                            </span>
                            <div class="history-date-line flex-grow-1" style="height: 1px; background: var(--border-color);"></div>
                        </div>
                        <div class="history-items">
                            ${items.map((item, idx) => renderHistoryItem(item, idx)).join('')}
                        </div>
                    </div>
                `;
            });
            
            container.insertAdjacentHTML('beforeend', html);
        }
        
        displayedCount += nextItems.length;
    }
    
    updateShowingCount();
    updateLoadMoreButton();
}

/**
 * Update showing count text
 */
function updateShowingCount() {
    const el = document.getElementById('showing-count');
    if (el) {
        el.textContent = `Menampilkan ${displayedCount} dari ${currentHistory.length} aktivitas`;
    }
}

/**
 * Update load more button visibility
 */
function updateLoadMoreButton() {
    const container = document.getElementById('load-more-container');
    if (container) {
        container.style.display = displayedCount < currentHistory.length ? 'block' : 'none';
    }
}

// ============================================
// Filter & Sort
// ============================================

/**
 * Setup history filter event listeners
 */
function setupHistoryFilters() {
    const searchInput = document.getElementById('filter-search');
    const typeSelect = document.getElementById('filter-type');
    const periodSelect = document.getElementById('filter-period');
    const sortSelect = document.getElementById('filter-sort');
    
    [searchInput, typeSelect, periodSelect, sortSelect].forEach(el => {
        if (el) {
            el.addEventListener('input', applyHistoryFilters);
            el.addEventListener('change', applyHistoryFilters);
        }
    });
}

/**
 * Apply filters and sort to history
 */
function applyHistoryFilters() {
    const searchInput = document.getElementById('filter-search');
    const typeSelect = document.getElementById('filter-type');
    const periodSelect = document.getElementById('filter-period');
    const sortSelect = document.getElementById('filter-sort');
    
    const search = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const type = typeSelect ? typeSelect.value : '';
    const period = periodSelect ? periodSelect.value : '';
    const sort = sortSelect ? sortSelect.value : 'newest';
    
    const data = getData();
    let filtered = [...data.history];
    
    // Search filter
    if (search) {
        filtered = filtered.filter(h => 
            (h.targetName && h.targetName.toLowerCase().includes(search)) ||
            (h.note && h.note.toLowerCase().includes(search))
        );
    }
    
    // Type filter
    if (type) {
        filtered = filtered.filter(h => h.type === type);
    }
    
    // Period filter
    if (period) {
        const now = new Date();
        filtered = filtered.filter(h => {
            const hDate = new Date(h.date);
            switch (period) {
                case 'today':
                    return hDate.toDateString() === now.toDateString();
                case 'week': {
                    const weekAgo = new Date(now);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return hDate >= weekAgo;
                }
                case 'month':
                    return hDate.getMonth() === now.getMonth() && hDate.getFullYear() === now.getFullYear();
                case 'year':
                    return hDate.getFullYear() === now.getFullYear();
                default:
                    return true;
            }
        });
    }
    
    // Sort
    filtered.sort((a, b) => {
        switch (sort) {
            case 'newest':
                return new Date(b.date) - new Date(a.date);
            case 'oldest':
                return new Date(a.date) - new Date(b.date);
            default:
                return new Date(b.date) - new Date(a.date);
        }
    });
    
    // Update current history and re-render
    currentHistory = filtered;
    displayedCount = 0;
    
    const container = document.getElementById('history-timeline');
    if (container) container.innerHTML = '';
    
    renderHistoryTimeline(currentHistory.slice(0, ITEMS_PER_PAGE));
    displayedCount = Math.min(ITEMS_PER_PAGE, currentHistory.length);
    
    updateShowingCount();
    updateLoadMoreButton();
    updateHistoryStats(filtered);
}

// ============================================
// Clear History
// ============================================

/**
 * Clear all history
 */
function clearAllHistory() {
    showConfirm('Hapus Semua Riwayat?', 'Semua riwayat aktivitas akan dihapus permanen. Data target dan wishlist tidak akan terpengaruh.').then(result => {
        if (result.isConfirmed) {
            const data = getData();
            data.history = [];
            saveData(data);
            
            currentHistory = [];
            displayedCount = 0;
            
            const container = document.getElementById('history-timeline');
            if (container) container.innerHTML = '';
            
            updateShowingCount();
            updateLoadMoreButton();
            updateHistoryStats([]);
            
            showToast('Semua riwayat berhasil dihapus', 'success');
        }
    });
}
