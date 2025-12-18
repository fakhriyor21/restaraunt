// Profile Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAuth();
    
    // Initialize profile
    initProfile();
    
    // Event listeners
    setupEventListeners();
    
    // Load profile data
    loadProfileData();
    loadUserOrders();
    loadUserAddresses();
    loadWishlist();
    loadNotificationSettings();
});

// Check authentication
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        // Redirect to login
        window.location.href = 'index.html';
    }
}

// Initialize profile
function initProfile() {
    // Setup sidebar navigation
    setupProfileNavigation();
    
    // Load user data
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        updateProfileHeader(currentUser);
        updateProfileInfo(currentUser);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
    
    // Edit profile form
    document.getElementById('editProfileForm')?.addEventListener('submit', updateProfile);
    
    // Change password form
    document.getElementById('changePasswordForm')?.addEventListener('submit', changePassword);
    
    // Notification settings form
    document.getElementById('notificationSettingsForm')?.addEventListener('submit', saveNotificationSettings);
    
    // Add address form
    document.getElementById('addAddressForm')?.addEventListener('submit', addAddress);
    
    // Avatar selection
    document.querySelectorAll('.avatar-option').forEach(option => {
        option.addEventListener('click', function() {
            const avatarUrl = this.getAttribute('src');
            document.getElementById('avatarPreview').src = avatarUrl;
            
            // Mark as selected
            document.querySelectorAll('.avatar-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
        });
    });
    
    // Save avatar button
    document.getElementById('saveAvatarBtn')?.addEventListener('click', saveAvatar);
    
    // Order filter buttons
    document.querySelectorAll('[data-filter]').forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            filterUserOrders(filter);
            
            // Update active button
            document.querySelectorAll('[data-filter]').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
}

// Setup profile navigation
function setupProfileNavigation() {
    const navLinks = document.querySelectorAll('.profile-menu .nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get section id from href
            const sectionId = this.getAttribute('href').substring(1);
            
            // Update active link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show section
            showProfileSection(sectionId);
        });
    });
}

// Show specific profile section
function showProfileSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.profile-section').forEach(section => {
        section.classList.add('d-none');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('d-none');
    }
}

// Update profile header - BU FUNKSIYANI TO'G'RILAYMIZ
function updateProfileHeader(user) {
    document.getElementById('userFullName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('userEmail').textContent = user.email;
    
    // Update stats
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Foydalanuvchi buyurtmalarini filtrlash
    const userOrders = orders.filter(order => {
        // userId bilan solishtirish
        if (order.userId && order.userId === user.id) {
            return true;
        }
        // customerName orqali solishtirish (eski buyurtmalar uchun)
        if (order.customerName && order.customerName.includes(user.firstName)) {
            return true;
        }
        // customerPhone orqali solishtirish
        if (order.customerPhone && user.phone && 
            order.customerPhone.includes(user.phone.replace('+998', ''))) {
            return true;
        }
        return false;
    });
    
    document.getElementById('totalOrdersCount').textContent = userOrders.length;
    
    // Calculate total spent
    const totalSpent = userOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    document.getElementById('totalSpent').textContent = formatCurrency(totalSpent);
    
    // Calculate loyalty points (100 points per 10,000 UZS)
    const loyaltyPoints = Math.floor(totalSpent / 10000) * 100;
    document.getElementById('loyaltyPoints').textContent = loyaltyPoints.toLocaleString();
    
    // Member since
    if (user.registrationDate) {
        const joinYear = new Date(user.registrationDate).getFullYear();
        document.getElementById('memberSince').textContent = joinYear;
    }
}

// Update profile info
function updateProfileInfo(user) {
    document.getElementById('profileFirstName').textContent = user.firstName || '-';
    document.getElementById('profileLastName').textContent = user.lastName || '-';
    document.getElementById('profileEmail').textContent = user.email || '-';
    document.getElementById('profilePhone').textContent = user.phone || '-';
    document.getElementById('profileAddress').textContent = user.address || '-';
    
    // Format dates
    if (user.registrationDate) {
        const joinDate = new Date(user.registrationDate);
        document.getElementById('profileJoinDate').textContent = joinDate.toLocaleDateString('uz-UZ');
    } else {
        document.getElementById('profileJoinDate').textContent = '-';
    }
    
    // Last login (for demo, use current time)
    document.getElementById('profileLastLogin').textContent = new Date().toLocaleDateString('uz-UZ');
    
    // Populate edit form
    document.getElementById('editFirstName').value = user.firstName || '';
    document.getElementById('editLastName').value = user.lastName || '';
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editPhone').value = user.phone || '';
    document.getElementById('editAddress').value = user.address || '';
}

// Load profile data
function loadProfileData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        updateProfileHeader(currentUser);
        updateProfileInfo(currentUser);
    }
}

