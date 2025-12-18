// Admin Panel JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check admin authentication
    checkAdminAuth();
    
    // Initialize admin panel
    initAdminPanel();
    
    // Event listeners
    document.getElementById('adminLogoutBtn').addEventListener('click', adminLogout);
    
    // Sidebar navigation
    setupSidebarNavigation();
    
    // Form submissions
    document.getElementById('addFoodForm')?.addEventListener('submit', addFood);
    document.getElementById('addCategoryForm')?.addEventListener('submit', addCategory);
    document.getElementById('addUserForm')?.addEventListener('submit', addUser);
    document.getElementById('generalSettingsForm')?.addEventListener('submit', saveGeneralSettings);
    document.getElementById('paymentSettingsForm')?.addEventListener('submit', savePaymentSettings);
    document.getElementById('adminSettingsForm')?.addEventListener('submit', updateAdminPassword);
    
    // Toggle online payment settings
    document.getElementById('onlinePayment')?.addEventListener('change', function() {
        const settingsDiv = document.getElementById('onlinePaymentSettings');
        settingsDiv.style.display = this.checked ? 'block' : 'none';
    });
    
    // Order filter buttons
    document.querySelectorAll('[data-filter]').forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            filterOrders(filter);
            
            // Update active button
            document.querySelectorAll('[data-filter]').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Load initial data
    loadDashboardData();
    loadRecentOrders();
    loadFoodsTable();
    loadCategoriesCards();
    loadOrdersTable();
    loadUsersTable();
    
    // Initialize charts
    setTimeout(initCharts, 500);
});

// Check admin authentication
function checkAdminAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        // Redirect to login
        window.location.href = 'index.html';
        return;
    }
    
    // Check if user is admin (in real app, this would check user role)
    // For demo, we'll accept any logged in user
    updateAdminUI(currentUser);
}

// Update admin UI with user info
function updateAdminUI(user) {
    document.getElementById('adminName').value = user.firstName || 'Admin';
    document.getElementById('adminEmail').value = user.email || 'admin@example.com';
}

// Initialize admin panel
function initAdminPanel() {
    // Show dashboard by default
    showSection('dashboard');
}

// Setup sidebar navigation
function setupSidebarNavigation() {
    const sidebarLinks = document.querySelectorAll('#sidebar .nav-link');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get section id from href
            const sectionId = this.getAttribute('href').substring(1);
            
            // Update active link
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show section
            showSection(sectionId);
        });
    });
}

// Show specific section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.add('d-none');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('d-none');
    }
}

// Admin logout
function adminLogout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Load dashboard data
function loadDashboardData() {
    // In a real app, this would fetch from API
    // For demo, we'll use mock data
    
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const foods = JSON.parse(localStorage.getItem('foods')) || [];
    
    // Calculate totals
    const totalOrders = orders.length;
    const totalUsers = users.length;
    const totalFoods = foods.length || 12; // Default to 12 if no data
    
    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Update UI
    document.getElementById('totalOrders').textContent = totalOrders.toLocaleString();
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('totalUsers').textContent = totalUsers.toLocaleString();
    document.getElementById('totalFoods').textContent = totalFoods.toLocaleString();
    
    // Update sidebar stats
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orders.filter(order => order.orderDate?.startsWith(today)).length;
    document.getElementById('todayOrders').textContent = todayOrders;
    document.getElementById('activeUsers').textContent = totalUsers;
    
    // Calculate monthly revenue (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const monthlyRevenue = orders
        .filter(order => new Date(order.orderDate) > thirtyDaysAgo)
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    document.getElementById('monthlyRevenue').textContent = formatCurrency(monthlyRevenue);
}

// Load recent orders
function loadRecentOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Sort by date (newest first) and get recent 10
    const recentOrders = orders
        .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
        .slice(0, 10);
    
    const tableBody = document.getElementById('recentOrdersBody');
    if (!tableBody) return;
    
    let html = '';
    
    if (recentOrders.length === 0) {
        html = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <i class="fas fa-shopping-cart fa-2x text-muted mb-3"></i>
                    <p class="text-muted">Hali buyurtmalar mavjud emas</p>
                </td>
            </tr>
        `;
    } else {
        recentOrders.forEach(order => {
            const orderDate = new Date(order.orderDate);
            const formattedDate = orderDate.toLocaleDateString('uz-UZ');
            const formattedTime = orderDate.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
            
            html += `
                <tr>
                    <td>#${order.id || 'N/A'}</td>
                    <td>${order.customerName || 'Mijoz'}</td>
                    <td>${formattedDate} ${formattedTime}</td>
                    <td>${formatCurrency(order.totalAmount || 0)}</td>
                    <td><span class="badge ${getStatusBadgeClass(order.status)}">${getStatusText(order.status)}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="viewOrder(${order.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="updateOrderStatus(${order.id}, 'processing')">
                            <i class="fas fa-play"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }
    
    tableBody.innerHTML = html;
}

