import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="product-card group" (click)="onViewDetail()">
      <!-- Image -->
      <div class="product-card__image-wrap">
        <img
          [src]="getProductImage(product.name, product.categoryId)"
          [alt]="product.name"
          class="product-card__img"
          loading="lazy"
          (error)="onImgError($event)"
        />
        <!-- Bestseller Tag -->
        <span *ngIf="product.bestseller" class="product-card__badge">Best Seller</span>

        <!-- Add to Cart Overlay -->
        <div class="product-card__overlay">
          <button class="product-card__cart-btn" (click)="onAddToCart($event)">
            Add to Cart
          </button>
        </div>
      </div>

      <!-- Info -->
      <div class="product-card__info">
        <span class="product-card__category">{{ product.category }}</span>
        <h3 class="product-card__name">{{ product.name }}</h3>
        <p class="product-card__price">{{ product.price }}$</p>
        <p *ngIf="product.stockQuantity === 0" class="product-card__stock-warn">Out of stock</p>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      display: flex;
      flex-direction: column;
      cursor: pointer;
    }

    .product-card__image-wrap {
      position: relative;
      width: 100%;
      aspect-ratio: 4 / 5;
      overflow: hidden;
      border-radius: var(--radius);
      background-color: hsl(var(--secondary));
      margin-bottom: 1rem;
    }

    .product-card__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .product-card:hover .product-card__img {
      transform: scale(1.05);
    }

    .product-card__badge {
      position: absolute;
      top: 0.75rem;
      left: 0.75rem;
      background-color: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
      font-size: 0.65rem;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
    }

    .product-card__overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: flex-end;
      padding: 1rem;
      opacity: 0;
      transform: translateY(8px);
      transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .product-card:hover .product-card__overlay {
      opacity: 1;
      transform: translateY(0);
    }

    .product-card__cart-btn {
      width: 100%;
      padding: 0.75rem;
      background-color: rgba(255,255,255,0.92);
      backdrop-filter: blur(8px);
      border: none;
      border-radius: var(--radius);
      font-size: 0.75rem;
      font-weight: 500;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
      color: hsl(var(--foreground));
      transition: all 0.2s ease;
    }

    .product-card__cart-btn:hover {
      background-color: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
    }

    .product-card__info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .product-card__category {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: hsl(var(--muted-foreground));
    }

    .product-card__name {
      font-size: 0.9rem;
      font-weight: 400;
      color: hsl(var(--foreground));
      margin: 0;
      line-height: 1.4;
    }

    .product-card__price {
      font-size: 0.9rem;
      font-weight: 500;
      color: hsl(var(--foreground));
      margin: 0.25rem 0 0;
    }

    .product-card__stock-warn {
      font-size: 0.7rem;
      color: hsl(var(--destructive));
      margin: 0;
    }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() viewDetail = new EventEmitter<Product>();

  onAddToCart(event: MouseEvent) {
    event.stopPropagation();
    this.addToCart.emit(this.product);
  }

  onViewDetail() {
    this.viewDetail.emit(this.product);
  }

  onImgError(event: Event) {
    (event.target as HTMLImageElement).src =
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80';
  }
getProductImage(productName: string, categoryId: number): string {
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

return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600';}
}
