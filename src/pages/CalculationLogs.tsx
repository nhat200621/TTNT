import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import { ClipboardList, Search, Info } from 'lucide-react';

const CalculationLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getLogs();
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatDate = (date: string) => new Date(date).toLocaleString('vi-VN');

  if (loading) return <div>Đang tải nhật ký...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center">
          <ClipboardList className="mr-2 text-red-600" /> Nhật ký tính toán thuật toán
        </h2>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Tìm theo sản phẩm..."
            className="w-full pl-3 pr-10 py-2 border rounded-lg dark:bg-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 uppercase font-bold">
            <tr>
              <th className="px-6 py-3">Thời gian</th>
              <th className="px-6 py-3">Sản phẩm</th>
              <th className="px-6 py-3">Khuyến nghị</th>
              <th className="px-6 py-3">Số lượng</th>
              <th className="px-6 py-3">Base Factor</th>
              <th className="px-6 py-3">Lợi nhuận dự kiến</th>
              <th className="px-6 py-3 text-right">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {logs.map((log) => (
              <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                <td className="px-6 py-4 font-medium">{log.productId?.name || 'N/A'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    log.recommendation === 'REORDER' ? 'bg-green-100 text-green-700' :
                    log.recommendation === 'HOLD' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {log.recommendation}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold">{log.recommendedQuantity}</td>
                <td className="px-6 py-4 font-mono">{log.calculatedMetrics.baseFactor.toFixed(4)}</td>
                <td className="px-6 py-4">{new Intl.NumberFormat('vi-VN').format(log.calculatedMetrics.expectedProfit)}đ</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-blue-600"><Info size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CalculationLogs;