// Load foods table
function loadFoodsTable() {
    const foods = JSON.parse(localStorage.getItem('foods')) || getDefaultFoods();
    
    const tableBody = document.getElementById('foodsTableBody');
    if (!tableBody) return;
    
    let html = '';
    
    foods.forEach(food => {
        html += `
            <tr>
                <td>${food.id}</td>
                <td>
                    <img src="${food.image || 'https://via.placeholder.com/50'}" 
                         alt="${food.name}" 
                         style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                </td>
                <td>${food.name}</td>
                <td>${food.category || 'Milliy Taomlar'}</td>
                <td>${formatCurrency(food.price)}</td>
                <td>
                    <i class="fas fa-star text-warning"></i> ${food.rating || '4.5'}
                </td>
                <td>
                    <span class="badge ${food.isAvailable ? 'bg-success' : 'bg-danger'}">
                        ${food.isAvailable ? 'Mavjud' : 'Mavjud emas'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="editFood(${food.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteFood(${food.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
    
    // Initialize DataTable if available
    if ($.fn.DataTable) {
        $('#foodsTable').DataTable({
            pageLength: 10,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/uz.json'
            }
        });
    }
}

// Load categories cards
function loadCategoriesCards() {
    const categories = [
        {
            id: 1,
            name: "Milliy Taomlar",
            description: "O'zbekistonning an'anaviy taomlari",
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            foodCount: 12
        },
        {
            id: 2,
            name: "Fast Food",
            description: "Tez tayyorlanadigan taomlar",
            image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            foodCount: 8
        },
        {
            id: 3,
            name: "Ichimliklar",
            description: "Sovuq va issiq ichimliklar",
            image: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            foodCount: 10
        },
        {
            id: 4,
            name: "Shirinliklar",
            description: "An'anaviy va zamonaviy shirinliklar",
            image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            foodCount: 15
        }
    ];
    
    const container = document.getElementById('categoriesCards');
    if (!container) return;
    
    let html = '';
    
    categories.forEach(category => {
        html += `
            <div class="col-md-3 mb-4">
                <div class="card category-card">
                    <img src="${category.image}" class="card-img-top category-img" alt="${category.name}">
                    <div class="card-body">
                        <h5 class="card-title">${category.name}</h5>
                        <p class="card-text text-muted">${category.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge bg-primary">${category.foodCount} ta taom</span>
                            <div>
                                <button class="btn btn-sm btn-outline-primary" onclick="editCategory(${category.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${category.id})">
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

// Load orders table
function loadOrdersTable() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) return;
    
    let html = '';
    
    if (orders.length === 0) {
        html = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <i class="fas fa-shopping-cart fa-2x text-muted mb-3"></i>
                    <p class="text-muted">Hali buyurtmalar mavjud emas</p>
                </td>
            </tr>
        `;
    } else {
        orders.forEach(order => {
            const orderDate = new Date(order.orderDate);
            const formattedDate = orderDate.toLocaleDateString('uz-UZ');
            
            html += `
                <tr>
                    <td>#${order.id || 'N/A'}</td>
                    <td>${order.customerName || 'Mijoz'}</td>
                    <td>${order.customerPhone || 'N/A'}</td>
                    <td>${formatCurrency(order.totalAmount || 0)}</td>
                    <td>${formattedDate}</td>
                    <td><span class="badge ${getStatusBadgeClass(order.status)}">${getStatusText(order.status)}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="viewOrder(${order.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="updateOrderStatus(${order.id}, 'processing')">
                            <i class="fas fa-play"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="updateOrderStatus(${order.id}, 'cancelled')">
                            <i class="fas fa-times"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }
    
    tableBody.innerHTML = html;
}

// Load users table
function loadUsersTable() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;
    
    let html = '';
    
    if (users.length === 0) {
        html = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <i class="fas fa-users fa-2x text-muted mb-3"></i>
                    <p class="text-muted">Hali foydalanuvchilar mavjud emas</p>
                </td>
            </tr>
        `;
    } else {
        users.forEach(user => {
            const joinDate = new Date(user.registrationDate || Date.now());
            const formattedDate = joinDate.toLocaleDateString('uz-UZ');
            
            // Count user orders
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            const userOrders = orders.filter(order => order.userId === user.id).length;
            
            html += `
                <tr>
                    <td>${user.id || 'N/A'}</td>
                    <td>${user.firstName} ${user.lastName}</td>
                    <td>${user.email}</td>
                    <td>${user.phone || 'N/A'}</td>
                    <td>${formattedDate}</td>
                    <td>${userOrders}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="editUser(${user.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }
    
    tableBody.innerHTML = html;
}

// Initialize charts
function initCharts() {
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        const revenueChart = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'],
                datasets: [{
                    label: 'Daromad (million so\'m)',
                    data: [2.5, 3.2, 4.1, 3.8, 4.5, 5.2, 6.1, 5.8, 6.5, 7.2, 8.1, 9.5],
                    borderColor: 'rgb(255, 107, 53)',
                    backgroundColor: 'rgba(255, 107, 53, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Oylik Daromad (2023)'
                    }
                }
            }
        });
    }
    
    // Food Sales Chart
    const foodSalesCtx = document.getElementById('foodSalesChart');
    if (foodSalesCtx) {
        const foodSalesChart = new Chart(foodSalesCtx, {
            type: 'doughnut',
            data: {
                labels: ['Osh', 'Lag\'mon', 'Somsa', 'Manti', 'Shashlik', 'Boshqalar'],
                datasets: [{
                    data: [30, 20, 15, 12, 10, 13],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                        'rgba(255, 159, 64, 0.8)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    title: {
                        display: true,
                        text: 'Taomlar Bo\'yicha Sotuv (%)'
                    }
                }
            }
        });
    }
}