// Load user orders - BU FUNKSIYANI HAM TO'G'RILAYMIZ
function loadUserOrders() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Filter user orders - xuddi updateProfileHeader dagi kabi
    const userOrders = orders.filter(order => {
        if (order.userId && order.userId === currentUser.id) {
            return true;
        }
        if (order.customerName && order.customerName.includes(currentUser.firstName)) {
            return true;
        }
        if (order.customerPhone && currentUser.phone && 
            order.customerPhone.includes(currentUser.phone.replace('+998', ''))) {
            return true;
        }
        return false;
    });
    
    const container = document.getElementById('userOrdersList');
    if (!container) return;
    
    if (userOrders.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Hali buyurtmalaringiz yo'q</h5>
                <p class="text-muted">Birinchi buyurtmangizni berish uchun taom tanlang</p>
                <a href="index.html#categories" class="btn btn-primary">Buyurtma berish</a>
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first)
    userOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    let html = '';
    userOrders.forEach(order => {
        const orderDate = new Date(order.orderDate);
        const formattedDate = orderDate.toLocaleDateString('uz-UZ');
        const formattedTime = orderDate.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
        
        // Calculate item count
        const itemCount = order.items ? 
            order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
        
        html += `
            <div class="order-card" data-status="${order.status || 'pending'}">
                <div class="row align-items-center">
                    <div class="col-md-2">
                        <div class="order-id">
                            <strong>#${order.id || 'N/A'}</strong>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="order-date">
                            <small class="text-muted">Sana:</small>
                            <div>${formattedDate} ${formattedTime}</div>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <div class="order-items">
                            <small class="text-muted">Mahsulotlar:</small>
                            <div>${itemCount} ta</div>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <div class="order-total">
                            <small class="text-muted">Summa:</small>
                            <div class="fw-bold">${formatCurrency(order.totalAmount || 0)}</div>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <div class="order-status">
                            <span class="badge ${getStatusBadgeClass(order.status)}">
                                ${getStatusText(order.status)}
                            </span>
                        </div>
                    </div>
                    <div class="col-md-1">
                        <button class="btn btn-sm btn-outline-primary" onclick="viewUserOrder(${order.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Load user addresses
function loadUserAddresses() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const addresses = JSON.parse(localStorage.getItem('addresses')) || [];
    
    // Filter user addresses
    const userAddresses = currentUser ? 
        addresses.filter(addr => addr.userId === currentUser.id) : 
        [];
    
    const container = document.getElementById('addressesList');
    if (!container) return;
    
    if (userAddresses.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    Hali manzil qo'shmagansiz. Birinchi manzilingizni qo'shing.
                </div>
            </div>
        `;
        return;
    }
    
    let html = '';
    userAddresses.forEach(address => {
        html += `
            <div class="col-md-6">
                <div class="address-card ${address.isDefault ? 'default' : ''}">
                    ${address.isDefault ? '<span class="default-badge">Asosiy</span>' : ''}
                    <h6>${address.title}</h6>
                    <p class="mb-2">${address.fullAddress}</p>
                    ${address.phone ? `<p class="text-muted"><small>${address.phone}</small></p>` : ''}
                    <div class="mt-3">
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="editAddress(${address.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteAddress(${address.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                        ${!address.isDefault ? `
                            <button class="btn btn-sm btn-outline-success ms-2" onclick="setDefaultAddress(${address.id})">
                                Asosiy qilish
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Load wishlist
function loadWishlist() {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Filter user wishlist
    const userWishlist = currentUser ? 
        wishlist.filter(item => item.userId === currentUser.id) : 
        [];
    
    const container = document.getElementById('wishlistItems');
    if (!container) return;
    
    if (userWishlist.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-heart fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Sevimlilar ro'yxatingiz bo'sh</h5>
                <p class="text-muted">Taomlarga ♡ belgisini bosing va ular bu yerda saqlanadi</p>
                <a href="index.html#categories" class="btn btn-primary">Taomlarni ko'rish</a>
            </div>
        `;
        return;
    }
    
    let html = '';
    userWishlist.forEach(item => {
        html += `
            <div class="col-md-4">
                <div class="wishlist-item">
                    <img src="${item.image || 'https://via.placeholder.com/300x200'}" 
                         alt="${item.name}" 
                         class="wishlist-img">
                    <div class="p-3">
                        <h6>${item.name}</h6>
                        <p class="text-muted small mb-2">${item.category || ''}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="text-primary fw-bold">${formatCurrency(item.price)}</span>
                            <div>
                                <button class="btn btn-sm btn-outline-primary me-1" onclick="addToCartFromWishlist(${item.foodId})">
                                    <i class="fas fa-cart-plus"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="removeFromWishlist(${item.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Load notification settings
function loadNotificationSettings() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const notificationSettings = JSON.parse(localStorage.getItem('notificationSettings')) || {};
    
    const userSettings = notificationSettings[currentUser?.id] || {
        emailNotifications: true,
        smsNotifications: false,
        orderUpdates: true,
        promotionalEmails: true,
        newsletter: true
    };
    
    // Update form
    document.getElementById('emailNotifications').checked = userSettings.emailNotifications;
    document.getElementById('smsNotifications').checked = userSettings.smsNotifications;
    document.getElementById('orderUpdates').checked = userSettings.orderUpdates;
    document.getElementById('promotionalEmails').checked = userSettings.promotionalEmails;
    document.getElementById('newsletter').checked = userSettings.newsletter;
}

// Update profile
function updateProfile(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('editFirstName').value;
    const lastName = document.getElementById('editLastName').value;
    const email = document.getElementById('editEmail').value;
    const phone = document.getElementById('editPhone').value;
    const address = document.getElementById('editAddress').value;
    
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Update user data
    currentUser.firstName = firstName;
    currentUser.lastName = lastName;
    currentUser.email = email;
    currentUser.phone = phone;
    currentUser.address = address;
    
    // Update in users array
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Save current user
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update UI
    updateProfileHeader(currentUser);
    updateProfileInfo(currentUser);
    
    // Show success message
    showAlert('Profil muvaffaqiyatli yangilandi', 'success');
    
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('editProfileModal')).hide();
}

// Change password
function changePassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    // Validation
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        showAlert('Barcha maydonlarni to\'ldiring', 'danger');
        return;
    }
    
    if (newPassword.length < 8) {
        showAlert('Parol kamida 8 ta belgidan iborat bo\'lishi kerak', 'danger');
        return;
    }
    
    if (newPassword !== confirmNewPassword) {
        showAlert('Yangi parollar mos kelmayapti', 'danger');
        return;
    }
    
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Verify current password
    if (currentUser.password !== currentPassword) {
        showAlert('Joriy parol noto\'g\'ri', 'danger');
        return;
    }
    
    // Update password
    currentUser.password = newPassword;
    
    // Update in users array
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Save current user
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Show success message
    showAlert('Parol muvaffaqiyatli yangilandi', 'success');
    
    // Reset form
    e.target.reset();
}

// Save notification settings
function saveNotificationSettings(e) {
    e.preventDefault();
    
    const emailNotifications = document.getElementById('emailNotifications').checked;
    const smsNotifications = document.getElementById('smsNotifications').checked;
    const orderUpdates = document.getElementById('orderUpdates').checked;
    const promotionalEmails = document.getElementById('promotionalEmails').checked;
    const newsletter = document.getElementById('newsletter').checked;
    
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Get notification settings
    const notificationSettings = JSON.parse(localStorage.getItem('notificationSettings')) || {};
    
    // Update user settings
    notificationSettings[currentUser.id] = {
        emailNotifications,
        smsNotifications,
        orderUpdates,
        promotionalEmails,
        newsletter
    };
    
    // Save to localStorage
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings));
    
    // Show success message
    showAlert('Bildirishnoma sozlamalari saqlandi', 'success');
}

