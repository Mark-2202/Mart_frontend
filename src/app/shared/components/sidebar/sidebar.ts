import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  protected readonly auth = inject(Auth);

  menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'bi-speedometer2', roles: ['admin', 'manager'] },
    { path: '/pos', label: 'POS Terminal', icon: 'bi-cpu', roles: ['admin', 'manager', 'cashier'] },
    { path: '/products', label: 'Products', icon: 'bi-box-seam', roles: ['admin', 'manager'] },
    { path: '/categories', label: 'Categories', icon: 'bi-grid-3x3-gap', roles: ['admin', 'manager'] },
    { path: '/customers', label: 'Customers', icon: 'bi-people', roles: ['admin', 'manager', 'cashier'] },
    { path: '/orders', label: 'Orders', icon: 'bi-receipt', roles: ['admin', 'manager', 'cashier'] },
  ];

  filteredMenuItems = computed(() => {
    return this.menuItems.filter((item) => this.auth.hasRole(item.roles));
  });
}
