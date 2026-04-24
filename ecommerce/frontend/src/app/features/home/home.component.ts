import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
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
  imports: [CommonModule, FormsModule, HttpClientModule, ProductCardComponent, FilterBarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  // Auth
  isLoggedIn = false;

  // CartService — reactive computed signal

  // Hero / Bestsellers
  bestsellers: Product[] = [];
  heroLoading = true;
  currentHeroIndex = 0;
  private heroInterval: any;

  // Product listing
  products: Product[] = [];
  categories: Category[] = [];
  loading = true;
  apiError = false;

  // Search (with debounce)
  searchTerm = '';
  private searchSubject = new Subject<string>();

  // Active filter (from FilterBarComponent)
  private activeFilter: ProductFilter = {};

  // Lifecycle
  private destroy$ = new Subject<void>();

  constructor(
    private auth: AuthService,
    private productService: ProductService,
    public cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn();

    // Load categories for filter bar
    this.productService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(cats => this.categories = cats);

    // Load bestsellers for hero
    this.productService.getBestsellers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.bestsellers = data.slice(0, 3);
          this.heroLoading = false;
          if (this.bestsellers.length > 1) {
            this.heroInterval = setInterval(() => {
              this.currentHeroIndex = (this.currentHeroIndex + 1) % this.bestsellers.length;
            }, 5000);
          }
        },
        error: () => { this.heroLoading = false; }
      });

    // Load products (initial)
    this.loadProducts();

    // Search debounce — 300ms
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.activeFilter = { ...this.activeFilter, q: term || undefined };
      this.loadProducts();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.heroInterval) clearInterval(this.heroInterval);
  }

  onSearchInput(term: string) {
    this.searchSubject.next(term);
  }

  onFilterChange(filter: ProductFilter) {
    this.activeFilter = { ...filter, q: this.searchTerm || undefined };
    this.loadProducts();
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
          // If empty array returned due to catchError → assume API offline
          if (data.length === 0 && Object.keys(this.activeFilter).length === 0) {
            this.apiError = true;
          }
        },
        error: () => {
          this.products = [];
          this.loading = false;
          this.apiError = true;
        }
      });
  }

  // Hero slide navigation
  goToHeroSlide(index: number) {
    this.currentHeroIndex = index;
  }

  // Cart
  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  // Auth
  login() { this.router.navigate(['/login']); }
  logout() {
    this.auth.logout();
    this.isLoggedIn = false;
  }

  // Skeleton array helper
  get skeletonArray() { return Array(8).fill(0); }
}
