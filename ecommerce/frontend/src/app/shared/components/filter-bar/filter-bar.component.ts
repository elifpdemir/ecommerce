import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, ProductFilter } from '../../../core/models/product.model';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filter-bar">
      <!-- Category Pills -->
      <div class="filter-bar__categories">
        <button
          class="filter-pill"
          [class.filter-pill--active]="!selectedCategory"
          (click)="selectCategory(null)"
        >
          All
        </button>
        <button
          *ngFor="let cat of categories"
          class="filter-pill"
          [class.filter-pill--active]="selectedCategory === cat.name"
          (click)="selectCategory(cat.name)"
        >
          {{ cat.name }}
        </button>
      </div>

      <!-- Sort & Price -->
      <div class="filter-bar__controls">
        <select class="filter-select" [(ngModel)]="selectedSort" (change)="emitFilter()">
          <option value="">Sort by</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="name_asc">Name: A → Z</option>
        </select>

        <select class="filter-select" [(ngModel)]="selectedPriceRange" (change)="emitFilter()">
          <option value="">All Prices</option>
          <option value="0-500">₺0 – ₺500</option>
          <option value="500-1500">₺500 – ₺1,500</option>
          <option value="1500-3000">₺1,500 – ₺3,000</option>
          <option value="3000-99999">₺3,000+</option>
        </select>
      </div>
    </div>
  `,
  styles: [`
    .filter-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid hsl(var(--border));
      margin-bottom: 2rem;
    }

    .filter-bar__categories {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .filter-pill {
      padding: 0.4rem 1rem;
      border-radius: 9999px;
      border: 1px solid hsl(var(--border));
      background: transparent;
      color: hsl(var(--muted-foreground));
      font-size: 0.78rem;
      letter-spacing: 0.04em;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-family: 'DM Sans', sans-serif;
    }

    .filter-pill:hover {
      border-color: hsl(var(--primary));
      color: hsl(var(--primary));
    }

    .filter-pill--active {
      background-color: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
      border-color: hsl(var(--primary));
    }

    .filter-bar__controls {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .filter-select {
      padding: 0.4rem 1rem;
      border: 1px solid hsl(var(--border));
      border-radius: var(--radius);
      background-color: hsl(var(--background));
      color: hsl(var(--foreground));
      font-size: 0.78rem;
      font-family: 'DM Sans', sans-serif;
      outline: none;
      cursor: pointer;
      transition: border-color 0.2s ease;
    }

    .filter-select:focus {
      border-color: hsl(var(--primary));
    }
  `]
})
export class FilterBarComponent implements OnInit {
  @Input() categories: Category[] = [];
  @Output() filterChange = new EventEmitter<ProductFilter>();

  selectedCategory: string | null = null;
  selectedSort = '';
  selectedPriceRange = '';

  ngOnInit() {}

  selectCategory(cat: string | null) {
    this.selectedCategory = cat;
    this.emitFilter();
  }

  emitFilter() {
    const filter: ProductFilter = {};

    if (this.selectedCategory) {
      filter.category = this.selectedCategory;
    }

    if (this.selectedPriceRange) {
      const [min, max] = this.selectedPriceRange.split('-').map(Number);
      filter.price_gte = min;
      filter.price_lte = max;
    }

    if (this.selectedSort) {
      const [field, order] = this.selectedSort.split('_') as [string, 'asc' | 'desc'];
      filter._sort = field;
      filter._order = order;
    }

    this.filterChange.emit(filter);
  }
}
