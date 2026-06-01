import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product, ProductData } from '../../core/services/product';
import { Category, CategoryData } from '../../core/services/category';
import { Supplier, SupplierData } from '../../core/services/supplier';
import { Auth } from '../../core/services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-products',
  templateUrl: './products.html',
  styleUrl: './products.css',
  standalone: false
})
export class ProductsComponent implements OnInit {
  private readonly productService = inject(Product);
  private readonly categoryService = inject(Category);
  private readonly supplierService = inject(Supplier);
  protected readonly auth = inject(Auth);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);

  products: ProductData[] = [];
  categories: CategoryData[] = [];
  suppliers: SupplierData[] = [];

  // Filter bindings
  searchTerm = '';
  selectedCategory = '';
  showLowStockOnly = false;

  // Modals state
  showFormModal = false;
  showDetailModal = false;
  isEditMode = false;
  currentProductId: string | null = null;
  selectedProduct: ProductData | null = null;

  productForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    sku: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    categoryId: ['', [Validators.required]],
    supplierId: ['', [Validators.required]]
  });

  isLoading = false;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    // Load categories and suppliers for dropdowns
    this.categoryService.getCategories().subscribe({
      next: (cats) => this.categories = cats.filter(c => c.isActive),
      error: () => {}
    });
    this.supplierService.getSuppliers().subscribe({
      next: (sups) => this.suppliers = sups,
      error: () => {}
    });

    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    const filters: any = {};
    if (this.searchTerm.trim()) filters.search = this.searchTerm;
    if (this.selectedCategory) filters.category = this.selectedCategory;
    if (this.showLowStockOnly) filters.lowStock = 10;

    this.productService.getProducts(filters).subscribe({
      next: (data) => {
        this.products = data;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load products', 'Error');
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.loadProducts();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.showLowStockOnly = false;
    this.loadProducts();
  }

  getStockStatus(stock: number): 'out' | 'low' | 'good' {
    if (stock <= 0) return 'out';
    if (stock <= 10) return 'low';
    return 'good';
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.currentProductId = null;
    this.productForm.reset({ price: 0, stock: 0, categoryId: '', supplierId: '' });
    this.showFormModal = true;
  }

  openEditModal(product: ProductData): void {
    this.isEditMode = true;
    this.currentProductId = product._id || null;
    
    // Resolve IDs
    const catId = typeof product.categoryId === 'object' ? product.categoryId._id : product.categoryId;
    const supId = typeof product.supplierId === 'object' ? product.supplierId._id : product.supplierId;

    this.productForm.setValue({
      name: product.name,
      sku: product.sku,
      price: product.price,
      stock: product.stock,
      categoryId: catId,
      supplierId: supId
    });
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
  }

  openDetailModal(product: ProductData): void {
    this.selectedProduct = product;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedProduct = null;
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const data = this.productForm.value;
    if (this.isEditMode && this.currentProductId) {
      this.productService.updateProduct(this.currentProductId, data).subscribe({
        next: () => {
          this.toastr.success('Product updated successfully', 'Success');
          this.loadProducts();
          this.closeFormModal();
        },
        error: (err) => {
          this.toastr.error(err.message || 'Failed to update product', 'Error');
        }
      });
    } else {
      this.productService.createProduct(data).subscribe({
        next: () => {
          this.toastr.success('Product created successfully', 'Success');
          this.loadProducts();
          this.closeFormModal();
        },
        error: (err) => {
          this.toastr.error(err.message || 'Failed to create product', 'Error');
        }
      });
    }
  }

  toggleActive(product: ProductData): void {
    if (!this.auth.hasRole(['admin', 'manager'])) {
      this.toastr.warning('You do not have permission to modify status', 'Access Denied');
      return;
    }
    const updatedStatus = !product.isActive;
    
    // Resolve IDs
    const catId = typeof product.categoryId === 'object' ? product.categoryId._id : product.categoryId;
    const supId = typeof product.supplierId === 'object' ? product.supplierId._id : product.supplierId;

    this.productService.updateProduct(product._id!, {
      name: product.name,
      sku: product.sku,
      price: product.price,
      stock: product.stock,
      categoryId: catId,
      supplierId: supId,
      isActive: updatedStatus
    }).subscribe({
      next: () => {
        product.isActive = updatedStatus;
        this.toastr.success(`Product is now ${updatedStatus ? 'Active' : 'Inactive'}`, 'Status Updated');
      },
      error: () => {
        this.toastr.error('Failed to toggle status', 'Error');
      }
    });
  }

  deleteProduct(id: string): void {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.toastr.success('Product removed successfully', 'Success');
          this.loadProducts();
        },
        error: (err) => {
          this.toastr.error(err.message || 'Failed to delete product', 'Error');
        }
      });
    }
  }
}