// Add address
function addAddress(e) {
    e.preventDefault();
    
    const title = document.getElementById('addressTitle').value;
    const fullAddress = document.getElementById('addressFull').value;
    const phone = document.getElementById('addressPhone').value;
    const setAsDefault = document.getElementById('setAsDefault').checked;
    
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Get addresses
    const addresses = JSON.parse(localStorage.getItem('addresses')) || [];
    
    // If setting as default, remove default from other addresses
    if (setAsDefault) {
        addresses.forEach(addr => {
            if (addr.userId === currentUser.id) {
                addr.isDefault = false;
            }
        });
    }
    
    // Create new address
    const newAddress = {
        id: addresses.length > 0 ? Math.max(...addresses.map(a => a.id)) + 1 : 1,
        userId: currentUser.id,
        title,
        fullAddress,
        phone,
        isDefault: setAsDefault || addresses.filter(a => a.userId === currentUser.id).length === 0
    };
    
    // Add to addresses array
    addresses.push(newAddress);
    
    // Save to localStorage
    localStorage.setItem('addresses', JSON.stringify(addresses));
    
    // Show success message
    showAlert('Yangi manzil qo\'shildi', 'success');
    
    // Close modal and reset form
    bootstrap.Modal.getInstance(document.getElementById('addAddressModal')).hide();
    e.target.reset();
    
    // Reload addresses
    loadUserAddresses();
}

