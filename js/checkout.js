// Checkout Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize checkout
    initCheckout();
    
    // Event listeners
    setupEventListeners();
    
    // Load checkout data
    loadCheckoutData();
    loadSavedAddresses();
    
    // Set minimum date for delivery (tomorrow)
    setMinDeliveryDate();
});

// Initialize checkout
function initCheckout() {
    // Check if cart is empty
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        // Redirect to home page
        window.location.href = 'index.html';
        return;
    }
    
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        populateUserInfo(currentUser);
    }
    
    // Update cart count
    updateCartCount();
}

// Setup event listeners
function setupEventListeners() {
    // Address selection
    document.getElementById('useSavedAddress')?.addEventListener('change', toggleAddressFields);
    document.getElementById('newAddress')?.addEventListener('change', toggleAddressFields);
    
    // Delivery time selection
    document.getElementById('deliveryTime')?.addEventListener('change', toggleDeliveryTime);
    
    // Payment method selection
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', togglePaymentDetails);
    });
    
    // Payment gateway buttons
    document.querySelectorAll('.payment-gateway').forEach(button => {
        button.addEventListener('click', function() {
            selectPaymentGateway(this.getAttribute('data-gateway'));
        });
    });
    
    // Continue to payment button
    document.getElementById('continueToPayment')?.addEventListener('click', validateAndContinue);
    
    // Apply promo code
    document.getElementById('applyPromoCode')?.addEventListener('click', applyPromoCode);
    
    // Promo code suggestions
    document.querySelectorAll('.promo-badge').forEach(badge => {
        badge.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            document.getElementById('promoCode').value = code;
            applyPromoCode();
        });
    });
    
    // Enter key for promo code
    document.getElementById('promoCode')?.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            applyPromoCode();
        }
    });
}

