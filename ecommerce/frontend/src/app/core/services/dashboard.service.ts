import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {

  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // --- COMPONENT'İN BEKLEDİĞİ ANA METOTLAR ---

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/orders`);
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/users`);
  }

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/products`);
  }

  // --- İSTATİSTİK METOTLARI ---

  getAdminStats(): Observable<any> {
    return forkJoin({
      users:    this.getUsers(),
      orders:   this.getOrders(),
      products: this.getProducts(),
    }).pipe(
      map(({ users, orders, products }) => {
        // Java'dan hem grandTotal hem de grand_total gelebilir, ikisini de kontrol ediyoruz
        const revenue = orders.reduce((sum, o) => sum + (o.grandTotal || o.grand_total || 0), 0);

        return {
          totalUsers:    users.length,
          totalOrders:   orders.length,
          totalRevenue:  revenue,
          totalProducts: products.length,
        };
      })
    );
  }

  getSellerStats(): Observable<any> {
    // First get the user's store to know the storeId
    return this.http.get<any>(`${this.API}/stores/my`).pipe(
      map(store => store?.id),
      switchMap(storeId => {
        return forkJoin({
          products: storeId ? this.http.get<any[]>(`${this.API}/products?storeId=${storeId}`) : this.getProducts(),
          orders:   this.getOrders(),
        }).pipe(
          map(({ products, orders }) => ({
            myProducts: products.length,
            myOrders:   orders.length,
            myRevenue:  orders.reduce((sum, o) => sum + (o.grandTotal || o.grand_total || 0), 0),
            myReviews:  0
          }))
        );
      })
    );
  }

  getMyReviews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/reviews/my`).pipe(
      map(reviews => reviews || [])
    );
  }

  getStoreReviews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/reviews/store`).pipe(
      map(reviews => reviews || [])
    );
  }

  getCustomerStats(): Observable<any> {
    return forkJoin({
      orders: this.getOrders(),
      reviews: this.getMyReviews()
    }).pipe(
      map(({ orders, reviews }) => ({
        myOrders:      orders.length,
        pendingOrders: orders.filter((o: any) => o.status?.toLowerCase() === 'pending' || o.status === 'Bekliyor').length,
        myReviews:     reviews.length,
        recentReviews: reviews.slice(0, 5)
      }))
    );
  }
}
