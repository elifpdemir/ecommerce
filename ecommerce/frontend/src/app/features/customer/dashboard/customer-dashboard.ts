import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.scss'
})
export class CustomerDashboardComponent implements OnInit {
  stats: any = { myOrders: 0, pendingOrders: 0, myReviews: 0, recentReviews: [] };
  loading = true;

  constructor(
    public auth: AuthService,
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.dashboardService.getCustomerStats().subscribe({
      next: (data) => { 
        this.stats = data; 
        this.loading = false; 
        this.cdr.detectChanges();
      },
      error: ()     => { 
        this.loading = false; 
        this.cdr.detectChanges();
      }
    });
  }

  logout() { this.auth.logout(); }

  scrollToReviews() {
    document.getElementById('my-reviews')?.scrollIntoView({ behavior: 'smooth' });
  }
}
