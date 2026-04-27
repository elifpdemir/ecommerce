import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product, Category, ProductFilter } from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly BASE = environment.apiUrl;

  constructor(private http: HttpClient) {}


  getProducts(filter: ProductFilter = {}): Observable<Product[]> {
    let params = new HttpParams();

    if (filter.category) {
      params = params.set('category', filter.category);
    }
    if (filter.price_gte !== undefined) {
      params = params.set('price_gte', filter.price_gte.toString());
    }
    if (filter.price_lte !== undefined) {
      params = params.set('price_lte', filter.price_lte.toString());
    }
    if (filter._sort) {
      params = params.set('_sort', filter._sort);
      params = params.set('_order', filter._order ?? 'asc');
    }
    if (filter.q) {
      params = params.set('q', filter.q);
    }
    if (filter.bestseller !== undefined) {
      params = params.set('bestseller', filter.bestseller.toString());
    }

    return this.http.get<Product[]>(`${this.BASE}/products`, { params }).pipe(
      catchError(() => of([]))
    );
  }

  getBestsellers(): Observable<Product[]> {
    const params = new HttpParams().set('bestseller', 'true');
    return this.http.get<Product[]>(`${this.BASE}/products`, { params }).pipe(
      catchError(() => of([]))
    );
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.BASE}/categories`).pipe(
      catchError(() => of([]))
    );
  }

  getReviews(productId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.BASE}/reviews/product/${productId}`).pipe(
      catchError(() => of([]))
    );
  }

  addReview(review: any): Observable<any> {
    return this.http.post<any>(`${this.BASE}/reviews`, review);
  }
}