// Load checkout data
function loadCheckoutData() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const deliveryFee = 15000;
    
    // Calculate subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Get applied promo code
    const appliedPromo = JSON.parse(localStorage.getItem('appliedPromo')) || null;
    
    // Calculate discount
    let discount = 0;
    if (appliedPromo) {
        if (appliedPromo.type === 'percentage') {
            discount = subtotal * (appliedPromo.value / 100);
        } else if (appliedPromo.type === 'fixed') {
            discount = appliedPromo.value;
        }
    }
    
    // Calculate total
    const total = subtotal + deliveryFee - discount;
    
    // Update order summary
    document.getElementById('checkoutSubtotal').textContent = formatCurrency(subtotal);
    document.getElementById('checkoutDelivery').textContent = formatCurrency(deliveryFee);
    document.getElementById('checkoutDiscount').textContent = formatCurrency(discount);
    document.getElementById('checkoutTotal').textContent = formatCurrency(total);
    
    // Load order items
    const container = document.getElementById('checkoutOrderItems');
    let html = '';
    
    cart.forEach(item => {
        html += `
            <div class="order-item">
                <div class="d-flex align-items-center">
                    <img src="${item.image}" alt="${item.name}" class="order-item-img">
                    <div class="order-item-details">
                        <div class="order-item-name">${item.name}</div>
                        <div class="order-item-quantity">${item.quantity} x ${formatCurrency(item.price)}</div>
                    </div>
                </div>
                <div class="order-item-price">
                    ${formatCurrency(item.price * item.quantity)}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Load saved addresses
function loadSavedAddresses() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const addresses = JSON.parse(localStorage.getItem('addresses')) || [];
    
    // Filter user addresses
    const userAddresses = currentUser ? 
        addresses.filter(addr => addr.userId === currentUser.id) : 
        [];
    
    const container = document.getElementById('savedAddresses');
    
    if (userAddresses.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                Saqlangan manzilingiz yo'q. Yangi manzil kiriting.
            </div>
        `;
        
        // Automatically select new address option
        document.getElementById('newAddress').checked = true;
        toggleAddressFields();
        return;
    }
    
    let html = '';
    userAddresses.forEach(address => {
        const isDefault = address.isDefault ? '<span class="default-badge">Asosiy</span>' : '';
        
        html += `
            <div class="address-option" data-address-id="${address.id}">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6>${address.title} ${isDefault}</h6>
                        <p class="mb-1">${address.fullAddress}</p>
                        ${address.phone ? `<p class="text-muted small mb-0">${address.phone}</p>` : ''}
                    </div>
                    <input type="radio" name="savedAddress" value="${address.id}" ${address.isDefault ? 'checked' : ''}>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Add event listeners to address options
    document.querySelectorAll('.address-option').forEach(option => {
        option.addEventListener('click', function() {
            // Select the radio button inside
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            
            // Update visual selection
            document.querySelectorAll('.address-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            this.classList.add('selected');
        });
        
        // Trigger click on default address
        const radio = option.querySelector('input[type="radio"]');
        if (radio.checked) {
            option.click();
        }
    });
}

// Populate user info if logged in
function populateUserInfo(user) {
    document.getElementById('firstName').value = user.firstName || '';
    document.getElementById('lastName').value = user.lastName || '';
    document.getElementById('email').value = user.email || '';
    
    // Format phone number if exists
    if (user.phone) {
        const phone = user.phone.replace('+998', '').trim();
        document.getElementById('phone').value = phone;
    }
}

// Toggle address fields
function toggleAddressFields() {
    const useSavedAddress = document.getElementById('useSavedAddress').checked;
    const newAddressFields = document.getElementById('newAddressFields');
    
    if (useSavedAddress) {
        newAddressFields.style.display = 'none';
        // Make saved address required
        document.getElementById('address').required = false;
    } else {
        newAddressFields.style.display = 'block';
        // Make address field required
        document.getElementById('address').required = true;
    }
}

// Toggle delivery time
function toggleDeliveryTime() {
    const deliveryTime = document.getElementById('deliveryTime').value;
    const specificTimeDiv = document.getElementById('specificTime');
    
    if (deliveryTime === 'specific') {
        specificTimeDiv.style.display = 'block';
    } else {
        specificTimeDiv.style.display = 'none';
    }
}

// Toggle payment details
function togglePaymentDetails() {
    const onlinePayment = document.getElementById('onlinePayment').checked;
    const onlinePaymentDetails = document.getElementById('onlinePaymentDetails');
    
    if (onlinePayment) {
        onlinePaymentDetails.style.display = 'block';
    } else {
        onlinePaymentDetails.style.display = 'none';
        // Hide card payment form if shown
        document.getElementById('cardPaymentForm').style.display = 'none';
    }
}

// Select payment gateway
function selectPaymentGateway(gateway) {
    // Remove active class from all buttons
    document.querySelectorAll('.payment-gateway').forEach(btn => {
        btn.classList.remove('active');
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline-primary', 'btn-outline-success', 'btn-outline-secondary');
    });
    
    // Add active class to selected button
    const selectedBtn = document.querySelector(`[data-gateway="${gateway}"]`);
    selectedBtn.classList.remove('btn-outline-primary', 'btn-outline-success', 'btn-outline-secondary');
    selectedBtn.classList.add('btn-primary', 'active');
    
    // Show/hide card payment form
    const cardPaymentForm = document.getElementById('cardPaymentForm');
    if (gateway === 'card') {
        cardPaymentForm.style.display = 'block';
    } else {
        cardPaymentForm.style.display = 'none';
    }
}

// Set minimum delivery date (tomorrow)
function setMinDeliveryDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    
    const minDate = `${year}-${month}-${day}`;
    document.getElementById('deliveryDate').min = minDate;
    
    // Set default date to tomorrow
    document.getElementById('deliveryDate').value = minDate;
}

// Apply promo code
function applyPromoCode() {
    const promoCodeInput = document.getElementById('promoCode');
    const promoCode = promoCodeInput.value.trim().toUpperCase();
    
    if (!promoCode) {
        showAlert('Iltimos, promo-kodni kiriting', 'warning');
        return;
    }
    
    // Define valid promo codes (in real app, this would come from server)
    const validPromoCodes = {
        'OSH10': { type: 'percentage', value: 10, description: '10% chegirma' },
        'FIRSTORDER': { type: 'percentage', value: 15, description: 'Birinchi buyurtmangiz uchun 15% chegirma' },
        'UZB20': { type: 'fixed', value: 20000, description: '20,000 so\'m chegirma' }
    };
    
    if (validPromoCodes[promoCode]) {
        // Save applied promo code
        localStorage.setItem('appliedPromo', JSON.stringify({
            code: promoCode,
            ...validPromoCodes[promoCode]
        }));
        
        // Reload checkout data to update totals
        loadCheckoutData();
        
        // Show success message
        showAlert(`"${promoCode}" promo-kodi muvaffaqiyatli qo'llandı. ${validPromoCodes[promoCode].description}`, 'success');
        
        // Disable input and button
        promoCodeInput.disabled = true;
        document.getElementById('applyPromoCode').disabled = true;
        document.getElementById('applyPromoCode').textContent = 'Qo\'llangan';
        document.getElementById('applyPromoCode').classList.remove('btn-outline-primary');
        document.getElementById('applyPromoCode').classList.add('btn-success');
    } else {
        showAlert('Noto\'g\'ri yoki muddati o\'tgan promo-kod', 'danger');
    }
}

// Validate and continue to payment
function validateAndContinue() {
    // Validate delivery form
    if (!validateDeliveryForm()) {
        return;
    }
    
    // Validate payment method
    if (!validatePaymentMethod()) {
        return;
    }
    
    // Show payment confirmation modal
    showPaymentConfirmation();
}

// Validate delivery form
function validateDeliveryForm() {
    let isValid = true;
    
    // Required fields
    const requiredFields = ['firstName', 'lastName', 'phone'];
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}Error`) || createErrorElement(fieldId);
        
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            errorElement.textContent = 'Bu maydon to\'ldirilishi shart';
            errorElement.style.display = 'block';
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
            errorElement.style.display = 'none';
        }
    });
    
    // Validate phone number
    const phoneField = document.getElementById('phone');
    const phoneError = document.getElementById('phoneError') || createErrorElement('phone');
    const phoneRegex = /^[0-9]{9}$/;
    
    if (phoneField.value && !phoneRegex.test(phoneField.value.replace(/\s/g, ''))) {
        phoneField.classList.add('is-invalid');
        phoneError.textContent = 'Noto\'g\'ri telefon raqami formati (masalan: 90 123 45 67)';
        phoneError.style.display = 'block';
        isValid = false;
    }
    
    // Validate address
    if (document.getElementById('newAddress').checked) {
        const addressField = document.getElementById('address');
        const addressError = document.getElementById('addressError') || createErrorElement('address');
        
        if (!addressField.value.trim()) {
            addressField.classList.add('is-invalid');
            addressError.textContent = 'Manzil to\'ldirilishi shart';
            addressError.style.display = 'block';
            isValid = false;
        } else {
            addressField.classList.remove('is-invalid');
            addressField.classList.add('is-valid');
            addressError.style.display = 'none';
        }
    } else {
        // Check if a saved address is selected
        const selectedAddress = document.querySelector('input[name="savedAddress"]:checked');
        if (!selectedAddress) {
            showAlert('Iltimos, manzilni tanlang', 'warning');
            isValid = false;
        }
    }
    
    return isValid;
}

// Validate payment method
function validatePaymentMethod() {
    const onlinePayment = document.getElementById('onlinePayment').checked;
    
    if (onlinePayment) {
        // Check if payment gateway is selected
        const selectedGateway = document.querySelector('.payment-gateway.active');
        if (!selectedGateway) {
            showAlert('Iltimos, to\'lov tizimini tanlang', 'warning');
            return false;
        }
        
        // If card payment, validate card details
        if (selectedGateway.getAttribute('data-gateway') === 'card') {
            return validateCardDetails();
        }
    }
    
    return true;
}

// Validate card details
function validateCardDetails() {
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCVC = document.getElementById('cardCVC').value;
    const cardHolder = document.getElementById('cardHolder').value;
    
    // Validate card number (simple Luhn check)
    if (!validateCardNumber(cardNumber)) {
        showAlert('Noto\'g\'ri karta raqami', 'danger');
        return false;
    }
    
    // Validate expiry date
    if (!validateExpiryDate(cardExpiry)) {
        showAlert('Noto\'g\'ri amal qilish muddati', 'danger');
        return false;
    }
    
    // Validate CVC
    if (!/^[0-9]{3,4}$/.test(cardCVC)) {
        showAlert('Noto\'g\'ri CVC kod', 'danger');
        return false;
    }
    
    // Validate card holder name
    if (!cardHolder.trim()) {
        showAlert('Karta egasi ismini kiriting', 'danger');
        return false;
    }
    
    return true;
}

// Validate card number using Luhn algorithm
function validateCardNumber(cardNumber) {
    // Remove non-digit characters
    cardNumber = cardNumber.replace(/\D/g, '');
    
    // Check if length is valid
    if (cardNumber.length < 13 || cardNumber.length > 19) {
        return false;
    }
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i), 10);
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return (sum % 10) === 0;
}

// Validate expiry date
function validateExpiryDate(expiry) {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        return false;
    }
    
    const [month, year] = expiry.split('/').map(Number);
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    // Check if month is valid
    if (month < 1 || month > 12) {
        return false;
    }
    
    // Check if card is expired
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
        return false;
    }
    
    return true;
}

// Create error element for form validation
function createErrorElement(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.createElement('div');
    errorElement.id = `${fieldId}Error`;
    errorElement.className = 'validation-error';
    
    field.parentNode.appendChild(errorElement);
    return errorElement;
}

// Show payment confirmation
function showPaymentConfirmation() {
    // Collect all order data
    const orderData = collectOrderData();
    
    // Update progress steps
    updateProgressSteps();
    
    // Show payment modal with order summary
    const paymentModal = new bootstrap.Modal(document.getElementById('paymentModal'));
    
    // Build confirmation HTML
    const confirmationHTML = buildPaymentConfirmationHTML(orderData);
    document.querySelector('.payment-confirmation').innerHTML = confirmationHTML;
    
    // Add event listener to confirm button
    document.getElementById('confirmPaymentBtn')?.addEventListener('click', function() {
        processPayment(orderData);
    });
    
    paymentModal.show();
}

// Collect order data
function collectOrderData() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const appliedPromo = JSON.parse(localStorage.getItem('appliedPromo')) || null;
    const deliveryFee = 15000;
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    
    if (appliedPromo) {
        if (appliedPromo.type === 'percentage') {
            discount = subtotal * (appliedPromo.value / 100);
        } else if (appliedPromo.type === 'fixed') {
            discount = appliedPromo.value;
        }
    }
    
    const total = subtotal + deliveryFee - discount;
    
    // Get delivery info
    const useSavedAddress = document.getElementById('useSavedAddress').checked;
    let deliveryAddress = '';
    
    if (useSavedAddress) {
        const selectedAddressId = document.querySelector('input[name="savedAddress"]:checked').value;
        const addresses = JSON.parse(localStorage.getItem('addresses')) || [];
        const selectedAddress = addresses.find(addr => addr.id == selectedAddressId);
        deliveryAddress = selectedAddress ? selectedAddress.fullAddress : '';
    } else {
        deliveryAddress = document.getElementById('address').value;
        
        // Save address if requested
        if (document.getElementById('saveAddress').checked) {
            saveNewAddress();
        }
    }
    
    // Get payment method
    let paymentMethod = '';
    if (document.getElementById('cashOnDelivery').checked) {
        paymentMethod = 'Naqd pul';
    } else if (document.getElementById('cardOnDelivery').checked) {
        paymentMethod = 'Karta (yetkazib berilganda)';
    } else if (document.getElementById('onlinePayment').checked) {
        const selectedGateway = document.querySelector('.payment-gateway.active');
        paymentMethod = selectedGateway ? `Onlayn to'lov (${selectedGateway.getAttribute('data-gateway')})` : 'Onlayn to\'lov';
    }
    
    // Get delivery time
    const deliveryTimeOption = document.getElementById('deliveryTime').value;
    let deliveryTime = 'Imkon qadar tezroq (30-45 daqiqa)';
    
    if (deliveryTimeOption === 'specific') {
        const date = document.getElementById('deliveryDate').value;
        const time = document.getElementById('deliveryHour').value;
        deliveryTime = `${date} ${time}`;
    }
    
    return {
        id: Date.now(), // Generate unique order ID
        customerName: `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`,
        customerPhone: `+998${document.getElementById('phone').value.replace(/\s/g, '')}`,
        customerEmail: document.getElementById('email').value,
        deliveryAddress,
        deliveryTime,
        orderNotes: document.getElementById('orderNotes').value,
        paymentMethod,
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
        })),
        subtotal,
        deliveryFee,
        discount,
        total,
        status: 'pending',
        paymentStatus: document.getElementById('onlinePayment').checked ? 'paid' : 'pending',
        orderDate: new Date().toISOString(),
        // Add user ID if logged in
        userId: JSON.parse(localStorage.getItem('currentUser'))?.id || null
    };
}

