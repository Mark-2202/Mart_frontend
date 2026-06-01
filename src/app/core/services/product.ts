import { Injectable, inject } from '@angular/core';
import { Api } from './api';
import { Observable } from 'rxjs';

export interface ProductData {
  _id?: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  categoryId: any; // Can be ID or populated object with name
  supplierId: any; // Can be ID or populated object with name
  isActive?: boolean;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Product {
  private readonly api = inject(Api);

  getProducts(filters: { search?: string; category?: string; lowStock?: number; supplier?: string } = {}): Observable<ProductData[]> {
    return this.api.get<ProductData[]>('/products', filters);
  }

  getProductById(id: string): Observable<ProductData> {
    return this.api.get<ProductData>(`/products/${id}`);
  }

  createProduct(product: ProductData): Observable<ProductData> {
    return this.api.post<ProductData>('/products', product);
  }

  updateProduct(id: string, product: ProductData): Observable<ProductData> {
    return this.api.put<ProductData>(`/products/${id}`, product);
  }

  deleteProduct(id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/products/${id}`);
  }
}
