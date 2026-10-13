import React, { useEffect, useState } from 'react';
import { dashboardApi } from '../services/api';
import { DashboardStats } from '../types';
import {
  Package,
  Database,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  ChevronRight
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In a real app, the store ID would come from a context/auth
        const response = await dashboardApi.getStats();
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  if (loading) return <div className="flex justify-center items-center h-full">Đang tải...</div>;

  const statCards = [
    {
      label: 'Tổng sản phẩm',
      value: stats?.totalProducts || 0,
      unit: 'sản phẩm',
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      label: 'Tổng tồn kho',
      value: stats?.totalInventoryQuantity.toLocaleString() || 0,
      unit: 'đơn vị',
      icon: Database,
      color: 'bg-green-500'
    },
    {
      label: 'Giá trị hàng tồn',
      value: formatCurrency(stats?.totalInventoryValue || 0),
      unit: '',
      icon: DollarSign,
      color: 'bg-amber-500'
    },
    {
      label: 'Tổng doanh thu',
      value: formatCurrency(stats?.totalRevenue || 0),
      unit: '',
      icon: TrendingUp,
      color: 'bg-indigo-500'
    },
    {
      label: 'Sắp hết hàng',
      value: stats?.lowStockCount || 0,
      unit: 'sản phẩm',
      icon: AlertTriangle,
      color: 'bg-red-500'
    },
    {
      label: 'Sắp hết hạn',
      value: stats?.expiringSoonCount || 0,
      unit: 'lô hàng',
      icon: Clock,
      color: 'bg-orange-500'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                <stat.icon size={24} />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
              <p className="text-sm text-gray-500">{stat.unit}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placeholder for Charts */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 min-h-[300px] flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Doanh thu theo ngày</h3>
          <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-gray-400">Biểu đồ sẽ được hiển thị ở đây (Sử dụng Recharts)</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Cảnh báo tồn kho</h3>
            <button className="text-blue-600 hover:underline text-sm flex items-center">
              Xem tất cả <ChevronRight size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {stats?.lowStockCount === 0 ? (
              <p className="text-center text-gray-500 py-8">Không có cảnh báo nào.</p>
            ) : (
              <div className="text-gray-500 text-center py-8">
                Có {stats?.lowStockCount} sản phẩm sắp hết hàng.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
