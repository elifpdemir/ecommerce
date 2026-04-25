import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { ChatbotComponent } from '../../../shared/components/chatbot/chatbot';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, ChatbotComponent],
  templateUrl: './seller-dashboard.html',
  styleUrl: './seller-dashboard.scss'
})
export class SellerDashboardComponent implements OnInit {
  stats = { myProducts: 0, myOrders: 0, myRevenue: 0, myReviews: 0 };
  loading = true;

  constructor(
    public auth: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    this.dashboardService.getSellerStats(2).subscribe({
      next: (data) => { this.stats = data; this.loading = false; },
      error: ()     => { this.loading = false; }
    });
  }

  logout() { this.auth.logout(); }
}
