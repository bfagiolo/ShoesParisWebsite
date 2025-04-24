// cart.component.ts
import { Component, OnInit } from '@angular/core';
import { CartService } from '../services/cart.service';
import { Product } from '../models/product';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: Product[] = [];
  
  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.cartService.getCartItems()
      .subscribe(items => {
        this.cartItems = items;
      });
  }

  removeFromCart(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  getCartTotal(): number {
    return this.cartService.getCartTotal();
  }
}