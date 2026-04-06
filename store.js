

const Store = {
  // ── Keys 
  KEYS: {
    CUSTOMERS:   'ec_customers',
    PRODUCTS:    'ec_products',
    ORDERS:      'ec_orders',
    CART:        'ec_cart',
    SESSION:     'ec_session',
    FEEDBACKS:   'ec_feedbacks',
    ADMIN:       'ec_admin',
    OTP_REQUEST: 'ec_otp_request',
  },

  // ── Helpers 
  get(key)       { try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; } },
  set(key, val)  { localStorage.setItem(key, JSON.stringify(val)); },

  // ── Customers 
  getCustomers()   { return this.get(this.KEYS.CUSTOMERS) || []; },
  saveCustomers(d) { this.set(this.KEYS.CUSTOMERS, d); },

  getCustomerById(id)      { return this.getCustomers().find(c => c.customerId === id); },
  getCustomerByEmail(email){ return this.getCustomers().find(c => c.email.toLowerCase() === email.toLowerCase()); },

  addCustomer(data) {
    const customers = this.getCustomers();
    const id = 'CUST' + String(customers.length + 1).padStart(4,'0');
    const customer = { customerId: id, ...data, createdAt: new Date().toISOString() };
    customers.push(customer);
    this.saveCustomers(customers);
    return customer;
  },

  updateCustomer(id, updates) {
    const list = this.getCustomers();
    const idx  = list.findIndex(c => c.customerId === id);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...updates };
    this.saveCustomers(list);
    return true;
  },

  // ── Products 
  getProducts()    { return this.get(this.KEYS.PRODUCTS) || []; },
  saveProducts(d)  { this.set(this.KEYS.PRODUCTS, d); },

  getProductById(id) { return this.getProducts().find(p => p.productId === id); },

  addProduct(data) {
    const products = this.getProducts();
    const id = String(products.length + 100 + 1).padStart(3,'0');
    const product = { productId: id, ...data, createdAt: new Date().toISOString(), deleted: false };
    products.push(product);
    this.saveProducts(products);
    return product;
  },

  updateProduct(id, updates) {
    const list = this.getProducts();
    const idx  = list.findIndex(p => p.productId === id);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...updates };
    this.saveProducts(list);
    return true;
  },

  softDeleteProduct(id) {
    return this.updateProduct(id, { status: 'In Active', deleted: true });
  },

  restoreProduct(id) {
    return this.updateProduct(id, { status: 'Active', deleted: false });
  },

  getActiveProducts() {
    return this.getProducts().filter(p => p.status === 'Active' && !p.deleted);
  },

  // ── Orders 
  getOrders()    { return this.get(this.KEYS.ORDERS) || []; },
  saveOrders(d)  { this.set(this.KEYS.ORDERS, d); },

  getOrderById(id) { return this.getOrders().find(o => o.orderId === id); },

  addOrder(data) {
    const orders = this.getOrders();
    const id = orders.length + 1001;
    const arriving = new Date();
    arriving.setDate(arriving.getDate() + 5);
    const order = {
      orderId: id,
      ...data,
      orderStatus: 'Confirmed',
      orderDate: new Date().toISOString(),
      arrivingDate: arriving.toISOString(),
    };
    orders.push(order);
    this.saveOrders(orders);
    return order;
  },

  updateOrderStatus(id, status) {
    const list = this.getOrders();
    const idx  = list.findIndex(o => o.orderId === id);
    if (idx === -1) return false;
    list[idx].orderStatus = status;
    this.saveOrders(list);
    return true;
  },

  getOrdersByCustomer(customerId) {
    return this.getOrders().filter(o => o.customerId === customerId);
  },

  // ── Cart 
  getCart()    { return this.get(this.KEYS.CART) || []; },
  saveCart(d)  { this.set(this.KEYS.CART, d); },

  validateCartQty(productId, requestedQty) {
    const product = this.getProductById(productId);
    if (!product || product.deleted || product.status !== 'Active') {
      return { ok: false, max: 0, reason: 'Product not available' };
    }

    const max = Math.max(0, Number(product.quantityAvailable) || 0);
    if (max <= 0) return { ok: false, max: 0, reason: 'Out of stock' };
    if (requestedQty > max) {
      return { ok: false, max, reason: `Only ${max} unit(s) available` };
    }

    return { ok: true, max };
  },

  addToCart(product) {
    const cart = this.getCart();
    const idx  = cart.findIndex(i => i.productId === product.productId);
    const currentQty = idx > -1 ? (cart[idx].quantity || 0) : 0;
    const nextQty = currentQty + 1;
    const check = this.validateCartQty(product.productId, nextQty);

    if (!check.ok) return check;

    if (idx > -1) {
      cart[idx].quantity = nextQty;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    this.saveCart(cart);
    return { ok: true, max: check.max, quantity: nextQty };
  },

  removeFromCart(productId) {
    this.saveCart(this.getCart().filter(i => i.productId !== productId));
  },

  updateCartQty(productId, qty) {
    if (qty <= 0) {
      this.removeFromCart(productId);
      return { ok: true, removed: true, quantity: 0 };
    }

    const cart = this.getCart();
    const idx  = cart.findIndex(i => i.productId === productId);
    if (idx === -1) return { ok: false, reason: 'Item not found in cart', quantity: 0 };

    const check = this.validateCartQty(productId, qty);
    if (!check.ok) {
      if (check.max <= 0) {
        this.removeFromCart(productId);
        return { ok: false, adjusted: true, removed: true, max: 0, reason: check.reason, quantity: 0 };
      }
      cart[idx].quantity = check.max;
      this.saveCart(cart);
      return { ok: false, adjusted: true, max: check.max, reason: check.reason, quantity: check.max };
    }

    cart[idx].quantity = qty;
    this.saveCart(cart);
    return { ok: true, max: check.max, quantity: qty };
  },

  syncCartWithInventory() {
    const cart = this.getCart();
    if (!cart.length) return { changed: false, removed: 0, adjusted: 0 };

    let changed = false;
    let removed = 0;
    let adjusted = 0;

    const next = [];
    cart.forEach(item => {
      const product = this.getProductById(item.productId);
      if (!product || product.deleted || product.status !== 'Active') {
        changed = true;
        removed += 1;
        return;
      }

      const max = Math.max(0, Number(product.quantityAvailable) || 0);
      if (max <= 0) {
        changed = true;
        removed += 1;
        return;
      }

      const safeQty = Math.min(Number(item.quantity) || 1, max);
      if (safeQty !== item.quantity) {
        changed = true;
        adjusted += 1;
      }

      next.push({ ...item, quantity: safeQty });
    });

    if (changed) this.saveCart(next);
    return { changed, removed, adjusted };
  },

  clearCart() { this.saveCart([]); },

  // ── Session 
  getSession()   { return this.get(this.KEYS.SESSION); },
  setSession(d)  { this.set(this.KEYS.SESSION, d); },
  clearSession() { localStorage.removeItem(this.KEYS.SESSION); },

  // ── Admin 
  getAdmin()   { return this.get(this.KEYS.ADMIN) || { userId: 'ADMIN001', password: 'admin@12345', name: 'Admin' }; },

  // ── Feedbacks 
  getFeedbacks()   { return this.get(this.KEYS.FEEDBACKS) || []; },
  saveFeedbacks(d) { this.set(this.KEYS.FEEDBACKS, d); },

  addFeedback(data) {
    const list = this.getFeedbacks();
    list.push({ ...data, createdAt: new Date().toISOString() });
    this.saveFeedbacks(list);
  },

  updateFeedback(orderId, customerId, updates) {
    const list = this.getFeedbacks();
    const idx = list.findIndex(f => f.orderId === orderId && f.customerId === customerId);
    if (idx === -1) return false;
    list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveFeedbacks(list);
    return true;
  },

  // ── OTP / Password Reset 
  saveOtpRequest(data) { this.set(this.KEYS.OTP_REQUEST, data); },
  getOtpRequest()      { return this.get(this.KEYS.OTP_REQUEST); },
  clearOtpRequest()    { localStorage.removeItem(this.KEYS.OTP_REQUEST); },

  // ── Seed Demo Data 
  seed() {
    if (this.getProducts().length > 0) return; // already seeded

    const products = [
      { productName:'Wireless Headphones', productPrice:2499, productCategory:'Electronics', productDescription:'Premium noise-cancelling wireless headphones with 30hr battery.', quantityAvailable:25, status:'Active', productImage:'🎧' },
      { productName:'Floral Kurti', productPrice:799, productCategory:'Fashion', productDescription:'Beautiful cotton floral kurti, perfect for summer.', quantityAvailable:50, status:'Active', productImage:'👗' },
      { productName:'Smart Watch', productPrice:3999, productCategory:'Electronics', productDescription:'Feature-rich smartwatch with health tracking & notifications.', quantityAvailable:15, status:'Active', productImage:'⌚' },
      { productName:'Notebook Set', productPrice:249, productCategory:'Stationary', productDescription:'Set of 3 premium ruled notebooks, 200 pages each.', quantityAvailable:100, status:'Active', productImage:'📓' },
      { productName:'Decorative Vase', productPrice:599, productCategory:'Home Decor', productDescription:'Elegant ceramic vase, handcrafted by artisans.', quantityAvailable:30, status:'Active', productImage:'🏺' },
      { productName:'Running Shoes', productPrice:1799, productCategory:'Fashion', productDescription:'Lightweight breathable running shoes with cushioned sole.', quantityAvailable:40, status:'Active', productImage:'👟' },
      { productName:'Bluetooth Speaker', productPrice:1299, productCategory:'Electronics', productDescription:'Portable waterproof speaker with rich bass sound.', quantityAvailable:20, status:'Active', productImage:'🔊' },
      { productName:'Desk Lamp', productPrice:449, productCategory:'Home Decor', productDescription:'Adjustable LED desk lamp with 3 brightness levels.', quantityAvailable:60, status:'Active', productImage:'💡' },
      { productName:'Gel Pens (12 pcs)', productPrice:149, productCategory:'Stationary', productDescription:'Smooth writing gel pens in assorted colors.', quantityAvailable:200, status:'Active', productImage:'✒️' },
      { productName:'Denim Jacket', productPrice:1499, productCategory:'Fashion', productDescription:'Classic denim jacket, slim fit, unisex.', quantityAvailable:35, status:'Active', productImage:'🧥' },
    ];

    products.forEach(p => this.addProduct(p));

    // Demo admin stays default; seed one demo customer
    this.addCustomer({
      name:'Demo Customer', country:'India', state:'Madhya Pradesh', city:'Indore',
      address1:'123 MG Road', address2:'Near Clock Tower', zipCode:'452001',
      phoneNumber:'+91-9876543210', email:'demo@customer.com',
      password: btoa('demo@12345'), confirmPassword: btoa('demo@12345'),
      securityQuestion: 'What city were you born in?',
      securityAnswer:   btoa('indore'),
    });
  }
};

// Auto-seed on load
Store.seed();
