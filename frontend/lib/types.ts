// ═══════════════════════════════════════════════════════════════════
// Plato — TypeScript types mirroring all backend DTOs and enums
// ═══════════════════════════════════════════════════════════════════

// ── Enums ─────────────────────────────────────────────────────────

export type UserRole = "SUPER_ADMIN" | "OWNER" | "EMPLOYEE"
export type UserStatus = "ACTIVE" | "SUSPENDED" | "DELETED"
export type RestaurantStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED"
export type TableStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE"
export type SessionStatus = "ACTIVE" | "CLOSED" | "EXPIRED"
export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "SERVED"
  | "CANCELLED"
export type OrderItemStatus =
  | "PENDING"
  | "PREPARING"
  | "READY"
  | "SERVED"
  | "CANCELLED"
export type PaymentMethod = "CASH" | "CARD" | "UPI" | "ONLINE"
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED"
export type EmployeeRole = "MANAGER" | "CHEF" | "WAITER" | "CASHIER"

// ── API Response Envelope ─────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

// ── Auth ──────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  role: string
  fullName: string
}

// ── User ──────────────────────────────────────────────────────────

export interface UserResponse {
  id: string
  fullName: string
  email: string
  phone: string | null
  role: UserRole
  status: UserStatus
  lastLogin: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  fullName: string
  email: string
  password: string
  phone?: string
  role: UserRole
}

export interface UpdateUserRequest {
  fullName?: string
  email?: string
  phone?: string
}

// ── Restaurant ────────────────────────────────────────────────────

export interface RestaurantResponse {
  id: string
  ownerId: string
  name: string
  description: string | null
  logoUrl: string | null
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  zipcode: string | null
  timezone: string | null
  openingTime: string | null
  closingTime: string | null
  status: RestaurantStatus
  // Settings
  taxPercentage: number
  serviceCharge: number
  allowCashPayment: boolean
  allowCardPayment: boolean
  allowUpi: boolean
  allowOnlinePayment: boolean
  acceptingOrders: boolean
  autoAcceptOrders: boolean
  // Audit
  createdAt: string
  updatedAt: string
}

export interface CreateRestaurantRequest {
  name: string
  description?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  country?: string
  zipcode?: string
  timezone?: string
  openingTime?: string
  closingTime?: string
  taxPercentage?: number
  serviceCharge?: number
  allowCashPayment?: boolean
  allowCardPayment?: boolean
  allowUpi?: boolean
  allowOnlinePayment?: boolean
  acceptingOrders?: boolean
  autoAcceptOrders?: boolean
}

export interface UpdateRestaurantRequest {
  name?: string
  description?: string
  phone?: string
  email?: string
  address?: string
  city?: string
  state?: string
  country?: string
  zipcode?: string
  timezone?: string
  openingTime?: string
  closingTime?: string
}

export interface RestaurantSettingsRequest {
  taxPercentage?: number
  serviceCharge?: number
  allowCashPayment?: boolean
  allowCardPayment?: boolean
  allowUpi?: boolean
  allowOnlinePayment?: boolean
  acceptingOrders?: boolean
  autoAcceptOrders?: boolean
}

// ── Table ─────────────────────────────────────────────────────────

export interface TableResponse {
  id: string
  restaurantId: string
  tableNumber: string
  capacity: number
  label: string | null
  qrToken: string
  status: TableStatus
  createdAt: string
  updatedAt: string
}

export interface CreateTableRequest {
  tableNumber: string
  capacity: number
  label?: string
}

export interface UpdateTableRequest {
  tableNumber?: string
  capacity?: number
  label?: string
  status?: TableStatus
}

// ── Menu ──────────────────────────────────────────────────────────

export interface MenuItemResponse {
  id: string
  categoryId: string
  restaurantId: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  isAvailable: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

export interface CategoryWithItemsResponse {
  id: string
  restaurantId: string
  name: string
  description: string | null
  displayOrder: number
  isActive: boolean
  items: MenuItemResponse[]
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryRequest {
  name: string
  description?: string
  displayOrder?: number
}

export interface UpdateCategoryRequest {
  name?: string
  description?: string
  displayOrder?: number
  isActive?: boolean
}

export interface CreateItemRequest {
  categoryId: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  displayOrder?: number
}

export interface UpdateItemRequest {
  categoryId?: string
  name?: string
  description?: string
  price?: number
  imageUrl?: string
  displayOrder?: number
}

// ── Order ─────────────────────────────────────────────────────────

export interface OrderItemResponse {
  id: string
  menuItemId: string
  menuItemName: string
  quantity: number
  unitPrice: number
  subtotal: number
  specialRequest: string | null
  status: OrderItemStatus
}

export interface OrderResponse {
  id: string
  restaurantId: string
  tableId: string
  tableNumber: string
  sessionId: string
  orderNumber: string
  status: OrderStatus
  subtotal: number
  tax: number
  discount: number
  grandTotal: number
  notes: string | null
  placedAt: string
  completedAt: string | null
  items: OrderItemResponse[]
}

export interface OrderItemRequest {
  menuItemId: string
  quantity: number
  specialRequest?: string
}

export interface PlaceOrderRequest {
  items: OrderItemRequest[]
  notes?: string
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus
}

// ── Session ───────────────────────────────────────────────────────

export interface CustomerSessionResponse {
  id: string
  restaurantId: string
  restaurantName: string
  tableId: string
  tableNumber: string
  sessionToken: string
  status: SessionStatus
  guestCount: number
  startedAt: string
  expiresAt: string
}

export interface StartSessionRequest {
  qrToken: string
  guestCount: number
}

// ── Billing ───────────────────────────────────────────────────────

export interface BillSummaryResponse {
  sessionId: string
  restaurantId: string
  restaurantName: string
  tableId: string
  tableNumber: string
  orders: OrderResponse[]
  ordersSubtotal: number
  taxTotal: number
  serviceChargePercentage: number
  serviceChargeAmount: number
  discount: number
  grandTotal: number
  hasPendingOrders: boolean
}

export interface PaymentResponse {
  id: string
  sessionId: string
  restaurantId: string
  tableNumber: string
  subtotal: number
  tax: number
  serviceCharge: number
  discount: number
  amount: number
  paymentMethod: PaymentMethod
  status: PaymentStatus
  transactionReference: string | null
  paidAt: string | null
  createdAt: string
}

export interface RequestBillRequest {
  paymentMethod: PaymentMethod
  notes?: string
}

export interface CompletePaymentRequest {
  transactionReference?: string
}

// ── Employee ──────────────────────────────────────────────────────

export interface EmployeeResponse {
  id: string
  userId: string
  restaurantId: string
  role: EmployeeRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AssignEmployeeRequest {
  userId: string
  role: EmployeeRole
}

export interface UpdateEmployeeRoleRequest {
  role: EmployeeRole
}

// ── Paginated Response ────────────────────────────────────────────

export interface PageResponse<T> {
  content: T[]
  totalPages: number
  totalElements: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}
