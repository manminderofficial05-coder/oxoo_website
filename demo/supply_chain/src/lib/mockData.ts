// Complete Enterprise Mock Data for Oxoo Supply Chain & FlowStock 360 Platform

export const MOCK_ADMIN_USER = {
  id: 'usr-admin-01',
  email: 'admin@flowstock.io',
  firstName: 'Supply Chain',
  lastName: 'Director (Admin)',
  role: 'SYSTEM_ADMIN',
  department: 'Global Supply Chain Governance',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
};

export const MOCK_STAFF_USER = {
  id: 'usr-operator-02',
  email: 'user@flowstock.io',
  firstName: 'Rahul',
  lastName: 'Sharma (Operator)',
  role: 'WAREHOUSE_OPERATOR',
  department: 'Warehouse Operations & Inventory',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
};

export const MOCK_USER = MOCK_ADMIN_USER;

export const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'Raw Materials', description: 'Metals, polymers, and base bulk goods' },
  { id: 'cat-2', name: 'Electronics & Components', description: 'ICs, semiconductors, and modules' },
  { id: 'cat-3', name: 'Finished Goods', description: 'Assembled devices ready for market' },
  { id: 'cat-4', name: 'Packaging Materials', description: 'Cartons, crates, and protective foam' },
  { id: 'cat-5', name: 'Maintenance & Spares', description: 'Replacement tooling and oils' }
];

export const MOCK_UOMS = [
  { id: 'uom-1', name: 'Units', symbol: 'Pcs' },
  { id: 'uom-2', name: 'Kilograms', symbol: 'kg' },
  { id: 'uom-3', name: 'Tons', symbol: 'MT' },
  { id: 'uom-4', name: 'Bags', symbol: 'Bags' },
  { id: 'uom-5', name: 'Boxes', symbol: 'Bx' }
];

export const MOCK_WAREHOUSES = [
  {
    id: 'wh-1',
    code: 'WH-CENTRAL',
    name: 'Central Distribution Hub (Navi Mumbai)',
    locationCount: 140,
    productCount: 820,
    totalStockValue: 2450000,
    capacityUsed: 78,
    manager: 'Siddharth Rao',
    address: 'Plot 44, MIDC Industrial Area, Taloja, Navi Mumbai'
  },
  {
    id: 'wh-2',
    code: 'WH-NORTH',
    name: 'North Logistics Depot (Gurugram)',
    locationCount: 85,
    productCount: 410,
    totalStockValue: 1350000,
    capacityUsed: 64,
    manager: 'Pooja Verma',
    address: 'Sector 37, Pace City II, Gurugram, Haryana'
  },
  {
    id: 'wh-3',
    code: 'WH-WEST',
    name: 'West Fulfillment Facility (Bengaluru)',
    locationCount: 65,
    productCount: 290,
    totalStockValue: 1025000,
    capacityUsed: 82,
    manager: 'Karthik Menon',
    address: 'Electronic City Phase 2, Hosur Road, Bengaluru'
  }
];

export const MOCK_LOCATIONS = [
  { id: 'loc-1', code: 'A1-R1-B1', name: 'Aisle 1, Rack 1, Bin 1', zone: 'Zone A - High Velocity', capacityPercentage: 74, warehouseId: 'wh-1' },
  { id: 'loc-2', code: 'A1-R1-B2', name: 'Aisle 1, Rack 1, Bin 2', zone: 'Zone A - High Velocity', capacityPercentage: 52, warehouseId: 'wh-1' },
  { id: 'loc-3', code: 'A2-R3-B4', name: 'Aisle 2, Rack 3, Bin 4', zone: 'Zone B - Heavy Pallet', capacityPercentage: 88, warehouseId: 'wh-1' },
  { id: 'loc-4', code: 'B1-R2-B1', name: 'Aisle B, Cold Unit 1', zone: 'Zone C - Temperature Controlled', capacityPercentage: 42, warehouseId: 'wh-1' },
  { id: 'loc-5', code: 'C3-R4-B2', name: 'Aisle C, Quarantine Bay', zone: 'Zone Q - Incoming Inspection', capacityPercentage: 20, warehouseId: 'wh-1' }
];

