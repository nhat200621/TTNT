import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi, categoryApi, supplierApi, adminApi } from '../services/api';
import { Plus, Edit2, Trash2, Search, Zap, Info, CloudSun, X as CloseIcon, Settings, Tags } from 'lucide-react';
import { Product, Category, Supplier, SeasonalProductData } from '../types';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [seasons, setSeasons] = useState<SeasonalProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState<any>({
    name: '',
    categoryId: '',
    subcategoryId: '',
    unit: 'kg',
    barcode: '',
    brand: '',
    supplierId: '',
    description: '',
    shelfLife: 0,
    expectedLeadTime: 0,
    currentSellingPrice: 0,
    status: 'ACTIVE' as const,
    seasonConfigMode: 'CATEGORY_DEFAULT' as const,
    seasonId: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, supRes, seasonRes] = await Promise.all([
        productApi.getAll(),
        categoryApi.getAll(),
        supplierApi.getAll(),
        adminApi.getSeasons()
      ]);

      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
      setSuppliers(Array.isArray(supRes.data) ? supRes.data : []);
      setSeasons(Array.isArray(seasonRes.data) ? seasonRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
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

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'CATEGORY_DEFAULT' || val === 'GLOBAL') {
      setFormData(prev => ({ ...prev, seasonConfigMode: val as any, seasonId: '' }));
    } else {
      setFormData(prev => ({ ...prev, seasonConfigMode: 'SPECIFIC_SEASON', seasonId: val }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Dọn dẹp dữ liệu: Chuyển chuỗi rỗng thành null để Backend không bị lỗi validation ObjectId
      const dataToSubmit = {
        ...formData,
        categoryId: formData.categoryId || null,
        subcategoryId: formData.subcategoryId || null,
        supplierId: formData.supplierId || null,
        seasonId: formData.seasonConfigMode === 'SPECIFIC_SEASON' ? (formData.seasonId || null) : null
      };

      if (editingProduct) {
        await productApi.update(editingProduct._id, dataToSubmit);
      } else {
        await productApi.create(dataToSubmit);
      }

      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Save Product Error:', error.response?.data || error);
      alert(error.response?.data?.message || 'Lỗi khi lưu sản phẩm. Vui lòng kiểm tra lại các trường bắt buộc.');
    }
  };

  const getId = (field: any) => {
    if (!field) return '';
    return typeof field === 'object' ? field._id : field;
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      categoryId: getId(product.categoryId),
      subcategoryId: getId(product.subcategoryId),
      unit: product.unit || 'kg',
      barcode: product.barcode || '',
      brand: product.brand || '',
      supplierId: getId(product.supplierId),
      description: product.description || '',
      shelfLife: product.shelfLife || 0,
      expectedLeadTime: product.expectedLeadTime ?? 0,
      currentSellingPrice: product.currentSellingPrice || 0,
      status: product.status || 'ACTIVE',
      seasonConfigMode: product.seasonConfigMode || 'CATEGORY_DEFAULT',
      seasonId: getId(product.seasonId)
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      categoryId: '',
      subcategoryId: '',
      unit: 'kg',
      barcode: '',
      brand: '',
      supplierId: '',
      description: '',
      shelfLife: 0,
      expectedLeadTime: 0,
      currentSellingPrice: 0,
      status: 'ACTIVE',
      seasonConfigMode: 'CATEGORY_DEFAULT',
      seasonId: ''
    });
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Quản lý sản phẩm</h2>
          <p className="text-slate-500 font-medium italic text-sm">Quản lý danh mục hàng hóa và cấu hình AI cho từng mặt hàng.</p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingProduct(null); setShowModal(true); }}
          className="px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center active:scale-95"
        >
          <Plus size={20} className="mr-2" /> THÊM SẢN PHẨM
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30">
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tên sản phẩm</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Phân loại</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cấu hình Mùa (Z)</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Giá bán</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="font-black text-slate-800 text-lg tracking-tight">{product.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-widest">Unit: {product.unit}</div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center text-xs font-black text-blue-600 uppercase tracking-tighter">
                      <Tags size={14} className="mr-1.5" />
                      {(product.categoryId as Category)?.name || 'Chưa phân loại'}
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border ${
                      product.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      product.status === 'TRIAL' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      'bg-slate-50 text-slate-400 border-slate-200'
                    }`}>
                      {product.status}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-sm font-bold text-slate-600 italic">
                    {product.seasonConfigMode === 'CATEGORY_DEFAULT' && <span className="text-slate-400">Theo danh mục (Auto)</span>}
                    {product.seasonConfigMode === 'GLOBAL' && <span className="text-amber-600">Toàn cầu</span>}
                    {product.seasonConfigMode === 'SPECIFIC_SEASON' && (
                      <div className="flex items-center text-blue-600">
                        <CloudSun size={14} className="mr-1" />
                        {(product.seasonId as SeasonalProductData)?.name || 'Mùa cụ thể'}
                      </div>
                    )}
                  </td>
                  <td className="px-10 py-6 text-right font-black text-slate-900 tracking-tighter text-xl">
                    {new Intl.NumberFormat('vi-VN').format(product.currentSellingPrice || 0)}đ
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                      <Link to={`/products/${product._id}/analytics`} className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg hover:scale-105 transition-all">
                        <Zap size={18} />
                      </Link>
                      <button onClick={() => handleEdit(product)} className="p-2.5 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                        <Edit2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
                {editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-600 transition-all shadow-sm">
                <CloseIcon size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tên sản phẩm *</label>
                  <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Trạng thái</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800">
                    <option value="ACTIVE">ACTIVE (Đang bán)</option>
                    <option value="TRIAL">TRIAL (Bán thử)</option>
                    <option value="INACTIVE">INACTIVE (Ngừng bán)</option>
                    <option value="DISCONTINUED">DISCONTINUED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] ml-1 flex items-center">
                  <CloudSun size={14} className="mr-1" /> Cấu hình mùa vụ (Z Parameter)
                </label>
                <select
                  name="seasonSelection"
                  value={formData.seasonConfigMode === 'SPECIFIC_SEASON' ? formData.seasonId : formData.seasonConfigMode}
                  onChange={handleSeasonChange}
                  className="w-full px-5 py-4 bg-amber-50/50 border-none rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
                >
                  <option value="CATEGORY_DEFAULT">Tính theo danh mục (Mặc định)</option>
                  <option value="GLOBAL">(Toàn cầu)</option>
                  {seasons.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Phân loại (Category) *</label>
                  <select required name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800">
                    <option value="">Chọn danh mục...</option>
                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Đơn vị tính *</label>
                  <input required name="unit" value={formData.unit} onChange={handleInputChange} placeholder="kg, cái, hộp..." className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Hạn sử dụng tối đa (ngày)</label>
                  <input type="number" name="shelfLife" value={formData.shelfLife} onChange={handleInputChange} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Giá bán hiện tại (VND)</label>
                  <input type="number" name="currentSellingPrice" value={formData.currentSellingPrice} onChange={handleInputChange} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-blue-600" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Thời gian nhà cung cấp giao hàng (ngày) *</label>
                <input required min="0" type="number" name="expectedLeadTime" value={formData.expectedLeadTime} onChange={handleInputChange} className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800" />
              </div>

              <div className="flex space-x-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest">Hủy</button>
                <button type="submit" className="flex-2 py-4 px-12 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase shadow-xl shadow-blue-600/20 tracking-widest">
                   {editingProduct ? 'XÁC NHẬN CẬP NHẬT' : 'LƯU SẢN PHẨM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
