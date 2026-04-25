import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, UserRole } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.username || !this.password) return;
    this.loading = true;
    this.error = '';

    this.auth.login(this.username, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        this.redirectByRole(res.role);
      },
      error: () => {
        this.loading = false;
        this.error = 'Invalid username or password.';
      }
    });
  }

  private redirectByRole(role: UserRole) {
    const routes: Record<UserRole, string> = {
      ADMIN: '/admin/dashboard',
      SELLER: '/seller/dashboard',
      CUSTOMER: '/customer/dashboard'
    };
    this.router.navigate([routes[role]]);
  }
}
