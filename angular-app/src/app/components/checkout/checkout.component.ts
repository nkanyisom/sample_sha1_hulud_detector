import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/product';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartTotal: number = 0;
  selectedPaymentMethod: string = '';
  orderPlaced: boolean = false;

  paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
    { id: 'eft', name: 'EFT/Bank Transfer', icon: '🏦' },
    { id: 'cash', name: 'Cash on Delivery', icon: '💵' },
    { id: 'snapscan', name: 'SnapScan', icon: '📱' },
    { id: 'zapper', name: 'Zapper', icon: '⚡' }
  ];

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartItems = this.cartService.getCartItems();
    this.cartTotal = this.cartService.getCartTotal();
    
    if (this.cartItems.length === 0) {
      this.router.navigate(['/products']);
    }
  }

  selectPaymentMethod(methodId: string): void {
    this.selectedPaymentMethod = methodId;
  }

  placeOrder(): void {
    if (!this.selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }
    
    this.orderPlaced = true;
    setTimeout(() => {
      this.cartService.clearCart();
      this.router.navigate(['/products']);
    }, 3000);
  }

  backToCart(): void {
    this.router.navigate(['/cart']);
  }

  getPaymentMethodName(id: string): string {
    const method = this.paymentMethods.find(m => m.id === id);
    return method ? method.name : '';
  }
}
