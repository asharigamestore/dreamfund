/* ============================================
   DreamFund - Global Application JavaScript
   Core functionality shared across all pages
   ============================================ */

// ============================================
// App Configuration & State
// ============================================
const DreamFund = {
    version: '1.0.0',
    storageKey: 'dreamfund_data',
    themeKey: 'dreamfund_theme',
    sidebarKey: 'dreamfund_sidebar_collapsed',
    
    // Default data structure
    defaultData: {
        targets: [],
        wishlists: [],
        history: [],
        achievements: [],
        settings: {
            currency: 'IDR',
            notifications: true,
            theme: 'light'
        },
        createdAt: new Date().toISOString()
    },
    
    // Motivational quotes
    quotes: [
        { text: "Setiap perjalanan besar dimulai dari langkah kecil.", author: "Lao Tzu" },
        { text: "Tabunglah untuk masa depan, nikmatilah hari ini.", author: "Warren Buffett" },
        { text: "Impian tidak bekerja kecuali kamu bekerja untuknya.", author: "John C. Maxwell" },
        { text: "Kedisiplinan adalah jembatan antara tujuan dan pencapaian.", author: "Jim Rohn" },
        { text: "Jangan menunda menabung. Waktu adalah teman terbaikmu.", author: "Benjamin Franklin" },
        { text: "Kemakmuran dimulai dari kebiasaan menabung.", author: "W. Clement Stone" },
        { text: "Setiap rupiah yang ditabung adalah investasi untuk masa depan.", author: "Robert Kiyosaki" },
        { text: "Kesuksesan finansial adalah hasil dari kebiasaan kecil yang konsisten.", author: "Brian Tracy" },
        { text: "Jangan berhemat pada impianmu. Berhematlah pada pengeluaran yang tidak perlu.", author: "Dave Ramsey" },
        { text: "Orang kaya berinvestasi, orang muda menabung.", author: "T. Harv Eker" },
        { text: "Tabungan kecil hari ini, kebebasan finansial esok hari.", author: "Suze Orman" },
        { text: "Keuangan yang sehat dimulai dari kesadaran dan tindakan.", author: "Ramit Sethi" }
    ],
    
    // Achievement definitions
    achievementsList: [
        { id: 'first_target', name: 'First Step', description: 'Buat target tabungan pertama', icon: 'fa-flag', color: 'primary' },
        { id: 'first_saving', name: 'Saver Beginner', description: 'Lakukan tabungan pertama', icon: 'fa-piggy-bank', color: 'success' },
        { id: 'halfway', name: 'Halfway Hero', description: 'Capai 50% dari suatu target', icon: 'fa-star-half-alt', color: 'warning' },
        { id: 'completed', name: 'Dream Catcher', description: 'Selesaikan satu target', icon: 'fa-trophy', color: 'warning' },
        { id: 'five_targets', name: 'Goal Setter', description: 'Buat 5 target tabungan', icon: 'fa-bullseye', color: 'info' },
        { id: 'millionaire', name: 'Million Saver', description: 'Total tabungan mencapai 1 juta', icon: 'fa-coins', color: 'success' },
        { id: 'ten_million', name: 'Ten Million', description: 'Total tabungan mencapai 10 juta', icon: 'fa-gem', color: 'purple' },
        { id: 'streak_7', name: 'Week Warrior', description: 'Tabung 7 hari berturut-turut', icon: 'fa-fire', color: 'danger' },
        { id: 'wishlist_5', name: 'Dream Lister', description: 'Buat 5 wishlist', icon: 'fa-heart', color: 'danger' },
        { id: 'wishlist_complete', name: 'Wish Granted', description: 'Selesaikan satu wishlist', icon: 'fa-magic', color: 'purple' }
    ]
};

// ============================================
// LocalStorage Management
// ============================================

/**
 * Initialize app data in LocalStorage
 * Creates default data if not exists
 */
function initStorage() {
    if (!localStorage.getItem(DreamFund.storageKey)) {
        // Create with demo data
        const demoData = createDemoData();
        localStorage.setItem(DreamFund.storageKey, JSON.stringify(demoData));
    }
}