// Add new food
function addFood(e) {
    e.preventDefault();
    
    const name = document.getElementById('foodName').value;
    const category = document.getElementById('foodCategory').value;
    const description = document.getElementById('foodDescription').value;
    const price = parseInt(document.getElementById('foodPrice').value);
    const rating = parseFloat(document.getElementById('foodRating').value) || 4.0;
    const image = document.getElementById('foodImage').value;
    const isPopular = document.getElementById('isPopular').checked;
    const isAvailable = document.getElementById('isAvailable').checked;
    
    // Get existing foods
    const foods = JSON.parse(localStorage.getItem('foods')) || getDefaultFoods();
    
    // Create new food
    const newFood = {
        id: foods.length > 0 ? Math.max(...foods.map(f => f.id)) + 1 : 1,
        name,
        description,
        price,
        category: getCategoryName(category),
        categoryId: parseInt(category),
        image: image || 'https://via.placeholder.com/400x300',
        rating,
        isPopular,
        isAvailable,
        createdAt: new Date().toISOString()
    };
    
    // Add to foods array
    foods.push(newFood);
    
    // Save to localStorage
    localStorage.setItem('foods', JSON.stringify(foods));
    
    // Show success message
    showAlert(`"${name}" taomi muvaffaqiyatli qo'shildi`, 'success');
    
    // Close modal and reset form
    bootstrap.Modal.getInstance(document.getElementById('addFoodModal')).hide();
    e.target.reset();
    
    // Reload foods table
    loadFoodsTable();
}

// Add new category
function addCategory(e) {
    e.preventDefault();
    
    const name = document.getElementById('categoryName').value;
    const description = document.getElementById('categoryDescription').value;
    const image = document.getElementById('categoryImage').value;
    
    // In a real app, this would save to database
    // For demo, we'll just show a message
    
    showAlert(`"${name}" kategoriyasi qo'shildi`, 'success');
    
    // Close modal and reset form
    bootstrap.Modal.getInstance(document.getElementById('addCategoryModal')).hide();
    e.target.reset();
    
    // Reload categories
    loadCategoriesCards();
}

