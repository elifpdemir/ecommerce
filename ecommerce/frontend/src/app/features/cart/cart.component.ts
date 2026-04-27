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

  getProductImage(productName: string, categoryId: number): string {
    if (!productName) return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600';
    const name = productName.toLowerCase();

    if (name.includes('frozen')) return 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=600';
    if (name.includes('minecraft')) return 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600';
    if (name.includes('big bang theory')) return 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600';
    if (name.includes('novel') || name.includes('book') || name.includes('alchemist')) return 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600';
    if (name.includes('season') || name.includes('dvd') || name.includes('blu-ray')) return 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600';
    const pools: { [key: number]: string[] } = {
      1: [ // Movies & Series
        'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600',
        'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600',
        'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600'
      ],
      2: [ // Apps & Games
        'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600',
        'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=600'
      ],
      3: [ // Books & Dictionaries
        'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600',
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600'
      ],
      5: [ // Music & Artists
        'https://images.unsplash.com/photo-1477233534935-f5e6fe7c1159?w=600',
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
        'https://images.unsplash.com/photo-151489464605f-3342082e4e1c?w=600'
      ],
      4: [ // Video DVD / Blu-ray
        'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=600',
        'https://images.unsplash.com/photo-1535016120720-40c646be8960?w=600'
      ],
      6: [ // Science / Non-fiction Books
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600',
        'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600'
      ]
    };

    const pool = pools[categoryId];
    if (pool) {
      const index = productName.length % pool.length;
      return pool[index];
    }

    return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600';
  }
}
