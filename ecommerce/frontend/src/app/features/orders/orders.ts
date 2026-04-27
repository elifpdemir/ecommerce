import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth/auth.service';
import { SideMenuComponent } from '../../shared/components/side-menu/side-menu.component';
import { FormsModule } from '@angular/forms';

export interface Order {
  id: number;
  userId: number;
  storeId: number;
  status: string;
  grandTotal: number;
  invoiceNo: number;
  orderDate: string;
  productNames?: string[];
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, SideMenuComponent, FormsModule],
  templateUrl: './orders.html',
  styleUrls: ['./orders.scss']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  role: string | null = null;
  availableStatuses = ['Pending', 'Approved', 'Shipped', 'Delivered'];

  constructor(
    private http: HttpClient, 
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.role = this.auth.getRole();
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.http.get<Order[]>('http://localhost:8081/api/orders').subscribe({
      next: (data) => {
        this.orders = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch orders:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateStatus(order: Order, newStatus: string): void {
    const oldStatus = order.status;
    order.status = newStatus; // Optimistic update
    this.http.put(`http://localhost:8081/api/orders/${order.id}/status`, { status: newStatus }).subscribe({
      next: () => {
        console.log(`Order ${order.id} status updated to ${newStatus}`);
      },
      error: (err) => {
        console.error('Failed to update status:', err);
        order.status = oldStatus; // Revert on failure
      }
    });
  }
}