// Add new user
function addUser(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('userFirstName').value;
    const lastName = document.getElementById('userLastName').value;
    const email = document.getElementById('userEmail').value;
    const phone = document.getElementById('userPhone').value;
    const address = document.getElementById('userAddress').value;
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRole').value;
    
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if user already exists
    if (users.find(u => u.email === email)) {
        showAlert('Bu email bilan foydalanuvchi mavjud', 'danger');
        return;
    }
    
    // Create new user
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        firstName,
        lastName,
        email,
        phone,
        address,
        password, // In real app, this should be hashed
        role,
        registrationDate: new Date().toISOString()
    };
    
    // Add to users array
    users.push(newUser);
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Show success message
    showAlert(`"${firstName} ${lastName}" foydalanuvchi qo'shildi`, 'success');
    
    // Close modal and reset form
    bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();
    e.target.reset();
    
    // Reload users table
    loadUsersTable();
    loadDashboardData();
}

// Save general settings
function saveGeneralSettings(e) {
    e.preventDefault();
    
    const siteName = document.getElementById('siteName').value;
    const siteEmail = document.getElementById('siteEmail').value;
    const sitePhone = document.getElementById('sitePhone').value;
    const deliveryFee = parseInt(document.getElementById('deliveryFee').value);
    const deliveryTime = parseInt(document.getElementById('deliveryTime').value);
    
    // Save to localStorage
    const settings = {
        siteName,
        siteEmail,
        sitePhone,
        deliveryFee,
        deliveryTime,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    
    showAlert('Sozlamalar muvaffaqiyatli saqlandi', 'success');
}

// Save payment settings
function savePaymentSettings(e) {
    e.preventDefault();
    
    const cashPayment = document.getElementById('cashPayment').checked;
    const cardPayment = document.getElementById('cardPayment').checked;
    const onlinePayment = document.getElementById('onlinePayment').checked;
    const merchantId = document.getElementById('merchantId')?.value || '';
    const apiKey = document.getElementById('apiKey')?.value || '';
    
    // Save to localStorage
    const paymentSettings = {
        cashPayment,
        cardPayment,
        onlinePayment,
        merchantId,
        apiKey,
        updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem('paymentSettings', JSON.stringify(paymentSettings));
    
    showAlert('To\'lov sozlamalari saqlandi', 'success');
}

// Update admin password
function updateAdminPassword(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showAlert('Barcha maydonlarni to\'ldiring', 'danger');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showAlert('Yangi parollar mos kelmayapti', 'danger');
        return;
    }
    
    // In real app, verify current password and update
    showAlert('Parol muvaffaqiyatli yangilandi', 'success');
    e.target.reset();
}

// Filter orders
function filterOrders(filter) {
    const rows = document.querySelectorAll('#ordersTableBody tr');
    
    rows.forEach(row => {
        if (filter === 'all') {
            row.style.display = '';
        } else {
            const statusBadge = row.querySelector('.badge');
            const status = statusBadge?.textContent.toLowerCase();
            
            if (status === filter) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}

// View order details
function viewOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        showAlert('Buyurtma topilmadi', 'warning');
        return;
    }
    
    // Format order details HTML
    let html = `
        <div class="row">
            <div class="col-md-6">
                <h6>Buyurtma ma'lumotlari</h6>
                <table class="table table-sm">
                    <tr>
                        <td><strong>ID:</strong></td>
                        <td>#${order.id}</td>
                    </tr>
                    <tr>
                        <td><strong>Mijoz:</strong></td>
                        <td>${order.customerName || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Telefon:</strong></td>
                        <td>${order.customerPhone || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Manzil:</strong></td>
                        <td>${order.deliveryAddress || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td><strong>Vaqt:</strong></td>
                        <td>${new Date(order.orderDate).toLocaleString('uz-UZ')}</td>
                    </tr>
                    <tr>
                        <td><strong>Holat:</strong></td>
                        <td><span class="badge ${getStatusBadgeClass(order.status)}">${getStatusText(order.status)}</span></td>
                    </tr>
                </table>
            </div>
            <div class="col-md-6">
                <h6>To'lov ma'lumotlari</h6>
                <table class="table table-sm">
                    <tr>
                        <td><strong>Umumiy summa:</strong></td>
                        <td>${formatCurrency(order.totalAmount || 0)}</td>
                    </tr>
                    <tr>
                        <td><strong>Yetkazib berish:</strong></td>
                        <td>${formatCurrency(order.deliveryFee || 15000)}</td>
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
        </div>
    `;
    
    // Add order items if available
    if (order.items && order.items.length > 0) {
        html += `
            <div class="mt-4">
                <h6>Buyurtma mahsulotlari</h6>
                <table class="table table-sm">
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
            </div>
        `;
    }
    
    // Add action buttons
    html += `
        <div class="mt-4 text-end">
            <button class="btn btn-success" onclick="updateOrderStatus(${order.id}, 'processing')">
                <i class="fas fa-play me-1"></i>Tayyorlashni boshlash
            </button>
            <button class="btn btn-primary" onclick="updateOrderStatus(${order.id}, 'delivered')">
                <i class="fas fa-check me-1"></i>Yetkazilgan deb belgilash
            </button>
            <button class="btn btn-danger" onclick="updateOrderStatus(${order.id}, 'cancelled')">
                <i class="fas fa-times me-1"></i>Bekor qilish
            </button>
        </div>
    `;
    
    // Update modal
    document.getElementById('orderIdHeader').textContent = `#${order.id}`;
    document.getElementById('orderDetails').innerHTML = html;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('viewOrderModal'));
    modal.show();
}

// Update order status
function updateOrderStatus(orderId, status) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
        showAlert('Buyurtma topilmadi', 'warning');
        return;
    }
    
    // Update status
    orders[orderIndex].status = status;
    
    // If delivered, mark as paid
    if (status === 'delivered') {
        orders[orderIndex].paymentStatus = 'paid';
    }
    
    // Save to localStorage
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Show success message
    const statusText = getStatusText(status);
    showAlert(`Buyurtma #${orderId} holati "${statusText}" ga o'zgartirildi`, 'success');
    
    // Reload orders
    loadRecentOrders();
    loadOrdersTable();
    
    // Close view modal if open
    const viewModal = bootstrap.Modal.getInstance(document.getElementById('viewOrderModal'));
    if (viewModal) {
        viewModal.hide();
    }
}

