// Default Food Menu Data
const defaultMenu = [
    { id: 1, name: 'Margherita Pizza', category: 'Pizza', price: 99 },
    { id: 2, name: 'Veg Burger', category: 'Burger', price: 90 },
    { id: 3, name: 'Grilled Sandwich', category: 'Sandwich', price: 120 },
    { id: 4, name: 'Cold Drink', category: 'Drinks', price: 50 },
    { id: 5, name: 'Chocolate Dessert', category: 'Desserts', price: 90 }
];

// Initialize menu in LocalStorage if not exists
if (!localStorage.getItem('fh_menu') || JSON.parse(localStorage.getItem('fh_menu')).length === 0) {
    localStorage.setItem('fh_menu', JSON.stringify(defaultMenu));
}

// Error Helpers
function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.innerText = msg;
}

function clearErrors() {
    document.querySelectorAll('.error-msg').forEach(el => el.innerText = '');
}

// Client Register Validation
function validateRegister(e) {
    e.preventDefault();
    clearErrors();

    const name = document.getElementById('reg_name').value.trim();
    const email = document.getElementById('reg_email').value.trim();
    const mobile = document.getElementById('reg_mobile').value.trim();
    const pass = document.getElementById('reg_pass').value;
    const cpass = document.getElementById('reg_cpass').value;

    let valid = true;

    if (!name) {
        showError('err_name', 'Name is required.');
        valid = false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        showError('err_email', 'Please enter a valid email address.');
        valid = false;
    }
    if (!/^\d{10}$/.test(mobile)) {
        showError('err_mobile', 'Enter a valid 10-digit mobile number.');
        valid = false;
    }
    if (pass.length < 6) {
        showError('err_pass', 'Password must be at least 6 characters.');
        valid = false;
    }
    if (pass !== cpass) {
        showError('err_cpass', 'Passwords do not match.');
        valid = false;
    }

    if (valid) {
        const users = JSON.parse(localStorage.getItem('fh_users') || '[]');
        users.push({ name, email, mobile, password: pass });
        localStorage.setItem('fh_users', JSON.stringify(users));
        alert('Account created successfully! Please login.');
        window.location.href = 'login.html';
    }
}

// Client Login Validation
function validateLogin(e) {
    e.preventDefault();
    clearErrors();

    const identity = document.getElementById('login_id').value.trim();
    const pass = document.getElementById('login_pass').value;
    let valid = true;

    if (!identity) {
        showError('err_login_id', 'Email or mobile number is required.');
        valid = false;
    }
    if (!pass) {
        showError('err_login_pass', 'Password is required.');
        valid = false;
    }

    if (valid) {
        const users = JSON.parse(localStorage.getItem('fh_users') || '[]');
        const user = users.find(u => (u.email === identity || u.mobile === identity) && u.password === pass);

        if (user) {
            localStorage.setItem('fh_current_user', JSON.stringify(user));
            alert('Login successful!');
            window.location.href = 'index.html';
        } else {
            showError('err_login_id', 'Invalid credentials or user not found.');
        }
    }
}

// Add Item To Cart
function addToCart(itemId) {
    let menu = JSON.parse(localStorage.getItem('fh_menu') || '[]');
    
    if (menu.length === 0) {
        menu = defaultMenu;
        localStorage.setItem('fh_menu', JSON.stringify(menu));
    }

    const item = menu.find(m => m.id === itemId);
    if (!item) {
        alert("Item not found!");
        return;
    }

    let cart = JSON.parse(localStorage.getItem('fh_cart') || '[]');
    const existingIndex = cart.findIndex(c => c.id === itemId);

    if (existingIndex > -1) {
        cart[existingIndex].qty += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            qty: 1
        });
    }

    localStorage.setItem('fh_cart', JSON.stringify(cart));
    alert(item.name + " added to cart!");
}

// Load Cart in order-summary.html
function loadCart() {
    const cartTable = document.getElementById('cart_items');
    const grandTotalEl = document.getElementById('grand_total');
    if (!cartTable) return;

    const cart = JSON.parse(localStorage.getItem('fh_cart') || '[]');
    cartTable.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartTable.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Your cart is empty.</td></tr>';
        if (grandTotalEl) grandTotalEl.innerText = '₹0';
        return;
    }

    cart.forEach((item, index) => {
        const subtotal = item.price * item.qty;
        total += subtotal;
        cartTable.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.qty}</td>
                <td>₹${item.price}</td>
                <td>₹${subtotal}</td>
                <td><button class="btn btn-danger btn-small" onclick="removeFromCart(${index})">Remove</button></td>
            </tr>
        `;
    });

    if (grandTotalEl) grandTotalEl.innerText = '₹' + total;
}

// Remove Item from Cart
function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('fh_cart') || '[]');
    cart.splice(index, 1);
    localStorage.setItem('fh_cart', JSON.stringify(cart));
    loadCart();
}

// Confirm Order Function
function confirmOrder() {
    const cart = JSON.parse(localStorage.getItem('fh_cart') || '[]');
    if (cart.length === 0) {
        alert('Cart is empty! Add items from the menu first.');
        return;
    }
    const user = JSON.parse(localStorage.getItem('fh_current_user') || '{"name":"Guest"}');
    const orders = JSON.parse(localStorage.getItem('fh_orders') || '[]');

    let amount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const newOrder = {
        id: '#' + Math.floor(10000 + Math.random() * 90000),
        customer: user.name,
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        status: 'Pending',
        items: cart
    };

    orders.push(newOrder);
    localStorage.setItem('fh_orders', JSON.stringify(orders));
    localStorage.removeItem('fh_cart');
    alert('Order confirmed successfully! Order ID: ' + newOrder.id);
    window.location.href = 'index.html';
}

// Admin: Mark Delivered
function updateOrderStatus(index) {
    const orders = JSON.parse(localStorage.getItem('fh_orders') || '[]');
    orders[index].status = 'Delivered';
    localStorage.setItem('fh_orders', JSON.stringify(orders));
    if (typeof renderOrders === "function") {
        renderOrders();
    }
}