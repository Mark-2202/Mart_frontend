import { Injectable, inject } from '@angular/core';
import { Api } from './api';
import { Observable } from 'rxjs';

export interface SupplierData {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Supplier {
  private readonly api = inject(Api);

  getSuppliers(): Observable<SupplierData[]> {
    return this.api.get<SupplierData[]>('/suppliers');
  }

  getSupplierById(id: string): Observable<SupplierData> {
    return this.api.get<SupplierData>(`/suppliers/${id}`);
  }

  createSupplier(supplier: SupplierData): Observable<SupplierData> {
    return this.api.post<SupplierData>('/suppliers', supplier);
  }

  updateSupplier(id: string, supplier: SupplierData): Observable<SupplierData> {
    return this.api.put<SupplierData>(`/suppliers/${id}`, supplier);
  }

  deleteSupplier(id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/suppliers/${id}`);
  }
}
