export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  subtotal: number;
  tax: number;
  shippingCost: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  shippingAddress: ShippingAddress;
  billingAddress: BillingAddress;
  orderDate: Date;
  updatedAt: Date;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  trackingNumber?: string;
  notes?: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productImage?: string;
  specifications?: Record<string, any>;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface BillingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
  REFUNDED = 'refunded'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

// Request/Response Types
export interface CreateOrderRequest {
  items: CreateOrderItemRequest[];
  shippingAddress: ShippingAddress;
  billingAddress: BillingAddress;
  paymentMethod: string;
  notes?: string;
}

export interface CreateOrderItemRequest {
  productId: string;
  quantity: number;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  trackingNumber?: string;
  notes?: string;
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  sortBy?: 'order_date' | 'totalAmount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  orderDate: Date;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  trackingNumber?: string;
  itemCount: number;
  items: OrderItemResponse[];
}

export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productImage?: string;
}

export interface OrderHistoryResponse {
  orders: OrderResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  statistics: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    statusBreakdown: Record<OrderStatus, number>;
  };
}

export interface OrderDetailsResponse extends OrderResponse {
  subtotal: number;
  tax: number;
  shippingCost: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  shippingAddress: ShippingAddress;
  billingAddress: BillingAddress;
  updatedAt: Date;
  notes?: string;
}

// JWT Payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}