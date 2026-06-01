import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Customer, CustomerData } from '../../core/services/customer';
import { Auth } from '../../core/services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.html',
  styleUrl: './customers.css',
  standalone: false
})
export class CustomersComponent implements OnInit {
  private readonly customerService = inject(Customer);
  protected readonly auth = inject(Auth);
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);

  customers: CustomerData[] = [];
  searchTerm = '';

  // Modals state
  showModal = false;
  isEditMode = false;
  currentCustomerId: string | null = null;
  customerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    loyaltyPoints: [0, [Validators.min(0)]]
  });

  isLoading = false;

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.customerService.getCustomers(this.searchTerm).subscribe({
      next: (data) => {
        this.customers = data;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load customers', 'Error');
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.loadCustomers();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.loadCustomers();
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.currentCustomerId = null;
    this.customerForm.reset({ loyaltyPoints: 0 });
    this.showModal = true;
  }

  openEditModal(customer: CustomerData): void {
    this.isEditMode = true;
    this.currentCustomerId = customer._id || null;
    this.customerForm.setValue({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      loyaltyPoints: customer.loyaltyPoints || 0
    });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    const data = this.customerForm.value;
    if (this.isEditMode && this.currentCustomerId) {
      this.customerService.updateCustomer(this.currentCustomerId, data).subscribe({
        next: () => {
          this.toastr.success('Customer profile updated', 'Success');
          this.loadCustomers();
          this.closeModal();
        },
        error: (err) => {
          this.toastr.error(err.message || 'Failed to update customer', 'Error');
        }
      });
    } else {
      this.customerService.createCustomer(data).subscribe({
        next: () => {
          this.toastr.success('Customer created successfully', 'Success');
          this.loadCustomers();
          this.closeModal();
        },
        error: (err) => {
          this.toastr.error(err.message || 'Failed to create customer', 'Error');
        }
      });
    }
  }

  deleteCustomer(id: string): void {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.customerService.deleteCustomer(id).subscribe({
        next: () => {
          this.toastr.success('Customer removed successfully', 'Success');
          this.loadCustomers();
        },
        error: (err) => {
          this.toastr.error(err.message || 'Failed to delete customer', 'Error');
        }
      });
    }
  }
}
