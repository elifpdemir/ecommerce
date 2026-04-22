import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  template: `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;gap:1rem">
      <h1 style="color:#e53e3e">403 — Unauthorized</h1>
      <p style="color:#64748b">You do not have permission to access this page.</p>
      <button (click)="router.navigate(['/login'])"
        style="padding:0.6rem 1.5rem;background:#4f46e5;color:white;border:none;border-radius:8px;cursor:pointer">
        Back to Login
      </button>
    </div>
  `
})
export class UnauthorizedComponent {
  constructor(public router: Router) {}
}
