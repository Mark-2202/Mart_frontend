import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  protected readonly auth = inject(Auth);
  private readonly router = inject(Router);

  currentPageTitle = computed(() => {
    const url = this.router.url;
    if (url.includes('/dashboard')) return 'Dashboard Overview';
    if (url.includes('/pos')) return 'POS Billing Terminal';
    if (url.includes('/products')) return 'Product Inventory';
    if (url.includes('/categories')) return 'Category Catalog';
    if (url.includes('/customers')) return 'Customer Database';
    if (url.includes('/orders')) return 'Order History';
    return 'Mini Mart POS';
  });

  logout(): void {
    this.auth.logout();
  }
}
