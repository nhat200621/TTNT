import React, { useEffect, useState } from 'react';
import { categoryApi } from '../services/api';
import { Category } from '../types';
import { Plus, Edit2, Trash2, Folder, X } from 'lucide-react';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
    description: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await categoryApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Chuyển đổi parentId thành null nếu chọn "Không có"
    const dataToSubmit = {
      ...formData,
      parentId: formData.parentId === '' ? null : formData.parentId
    };

    try {
      if (editingCategory) {
        await categoryApi.update(editingCategory._id, dataToSubmit);
      } else {
        await categoryApi.create(dataToSubmit);
      }
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', parentId: '', description: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Lỗi khi lưu danh mục. Vui lòng kiểm tra lại.');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      parentId: typeof category.parentId === 'object' ? category.parentId?._id || '' : category.parentId || '',
      description: category.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Xóa danh mục này có thể ảnh hưởng đến sản phẩm. Bạn có chắc chắn?')) {
      try {
        await categoryApi.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  if (loading && categories.length === 0) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Quản lý danh mục</h2>
          <p className="text-slate-500 font-medium italic text-sm">Tổ chức hàng hóa theo cấu trúc phân cấp.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); setEditingCategory(null); }}
          className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center"
        >
          <Plus size={20} className="mr-2" /> THÊM DANH MỤC
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/30">
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tên danh mục</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Danh mục cha</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mô tả</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-bold italic">Chưa có danh mục nào.</td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      <div className="p-2 bg-amber-50 text-amber-500 rounded-xl mr-3">
                        <Folder size={18} />
                      </div>
                      <span className="font-black text-slate-800">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {typeof cat.parentId === 'object' && cat.parentId ? (
                      <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {cat.parentId.name}
                      </span>
                    ) : (
                      <span className="text-slate-300 text-xs italic">Độc lập</span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm text-slate-500 line-clamp-1">{cat.description || '-'}</p>
                  </td>
                  <td className="px-8 py-5 text-right space-x-2">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handleEdit(cat)} className="p-2 hover:bg-white hover:shadow-md rounded-xl text-blue-600 transition-all">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(cat._id)} className="p-2 hover:bg-rose-50 rounded-xl text-rose-600 transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in slide-in-from-bottom-8 duration-500">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                {editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-600 transition-all shadow-sm">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tên danh mục *</label>
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Danh mục cha</label>
                <select
                  name="parentId"
                  value={formData.parentId}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Không có (Danh mục gốc)</option>
                  {categories
                    .filter(c => c._id !== editingCategory?._id)
                    .map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))
                  }
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-medium text-sm focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  rows={3}
                ></textarea>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all uppercase tracking-widest"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-2 py-4 px-12 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 uppercase tracking-widest"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  function resetForm() {
    setFormData({
      name: '',
      parentId: '',
      description: ''
    });
  }
};

export default Categories;
