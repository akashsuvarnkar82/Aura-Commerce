const API_URL = 'http://localhost:5000/api';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('token') || null;
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    isLoggedIn() {
        return !!this.token;
    }

    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers
            });

            const data = await response.json();

            if (response.status === 401) {
                // Token expired or invalid
                this.setToken(null);
                throw new Error("Session expired. Please log in again.");
            }

            if (!response.ok) {
                throw new Error(data.msg || data.error || 'API request failed');
            }

            return data;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    }

    // Auth
    login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    signup(name, email, password) {
        return this.request('/auth/signup', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
    }

    // Products
    getProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `/products?${queryString}` : '/products';
        return this.request(url);
    }

    // Cart
    getCart() {
        return this.request('/cart');
    }

    addToCart(productId, quantity = 1) {
        return this.request('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ product_id: productId, quantity })
        });
    }

    updateCartItem(itemId, quantity) {
        return this.request(`/cart/update/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity })
        });
    }

    removeCartItem(itemId) {
        return this.request(`/cart/remove/${itemId}`, {
            method: 'DELETE'
        });
    }

    // Orders
    getOrders() {
        return this.request('/orders');
    }

    // Checkout
    checkout() {
        return this.request('/orders/checkout', {
            method: 'POST'
        });
    }

    confirmPayment(orderId) {
        return this.request(`/orders/${orderId}/confirm`, {
            method: 'POST'
        });
    }

    getStripeConfig() {
        return this.request('/orders/config/stripe');
    }

    // Admin
    getProduct(productId) {
        return this.request(`/products/${productId}`);
    }

    createProduct(data) {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    updateProduct(productId, data) {
        return this.request(`/products/${productId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    deleteProduct(productId) {
        return this.request(`/products/${productId}`, {
            method: 'DELETE'
        });
    }

    getAdminOrders() {
        return this.request('/admin/orders');
    }

    getLowStock() {
        return this.request('/admin/low-stock');
    }

    mockCheckout() {
        return this.request('/orders/checkout/mock', {
            method: 'POST'
        });
    }
}

// Global singleton instance
window.api = new ApiService();
