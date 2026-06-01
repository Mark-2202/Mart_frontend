import { Injectable, inject } from '@angular/core';
import { Api } from './api';
import { Observable } from 'rxjs';

export interface CategoryData {
  _id?: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  userid?: any;
}

@Injectable({
  providedIn: 'root',
})
export class Category {
  private readonly api = inject(Api);

  getCategories(): Observable<CategoryData[]> {
    return this.api.get<CategoryData[]>('/categories');
  }

  getCategoryById(id: string): Observable<CategoryData> {
    return this.api.get<CategoryData>(`/categories/${id}`);
  }

  createCategory(category: CategoryData): Observable<CategoryData> {
    return this.api.post<CategoryData>('/categories', category);
  }

  updateCategory(id: string, category: CategoryData): Observable<CategoryData> {
    return this.api.put<CategoryData>(`/categories/${id}`, category);
  }

  deleteCategory(id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/categories/${id}`);
  }
}
