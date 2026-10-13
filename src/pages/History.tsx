import React, { useEffect, useState } from 'react';
import api, { purchaseApi, saleApi } from '../services/api';
import { InventoryBatch, Sale, InventoryTransaction } from '../types';
import { Download, ShoppingBag, ArrowLeftRight, Calendar, Search } from 'lucide-react';

const History: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'purchase' | 'sale' | 'inventory'>('purchase');
  const [purchases, setPurchases] = useState<InventoryBatch[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [activeTab]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      if (activeTab === 'purchase') {
        const res = await purchaseApi.getAll();
        setPurchases(res.data);
      } else if (activeTab === 'sale') {
        const res = await saleApi.getAll();
        setSales(res.data);
      } else {
        const res = await api.get('/inventory/transactions');
        setTransactions(res.data);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  const formatDate = (date: string) => new Date(date).toLocaleString('vi-VN');

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('purchase')}
          className={`px-6 py-3 font-medium text-sm flex items-center ${activeTab === 'purchase' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Download size={18} className="mr-2" /> Lịch sử nhập hàng
        </button>
        <button
          onClick={() => setActiveTab('sale')}
          className={`px-6 py-3 font-medium text-sm flex items-center ${activeTab === 'sale' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <ShoppingBag size={18} className="mr-2" /> Lịch sử bán hàng
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-6 py-3 font-medium text-sm flex items-center ${activeTab === 'inventory' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <ArrowLeftRight size={18} className="mr-2" /> Lịch sử tồn kho
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Đang tải...</div>
        ) : (
          <table className="w-full text-left">
            {activeTab === 'purchase' && (
              <>
                <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-3">Ngày nhập</th>
                    <th className="px-6 py-3">Sản phẩm</th>
                    <th className="px-6 py-3">Số lượng</th>
                    <th className="px-6 py-3">Giá nhập</th>
                    <th className="px-6 py-3">Vận chuyển</th>
                    <th className="px-6 py-3">Tổng tiền</th>
                    <th className="px-6 py-3">Lô hàng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {purchases.map(p => (
                    <tr key={p._id} className="text-sm">
                      <td className="px-6 py-4">{formatDate(p.purchaseDate)}</td>
                      <td className="px-6 py-4 font-medium">{(p.productId as any)?.name}</td>
                      <td className="px-6 py-4">{p.quantityImported} {(p.productId as any)?.unit}</td>
                      <td className="px-6 py-4">{formatCurrency(p.purchasePrice)}</td>
                      <td className="px-6 py-4">{formatCurrency(p.transportationCost)}</td>
                      <td className="px-6 py-4 font-bold">{formatCurrency(p.quantityImported * p.purchasePrice + p.transportationCost)}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{p.batchNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

            {activeTab === 'sale' && (
              <>
                <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-3">Ngày bán</th>
                    <th className="px-6 py-3">Số sản phẩm</th>
                    <th className="px-6 py-3">Tổng doanh thu</th>
                    <th className="px-6 py-3">Thanh toán</th>
                    <th className="px-6 py-3 text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sales.map(s => (
                    <tr key={s._id} className="text-sm">
                      <td className="px-6 py-4">{formatDate(s.transactionDate)}</td>
                      <td className="px-6 py-4 italic text-gray-500">Đơn hàng</td>
                      <td className="px-6 py-4 font-bold text-green-600">{formatCurrency(s.totalAmount)}</td>
                      <td className="px-6 py-4">{s.paymentMethod}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-600 hover:underline">Xem</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}

            {activeTab === 'inventory' && (
              <>
                <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-3">Thời gian</th>
                    <th className="px-6 py-3">Sản phẩm</th>
                    <th className="px-6 py-3">Loại</th>
                    <th className="px-6 py-3 text-right">Số lượng</th>
                    <th className="px-6 py-3 text-right">Tồn sau GD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {transactions.map(t => (
                    <tr key={t._id} className="text-sm">
                      <td className="px-6 py-4">{formatDate(t.transactionDate)}</td>
                      <td className="px-6 py-4 font-medium">{(t.productId as any)?.name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          t.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {t.type === 'IN' ? 'Nhập' : 'Bán'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${t.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {t.quantity > 0 ? `+${t.quantity}` : t.quantity}
                      </td>
                      <td className="px-6 py-4 text-right">{t.balanceAfter}</td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </table>
        )}
      </div>
    </div>
  );
};

export default History;
