import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { ChatbotComponent } from '../../../shared/components/chatbot/chatbot';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, ChatbotComponent],
  templateUrl: './customer-dashboard.html',
  styleUrl: './customer-dashboard.scss'
})
export class CustomerDashboardComponent implements OnInit {
  stats = { myOrders: 0, pendingOrders: 0, myReviews: 0 };
  loading = true;

  constructor(
    public auth: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    this.dashboardService.getCustomerStats(3).subscribe({
      next: (data) => { this.stats = data; this.loading = false; },
      error: ()     => { this.loading = false; }
    });
  }

  logout() { this.auth.logout(); }
}
