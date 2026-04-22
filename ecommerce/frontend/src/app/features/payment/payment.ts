import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { loadStripe, Stripe, StripeCardElement } from '@stripe/stripe-js';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment.html',
  styleUrl: './payment.scss'
})
export class PaymentComponent implements OnInit {
  @Input() amount: number = 0;       // kuruş cinsinden (100 = $1.00)
  @Input() orderId: string = '';

  private stripe: Stripe | null = null;
  private cardElement: StripeCardElement | null = null;

  loading = false;
  success = false;
  error = '';

  constructor(private http: HttpClient) {}

  async ngOnInit() {
    this.stripe = await loadStripe(environment.stripePublishableKey);
    if (!this.stripe) return;

    const elements = this.stripe.elements();
    this.cardElement = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#1a1a2e',
          '::placeholder': { color: '#94a3b8' }
        }
      }
    });
    this.cardElement.mount('#card-element');
  }

  async pay() {
    if (!this.stripe || !this.cardElement) return;
    this.loading = true;
    this.error = '';

    // Backend'den client_secret al
    this.http.post<{ clientSecret: string }>(
      `${environment.apiUrl}/payments/create-intent`,
      { amount: this.amount, orderId: this.orderId }
    ).subscribe({
      next: async (res) => {
        const result = await this.stripe!.confirmCardPayment(res.clientSecret, {
          payment_method: { card: this.cardElement! }
        });

        this.loading = false;

        if (result.error) {
          this.error = result.error.message || 'Payment failed.';
        } else if (result.paymentIntent?.status === 'succeeded') {
          this.success = true;
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Could not connect to payment server.';
      }
    });
  }
}
