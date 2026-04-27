import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../core/auth/auth.service';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product, Category, ProductFilter } from '../../core/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { FilterBarComponent } from '../../shared/components/filter-bar/filter-bar.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, FilterBarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  private destroy$ = new Subject<void>();
  bestsellers: Product[] = [];
  heroLoading = true;
  currentHeroIndex = 0;
  private heroInterval: any;
  products: Product[] = [];
  categories: Category[] = [];
  loading = true;
  apiError = false;
  searchTerm = '';
  skeletonArray = Array(8).fill(0);
  private searchSubject = new Subject<string>();
  private activeFilter: ProductFilter = {};

  selectedProduct: Product | null = null;
  selectedProductReviews: any[] = [];
  modalLoading = false;
  userRole: string | null = null;

  newReview = {
    starRating: 5,
    reviewHead: '',
    reviewBody: ''
  };

  constructor(
    private auth: AuthService,
    private productService: ProductService,
    public cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.auth.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.isLoggedIn = !!user;
      this.userRole = this.auth.getRole();
      this.cdr.detectChanges();
    });
    
    this.loadCategories();
    this.loadBestsellers();
    this.loadProducts();

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.activeFilter = { ...this.activeFilter, q: term || undefined };
      this.loadProducts();
    });
  }

  loadCategories() {
    this.productService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(cats => {
        this.categories = cats;
        this.cdr.detectChanges();
      });
  }

  loadBestsellers() {
    this.productService.getBestsellers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.bestsellers = data.slice(0, 3);
          this.heroLoading = false;
          this.startHeroTimer();
          this.cdr.detectChanges();
        },
        error: () => { this.heroLoading = false; this.cdr.detectChanges(); }
      });
  }

  startHeroTimer() {
    if (this.heroInterval) clearInterval(this.heroInterval);
    if (this.bestsellers.length > 1) {
      this.heroInterval = setInterval(() => {
        this.currentHeroIndex = (this.currentHeroIndex + 1) % this.bestsellers.length;
        this.cdr.detectChanges();
      }, 5000);
    }
  }

  goToHeroSlide(index: number) {
    this.currentHeroIndex = index;
    this.startHeroTimer();
  }


  loadProducts() {
    this.loading = true;
    this.apiError = false;
    this.productService.getProducts(this.activeFilter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.products = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.products = [];
          this.loading = false;
          this.apiError = true;
          this.cdr.detectChanges();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.heroInterval) clearInterval(this.heroInterval);
  }

  onSearchInput(term: string) { this.searchSubject.next(term); }
  onFilterChange(filter: ProductFilter) {
    this.activeFilter = { ...filter };
    this.loadProducts();
  }
  addToCart(product: Product) { this.cartService.addToCart(product); }
  goToCart() { this.router.navigate(['/cart']); }
  login() { this.router.navigate(['/login']); }
  logout() { this.auth.logout(); this.isLoggedIn = false; }

  openProductModal(product: Product) {
    this.selectedProduct = product;
    this.modalLoading = true;
    this.productService.getReviews(product.id).subscribe({
      next: reviews => {
        this.selectedProductReviews = reviews;
        this.modalLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.selectedProductReviews = [];
        this.modalLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  closeProductModal() {
    this.selectedProduct = null;
    this.selectedProductReviews = [];
    this.resetReviewForm();
  }

  private resetReviewForm() {
    this.newReview = {
      starRating: 5,
      reviewHead: '',
      reviewBody: ''
    };
  }

  submitReview() {
    if (!this.selectedProduct || !this.newReview.reviewHead || !this.newReview.reviewBody) return;

    const reviewData = {
      ...this.newReview,
      productId: this.selectedProduct.id
    };

    this.productService.addReview(reviewData).subscribe({
      next: (savedReview) => {
        this.selectedProductReviews.unshift(savedReview);
        this.resetReviewForm();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error adding review:', err);
        alert('Could not add review. Please try again.');
      }
    });
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
