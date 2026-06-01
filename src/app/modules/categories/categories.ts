import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Category, CategoryData } from '../../core/services/category';
import { Auth } from '../../core/services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.html',
  styleUrl: './categories.css',
  standalone: false
})
export class CategoriesComponent implements OnInit {
  private readonly categoryService = inject(Category);
  protected readonly auth = inject(Auth);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);

  categories: CategoryData[] = [];
  filteredCategories: CategoryData[] = [];
  searchTerm = '';

  // Modal states
  showModal = false;
  isEditMode = false;
  currentCategoryId: string | null = null;
  categoryForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    description: ['']
  });

  isLoading = false;

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.filterCategories();
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load categories', 'Error');
        this.isLoading = false;
      }
    });
  }

  filterCategories(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCategories = [...this.categories];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredCategories = this.categories.filter(cat =>
        cat.name.toLowerCase().includes(term) ||
        (cat.description && cat.description.toLowerCase().includes(term))
      );
    }
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.currentCategoryId = null;
    this.categoryForm.reset();
    this.showModal = true;
  }

  openEditModal(category: CategoryData): void {
    this.isEditMode = true;
    this.currentCategoryId = category._id || null;
    this.categoryForm.setValue({
      name: category.name,
      description: category.description || ''
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const data = this.categoryForm.value;
    if (this.isEditMode && this.currentCategoryId) {
      this.categoryService.updateCategory(this.currentCategoryId, data).subscribe({
        next: () => {
          this.toastr.success('Category updated successfully', 'Success');
          this.loadCategories();
          this.closeModal();
        },
        error: (err) => {
          this.toastr.error(err.message || 'Failed to update category', 'Error');
        }
      });
    } else {
      this.categoryService.createCategory(data).subscribe({
        next: () => {
          this.toastr.success('Category created successfully', 'Success');
          this.loadCategories();
          this.closeModal();
        },
        error: (err) => {
          this.toastr.error(err.message || 'Failed to create category', 'Error');
        }
      });
    }
  }

  toggleActive(category: CategoryData): void {
    if (!this.auth.hasRole(['admin', 'manager'])) {
      this.toastr.warning('You do not have permission to modify status', 'Access Denied');
      return;
    }
    const updatedStatus = !category.isActive;
    this.categoryService.updateCategory(category._id!, { name: category.name, isActive: updatedStatus }).subscribe({
      next: () => {
        category.isActive = updatedStatus;
        this.toastr.success(`Category is now ${updatedStatus ? 'Active' : 'Inactive'}`, 'Status Updated');
      },
      error: () => {
        this.toastr.error('Failed to toggle status', 'Error');
      }
    });
  }

  deleteCategory(id: string): void {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.toastr.success('Category removed successfully', 'Success');
          this.loadCategories();
        },
        error: (err) => {
          this.toastr.error(err.message || 'Failed to delete category', 'Error');
        }
      });
    }
  }
}
