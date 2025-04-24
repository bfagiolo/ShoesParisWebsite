
import { Component, OnInit } from '@angular/core';
import { Product } from '../models/product';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { SearchService } from '../services/search.service'; 

@Component({
  selector: 'app-products',
  standalone: false,
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  allProducts: Product[] = []; 
  products: Product[] = [];
  cartItemIds: Set<number> = new Set();
  
  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private searchService: SearchService 
  ) { }
  
  ngOnInit(): void {
    this.productService.getProducts()
      .subscribe(products => {
        this.allProducts = products; 
        this.products = products;   
      });
      
    
    this.cartService.getCartItems().subscribe(items => {
      this.cartItemIds = new Set(items.map(item => item.id));
    });
    
    
    this.searchService.currentSearchTerm.subscribe(term => {
      this.filterProducts(term);
    });
  }
  
  
  filterProducts(term: string): void {
    if (!term || term.trim() === '') {
      this.products = this.allProducts; 
    } else {
      term = term.toLowerCase();
      this.products = this.allProducts.filter(product => 
        product.name.toLowerCase().includes(term)
      );
    }
  }
  
  toggleCart(product: Product): void {
    this.cartService.toggleCartItem(product);
  }
  
  isInCart(productId: number): boolean {
    return this.cartItemIds.has(productId);
  }

  onRatingChange(rating: number, productId: number): void {
    const product = this.allProducts.find(p => p.id === productId);
  
    if (product && product.key) {
      product.rating = rating;
      this.productService.updateProduct(product.key, { rating });
    } else {
      console.warn('Product or key not found for ID:', productId, product);
    }
  }
  
  
  
}