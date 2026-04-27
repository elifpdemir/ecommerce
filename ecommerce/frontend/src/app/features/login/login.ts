import { Component, ChangeDetectorRef } from '@angular/core';
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
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router, private cdr: ChangeDetectorRef) {}

  onSubmit() {
    if (!this.email || !this.password) {
      this.error = 'Please enter both email and password.';
      return;
    }
    this.loading = true;
    this.error = '';

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        // 1. Önce verilerin LocalStorage'a yazıldığından emin olalım
        localStorage.setItem('token', res.token);
        localStorage.setItem('roleType', res.roleType);
        localStorage.setItem('userEmail', res.email);

        console.log('Giriş başarılı, yönlendiriliyor...');

        // 2. Çok kısa bir gecikme (100ms) ekleyerek Interceptor'ın
        // LocalStorage'daki yeni veriyi yakalamasını garanti ediyoruz.
        setTimeout(() => {
          this.loading = false;
          this.redirectByRole(res.roleType);
        }, 100);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Email or password incorrect!';
        this.cdr.detectChanges();
        console.error('Login Error:', err);
      }
    });
  }

  redirectByRole(role: string) {
    switch (role) {
      case 'ADMIN':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'CORPORATE':
        this.router.navigate(['/seller/dashboard']);
        break;
      case 'INDIVIDUAL':
        this.router.navigate(['/customer/dashboard']);
        break;
      default:
        this.router.navigate(['/home']);
    }
  }
}
