import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../lib/api.js';

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  locationCount?: number;
  productCount?: number;
  totalStockValue?: number;
}

interface WarehouseContextType {
  warehouses: Warehouse[];
  selectedWarehouseId: string;
  setSelectedWarehouseId: (id: string) => void;
  selectedWarehouse: Warehouse | undefined;
  refreshWarehouses: () => Promise<void>;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

export const WarehouseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');

  const fetchWarehouses = async () => {
    try {
      const res = await apiRequest<{ warehouses: Warehouse[] }>('/warehouses');
      setWarehouses(res.warehouses || []);
    } catch (e) {
      console.error('Failed to load warehouses:', e);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const selectedWarehouse = warehouses.find((w) => w.id === selectedWarehouseId);

  return (
    <WarehouseContext.Provider
      value={{
        warehouses,
        selectedWarehouseId,
        setSelectedWarehouseId,
        selectedWarehouse,
        refreshWarehouses: fetchWarehouses,
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
};

export function useWarehouse() {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
}
