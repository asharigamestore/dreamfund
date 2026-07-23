/* ============================================
   DreamFund - Wishlist Page JavaScript
   Wishlist management functionality
   ============================================ */

// ============================================
// Global Variables
// ============================================
let addWishlistModal = null;
let editWishlistModal = null;
let currentWishlists = [];
let editingWishlistId = null;

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap modals
    addWishlistModal = new bootstrap.Modal(document.getElementById('addWishlistModal'));
    editWishlistModal = new bootstrap.Modal(document.getElementById('editWishlistModal'));
    
    // Render wishlist page
    renderWishlistPage();
    
    // Setup filters
    setupFilters();
    
    // Setup image preview
    setupImagePreview();
});

// ============================================
// Page Rendering
// ============================================

/**
 * Render entire wishlist page
 */
function renderWishlistPage() {
    const data = getData();
    currentWishlists = [...data.wishlists];
    
    // Update stats
    updateWishlistStats(data.wishlists);
    
    // Render grid
    renderWishlistGrid(data.wishlists);
}

/**
 * Update wishlist statistics
 */
function updateWishlistStats(wishlists) {
    const totalEl = document.getElementById('stat-total-wishlist');
    const priceEl = document.getElementById('stat-total-price');
    const completedEl = document.getElementById('stat-completed');
    const avgDaysEl = document.getElementById('stat-avg-days');
    
    const total = wishlists.length;
    const totalPrice = wishlists.reduce((sum, w) => sum + w.price, 0);
    const completed = wishlists.filter(w => w.status === 'tercapai').length;
    
    // Calculate average days to target
    let avgDays = 0;
    if (wishlists.length > 0) {
        const now = new Date();
        const totalDays = wishlists.reduce((sum, w) => {
            const days = Math.ceil((new Date(w.targetDate) - now) / (1000 * 60 * 60 * 24));
            return sum + Math.max(0, days);
        }, 0);
        avgDays = Math.round(totalDays / wishlists.length);
    }
    
    if (totalEl) totalEl.textContent = total;
    if (priceEl) priceEl.textContent = formatCurrency(totalPrice);
    if (completedEl) completedEl.textContent = completed;
    if (avgDaysEl) avgDaysEl.textContent = avgDays + ' hari';
}

/**
 * Render wishlist grid
 */
