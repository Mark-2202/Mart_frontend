import { Injectable, inject } from '@angular/core';
import { Api } from './api';
import { Observable } from 'rxjs';

export interface OrderItem {
  productId: string;
  name?: string;
  quantity: number;
  unitPrice?: number;
  subtotal?: number;
}

export interface OrderData {
  _id?: string;
  orderNumber?: string;
  customerId: any; // Can be string or populated customer object
  items: OrderItem[];
  subtotal?: number;
  tax?: number;
  total?: number;
  status?: 'pending' | 'completed' | 'cancelled' | 'refunded';
  userid?: any;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Order {
  private readonly api = inject(Api);

  getOrders(filters: { status?: string; customerId?: string; startDate?: string; endDate?: string } = {}): Observable<OrderData[]> {
    return this.api.get<OrderData[]>('/orders', filters);
  }

  getOrderById(id: string): Observable<OrderData> {
    return this.api.get<OrderData>(`/orders/${id}`);
  }

  createOrder(order: { customerId: string | null; items: OrderItem[]; tax: number }): Observable<OrderData> {
    return this.api.post<OrderData>('/orders', order);
  }

  updateOrderStatus(id: string, status: string): Observable<OrderData> {
    return this.api.patch<OrderData>(`/orders/${id}/status`, { status });
  }
}
