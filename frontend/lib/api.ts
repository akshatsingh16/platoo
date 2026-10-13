// ═══════════════════════════════════════════════════════════════════
// Plato — API Client
// Typed functions for every backend endpoint.
// ═══════════════════════════════════════════════════════════════════

import { getToken, logout } from "./auth"
import type {
  ApiResponse,
  AssignEmployeeRequest,
  BillSummaryResponse,
  CategoryWithItemsResponse,
  CompletePaymentRequest,
  CreateCategoryRequest,
  CreateItemRequest,
  CreateRestaurantRequest,
  CreateTableRequest,
  CreateUserRequest,
  CustomerSessionResponse,
  EmployeeResponse,
  LoginRequest,
  LoginResponse,
  MenuItemResponse,
  OrderResponse,
  OrderStatus,
  PageResponse,
  PaymentResponse,
  PaymentStatus,
  PlaceOrderRequest,
  RequestBillRequest,
  RestaurantResponse,
  RestaurantSettingsRequest,
  RestaurantStatus,
  StartSessionRequest,
  TableResponse,
  UpdateCategoryRequest,
  UpdateEmployeeRoleRequest,
  UpdateItemRequest,
  UpdateRestaurantRequest,
  UpdateTableRequest,
  UpdateUserRequest,
  UserResponse,
  UserStatus,
} from "./types"

// ── Base fetch helper ─────────────────────────────────────────────

const BASE = "/api/v1"