export const MOCK_PRODUCTS = [
  {
    id: 'prod-01',
    sku: 'RM-STL-10MM',
    name: 'High-Grade Structural Steel Rod 10mm',
    barcode: '8901000000011',
    category: { id: 'cat-1', name: 'Raw Materials' },
    categoryId: 'cat-1',
    uom: { id: 'uom-3', name: 'Tons', symbol: 'MT' },
    uomId: 'uom-3',
    type: 'STOCKABLE',
    costPrice: 58000,
    salesPrice: 72000,
    onHandQty: 85,
    totalStock: 85,
    minStock: 25,
    maxStock: 200,
    warehouse: 'Central Distribution Hub',
    status: 'IN_STOCK'
  },
  {
    id: 'prod-02',
    sku: 'CP-MCU-ARM4',
    name: 'STM32 Arm Cortex-M4 Microcontroller IC',
    barcode: '8901000000028',
    category: { id: 'cat-2', name: 'Electronics & Components' },
    categoryId: 'cat-2',
    uom: { id: 'uom-1', name: 'Units', symbol: 'Pcs' },
    uomId: 'uom-1',
    type: 'STOCKABLE',
    costPrice: 420,
    salesPrice: 680,
    onHandQty: 3400,
    totalStock: 3400,
    minStock: 1000,
    maxStock: 8000,
    warehouse: 'West Fulfillment Facility',
    status: 'IN_STOCK'
  },
  {
    id: 'prod-03',
    sku: 'PK-CORR-L50',
    name: 'Heavy Duty 5-Ply Corrugated Master Box (L)',
    barcode: '8901000000035',
    category: { id: 'cat-4', name: 'Packaging Materials' },
    categoryId: 'cat-4',
    uom: { id: 'uom-5', name: 'Boxes', symbol: 'Bx' },
    uomId: 'uom-5',
    type: 'STOCKABLE',
    costPrice: 48,
    salesPrice: 75,
    onHandQty: 180,
    totalStock: 180,
    minStock: 500,
    maxStock: 2500,
    warehouse: 'North Logistics Depot',
    status: 'LOW_STOCK'
  },
  {
    id: 'prod-04',
    sku: 'FG-SMART-IV',
    name: 'Oxoo Industrial IoT Gateway Controller v3',
    barcode: '8901000000042',
    category: { id: 'cat-3', name: 'Finished Goods' },
    categoryId: 'cat-3',
    uom: { id: 'uom-1', name: 'Units', symbol: 'Pcs' },
    uomId: 'uom-1',
    type: 'STOCKABLE',
    costPrice: 8500,
    salesPrice: 16500,
    onHandQty: 310,
    totalStock: 310,
    minStock: 50,
    maxStock: 1000,
    warehouse: 'Central Distribution Hub',
    status: 'IN_STOCK'
  },
  {
    id: 'prod-05',
    sku: 'RM-POLY-G2',
    name: 'Polypropylene Injection Molding Granules',
    barcode: '8901000000059',
    category: { id: 'cat-1', name: 'Raw Materials' },
    categoryId: 'cat-1',
    uom: { id: 'uom-4', name: 'Bags', symbol: 'Bags' },
    uomId: 'uom-4',
    type: 'STOCKABLE',
    costPrice: 2200,
    salesPrice: 2950,
    onHandQty: 640,
    totalStock: 640,
    minStock: 150,
    maxStock: 1500,
    warehouse: 'Central Distribution Hub',
    status: 'IN_STOCK'
  },
  {
    id: 'prod-06',
    sku: 'CP-SENS-OPT',
    name: 'Optical Laser Distance Sensor Module 40m',
    barcode: '8901000000066',
    category: { id: 'cat-2', name: 'Electronics & Components' },
    categoryId: 'cat-2',
    uom: { id: 'uom-1', name: 'Units', symbol: 'Pcs' },
    uomId: 'uom-1',
    type: 'STOCKABLE',
    costPrice: 1850,
    salesPrice: 2800,
    onHandQty: 48,
    totalStock: 48,
    minStock: 100,
    maxStock: 500,
    warehouse: 'West Fulfillment Facility',
    status: 'LOW_STOCK'
  }
];

