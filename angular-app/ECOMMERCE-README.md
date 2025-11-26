# Fresh Vegetable Store - E-commerce Application

A modern e-commerce web application built with Angular 19 for selling fresh vegetables, with prices displayed in South African Rand (ZAR).

## Features

### 🛒 Shopping Experience
- **Product Catalog**: Browse a selection of 8 fresh vegetables with detailed descriptions and images
- **Shopping Cart**: Add items to cart with quantity management
- **Checkout Process**: Select from multiple payment options (no real payment integration)
- **Responsive Design**: Mobile-friendly interface

### 💰 Payment Options
The checkout includes the following payment methods (display only):
- Credit/Debit Card 💳
- EFT/Bank Transfer 🏦
- Cash on Delivery 💵
- SnapScan 📱
- Zapper ⚡

### 🥬 Available Vegetables
1. Tomatoes - R 25.99 per kg
2. Potatoes - R 18.50 per kg
3. Carrots - R 22.00 per kg
4. Spinach - R 15.99 per bunch
5. Onions - R 20.00 per kg
6. Bell Peppers - R 35.50 per kg
7. Broccoli - R 28.99 per head
8. Cabbage - R 16.50 per head

## Project Structure

```
src/app/
├── components/
│   ├── product-list/     # Display all vegetables
│   ├── cart/             # Shopping cart with quantity controls
│   └── checkout/         # Checkout with payment options
├── services/
│   ├── product.service.ts # Manages vegetable inventory
│   └── cart.service.ts    # Handles cart operations
├── models/
│   └── product.ts        # Product and CartItem interfaces
└── app.routes.ts         # Application routing
```

## Running the Application

### Development Server
```bash
cd angular-app
npm start
```
or
```bash
ng serve
```

Navigate to `http://localhost:4200/` in your browser.

### Build for Production
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Application Routes

- `/` - Redirects to `/products`
- `/products` - Product listing page
- `/cart` - Shopping cart page
- `/checkout` - Checkout page with payment selection

## Key Technologies

- **Angular 19** - Latest Angular framework with standalone components
- **TypeScript** - Type-safe development
- **RxJS** - Reactive programming for cart state management
- **CSS** - Custom styling with responsive design

## Features Implementation

### Cart Management
- Add items to cart from product list
- Update quantities (increase/decrease)
- Remove items from cart
- Real-time cart total calculation
- Cart badge showing item count in navigation

### State Management
- Cart service uses RxJS BehaviorSubject for reactive state
- All components subscribe to cart changes
- Automatic UI updates when cart changes

### User Experience
- Visual feedback when adding items to cart
- Empty cart message with continue shopping option
- Order confirmation screen after checkout
- Automatic redirect after successful order

## No Login Required

This application does not require user authentication or login functionality. Users can:
- Browse products immediately
- Add items to cart
- Complete checkout without account creation

## Currency

All prices are displayed in South African Rand (ZAR) with the "R" symbol prefix.

## Development Notes

- Images are loaded from Unsplash for demonstration purposes
- Payment options are for display only - no actual payment processing
- Cart data is stored in memory (not persisted across page refreshes)
- No backend integration - all data is managed client-side

## Future Enhancements (Not Implemented)

- Local storage for cart persistence
- Product search and filtering
- User reviews and ratings
- Order history
- Email notifications
- Real payment gateway integration

---

**Built with Angular 19 and TypeScript**