async function fetchApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  // Attach JWT if available
  const token = getToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  })

  // 204 No Content — no body to parse
  if (res.status === 204) {
    return undefined as T
  }

  // Handle expired/invalid token — force re-login.
  // 403 (Forbidden) means "wrong role", not "bad token", so we let callers handle it.
  if (res.status === 401 && !path.startsWith("/auth/")) {
    if (typeof window !== "undefined") {
      logout()
      window.location.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}&error=session_expired`)
    }
    throw new Error("Session expired. Please log in again.")
  }

  // Safely parse JSON — backend may return plain text/HTML on error
  let json: ApiResponse<T>
  try {
    json = await res.json()
  } catch {
    throw new Error(
      res.status === 401 || res.status === 403
        ? "Unauthorized access. Please log in again."
        : `Server error (${res.status})`,
    )
  }

  if (!res.ok || !json.success) {
    throw new Error(json.message || `Request failed: ${res.status}`)
  }

  return json.data
}

/** Same as fetchApi but attaches X-Session-Token instead of JWT */
async function fetchCustomerApi<T>(
  path: string,
  sessionToken: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Session-Token": sessionToken,
    ...(options.headers as Record<string, string>),
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  })

  if (res.status === 204) {
    return undefined as T
  }

  let json: ApiResponse<T>
  try {
    json = await res.json()
  } catch {
    throw new Error(
      !res.ok
        ? `Server error (${res.status}). Is the backend running on port 8080?`
        : `Invalid response from server`,
    )
  }

  if (!res.ok || !json.success) {
    throw new Error(json.message || `Request failed: ${res.status}`)
  }

  return json.data
}

// ═══════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════

export async function login(req: LoginRequest): Promise<LoginResponse> {
  return fetchApi<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(req),
  })
}

// ═══════════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════════

export async function getAllUsers(
  page = 0,
  size = 20,
): Promise<PageResponse<UserResponse>> {
  return fetchApi(`/users?page=${page}&size=${size}`)
}

export async function getUserById(id: string): Promise<UserResponse> {
  return fetchApi(`/users/${id}`)
}

export async function createUser(req: CreateUserRequest): Promise<UserResponse> {
  return fetchApi("/users", {
    method: "POST",
    body: JSON.stringify(req),
  })
}

export async function updateUser(
  id: string,
  req: UpdateUserRequest,
): Promise<UserResponse> {
  return fetchApi(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(req),
  })
}

export async function updateUserStatus(
  id: string,
  status: UserStatus,
): Promise<UserResponse> {
  return fetchApi(`/users/${id}/status?value=${status}`, {
    method: "PATCH",
  })
}

export async function deleteUser(id: string): Promise<void> {
  return fetchApi(`/users/${id}`, { method: "DELETE" })
}

// ═══════════════════════════════════════════════════════════════════
// RESTAURANTS
// ═══════════════════════════════════════════════════════════════════

export async function getRestaurants(
  page = 0,
  size = 10,
): Promise<PageResponse<RestaurantResponse>> {
  return fetchApi(`/restaurants?page=${page}&size=${size}`)
}

export async function getRestaurantById(
  id: string,
): Promise<RestaurantResponse> {
  return fetchApi(`/restaurants/${id}`)
}

export async function createRestaurant(
  req: CreateRestaurantRequest,
): Promise<RestaurantResponse> {
  return fetchApi("/restaurants", {
    method: "POST",
    body: JSON.stringify(req),
  })
}

export async function updateRestaurant(
  id: string,
  req: UpdateRestaurantRequest,
): Promise<RestaurantResponse> {
  return fetchApi(`/restaurants/${id}`, {
    method: "PUT",
    body: JSON.stringify(req),
  })
}

export async function updateRestaurantStatus(
  id: string,
  status: RestaurantStatus,
): Promise<RestaurantResponse> {
  return fetchApi(`/restaurants/${id}/status?value=${status}`, {
    method: "PATCH",
  })
}

export async function getRestaurantSettings(
  id: string,
): Promise<RestaurantResponse> {
  return fetchApi(`/restaurants/${id}/settings`)
}

export async function updateRestaurantSettings(
  id: string,
  req: RestaurantSettingsRequest,
): Promise<RestaurantResponse> {
  return fetchApi(`/restaurants/${id}/settings`, {
    method: "PUT",
    body: JSON.stringify(req),
  })
}

// ═══════════════════════════════════════════════════════════════════
// TABLES
// ═══════════════════════════════════════════════════════════════════

export async function getTables(
  restaurantId: string,
): Promise<TableResponse[]> {
  return fetchApi(`/restaurants/${restaurantId}/tables`)
}

export async function getTableById(
  restaurantId: string,
  tableId: string,
): Promise<TableResponse> {
  return fetchApi(`/restaurants/${restaurantId}/tables/${tableId}`)
}

export async function createTable(
  restaurantId: string,
  req: CreateTableRequest,
): Promise<TableResponse> {
  return fetchApi(`/restaurants/${restaurantId}/tables`, {
    method: "POST",
    body: JSON.stringify(req),
  })
}

export async function updateTable(
  restaurantId: string,
  tableId: string,
  req: UpdateTableRequest,
): Promise<TableResponse> {
  return fetchApi(`/restaurants/${restaurantId}/tables/${tableId}`, {
    method: "PUT",
    body: JSON.stringify(req),
  })
}

export async function deleteTable(
  restaurantId: string,
  tableId: string,
): Promise<void> {
  return fetchApi(`/restaurants/${restaurantId}/tables/${tableId}`, {
    method: "DELETE",
  })
}

export async function regenerateQrToken(
  restaurantId: string,
  tableId: string,
): Promise<TableResponse> {
  return fetchApi(
    `/restaurants/${restaurantId}/tables/${tableId}/qr/regenerate`,
    { method: "POST" },
  )
}

// ═══════════════════════════════════════════════════════════════════
// MENU
// ═══════════════════════════════════════════════════════════════════

/** Public — no auth required */
export async function getPublicMenu(
  restaurantId: string,
): Promise<CategoryWithItemsResponse[]> {
  return fetchApi(`/restaurants/${restaurantId}/menu`)
}

export async function getCategories(
  restaurantId: string,
): Promise<CategoryWithItemsResponse[]> {
  return fetchApi(`/restaurants/${restaurantId}/menu/categories`)
}

export async function createCategory(
  restaurantId: string,
  req: CreateCategoryRequest,
): Promise<CategoryWithItemsResponse> {
  return fetchApi(`/restaurants/${restaurantId}/menu/categories`, {
    method: "POST",
    body: JSON.stringify(req),
  })
}

export async function updateCategory(
  restaurantId: string,
  categoryId: string,
  req: UpdateCategoryRequest,
): Promise<CategoryWithItemsResponse> {
  return fetchApi(
    `/restaurants/${restaurantId}/menu/categories/${categoryId}`,
    {
      method: "PUT",
      body: JSON.stringify(req),
    },
  )
}

export async function deleteCategory(
  restaurantId: string,
  categoryId: string,
): Promise<void> {
  return fetchApi(
    `/restaurants/${restaurantId}/menu/categories/${categoryId}`,
    { method: "DELETE" },
  )
}

export async function createMenuItem(
  restaurantId: string,
  req: CreateItemRequest,
): Promise<MenuItemResponse> {
  return fetchApi(`/restaurants/${restaurantId}/menu/items`, {
    method: "POST",
    body: JSON.stringify(req),
  })
}

export async function updateMenuItem(
  restaurantId: string,
  itemId: string,
  req: UpdateItemRequest,
): Promise<MenuItemResponse> {
  return fetchApi(`/restaurants/${restaurantId}/menu/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify(req),
  })
}

export async function toggleMenuItemAvailability(
  restaurantId: string,
  itemId: string,
): Promise<MenuItemResponse> {
  return fetchApi(
    `/restaurants/${restaurantId}/menu/items/${itemId}/availability`,
    { method: "PATCH" },
  )
}

export async function deleteMenuItem(
  restaurantId: string,
  itemId: string,
): Promise<void> {
  return fetchApi(`/restaurants/${restaurantId}/menu/items/${itemId}`, {
    method: "DELETE",
  })
}

// ═══════════════════════════════════════════════════════════════════
// ORDERS — Staff
// ═══════════════════════════════════════════════════════════════════

