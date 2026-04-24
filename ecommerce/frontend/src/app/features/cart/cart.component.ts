import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  constructor(
    public cartService: CartService,
    private router: Router
  ) {}

  updateQty(productId: number, event: Event) {
    const qty = parseInt((event.target as HTMLInputElement).value, 10);
    this.cartService.updateQuantity(productId, qty);
  }

  remove(productId: number) {
    this.cartService.removeFromCart(productId);
  }

  continueShopping() {
    this.router.navigate(['/home']);
  }

  checkout() {
    // Navigate to payment page (will be active once backend is ready)
    this.router.navigate(['/payment']);
  }
}