/**
 * Create realistic demo data
 */
function createDemoData() {
    const data = JSON.parse(JSON.stringify(DreamFund.defaultData));
    
    const now = new Date();
    
    // Demo targets
    data.targets = [
        {
            id: generateId(),
            name: 'MacBook Pro M3',
            targetAmount: 28000000,
            currentAmount: 11200000,
            category: 'elektronik',
            deadline: addDays(now, 180).toISOString().split('T')[0],
            description: 'Laptop untuk kerja dan coding',
            createdAt: addDays(now, -30).toISOString(),
            completed: false,
            color: '#2563EB'
        },
        {
            id: generateId(),
            name: 'Umroh 2026',
            targetAmount: 45000000,
            currentAmount: 22500000,
            category: 'travel',
            deadline: addDays(now, 365).toISOString().split('T')[0],
            description: 'Perjalanan spiritual ke Tanah Suci',
            createdAt: addDays(now, -60).toISOString(),
            completed: false,
            color: '#22C55E'
        },
        {
            id: generateId(),
            name: 'Motor Yamaha NMAX',
            targetAmount: 35000000,
            currentAmount: 35000000,
            category: 'kendaraan',
            deadline: addDays(now, -10).toISOString().split('T')[0],
            description: 'Motor untuk mobilitas harian',
            createdAt: addDays(now, -120).toISOString(),
            completed: true,
            completedAt: addDays(now, -10).toISOString(),
            color: '#F59E0B'
        },
        {
            id: generateId(),
            name: 'Emergency Fund',
            targetAmount: 20000000,
            currentAmount: 8500000,
            category: 'darurat',
            deadline: addDays(now, 200).toISOString().split('T')[0],
            description: 'Dana darurat 6 bulan pengeluaran',
            createdAt: addDays(now, -45).toISOString(),
            completed: false,
            color: '#EF4444'
        }
    ];
    
    // Demo wishlists
    data.wishlists = [
        {
            id: generateId(),
            name: 'iPhone 16 Pro',
            price: 22000000,
            category: 'elektronik',
            targetDate: addDays(now, 240).toISOString().split('T')[0],
            image: null,
            status: 'menabung',
            priority: 'high',
            createdAt: addDays(now, -15).toISOString()
        },
        {
            id: generateId(),
            name: 'Kamera Sony A7IV',
            price: 35000000,
            category: 'elektronik',
            targetDate: addDays(now, 300).toISOString().split('T')[0],
            image: null,
            status: 'menabung',
            priority: 'medium',
            createdAt: addDays(now, -20).toISOString()
        },
        {
            id: generateId(),
            name: 'Trip ke Jepang',
            price: 25000000,
            category: 'travel',
            targetDate: addDays(now, 400).toISOString().split('T')[0],
            image: null,
            status: 'menabung',
            priority: 'low',
            createdAt: addDays(now, -5).toISOString()
        }
    ];
    
    // Demo history
    data.history = [
        { id: generateId(), type: 'saving', targetId: data.targets[0].id, targetName: 'MacBook Pro M3', amount: 2000000, note: 'Tabungan bulan Juli', date: addDays(now, -2).toISOString() },
        { id: generateId(), type: 'saving', targetId: data.targets[1].id, targetName: 'Umroh 2026', amount: 3000000, note: 'Bonus THR', date: addDays(now, -5).toISOString() },
        { id: generateId(), type: 'saving', targetId: data.targets[3].id, targetName: 'Emergency Fund', amount: 1500000, note: 'Tabungan rutin', date: addDays(now, -7).toISOString() },
        { id: generateId(), type: 'completed', targetId: data.targets[2].id, targetName: 'Motor Yamaha NMAX', amount: 35000000, note: 'Target tercapai!', date: addDays(now, -10).toISOString() },
        { id: generateId(), type: 'saving', targetId: data.targets[0].id, targetName: 'MacBook Pro M3', amount: 2500000, note: 'Tabungan bulan Juni', date: addDays(now, -30).toISOString() },
        { id: generateId(), type: 'created', targetId: data.targets[0].id, targetName: 'MacBook Pro M3', amount: 0, note: 'Target baru dibuat', date: addDays(now, -30).toISOString() },
        { id: generateId(), type: 'wishlist', targetId: null, targetName: 'iPhone 16 Pro', amount: 0, note: 'Wishlist baru ditambahkan', date: addDays(now, -15).toISOString() }
    ];
    
    // Demo achievements
    data.achievements = [
        { id: 'first_target', earnedAt: addDays(now, -120).toISOString() },
        { id: 'first_saving', earnedAt: addDays(now, -115).toISOString() },
        { id: 'halfway', earnedAt: addDays(now, -30).toISOString() },
        { id: 'completed', earnedAt: addDays(now, -10).toISOString() },
        { id: 'five_targets', earnedAt: addDays(now, -45).toISOString() }
    ];
    
    return data;
}