// Save avatar
function saveAvatar() {
    const avatarPreview = document.getElementById('avatarPreview').src;
    
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    // Update avatar
    currentUser.avatar = avatarPreview;
    
    // Update in users array
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
        users[userIndex] = currentUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Save current user
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update avatar in header
    document.querySelector('.avatar-img').src = avatarPreview;
    
    // Show success message
    showAlert('Avatar muvaffaqiyatli yangilandi', 'success');
    
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('avatarModal')).hide();
}

// Filter user orders
function filterUserOrders(filter) {
    const orderCards = document.querySelectorAll('.order-card');
    
    orderCards.forEach(card => {
        if (filter === 'all') {
            card.style.display = '';
        } else {
            const status = card.getAttribute('data-status');
            
            if (status === filter) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

// View user order details
function viewUserOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        showAlert('Buyurtma topilmadi', 'warning');
        return;
    }
    
    // Create modal HTML
    let html = `
        <div class="modal fade" id="orderDetailModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Buyurtma #${order.id}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <h6>Buyurtma ma'lumotlari</h6>
                                <table class="table table-sm">
                                    <tr>
                                        <td><strong>Sana:</strong></td>
                                        <td>${new Date(order.orderDate).toLocaleString('uz-UZ')}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Holat:</strong></td>
                                        <td><span class="badge ${getStatusBadgeClass(order.status)}">${getStatusText(order.status)}</span></td>
                                    </tr>
                                    <tr>
                                        <td><strong>To'lov usuli:</strong></td>
                                        <td>${order.paymentMethod || 'Naqd'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>To'lov holati:</strong></td>
                                        <td><span class="badge ${order.paymentStatus === 'paid' ? 'bg-success' : 'bg-warning'}">${order.paymentStatus === 'paid' ? 'To\'langan' : 'Kutilmoqda'}</span></td>
                                    </tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <h6>Yetkazib berish</h6>
                                <table class="table table-sm">
                                    <tr>
                                        <td><strong>Manzil:</strong></td>
                                        <td>${order.deliveryAddress || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Yetkazib berish narxi:</strong></td>
                                        <td>${formatCurrency(order.deliveryFee || 15000)}</td>
                                    </tr>
                                </table>
                            </div>
                        </div>
    `;
    
    // Add order items
    if (order.items && order.items.length > 0) {
        html += `
            <h6>Mahsulotlar</h6>
            <table class="table">
                <thead>
                    <tr>
                        <th>Taom</th>
                        <th>Miqdor</th>
                        <th>Narxi</th>
                        <th>Jami</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        order.items.forEach(item => {
            html += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${formatCurrency(item.price)}</td>
                    <td>${formatCurrency(item.price * item.quantity)}</td>
                </tr>
            `;
        });
        
        html += `
                </tbody>
            </table>
        `;
    }
    
    // Add totals
    html += `
        <div class="text-end mt-4">
            <table class="table table-borderless w-auto ms-auto">
                <tr>
                    <td class="text-end"><strong>Mahsulotlar:</strong></td>
                    <td class="text-end">${formatCurrency(order.subtotal || order.totalAmount - (order.deliveryFee || 15000))}</td>
                </tr>
                <tr>
                    <td class="text-end"><strong>Yetkazib berish:</strong></td>
                    <td class="text-end">${formatCurrency(order.deliveryFee || 15000)}</td>
                </tr>
                <tr>
                    <td class="text-end"><strong>Umumiy:</strong></td>
                    <td class="text-end fw-bold fs-5">${formatCurrency(order.totalAmount || 0)}</td>
                </tr>
            </table>
        </div>
    `;
    
    html += `
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Yopish</button>
                        ${order.status === 'delivered' ? `
                            <button type="button" class="btn btn-primary" onclick="rateOrder(${order.id})">
                                <i class="fas fa-star me-1"></i>Baho qo'yish
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = html;
    document.body.appendChild(modalContainer);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
    modal.show();
    
    // Remove modal from DOM after hiding
    document.getElementById('orderDetailModal').addEventListener('hidden.bs.modal', function() {
        modalContainer.remove();
    });
}

