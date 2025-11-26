export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  unit: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