/**
 * Get data from LocalStorage
 */
function getData() {
    const data = localStorage.getItem(DreamFund.storageKey);
    return data ? JSON.parse(data) : createDemoData();
}

/**
 * Save data to LocalStorage
 */
function saveData(data) {
    localStorage.setItem(DreamFund.storageKey, JSON.stringify(data));
}

/**
 * Generate unique ID
 */
function generateId() {
    return 'df_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Add days to date
 */
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

// ============================================
// Format Utilities
// ============================================

/**
 * Format currency to Indonesian Rupiah
 */
function formatCurrency(amount) {
    if (amount === null || amount === undefined || isNaN(amount)) return 'Rp 0';
    return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

/**
 * Format currency short (e.g., 1.2jt, 450rb)
 */
function formatCurrencyShort(amount) {
    if (amount >= 1000000000) return (amount / 1000000000).toFixed(1) + 'M';
    if (amount >= 1000000) return (amount / 1000000).toFixed(1) + 'jt';
    if (amount >= 1000) return (amount / 1000).toFixed(0) + 'rb';
    return amount.toString();
}

/**
 * Format date to Indonesian format
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
}

/**
 * Format date short (e.g., 24 Jul 2026)
 */
function formatDateShort(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Format relative time (e.g., 2 hari yang lalu)
 */
function formatRelativeTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return 'Baru saja';
    if (diffMin < 60) return `${diffMin} menit yang lalu`;
    if (diffHour < 24) return `${diffHour} jam yang lalu`;
    if (diffDay < 7) return `${diffDay} hari yang lalu`;
    if (diffDay < 30) return `${Math.floor(diffDay / 7)} minggu yang lalu`;
    return formatDateShort(dateString);
}

/**
 * Format percentage
 */
function formatPercent(value, total) {
    if (!total || total === 0) return 0;
    return Math.min(100, Math.round((value / total) * 100));
}

/**
 * Get category label
 */
function getCategoryLabel(category) {
    const labels = {
        'elektronik': 'Elektronik',
        'kendaraan': 'Kendaraan',
        'properti': 'Properti',
        'travel': 'Travel',
        'pendidikan': 'Pendidikan',
        'kesehatan': 'Kesehatan',
        'bisnis': 'Bisnis',
        'pernikahan': 'Pernikahan',
        'darurat': 'Dana Darurat',
        'lainnya': 'Lainnya'
    };
    return labels[category] || category;
}

/**
 * Get category icon
 */
function getCategoryIcon(category) {
    const icons = {
        'elektronik': 'fa-laptop',
        'kendaraan': 'fa-car',
        'properti': 'fa-home',
        'travel': 'fa-plane',
        'pendidikan': 'fa-graduation-cap',
        'kesehatan': 'fa-heartbeat',
        'bisnis': 'fa-briefcase',
        'pernikahan': 'fa-ring',
        'darurat': 'fa-shield-alt',
        'lainnya': 'fa-box'
    };
    return icons[category] || 'fa-tag';
}

/**
 * Get category color
 */
function getCategoryColor(category) {
    const colors = {
        'elektronik': '#2563EB',
        'kendaraan': '#F59E0B',
        'properti': '#8B5CF6',
        'travel': '#06B6D4',
        'pendidikan': '#22C55E',
        'kesehatan': '#EF4444',
        'bisnis': '#F97316',
        'pernikahan': '#EC4899',
        'darurat': '#DC2626',
        'lainnya': '#64748B'
    };
    return colors[category] || '#2563EB';
}

/**
 * Get priority label
 */
function getPriorityLabel(priority) {
    const labels = { 'high': 'Tinggi', 'medium': 'Sedang', 'low': 'Rendah' };
    return labels[priority] || priority;
}

/**
 * Get priority badge class
 */
function getPriorityBadge(priority) {
    const classes = { 'high': 'danger', 'medium': 'warning', 'low': 'info' };
    return classes[priority] || 'secondary';
}

/**
 * Get status label
 */
function getStatusLabel(status) {
    const labels = { 'menabung': 'Menabung', 'tercapai': 'Tercapai', 'dibatalkan': 'Dibatalkan' };
    return labels[status] || status;
}

/**
 * Get status badge class
 */
function getStatusBadge(status) {
    const classes = { 'menabung': 'warning', 'tercapai': 'success', 'dibatalkan': 'danger' };
    return classes[status] || 'secondary';
}

// ============================================
// Theme Management
// ============================================

/**
 * Initialize theme from storage
 */
function initTheme() {
    const savedTheme = localStorage.getItem(DreamFund.themeKey) || 'light';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

/**
 * Toggle between light and dark mode
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem(DreamFund.themeKey, newTheme);
    updateThemeIcon(newTheme);
    
    // Update Chart.js charts if exist
    if (typeof Chart !== 'undefined') {
        Chart.defaults.color = newTheme === 'dark' ? '#94A3B8' : '#64748B';
        Chart.defaults.borderColor = newTheme === 'dark' ? '#334155' : '#E2E8F0';
    }
    
    showToast(`Mode ${newTheme === 'dark' ? 'Gelap' : 'Terang'} diaktifkan`, 'info');
}

/**
 * Update theme toggle icon
 */
function updateThemeIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    
    const icon = btn.querySelector('i');
    if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// ============================================
// Sidebar Management
// ============================================

/**
 * Initialize sidebar state
 */
function initSidebar() {
    const isCollapsed = localStorage.getItem(DreamFund.sidebarKey) === 'true';
    if (isCollapsed) {
        document.body.classList.add('sidebar-collapsed');
    }
}

/**
 * Toggle sidebar collapse
 */
function toggleSidebar() {
    const isCollapsed = document.body.classList.toggle('sidebar-collapsed');
    localStorage.setItem(DreamFund.sidebarKey, isCollapsed);
}

/**
 * Toggle mobile sidebar
 */
function toggleMobileSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('mobile-open');
        overlay.classList.toggle('active');
    }
}

// ============================================
// Toast Notifications
// ============================================

/**
 * Show toast notification
 */
function showToast(message, type = 'info', title = '') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const titles = {
        success: 'Berhasil',
        error: 'Error',
        warning: 'Peringatan',
        info: 'Info'
    };
    
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.innerHTML = `
        <div class="toast-icon ${type}">
            <i class="fas ${icons[type]}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${title || titles[type]}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 400);
        }
    }, 4000);
}

// ============================================
// SweetAlert2 Helpers
// ============================================

/**
 * Show confirmation dialog
 */
function showConfirm(title, text, confirmText = 'Ya', cancelText = 'Batal') {
    return Swal.fire({
        title: title,
        text: text,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        confirmButtonColor: '#2563EB',
        cancelButtonColor: '#64748B',
        background: getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim(),
        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim(),
        customClass: {
            popup: 'rounded-4',
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-secondary'
        }
    });
}

/**
 * Show success dialog
 */
function showSuccess(title, text) {
    return Swal.fire({
        title: title,
        text: text,
        icon: 'success',
        confirmButtonColor: '#2563EB',
        background: getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim(),
        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
    });
}

/**
 * Show error dialog
 */
function showError(title, text) {
    return Swal.fire({
        title: title,
        text: text,
        icon: 'error',
        confirmButtonColor: '#2563EB',
        background: getComputedStyle(document.documentElement).getPropertyValue('--bg-card').trim(),
        color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
    });
}

// ============================================
// Confetti Effect
// ============================================

/**
 * Trigger confetti celebration
 */
function triggerConfetti() {
    const canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const colors = ['#2563EB', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];
    
    // Create particles
    for (let i = 0; i < 150; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20 - 5,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10,
            gravity: 0.3,
            drag: 0.98,
            life: 1
        });
    }
    
    let animationId;
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let alive = false;
        
        particles.forEach(p => {
            if (p.life <= 0) return;
            alive = true;
            
            p.vx *= p.drag;
            p.vy *= p.drag;
            p.vy += p.gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            p.life -= 0.008;
            
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rotation * Math.PI) / 180);
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        });
        
        if (alive) {
            animationId = requestAnimationFrame(animate);
        } else {
            canvas.remove();
        }
    }
    
    animate();
    
    // Cleanup after 4 seconds
    setTimeout(() => {
        cancelAnimationFrame(animationId);
        const c = document.getElementById('confetti-canvas');
        if (c) c.remove();
    }, 4000);
}

// ============================================
// Animated Counter
// ============================================

/**
 * Animate number counting
 */
function animateCounter(element, target, duration = 2000, prefix = '', suffix = '') {
    if (!element) return;
    
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (target - start) * easeProgress);
        
        element.textContent = prefix + current.toLocaleString('id-ID') + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

/**
 * Initialize animated counters on page
 */
function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count);
                const suffix = el.dataset.suffix || '';
                animateCounter(el, target, 2000, '', suffix);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

// ============================================
// Quote Generator
// ============================================

/**
 * Get random motivational quote
 */
function getRandomQuote() {
    const quotes = DreamFund.quotes;
    return quotes[Math.floor(Math.random() * quotes.length)];
}

/**
 * Display quote in element
 */
function displayQuote(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const quote = getRandomQuote();
    element.innerHTML = `
        <div class="quote-text">"${quote.text}"</div>
        <div class="quote-author">— ${quote.author}</div>
    `;
}

// ============================================
// Achievement System
// ============================================

/**
 * Check and award achievements
 */
function checkAchievements() {
    const data = getData();
    const newAchievements = [];
    
    // First target
    if (data.targets.length >= 1 && !hasAchievement('first_target')) {
        newAchievements.push('first_target');
    }
    
    // Five targets
    if (data.targets.length >= 5 && !hasAchievement('five_targets')) {
        newAchievements.push('five_targets');
    }
    
    // First saving
    const hasSaving = data.history.some(h => h.type === 'saving');
    if (hasSaving && !hasAchievement('first_saving')) {
        newAchievements.push('first_saving');
    }
    
    // Halfway hero
    const halfwayTarget = data.targets.find(t => !t.completed && t.currentAmount >= t.targetAmount * 0.5);
    if (halfwayTarget && !hasAchievement('halfway')) {
        newAchievements.push('halfway');
    }
    
    // Completed target
    const completedTarget = data.targets.find(t => t.completed);
    if (completedTarget && !hasAchievement('completed')) {
        newAchievements.push('completed');
    }
    
    // Million saver
    const totalSavings = data.targets.reduce((sum, t) => sum + t.currentAmount, 0);
    if (totalSavings >= 1000000 && !hasAchievement('millionaire')) {
        newAchievements.push('millionaire');
    }
    
    // Ten million
    if (totalSavings >= 10000000 && !hasAchievement('ten_million')) {
        newAchievements.push('ten_million');
    }
    
    // Wishlist achievements
    if (data.wishlists.length >= 5 && !hasAchievement('wishlist_5')) {
        newAchievements.push('wishlist_5');
    }
    
    const completedWishlist = data.wishlists.find(w => w.status === 'tercapai');
    if (completedWishlist && !hasAchievement('wishlist_complete')) {
        newAchievements.push('wishlist_complete');
    }
    
    // Award new achievements
    newAchievements.forEach(achievementId => {
        data.achievements.push({
            id: achievementId,
            earnedAt: new Date().toISOString()
        });
        
        const achievement = DreamFund.achievementsList.find(a => a.id === achievementId);
        if (achievement) {
            showToast(`Achievement unlocked: ${achievement.name}!`, 'success', '🏆');
        }
    });
    
    if (newAchievements.length > 0) {
        saveData(data);
    }
    
    return newAchievements;
}

/**
 * Check if user has achievement
 */
function hasAchievement(achievementId) {
    const data = getData();
    return data.achievements.some(a => a.id === achievementId);
}

/**
 * Get achievement details
 */
function getAchievementDetails(achievementId) {
    return DreamFund.achievementsList.find(a => a.id === achievementId);
}

// ============================================
// History Management
// ============================================

/**
 * Add history entry
 */
function addHistory(type, targetId, targetName, amount, note = '') {
    const data = getData();
    
    data.history.unshift({
        id: generateId(),
        type,
        targetId,
        targetName,
        amount,
        note,
        date: new Date().toISOString()
    });
    
    // Keep only last 500 entries
    if (data.history.length > 500) {
        data.history = data.history.slice(0, 500);
    }
    
    saveData(data);
}

// ============================================
// Data Export/Import
// ============================================

/**
 * Export data to JSON file
 */
function exportData() {
    const data = getData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `dreamfund_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Data berhasil diexport!', 'success');
}

