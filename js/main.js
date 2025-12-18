// Food Delivery System - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize
    initApp();
    
    // Event Listeners
    document.getElementById('loginBtn')?.addEventListener('click', function(e) {
        e.preventDefault();
        var loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
    });
    
    document.getElementById('registerBtn')?.addEventListener('click', function(e) {
        e.preventDefault();
        var registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
        registerModal.show();
    });
    
    // Login form submission
    document.getElementById('loginForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        loginUser();
    });
    
    // Register form submission
    document.getElementById('registerForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        registerUser();
    });
    
    // Search functionality
    document.getElementById('searchBtn')?.addEventListener('click', performSearch);
    document.getElementById('searchInput')?.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Clear search button
    document.getElementById('clearSearchBtn')?.addEventListener('click', clearSearch);
    
    // Search suggestions
    const suggestionTags = document.querySelectorAll('.suggestion-tag');
    suggestionTags.forEach(tag => {
        tag.addEventListener('click', function() {
            document.getElementById('searchInput').value = this.textContent;
            performSearch();
        });
    });
    
    // Load categories and foods (faqat asosiy sahifada)
    if (document.getElementById('categoriesContainer') || 
        document.getElementById('popularFoodsContainer') || 
        document.getElementById('allFoodsContainer')) {
        loadCategories();
        loadPopularFoods();
        loadAllFoods();
    }
});

// Initialize the application
function initApp() {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        updateUserUI(user);
    }
    
    // Initialize cart
    updateCartCount();
}

// Login user
function loginUser() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simple validation
    if (!email || !password) {
        showAlert('Iltimos, barcha maydonlarni to\'ldiring', 'danger');
        return;
    }
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Save current user to localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Update UI
        updateUserUI(user);
        
        // Show success message and close modal
        showAlert('Muvaffaqiyatli tizimga kirildi!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
        
        // Clear form
        document.getElementById('loginForm').reset();
    } else {
        showAlert('Elektron pochta yoki parol noto\'g\'ri', 'danger');
    }
}

// Register user
function registerUser() {
    const firstName = document.getElementById('regFirstName').value;
    const lastName = document.getElementById('regLastName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const address = document.getElementById('regAddress').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    // Validation
    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
        showAlert('Iltimos, barcha maydonlarni to\'ldiring', 'danger');
        return;
    }
    
    if (password !== confirmPassword) {
        showAlert('Parollar mos kelmayapti', 'danger');
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const existingUser = users.find(u => u.email === email);
    
    if (existingUser) {
        showAlert('Bu elektron pochta bilan ro\'yxatdan o\'tilgan', 'danger');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        firstName,
        lastName,
        email,
        phone,
        address,
        password,
        registrationDate: new Date().toISOString(),
        orders: []
    };
    
    // Save to users array
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    // Update UI
    updateUserUI(newUser);
    
    // Show success message and close modal
    showAlert('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!', 'success');
    bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
    
    // Clear form
    document.getElementById('registerForm').reset();
}

// Update UI based on user login status
function updateUserUI(user) {
    const profileDropdown = document.querySelector('.nav-link.dropdown-toggle');
    if (profileDropdown) {
        profileDropdown.innerHTML = `<i class="fas fa-user-circle"></i> ${user.firstName}`;
    }
    
    // Update login/logout links
    const dropdownMenu = document.querySelector('.dropdown-menu');
    if (dropdownMenu) {
        dropdownMenu.innerHTML = `
            <li><a class="dropdown-item" href="profile.html"><i class="fas fa-user me-2"></i>Mening profilim</a></li>
            <li><a class="dropdown-item" href="profile.html#orders"><i class="fas fa-history me-2"></i>Buyurtma tarixi</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" id="logoutBtn"><i class="fas fa-sign-out-alt me-2"></i>Chiqish</a></li>
        `;
        
        // Add logout event listener
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                location.reload();
            });
        }
    }
}

