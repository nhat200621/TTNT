import React, { useEffect, useState } from 'react';
import { productApi, purchaseApi } from '../services/api';
import { Product, InventoryBatch } from '../types';
import { Search, Filter, AlertTriangle } from 'lucide-react';

interface StockItem {
  product: Product;
  totalStock: number;
  batches: InventoryBatch[];
}

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const prodRes = await productApi.getAll();
      const products: Product[] = prodRes.data;

      const inventoryData = await Promise.all(products.map(async (p) => {
        const stockRes = await productApi.getStock(p._id);
        return {
          product: p,
          totalStock: stockRes.data.totalStock,
          batches: stockRes.data.batches
        };
      }));

      setInventory(inventoryData);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Đang tải dữ liệu tồn kho...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tìm sản phẩm trong kho..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center hover:bg-gray-50 dark:hover:bg-gray-700">
             <Filter size={18} className="mr-2" /> Bộ lọc
           </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Tồn kho</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Giá nhập bình quân</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Giá bán</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Hạn sử dụng gần nhất</th>
              <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredInventory.map((item) => {
              const closestExpiry = item.batches.length > 0
                ? item.batches
                    .filter(b => b.expirationDate)
                    .sort((a, b) => new Date(a.expirationDate!).getTime() - new Date(b.expirationDate!).getTime())[0]?.expirationDate
                : null;

              const avgPurchasePrice = item.batches.length > 0
                ? item.batches.reduce((sum, b) => sum + b.actualCostPerUnit, 0) / item.batches.length
                : 0;

              const isLowStock = item.totalStock < 10;
              const isNearExpiry = closestExpiry && (new Date(closestExpiry).getTime() - new Date().getTime()) < (7 * 24 * 60 * 60 * 1000);

              return (
                <tr key={item.product._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4">
                    <div className="font-medium">{item.product.name}</div>
                    <div className="text-xs text-gray-500">{typeof item.product.categoryId === 'object' ? item.product.categoryId.name : ''}</div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold">
                    <span className={isLowStock ? 'text-red-500' : ''}>
                      {item.totalStock} {item.product.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {new Intl.NumberFormat('vi-VN').format(avgPurchasePrice)} đ
                  </td>
                  <td className="px-6 py-4 text-right">
                    {new Intl.NumberFormat('vi-VN').format(item.product.currentSellingPrice)} đ
                  </td>
                  <td className="px-6 py-4">
                    {closestExpiry ? (
                      <span className={isNearExpiry ? 'text-orange-500 font-medium' : ''}>
                        {new Date(closestExpiry).toLocaleDateString('vi-VN')}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    {isLowStock && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mr-2">
                        Sắp hết hàng
                      </span>
                    )}
                    {isNearExpiry && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                        Sắp hết hạn
                      </span>
                    )}
                    {!isLowStock && !isNearExpiry && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Ổn định
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;