export const MOCK_SUPPLIERS = [
  {
    id: 'sup-01',
    code: 'VEND-APEX',
    name: 'Apex Industrial Materials Corp',
    contactPerson: 'Vikram Singhania',
    email: 'procurement@apexmaterials.com',
    phone: '+91 98200 45123',
    category: 'Metals & Metallurgy',
    rating: 4.8,
    leadTimeDays: 7,
    activeOrders: 4,
    status: 'ACTIVE'
  },
  {
    id: 'sup-02',
    code: 'VEND-BLUE',
    name: 'BlueSky Semiconductor Global Pte',
    contactPerson: 'David Chen',
    email: 'orders@bluesky-semi.sg',
    phone: '+65 6789 0123',
    category: 'Electronics & Microchips',
    rating: 4.9,
    leadTimeDays: 14,
    activeOrders: 2,
    status: 'ACTIVE'
  },
  {
    id: 'sup-03',
    code: 'VEND-ECO',
    name: 'GreenPack Eco Solutions Pvt Ltd',
    contactPerson: 'Ananya Deshmukh',
    email: 'sales@greenpackeco.in',
    phone: '+91 94480 77192',
    category: 'Sustainable Packaging',
    rating: 4.6,
    leadTimeDays: 4,
    activeOrders: 1,
    status: 'ACTIVE'
  }
];

export const MOCK_DASHBOARD = {
  kpis: {
    totalStockValue: 4825000,
    totalProducts: 1420,
    activePurchaseOrders: 28,
    pendingReceipts: 7,
    openManufacturingOrders: 14,
    lowStockItems: 9,
    inventoryAccuracy: 99.4,
    fillRate: 98.2,
    avgTurnoverDays: 18.5,
    onTimeDelivery: 96.8
  },
  charts: {
    stockMovement: [
      { date: 'Oct 01', inbound: 180, outbound: 140 },
      { date: 'Oct 04', inbound: 240, outbound: 195 },
      { date: 'Oct 08', inbound: 310, outbound: 280 },
      { date: 'Oct 12', inbound: 210, outbound: 260 },
      { date: 'Oct 16', inbound: 390, outbound: 310 },
      { date: 'Oct 19', inbound: 420, outbound: 350 }
    ],
    categoryDistribution: [
      { name: 'Raw Materials', value: 45 },
      { name: 'Finished Goods', value: 30 },
      { name: 'Electronics & Components', value: 15 },
      { name: 'Packaging', value: 10 }
    ],
    warehouseDistribution: [
      { name: 'Central Hub', value: 52 },
      { name: 'North Logistics', value: 28 },
      { name: 'West Facility', value: 20 }
    ],
    poStatus: [
      { name: 'Draft', count: 6 },
      { name: 'Approved', count: 12 },
      { name: 'In Transit', count: 8 },
      { name: 'Received', count: 24 }
    ],
    moStatus: [
      { name: 'Scheduled', count: 5 },
      { name: 'In Production', count: 9 },
      { name: 'Quality Check', count: 3 },
      { name: 'Completed', count: 18 }
    ]
  },
  operational: {
    lowStockAlerts: [
      { id: 'p1', sku: 'RM-STL-10MM', name: 'High-Grade Structural Steel Rod 10mm', currentStock: 14, minStock: 50, unit: 'Tons', warehouse: 'Central Distribution Hub' },
      { id: 'p2', sku: 'CP-MCU-ARM4', name: 'STM32 Arm Cortex-M4 Microcontroller IC', currentStock: 42, minStock: 200, unit: 'Units', warehouse: 'West Fulfillment Facility' },
      { id: 'p3', sku: 'PK-CORR-L50', name: 'Heavy Duty 5-Ply Corrugated Master Box (L)', currentStock: 120, minStock: 500, unit: 'Boxes', warehouse: 'North Logistics Depot' }
    ],
    expiringLots: [
      { lotNumber: 'LOT-2026-CH-09', productName: 'Industrial Epoxy Resin Part A', expiryDate: '2026-11-15', quantity: 45, unit: 'Drums', warehouse: 'Central Hub' },
      { lotNumber: 'LOT-2026-B-14', productName: 'Thermal Conductive Paste 500g', expiryDate: '2026-12-01', quantity: 120, unit: 'Packs', warehouse: 'West Facility' }
    ],
    pendingApprovals: [
      { id: 'po-101', number: 'PO-2026-048', vendor: 'Apex Industrial Materials Corp', amount: 148500, date: '2026-10-18', status: 'WAITING_APPROVAL' },
      { id: 'po-102', number: 'PO-2026-049', vendor: 'BlueSky Semiconductor Global Pte', amount: 320000, date: '2026-10-19', status: 'WAITING_APPROVAL' }
    ],
    recentMovements: [
      { id: 'm1', type: 'RECEIPT', productName: 'STM32 Arm Cortex Microcontroller', quantity: '+500', time: '12 mins ago' },
      { id: 'm2', type: 'TRANSFER', productName: 'Lithium Battery Cells Pack', quantity: '120 Units', time: '45 mins ago' },
      { id: 'm3', type: 'DELIVERY', productName: 'Oxoo Industrial IoT Gateway v3', quantity: '-60', time: '2 hours ago' },
      { id: 'm4', type: 'ADJUSTMENT', productName: 'Polypropylene Granules', quantity: '-5 Bags', time: '4 hours ago' }
    ]
  }
};