// Save new address
function saveNewAddress() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const addresses = JSON.parse(localStorage.getItem('addresses')) || [];
    const title = document.getElementById('addressTitle').value || 'Yangi manzil';
    const fullAddress = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;
    const region = document.getElementById('region').value;
    const district = document.getElementById('district').value;
    const landmark = document.getElementById('landmark').value;
    
    // Build full address string
    let addressString = fullAddress;
    if (district) addressString += `, ${district}`;
    if (region) {
        const regionNames = {
            'tashkent': 'Toshkent shahri',
            'tashkent-region': 'Toshkent viloyati',
            'samarkand': 'Samarqand',
            'bukhara': 'Buxoro',
            'andijan': 'Andijon',
            'fergana': 'Farg\'ona',
            'namangan': 'Namangan',
            'khorezm': 'Xorazm',
            'navoi': 'Navoiy',
            'kashkadarya': 'Qashqadaryo',
            'surkhandarya': 'Surxondaryo',
            'jizzakh': 'Jizzax',
            'sirdarya': 'Sirdaryo',
            'karakalpakstan': 'Qoraqalpog\'iston'
        };
        addressString += `, ${regionNames[region] || region}`;
    }
    if (landmark) addressString += ` (${landmark})`;
    
    const newAddress = {
        id: addresses.length > 0 ? Math.max(...addresses.map(a => a.id)) + 1 : 1,
        userId: currentUser.id,
        title,
        fullAddress: addressString,
        phone: `+998${phone.replace(/\s/g, '')}`,
        isDefault: addresses.filter(a => a.userId === currentUser.id).length === 0
    };
    
    addresses.push(newAddress);
    localStorage.setItem('addresses', JSON.stringify(addresses));
}

