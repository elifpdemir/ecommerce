import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';

const API = environment.apiUrl.includes('8080')
  ? 'http://localhost:3000'   // json-server (mock)
  : environment.apiUrl;       // gerçek backend

@Injectable({ providedIn: 'root' })
export class DashboardService {
  constructor(private http: HttpClient) {}

  // ADMIN — tüm verilerin özeti
  getAdminStats() {
    return forkJoin({
      users:    this.http.get<any[]>(`${API}/users`),
      orders:   this.http.get<any[]>(`${API}/orders`),
      products: this.http.get<any[]>(`${API}/products`),
    }).pipe(
      map(({ users, orders, products }) => ({
        totalUsers:    users.length,
        totalOrders:   orders.length,
        totalRevenue:  orders.reduce((sum, o) => sum + (o.total || 0), 0),
        totalProducts: products.length,
      }))
    );
  }

  // SELLER — sadece kendi ürünleri (sellerId: 2)
  getSellerStats(sellerId: number = 2) {
    return forkJoin({
      products: this.http.get<any[]>(`${API}/products?sellerId=${sellerId}`),
      orders:   this.http.get<any[]>(`${API}/orders`),
      reviews:  this.http.get<any[]>(`${API}/reviews`),
    }).pipe(
      map(({ products, orders, reviews }) => {
        const myProductIds = products.map((p: any) => p.id);
        const myOrders  = orders.filter((o: any) => myProductIds.includes(o.productId));
        const myReviews = reviews.filter((r: any) => myProductIds.includes(r.productId));
        return {
          myProducts: products.length,
          myOrders:   myOrders.length,
          myRevenue:  myOrders.reduce((sum, o) => sum + (o.total || 0), 0),
          myReviews:  myReviews.length,
        };
      })
    );
  }

  // CUSTOMER — sadece kendi siparişleri (userId: 3)
  getCustomerStats(userId: number = 3) {
    return forkJoin({
      orders:  this.http.get<any[]>(`${API}/orders?userId=${userId}`),
      reviews: this.http.get<any[]>(`${API}/reviews?userId=${userId}`),
    }).pipe(
      map(({ orders, reviews }) => ({
        myOrders:     orders.length,
        pendingOrders: orders.filter((o: any) => o.status === 'pending').length,
        myReviews:    reviews.length,
      }))
    );
  }
}
