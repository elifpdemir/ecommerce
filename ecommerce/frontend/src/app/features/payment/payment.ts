import { Component, OnInit, NgZone } from '@angular/core';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment.html',
  styleUrls: ['./payment.scss']
})
export class PaymentComponent implements OnInit {
  stripe: Stripe | null = null;
  card: StripeCardElement | null = null;
  totalAmount = 0;
  isProcessing = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    public cartService: CartService,
    private auth: AuthService,
    private ngZone: NgZone
  ) {
    this.totalAmount = this.cartService.total() || 0;
  }

  async ngOnInit() {
    this.stripe = await loadStripe('pk_test_51TOz0GELt5iVPm0j1Z58mEGlpLqmugIcEAkNVpaqIXb9nhwjrr2OOPepipE1xrX7mvnHw2u6j9GF9Ea8GUd9txTd00LPIgRrkA');

    if (this.stripe) {
      const elements = this.stripe.elements();
      this.card = elements.create('card', { hidePostalCode: true });
      this.card.mount('#card-element');
    } else {
      console.error('Stripe failed to load');
    }
  }

  async handlePayment(event: Event) {
    event.preventDefault();
    this.isProcessing = true;

    this.http.post<{clientSecret: string}>('http://localhost:8081/api/payment/create-intent', { amount: this.totalAmount })
      .subscribe({
        next: async (res) => {
          try {
            const result = await this.stripe?.confirmCardPayment(res.clientSecret, {
              payment_method: {
                card: this.card!,
              }
            });

            this.ngZone.run(() => {
              if (result?.error) {
                const errorElement = document.getElementById('card-errors');
                if (errorElement) errorElement.textContent = result.error.message!;
              } else if (result?.paymentIntent?.status === 'succeeded') {
                alert('Payment Successful!');
                this.completeOrder();
              }
            });
          } catch (e) {
            this.ngZone.run(() => {
              console.error('Error confirming card payment:', e);
            });
          } finally {
            this.ngZone.run(() => {
              this.isProcessing = false;
            });
          }
        },
        error: (err) => {
          console.error('Payment intent error:', err);
          this.isProcessing = false;
        }
      });
  }

  completeOrder() {
    const cartItems = this.cartService.items();
    const storeId = cartItems.length > 0 ? (cartItems[0].product as any).storeId : 1;

    const items = cartItems.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      price: item.product.price
    }));

    this.http.post('http://localhost:8081/api/orders', { 
      status: 'Pending', 
      grandTotal: this.totalAmount,
      storeId: storeId,
      items: items
    })
      .subscribe({
        next: () => {
          this.ngZone.run(() => {
            console.log('Order saved as Pending.');
            this.cartService.clearCart();
            this.router.navigate(['/orders']);
          });
        },
        error: (err) => {
          this.ngZone.run(() => {
            console.error('Order save error:', err);
            alert('Could not save order to database. See console for details.');
          });
        }
      });
  }
}