// Show alert message
function showAlert(message, type) {
    // Create alert element
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show fixed-top mt-5 mx-3`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Add to page
    document.body.appendChild(alertDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Load categories from database (simulated)
function loadCategories() {
    const categories = [
        {
            id: 1,
            name: "Milliy Taomlar",
            description: "O'zbekistonning an'anaviy taomlari",
            image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            foodCount: 7
        },
        {
            id: 2,
            name: "Fast Food",
            description: "Tez tayyorlanadigan taomlar",
            image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            foodCount: 5
        },
        {
            id: 3,
            name: "Ichimliklar",
            description: "Sovuq va issiq ichimliklar",
            image: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            foodCount: 6
        },
        {
            id: 4,
            name: "Shirinliklar",
            description: "An'anaviy va zamonaviy shirinliklar",
            image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            foodCount: 4
        }
    ];
    
    const container = document.getElementById('categoriesContainer');
    if (!container) return;
    
    let html = '';
    categories.forEach(category => {
        html += `
            <div class="col-md-3 col-sm-6">
                <div class="card category-card">
                    <img src="${category.image}" class="card-img-top category-img" alt="${category.name}">
                    <div class="card-body category-body text-center">
                        <h5 class="category-title">${category.name}</h5>
                        <p class="text-muted">${category.description}</p>
                        <span class="badge bg-primary">${category.foodCount} ta taom</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Load popular foods
function loadPopularFoods() {
    const foods = [
        {
            id: 1,
            name: "Osh",
            description: "An'anaviy o'zbek oshi, sabzi, go'sht va guruch bilan",
            price: 35000,
            image: "images/osh.png",
            category: "Milliy Taomlar",
            rating: 4.9,
            isPopular: true
        },
        {
            id: 2,
            name: "Lag'mon",
            description: "Qo'lda yoyilgan xamir, go'sht va sabzavotlar bilan",
            price: 28000,
            image: "images/lagman.png",
            category: "Milliy Taomlar",
            rating: 4.7,
            isPopular: true
        },
        {
            id: 3,
            name: "Somsa",
            description: "Yumshoq xamir, go'sht va piyoz bilan tayyorlangan",
            price: 8000,
            image: "images/somsa.png",
            category: "Milliy Taomlar",
            rating: 4.8,
            isPopular: true
        },
        {
            id: 4,
            name: "Manti",
            description: "Bug'doy xamiri, go'sht va piyoz bilan",
            price: 25000,
            image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
            category: "Milliy Taomlar",
            rating: 4.6,
            isPopular: true
        },
        {
            id: 5,
            name: "Shashlik",
            description: "Molly go'shtdan tayyorlangan, barbekyu sousi bilan",
            price: 20000,
            image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
            category: "Milliy Taomlar",
            rating: 4.9,
            isPopular: true
        },
        {
            id: 6,
            name: "Chuchvara",
            description: "Mayda chuchvara, qatiq va ziravorlar bilan",
            price: 22000,
            image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            category: "Milliy Taomlar",
            rating: 4.5,
            isPopular: true
        }
    ];
    
    const container = document.getElementById('popularFoodsContainer');
    if (!container) return;
    
    let html = '';
    foods.forEach(food => {
        html += createFoodCard(food);
    });
    
    container.innerHTML = html;
    
    // Add event listeners to "Add to cart" buttons
    addCartEventListeners();
}

// Load all foods
function loadAllFoods() {
    const allFoods = [
        // Milliy Taomlar (7 ta)
        {
            id: 1,
            name: "Osh",
            description: "An'anaviy o'zbek oshi, sabzi, go'sht va guruch bilan",
            price: 35000,
            image: "images/osh.png",
            category: "Milliy Taomlar",
            rating: 4.9
        },
        {
            id: 2,
            name: "Lag'mon",
            description: "Qo'lda yoyilgan xamir, go'sht va sabzavotlar bilan",
            price: 28000,
            image: "images/lagman.png",
            category: "Milliy Taomlar",
            rating: 4.7
        },
        {
            id: 3,
            name: "Somsa",
            description: "Yumshoq xamir, go'sht va piyoz bilan tayyorlangan",
            price: 8000,
            image: "data:image/jpeg;base64,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",
            category: "Milliy Taomlar",
            rating: 4.8
        },
        {
            id: 4,
            name: "Manti",
            description: "Bug'doy xamiri, go'sht va piyoz bilan",
            price: 25000,
            image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
            category: "Milliy Taomlar",
            rating: 4.6
        },
        {
            id: 5,
            name: "Shashlik",
            description: "Molly go'shtdan tayyorlangan, barbekyu sousi bilan",
            price: 20000,
            image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
            category: "Milliy Taomlar",
            rating: 4.9
        },
        {
            id: 6,
            name: "Chuchvara",
            description: "Mayda chuchvara, qatiq va ziravorlar bilan",
            price: 22000,
            image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            category: "Milliy Taomlar",
            rating: 4.5
        },
        {
            id: 7,
            name: "Norin",
            description: "Yupqa xamir, qaynatilgan go'sht va maxsus ziravorlar bilan",
            price: 30000,
            image: "data:image/jpeg;base64,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",
            category: "Milliy Taomlar",
            rating: 4.7
        },
        
        // Fast Food (5 ta)
        {
            id: 8,
            name: "Burger",
            description: "Molly kotlet, pomidor, salat va maxsus sous bilan",
            price: 25000,
            image: "images/burger.png",
            category: "Fast Food",
            rating: 4.4
        },
        {
            id: 9,
            name: "Pizza",
            description: "Yupqa qobiq, pishloq, go'sht va sabzavotlar bilan",
            price: 60000,
            image: "images/pizza.png",
            category: "Fast Food",
            rating: 4.6
        },
        {
            id: 10,
            name: "Hot Dog",
            description: "Sosiska, non va turli souslar bilan",
            price: 15000,
            image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUTExMWFRUXGBoYFRgYFxgaGBgYGhoWFxoZGBgaHSggGBolGx0XIjEiJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGhAQGy0lHyUtLS8tMC0tLS8tMC0tLS0tLTcvLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy0tLf/AABEIAOEA4QMBIgACEQEDEQH/xAAcAAABBQEBAQAAAAAAAAAAAAAFAAEEBgcCAwj/xABBEAABAgQEAwYDBgUDAwUBAAABAhEAAwQhBRIxQQZRYRMicYGRoTJSsRRCwdHh8DNicoLxByOSFSSiNFOywuIW/8QAGgEAAgMBAQAAAAAAAAAAAAAAAwQAAQUCBv/EAC8RAAICAQQBAwIEBwEBAAAAAAECAAMRBBIhMUETImFRcTKBsfAFI0KRocHhFNH/2gAMAwEAAhEDEQA/ANXBhoeFFS4oaHhRJIoeFDxJIwhxCjoRJIzQmjtoWWJJOAI6yw8eaKlJJALkaxJJ20PliMisdakgGzXh1zVZwkaM5isy8SRlhskeVQpQKQNzeOqudkS5iiwAJMgUmdTCBrHhMqWFg8CqqtU7gvyAD79P3rHkjE0myrGErNS/iNppxjme9RjQlllpsz2IbUDfxglSVSJicyC49x0I2gLUUqVAhQdKmKuZynMCPP1For1UmZSLC5ZdBuFXsC2o5EQJNVYhy3Ihf/MjjC8GX9oaB+BY0ipQ4ssfEn8RzH0gjljSVgwyIgylTgxmhAR00ICOpzODDR2YYxJJwY5MdmOWipIoUO0PElzuGeHhRcqKHhnHSHSoaPca9H0eJJHaHAhxDgRJIwEdAQjbWI06pdJ7MgnbxiSSTMmBIJJsA5iHS4iJiSpKVAPYkM/UR506CZbLVmJ1/KGo5gAKOWnhtElxsLzFJK15lOfKOsPSlKlBruT1vHhJm5JpSdFXENPm5JyTsbRznE6xmS5Kmmkcw8KrmFKnHIxEr5uWYhXVvWOVVWeYeQt6frC2ou9NfnMPTVuOfGJyjEVEub/L48niQuvGQmaQkbPublh8xsWAvaA1bKyKKgWTv0GnpFNxqvVMmnvPk7qRcFlDvEHcn3tCvqMPMar04sbA4hHiHHpiryJhEsfEpOo1HetbQnwgLScWLRMyzu+kn4wO+B5DvDSzPEv7XLUgZUAugBeUBJszO51112UfEVutlJ5258wYrPOZoppg67QJqmFYkhaEqBCkEWU4seR5H92gp9mC5RQtI1Ibob28HbyjGMHxddMp0TEqG6FMxbq/dPX6xqPD2Oy6hAKSdcqndwWBY87HWCgAzP1Gmtp5Iler6ZdDPTNlfC9tg26TzBi9YTjcqelJBykh8p18ucQcTpUzpak2UNPD9fGKSqSqnmgKJCUtlPpcH97RzXYaWwejOGUXrn+oTVyIZoruHcSglKF3fRY06PFkjSBB6mcVI7nBhjHZEcRcqcQxjow0SSNChNDxJJ2BHUMIdokkQjoQgI6aJJGh5igkEnQB4RLRBlzlqKswAToOZiSRpVT2qCcpSC4D7jnDU4SkZAGaHKstttoj1KtxElx1zsiuhiNXzcigsabx5VM8LSeYiKqcDKup1PYdNyYGzQirJOJzXCVpjnFJziW5YkOeY5P7xDXNUpKUbJ0A58zHvTYeVXNhAyS3UKAF7j11aFlLAkJA13PlHjhs7eDVPh6RtFYlHItSflJHoWhD+IKw2k/Md0ZVgyiHahGdBCWCmLE6ORv0jIaiaETDnKgsWmJIOZKkgfCU93IXLHUsNrnW6ac4gBxhw3LqEmYO7MCWzDUjZ+bfjAaXB4MbotWpiGHB/vKCMfUjRKSAGGYA/wBzaE+IIHjeBiqidUqIB63sPTxjmmwwAqRNcTEkNm+E7hzqHFoMUSlpQEqSEgl+6BlLBvVmckPoYbJCx0aguP5Y2g+fMErwxlEKU7Wsd+T6QZwvEzTTUqQweyk3yixGmtnEd1s9CJIW7rX8Kflb73IdGvr5gOxV8Zf93/f7ERSTyZxcoFJVskmbdhmLS1I7gzE8uZe5c3J5Q2PYX2stm7wHdJjIsNqqgfASCD3G1fX9+Majwhj5qpZE3KmcjYGyhZlJufPd4s4b2mZT6WypBcOpXcLqOzUZar7f0nx3EW3AsWVmCVfw9AdwfygJxThig05Avor6xCwrEzlKT8Q93iaa0qdjQWoqDr6i/nNRV0jgwF4aqSbTFOTcOfaDFQqxUm7ajmPzjR7mcRiORHJhpU5Kw4P5g8jyjpokqctCh4USSegjqORHQiSRwI6hgIjVuYsElr3PSJJPNalleoCB0184SlR0otHhOVElzynTNohS5hKsnPmYaqmxEqlJURlBYBr6kwJmhVScCeU50hruHa7dIVPTlWgj2o6IrPSLBSUYAYCOVQnudM4XqQ6PDgnW5gpKpokIlgeMOVQcACALEzkSgIpPFNP2dRmHwzBmHjooerH+6Lq8CeJqDtZJYd5HeT/9h5j3AhbV1epWRGdJb6dgJ6PErtHUwTSrMGit0k2DNNNjz6nBmxakCcZ4WTIWuVLClApLbhmfKBuUv5+UZ9KmAgK5Bw77nS+l42tF7s+x8Izrjbh/sSubL/hrBJbZTi48dxzvvGhWd658ytHbttCN0ZVqNPbTHUlSkggODubAH1gpXy0SX7SxDDLqSRudhv6wGwwmnV2ubvapY6WF/Ee0eKasLJmTsxv3QxYnVyX00t1g+3M0nYBvUs89D7f6nU7ElkHKlk6W/f0grw3XGlqJE5b5SbgagXSXHqW3hqUJWlhcd1rhtSPfTx2MRcblgBMtJdibgcv37RQIJwBOWtc0vnGMfrNewrFpVUkgXDnMDYgE90keDRWsaww08zMn4XsduoeKxwjjKpawQe8LKHzJs4jVqqmTPlEDQpcH9PaOLEz95hI2w48GVykrFTGyuBud/CLrhFQjswkkAi34CM1QpVOshu7+7wfwpyQtR0uOX76w5prt4+YtqKdh46llxGSqUrtpfwn4x+PhE2jqkzEuPMbiPaTUomJYEFxcfmIrtShVNN7vwm46jkeoho/WKSwtCgb/ANbRyMKKzJCwjsCGAjoCLkjLNohykKAdRcx6z85UALJ369IZSiNRFZlgTzUsGIU99rvEucxiBMkzNlAHZ7W5wN3A7hUXMhT5yhmQwF787QqKlKz0hl0xzByLm5+sWCipWAAgdeHOYSw7Bid0tNsLCJmlhC0DCOYZipMRMNChRJI0KPKfPa2/g8CMQn1IvLUCOgT+Ihe3UrX2CftD10F/IH3ld4hoewnWDIX3kfinyPsRCpZ0dYpiC5qOymp6hTMtKrsocxqCNwbM0CMPqdjqNowrijNuTr9Ju1K+zD9j/Mt1JMiTU0CZ0tUtVwoWLOxgLSToPUM6DaazBwYnqEI5Ewzi7DZlLOyLSyC+Qjduezj3iBhs4uToDbKbpVptsNfWNu4uwFNTLKVJfl+T7dDz84yWbhapJWiYl8rFCt1B7em4jQYgLC6ayzUWAMcmSqEypCZkwApUUnKAbXDX6bt0HWAUifmUTqfqL+/5x1X1KlFKQHfbnZ/c/jBSSiTIl51d6avRA+FIB1XzJOiR9bDheBk9zYtqyRUvXn9/HcippQGWVdmr1PiwjTeCMWC5XxOUhiC7KB3A5u/pGUjtJ01L6E94cki5L7We0H+GMUNPNCk6JLkDdJsofj/mKwfMQ1lFPpZr8HvwZovEGCCcjPLN2cEbxXaGasf7WZiDuzsbsItVNVSlh5ZBzByB13/xAjifCSEpnyrKA7zbt9Y4/A25ZmKdy7G/KGsBmplFybHX84M4tTCdLOW5F0fl5/lFEwlXajMpTjlsPzi8YJUpy9m9xp4Rp1sGEz7FKnBlTzeMKL39nT8o9BCjvaJxmOmOamZlSVWtz948K6rEtL/eNkj8T0H5RARmWDmNyCHOzjaFb9SEOwdxiqgsNx6nvTYolWpAJLD3a/VjEqZNt+cZvidUafMojMQQG55iwIOwJ/e0eWIYpOnOnMrs2yovYFJJctue/wCOVOrQAapsYYRxdEGOVPEv0utlFWVM2WVbgKS/o7xLTL1eMZqa6YEkHYs5ufDr+3gtwvxqqUoS5pKpexOqTpry0tHCMp5IhbtKyj2maUulBVfRiPFxCw6q7NfYr3+A/gTy5f4h8OrEzAFJIIJceGkQMfSnNmdmSfVn/AjzjpXCDesTILHaZYoUDsCr+2lAn4hZX4Hz/OCJUBrGgrhl3DqKMpU4MeGgTjNeU91LjrziPR4mpF5inQee1usAOpXdt/zCihtuYQqUuXEeNNYsTr+9/GK3xDxYHKaZyS4KymwYt3X19N3GkUkcU1Uqa/aFYZ1IW6hqXF7ghjpC7MM/WO16SwpnqatieGpmJYi40MUnFcPUg5kjvp2H3kjl/Ny9PAvwdxtLqj2SyEzfugn4unjy5iDOMUOcONRCl1IYb0ndFzVnY8qNBVBQBBcGD1DUaRV8SpTKUZyBbWcjl/OkfUb66u5WgnhQBBhLODkR5lDCW6QvMIz/AP1Jw9SCJyEuCGUQDZr35A3vFtoKmCM6WFpINwdY06rBYuDEa7DpbhYBmfPYxBSAouQFbWv66eMQ0FUxTrcA/DZ3LaeMW7jrg0ycy5I7p72XYgatax879NxtLLAlIKkNZ0k7eHufKC7goyBNUXNrDtXgefme+JTZdPJEuWBnWHWp+dwny9y/SAkp09676H00+kdgmbPS+j3vpyfpBWqQlA73MkaOev6xN2Pznd1fqH0k6X9f+SRw/ja5R+HMBcXbXVLnzi7YHxWieTLWEgEhspUQAbAXAO8ZrIUZqgkjKkaAc+t7bxPwGb2dUCe8HD82difHVvCOHBPXcDZpaEpLHk+DLficj7PNBQohEw/8YPYfJCGWD3hd9Y8MYkZ5RHMW2HMEeIaBeAEzQylnunKQ/KC6Z8HbMS8bl3S//wDV0dYUVv7EfmhQ7kxPAk7FKjPOIGie6PLX3f0idSCAshbrUeaifcwdpTGEG32kma7rsrCiVbFqCnTVgVBJlzGKEkkJzpZnbbeCGeiQ7IQk6WLfSKp/q2ZzpUgtkuD+njaKRhVaqfeYp1s9yGI0AINrFv2YG+ntZiyvgZMqtd5C58TTKmuw6WG7KSf6kpV7qeK5iE7DFlwiWnbuLyC/8oOX2iHT4eJixLlJBKrJG/etdrsCxJ2HhFtrMEoqVGVcpE9e6piUqc9EmyR+3hd0FIDF25+kLYmw4zkyNwlXypaTLkzCoglSVTFBYSSPh7qQwIdjr4xaK+oC0Zge6U2LG7jrGa4lxShKMkhCEjbIhKUjZww7zDlF34eqO2pJd3KBkJ6ag/X0g1KW4YtnHjPcC2MgzmjrFyc2U5TYkdOvv6RYsHrjOlpmEu7t4Akfg8VfiMoGRnBWClXJm587mJ3AdQ9IgE3BUk+IURDPqMvszxmRqwy78cwnjckkhT2A/wA/h6RROI8UBKZfeCUnZrt8Pv8Au0adMl5g0ZRxlSdmu6FOS+trWII8LvHbjoidaZ1De6Rq6sCkHKpJKCFFILX0IB5Ny+ruHrl9oAtBbVhoxLuG0YubaMPCI08oWQmZly79Ceou2a3rHaZIAypUQn4Vbgh/ivp/mDryI9yCcDiR8KJQsTC6cx7pDvmSXe10nkfFo2Hh7iHtUgTVAqPq2ymsWPhGV4dLSJozDMgqulyQSzAjzbxtF4rOD1yP+4E4DKNNCHZ0jUKL728oXuD7ty5wO/pENVWEYA+ZcKzDQpWdLA6HkRu8ec/ApMqnWmSEpVdYUSWe5Yk/CjWwsIr0vieeqWwSJakukksczN3ha28QsRz1CBLmLzJ++CCyh1FgYWOs06sfbnPfxBr6hx7sYkjBccRNGZJHUOCx8RY+IsYtFDU5gOWvT9YyOTRLoZyJqDnp1nJv3Sr7ixt0fk3joVDVuxeOT/KbK9GNsvqL1zLLXU6JqClQeMV4jplSJipWXKATl3zAt3n6xr8ipeBHFGBpq0pQ4Sp2StnZ7MehLQ6tofBl6DUHSuc9H/EyaRNTIDg5pq7cgl2a7387fWPMLWZilTnXMIcPcPd2L6NvzLNHhPw6ZKqjKnJYoJccxsRzf8YmUOULUoLcJtqXSLd0F/H3hgkL3GvU9d9tfWfzMJ4hL7FOYsFqFh03PQN7eMBZVURM7T18Of4+cPW15qJxK1XOjlnLwptNl18DEAC9+ZWrcuorXpe/v/yarw5WCdIABukW/pLkN4H6wEoCr7TMQgs/e/D9+MUyiUqVlKAo3+J2ynkPBx+zFzpMxndokapGvW8cqMOJnain0l77H9pYfs8z5z7Q8ebzenvCh6ZckyO6sjqfqYKSpt9WgTWdyfNH85P/ACLj2MS6KpTmuY8/+Gwj5m043ID8TviHCROSMxsAXAGsY3g2AzDiH2UjLmUogjRKA6if+I9SPGN6mkFIbYj3tGe8Vn7JPlViElQllQUBqqUoZVAHmHBHUQ7cCgJXyP8APiJVWEfcdQ9VYhIokiXIl982GVOaYtXldR+nQRWcQ4dr6w5pgElBOi1ByOuVz5QWT/qDTZHkpUVEfIQb8yba9Yr2K8S1c4s6ZT6A3V1u/IjnrGVSlud2Pd9W4A+w/wCRlEduQPznqeEaSShps9a1b5MqR/5BR+kFuDezlr7OVMJQWBCyktyuAIpMrBampWyVKmc1FxLFrlR+FLctTBusmU9AhMmWvtJylAzFgAB7AltgBo7/AFgz+qrAb9zHwOvmU644aWPi51IT3W7Mk+Iv+kePANS3bIf74WPBY5eIME8SadKSoaKT/wDIP9Yp+BVBkzw9neWrx1SfUN/dBbMg/vxC04ZMTWpC3itceYP28lTcj5FrGC1DPcCJ06WFpKTvBQTZXgd+PvE3GxpitFw4UMpYCnHwvZ9T/iJBQhylChmQXYJtoHGmgP1g5ik9KCQHdyjQuCTy8BAY2mGYrMQWAyDc2AfT1hFL7XOScGFFjL5kTAckqaibOUlMpE1Kl2JIALpsAXDsDGroxunnp7h7RKiQ+RWVxrdmDW9RGR44UolhKQ6lkE5g7MbC9i5A9+ca2nFZH2ZKgEiWqWFJSBsRoEjxjX0lm+sloHVuX2kyoYnMlidMyBkoYHlmIBUHPQjSIdFiQVNTLGZyDazDqTqDAOmq5aSpKV3KiyWtZ+82umV/6YI8NYTUqWuchAWm6NW0KTYnezcrxjWafezYH2EsNtHMNrocqSyRMSQQtCtFpP4gaHpEUBUhlpJXJO+qkH5V9B83r1NYZVPMyKQpK03WFBgA+UO+r3bm0HcRw4KdSGzNcH4VdCILp6bGp93Y7EOmoCnBgOhrQQ4PKCUuYCLxWZ9AuWVGSCWIzSt0nmj5h09OUe1HigU1+pHUWb1+kUMrGWQPyJ6cccNCskrWgf76Q8s2dbXUg8wQARyKesZVVTVIlMr4ySVnU5tL8419OLZSGudunWKVxXgoKjUywlQ1mS233UG2OpFtDD9NwbCmVpv5Lkn6YHxKvR0hWES0AmY4IZLnnrvYaD3gjVU4lrKcyVr3IukWv4kcukRgteYhMtQ1BCdgdQ5JLdInUFGtSgSClIJ7uj6adCXfe3nDQUtyZ1ZfVT+Agn/H/Z4yJClzQzkBgNxo5P8AyJ/bRe8NcaJ5e1oh0NMBszbAWEH6Rbfd9oMlfuyZj3XFp7Z5nyGFHv8AaB8p9IUHxFcxuK5WWclfzJHqLH2ywMpJas75g3Jj+cWTi6S8pKx9xV/BVvrlisS1sf15fsRhaxNtx+eZuaR99I+OJbpEt5ZDuSNvWIPEGGJnylJYNl36xJwedo/7eJMuX3lpOlmtqWv9IdTD1j5me+UczC+GMMmrnrpUIdSSognRKdHPJN/eNJlcM01OBMqF9ooXy6IBZtNTa1/SDNBSSZK5uRATMmKdR3KQO6H3AOa20QeIuHftQbtjLHg4I5EOPrGRfexs2jj6n6fWNi9iAucCU3iPjRSkKlUqQmWO7mSAEp8G1OvTx0iiqQSHKnUXdy5PUk+Ua+jBqGlltNUJpF2VZHVkOza2L6wLxPjWmCcqDLAGgAHskR3VqEq9tKFj5MmVx+xJHAVYmdSFKixTu72bX118RAriGlCVlWhUAU8krSXv5gGJPCOISZs4qQnICQFqSkJCnvcAX8esTeLpCVoKkg2J8iLehH0MGNosyMYYeDLoOx8Howlw/iQWhKhuH8Oh6jSLPTznEZdw9UqlrKCCkKdaQbbsoB+pB/uMXrDqp44rf02xC317hkSRjWCJnAqSwW2rato8ZzX0iqdRE1JcudNw9gQGY9CHYxrUlbxHxjCpdRLMuYkEEa2cdRB30qvl07PfzEN+3g9TCMQmJUUkkkEncNzsxuzn6xceEuIqSVRlM1WQpWtklJKlBXedISCSHJHSBON8OmSVIUAE6gqLBh97xZhb8Yp9NOAUuW5KAohi9mJGm0E0zgZx4h1RbPaxhybkmBSk91yWP8t8r/Kp7+e0a9wZiMhdPLTLtlSAoHXM1yeZJcvu8ZLhFNLXMlS1hSUGYkqYkbt8QuH0135tG4iWhCE5UpCUswYABtGg2mUglgeILW1emQp8yo8XYZW9uaqQysssITLGrAlRPUlzbwEe9Ljs5UvuS3UliUkHM3nuevhHtivF8uWJoB/3E90IUCCVFiCAdUgF3HtAbhviFKEzEzmSu6lKe3mdmhfUKptGxsZ7gEJC8iFpFSirCVIBSbud0qBYpPTX0gTjOFGYWDS6gfCdETQOfXrqOogfw1i5+2LMpJVKmK7wZiCWGcD5SXPn5Rfq2jTMTcORdLM4OxSecCWrIznmNpdt4PUxepxSZLmKRMzy5g1SduXQjqNY9U4ws/e/A+NouOP4IipeRN7s+WHlTQLlJ3/mDhinztFSTw32JabmJe2yT1G5g9VavwODO7LSvJnvKqDMVmyBxZw4fUueZfeCNPLdWjPHnIkchBahpN4fSrbEbLMyRSS22MFqecBsR5R4SLbRMlTEwcCLkz0+2p5w8PmR0ho6lSxVUgTJapZ0Ukjwffy1jOZE3mGILM+8aSmKJxFSdlUKYd1ffT4n4h/yf1EZv8RryA4+00f4c/JQ+YVw2ebQXItm3ze2v4xTKWuuAItkmaTJcXIv6QvpbP6Z3q68HMg8UYYSgzpS8s9IKpTkMW+4QWGVWhuNYzeq48nzksiVkVcKAU4Ch11blGv1CM0oOHdN3P7eMN4nw40lbmFkLPPQ6i/OOtTp6nbJXmc6QgnDTlEsraZOKphdiFFgnVi2hBtHthWDzKiZllIzEvmJDBCX+JROn6G0F8AwRVWVIcolpIKyQ4AfS/3rWg3xDxFJo0CnpUjN01J+ZZ3MLtqCuErHu8CaN+xPYoyYKxyZKw+i+ySlBc9QOZehJOp6JGg8BvBjhKaKmkAJdWUpP9Sfh8ym3i8U2j4YrKzNNKbKv2kw5Un+ncjwDawX4Zop1DOyzSkyybmWrNl5FQIBYG7jr59V+nXkMwLnuIupHXiQMQnLSt+8TKPqLuB1yuB1blFowfEXSli4IBBGhGoaInGVPlmZxZO/n+rxV8KxDsJpkqLIUc0s7DNfI/J3blpyimq3g47EbFowM9Ga7QVjwXQuKLhtfoxixUVdEou2nBi99HkSXjOGIny8qhcXSeRjFeL+GVyVqmyxcfGnmC7n9Y3FM94g41homDMACoBj1TyPvDZxnevfn5ii5XgzDKKsSoDISkn1SfYHyaNVwjinMrsZ8sylgAozP3wwfUBlaluR6GBmDcHIRXiclIMkpUQCdJrpILdAFa73i0cScOS6koBOXZRAuUi5T+u0ERGALJ/aMXaiu0Klg/OVrGsOVXKlqkgPm+J2GS4Jfe/1h0/6fTQqUgTpapebNOzILliGSljdJuLkNc7tBLtPscxEpCSUqVll35uQHPWPfAMXqDUzZU+WpkjtM9mSl2y2+6btv3VP0T0hV2ZbAc7j9uDE3yB7ep3jGIyKKUpS0hKkhkpA+JTHKE8wW12Y8jHlwdxNLqpeXM05I76CQ7fMPmHUadLRSuOuKBWzpcmUl5SVhKVtqpRCHB5Xto8aFhUiVKlgJSAQlnYOfOHyvqHjoQYOwczxx6lVMyqR/ElnMk/MPvIPQj3aBFRNTMT3h3VB+viOREd4TxZJWsy1FpqVKQx3ylnB6/gYm/Z5MyX3VAElRBdtTb/HSM1wd2QeRNGpht2t1K52eRTG42PMQVpRa0CcRzSiUrGht16gwZ4bCFqGdXdOhFr8jGnptR6gwe4pqKPT5HUnU7kgNcweRggKQ5AO9oJU1HKR8KR47+sSMghwCJkwH/8Azg+f2/WFB3L1hReJMyEDATjGjzyO0A70o5v7TZX4H+2DQhLQFApOhBB8DYwK2vehU+YSp/TcMPEzSnnhJ+HXSLbhNU6fw9opdZJXLmLlqN0KbxTqD4EMfODmDVLMI8+jGt+Zu3ILE4lzlkEAbWil/wCofD/2iUoBgoB083Fxv0AizoqAE66MfIlvSHrpTqB2HxXs0aVh3p7e5lJ7GlVwyjnS8Pky5MsqmGUlS7gOtSQS5PI28ExFo+FaamBnVq0zFvmINkAsdfm10NhygRxBxTVUM8ykhBkTHVLJBGR9Ugi2V9tngfOrlz0GYtQmKLZRcIF9g97EO7+5jJWi1GJ63ef9D9/3j9SPZnB/+whxDx0pYy06e7sdA1wG5wN4XmVU+cVF8ssZlsGA+W53f6GBXDdNNqJnYJAcqJBZsqQ4KiflT+9RFj4pxqXSSfsNKXU3+5M3zHUk/NyGwbzLbpkr/lIuWPk/T6yvbtG2Ep8/7ZLmLTp8L/zCxPmpoquK0spVLmUlYnoXlNwAA4CgpLPr6H0ghwJXZZa0k90j0UGI9fyjjFO6uZmuJxKr7ZiTp0MMoopYAeJwP5iFZH4fxQ2Sq52VzHI9frFwoa57vGf0kli0HZMxSO9qN+n6QXVaTPvSVptT/Q80CkrNoM0q3ik4ZiIU2kWWhrNoVps2nmEvq+klVdOE99I0LkeG4+kR8Q4opZaXXNSkgabuzswuT0EEEzHiocXcPJWUzAHDuR10+hhl72qG5RkeYiawTzHxiXOqpUiolSyE/wAUAllpDOg5d3sWB5axZ8CqJUxCpySMy27R7FBSPgU+mVyb/MToYrUjjaVLUJM6WqWQyUlIKkGzABrjwbzjjhqi+2InzZmdEuaVoICintE5jYtqEgt1dUHqZC4dDnP7zBMDjB8SmY5j8hNbnkgditYY7KIN5gf4UlWjcn3aLFiPF0tEslioi2Uavy6DmYrvHmCppMiAvMhRUUpOoYAP6ln8oplPKc6knfbwHhFVBhnjHMMqK+J5SKtaZhWskkl1dCS5/GNd4PrpM8P2cuXNSLFL3ci7HS9teXOMs+x5gSNv0f6wX4TrTKmAfLtsQXcH6RVqBx8xgoa+R0Zo2PLAQUzUk3AzgHKm4AUTo3Qf4EYDMMtSkuCCyg22x/CCHFDmWlSQ6VpLaDUWDDfWIODEWUdxAKFYOJLWBrl/wbFXASq458oP5WDvFJkSAzptBUYx2UpWe5SO71OgHrGwpmWYazmFGdf9XqP/AHVQovcJWJfo6BjiHipcq/G2H2TUJ27sz+knuq8jbzHKANFOy3jRZkpKklCg6VAgjmCGMZzNo1SJypKr5S6T8yTdJ9NeoMY+vp2tvHR/Wa+gu3L6Z8fpLJQ1OhOmh8IOSVJUCNQLeP6RTTXiWANSYP4BiBmDS2j6AaW67xzpLf6TONVTj3CVb/VbBgulzpAC5PeSwuU2fqbRVeG6Q1KEypSQlRukjQAABT/KBb18I2LEaVK5SgQ4IIZtQbGKF/p1RimVWS7qWiYMid+yUCpJtzLj+yJrWCKT+f8AqTS37FOO5C4lUjC5AkyP/Uz/AOJOIu253ypGw8y8UXEKBUtiouXJJ10v4l3NzF94nwWtqZqV9i6bu6kMASLMTcM9t4B4lwpWqIPZKNi/eQAlzuSrzgOmuQIGZhk95I/KHQA5LEZgfhOsCZuVVgr/AMTFw4goM6JcwHQFLRWkcHVCO+VSQofczkqPgySPeLvwpNM1PYrax7z6gMX89G8YYL12j2HMATsbPiU+mHeix0clxA6upOznEdbdesG6AWjR07bqwYneMOcQXVU6pJzp+DcfL/8AmCuG4k7XicqUCIr1fha5RK5QJTqUjVPUcx0hTVaTPuSN6bVZ9jy8UdbpE4rCwQYz7DsVdrxY6LEQbZn/AHvzjPDleDGLKQeRBuOcPoCkzczAHvJ202/GIdBxeuSjKpCVS0CwDIITduh9up52+upDMQMrEgWBuDGe1GBTGXnSFlLuCG8Lcvyiq2dLMpwOIo6AjmU/iTF5tVOVNWLkuAD8KA+VIfk/Ry53iOic4DfENX3O8e9fgkwHunTZvxiGJSgbgg6aaRrg8ZkpOOJJpJ6srhgFW59Px/bRNwuUScw2Skm1xmKm8bCINJTTFKSlra+4JaLzgWD5Eauol1HyAYdItUyZ3fcNoEL0VVnosigcyVgp8Ddw/npziXQUqSAGZo9aCmGhETxSsXFoIlQXmIvYW4nVIgp10gVilRnXlGifc/p+cTcWrcicqfiPsOf5QNpZUG+IGc9jCiX2UKKxJLrDxzCjqXOkmAXGNAZkntEfHLuW1KPvDy18jzg4I6THFlYsUqZ3XYa2DDxMqlAHvG43e8WnCKsuBty2AgLxDQfZZxAH+0t1S+nNPk/oRBDCJ6RePPsrVvg+JvEramR5lwpZoJKd2HoeXnAGZKl09RNmkBKlpSnNcWSVKY7ar+vKOZVctU5CUnK6hfWw7x9hHtja1zFKl9mFJHxKOUsG1bnBbiL6secxD0ijfBlV4i40VKLSylR0ABfW20U/EuLq1ViQgHW1/f8AKAVVSfZqmZJIFldw6d094exbyi4YBMw6mSKmdPE6eA6ZY+FKmDd1nUoHc2+sDGlqpUEruP2Jz+uIddm3Pn6SNheFzJP/AHNataAxKELJBOt1J18Et5QZ4Zq+92ybBaiCDt8pPuD4iKjX102snKmLfvqOVJNkpZSbDno/URasOpgiTlNgMpf+4F/b3hlamU7m/EfA6HxAMczvFFPNA5XPnBKh0gcZRWsr+Y6cgLQXopJjTrXaoETsOTJiYeltMQQHuIcJtErB5Oacno59ILBTriDglE7/AHZDSppuofcWeZA+FXUWO43ijzZk6mWUTUlChsR7gixHUWjadoi4lh8qegomoC09dR1SRdJ6iF7tIlnI7jNOrZODyJnWH4/pe55QWp64qm2SDmSQo/TXWA/EnCi6bvyVEyzvuOhI2ivCpqZd02PzC58AdR5Rnf8AnsqbiOmyq0S5V3DqV73O/tflFbnYCZbukkXO5578g/vCwziKolhlJKw794l+esFJ2NzJgbs8oOxP5a+3vDI93QOYsVK9niB6CjSF6a+0WWko8t9ojU1LmIVvBynDphypNoitj7jOkSXEedZViWm9zoBzP5QqqqTKTzOw5/pAVRUs5la/uw6QXqCnIBUcyrkm/wC+UT5EuOJMqJAMVJHhQ0NEklshAQhCe8XLjiOhHEdiJJIGO4UmpkqlmytUK+VQ0PhsehjNKapVJWZcwFKkliOREa0DFW4z4ZVUZZkkJE0WU5bOkAtfTMDYPz1tCWr03qDcO45pNR6Z2t1B+C4jL7YM6lBCiflRoASdyXI9YLy69DKzKDquovYDcnpGY1M2qkEoWlcq98wIBPibHxjujqJ04iVLSuaSXIS7eJYXEIJUymOWMrczw4wkJXUiYhAIIsGNxmVr9fM8o8kYIJneEkIH8zt1YbB4tM3CloUEzUgLA2L2P18olSabpD9dTBcdRJrQDxAlFgzMSU7++rAaecE+wJDbA268ngpLkB/CPfsA6Q3WCrSAcwbWk8SJT0rekEJMphHoUW9o9ZoYGDAQRM8Qm0G8Aw4sJpO1h+cCSm3lFkwFJEkPHQnJk5N0w6LpjmnPdhSDqOsdSoyUBSMqgCNCDFVxLhYXMq4+XceBi0yixI846bveMURmWDiZr/0xiQQx5R7yqMNpF8rqBEz4hfmNYrWMSZdPrMB5J+/6cupYRztl7pEpJDC8edZiQQClF1ew8eZ6QMqsRWs5U91J9T4naFJkxMyo4BUcyiSTziZKlw0tEeotElTqGBhFUchUSSdPCjyzQokkuQjr9+whQouXOTHcPCiSRQoeFElTzrf4SvCIuCfAfEQoUcH8c6H4YA4y/io/p/GIcuFCi5J7I1j2+95flChRck9FbeP5x3P0MKFFyo64tOG/wx4QoUWJU9abSGkaq8YUKLknUv4/T8Y6OsKFEknlN1MZRP8A4y/6lfWFCim6kE95e0TUQoUcS57iOlaQoUXKnJ/KErWFCiSTmFChRJc//9k=",
            category: "Fast Food",
            rating: 4.2
        },
        {
            id: 11,
            name: "Lavash",
            description: "Yupqa non, tovuq go'shti, sabzavotlar va sous bilan",
            price: 20000,
            image: "images/lavash.png",
            category: "Fast Food",
            rating: 4.5
        },
        {
            id: 12,
            name: "Kartoshka Fri",
            description: "Qovurilgan kartoshka, ketchup yoki mayonez bilan",
            price: 12000,
            image: "images/kartoshka.png",
            category: "Fast Food",
            rating: 4.3
        },
        
        // Ichimliklar (6 ta)
        {
            id: 13,
            name: "Coca-Cola",
            description: "1.5L sovuq Coca-Cola",
            price: 10000,
            image: "images/cola.png",
            category: "Ichimliklar",
            rating: 4.3
        },
        {
            id: 14,
            name: "Choy",
            description: "Yashil yoki qora choy",
            price: 3000,
            image: "images/choy.png",
            category: "Ichimliklar",
            rating: 4.7
        },
        {
            id: 15,
            name: "Fanta",
            description: "1L sovuq apelsin sharbati",
            price: 9000,
            image: "images/fanta.png",
            category: "Ichimliklar",
            rating: 4.4
        },
        {
            id: 16,
            name: "Coffe",
            description: "Issiq capuchino",
            price: 5000,
            image: "images/coffe.png",
            category: "Ichimliklar",
            rating: 4.8
        },
        {
            id: 17,
            name: "Pepsi",
            description: "1.5L sovuq Pepsi",
            price: 10000,
            image: "data:image/jpeg;base64,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",
            category: "Ichimliklar",
            rating: 4.3
        },
        {
            id: 18,
            name: "Suv",
            description: "1.5L toza suv",
            price: 3000,
            image: "data:image/jpeg;base64,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",
            category: "Ichimliklar",
            rating: 4.9
        },
        
        // Shirinliklar (5 ta)
        {
            id: 19,
            name: "Halva",
            description: "An'anaviy shirinlik, yog' va un bilan",
            price: 15000,
            image: "data:image/jpeg;base64,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",
            category: "Shirinliklar",
            rating: 4.8
        },
        {
            id: 20,
            name: "Napalyon",
            description: "Qatlamli tort, krem bilan",
            price: 40000,
            image: "data:image/jpeg;base64,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",
            category: "Shirinliklar",
            rating: 4.9
        },
        {
            id: 21,
            name: "Medovik",
            description: "Asal asosidagi tort",
            price: 35000,
            image: "images/medovik.png",
            category: "Shirinliklar",
            rating: 4.7
        },
        {
            id: 22,
            name: "Chocolate Cake",
            description: "Shokoladli tort",
            price: 45000,
            image: "images/choco.png",
            category: "Shirinliklar",
            rating: 4.8
        },
        // {
        //     id: 23,
        //     name: "Qandolat",
        //     description: "An'anaviy o'zbek shirinligi",
        //     price: 12000,
        //     image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        //     category: "Shirinliklar",
        //     rating: 4.6
        // }
    ];
    
    const container = document.getElementById('allFoodsContainer');
    if (!container) return;
    
    let html = '';
    allFoods.forEach(food => {
        html += createFoodCard(food);
    });
    
    container.innerHTML = html;
    
    // Add event listeners to "Add to cart" buttons
    addCartEventListeners();
}

// Create food card HTML
function createFoodCard(food) {
    return `
        <div class="col-lg-4 col-md-6" data-category="${food.category}">
            <div class="card food-card">
                <div class="position-relative">
                    <img src="${food.image}" class="card-img-top food-img" alt="${food.name}">
                    ${food.isPopular ? '<span class="badge-custom position-absolute top-0 end-0 m-3">Mashhur</span>' : ''}
                </div>
                <div class="card-body food-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="food-title">${food.name}</h5>
                        <span class="food-price">${food.price.toLocaleString()} so'm</span>
                    </div>
                    <p class="food-description">${food.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="food-rating">
                                <i class="fas fa-star"></i> ${food.rating}
                            </span>
                            <span class="badge bg-secondary ms-2">${food.category}</span>
                        </div>
                        <button class="btn btn-primary btn-sm add-to-cart" data-food-id="${food.id}">
                            <i class="fas fa-cart-plus me-1"></i> Savatchaga
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Add event listeners to "Add to cart" buttons
function addCartEventListeners() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const foodId = parseInt(this.getAttribute('data-food-id'));
            addToCart(foodId);
        });
    });
}

// Add item to cart
function addToCart(foodId) {
    // Get food details
    const allFoods = [
        // Milliy Taomlar
        {id: 1, name: "Osh", price: 35000, image: "images/osh.png"},
        {id: 2, name: "Lag'mon", price: 28000, image: "images/lagman.png"},
        {id: 3, name: "Somsa", price: 8000, image: "images/somsa.png"},
        {id: 4, name: "Manti", price: 25000, image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"},
        {id: 5, name: "Shashlik", price: 20000, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"},
        {id: 6, name: "Chuchvara", price: 22000, image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"},
        {id: 7, name: "Norin", price: 30000, image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"},
        
        // Fast Food
        {id: 8, name: "Burger", price: 25000, image: "images/burger.png"},
        {id: 9, name: "Pizza", price: 60000, image: "images/pizza.png"},
        {id: 10, name: "Hot Dog", price: 15000, image: "https://images.unsplash.com/photo-1551782450-17144efb9c50?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"},
        {id: 11, name: "Lavash", price: 20000, image: "images/lavash.png"},
        {id: 12, name: "Kartoshka Fri", price: 12000, image: "images/kartoshka.png"},
        
        // Ichimliklar
        {id: 13, name: "Coca-Cola", price: 10000, image: "images/cola.png"},
        {id: 14, name: "Choy", price: 3000, image: "images/choy.png"},
        {id: 15, name: "Fanta", price: 9000, image: "images/fanta.png"},
        {id: 16, name: "Coffe", price: 5000, image: "images/coffe.png"},
        {id: 17, name: "Pepsi", price: 10000, image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"},
        {id: 18, name: "Suv", price: 3000, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"},
        
        // Shirinliklar
        {id: 19, name: "Halva", price: 15000, image: "images/halva.png"},
        {id: 20, name: "Napalyon", price: 40000, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"},
        {id: 21, name: "Medovik", price: 35000, image: "images/medovik.png"},
        {id: 22, name: "Chocolate Cake", price: 45000, image: "images/choco.png"},
        // {id: 23, name: "Qandolat", price: 12000, image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"},
    ];
    
    const food = allFoods.find(f => f.id === foodId);
    if (!food) return;
    
    // Get current cart
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if item already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === foodId);
    
    if (existingItemIndex > -1) {
        // Increment quantity
        cart[existingItemIndex].quantity += 1;
    } else {
        // Add new item
        cart.push({
            id: food.id,
            name: food.name,
            price: food.price,
            image: food.image,
            quantity: 1
        });
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show success message
    showAlert(`"${food.name}" savatchaga qo'shildi`, 'success');
}

// Update cart count in navbar
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
    
    // Update cart display if cart offcanvas is open
    if (typeof updateCartDisplay === 'function') {
        updateCartDisplay();
    }
}