export const MOCK_RECEIPTS = [
  {
    id: 'rcpt-01',
    receiptNumber: 'GRN-2026-081',
    supplier: 'Apex Industrial Materials Corp',
    poNumber: 'PO-2026-042',
    date: '2026-10-18',
    itemCount: 4,
    status: 'VALIDATED',
    totalValue: 245000,
    warehouse: 'Central Distribution Hub'
  },
  {
    id: 'rcpt-02',
    receiptNumber: 'GRN-2026-082',
    supplier: 'BlueSky Semiconductor Global Pte',
    poNumber: 'PO-2026-045',
    date: '2026-10-19',
    itemCount: 2,
    status: 'DRAFT',
    totalValue: 184000,
    warehouse: 'West Fulfillment Facility'
  }
];

export const MOCK_TRANSFERS = [
  {
    id: 'trf-01',
    transferNumber: 'TRF-2026-014',
    sourceWarehouse: 'Central Distribution Hub',
    destinationWarehouse: 'North Logistics Depot',
    itemCount: 6,
    status: 'IN_TRANSIT',
    dispatchedAt: '2026-10-19 09:30',
    estimatedArrival: '2026-10-20 18:00',
    driver: 'Rajesh Kumar (Vehicle MH-04-AZ-2819)'
  },
  {
    id: 'trf-02',
    transferNumber: 'TRF-2026-015',
    sourceWarehouse: 'West Fulfillment Facility',
    destinationWarehouse: 'Central Distribution Hub',
    itemCount: 3,
    status: 'COMPLETED',
    dispatchedAt: '2026-10-17 14:15',
    estimatedArrival: '2026-10-18 11:30',
    driver: 'Manoj Pillai (Vehicle KA-01-EQ-9104)'
  }
];

export const MOCK_MANUFACTURING_ORDERS = [
  {
    id: 'mo-01',
    orderNumber: 'MO-2026-001',
    productName: 'Oxoo Industrial IoT Gateway Controller v3',
    quantity: 250,
    status: 'IN_PRODUCTION',
    startDate: '2026-10-16',
    dueDate: '2026-10-22',
    progressPercent: 68,
    workCenter: 'SMT Surface Mount Line 2',
    bom: 'BOM-IOT-GW-V3'
  },
  {
    id: 'mo-02',
    orderNumber: 'MO-2026-002',
    productName: 'High Precision Sensor Enclosure Assembly',
    quantity: 500,
    status: 'SCHEDULED',
    startDate: '2026-10-23',
    dueDate: '2026-10-28',
    progressPercent: 0,
    workCenter: 'Molding & Tooling Bay 4',
    bom: 'BOM-ENC-SENS-40'
  }
];

