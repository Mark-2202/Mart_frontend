import { Component, OnInit, inject } from '@angular/core';
import { Product, ProductData } from '../../core/services/product';
import { Category, CategoryData } from '../../core/services/category';
import { Customer, CustomerData } from '../../core/services/customer';
import { Order } from '../../core/services/order';
import { ToastrService } from 'ngx-toastr';

interface CartItem {
  product: ProductData;
  quantity: number;
}

@Component({
  selector: 'app-pos',
  templateUrl: './pos.html',
  styleUrl: './pos.css',
  standalone: false
})
export class PosComponent implements OnInit {
  private readonly productService = inject(Product);
  private readonly categoryService = inject(Category);
  private readonly customerService = inject(Customer);
  private readonly orderService = inject(Order);
  private readonly toastr = inject(ToastrService);

  products: ProductData[] = [];
  categories: CategoryData[] = [];
  customers: CustomerData[] = [];

  // Filter state
  searchTerm = '';
  selectedCategory = '';

  // Cart state
  cart: CartItem[] = [];
  selectedCustomerId: string | null = null;
  taxRate = 0.1; // 10% VAT

  isLoadingProducts = false;

  ngOnInit(): void {
    this.loadInitialData();
    this.loadCart();
  }

  loadInitialData(): void {
    this.isLoadingProducts = true;
    this.categoryService.getCategories().subscribe({
      next: (cats) => this.categories = cats.filter(c => c.isActive)
    });
    this.customerService.getCustomers().subscribe({
      next: (custs) => this.customers = custs
    });
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoadingProducts = true;
    const filters: any = {};
    if (this.searchTerm.trim()) filters.search = this.searchTerm;
    if (this.selectedCategory) filters.category = this.selectedCategory;

    this.productService.getProducts(filters).subscribe({
      next: (data) => {
        this.products = data.filter(p => p.isActive);
        this.isLoadingProducts = false;
      },
      error: () => {
        this.toastr.error('Failed to load products', 'Error');
        this.isLoadingProducts = false;
      }
    });
  }

  applyFilters(): void {
    this.loadProducts();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.loadProducts();
  }

  // Cart actions
  addToCart(product: ProductData): void {
    const existingIndex = this.cart.findIndex(item => item.product._id === product._id);
    const existingQty = existingIndex !== -1 ? this.cart[existingIndex].quantity : 0;

    if (product.stock <= existingQty) {
      this.toastr.warning(`Insufficient stock for ${product.name}`, 'Stock Limit');
      return;
    }

    if (existingIndex !== -1) {
      this.cart[existingIndex].quantity += 1;
    } else {
      this.cart.push({ product, quantity: 1 });
    }

    this.saveCart();
    this.toastr.success(`${product.name} added to cart`, 'Cart Updated');
  }

  updateQuantity(index: number, delta: number): void {
    const item = this.cart[index];
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      this.removeFromCart(index);
      return;
    }

    if (item.product.stock < newQty) {
      this.toastr.warning(`Insufficient stock for ${item.product.name}`, 'Stock Limit');
      return;
    }

    item.quantity = newQty;
    this.saveCart();
  }

  removeFromCart(index: number): void {
    const name = this.cart[index].product.name;
    this.cart.splice(index, 1);
    this.saveCart();
    this.toastr.info(`${name} removed from cart`);
  }

  // Totals calculations
  get subtotal(): number {
    return this.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }

  get taxAmount(): number {
    return this.subtotal * this.taxRate;
  }

  get totalAmount(): number {
    return this.subtotal + this.taxAmount;
  }

  getSelectedCustomer(): CustomerData | undefined {
    return this.customers.find(c => c._id === this.selectedCustomerId);
  }

  // Local storage synchronization
  protected saveCart(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mart_cart', JSON.stringify({
        cart: this.cart,
        selectedCustomerId: this.selectedCustomerId
      }));
    }
  }

  private loadCart(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mart_cart');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          this.cart = parsed.cart || [];
          this.selectedCustomerId = parsed.selectedCustomerId || null;
        } catch (e) {
          this.cart = [];
          this.selectedCustomerId = null;
        }
      }
    }
  }

  clearCart(): void {
    this.cart = [];
    this.selectedCustomerId = null;
    this.saveCart();
  }

  checkout(): void {
    if (this.cart.length === 0) {
      this.toastr.warning('Please add products to cart before checkout', 'Empty Cart');
      return;
    }

    const orderItems = this.cart.map(item => ({
      productId: item.product._id!,
      quantity: item.quantity
    }));

    const orderPayload = {
      customerId: this.selectedCustomerId,
      items: orderItems,
      tax: this.taxAmount
    };

    this.orderService.createOrder(orderPayload).subscribe({
      next: (order) => {
        this.toastr.success(`Order ${order.orderNumber} completed successfully!`, 'Checkout Success');
        this.clearCart();
        this.loadProducts(); // Refresh stock in POS view
      },
      error: (err) => {
        this.toastr.error(err.message || 'Checkout failed', 'Error');
      }
    });
  }
}
