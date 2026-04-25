import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { ChatbotComponent } from '../../../shared/components/chatbot/chatbot';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, ChatbotComponent],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboardComponent implements OnInit {
  stats = { totalUsers: 0, totalOrders: 0, totalRevenue: 0, totalProducts: 0 };
  loading = true;

  constructor(
    public auth: AuthService,
    private router: Router,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    this.dashboardService.getAdminStats().subscribe({
      next: (data) => { this.stats = data; this.loading = false; },
      error: ()     => { this.loading = false; }
    });
  }

  logout() { this.auth.logout(); }
}