export const MOCK_BOMS = [
  {
    id: 'bom-01',
    code: 'BOM-IOT-GW-V3',
    productName: 'Oxoo Industrial IoT Gateway Controller v3',
    componentsCount: 18,
    version: '3.2',
    status: 'ACTIVE'
  },
  {
    id: 'bom-02',
    code: 'BOM-ENC-SENS-40',
    productName: 'High Precision Sensor Enclosure Assembly',
    componentsCount: 6,
    version: '1.0',
    status: 'ACTIVE'
  }
];

export const MOCK_PURCHASE_ORDERS = [
  {
    id: 'po-01',
    poNumber: 'PO-2026-042',
    supplier: { name: 'Apex Industrial Materials Corp' },
    supplierName: 'Apex Industrial Materials Corp',
    orderDate: '2026-10-15',
    expectedDate: '2026-10-22',
    totalAmount: 245000,
    status: 'CONFIRMED',
    itemsCount: 4
  },
  {
    id: 'po-02',
    poNumber: 'PO-2026-045',
    supplier: { name: 'BlueSky Semiconductor Global Pte' },
    supplierName: 'BlueSky Semiconductor Global Pte',
    orderDate: '2026-10-18',
    expectedDate: '2026-10-28',
    totalAmount: 184000,
    status: 'PENDING_APPROVAL',
    itemsCount: 2
  }
];

export const MOCK_QC_CHECKS = [
  {
    id: 'qc-01',
    checkNumber: 'QC-2026-101',
    title: 'Raw Material Chemical Purity Test',
    reference: 'GRN-2026-081',
    category: 'Raw Materials',
    status: 'PASSED',
    passCount: 142,
    failCount: 0,
    inspector: 'Alok Gupta',
    date: '2026-10-18'
  },
  {
    id: 'qc-02',
    checkNumber: 'QC-2026-102',
    title: 'PCB SMT Solder Quality Automated X-Ray Inspection',
    reference: 'MO-2026-001',
    category: 'Electronics',
    status: 'IN_PROGRESS',
    passCount: 238,
    failCount: 2,
    inspector: 'Kavita Nair',
    date: '2026-10-19'
  }
];

export const MOCK_QC_ISSUES = [
  {
    id: 'iss-01',
    issueNumber: 'NCR-2026-008',
    title: 'Surface Micro-scratch on Enclosure Batch B2',
    severity: 'LOW',
    status: 'RESOLVED',
    date: '2026-10-17'
  }
];

export const MOCK_WORK_ORDERS = [
  {
    id: 'wo-01',
    code: 'WO-2026-018',
    equipmentName: 'CNC Milling Machine Line 04',
    type: 'PREVENTIVE',
    priority: 'MEDIUM',
    scheduledDate: '2026-10-24',
    status: 'SCHEDULED',
    technician: 'Ramesh Sawant'
  },
  {
    id: 'wo-02',
    code: 'WO-2026-019',
    equipmentName: 'Automated Conveyor Belt 2 - Bay A',
    type: 'CORRECTIVE',
    priority: 'HIGH',
    scheduledDate: '2026-10-20',
    status: 'IN_PROGRESS',
    technician: 'Imran Khan'
  }
];

export const MOCK_ASSETS = [
  {
    id: 'ast-01',
    code: 'EQ-CNC-04',
    name: 'CNC Milling Machine Line 04',
    department: 'Milling & Machining',
    condition: 'EXCELLENT',
    status: 'OPERATIONAL'
  },
  {
    id: 'ast-02',
    code: 'EQ-CVB-02',
    name: 'Automated Conveyor Belt 2 - Bay A',
    department: 'Material Handling',
    condition: 'UNDER_MAINTENANCE',
    status: 'MAINTENANCE'
  }
];

