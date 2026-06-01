import { Injectable, inject } from '@angular/core';
import { Api } from './api';
import { Observable } from 'rxjs';

export interface DashboardStats {
  revenue: {
    total: number;
    today: number;
    weekly: number;
    monthly: number;
  };
  orders: {
    total: number;
    today: number;
  };
  products: {
    total: number;
    lowStock: number;
  };
  customers: number;
  users: number;
}

export interface SalesChartItem {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProductItem {
  _id: string;
  name: string;
  totalSold: number;
  revenue: number;
}

export interface RecentOrderItem {
  _id: string;
  orderNumber: string;
  customerId?: {
    _id: string;
    name: string;
  } | null;
  total: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class Dashboard {
  private readonly api = inject(Api);

  getStats(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('/dashboard/stats');
  }

  getSalesChart(days: number = 7): Observable<SalesChartItem[]> {
    return this.api.get<SalesChartItem[]>('/dashboard/sales-chart', { days });
  }

  getTopProducts(limit: number = 5): Observable<TopProductItem[]> {
    return this.api.get<TopProductItem[]>('/dashboard/top-products', { limit });
  }

  getRecentOrders(limit: number = 5): Observable<RecentOrderItem[]> {
    return this.api.get<RecentOrderItem[]>('/dashboard/recent-orders', { limit });
  }
}
