// Cart functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart display
    updateCartDisplay();
    
    // Add event listener for checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart.length === 0) {
                e.preventDefault();
                showAlert('Savatchangiz bo\'sh. Buyurtma berish uchun avval taom qo\'shing.', 'warning');
            }
        });
    }
});

// Update cart display in offcanvas
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    const cartGrandTotalElement = document.getElementById('cartGrandTotal');
    
    if (!cartItemsContainer || !cartTotalElement || !cartGrandTotalElement) return;
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-center text-muted">Savatchangiz bo\'sh</p>';
        cartTotalElement.textContent = '0 so\'m';
        cartGrandTotalElement.textContent = '15 000 so\'m';
        return;
    }
    
    let itemsHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        itemsHTML += `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="row align-items-center">
                    <div class="col-3">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    </div>
                    <div class="col-6">
                        <h6 class="mb-1">${item.name}</h6>
                        <p class="mb-1 text-muted">${item.price.toLocaleString()} so'm</p>
                    </div>
                    <div class="col-3">
                        <div class="d-flex align-items-center">
                            <button class="btn btn-sm btn-outline-secondary decrease-qty" data-item-id="${item.id}">-</button>
                            <span class="mx-2">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary increase-qty" data-item-id="${item.id}">+</button>
                        </div>
                        <button class="btn btn-link btn-sm text-danger remove-item mt-1" data-item-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    const deliveryFee = 15000;
    const grandTotal = total + deliveryFee;
    
    cartItemsContainer.innerHTML = itemsHTML;
    cartTotalElement.textContent = total.toLocaleString() + ' so\'m';
    cartGrandTotalElement.textContent = grandTotal.toLocaleString() + ' so\'m';
    
    // Add event listeners to cart buttons
    addCartItemEventListeners();
}

// Add event listeners to cart item buttons
function addCartItemEventListeners() {
    // Increase quantity buttons
    const increaseButtons = document.querySelectorAll('.increase-qty');
    increaseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-item-id'));
            updateCartItemQuantity(itemId, 1);
        });
    });
    
    // Decrease quantity buttons
    const decreaseButtons = document.querySelectorAll('.decrease-qty');
    decreaseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-item-id'));
            updateCartItemQuantity(itemId, -1);
        });
    });
    
    // Remove item buttons
    const removeButtons = document.querySelectorAll('.remove-item');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const itemId = parseInt(this.getAttribute('data-item-id'));
            removeCartItem(itemId);
        });
    });
}

// Update cart item quantity
function updateCartItemQuantity(itemId, change) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    if (itemIndex > -1) {
        cart[itemIndex].quantity += change;
        
        // If quantity is 0 or less, remove item
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        
        // Save updated cart
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart display
        updateCartDisplay();
        updateCartCount();
    }
}

// Remove item from cart
function removeCartItem(itemId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== itemId);
    
    // Save updated cart
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart display
    updateCartDisplay();
    updateCartCount();
    
    showAlert('Mahsulot savatchadan o\'chirildi', 'info');
}

// Show alert (redefined for cart.js if needed)
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
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 3000);
}