export async function getRestaurantOrders(
  restaurantId: string,
  status?: OrderStatus,
): Promise<OrderResponse[]> {
  const qs = status ? `?status=${status}` : ""
  return fetchApi(`/restaurants/${restaurantId}/orders${qs}`)
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<OrderResponse> {
  return fetchApi(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
}

// ═══════════════════════════════════════════════════════════════════
// ORDERS — Customer
// ═══════════════════════════════════════════════════════════════════

export async function placeOrder(
  sessionToken: string,
  req: PlaceOrderRequest,
): Promise<OrderResponse> {
  return fetchCustomerApi("/customer/orders", sessionToken, {
    method: "POST",
    body: JSON.stringify(req),
  })
}

export async function getSessionOrders(
  sessionToken: string,
): Promise<OrderResponse[]> {
  return fetchCustomerApi("/customer/orders", sessionToken)
}

export async function getSessionOrderById(
  sessionToken: string,
  orderId: string,
): Promise<OrderResponse> {
  return fetchCustomerApi(`/customer/orders/${orderId}`, sessionToken)
}

export async function cancelOrder(
  sessionToken: string,
  orderId: string,
): Promise<OrderResponse> {
  return fetchCustomerApi(
    `/customer/orders/${orderId}/cancel`,
    sessionToken,
    { method: "PATCH" },
  )
}

export async function removeOrderItem(
  sessionToken: string,
  orderId: string,
  itemId: string,
): Promise<OrderResponse> {
  return fetchCustomerApi(
    `/customer/orders/${orderId}/items/${itemId}`,
    sessionToken,
    { method: "DELETE" },
  )
}

// ═══════════════════════════════════════════════════════════════════
// SESSIONS
// ═══════════════════════════════════════════════════════════════════

export async function startSession(
  req: StartSessionRequest,
): Promise<CustomerSessionResponse> {
  return fetchApi("/customer/sessions/start", {
    method: "POST",
    body: JSON.stringify(req),
  })
}

export async function getCurrentSession(
  sessionToken: string,
): Promise<CustomerSessionResponse> {
  return fetchCustomerApi("/customer/sessions/current", sessionToken)
}

export async function closeSession(
  restaurantId: string,
  sessionId: string,
): Promise<void> {
  return fetchApi(
    `/restaurants/${restaurantId}/sessions/${sessionId}/close`,
    { method: "POST" },
  )
}

// ═══════════════════════════════════════════════════════════════════
// BILLING — Customer
// ═══════════════════════════════════════════════════════════════════

export async function getBillSummary(
  sessionToken: string,
): Promise<BillSummaryResponse> {
  return fetchCustomerApi("/customer/billing/summary", sessionToken)
}

export async function requestBill(
  sessionToken: string,
  req: RequestBillRequest,
): Promise<PaymentResponse> {
  return fetchCustomerApi("/customer/billing/request-bill", sessionToken, {
    method: "POST",
    body: JSON.stringify(req),
  })
}

export async function getSessionPayment(
  sessionToken: string,
): Promise<PaymentResponse> {
  return fetchCustomerApi("/customer/billing/payment", sessionToken)
}

// ═══════════════════════════════════════════════════════════════════
// BILLING — Staff
// ═══════════════════════════════════════════════════════════════════

export async function getRestaurantPayments(
  restaurantId: string,
  status?: PaymentStatus,
): Promise<PaymentResponse[]> {
  const qs = status ? `?status=${status}` : ""
  return fetchApi(`/restaurants/${restaurantId}/payments${qs}`)
}

export async function getPaymentById(
  restaurantId: string,
  paymentId: string,
): Promise<PaymentResponse> {
  return fetchApi(`/restaurants/${restaurantId}/payments/${paymentId}`)
}

export async function completePayment(
  restaurantId: string,
  paymentId: string,
  req?: CompletePaymentRequest,
): Promise<PaymentResponse> {
  return fetchApi(
    `/restaurants/${restaurantId}/payments/${paymentId}/complete`,
    {
      method: "POST",
      body: req ? JSON.stringify(req) : undefined,
    },
  )
}

// ═══════════════════════════════════════════════════════════════════
// EMPLOYEES
// ═══════════════════════════════════════════════════════════════════

export async function getEmployees(
  restaurantId: string,
): Promise<EmployeeResponse[]> {
  return fetchApi(`/restaurants/${restaurantId}/employees`)
}

export async function assignEmployee(
  restaurantId: string,
  req: AssignEmployeeRequest,
): Promise<EmployeeResponse> {
  return fetchApi(`/restaurants/${restaurantId}/employees`, {
    method: "POST",
    body: JSON.stringify(req),
  })
}

export async function updateEmployeeRole(
  restaurantId: string,
  employeeId: string,
  req: UpdateEmployeeRoleRequest,
): Promise<EmployeeResponse> {
  return fetchApi(
    `/restaurants/${restaurantId}/employees/${employeeId}/role`,
    {
      method: "PATCH",
      body: JSON.stringify(req),
    },
  )
}

export async function deactivateEmployee(
  restaurantId: string,
  employeeId: string,
): Promise<void> {
  return fetchApi(`/restaurants/${restaurantId}/employees/${employeeId}`, {
    method: "DELETE",
  })
}
