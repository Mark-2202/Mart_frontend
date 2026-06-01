import { Component, OnInit, inject } from '@angular/core';
import { Order, OrderData } from '../../core/services/order';
import { Auth } from '../../core/services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.html',
  styleUrl: './orders.css',
  standalone: false
})
export class OrdersComponent implements OnInit {
  private readonly orderService = inject(Order);
  protected readonly auth = inject(Auth);
  private readonly toastr = inject(ToastrService);

  orders: OrderData[] = [];
  selectedOrder: OrderData | null = null;

  // Filter fields
  statusFilter = '';
  startDate = '';
  endDate = '';

  // Modal control
  showDetailModal = false;
  isLoading = false;

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    const filters: any = {};
    if (this.statusFilter) filters.status = this.statusFilter;
    if (this.startDate) filters.startDate = this.startDate;
    if (this.endDate) filters.endDate = this.endDate;

    this.orderService.getOrders(filters).subscribe({
      next: (data) => {
        this.orders = data;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load orders list', 'Error');
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.loadOrders();
  }

  resetFilters(): void {
    this.statusFilter = '';
    this.startDate = '';
    this.endDate = '';
    this.loadOrders();
  }

  openDetailModal(order: OrderData): void {
    this.isLoading = true;
    this.orderService.getOrderById(order._id!).subscribe({
      next: (fullOrder) => {
        this.selectedOrder = fullOrder;
        this.showDetailModal = true;
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Failed to load order details', 'Error');
        this.isLoading = false;
      }
    });
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedOrder = null;
  }

  changeStatus(status: 'completed' | 'cancelled' | 'refunded'): void {
    if (!this.selectedOrder || !this.selectedOrder._id) return;

    if (confirm(`Are you sure you want to change order status to ${status.toUpperCase()}?`)) {
      this.orderService.updateOrderStatus(this.selectedOrder._id, status).subscribe({
        next: (updated) => {
          this.toastr.success(`Order status updated to ${status}`, 'Success');
          this.selectedOrder!.status = updated.status;
          this.loadOrders(); // Refresh table view
        },
        error: (err) => {
          this.toastr.error(err.message || 'Failed to update order status', 'Error');
        }
      });
    }
  }

  printInvoice(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
}
