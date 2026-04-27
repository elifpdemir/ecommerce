import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { DashboardService } from '../../../core/services/dashboard.service';

import { FormsModule } from '@angular/forms';

import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './seller-dashboard.html',
  styleUrl: './seller-dashboard.scss'
})
export class SellerDashboardComponent implements OnInit {
  stats = { myProducts: 0, myOrders: 0, myRevenue: 0, myReviews: 0 };
  loading = true;
  activeTab = 'Overview';
  orders: any[] = [];
  reviews: any[] = [];
  products: any[] = [];
  myStoreId: number | null = null;
  newProduct: any = { name: '', price: 0, categoryId: 1, sku: '', storeId: null };
  availableStatuses = ['Pending', 'Approved', 'Shipped', 'Delivered'];

  @ViewChild('sellerChart') sellerChartRef!: ElementRef;
  chartInstance: any;

  constructor(
    public auth: AuthService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.dashboardService.getSellerStats().subscribe({
      next: (data) => { 
        this.stats = data; 
        this.loading = false; 
        this.cdr.detectChanges();
        this.tryDrawChart();
      },
      error: ()     => { 
        this.loading = false; 
        this.cdr.detectChanges();
      }
    });

    this.dashboardService.getOrders().subscribe(data => {
      this.orders = data;
      this.cdr.detectChanges();
      this.tryDrawChart();
    });

    this.dashboardService.getStoreReviews().subscribe(data => {
      this.reviews = data;
      this.stats.myReviews = data.length;
      this.cdr.detectChanges();
    });

    this.http.get<any>('http://localhost:8081/api/stores/my').subscribe(store => {
      if (store && store.id) {
        this.myStoreId = store.id;
        this.newProduct.storeId = store.id;
        this.loadProducts();
      }
    });
  }

  loadProducts() {
    if (!this.myStoreId) return;
    this.http.get<any[]>(`http://localhost:8081/api/products/store/${this.myStoreId}`).subscribe(data => {
      this.products = data || [];
      this.cdr.detectChanges();
    });
  }

  createProduct() {
    this.http.post('http://localhost:8081/api/products', this.newProduct).subscribe(() => {
      this.loadProducts();
      this.newProduct = { name: '', price: 0, categoryId: 1, sku: '', storeId: this.myStoreId };
      alert('Product created');
    });
  }

  updateProductPrice(p: any) {
    const newPrice = prompt('Enter new price for ' + p.name, p.price);
    if (newPrice !== null && !isNaN(parseFloat(newPrice))) {
      this.http.put(`http://localhost:8081/api/products/${p.id}/price`, { price: parseFloat(newPrice) }).subscribe(() => {
        this.loadProducts();
      });
    }
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure?')) {
      this.http.delete(`http://localhost:8081/api/products/${id}`).subscribe(() => {
        this.loadProducts();
      });
    }
  }

  setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'Overview') {
      setTimeout(() => this.tryDrawChart(), 100);
    }
  }

  tryDrawChart() {
    if (this.activeTab !== 'Overview' || !this.sellerChartRef || !this.orders || this.orders.length === 0) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const pending = this.orders.filter(o => o.status === 'Pending').length;
    const shipped = this.orders.filter(o => o.status === 'Shipped').length;
    const delivered = this.orders.filter(o => o.status === 'Delivered').length;

    const ctx = this.sellerChartRef.nativeElement.getContext('2d');
    this.chartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Pending', 'Shipped', 'Delivered'],
        datasets: [{
          data: [pending, shipped, delivered],
          backgroundColor: ['#fbbf24', '#3b82f6', '#10b981'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  updateOrderStatus(order: any, newStatus: string) {
    const oldStatus = order.status;
    order.status = newStatus;
    this.http.put(`http://localhost:8081/api/orders/${order.id}/status`, { status: newStatus }).subscribe({
      error: () => {
        order.status = oldStatus;
        alert('Failed to update status');
      }
    });
  }

  logout() { this.auth.logout(); }
}
