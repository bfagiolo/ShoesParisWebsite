// src/app/services/product.service.ts
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private db: AngularFireDatabase) {}

  getProducts(): Observable<Product[]> {
    return this.db
      .list('products')
      .snapshotChanges()
      .pipe(
        map(changes =>
          changes.map(c => {
            const product = c.payload.val() as Product;
            return {
              ...product,
              key: c.payload.key
            } as Product;
          })
        )
      );
  }
  
  

  getProduct(id: number): Observable<Product | undefined> {
    return this.db
      .object<Product>(`products/${id}`)
      .valueChanges()
      .pipe(
        map(product => product ?? undefined)
      );
  }


  updateProduct(key: string, data: Partial<Product>): Promise<void> {
    return this.db.object(`products/${key}`).update(data);
  }
  
  
  
}