// Build payment confirmation HTML
function buildPaymentConfirmationHTML(orderData) {
    let itemsHTML = '';
    orderData.items.forEach(item => {
        itemsHTML += `
            <div class="d-flex justify-content-between mb-2">
                <span>${item.name} x${item.quantity}</span>
                <span>${formatCurrency(item.price * item.quantity)}</span>
            </div>
        `;
    });
    
    return `
        <div class="order-summary-confirmation">
            <h6 class="mb-3">Buyurtma ma'lumotlari:</h6>
            
            <div class="mb-4">
                <div class="row mb-3">
                    <div class="col-md-6">
                        <p class="mb-2"><strong>Mijoz:</strong> ${orderData.customerName}</p>
                        <p class="mb-2"><strong>Telefon:</strong> ${orderData.customerPhone}</p>
                        ${orderData.customerEmail ? `<p class="mb-2"><strong>Email:</strong> ${orderData.customerEmail}</p>` : ''}
                    </div>
                    <div class="col-md-6">
                        <p class="mb-2"><strong>Yetkazib berish:</strong> ${orderData.deliveryTime}</p>
                        <p class="mb-2"><strong>To'lov usuli:</strong> ${orderData.paymentMethod}</p>
                    </div>
                </div>
                
                <div class="mb-3">
                    <p class="mb-2"><strong>Manzil:</strong></p>
                    <p class="mb-0">${orderData.deliveryAddress}</p>
                </div>
                
                ${orderData.orderNotes ? `
                    <div class="mb-3">
                        <p class="mb-2"><strong>Izoh:</strong></p>
                        <p class="mb-0">${orderData.orderNotes}</p>
                    </div>
                ` : ''}
            </div>
            
            <h6 class="mb-3">Buyurtma mahsulotlari:</h6>
            <div class="mb-4">
                ${itemsHTML}
            </div>
            
            <div class="border-top pt-3">
                <div class="d-flex justify-content-between mb-2">
                    <span>Mahsulotlar:</span>
                    <span>${formatCurrency(orderData.subtotal)}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span>Yetkazib berish:</span>
                    <span>${formatCurrency(orderData.deliveryFee)}</span>
                </div>
                ${orderData.discount > 0 ? `
                    <div class="d-flex justify-content-between mb-2">
                        <span>Chegirma:</span>
                        <span class="text-success">-${formatCurrency(orderData.discount)}</span>
                    </div>
                ` : ''}
                <div class="d-flex justify-content-between fw-bold fs-5 mt-3 pt-3 border-top">
                    <span>Umumiy summa:</span>
                    <span>${formatCurrency(orderData.total)}</span>
                </div>
            </div>
            
            <div class="mt-4">
                <p class="text-muted small mb-3">
                    <i class="fas fa-info-circle me-1"></i>
                    "Tasdiqlash" tugmasini bosish orqali siz bizning 
                    <a href="#" class="text-decoration-none">foydalanish shartlari</a> va 
                    <a href="#" class="text-decoration-none">maxfiylik siyosati</a>ga roziligingizni bildirasiz.
                </p>
                
                <div class="d-grid gap-2">
                    <button class="btn btn-success btn-lg" id="confirmPaymentBtn">
                        <i class="fas fa-check-circle me-2"></i>Buyurtmani tasdiqlash
                    </button>
                    <button class="btn btn-outline-secondary" data-bs-dismiss="modal">
                        Ortga qaytish
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Process payment
function processPayment(orderData) {
    // In real app, this would process payment through gateway
    // For demo, we'll simulate processing
    
    // Show loading state
    const confirmBtn = document.getElementById('confirmPaymentBtn');
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Ishlov berilmoqda...';
    
    // Simulate API call delay
    setTimeout(() => {
        // Save order to localStorage
        saveOrder(orderData);
        
        // Clear cart
        localStorage.removeItem('cart');
        localStorage.removeItem('appliedPromo');
        
        // Update cart count
        updateCartCount();
        
        // Close payment modal
        bootstrap.Modal.getInstance(document.getElementById('paymentModal')).hide();
        
        // Show confirmation modal
        showOrderConfirmation(orderData);
        
        // Reset button
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<i class="fas fa-check-circle me-2"></i>Buyurtmani tasdiqlash';
    }, 2000);
}

// Save order to localStorage
function saveOrder(orderData) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Show order confirmation
function showOrderConfirmation(orderData) {
    // Update confirmation modal content
    document.getElementById('orderNumber').textContent = `#${orderData.id}`;
    document.getElementById('confirmationAddress').textContent = orderData.deliveryAddress;
    document.getElementById('confirmationTime').textContent = orderData.deliveryTime;
    document.getElementById('confirmationPayment').textContent = orderData.paymentMethod;
    document.getElementById('confirmationTotal').textContent = formatCurrency(orderData.total);
    
    // Show confirmation modal
    const confirmationModal = new bootstrap.Modal(document.getElementById('orderConfirmationModal'));
    confirmationModal.show();
}

// Update progress steps
function updateProgressSteps() {
    const steps = document.querySelectorAll('.step');
    // Mark first two steps as completed, third as active
    steps[0].classList.add('completed');
    steps[1].classList.add('completed');
    steps[1].classList.remove('active');
    steps[2].classList.add('active');
}

// Helper function to format currency
function formatCurrency(amount) {
    return amount.toLocaleString('uz-UZ') + ' so\'m';
}

// Helper function to show alert
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
