import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ScanBarcode,
  Camera,
  CameraOff,
  Search,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  History,
  Printer,
  Package,
  Layers,
  MapPin,
  ArrowRight,
  ExternalLink,
  Plus,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import JsBarcode from 'jsbarcode';
import { apiRequest } from '../lib/api.js';

interface DemoBarcode {
  barcode: string;
  name: string;
  sku: string;
  category: string;
}

const DEMO_BARCODES: DemoBarcode[] = [
  { barcode: '8901000000011', name: 'Industrial Sensor Pro-X100', sku: 'SKU-ELEC-001', category: 'Industrial Electronics' },
  { barcode: '8901000000028', name: 'Heavy-Duty Safety Gloves (XL)', sku: 'SKU-SAFE-002', category: 'Safety & PPE' },
  { barcode: '8901000000035', name: 'Heavy Corrugated Packing Carton', sku: 'SKU-PACK-003', category: 'Packaging Materials' },
  { barcode: '8901000000042', name: 'Precision Steel Mounting Bracket', sku: 'SKU-METL-004', category: 'Raw Metals & Fasteners' },
  { barcode: '8901000000059', name: 'High-Torque Brushless Electric Motor', sku: 'SKU-MOTR-005', category: 'Motors & Actuators' },
];

export const BarcodeScannerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [inputBarcode, setInputBarcode] = useState('');
  const [activeBarcode, setActiveBarcode] = useState<string | null>(null);
  const [productData, setProductData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Scanner hardware state
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scanHistory, setScanHistory] = useState<string[]>([]);

  // Print label modal
  const [showLabelModal, setShowLabelModal] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const barcodeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Audio beep generator using Web Audio API
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // 880Hz high beep
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      // AudioContext muted or blocked
    }
  };

  // Central lookup logic shared by camera, manual input, USB scanner, and demo buttons
  const lookupBarcode = async (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setLoading(true);
    setErrorMsg(null);
    setActiveBarcode(trimmed);

    try {
      const res = await apiRequest<{ found: boolean; product: any; error?: string }>(
        `/products/barcode/${encodeURIComponent(trimmed)}`
      );

      if (res.found && res.product) {
        setProductData(res.product);
        playBeep();
        setScanHistory((prev) => [trimmed, ...prev.filter((c) => c !== trimmed)].slice(0, 8));
      } else {
        setProductData(null);
        setErrorMsg(`Product not found for barcode '${trimmed}'.`);
      }
    } catch (err: any) {
      setProductData(null);
      setErrorMsg(err.message || `No product found for barcode '${trimmed}'.`);
    } finally {
      setLoading(false);
    }
  };

  // URL query parameter prefill (e.g. from demo action bar)
  useEffect(() => {
    const q = searchParams.get('barcode');
    if (q) {
      setInputBarcode(q);
      lookupBarcode(q);
    }
  }, [searchParams]);

  // Handle Manual and USB Scanner Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      lookupBarcode(inputBarcode);
    }
  };

  // Camera start / stop controls
  const startCamera = async () => {
    setCameraError(null);
    try {
      const html5QrCode = new Html5Qrcode('camera-reader-viewport');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 180 } },
        (decodedText) => {
          lookupBarcode(decodedText);
          setInputBarcode(decodedText);
        },
        () => {
          // ignore scan failure frames
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      console.warn('Camera failed:', err);
      setCameraError(
        'Camera permission was not granted or no webcam was detected on this device. You can test immediately using the "Try Demo Barcode" panel or manual entry below.'
      );
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        // scanner stopped
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Render printable barcode whenever productData changes and label modal opens
  useEffect(() => {
    if (showLabelModal && barcodeCanvasRef.current && productData?.barcode) {
      try {
        JsBarcode(barcodeCanvasRef.current, productData.barcode, {
          format: 'CODE128',
          lineColor: '#183F35',
          width: 2,
          height: 50,
          displayValue: true,
          fontSize: 14,
        });
      } catch (e) {
        console.error('Barcode render error:', e);
      }
    }
  }, [showLabelModal, productData]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-brand-text">Barcode &amp; QR Terminal</h1>
            <span className="px-2 py-0.5 text-xs font-semibold bg-brand-active text-white rounded-full">
              Scenario A Ready
            </span>
          </div>
          <p className="text-sm text-brand-muted mt-0.5">
            Operational scanning workstation. Supports optical camera, USB barcode scanners, and manual lookup.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              soundEnabled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Sound {soundEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scanner Viewport & Manual Input (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Dedicated Scanning Box */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ScanBarcode className="w-5 h-5 text-brand-active" />
                <h3 className="text-sm font-bold text-brand-text">Optical Scanner Viewport</h3>
              </div>

              {!isScanning ? (
                <button
                  onClick={startCamera}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-teal text-white text-xs font-semibold rounded-lg hover:bg-brand-active transition-colors shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Start Camera</span>
                </button>
              ) : (
                <button
                  onClick={stopCamera}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition-colors shadow-xs"
                >
                  <CameraOff className="w-3.5 h-3.5" />
                  <span>Stop Camera</span>
                </button>
              )}
            </div>

            {/* Video Viewport Container */}
            <div className="relative min-h-[240px] bg-slate-900 rounded-xl overflow-hidden flex flex-col items-center justify-center border-2 border-dashed border-brand-border/60">
              <div id="camera-reader-viewport" className="w-full max-w-sm" />

              {!isScanning && (
                <div className="text-center p-6 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center mx-auto mb-2">
                    <ScanBarcode className="w-6 h-6 text-brand-sage" />
                  </div>
                  <p className="text-sm font-semibold text-white">Camera Scanner Inactive</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Click "Start Camera" for optical scanning, or enter a barcode manually below.
                  </p>
                </div>
              )}
            </div>

            {cameraError && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>

          {/* Manual Entry & USB Scanner Input */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card">
            <h3 className="text-sm font-bold text-brand-text mb-1">Manual / USB Scanner Input</h3>
            <p className="text-xs text-brand-muted mb-3">
              Standard USB barcode scanners automatically send keystrokes and an Enter key.
            </p>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputBarcode}
                  onChange={(e) => setInputBarcode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter barcode or scan with USB handheld..."
                  className="w-full h-10 px-3.5 text-sm bg-white border border-brand-border rounded-lg text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-active shadow-2xs font-mono"
                />
              </div>

              <button
                onClick={() => lookupBarcode(inputBarcode)}
                disabled={loading || !inputBarcode.trim()}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-teal text-white text-xs font-semibold rounded-lg hover:bg-brand-active transition-colors shadow-xs disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Lookup</span>
              </button>

              {activeBarcode && (
                <button
                  onClick={() => {
                    setInputBarcode('');
                    setActiveBarcode(null);
                    setProductData(null);
                    setErrorMsg(null);
                  }}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Required Demo Scenarios: Try Demo Barcodes Panel */}
          <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-brand-text">Try Demo Barcodes (Section 8 Seed Examples)</h3>
            </div>
            <p className="text-xs text-brand-muted mb-3">
              Click any verified seeded sample below to instantly trigger the exact same lookup pipeline:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_BARCODES.map((item) => (
                <button
                  key={item.barcode}
                  onClick={() => {
                    setInputBarcode(item.barcode);
                    lookupBarcode(item.barcode);
                  }}
                  className={`flex flex-col p-2.5 rounded-lg border text-left transition-all ${
                    activeBarcode === item.barcode
                      ? 'bg-brand-active text-white border-brand-active shadow-sm'
                      : 'bg-white hover:bg-brand-bg/60 border-brand-border text-brand-text'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold tracking-wider">{item.barcode}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                        activeBarcode === item.barcode ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.sku}
                    </span>
                  </div>
                  <div
                    className={`text-xs font-semibold mt-1 truncate ${
                      activeBarcode === item.barcode ? 'text-white' : 'text-brand-text'
                    }`}
                  >
                    {item.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Instant Product Preview Card & Operational Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-800">Scan Match Failed</h4>
                <p className="text-xs text-rose-700 mt-0.5">{errorMsg}</p>
                <button
                  onClick={() => navigate('/inventory')}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-rose-800 underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create new product for this barcode</span>
                </button>
              </div>
            </div>
          )}

          {productData ? (
            <div className="bg-brand-card border border-brand-border rounded-xl p-5 shadow-card space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-brand-border">
                <span className="text-xs font-bold text-brand-active uppercase tracking-wide flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Verified Product Match
                </span>
                <button
                  onClick={() => setShowLabelModal(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-brand-teal hover:text-brand-active"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Label</span>
                </button>
              </div>

              {/* Product Header */}
              <div className="flex gap-4">
                {productData.imageUrl ? (
                  <img
                    src={productData.imageUrl}
                    alt={productData.name}
                    className="w-20 h-20 object-cover rounded-lg border border-brand-border shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-brand-bg flex items-center justify-center text-brand-muted shrink-0 border border-brand-border">
                    <Package className="w-8 h-8" />
                  </div>
                )}

                <div className="min-w-0">
                  <h3 className="text-base font-bold text-brand-text leading-snug">{productData.name}</h3>
                  <div className="text-xs font-mono text-brand-muted mt-0.5">SKU: {productData.sku}</div>
                  <div className="text-xs font-mono text-brand-active mt-0.5">Barcode: {productData.barcode}</div>
                  <span className="inline-block mt-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {productData.category?.name || 'Stockable Product'}
                  </span>
                </div>
              </div>

              {/* Inventory Quantities */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-white border border-brand-border rounded-lg text-center">
                <div>
                  <div className="text-[10px] text-brand-muted uppercase font-semibold">On-Hand</div>
                  <div className="text-lg font-bold text-brand-text mt-0.5">
                    {productData.stock?.totalOnHand ?? 0}
                  </div>
                </div>
                <div className="border-x border-brand-border">
                  <div className="text-[10px] text-brand-muted uppercase font-semibold">Reserved</div>
                  <div className="text-lg font-bold text-amber-700 mt-0.5">
                    {productData.stock?.totalReserved ?? 0}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-brand-muted uppercase font-semibold">Available</div>
                  <div className="text-lg font-bold text-emerald-800 mt-0.5">
                    {productData.stock?.available ?? 0}
                  </div>
                </div>
              </div>

              {/* Storage Locations */}
              <div>
                <h4 className="text-xs font-bold text-brand-text mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-muted" />
                  <span>Warehouse Storage Locations</span>
                </h4>
                <div className="space-y-1">
                  {productData.stock?.balances?.map((b: any) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between px-2.5 py-1.5 bg-brand-bg/60 rounded text-xs"
                    >
                      <span className="font-medium text-brand-text">
                        {b.warehouse.name} ({b.location.code})
                      </span>
                      <span className="font-bold text-brand-teal">{b.onHandQty} units</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operational Action Buttons */}
              <div className="pt-2 border-t border-brand-border space-y-2">
                <button
                  onClick={() => navigate(`/inventory/products/${productData.id}`)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-brand-teal text-white rounded-lg text-xs font-semibold hover:bg-brand-active transition-colors shadow-xs"
                >
                  <span>Open Full Product Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigate(`/traceability?q=${encodeURIComponent(productData.barcode)}`)}
                    className="flex items-center justify-center gap-1 py-1.5 bg-white border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-brand-bg transition-colors"
                  >
                    <span>Full Traceability</span>
                  </button>
                  <button
                    onClick={() => navigate(`/warehouse/receipts`)}
                    className="flex items-center justify-center gap-1 py-1.5 bg-white border border-brand-border rounded-lg text-xs font-semibold text-brand-text hover:bg-brand-bg transition-colors"
                  >
                    <span>Receive Goods</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-brand-card border border-brand-border rounded-xl p-8 text-center shadow-card">
              <ScanBarcode className="w-10 h-10 text-brand-muted mx-auto mb-3" />
              <h3 className="text-sm font-bold text-brand-text">Ready for Scans</h3>
              <p className="text-xs text-brand-muted mt-1 max-w-xs mx-auto">
                Scan any barcode or select a demo sample to see real-time warehouse stock, storage aisles, and product movements.
              </p>
            </div>
          )}

          {/* Recent Scans History */}
          {scanHistory.length > 0 && (
            <div className="bg-brand-card border border-brand-border rounded-xl p-4 shadow-card">
              <div className="flex items-center gap-2 mb-2">
                <History className="w-4 h-4 text-brand-muted" />
                <h4 className="text-xs font-bold text-brand-text">Recent Session Scans</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {scanHistory.map((code) => (
                  <button
                    key={code}
                    onClick={() => {
                      setInputBarcode(code);
                      lookupBarcode(code);
                    }}
                    className="px-2 py-1 text-xs font-mono bg-white border border-brand-border rounded hover:border-brand-active text-brand-text transition-colors"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Printable Barcode Label Modal */}
      {showLabelModal && productData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brand-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <h3 className="text-sm font-bold text-brand-text">Printable Barcode Label</h3>
              <button
                onClick={() => setShowLabelModal(false)}
                className="text-xs text-brand-muted hover:text-brand-text"
              >
                Close
              </button>
            </div>

            <div className="printable-barcode-area p-4 border border-brand-border rounded-lg bg-brand-card text-center space-y-2">
              <div className="text-xs font-bold text-brand-text truncate">{productData.name}</div>
              <div className="text-[11px] font-mono text-brand-muted">SKU: {productData.sku}</div>
              <canvas ref={barcodeCanvasRef} className="mx-auto" />
              <div className="text-[10px] text-brand-muted uppercase tracking-wider">
                FlowStock 360 Inventory Management System
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowLabelModal(false)}
                className="px-4 py-2 text-xs font-medium text-brand-muted hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-teal text-white rounded-lg text-xs font-semibold hover:bg-brand-active"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Label</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
