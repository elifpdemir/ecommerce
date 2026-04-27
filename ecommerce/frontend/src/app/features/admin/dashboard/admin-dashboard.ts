import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { DashboardService } from '../../../core/services/dashboard.service';
import { BehaviorSubject, finalize } from 'rxjs';

import { FormsModule } from '@angular/forms';

import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboardComponent implements OnInit {
  // Verileri akış olarak tanımlıyoruz (Subject)
  stats$ = new BehaviorSubject<any>(null);
  orders$ = new BehaviorSubject<any[]>([]);
  products$ = new BehaviorSubject<any[]>([]);
  stores$ = new BehaviorSubject<any[]>([]);
  loading = true;
  activeTab = 'Overview';

  @ViewChild('adminChart') adminChartRef!: ElementRef;
  chartInstance: any;

  newProduct: any = { name: '', price: 0, categoryId: 1, storeId: 1, sku: '' };
  newStore: any = { name: '', ownerId: 1, status: 'Active' };

  constructor(
    public auth: AuthService,
    private router: Router,
    private dashboardService: DashboardService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    // Wait for the tab and data to be ready before drawing
    this.stats$.subscribe(stats => {
      if (stats && this.activeTab === 'Overview') {
        setTimeout(() => this.drawChart(stats), 100);
      }
    });
  }

  setTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'Overview') {
      setTimeout(() => this.drawChart(this.stats$.getValue()), 100);
    }
  }

  loadData() {
    this.loading = true;

    // İstatistikleri çek ve akışa gönder
    this.dashboardService.getAdminStats().subscribe({
      next: (data) => this.stats$.next(data),
      error: (err) => console.error('Stats hatası:', err)
    });

    // Siparişleri çek ve akışa gönder
    this.dashboardService.getOrders().pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (data) => this.orders$.next(data || []),
      error: (err) => console.error('Orders hatası:', err)
    });

    this.dashboardService.getProducts().subscribe(data => this.products$.next(data || []));
    this.http.get<any[]>('http://localhost:8081/api/stores').subscribe(data => this.stores$.next(data || []));
  }

  drawChart(stats: any) {
    if (!stats || !this.adminChartRef) return;
    
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const ctx = this.adminChartRef.nativeElement.getContext('2d');
    this.chartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Users', 'Orders', 'Products'],
        datasets: [{
          data: [stats.totalUsers || 0, stats.totalOrders || 0, stats.totalProducts || 0],
          backgroundColor: ['#6366f1', '#fbbf24', '#10b981'],
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

  createProduct() {
    this.http.post('http://localhost:8081/api/products', this.newProduct).subscribe(() => {
      this.loadData();
      this.newProduct = { name: '', price: 0, categoryId: 1, storeId: 1, sku: '' };
      alert('Product created');
    });
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure?')) {
      this.http.delete(`http://localhost:8081/api/products/${id}`).subscribe(() => {
        this.loadData();
      });
    }
  }

  createStore() {
    this.http.post('http://localhost:8081/api/stores', this.newStore).subscribe(() => {
      this.loadData();
      this.newStore = { name: '', ownerId: 1, status: 'Active' };
      alert('Store created');
    });
  }

  deleteStore(id: number) {
    if (confirm('Are you sure?')) {
      this.http.delete(`http://localhost:8081/api/stores/${id}`).subscribe(() => {
        this.loadData();
      });
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/home']);
  }
}
