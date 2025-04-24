import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Product } from '../models/product';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: Product[] = [];
  private cartSubject = new BehaviorSubject<Product[]>([]);

  constructor(private db: AngularFireDatabase) {
    this.loadCartFromFirebase();
  }

  private getOrCreateCartId(): string {
    let cartId = localStorage.getItem('cartId');
    if (!cartId) {
      cartId = crypto.randomUUID();
      localStorage.setItem('cartId', cartId);
    }
    return cartId;
  }

  private async loadCartFromFirebase(): Promise<void> {
    const cartId = this.getOrCreateCartId();
    this.db.list<Product>(`carts/${cartId}/items`)
      .valueChanges()
      .subscribe(items => {
        this.cartItems = items || [];
        this.cartSubject.next([...this.cartItems]);
      });
  }

  private saveCartToFirebase(): void {
    const cartId = this.getOrCreateCartId();
    const updates: { [key: string]: Product } = {};
    this.cartItems.forEach(item => {
      updates[item.id] = item;
    });
    this.db.object(`carts/${cartId}/items`).set(updates);
  }

  getCartItems(): Observable<Product[]> {
    return this.cartSubject.asObservable();
  }

  isInCart(productId: number): Observable<boolean> {
    return this.cartSubject.pipe(
      map(items => items.some(item => item.id === productId))
    );
  }

  toggleCartItem(product: Product): void {
    const index = this.cartItems.findIndex(item => item.id === product.id);

    if (index === -1) {
      this.cartItems.push(product);
    } else {
      this.cartItems.splice(index, 1);
    }

    this.cartSubject.next([...this.cartItems]);
    this.saveCartToFirebase(); // 🔥 Persist change
  }

  removeFromCart(productId: number): void {
    this.cartItems = this.cartItems.filter(item => item.id !== productId);
    this.cartSubject.next([...this.cartItems]);
    this.saveCartToFirebase();
  }

  clearCart(): void {
    this.cartItems = [];
    this.cartSubject.next([]);
    const cartId = this.getOrCreateCartId();
    this.db.object(`carts/${cartId}/items`).remove();
  }

  getCartTotal(): number {
    return this.cartItems.reduce((total, item) => total + item.price, 0);
  }

  getCartCount(): number {
    return this.cartItems.length;
  }

  getCurrentCart(): Product[] {
    return this.cartItems;
  }
  
}
