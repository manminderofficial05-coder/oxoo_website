import React from 'react';
import { HashRouter as BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { WarehouseProvider } from './context/WarehouseContext.js';
import { AppLayout } from './components/layout/AppLayout.js';

// Core & Existing Views
import { DashboardPage } from './pages/DashboardPage.js';
import { CommandCenterPage } from './pages/CommandCenterPage.js';
import { ActivityFeedPage } from './pages/ActivityFeedPage.js';
import { InventoryPage } from './pages/InventoryPage.js';
import { ProductDetailPage } from './pages/ProductDetailPage.js';
import { BarcodeScannerPage } from './pages/BarcodeScannerPage.js';
import { WarehouseReceiptsPage } from './pages/WarehouseReceiptsPage.js';
import { WarehouseDeliveriesPage } from './pages/WarehouseDeliveriesPage.js';
import { WarehouseTransfersPage } from './pages/WarehouseTransfersPage.js';
import { InventoryAdjustmentsPage } from './pages/InventoryAdjustmentsPage.js';
import { ManufacturingPage } from './pages/ManufacturingPage.js';
import { QualityPage } from './pages/QualityPage.js';
import { MaintenancePage } from './pages/MaintenancePage.js';
import { PLMPage } from './pages/PLMPage.js';
import { PurchasingPage } from './pages/PurchasingPage.js';
import { ReplenishmentPage } from './pages/ReplenishmentPage.js';
import { TraceabilityPage } from './pages/TraceabilityPage.js';
import { ReturnsPage } from './pages/ReturnsPage.js';
import { ValuationPage } from './pages/ValuationPage.js';
import { ReportsPage } from './pages/ReportsPage.js';
import { AdminPage } from './pages/AdminPage.js';

// Expanded 26-Application Suite Views
import { Warehouse360Page } from './pages/Warehouse360Page.js';
import { Vendor360Page } from './pages/Vendor360Page.js';
import { ProcurementPage } from './pages/ProcurementPage.js';
import { RFQManagerPage } from './pages/RFQManagerPage.js';
import { Logistics360Page } from './pages/Logistics360Page.js';
import { FleetManagementPage } from './pages/FleetManagementPage.js';
import { ImportExportPage } from './pages/ImportExportPage.js';
import { DemandPlanningPage } from './pages/DemandPlanningPage.js';
import { AnalyticsPage } from './pages/AnalyticsPage.js';
import { QualityReceivingPage } from './pages/QualityReceivingPage.js';
import { VendorPortalPage } from './pages/VendorPortalPage.js';
import { InventoryAuditPage } from './pages/InventoryAuditPage.js';
import { Dispatch360Page } from './pages/Dispatch360Page.js';
import { LotSerialTrackingPage } from './pages/LotSerialTrackingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { useAuth } from './context/AuthContext.js';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-bg">
        <div className="w-8 h-8 border-4 border-brand-active border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <WarehouseProvider>
        <BrowserRouter>
          <Routes>
            {/* Public User & Admin Login Page */}
            <Route path="/login" element={<LoginPage />} />

            {/* Authenticated Workspace */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* 1. Command & Analytics */}
              <Route path="/" element={<DashboardPage />} />
              <Route path="/command-center" element={<CommandCenterPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/demand-planning" element={<DemandPlanningPage />} />
              <Route path="/activity-feed" element={<ActivityFeedPage />} />

              {/* 2. Operations 360 */}
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/inventory/products/:id" element={<ProductDetailPage />} />
              <Route path="/warehouse" element={<Warehouse360Page />} />
              <Route path="/stock-transfers" element={<WarehouseTransfersPage />} />
              <Route path="/dispatch" element={<Dispatch360Page />} />
              <Route path="/returns" element={<ReturnsPage />} />
              <Route path="/barcode-scanner" element={<BarcodeScannerPage />} />

              {/* 3. Procurement & Sourcing */}
              <Route path="/purchase" element={<PurchasingPage />} />
              <Route path="/procurement" element={<ProcurementPage />} />
              <Route path="/rfq" element={<RFQManagerPage />} />
              <Route path="/vendors" element={<Vendor360Page />} />
              <Route path="/vendor-portal" element={<VendorPortalPage />} />
              <Route path="/replenishment" element={<ReplenishmentPage />} />

              {/* 4. Logistics & Fleet */}
              <Route path="/logistics" element={<Logistics360Page />} />
              <Route path="/fleet" element={<FleetManagementPage />} />
              <Route path="/customs" element={<ImportExportPage />} />

              {/* 5. Manufacturing & Quality */}
              <Route path="/manufacturing" element={<ManufacturingPage />} />
              <Route path="/quality" element={<QualityPage />} />
              <Route path="/quality-receiving" element={<QualityReceivingPage />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/plm" element={<PLMPage />} />

              {/* 6. Auditing & Traceability */}
              <Route path="/lot-serial-tracking" element={<LotSerialTrackingPage />} />
              <Route path="/inventory-audit" element={<InventoryAuditPage />} />
              <Route path="/traceability" element={<TraceabilityPage />} />

              {/* Legacy Sub-routes for Backwards Compatibility */}
              <Route path="/warehouse/receipts" element={<WarehouseReceiptsPage />} />
              <Route path="/warehouse/deliveries" element={<WarehouseDeliveriesPage />} />
              <Route path="/warehouse/transfers" element={<WarehouseTransfersPage />} />
              <Route path="/warehouse/adjustments" element={<InventoryAdjustmentsPage />} />
              <Route path="/warehouse/returns" element={<ReturnsPage />} />
              <Route path="/valuation" element={<ValuationPage />} />
              <Route path="/reports" element={<ReportsPage />} />

              {/* 7. Administration */}
              <Route path="/admin" element={<AdminPage />} />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </WarehouseProvider>
    </AuthProvider>
  );
};

export default App;
