import { Injectable } from '@angular/core';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private products: Product[] = [
    {
      id: 1,
      name: 'Tomatoes',
      description: 'Fresh, ripe tomatoes perfect for salads and cooking',
      price: 25.99,
      image: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=300',
      category: 'Vegetables',
      unit: 'per kg'
    },
    {
      id: 2,
      name: 'Potatoes',
      description: 'Versatile potatoes great for any meal',
      price: 18.50,
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300',
      category: 'Vegetables',
      unit: 'per kg'
    },
    {
      id: 3,
      name: 'Carrots',
      description: 'Crunchy and sweet carrots, rich in vitamins',
      price: 22.00,
      image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300',
      category: 'Vegetables',
      unit: 'per kg'
    },
    {
      id: 4,
      name: 'Spinach',
      description: 'Nutritious leafy greens packed with iron',
      price: 15.99,
      image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300',
      category: 'Leafy Greens',
      unit: 'per bunch'
    },
    {
      id: 5,
      name: 'Onions',
      description: 'Essential cooking ingredient, aromatic and flavorful',
      price: 20.00,
      image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=300',
      category: 'Vegetables',
      unit: 'per kg'
    },
    {
      id: 6,
      name: 'Bell Peppers',
      description: 'Colorful and crisp peppers for cooking or salads',
      price: 35.50,
      image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=300',
      category: 'Vegetables',
      unit: 'per kg'
    },
    {
      id: 7,
      name: 'Broccoli',
      description: 'Healthy green vegetable rich in nutrients',
      price: 28.99,
      image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=300',
      category: 'Vegetables',
      unit: 'per head'
    },
    {
      id: 8,
      name: 'Cabbage',
      description: 'Fresh cabbage perfect for coleslaw and stir-fries',
      price: 16.50,
      image: 'https://images.unsplash.com/photo-1594282474383-0b9c9a011075?w=300',
      category: 'Vegetables',
      unit: 'per head'
    }
  ];

  constructor() { }

  getProducts(): Product[] {
    return this.products;
  }

  getProductById(id: number): Product | undefined {
    return this.products.find(p => p.id === id);
  }
}