// Perform search
function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    
    if (!searchTerm) {
        showAlert('Iltimos, qidiruv so\'zini kiriting', 'warning');
        return;
    }
    
    // Hide all sections except search results
    document.getElementById('categories')?.classList.add('d-none');
    document.getElementById('popular')?.classList.add('d-none');
    document.getElementById('allFoods')?.classList.add('d-none');
    document.getElementById('searchResults')?.classList.remove('d-none');
    
    // Get all foods
    const allFoods = document.querySelectorAll('#allFoodsContainer .col-lg-4');
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    
    let resultsHTML = '';
    let resultCount = 0;
    
    allFoods.forEach(foodCard => {
        const foodName = foodCard.querySelector('.food-title').textContent.toLowerCase();
        const foodDescription = foodCard.querySelector('.food-description').textContent.toLowerCase();
        const foodCategory = foodCard.getAttribute('data-category').toLowerCase();
        
        if (foodName.includes(searchTerm) || foodDescription.includes(searchTerm) || foodCategory.includes(searchTerm)) {
            resultsHTML += foodCard.outerHTML;
            resultCount++;
        }
    });
    
    if (resultCount > 0) {
        searchResultsContainer.innerHTML = resultsHTML;
        // Re-add event listeners to new buttons
        addCartEventListeners();
    } else {
        searchResultsContainer.innerHTML = `
            <div class="col-12 text-center">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h4 class="text-muted">"${searchTerm}" bo'yicha hech narsa topilmadi</h4>
                <p>Boshqa so'z bilan qidirib ko'ring</p>
            </div>
        `;
    }
    
    // Scroll to search results
    document.getElementById('searchResults')?.scrollIntoView({ behavior: 'smooth' });
}

// Clear search results
function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categories')?.classList.remove('d-none');
    document.getElementById('popular')?.classList.remove('d-none');
    document.getElementById('allFoods')?.classList.remove('d-none');
    document.getElementById('searchResults')?.classList.add('d-none');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}