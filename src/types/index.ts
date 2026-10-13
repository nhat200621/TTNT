export interface StoreType {
  _id: string;
  name: string;
  description?: string;
  parameterX: number;
  code: string;
}

export interface Store {
  _id: string;
  name: string;
  storeTypeId: string | StoreType;
  address?: string;
  phone?: string;
  city: string;
  areaType: 'CITY_CENTER' | 'SUBURBAN' | 'RURAL' | 'OTHER';
  productCategoryIds?: string[] | Category[];
  currency: string;
  defaultUnit?: string;
}

export interface Category {
  _id: string;
  name: string;
  parentId?: string | Category;
  storeId: string;
  description?: string;
}

export interface SeasonalProductData {
  _id: string;
  name: string;
  code: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  midMonth: number;
  midDay: number;
  isActive: boolean;
}

export interface Product {
  _id: string;
  name: string;
  categoryId: string | Category;
  subcategoryId?: string | Category;
  unit: string;
  barcode?: string;
  description?: string;
  brand?: string;
  supplierId?: string | Supplier;
  storeId: string;
  status: 'ACTIVE' | 'TRIAL' | 'INACTIVE' | 'DISCONTINUED';
  seasonConfigMode: 'CATEGORY_DEFAULT' | 'GLOBAL' | 'SPECIFIC_SEASON';
  seasonId?: string | SeasonalProductData;
  shelfLife?: number;
  expectedLeadTime: number;
  storageCondition?: string;
  currentSellingPrice: number;
}

export interface Supplier {
  _id: string;
  name: string;
  phone?: string;
  address?: string;
  email?: string;
  notes?: string;
  storeId: string;
}

export interface InventoryBatch {
  _id: string;
  productId: string | Product;
  supplierId?: string | Supplier;
  batchNumber: string;
  purchaseDate: string;
  expirationDate?: string;
  quantityImported: number;
  quantityCurrent: number;
  purchasePrice: number;
  transportationCost: number;
  transportationCostPerUnit: number;
  actualCostPerUnit: number;
  storeId: string;
  notes?: string;

  // Snapshots
  productName?: string;
  categoryName?: string;
  unit?: string;
}

export interface Sale {
  _id: string;
  storeId: string;
  transactionDate: string;
  totalAmount: number;
  paymentMethod?: string;
  staffId?: string;
}

export interface SaleItem {
  _id: string;
  saleId: string;
  productId: string | Product;
  batchId: string;
  quantity: number;
  sellingPrice: number;
  subtotal: number;
}

export interface InventoryTransaction {
  _id: string;
  productId: string | Product;
  batchId?: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  balanceAfter: number;
  transactionDate: string;
  referenceId?: string;
  referenceType?: 'Sale' | 'Purchase' | 'Manual';
  notes?: string;
  storeId: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalInventoryQuantity: number;
  totalInventoryValue: number;
  totalRevenue: number;
  totalPurchaseCost: number;
  lowStockCount: number;
  expiringSoonCount: number;
  activeProducts: number;
}
