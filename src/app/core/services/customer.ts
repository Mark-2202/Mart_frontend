import { Injectable, inject } from '@angular/core';
import { Api } from './api';
import { Observable } from 'rxjs';

export interface CustomerData {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints?: number;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Customer {
  private readonly api = inject(Api);

  getCustomers(search?: string): Observable<CustomerData[]> {
    const params = search ? { search } : {};
    return this.api.get<CustomerData[]>('/customers', params);
  }

  getCustomerById(id: string): Observable<CustomerData> {
    return this.api.get<CustomerData>(`/customers/${id}`);
  }

  createCustomer(customer: CustomerData): Observable<CustomerData> {
    return this.api.post<CustomerData>('/customers', customer);
  }

  updateCustomer(id: string, customer: CustomerData): Observable<CustomerData> {
    return this.api.put<CustomerData>(`/customers/${id}`, customer);
  }

  deleteCustomer(id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/customers/${id}`);
  }
}
