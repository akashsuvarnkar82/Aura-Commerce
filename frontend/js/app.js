document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const productsGrid = document.getElementById('productsGrid');
    const searchInput = document.getElementById('searchInput');
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    // Modals & Overlays
    const overlay = document.getElementById('overlay');
    const authModal = document.getElementById('authModal');
    const paymentModal = document.getElementById('paymentModal');
    const ordersModal = document.getElementById('ordersModal');
    const adminModal = document.getElementById('adminModal');
    const authBtn = document.getElementById('authBtn');
    const ordersBtn = document.getElementById('ordersBtn');
    const adminBtn = document.getElementById('adminBtn');
    const closeModals = document.querySelectorAll('.close-modal');
    
    // Cart
    const cartSidebar = document.getElementById('cartSidebar');
    const cartBtn = document.getElementById('cartBtn');
    const closeCart = document.getElementById('closeCart');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const cartTotalAmount = document.getElementById('cartTotalAmount');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutMessage = document.getElementById('checkoutMessage');
    
    // Auth Forms
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    
    // State
    let currentCategory = '';
    let currentSearch = '';
    
    // Initialization
    init();

    async function init() {
        updateAuthUI();
        await loadProducts();
        if (api.isLoggedIn()) {
            await updateCartUI();
        }
    }

    // --- JWT Helper ---
    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64).split('').map(c =>
                    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                ).join('')
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }

    function isAdmin() {
        if (!api.isLoggedIn()) return false;
        const payload = parseJwt(api.token);
        return payload && payload.role === 'admin';
    }

    // =====================================================
    // --- Product Image & Badge Map ---
    // =====================================================
    const productImageMap = {
        // Headphones
        'Aura Pro Headphones':        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=85',
        'Aura Buds True Wireless':    'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600&q=85',
        'NoiseFree Elite ANC':        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=85',
        'Bass X Over-Ear':            'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=85',
        'Sport Buds Pro':             'https://images.unsplash.com/photo-1601370690183-1c7796ecec61?w=600&q=85',
        'Crystal Clear IEM':          'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=85',

        // Speakers
        'Studio Monitors X1':         'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=85',
        'Desktop Soundbar':           'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85',
        'BoomPod Portable Speaker':   'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=85',
        'HomeFill 360 Speaker':       'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=85',
        'MiniPulse Bluetooth':        'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=600&q=85',

        // Gaming
        'Apex Gaming Headset':        'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&q=85',
        'ProClick Mechanical KB':     'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=85',
        'PrecisionX Gaming Mouse':    'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&q=85',
        'HyperPad RGB Mousepad':      'https://images.unsplash.com/photo-1593640408182-31c228ac78d6?w=600&q=85',
        'GameStream Controller':      'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&q=85',

        // Wearables
        'Aura Watch Ultra':           'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=85',
        'FitBand Pro X':              'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&q=85',
        'SmartRing Vitals':           'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&q=85',

        // Accessories
        'Gold Plated Audio Cable':    'https://images.unsplash.com/photo-1567789884554-0b844b597180?w=600&q=85',
        'USB-C Hub 8-in-1':           'https://images.unsplash.com/photo-1625948515320-0a7a68b2deef?w=600&q=85',
        'MagCharge Wireless Pad':     'https://images.unsplash.com/photo-1615526675159-e248c3021d3f?w=600&q=85',
        'Cable Organizer Pro':        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=85',
        'Portable Power Bank 20K':    'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&q=85',
    };

    const categoryIconMap = {
        'Headphones':  'ph-headphones',
        'Speakers':    'ph-speaker-high',
        'Gaming':      'ph-game-controller',
        'Wearables':   'ph-watch',
        'Accessories': 'ph-lightning',
        'Tech':        'ph-cpu',
    };

    // Badge logic based on product index or name
    function getProductBadge(product, index) {
        const name = product.name.toLowerCase();
        if (index < 3) return { text: 'New', cls: 'new' };
        if (name.includes('pro') || name.includes('ultra') || name.includes('elite')) return { text: 'Hot', cls: 'hot' };
        if (product.price < 50) return { text: 'Sale', cls: 'sale' };
        return null;
    }

    // Generate deterministic star rating from product id
    function getStarRating(product) {
        const base = ((product.id * 37 + 13) % 15) / 10; // 0.0 – 1.4
        const rating = (4.0 + base).toFixed(1);
        const reviews = 80 + ((product.id * 53) % 420);
        return { rating: parseFloat(rating), reviews };
    }

    function renderStars(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                html += '<i class="ph ph-star-fill"></i>';
            } else if (i - rating < 1) {
                html += '<i class="ph ph-star-half"></i>';
            } else {
                html += '<i class="ph ph-star"></i>';
            }
        }
        return html;
    }

    // Default fallback image
    const DEFAULT_IMG = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=85';

    // --- Products Logic ---
    async function loadProducts() {
        productsGrid.innerHTML = '<div class="loading-spinner"></div>';
        try {
            const params = {};
            if (currentCategory) params.category = currentCategory;
            if (currentSearch) params.search = currentSearch;
            
            const response = await api.getProducts(params);
            const products = response.products || response; 
            renderProducts(products);
        } catch (error) {
            productsGrid.innerHTML = `<p class="error-msg" style="grid-column:1/-1;text-align:center;font-size:1rem;">Failed to load products: ${error.message}</p>`;
        }
    }

    function renderProducts(products) {
        if (!products || products.length === 0) {
            productsGrid.innerHTML = `
                <div style="grid-column:1/-1;text-align:center;padding:5rem 1rem;color:var(--text-muted);">
                    <i class="ph ph-magnifying-glass" style="font-size:3rem;display:block;margin-bottom:1rem;opacity:0.4;"></i>
                    <p style="font-size:1rem;">No products found. Try a different search or category.</p>
                </div>`;
            return;
        }

        productsGrid.innerHTML = products.map((product, index) => {
            const imgUrl = product.image_url || productImageMap[product.name] || DEFAULT_IMG;
            const badge = getProductBadge(product, index);
            const { rating, reviews } = getStarRating(product);
            const catIcon = categoryIconMap[product.category] || 'ph-tag';
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= 5;

            return `
            <div class="product-card">
                <div class="product-img-wrapper">
                    <div class="product-img-placeholder">
                        <img src="${imgUrl}" alt="${product.name}" loading="lazy" onerror="this.src='${DEFAULT_IMG}'">
                    </div>
                    <div class="product-img-overlay"></div>
                    ${badge ? `<span class="product-badge ${badge.cls}">${badge.text}</span>` : ''}
                    <button class="product-quick-add" onclick="addToCart(${product.id})" ${isOutOfStock ? 'disabled' : ''}>
                        <i class="ph ph-shopping-bag"></i>
                        ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
                <div class="product-body">
                    <div class="product-category">
                        <i class="ph ${catIcon}"></i>
                        ${product.category || 'Tech'}
                    </div>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-desc">${product.description || 'Premium quality product.'}</p>
                    <div class="product-rating">
                        <div class="stars">${renderStars(rating)}</div>
                        <span class="rating-count">${rating} (${reviews})</span>
                    </div>
                    <div class="stock-indicator">
                        <span class="stock-dot ${isLowStock ? 'low' : ''}"></span>
                        ${isOutOfStock ? 'Out of stock' : isLowStock ? `Only ${product.stock} left!` : 'In stock'}
                    </div>
                    <div class="product-footer">
                        <div class="price-group">
                            <span class="product-price">$${product.price.toFixed(2)}</span>
                        </div>
                        <button class="add-to-cart-btn" onclick="addToCart(${product.id})" 
                            ${isOutOfStock ? 'disabled' : ''} 
                            title="${isOutOfStock ? 'Out of stock' : 'Add to cart'}">
                            <i class="ph ${isOutOfStock ? 'ph-x' : 'ph-plus'}"></i>
                        </button>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    // Filter Listeners
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            currentCategory = e.currentTarget.dataset.category;
            loadProducts();
        });
    });

    // Search Listener
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentSearch = e.target.value;
            loadProducts();
        }, 500);
    });

    // --- Cart Logic ---
    window.addToCart = async function(productId) {
        if (!api.isLoggedIn()) {
            openAuthModal();
            return;
        }
        
        try {
            await api.addToCart(productId, 1);
            await updateCartUI();
            openCart();
            showToast('Item added to cart!', 'success');
        } catch (error) {
            showToast(`Failed to add to cart: ${error.message}`, 'error');
            if (error.message.includes("Session expired")) {
                updateAuthUI();
                openAuthModal();
            }
        }
    };

    window.updateCartItemQty = async function(itemId, change) {
        try {
            const cart = await api.getCart();
            const item = cart.items.find(i => i.id === itemId);
            if (!item) return;
            
            const newQty = item.quantity + change;
            if (newQty <= 0) {
                await window.removeCartItem(itemId);
            } else {
                await api.updateCartItem(itemId, newQty);
                await updateCartUI();
            }
        } catch (error) {
            showToast(`Error updating quantity: ${error.message}`, 'error');
        }
    };

    window.removeCartItem = async function(itemId) {
        try {
            await api.removeCartItem(itemId);
            await updateCartUI();
        } catch (error) {
            showToast(`Failed to remove item: ${error.message}`, 'error');
        }
    };

    async function updateCartUI() {
        if (!api.isLoggedIn()) {
            cartCount.textContent = '0';
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="ph ph-sign-in"></i>
                    <p>Please login to view your cart.</p>
                </div>`;
            cartTotalAmount.textContent = '$0.00';
            checkoutBtn.disabled = true;
            return;
        }

        try {
            const cart = await api.getCart();
            const items = cart.items || [];
            
            const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            
            if (items.length === 0) {
                cartItemsContainer.innerHTML = `
                    <div class="empty-cart">
                        <i class="ph ph-shopping-bag-open"></i>
                        <p>Your cart is empty.</p>
                    </div>`;
                cartTotalAmount.textContent = '$0.00';
                checkoutBtn.disabled = true;
                return;
            }

            cartItemsContainer.innerHTML = items.map(item => `
                <div class="cart-item">
                    <div class="cart-item-img">
                        <img src="${productImageMap[item.product.name] || DEFAULT_IMG}" 
                            alt="${item.product.name}" 
                            style="width:100%;height:100%;object-fit:cover;border-radius:6px;"
                            onerror="this.parentElement.innerHTML='<i class=\\'ph ph-package\\'></i>'">
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.product.name}</div>
                        <div class="cart-item-price">$${item.product.price.toFixed(2)}</div>
                        <div class="cart-item-actions">
                            <button class="qty-btn" onclick="updateCartItemQty(${item.id}, -1)">−</button>
                            <span class="qty-display">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateCartItemQty(${item.id}, 1)">+</button>
                        </div>
                    </div>
                    <button class="remove-btn" onclick="removeCartItem(${item.id})" title="Remove">
                        <i class="ph ph-trash"></i>
                    </button>
                </div>
            `).join('');

            cartTotalAmount.textContent = `$${cart.total.toFixed(2)}`;
            checkoutBtn.disabled = false;
        } catch (error) {
            console.error('Failed to load cart', error);
        }
    }

    // --- Checkout & Payment Logic (Stripe) ---
    const paymentForm = document.getElementById('paymentForm');
    const submitPaymentBtn = document.getElementById('submitPaymentBtn');
    const paymentError = document.getElementById('paymentError');
    let stripe, elements;
    let currentOrderId = null;
    let STRIPE_PUBLIC_KEY = '';

    api.getStripeConfig().then(config => {
        STRIPE_PUBLIC_KEY = config.publicKey;
    }).catch(console.error);

    // Step 1: Checkout → create order + PaymentIntent → mount Stripe form
    checkoutBtn.addEventListener('click', async () => {
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '<i class="ph ph-spinner"></i> Processing...';
        checkoutMessage.textContent = '';
        checkoutMessage.className = 'checkout-msg';

        try {
            const result = await api.checkout();
            currentOrderId = result.order.id;

            stripe = Stripe(STRIPE_PUBLIC_KEY);
            const appearance = {
                theme: 'night',
                variables: {
                    colorPrimary: '#7c3aed',
                    colorBackground: '#0d1220',
                    colorText: '#f1f5f9',
                    colorDanger: '#f43f5e',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    spacingUnit: '4px',
                    borderRadius: '8px'
                }
            };
            elements = stripe.elements({ clientSecret: result.client_secret, appearance });
            const paymentElement = elements.create('payment');
            document.getElementById('paymentElement').innerHTML = '';
            paymentElement.mount('#paymentElement');

            openPaymentModal();
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = '<i class="ph ph-lock"></i> Checkout';
        } catch (error) {
            checkoutMessage.textContent = `Checkout failed: ${error.message}`;
            checkoutMessage.classList.add('error-msg');
            checkoutBtn.disabled = false;
            checkoutBtn.innerHTML = '<i class="ph ph-lock"></i> Checkout';
        }
    });

    // Step 2: Pay Now → confirmPayment via Stripe → backend marks order as paid
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        submitPaymentBtn.disabled = true;
        submitPaymentBtn.innerHTML = '<i class="ph ph-spinner"></i> Processing...';
        if (paymentError) paymentError.textContent = '';

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.origin + window.location.pathname,
            },
            redirect: 'if_required'
        });

        if (error) {
            // Show Stripe error (e.g. invalid card)
            if (paymentError) paymentError.textContent = error.message;
            submitPaymentBtn.disabled = false;
            submitPaymentBtn.innerHTML = '<i class="ph ph-lock-key"></i> Pay Now';
        } else {
            // Payment confirmed by Stripe — tell backend to mark order as paid
            try {
                await api.confirmPayment(currentOrderId);
                await handlePaymentSuccess();
            } catch (err) {
                if (paymentError) paymentError.textContent = 'Order confirmation failed: ' + err.message;
                submitPaymentBtn.disabled = false;
                submitPaymentBtn.innerHTML = '<i class="ph ph-lock-key"></i> Pay Now';
            }
        }
    });

    async function handlePaymentSuccess() {
        closeAllModals();
        await updateCartUI();
        openCart();
        checkoutMessage.textContent = 'Payment successful! Order confirmed.';
        checkoutMessage.className = 'checkout-msg success-msg';
        showToast('🎉 Order confirmed! Thank you for shopping with Aura.', 'success');
        setTimeout(() => {
            closeCartSidebar();
            checkoutMessage.textContent = '';
        }, 3500);
    }


    // --- Auth Logic ---
    function updateAuthUI() {
        if (api.isLoggedIn()) {
            authBtn.innerHTML = '<i class="ph ph-sign-out"></i>';
            authBtn.title = 'Logout';
            ordersBtn.style.display = 'flex';
            adminBtn.style.display = isAdmin() ? 'flex' : 'none';
        } else {
            authBtn.innerHTML = '<i class="ph ph-user"></i>';
            authBtn.title = 'Login';
            ordersBtn.style.display = 'none';
            adminBtn.style.display = 'none';
        }
    }

    authBtn.addEventListener('click', () => {
        if (api.isLoggedIn()) {
            api.setToken(null);
            updateAuthUI();
            updateCartUI();
            showToast('Logged out successfully', 'success');
        } else {
            openAuthModal();
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorEl = document.getElementById('loginError');
        const btn = loginForm.querySelector('button[type="submit"]');
        
        errorEl.textContent = '';
        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-spinner"></i> Logging in...';
        
        try {
            const res = await api.login(email, password);
            api.setToken(res.access_token);
            closeAllModals();
            updateAuthUI();
            await updateCartUI();
            loginForm.reset();
            showToast('Welcome back! 👋', 'success');
        } catch (error) {
            errorEl.textContent = error.message;
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="ph ph-sign-in"></i> Login';
        }
    });

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const errorEl = document.getElementById('signupError');
        const btn = signupForm.querySelector('button[type="submit"]');
        
        errorEl.textContent = '';
        btn.disabled = true;
        btn.innerHTML = '<i class="ph ph-spinner"></i> Creating account...';
        
        try {
            const res = await api.signup(name, email, password);
            api.setToken(res.access_token);
            closeAllModals();
            updateAuthUI();
            await updateCartUI();
            signupForm.reset();
            showToast('Account created! Welcome to Aura ✨', 'success');
        } catch (error) {
            errorEl.textContent = error.message;
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="ph ph-user-plus"></i> Create Account';
        }
    });

    // --- Orders Logic ---
    ordersBtn.addEventListener('click', async () => {
        if (!api.isLoggedIn()) {
            openAuthModal();
            return;
        }
        await loadOrderHistory();
        openOrdersModal();
    });

    async function loadOrderHistory() {
        const ordersList = document.getElementById('ordersList');
        ordersList.innerHTML = '<div class="loading-spinner"></div>';
        
        try {
            const orders = await api.getOrders();
            if (orders.length === 0) {
                ordersList.innerHTML = `
                    <div style="text-align:center;padding:3rem 1rem;color:var(--text-muted);">
                        <i class="ph ph-receipt" style="font-size:2.5rem;display:block;margin-bottom:1rem;opacity:0.3;"></i>
                        <p>You have no orders yet.</p>
                    </div>`;
                return;
            }

            ordersList.innerHTML = orders.map(order => `
                <div class="cart-item" style="flex-direction: column; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; width: 100%; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; margin-bottom: 0.25rem;">
                        <strong style="font-family:'Outfit',sans-serif;">Order #${order.id}</strong>
                        <span class="status-badge ${order.status === 'paid' ? 'status-paid' : order.status === 'failed' ? 'status-failed' : 'status-pending'}">${order.status.toUpperCase()}</span>
                    </div>
                    <div style="width: 100%; font-size: 0.85rem; color: var(--text-secondary);">
                        ${order.items.map(item => `
                            <div style="display: flex; justify-content: space-between; padding: 0.2rem 0;">
                                <span>${item.quantity}× ${item.product_name}</span>
                                <span>$${(item.price_at_purchase * item.quantity).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div style="display: flex; justify-content: space-between; width: 100%; margin-top: 0.3rem; font-weight: 700; font-family:'Outfit',sans-serif;">
                        <span>Total</span>
                        <span style="color:var(--accent);">$${order.total_amount.toFixed(2)}</span>
                    </div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${new Date(order.created_at).toLocaleString()}</div>
                </div>
            `).join('');
        } catch (error) {
            ordersList.innerHTML = `<p class="error-msg">Failed to load orders: ${error.message}</p>`;
        }
    }

    // =====================================================
    // --- Admin Panel Logic ---
    // =====================================================
    const adminTabs = document.querySelectorAll('.admin-tab');
    const adminTabContents = document.querySelectorAll('.admin-tab-content');
    const addProductBtn = document.getElementById('addProductBtn');
    const cancelProductForm = document.getElementById('cancelProductForm');
    const productForm = document.getElementById('productForm');
    const adminProductsTab = document.getElementById('adminProductsTab');
    const adminProductFormTab = document.getElementById('adminProductForm');

    adminBtn.addEventListener('click', () => {
        openAdminModal();
    });

    function openAdminModal() {
        closeCartSidebar();
        overlay.classList.add('active');
        adminModal.classList.add('active');
        switchAdminTab('products');
        loadAdminProducts();
    }

    adminTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.adminTab;
            switchAdminTab(target);
            if (target === 'products') loadAdminProducts();
            if (target === 'orders') loadAdminOrders();
            if (target === 'lowstock') loadAdminLowStock();
        });
    });

    function switchAdminTab(tabName) {
        adminTabs.forEach(t => t.classList.remove('active'));
        adminTabContents.forEach(c => c.classList.remove('active'));
        const tabEl = document.querySelector(`[data-admin-tab="${tabName}"]`);
        if (tabEl) tabEl.classList.add('active');
        const tabMap = {
            products: 'adminProductsTab',
            orders: 'adminOrdersTab',
            lowstock: 'adminLowStockTab'
        };
        if (tabMap[tabName]) {
            document.getElementById(tabMap[tabName]).classList.add('active');
        }
        if (adminProductFormTab) adminProductFormTab.classList.remove('active');
    }

    // --- Admin Products CRUD ---
    async function loadAdminProducts() {
        const list = document.getElementById('adminProductsList');
        list.innerHTML = '<div class="loading-spinner"></div>';
        try {
            const response = await api.getProducts({ per_page: 100 });
            const products = response.products || response;
            if (!products || products.length === 0) {
                list.innerHTML = '<p class="empty-cart">No products yet. Click "Add Product" to create one.</p>';
                return;
            }
            list.innerHTML = products.map(p => `
                <div class="admin-row">
                    <div class="admin-row-info">
                        <strong>${escapeHtml(p.name)}</strong>
                        <span class="text-secondary">${escapeHtml(p.category || 'Uncategorized')}</span>
                    </div>
                    <div class="admin-row-meta">
                        <span class="admin-price">$${p.price.toFixed(2)}</span>
                        <span class="admin-stock ${p.stock <= 5 ? 'stock-low' : 'stock-ok'}">${p.stock} in stock</span>
                    </div>
                    <div class="admin-row-actions">
                        <button class="btn btn-ghost btn-sm" onclick="adminEditProduct(${p.id})" title="Edit">
                            <i class="ph ph-pencil-simple"></i>
                        </button>
                        <button class="btn btn-danger-ghost btn-sm" onclick="adminDeleteProduct(${p.id}, '${escapeHtml(p.name).replace(/'/g, "\\'")}')" title="Delete">
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            list.innerHTML = `<p class="error-msg">Failed to load products: ${error.message}</p>`;
        }
    }

    addProductBtn.addEventListener('click', () => {
        showProductForm(null);
    });

    cancelProductForm.addEventListener('click', () => {
        adminProductFormTab.classList.remove('active');
        adminProductsTab.classList.add('active');
    });

    function showProductForm(product) {
        adminProductsTab.classList.remove('active');
        adminProductFormTab.classList.add('active');

        const title = document.getElementById('productFormTitle');
        const submitBtn = document.getElementById('productFormSubmit');
        document.getElementById('productFormError').textContent = '';

        if (product) {
            title.textContent = 'Edit Product';
            submitBtn.textContent = 'Update Product';
            document.getElementById('productFormId').value = product.id;
            document.getElementById('productFormName').value = product.name;
            document.getElementById('productFormDescription').value = product.description || '';
            document.getElementById('productFormPrice').value = product.price;
            document.getElementById('productFormStock').value = product.stock;
            document.getElementById('productFormCategory').value = product.category || '';
            document.getElementById('productFormImage').value = product.image_url || '';
        } else {
            title.textContent = 'Add New Product';
            submitBtn.textContent = 'Create Product';
            productForm.reset();
            document.getElementById('productFormId').value = '';
        }
    }

    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorEl = document.getElementById('productFormError');
        const submitBtn = document.getElementById('productFormSubmit');
        errorEl.textContent = '';
        submitBtn.disabled = true;

        const productId = document.getElementById('productFormId').value;
        const data = {
            name: document.getElementById('productFormName').value,
            description: document.getElementById('productFormDescription').value,
            price: parseFloat(document.getElementById('productFormPrice').value),
            stock: parseInt(document.getElementById('productFormStock').value, 10),
            category: document.getElementById('productFormCategory').value,
            image_url: document.getElementById('productFormImage').value,
        };

        try {
            if (productId) {
                await api.updateProduct(productId, data);
                showToast('Product updated successfully!', 'success');
            } else {
                await api.createProduct(data);
                showToast('Product created successfully!', 'success');
            }
            adminProductFormTab.classList.remove('active');
            adminProductsTab.classList.add('active');
            await loadAdminProducts();
            await loadProducts();
        } catch (error) {
            errorEl.textContent = error.message;
        } finally {
            submitBtn.disabled = false;
        }
    });

    window.adminEditProduct = async function(productId) {
        try {
            const product = await api.getProduct(productId);
            showProductForm(product);
        } catch (error) {
            showToast('Failed to load product: ' + error.message, 'error');
        }
    };

    window.adminDeleteProduct = async function(productId, productName) {
        if (!confirm(`Delete "${productName}"? This cannot be undone.`)) return;
        try {
            await api.deleteProduct(productId);
            showToast('Product deleted.', 'success');
            await loadAdminProducts();
            await loadProducts();
        } catch (error) {
            showToast('Failed to delete product: ' + error.message, 'error');
        }
    };

    // --- Admin Orders ---
    async function loadAdminOrders() {
        const list = document.getElementById('adminOrdersList');
        list.innerHTML = '<div class="loading-spinner"></div>';
        try {
            const orders = await api.getAdminOrders();
            if (!orders || orders.length === 0) {
                list.innerHTML = '<p class="empty-cart">No orders yet.</p>';
                return;
            }
            list.innerHTML = orders.map(order => `
                <div class="admin-row" style="flex-direction: column; align-items: stretch;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                        <strong style="font-family:'Outfit',sans-serif;">Order #${order.id}</strong>
                        <span class="status-badge ${order.status === 'paid' ? 'status-paid' : order.status === 'failed' ? 'status-failed' : 'status-pending'}">${order.status.toUpperCase()}</span>
                    </div>
                    <div style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.4rem;">
                        ${order.items.map(item => `${item.quantity}× ${escapeHtml(item.product_name)}`).join(' · ')}
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.82rem;">
                        <span style="font-weight:700;font-family:'Outfit',sans-serif;">$${order.total_amount.toFixed(2)}</span>
                        <span style="color: var(--text-muted);">${new Date(order.created_at).toLocaleString()}</span>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            list.innerHTML = `<p class="error-msg">Failed to load orders: ${error.message}</p>`;
        }
    }

    // --- Admin Low Stock ---
    async function loadAdminLowStock() {
        const list = document.getElementById('adminLowStockList');
        list.innerHTML = '<div class="loading-spinner"></div>';
        try {
            const products = await api.getLowStock();
            if (!products || products.length === 0) {
                list.innerHTML = `
                    <div style="text-align:center;padding:2rem;color:var(--success);">
                        <i class="ph ph-check-circle" style="font-size:2rem;display:block;margin-bottom:0.75rem;"></i>
                        All products are well stocked!
                    </div>`;
                return;
            }
            list.innerHTML = products.map(p => `
                <div class="admin-row">
                    <div class="admin-row-info">
                        <strong>${escapeHtml(p.name)}</strong>
                        <span class="text-secondary">${escapeHtml(p.category || 'Uncategorized')}</span>
                    </div>
                    <div class="admin-row-meta">
                        <span class="admin-price">$${p.price.toFixed(2)}</span>
                        <span class="admin-stock stock-low">${p.stock} left</span>
                    </div>
                    <div class="admin-row-actions">
                        <button class="btn btn-ghost btn-sm" onclick="adminEditProduct(${p.id})" title="Restock">
                            <i class="ph ph-pencil-simple"></i> Edit
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            list.innerHTML = `<p class="error-msg">Failed to load low stock: ${error.message}</p>`;
        }
    }

    // HTML escape utility
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // =====================================================
    // Modal & Sidebar Controls
    // =====================================================
    function openAuthModal() {
        overlay.classList.add('active');
        authModal.classList.add('active');
    }

    function openCart() {
        overlay.classList.add('active');
        cartSidebar.classList.add('active');
    }

    function openPaymentModal() {
        closeCartSidebar();
        overlay.classList.add('active');
        paymentModal.classList.add('active');
    }

    function openOrdersModal() {
        closeCartSidebar();
        overlay.classList.add('active');
        ordersModal.classList.add('active');
    }

    function closeAllModals() {
        overlay.classList.remove('active');
        authModal.classList.remove('active');
        paymentModal.classList.remove('active');
        ordersModal.classList.remove('active');
        adminModal.classList.remove('active');
        closeCartSidebar();
    }

    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'ph-check-circle' : 'ph-warning-circle';
        toast.innerHTML = `<i class="ph ${icon}" style="font-size:1.3rem;color:${type === 'success' ? 'var(--success)' : 'var(--error)'};flex-shrink:0;"></i><span>${message}</span>`;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }
    
    function closeCartSidebar() {
        cartSidebar.classList.remove('active');
        if (!authModal.classList.contains('active') &&
            !paymentModal.classList.contains('active') &&
            !ordersModal.classList.contains('active') &&
            !adminModal.classList.contains('active')) {
            overlay.classList.remove('active');
        }
    }

    cartBtn.addEventListener('click', () => {
        if (api.isLoggedIn()) {
            openCart();
        } else {
            openAuthModal();
        }
    });
    closeCart.addEventListener('click', closeCartSidebar);
    overlay.addEventListener('click', closeAllModals);
    closeModals.forEach(btn => btn.addEventListener('click', closeAllModals));

    // Auth Tabs
    authTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            authTabs.forEach(t => t.classList.remove('active'));
            authForms.forEach(f => f.classList.remove('active'));
            
            e.target.classList.add('active');
            const targetForm = e.target.dataset.tab;
            document.getElementById(`${targetForm}Form`).classList.add('active');
        });
    });
});
