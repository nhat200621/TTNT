import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import {
  Plus, Edit2, Save, X, Trash2,
  Store, AlertCircle, Search,
  CheckCircle2, Ban, Info
} from 'lucide-react';

interface StoreType {
  _id: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  storeCount: number;
  notes?: string;
}

const AdminStoreTypes: React.FC = () => {
  const [storeTypes, setStoreTypes] = useState<StoreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState<StoreType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true,
    notes: ''
  });

  const fetchStoreTypes = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getStoreTypes();
      setStoreTypes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreTypes();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      isActive: true,
      notes: ''
    });
  };

  const handleEdit = (type: StoreType) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      code: type.code,
      description: type.description || '',
      isActive: type.isActive,
      notes: type.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingType) {
        await adminApi.updateStoreType(editingType._id, formData);
      } else {
        await adminApi.createStoreType(formData);
      }
      setShowModal(false);
      fetchStoreTypes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi lưu dữ liệu');
    }
  };

  const handleDelete = async (type: StoreType) => {
    if (type.storeCount > 0) {
      alert(`Loại cửa hàng này đang được sử dụng bởi ${type.storeCount} cửa hàng. Bạn không thể xóa dữ liệu này. Hãy sử dụng chức năng Vô hiệu hóa.`);
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa loại cửa hàng "${type.name}"?`)) {
      try {
        await adminApi.deleteStoreType(type._id);
        fetchStoreTypes();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Lỗi khi xóa');
      }
    }
  };

  const filteredTypes = storeTypes.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center uppercase">
            <Store className="mr-3 text-rose-600" size={32} />
            Quản lý Loại Cửa Hàng
          </h2>
          <p className="text-slate-500 font-medium mt-1 italic text-sm">Quản lý danh mục các loại hình kinh doanh trong hệ thống.</p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingType(null); setShowModal(true); }}
          className="px-6 py-3 bg-rose-600 text-white rounded-2xl font-black text-sm hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 flex items-center"
        >
          <Plus size={20} className="mr-2" /> THÊM LOẠI CỬA HÀNG
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] flex items-start space-x-4">
        <Info className="text-blue-600 shrink-0" size={24} />
        <div className="text-sm text-blue-800 font-medium">
          <p className="font-black uppercase text-xs mb-1">Lưu ý kiến trúc:</p>
          Trang này chỉ quản lý danh sách các loại cửa hàng. Để cấu hình <strong>Tham số X</strong> cho từng loại cửa hàng phục vụ thuật toán AI, vui lòng truy cập mục <strong>Cấu hình AI &rarr; Loại cửa hàng (X)</strong>.
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Danh sách loại hình kinh doanh</h3>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-rose-500 transition-all outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-20 flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/30">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Loại Cửa Hàng</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mã định danh</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Số Cửa hàng</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTypes.map((type) => (
                  <tr key={type._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div>
                        <p className="font-black text-slate-800 text-base">{type.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 italic">{type.description || 'Chưa có mô tả'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-slate-100 rounded-lg font-mono text-xs font-black text-slate-600 uppercase tracking-tighter">
                        {type.code}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 border border-slate-100 font-black text-slate-700">
                        {type.storeCount}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                        type.isActive
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}>
                        {type.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => handleEdit(type)}
                          className="p-2.5 bg-white shadow-sm border border-slate-100 rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all scale-95 hover:scale-105"
                          title="Sửa thông tin"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(type)}
                          className="p-2.5 bg-white shadow-sm border border-slate-100 rounded-xl text-rose-600 hover:bg-rose-600 hover:text-white transition-all scale-95 hover:scale-105"
                          title="Xóa loại cửa hàng"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-in slide-in-from-bottom-8 duration-500">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                  {editingType ? 'Cập nhật Loại Cửa Hàng' : 'Thêm Loại Cửa Hàng Mới'}
                </h3>
                <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mt-1">Quản lý Entity</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-600 transition-all shadow-sm"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tên loại cửa hàng *</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ví dụ: Cửa hàng trái cây"
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-rose-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Mã loại (Duy nhất) *</label>
                  <input
                    required
                    disabled={!!editingType}
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="FRUIT_STORE"
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-mono text-base font-black text-slate-600 focus:ring-2 focus:ring-rose-500 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Mô tả loại hình</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  placeholder="Mô tả tóm tắt đặc điểm kinh doanh của loại cửa hàng này..."
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-medium text-sm focus:ring-2 focus:ring-rose-500 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="flex items-center">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${formData.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-500'}`}>
                      {formData.isActive ? <CheckCircle2 size={24} /> : <Ban size={24} />}
                   </div>
                   <div className="ml-4">
                      <p className="text-sm font-black text-slate-700 uppercase tracking-tight">Trạng thái hoạt động</p>
                      <p className="text-[10px] font-bold text-slate-400">Cho phép các cửa hàng đăng ký loại hình này</p>
                   </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-3xl font-black text-sm hover:bg-slate-200 transition-all uppercase tracking-widest"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-2 py-5 px-12 bg-rose-600 text-white rounded-3xl font-black text-sm hover:bg-rose-700 transition-all shadow-2xl shadow-rose-600/30 uppercase tracking-widest flex items-center justify-center"
                >
                  <Save size={18} className="mr-2" /> XÁC NHẬN LƯU DỮ LIỆU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStoreTypes;