// Edit address (placeholder)
function editAddress(addressId) {
    showAlert('Tahrirlash funksiyasi ishlab chiqilmoqda', 'info');
}

// Delete address
function deleteAddress(addressId) {
    if (confirm('Bu manzilni o\'chirishni istaysizmi?')) {
        const addresses = JSON.parse(localStorage.getItem('addresses')) || [];
        const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
        
        localStorage.setItem('addresses', JSON.stringify(updatedAddresses));
        showAlert('Manzil o\'chirildi', 'success');
        loadUserAddresses();
    }
}

// Set default address
function setDefaultAddress(addressId) {
    const addresses = JSON.parse(localStorage.getItem('addresses')) || [];
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) return;
    
    // Remove default from all user addresses
    addresses.forEach(addr => {
        if (addr.userId === currentUser.id) {
            addr.isDefault = false;
        }
    });
    
    // Set new default
    const addressIndex = addresses.findIndex(addr => addr.id === addressId);
    if (addressIndex !== -1) {
        addresses[addressIndex].isDefault = true;
    }
    
    localStorage.setItem('addresses', JSON.stringify(addresses));
    showAlert('Asosiy manzil yangilandi', 'success');
    loadUserAddresses();
}

// Add to cart from wishlist
function addToCartFromWishlist(foodId) {
    // Similar to addToCart function in main.js
    showAlert('Savatchaga qo\'shildi', 'success');
}