/**
 * Import data from JSON file
 */
function importData(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate data structure
                if (!data.targets || !data.wishlists || !data.history) {
                    reject(new Error('Format file tidak valid'));
                    return;
                }
                
                saveData(data);
                resolve(data);
            } catch (err) {
                reject(new Error('Gagal membaca file'));
            }
        };
        
        reader.onerror = () => reject(new Error('Gagal membaca file'));
        reader.readAsText(file);
    });
}

/**
 * Reset all data
 */
function resetData() {
    localStorage.removeItem(DreamFund.storageKey);
    localStorage.removeItem(DreamFund.themeKey);
    localStorage.removeItem(DreamFund.sidebarKey);
    initStorage();
}

// ============================================
// Loading Screen
// ============================================

/**
 * Hide loading screen
 */
function hideLoadingScreen() {
    const loader = document.getElementById('loading-screen');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
            setTimeout(() => loader.remove(), 500);
        }, 1500);
    }
}

// ============================================
// Navbar Scroll Effect
// ============================================

/**
 * Initialize navbar scroll effect
 */
function initNavbarScroll() {
    const navbar = document.getElementById('main-navbar');
    if (!navbar) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ============================================
// Dashboard Stats Calculations
// ============================================

/**
 * Get dashboard statistics
 */
function getDashboardStats() {
    const data = getData();
    
    const totalTarget = data.targets.reduce((sum, t) => sum + t.targetAmount, 0);
    const totalSaved = data.targets.reduce((sum, t) => sum + t.currentAmount, 0);
    const activeTargets = data.targets.filter(t => !t.completed).length;
    const completedTargets = data.targets.filter(t => t.completed).length;
    const totalWishlists = data.wishlists.length;
    const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
    
    return {
        totalTarget,
        totalSaved,
        activeTargets,
        completedTargets,
        totalWishlists,
        overallProgress,
        totalTransactions: data.history.filter(h => h.type === 'saving').length
    };
}

// ============================================
// DOM Ready Initialization
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize storage
    initStorage();
    
    // Initialize theme
    initTheme();
    
    // Initialize sidebar (dashboard pages)
    initSidebar();
    
    // Initialize navbar scroll
    initNavbarScroll();
    
    // Initialize counters (landing page)
    initCounters();
    
    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            offset: 100
        });
    }
    
    // Hide loading screen
    hideLoadingScreen();
    
    // Check achievements
    checkAchievements();
    
    // Theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Sidebar toggle button
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Mobile sidebar toggle
    const mobileToggle = document.getElementById('mobile-sidebar-toggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleMobileSidebar);
    }
    
    // Close mobile sidebar on overlay click
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
        overlay.addEventListener('click', toggleMobileSidebar);
    }
    
    // Initialize Chart.js defaults
    if (typeof Chart !== 'undefined') {
        const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
        Chart.defaults.font.family = "'Poppins', sans-serif";
        Chart.defaults.color = isDark ? '#94A3B8' : '#64748B';
        Chart.defaults.borderColor = isDark ? '#334155' : '#E2E8F0';
    }
});
