import {
  MOCK_USER,
  MOCK_ADMIN_USER,
  MOCK_STAFF_USER,
  MOCK_CATEGORIES,
  MOCK_UOMS,
  MOCK_WAREHOUSES,
  MOCK_LOCATIONS,
  MOCK_PRODUCTS,
  MOCK_SUPPLIERS,
  MOCK_DASHBOARD,
  MOCK_RECEIPTS,
  MOCK_TRANSFERS,
  MOCK_MANUFACTURING_ORDERS,
  MOCK_BOMS,
  MOCK_PURCHASE_ORDERS,
  MOCK_QC_CHECKS,
  MOCK_QC_ISSUES,
  MOCK_WORK_ORDERS,
  MOCK_ASSETS,
  MOCK_ECOS,
  MOCK_RFQS,
  MOCK_REQUISITIONS,
  MOCK_CARRIERS,
  MOCK_SHIPMENTS,
  MOCK_LOTS,
  MOCK_SERIALS,
  MOCK_RETURNS,
  MOCK_SCRAPS
} from './mockData.js';

const API_BASE = '/api';

// Live in-memory reactive state for demo mutations
let runtimeReceipts = [...MOCK_RECEIPTS];
let runtimeTransfers = [...MOCK_TRANSFERS];
let runtimeProducts = [...MOCK_PRODUCTS];

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('flowstock_token') || 'demo-token';
  const method = (options.method || 'GET').toUpperCase();

  // Try real backend first if accessible
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 800);

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);

    if (response && response.ok) {
      const data = await response.json().catch(() => null);
      if (data) return data as T;
    }
  } catch (e) {
    // Fall through to client-side demo mock data engine
  }

  // Robust Client-Side Demo Mock Data Engine
  const cleanUrl = endpoint.split('?')[0];

  // Auth routes
  if (cleanUrl.includes('/auth/login')) {
    let email = '';
    try {
      if (options.body) {
        const bodyObj = JSON.parse(options.body as string);
        email = (bodyObj.email || '').toLowerCase();
      }
    } catch (e) {}

    const isUserRole = email.includes('user') || email.includes('operator') || email.includes('staff');
    const selectedUser = isUserRole ? MOCK_STAFF_USER : MOCK_ADMIN_USER;
    const assignedToken = isUserRole ? 'demo-user-jwt' : 'demo-admin-jwt';

    return { user: selectedUser, token: assignedToken } as unknown as T;
  }

  if (cleanUrl.includes('/auth/me')) {
    const isUserToken = token.includes('user') || token.includes('operator');
    return { user: isUserToken ? MOCK_STAFF_USER : MOCK_ADMIN_USER, token } as unknown as T;
  }

  if (cleanUrl.includes('/auth/switch-role')) {
    let requestedRole = 'SYSTEM_ADMIN';
    try {
      if (options.body) {
        const bodyObj = JSON.parse(options.body as string);
        requestedRole = bodyObj.role || 'SYSTEM_ADMIN';
      }
    } catch (e) {}

    const updatedUser = {
      ...(requestedRole === 'WAREHOUSE_OPERATOR' ? MOCK_STAFF_USER : MOCK_ADMIN_USER),
      role: requestedRole,
    };
    return { user: updatedUser, token: `demo-${requestedRole.toLowerCase()}-jwt` } as unknown as T;
  }

  // Dashboard summary
  if (cleanUrl.includes('/dashboard/summary') || cleanUrl === '/dashboard') {
    return MOCK_DASHBOARD as unknown as T;
  }

  // Valuation
  if (cleanUrl.includes('/inventory/valuation')) {
    return {
      totalValuation: 4825000,
      itemsCount: runtimeProducts.length,
      valuationMethod: 'FIFO',
      currency: 'INR',
      byCategory: [
        { category: 'Raw Materials', value: 1850000 },
        { category: 'Electronics & Components', value: 1620000 },
        { category: 'Finished Goods', value: 980000 },
        { category: 'Packaging', value: 245000 },
        { category: 'Maintenance & Spares', value: 130000 }
      ]
    } as unknown as T;
  }

  // Product categories & UOMs (MUST be handled BEFORE generic /products/:id)
  if (cleanUrl === '/products/categories' || cleanUrl.endsWith('/categories')) {
    return { categories: MOCK_CATEGORIES } as unknown as T;
  }
  if (cleanUrl === '/products/uoms' || cleanUrl.endsWith('/uoms')) {
    return { uoms: MOCK_UOMS } as unknown as T;
  }

  // Barcode search
  if (cleanUrl.includes('/products/barcode/')) {
    const code = cleanUrl.split('/products/barcode/')[1];
    const product = runtimeProducts.find((p) => p.barcode === code) || runtimeProducts[0];
    return { product } as unknown as T;
  }

  // Product by ID vs Products list
  if (cleanUrl.startsWith('/products/')) {
    const id = cleanUrl.replace('/products/', '');
    const product = runtimeProducts.find((p) => p.id === id) || runtimeProducts[0];
    return { product } as unknown as T;
  }
  if (cleanUrl === '/products') {
    return {
      products: runtimeProducts,
      total: runtimeProducts.length,
      pagination: { totalPages: 1, total: runtimeProducts.length, page: 1 }
    } as unknown as T;
  }

  // Warehouses & Locations
  if (cleanUrl.includes('/locations')) {
    return { locations: MOCK_LOCATIONS } as unknown as T;
  }
  if (cleanUrl === '/warehouses' || cleanUrl.startsWith('/warehouses')) {
    if (cleanUrl.includes('/locations')) {
      return { locations: MOCK_LOCATIONS } as unknown as T;
    }
    return { warehouses: MOCK_WAREHOUSES } as unknown as T;
  }

  // Suppliers & Vendors
  if (cleanUrl.includes('/suppliers') || cleanUrl.includes('/vendors')) {
    return { suppliers: MOCK_SUPPLIERS, vendors: MOCK_SUPPLIERS } as unknown as T;
  }

  // Receipts
  if (cleanUrl.includes('/receipts')) {
    if (cleanUrl.includes('/validate') && method === 'POST') {
      const parts = cleanUrl.split('/');
      const id = parts[2];
      const r = runtimeReceipts.find((x) => x.id === id);
      if (r) r.status = 'VALIDATED';
      return { success: true, receipt: r } as unknown as T;
    }
    return { receipts: runtimeReceipts } as unknown as T;
  }

  // Deliveries / Dispatch
  if (cleanUrl.includes('/deliveries') || cleanUrl.includes('/dispatch')) {
    return {
      deliveries: [
        { id: 'del-01', deliveryNumber: 'OUT-2026-091', customer: 'Tata Motors Assembly Plant', date: '2026-10-19', status: 'SHIPPED', itemsCount: 4, carrier: 'BlueDart Express' },
        { id: 'del-02', deliveryNumber: 'OUT-2026-092', customer: 'L&T Heavy Engineering', date: '2026-10-18', status: 'DELIVERED', itemsCount: 2, carrier: 'Safexpress' }
      ]
    } as unknown as T;
  }

  // Transfers
  if (cleanUrl.includes('/transfers')) {
    return { transfers: runtimeTransfers } as unknown as T;
  }

  // Manufacturing / Production / BOMs
  if (cleanUrl.includes('/boms') || cleanUrl.includes('/manufacturing/boms')) {
    return { boms: MOCK_BOMS } as unknown as T;
  }
  if (cleanUrl.includes('/manufacturing') || cleanUrl.includes('/production')) {
    return { orders: MOCK_MANUFACTURING_ORDERS, manufacturingOrders: MOCK_MANUFACTURING_ORDERS, boms: MOCK_BOMS } as unknown as T;
  }

  // Quality & Inspection
  if (cleanUrl.includes('/quality/checks') || cleanUrl.includes('/quality/inspections')) {
    return { checks: MOCK_QC_CHECKS } as unknown as T;
  }
  if (cleanUrl.includes('/quality/issues')) {
    return { issues: MOCK_QC_ISSUES } as unknown as T;
  }
  if (cleanUrl.includes('/quality')) {
    return {
      checklists: MOCK_QC_CHECKS,
      checks: MOCK_QC_CHECKS,
      issues: MOCK_QC_ISSUES
    } as unknown as T;
  }

  // Maintenance & Assets
  if (cleanUrl.includes('/maintenance/assets')) {
    return { assets: MOCK_ASSETS } as unknown as T;
  }
  if (cleanUrl.includes('/maintenance/work-orders') || cleanUrl.includes('/maintenance')) {
    return { workOrders: MOCK_WORK_ORDERS, tickets: MOCK_WORK_ORDERS, assets: MOCK_ASSETS } as unknown as T;
  }

  // PLM (Product Lifecycle Management)
  if (cleanUrl.includes('/plm')) {
    return { ecos: MOCK_ECOS } as unknown as T;
  }

  // Replenishment & Purchasing
  if (cleanUrl.includes('/replenishment/recommendations')) {
    return {
      recommendations: [
        { id: 'rec-1', product: 'STM32 Arm Cortex IC', suggestedQty: 1500, estimatedCost: 630000, urgency: 'HIGH' },
        { id: 'rec-2', product: 'High-Grade Structural Steel Rod 10mm', suggestedQty: 400, estimatedCost: 340000, urgency: 'MEDIUM' }
      ]
    } as unknown as T;
  }
  if (cleanUrl.includes('/replenishment/generate-po')) {
    return { purchaseOrder: MOCK_PURCHASE_ORDERS[0] } as unknown as T;
  }
  if (cleanUrl.includes('/purchase-orders') || cleanUrl.includes('/vendor-portal/pos')) {
    return { purchaseOrders: MOCK_PURCHASE_ORDERS } as unknown as T;
  }

  // RFQ
  if (cleanUrl.includes('/rfq')) {
    if (cleanUrl.includes('/award')) {
      return { purchaseOrder: MOCK_PURCHASE_ORDERS[0], quote: {} } as unknown as T;
    }
    return { rfqs: MOCK_RFQS } as unknown as T;
  }

  // Procurement Requisitions
  if (cleanUrl.includes('/procurement/requisitions') || cleanUrl.includes('/requisitions')) {
    return { requisitions: MOCK_REQUISITIONS } as unknown as T;
  }

  // Logistics & Carriers
  if (cleanUrl.includes('/logistics/carriers') || cleanUrl.includes('/carriers')) {
    return { carriers: MOCK_CARRIERS } as unknown as T;
  }
  if (cleanUrl.includes('/logistics/shipments') || cleanUrl.includes('/shipments')) {
    return { shipments: MOCK_SHIPMENTS } as unknown as T;
  }

  // Traceability & Serial / Lot tracking
  if (cleanUrl.includes('/traceability/lots') || cleanUrl.includes('/lots')) {
    return { lots: MOCK_LOTS } as unknown as T;
  }
  if (cleanUrl.includes('/traceability/serials') || cleanUrl.includes('/serials')) {
    return { serials: MOCK_SERIALS } as unknown as T;
  }
  if (cleanUrl.includes('/traceability')) {
    return { lots: MOCK_LOTS, serials: MOCK_SERIALS, results: [...MOCK_LOTS, ...MOCK_SERIALS] } as unknown as T;
  }

  // Returns & Scrap
  if (cleanUrl.includes('/returns/scrap') || cleanUrl.includes('/scrap')) {
    return { scraps: MOCK_SCRAPS } as unknown as T;
  }
  if (cleanUrl.includes('/returns')) {
    return { returns: MOCK_RETURNS } as unknown as T;
  }

  // Vendor Portal
  if (cleanUrl.includes('/vendor-portal/profile')) {
    return { supplier: MOCK_SUPPLIERS[0] } as unknown as T;
  }
  if (cleanUrl.includes('/vendor-portal/shipments/asn')) {
    return { shipment: MOCK_SHIPMENTS[0] } as unknown as T;
  }

  // Default fallback object to prevent undefined crashes
  return {
    success: true,
    data: [],
    products: runtimeProducts,
    categories: MOCK_CATEGORIES,
    uoms: MOCK_UOMS,
    warehouses: MOCK_WAREHOUSES,
    locations: MOCK_LOCATIONS,
    suppliers: MOCK_SUPPLIERS,
    receipts: runtimeReceipts,
    transfers: runtimeTransfers,
    orders: MOCK_MANUFACTURING_ORDERS,
    boms: MOCK_BOMS,
    checks: MOCK_QC_CHECKS,
    issues: MOCK_QC_ISSUES,
    workOrders: MOCK_WORK_ORDERS,
    assets: MOCK_ASSETS,
    ecos: MOCK_ECOS,
    rfqs: MOCK_RFQS,
    requisitions: MOCK_REQUISITIONS,
    carriers: MOCK_CARRIERS,
    shipments: MOCK_SHIPMENTS,
    lots: MOCK_LOTS,
    serials: MOCK_SERIALS,
    returns: MOCK_RETURNS,
    scraps: MOCK_SCRAPS
  } as unknown as T;
}
