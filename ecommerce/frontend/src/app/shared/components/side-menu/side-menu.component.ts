import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles?: string[]; // undefined = visible to all
}

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent {
  isOpen = false;

  readonly allNavItems: NavItem[] = [
    { label: 'Home',             route: '/home',               icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { label: 'My Cart',          route: '/cart',               icon: 'M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6' },
    { label: 'Admin Dashboard',  route: '/admin/dashboard',    icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5', roles: ['ADMIN'] },
    { label: 'Seller Dashboard', route: '/seller/dashboard',   icon: 'M3 3h18v18H3zM3 9h18M9 21V9',                              roles: ['SELLER'] },
    { label: 'My Account',       route: '/customer/dashboard', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', roles: ['CUSTOMER'] },
  ];

  constructor(public auth: AuthService, private router: Router) {}

  get visibleItems(): NavItem[] {
    const role = this.auth.getRole();
    return this.allNavItems.filter(item =>
      !item.roles || (role && item.roles.includes(role))
    );
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  toggle() { this.isOpen = !this.isOpen; }
  close()  { this.isOpen = false; }

  navigate(route: string) {
    this.router.navigate([route]);
    this.close();
  }

  logout() {
    this.auth.logout();
    this.close();
  }
}
