import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ScanBarcode,
  ArrowDownToLine,
  ArrowLeftRight,
  ShoppingCart,
  ShieldCheck,
  Factory,
  RefreshCw,
  SearchCode,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { apiRequest } from '../lib/api.js';

interface DemoActionsBarProps {
  onDataMutated?: () => void;
}

export const DemoActionsBar: React.FC<DemoActionsBarProps> = ({ onDataMutated }) => {
  const navigate = useNavigate();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 5000);
  };

  // 1. Scan Demo Barcode -> navigates to scanner with sample barcode preloaded
  const handleScanDemoBarcode = () => {
    navigate('/barcode-scanner?barcode=8901000000011');
  };

  // 2. Receive Demo Shipment -> validates first draft receipt or creates and validates one
  const handleReceiveDemoShipment = async () => {
    setLoadingAction('receive');
    try {
      const res = await apiRequest<{ receipts: any[] }>('/receipts?status=DRAFT');
      let receiptToValidate = res.receipts && res.receipts.length > 0 ? res.receipts[0] : null;

      if (!receiptToValidate) {
        // Find existing receipt
        const all = await apiRequest<{ receipts: any[] }>('/receipts');
        receiptToValidate = all.receipts[0];
      }

      if (receiptToValidate && receiptToValidate.status !== 'VALIDATED') {
        await apiRequest(`/receipts/${receiptToValidate.id}/validate`, { method: 'POST' });
        showStatus('success', `Receipt ${receiptToValidate.receiptNumber} successfully received into stock!`);
      } else {
        showStatus('success', `Goods receipt validated. Physical stock incremented.`);
      }

      if (onDataMutated) onDataMutated();
      navigate('/warehouse/receipts');
    } catch (err: any) {
      showStatus('error', err.message || 'Failed demo receipt');
    } finally {
      setLoadingAction(null);
    }
  };

  // 3. Transfer Demo Stock -> dispatches an open transfer
  const handleTransferDemoStock = async () => {
    setLoadingAction('transfer');
    try {
      const res = await apiRequest<{ transfers: any[] }>('/transfers');
      const draft = res.transfers.find((t) => t.status === 'DRAFT' || t.status === 'RESERVED');
      if (draft) {
        await apiRequest(`/transfers/${draft.id}/dispatch`, { method: 'POST' });
        showStatus('success', `Transfer ${draft.transferNumber} dispatched in-transit to East Hub!`);
      } else {
        const inTransit = res.transfers.find((t) => t.status === 'IN_TRANSIT');
        if (inTransit) {
          await apiRequest(`/transfers/${inTransit.id}/receive`, { method: 'POST' });
          showStatus('success', `Transfer ${inTransit.transferNumber} received at destination warehouse!`);
        } else {
          showStatus('success', 'Transfer workflow active and synchronized.');
        }
      }
      if (onDataMutated) onDataMutated();
      navigate('/warehouse/transfers');
    } catch (err: any) {
      showStatus('error', err.message || 'Transfer action failed');
    } finally {
      setLoadingAction(null);
    }
  };

  // 4. Create Demo Purchase Order -> automatically creates and submits a sample PO
  const handleCreateDemoPO = async () => {
    setLoadingAction('po');
    try {
      const suppliers = await apiRequest<{ suppliers: any[] }>('/suppliers');
      const warehouses = await apiRequest<{ warehouses: any[] }>('/warehouses');
      const products = await apiRequest<{ products: any[] }>('/products?limit=5');

      if (!suppliers.suppliers[0] || !warehouses.warehouses[0] || !products.products[0]) {
        throw new Error('System master data missing');
      }

      const res = await apiRequest<{ purchaseOrder: any }>('/purchase-orders', {
        method: 'POST',
        body: JSON.stringify({
          supplierId: suppliers.suppliers[0].id,
          warehouseId: warehouses.warehouses[0].id,
          expectedArrival: new Date(Date.now() + 7 * 86400000).toISOString(),
          notes: 'Interactive demo replenishment order',
          lines: [
            {
              productId: products.products[0].id,
              quantity: 25,
              unitPrice: products.products[0].costPrice || 45,
            },
          ],
        }),
      });

      showStatus('success', `Draft PO ${res.purchaseOrder.poNumber} created successfully!`);
      if (onDataMutated) onDataMutated();
      navigate(`/purchase/orders/${res.purchaseOrder.id}`);
    } catch (err: any) {
      showStatus('error', err.message || 'Failed to create PO');
    } finally {
      setLoadingAction(null);
    }
  };

  // 5. Complete Demo Quality Check
  const handleCompleteDemoQC = async () => {
    setLoadingAction('qc');
    try {
      const res = await apiRequest<{ checks: any[] }>('/quality/checks');
      const pending = res.checks.find((c) => c.status === 'PENDING');
      if (pending) {
        await apiRequest(`/quality/checks/${pending.id}/evaluate`, {
          method: 'POST',
          body: JSON.stringify({
            status: 'PASSED',
            actualValue: '100% verified within engineering tolerance',
            notes: 'Demo evaluation passed successfully',
          }),
        });
        showStatus('success', `Quality Check ${pending.checkNumber} verified and passed!`);
      } else {
        showStatus('success', 'Quality inspection completed.');
      }
      if (onDataMutated) onDataMutated();
      navigate('/quality');
    } catch (err: any) {
      showStatus('error', err.message || 'QC evaluation failed');
    } finally {
      setLoadingAction(null);
    }
  };

  // 6. Start Demo Manufacturing Order
  const handleStartDemoMO = async () => {
    setLoadingAction('mo');
    try {
      const res = await apiRequest<{ orders: any[] }>('/manufacturing/orders');
      const pendingMo = res.orders.find((m) => m.status === 'CONFIRMED' || m.status === 'PLANNED');
      if (pendingMo) {
        await apiRequest(`/manufacturing/orders/${pendingMo.id}/start`, { method: 'POST' });
        showStatus('success', `Manufacturing Order ${pendingMo.moNumber} started in production!`);
      } else {
        const inProg = res.orders.find((m) => m.status === 'IN_PROGRESS');
        if (inProg) {
          await apiRequest(`/manufacturing/orders/${inProg.id}/complete`, {
            method: 'POST',
            body: JSON.stringify({ producedQuantity: inProg.plannedQuantity }),
          });
          showStatus('success', `Manufacturing Order ${inProg.moNumber} completed! Finished goods added.`);
        } else {
          showStatus('success', 'Production orders synchronized.');
        }
      }
      if (onDataMutated) onDataMutated();
      navigate('/manufacturing');
    } catch (err: any) {
      showStatus('error', err.message || 'Manufacturing action failed');
    } finally {
      setLoadingAction(null);
    }
  };

  // 7. Generate Replenishment Recommendations
  const handleReplenishment = () => {
    navigate('/replenishment');
  };

  // 8. View Product Traceability
  const handleTraceability = () => {
    navigate('/traceability?q=LOT-2026-SENS-01');
  };

  // 9. Reset Demo Data
  const handleResetDemoData = async () => {
    if (!window.confirm('Reset all demo records back to the pristine initial dataset? This ensures clean presentation state.')) {
      return;
    }
    setLoadingAction('reset');
    try {
      await apiRequest('/demo/reset', { method: 'POST' });
      showStatus('success', 'Demo data successfully restored to pristine state!');
      if (onDataMutated) onDataMutated();
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      showStatus('error', err.message || 'Reset failed');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="bg-brand-card border border-brand-border rounded-xl p-3 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-brand-border/60">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-brand-amber/30 text-amber-900">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-brand-text uppercase tracking-wide">
              Interactive Demo Control Panel
            </span>
            <span className="text-[11px] text-brand-muted hidden md:inline ml-2">
              Execute live enterprise operations with zero manual data entry
            </span>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </div>

      {/* 9 Clearly Labeled Demo Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 mt-2.5">
        <button
          onClick={handleScanDemoBarcode}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-brand-border hover:border-brand-active hover:bg-brand-bg/50 text-xs font-medium text-brand-text transition-all group"
        >
          <ScanBarcode className="w-4 h-4 text-brand-teal mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] text-center leading-tight">1. Scan Barcode</span>
        </button>

        <button
          onClick={handleReceiveDemoShipment}
          disabled={loadingAction === 'receive'}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-brand-border hover:border-brand-active hover:bg-brand-bg/50 text-xs font-medium text-brand-text transition-all group disabled:opacity-50"
        >
          {loadingAction === 'receive' ? (
            <Loader2 className="w-4 h-4 text-brand-active animate-spin mb-1" />
          ) : (
            <ArrowDownToLine className="w-4 h-4 text-emerald-700 mb-1 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-[11px] text-center leading-tight">2. Receive Goods</span>
        </button>

        <button
          onClick={handleTransferDemoStock}
          disabled={loadingAction === 'transfer'}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-brand-border hover:border-brand-active hover:bg-brand-bg/50 text-xs font-medium text-brand-text transition-all group disabled:opacity-50"
        >
          {loadingAction === 'transfer' ? (
            <Loader2 className="w-4 h-4 text-brand-active animate-spin mb-1" />
          ) : (
            <ArrowLeftRight className="w-4 h-4 text-purple-700 mb-1 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-[11px] text-center leading-tight">3. Transfer Stock</span>
        </button>

        <button
          onClick={handleCreateDemoPO}
          disabled={loadingAction === 'po'}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-brand-border hover:border-brand-active hover:bg-brand-bg/50 text-xs font-medium text-brand-text transition-all group disabled:opacity-50"
        >
          {loadingAction === 'po' ? (
            <Loader2 className="w-4 h-4 text-brand-active animate-spin mb-1" />
          ) : (
            <ShoppingCart className="w-4 h-4 text-amber-700 mb-1 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-[11px] text-center leading-tight">4. Create PO</span>
        </button>

        <button
          onClick={handleCompleteDemoQC}
          disabled={loadingAction === 'qc'}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-brand-border hover:border-brand-active hover:bg-brand-bg/50 text-xs font-medium text-brand-text transition-all group disabled:opacity-50"
        >
          {loadingAction === 'qc' ? (
            <Loader2 className="w-4 h-4 text-brand-active animate-spin mb-1" />
          ) : (
            <ShieldCheck className="w-4 h-4 text-brand-success mb-1 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-[11px] text-center leading-tight">5. Quality Check</span>
        </button>

        <button
          onClick={handleStartDemoMO}
          disabled={loadingAction === 'mo'}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-brand-border hover:border-brand-active hover:bg-brand-bg/50 text-xs font-medium text-brand-text transition-all group disabled:opacity-50"
        >
          {loadingAction === 'mo' ? (
            <Loader2 className="w-4 h-4 text-brand-active animate-spin mb-1" />
          ) : (
            <Factory className="w-4 h-4 text-indigo-700 mb-1 group-hover:scale-110 transition-transform" />
          )}
          <span className="text-[11px] text-center leading-tight">6. Start MO</span>
        </button>

        <button
          onClick={handleReplenishment}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-brand-border hover:border-brand-active hover:bg-brand-bg/50 text-xs font-medium text-brand-text transition-all group"
        >
          <RefreshCw className="w-4 h-4 text-teal-700 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] text-center leading-tight">7. Replenish</span>
        </button>

        <button
          onClick={handleTraceability}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-brand-border hover:border-brand-active hover:bg-brand-bg/50 text-xs font-medium text-brand-text transition-all group"
        >
          <SearchCode className="w-4 h-4 text-cyan-700 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] text-center leading-tight">8. Traceability</span>
        </button>

        <button
          onClick={handleResetDemoData}
          disabled={loadingAction === 'reset'}
          className="flex flex-col items-center justify-center p-2 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-xs font-medium text-rose-800 transition-all group disabled:opacity-50"
          title="Restore pristine sample database state"
        >
          {loadingAction === 'reset' ? (
            <Loader2 className="w-4 h-4 text-rose-700 animate-spin mb-1" />
          ) : (
            <RotateCcw className="w-4 h-4 text-rose-700 mb-1 group-hover:rotate-180 transition-transform duration-300" />
          )}
          <span className="text-[11px] text-center leading-tight font-semibold">9. Reset Demo</span>
        </button>
      </div>
    </div>
  );
};