// Edit food (placeholder)
function editFood(foodId) {
    showAlert('Tahrirlash funksiyasi ishlab chiqilmoqda', 'info');
}

// Delete food
function deleteFood(foodId) {
    if (confirm('Bu taomni o\'chirishni istaysizmi?')) {
        const foods = JSON.parse(localStorage.getItem('foods')) || getDefaultFoods();
        const updatedFoods = foods.filter(food => food.id !== foodId);
        
        localStorage.setItem('foods', JSON.stringify(updatedFoods));
        showAlert('Taom o\'chirildi', 'success');
        loadFoodsTable();
        loadDashboardData();
    }
}

// Edit category (placeholder)
function editCategory(categoryId) {
    showAlert('Tahrirlash funksiyasi ishlab chiqilmoqda', 'info');
}

// Delete category (placeholder)
function deleteCategory(categoryId) {
    if (confirm('Bu kategoriyani o\'chirishni istaysizmi?')) {
        showAlert('Kategoriya o\'chirildi (demo)', 'success');
        loadCategoriesCards();
    }
}

// Edit user (placeholder)
function editUser(userId) {
    showAlert('Tahrirlash funksiyasi ishlab chiqilmoqda', 'info');
}

// Delete user
function deleteUser(userId) {
    if (confirm('Bu foydalanuvchini o\'chirishni istaysizmi?')) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        // Don't allow deleting yourself
        if (currentUser && currentUser.id === userId) {
            showAlert('O\'zingizni o\'chira olmaysiz', 'warning');
            return;
        }
        
        const updatedUsers = users.filter(user => user.id !== userId);
        
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        showAlert('Foydalanuvchi o\'chirildi', 'success');
        loadUsersTable();
        loadDashboardData();
    }
}

// Helper functions
function getDefaultFoods() {
    // Return default foods if none in localStorage
    return [
        {
            id: 1,
            name: "Osh",
            description: "An'anaviy o'zbek oshi, sabzi, go'sht va guruch bilan",
            price: 35000,
            category: "Milliy Taomlar",
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            rating: 4.9,
            isPopular: true,
            isAvailable: true
        },
        // ... other default foods
    ];
}

function getCategoryName(categoryId) {
    const categories = {
        1: "Milliy Taomlar",
        2: "Fast Food",
        3: "Ichimliklar",
        4: "Shirinliklar"
    };
    return categories[categoryId] || "Milliy Taomlar";
}

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