export const MOCK_ECOS = [
  {
    id: 'eco-01',
    ecoNumber: 'ECO-2026-012',
    title: 'Thermal Dissipation Optimization for Gateway v3',
    status: 'APPROVED',
    engineer: 'Amitabh Sen',
    effectiveDate: '2026-11-01',
    category: 'Hardware Engineering'
  },
  {
    id: 'eco-02',
    ecoNumber: 'ECO-2026-014',
    title: 'Switch to Low-Lead Eco Packaging Material',
    status: 'IN_REVIEW',
    engineer: 'Divya Nair',
    effectiveDate: '2026-11-15',
    category: 'Packaging & Sustainability'
  }
];

export const MOCK_RFQS = [
  {
    id: 'rfq-01',
    rfqNumber: 'RFQ-2026-009',
    title: 'Q4 High-Tensile Steel Rod Supply Contract',
    suppliersInvited: 3,
    bidsReceived: 3,
    deadline: '2026-10-25',
    status: 'EVALUATING'
  },
  {
    id: 'rfq-02',
    rfqNumber: 'RFQ-2026-010',
    title: 'Microcontroller Sourcing Annual Tender 50k Units',
    suppliersInvited: 4,
    bidsReceived: 2,
    deadline: '2026-10-30',
    status: 'OPEN'
  }
];

export const MOCK_REQUISITIONS = [
  {
    id: 'pr-01',
    reqNumber: 'PR-2026-044',
    department: 'Manufacturing Operations',
    requester: 'Sanjay Dutt',
    totalValue: 125000,
    status: 'APPROVED',
    date: '2026-10-18'
  }
];

export const MOCK_CARRIERS = [
  { id: 'car-01', name: 'BlueDart Express', rating: 4.8, activeShipments: 12, mode: 'AIR_EXPRESS' },
  { id: 'car-02', name: 'Safexpress Logistics', rating: 4.6, activeShipments: 28, mode: 'SURFACE_ROAD' }
];

export const MOCK_SHIPMENTS = [
  {
    id: 'shp-01',
    trackingNumber: 'BD-EXP-8891024',
    carrier: 'BlueDart Express',
    origin: 'Central Distribution Hub, Navi Mumbai',
    destination: 'Tata Motors Assembly Plant, Pune',
    status: 'IN_TRANSIT',
    estimatedDelivery: '2026-10-20 14:00'
  }
];

export const MOCK_LOTS = [
  {
    id: 'lot-01',
    lotNumber: 'LOT-2026-CH-09',
    productName: 'Industrial Epoxy Resin Part A',
    warehouse: 'Central Hub',
    quantity: 45,
    unit: 'Drums',
    expiryDate: '2026-11-15',
    isBlocked: false
  },
  {
    id: 'lot-02',
    lotNumber: 'LOT-2026-B-14',
    productName: 'Thermal Conductive Paste 500g',
    warehouse: 'West Facility',
    quantity: 120,
    unit: 'Packs',
    expiryDate: '2026-12-01',
    isBlocked: false
  }
];

export const MOCK_SERIALS = [
  {
    id: 'ser-01',
    serialNumber: 'SN-IOT-2026-00441',
    productName: 'Oxoo Industrial IoT Gateway Controller v3',
    status: 'READY_TO_SHIP',
    manufactureDate: '2026-10-17'
  },
  {
    id: 'ser-02',
    serialNumber: 'SN-IOT-2026-00442',
    productName: 'Oxoo Industrial IoT Gateway Controller v3',
    status: 'READY_TO_SHIP',
    manufactureDate: '2026-10-17'
  }
];

export const MOCK_RETURNS = [
  {
    id: 'ret-01',
    returnNumber: 'RMA-2026-007',
    customer: 'Apex Logistics Sub-assembly Bay',
    reason: 'Surplus material returned after batch production',
    itemCount: 2,
    status: 'RECEIVED'
  }
];

export const MOCK_SCRAPS = [
  {
    id: 'scr-01',
    scrapNumber: 'SCRAP-2026-003',
    productName: 'Machined Enclosure Scrap Offcut',
    quantity: 12,
    unit: 'kg',
    reason: 'Tooling test offcut',
    status: 'DISPOSED'
  }
];
