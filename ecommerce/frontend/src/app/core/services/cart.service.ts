import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  // Reactive state — all components update instantly via signals
  private _items = signal<CartItem[]>([]);

  // Public readonly computed values
  readonly items = this._items.asReadonly();

  readonly count = computed(() =>
    this._items().reduce((sum, item) => sum + item.quantity, 0)
  );

  readonly total = computed(() =>
    this._items().reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );

  addToCart(product: Product): void {
    const current = this._items();
    const existing = current.find(i => i.product.id === product.id);

    if (existing) {
      // Already in cart — increment quantity
      this._items.set(
        current.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      );
    } else {
      this._items.set([...current, { product, quantity: 1 }]);
    }
  }

  removeFromCart(productId: number): void {
    this._items.set(this._items().filter(i => i.product.id !== productId));
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }
    this._items.set(
      this._items().map(i =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    );
  }

  clearCart(): void {
    this._items.set([]);
  }
}