// Remove from wishlist
function removeFromWishlist(itemId) {
    if (confirm('Bu taomni sevimlilar ro\'yxatidan o\'chirishni istaysizmi?')) {
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const updatedWishlist = wishlist.filter(item => item.id !== itemId);
        
        localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
        showAlert('Sevimlilar royxatidan ochirildi', 'success');
        loadWishlist();
    }
}

// Rate order (placeholder)
function rateOrder(orderId) {
    showAlert('Baholash funksiyasi ishlab chiqilmoqda', 'info');
}

// YANGI FUNKSIYA: Demo buyurtmalar yaratish
function createDemoOrdersForUser(user) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Agar foydalanuvchining buyurtmalari bo'lmasa, demo buyurtmalar yaratish
    const userOrders = orders.filter(order => order.userId === user.id);
    
    if (userOrders.length === 0) {
        const demoOrders = [
            {
                id: Date.now() + 1,
                userId: user.id,
                customerName: `${user.firstName} ${user.lastName}`,
                customerPhone: user.phone ? `+998${user.phone.replace(/\D/g, '')}` : '+998901234567',
                deliveryAddress: user.address || 'Toshkent sh., Yunusobod tumani',
                deliveryTime: 'Imkon qadar tezroq (30-45 daqiqa)',
                orderNotes: 'Qalampir kam soling',
                paymentMethod: 'Naqd pul',
                items: [
                    { id: 1, name: "Osh", price: 35000, quantity: 1 },
                    { id: 10, name: "Choy", price: 3000, quantity: 2 }
                ],
                subtotal: 41000,
                deliveryFee: 15000,
                discount: 0,
                total: 56000,
                status: 'delivered',
                paymentStatus: 'paid',
                orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 kun oldin
            },
            {
                id: Date.now() + 2,
                userId: user.id,
                customerName: `${user.firstName} ${user.lastName}`,
                customerPhone: user.phone ? `+998${user.phone.replace(/\D/g, '')}` : '+998901234567',
                deliveryAddress: user.address || 'Toshkent sh., Yunusobod tumani',
                deliveryTime: 'Imkon qadar tezroq (30-45 daqiqa)',
                orderNotes: '',
                paymentMethod: 'Karta (yetkazib berilganda)',
                items: [
                    { id: 3, name: "Somsa", price: 8000, quantity: 3 },
                    { id: 9, name: "Coca-Cola", price: 10000, quantity: 1 }
                ],
                subtotal: 34000,
                deliveryFee: 15000,
                discount: 0,
                total: 49000,
                status: 'processing',
                paymentStatus: 'pending',
                orderDate: new Date().toISOString() // Bugun
            }
        ];
        
        // Demo buyurtmalarni qo'shish
        demoOrders.forEach(order => {
            orders.push(order);
        });
        
        // Saqlash
        localStorage.setItem('orders', JSON.stringify(orders));
    }
}

// YANGI: initProfile funksiyasini yangilash
function initProfile() {
    // Setup sidebar navigation
    setupProfileNavigation();
    
    // Load user data
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        // Demo buyurtmalar yaratish (agar bo'lmasa)
        createDemoOrdersForUser(currentUser);
        
        updateProfileHeader(currentUser);
        updateProfileInfo(currentUser);
    }
}

// Helper functions
function getStatusBadgeClass(status) {
    const classes = {
        'pending': 'bg-warning',
        'processing': 'bg-info',
        'delivered': 'bg-success',
        'cancelled': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
}

function getStatusText(status) {
    const texts = {
        'pending': 'Kutilmoqda',
        'processing': 'Tayyorlanmoqda',
        'delivered': 'Yetkazilgan',
        'cancelled': 'Bekor qilingan'
    };
    return texts[status] || 'Noma\'lum';
}

function formatCurrency(amount) {
    if (isNaN(amount)) return '0 so\'m';
    return amount.toLocaleString('uz-UZ') + ' so\'m';
}

function showAlert(message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show fixed-top mt-5 mx-3`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}