function renderWishlistGrid(wishlists) {
    const grid = document.getElementById('wishlist-grid');
    const emptyState = document.getElementById('wishlist-empty');
    
    if (!grid || !emptyState) return;
    
    if (wishlists.length === 0) {
        grid.innerHTML = '';
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    grid.style.display = 'flex';
    emptyState.style.display = 'none';
    
    grid.innerHTML = wishlists.map((item, index) => {
        const categoryColor = getCategoryColor(item.category);
        const daysLeft = Math.ceil((new Date(item.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
        const isOverdue = daysLeft < 0;
        const daysText = isOverdue ? `${Math.abs(daysLeft)} hari lewat` : `${daysLeft} hari lagi`;
        
        // Calculate progress based on linked target or estimated
        const progress = calculateWishlistProgress(item);
        
        // Priority indicator
        const priorityColors = { high: '#EF4444', medium: '#F59E0B', low: '#06B6D4' };
        const priorityColor = priorityColors[item.priority] || '#64748B';
        
        // Status styling
        const statusStyles = {
            menabung: { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', icon: 'fa-piggy-bank' },
            tercapai: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22C55E', icon: 'fa-check-circle' },
            dibatalkan: { bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', icon: 'fa-times-circle' }
        };
        const statusStyle = statusStyles[item.status] || statusStyles.menabung;
        
        // Image placeholder or uploaded image
        const imageHtml = item.image 
            ? `<img src="${item.image}" alt="${item.name}" class="wishlist-card-img">`
            : `<div class="wishlist-card-img-placeholder" style="background: linear-gradient(135deg, ${categoryColor}22, ${categoryColor}11);">
                 <i class="fas ${getCategoryIcon(item.category)}" style="color: ${categoryColor}; font-size: 2.5rem;"></i>
               </div>`;
        
        return `
            <div class="col-sm-6 col-lg-4 col-xl-3" data-aos="fade-up" data-aos-delay="${index * 50}">
                <div class="wishlist-card glass-card h-100 position-relative">
                    <!-- Priority Badge -->
                    <div class="position-absolute top-0 end-0 m-3">
                        <span class="badge rounded-pill" style="background: ${priorityColor}22; color: ${priorityColor}; border: 1px solid ${priorityColor}44;">
                            <i class="fas fa-flag me-1" style="font-size: 0.6rem;"></i>${getPriorityLabel(item.priority)}
                        </span>
                    </div>
                    
                    <!-- Image -->
                    <div class="wishlist-card-image-wrapper">
                        ${imageHtml}
                        <div class="wishlist-card-overlay">
                            <div class="wishlist-card-actions">
                                <button class="btn btn-sm btn-light" onclick="editWishlist('${item.id}')" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-light" onclick="deleteWishlist('${item.id}')" title="Hapus">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Content -->
                    <div class="p-3">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <span class="badge-custom ${getStatusBadge(item.status)} mb-1 d-inline-block">
                                    <i class="fas ${statusStyle.icon} me-1"></i>${getStatusLabel(item.status)}
                                </span>
                                <h6 class="fw-bold mb-0 text-truncate" title="${item.name}">${item.name}</h6>
                            </div>
                        </div>
                        
                        <div class="mb-2">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <span class="small text-muted">Harga Target</span>
                                <span class="fw-bold text-primary">${formatCurrency(item.price)}</span>
                            </div>
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <span class="small text-muted">Kategori</span>
                                <span class="small">
                                    <i class="fas ${getCategoryIcon(item.category)} me-1" style="color: ${categoryColor};"></i>
                                    ${getCategoryLabel(item.category)}
                                </span>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="small text-muted">Target</span>
                                <span class="small ${isOverdue ? 'text-danger' : 'text-muted'}">
                                    <i class="fas fa-calendar-alt me-1"></i>${formatDateShort(item.targetDate)}
                                </span>
                            </div>
                        </div>
                        
                        <!-- Progress Bar -->
                        <div class="mt-3">
                            <div class="d-flex justify-content-between align-items-center mb-1">
                                <span class="small text-muted">Progress</span>
                                <span class="small fw-semibold" style="color: ${categoryColor};">${progress}%</span>
                            </div>
                            <div class="progress-custom">
                                <div class="progress-bar" style="width: ${progress}%; background: linear-gradient(90deg, ${categoryColor}, ${categoryColor}aa);"></div>
                            </div>
                            <div class="d-flex justify-content-between mt-1">
                                <span class="small text-muted">${daysText}</span>
                                <span class="small text-muted">${formatCurrencyShort(item.price * (progress / 100))} / ${formatCurrencyShort(item.price)}</span>
                            </div>
                        </div>
                        
                        <!-- Convert to Target Button -->
                        ${item.status === 'menabung' ? `
                            <button class="btn btn-sm btn-outline-primary w-100 mt-3" onclick="convertToTarget('${item.id}')">
                                <i class="fas fa-bullseye me-1"></i>Jadikan Target Tabungan
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Add custom styles for wishlist cards
    addWishlistCardStyles();
}

/**
 * Add wishlist card custom styles
 */
function addWishlistCardStyles() {
    if (document.getElementById('wishlist-card-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'wishlist-card-styles';
    style.textContent = `
        .wishlist-card {
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .wishlist-card:hover {
            transform: translateY(-6px);
            box-shadow: var(--shadow-lg), var(--shadow-glow);
        }
        
        .wishlist-card-image-wrapper {
            position: relative;
            height: 180px;
            overflow: hidden;
            border-radius: var(--radius) var(--radius) 0 0;
        }
        
        .wishlist-card-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.5s ease;
        }
        
        .wishlist-card:hover .wishlist-card-img {
            transform: scale(1.05);
        }
        
        .wishlist-card-img-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .wishlist-card-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%);
            opacity: 0;
            transition: opacity 0.3s ease;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            padding-bottom: 1rem;
        }
        
        .wishlist-card:hover .wishlist-card-overlay {
            opacity: 1;
        }
        
        .wishlist-card-actions {
            display: flex;
            gap: 0.5rem;
        }
        
        .wishlist-card-actions .btn {
            width: 36px;
            height: 36px;
            border-radius: var(--radius);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            backdrop-filter: blur(10px);
        }
    `;
    document.head.appendChild(style);
}

/**
 * Calculate wishlist progress based on linked savings targets
 */
function calculateWishlistProgress(wishlist) {
    const data = getData();
    
    // Find if there's a target with similar name
    const linkedTarget = data.targets.find(t => 
        !t.completed && 
        (t.name.toLowerCase().includes(wishlist.name.toLowerCase()) || 
         wishlist.name.toLowerCase().includes(t.name.toLowerCase()))
    );
    
    if (linkedTarget) {
        return formatPercent(linkedTarget.currentAmount, linkedTarget.targetAmount);
    }
    
    // Default: show based on time elapsed
    const now = new Date();
    const created = new Date(wishlist.createdAt);
    const target = new Date(wishlist.targetDate);
    const totalDuration = target - created;
    const elapsed = now - created;
    
    if (totalDuration <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
}

// ============================================
// Modal Functions
// ============================================

/**
 * Open add wishlist modal
 */
function openAddWishlistModal() {
    if (addWishlistModal) addWishlistModal.show();
}

/**
 * Setup image preview
 */
function setupImagePreview() {
    const input = document.getElementById('wishlist-image-input');
    const preview = document.getElementById('image-preview');
    const previewImg = preview ? preview.querySelector('img') : null;
    
    if (!input || !preview || !previewImg) return;
    
    input.addEventListener('change', function() {
        const file = this.files[0];
        if (!file) {
            preview.style.display = 'none';
            return;
        }
        
        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            showToast('Ukuran file maksimal 2MB', 'warning');
            this.value = '';
            preview.style.display = 'none';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Submit add wishlist form
 */
function submitAddWishlist() {
    const form = document.getElementById('add-wishlist-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const formData = new FormData(form);
    const data = getData();
    
    // Handle image
    let imageData = null;
    const imageInput = document.getElementById('wishlist-image-input');
    if (imageInput && imageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imageData = e.target.result;
            finishAddWishlist(formData, imageData);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        finishAddWishlist(formData, null);
    }
}

/**
 * Finish adding wishlist after image processing
 */
function finishAddWishlist(formData, imageData) {
    const data = getData();
    
    const newWishlist = {
        id: generateId(),
        name: formData.get('name'),
        price: parseInt(formData.get('price')),
        category: formData.get('category'),
        targetDate: formData.get('targetDate'),
        image: imageData,
        status: 'menabung',
        priority: formData.get('priority'),
        note: formData.get('note') || '',
        createdAt: new Date().toISOString()
    };
    
    data.wishlists.push(newWishlist);
    saveData(data);
    
    // Add history
    addHistory('wishlist', null, newWishlist.name, 0, 'Wishlist baru ditambahkan');
    
    // Check achievements
    checkAchievements();
    
    // Close modal and reset
    addWishlistModal.hide();
    document.getElementById('add-wishlist-form').reset();
    
    const preview = document.getElementById('image-preview');
    if (preview) preview.style.display = 'none';
    
    // Refresh
    currentWishlists = [...data.wishlists];
    renderWishlistPage();
    
    showToast('Wishlist berhasil ditambahkan!', 'success');
}

/**
 * Edit wishlist
 */
function editWishlist(wishlistId) {
    const data = getData();
    const wishlist = data.wishlists.find(w => w.id === wishlistId);
    if (!wishlist) return;
    
    editingWishlistId = wishlistId;
    
    // Fill form
    document.getElementById('edit-wishlist-id').value = wishlist.id;
    document.getElementById('edit-wishlist-name').value = wishlist.name;
    document.getElementById('edit-wishlist-price').value = wishlist.price;
    document.getElementById('edit-wishlist-category').value = wishlist.category;
    document.getElementById('edit-wishlist-date').value = wishlist.targetDate;
    document.getElementById('edit-wishlist-priority').value = wishlist.priority;
    document.getElementById('edit-wishlist-status').value = wishlist.status;
    
    if (editWishlistModal) editWishlistModal.show();
}

/**
 * Submit edit wishlist form
 */
function submitEditWishlist() {
    const form = document.getElementById('edit-wishlist-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const data = getData();
    const wishlist = data.wishlists.find(w => w.id === editingWishlistId);
    if (!wishlist) return;
    
    const formData = new FormData(form);
    const oldStatus = wishlist.status;
    
    wishlist.name = formData.get('name');
    wishlist.price = parseInt(formData.get('price'));
    wishlist.category = formData.get('category');
    wishlist.targetDate = formData.get('targetDate');
    wishlist.priority = formData.get('priority');
    wishlist.status = formData.get('status');
    
    // If status changed to completed
    if (oldStatus !== 'tercapai' && wishlist.status === 'tercapai') {
        triggerConfetti();
        addHistory('wishlist', null, wishlist.name, wishlist.price, 'Wishlist tercapai! Selamat!');
        showToast(`🎉 Wishlist "${wishlist.name}" telah tercapai!`, 'success');
    }
    
    saveData(data);
    checkAchievements();
    
    editWishlistModal.hide();
    editingWishlistId = null;
    
    // Refresh
    currentWishlists = [...data.wishlists];
    applyFilters();
    
    showToast('Wishlist berhasil diperbarui!', 'success');
}

/**
 * Delete wishlist
 */
function deleteWishlist(wishlistId) {
    showConfirm('Hapus Wishlist?', 'Wishlist yang dihapus tidak dapat dikembalikan.').then(result => {
        if (result.isConfirmed) {
            const data = getData();
            const wishlist = data.wishlists.find(w => w.id === wishlistId);
            
            data.wishlists = data.wishlists.filter(w => w.id !== wishlistId);
            saveData(data);
            
            if (wishlist) {
                addHistory('delete', null, wishlist.name, wishlist.price, 'Wishlist dihapus');
            }
            
            currentWishlists = [...data.wishlists];
            renderWishlistPage();
            
            showToast('Wishlist berhasil dihapus', 'success');
        }
    });
}

/**
 * Convert wishlist to savings target
 */
function convertToTarget(wishlistId) {
    const data = getData();
    const wishlist = data.wishlists.find(w => w.id === wishlistId);
    if (!wishlist) return;
    
    showConfirm('Jadikan Target Tabungan?', 
        `Buat target tabungan untuk "${wishlist.name}" sebesar ${formatCurrency(wishlist.price)}?`
    ).then(result => {
        if (result.isConfirmed) {
            const newTarget = {
                id: generateId(),
                name: wishlist.name,
                targetAmount: wishlist.price,
                currentAmount: 0,
                category: wishlist.category,
                deadline: wishlist.targetDate,
                description: wishlist.note || `Dikonversi dari wishlist`,
                createdAt: new Date().toISOString(),
                completed: false,
                color: getCategoryColor(wishlist.category)
            };
            
            data.targets.push(newTarget);
            saveData(data);
            
            addHistory('created', newTarget.id, newTarget.name, 0, 'Dibuat dari wishlist');
            checkAchievements();
            
            renderWishlistPage();
            
            showToast(`Target tabungan "${wishlist.name}" berhasil dibuat!`, 'success');
        }
    });
}

// ============================================
// Filter & Sort
// ============================================

/**
 * Setup filter event listeners
 */
function setupFilters() {
    const searchInput = document.getElementById('filter-search');
    const categorySelect = document.getElementById('filter-category');
    const statusSelect = document.getElementById('filter-status');
    const sortSelect = document.getElementById('filter-sort');
    
    [searchInput, categorySelect, statusSelect, sortSelect].forEach(el => {
        if (el) {
            el.addEventListener('input', applyFilters);
            el.addEventListener('change', applyFilters);
        }
    });
}

/**
 * Apply filters and sort
 */
function applyFilters() {
    const searchInput = document.getElementById('filter-search');
    const categorySelect = document.getElementById('filter-category');
    const statusSelect = document.getElementById('filter-status');
    const sortSelect = document.getElementById('filter-sort');
    
    const search = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const category = categorySelect ? categorySelect.value : '';
    const status = statusSelect ? statusSelect.value : '';
    const sort = sortSelect ? sortSelect.value : 'newest';
    
    let filtered = [...currentWishlists];
    
    // Search filter
    if (search) {
        filtered = filtered.filter(w => 
            w.name.toLowerCase().includes(search) ||
            w.note.toLowerCase().includes(search)
        );
    }
    
    // Category filter
    if (category) {
        filtered = filtered.filter(w => w.category === category);
    }
    
    // Status filter
    if (status) {
        filtered = filtered.filter(w => w.status === status);
    }
    
    // Sort
    filtered.sort((a, b) => {
        switch (sort) {
            case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'price-high':
                return b.price - a.price;
            case 'price-low':
                return a.price - b.price;
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            default:
                return 0;
        }
    });
    
    renderWishlistGrid(filtered);
    updateWishlistStats(filtered);
}
