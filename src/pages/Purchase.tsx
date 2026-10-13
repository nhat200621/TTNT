import React, { useEffect, useState } from 'react';
import { productApi, supplierApi, purchaseApi } from '../services/api';
import { Product, Supplier, Category } from '../types';
import { Save, Package, Truck, Calendar, Tag, Hash, FileText } from 'lucide-react';

const Purchase: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    productId: '',
    supplierId: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    quantityImported: 0,
    purchasePrice: 0,
    transportationCost: 0,
    expirationDate: '',
    batchNumber: `BATCH-${Date.now().toString().slice(-6)}`,
    notes: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, supRes] = await Promise.all([
          productApi.getAll(),
          supplierApi.getAll()
        ]);
        setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
        setSuppliers(Array.isArray(supRes.data) ? supRes.data : []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    const prod = products.find(p => p._id === id) || null;
    setSelectedProduct(prod);
    setFormData(prev => ({ ...prev, productId: id }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.quantityImported <= 0) {
      alert('Số lượng phải lớn hơn 0');
      return;
    }

    try {
      await purchaseApi.create(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setFormData({
        ...formData,
        productId: '',
        quantityImported: 0,
        purchasePrice: 0,
        transportationCost: 0,
        expirationDate: '',
        batchNumber: `BATCH-${Date.now().toString().slice(-6)}`,
        notes: ''
      });
      setSelectedProduct(null);
    } catch (error) {
      console.error('Error saving purchase:', error);
      alert('Lỗi khi lưu phiếu nhập hàng. Vui lòng kiểm tra lại dữ liệu.');
    }
  };

  const totalItemCost = formData.quantityImported * formData.purchasePrice;
  const totalCost = totalItemCost + Number(formData.transportationCost);
  const transportPerUnit = formData.quantityImported > 0 ? formData.transportationCost / formData.quantityImported : 0;
  const actualCostPerUnit = Number(formData.purchasePrice) + transportPerUnit;

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Nhập hàng vào kho</h2>
          <p className="text-slate-500 font-medium italic text-sm">Ghi nhận lô hàng mới và cập nhật tồn kho tự động.</p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-[1.5rem] shadow-sm flex items-center animate-in slide-in-from-top-4">
          <div className="bg-emerald-500 text-white p-2 rounded-xl mr-4">
            <Save size={20} />
          </div>
          <span className="font-bold">Nhập hàng thành công! Số lượng đã được cộng vào tồn kho và ghi nhận lô hàng.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8 space-y-6">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Package size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Thông tin sản phẩm & lô hàng</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Chọn sản phẩm *</label>
                <select
                  required
                  name="productId"
                  value={formData.productId}
                  onChange={handleProductChange}
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">-- Tìm hoặc chọn sản phẩm --</option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nhà cung cấp</label>
                <select
                  name="supplierId"
                  value={formData.supplierId}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">Chọn nhà cung cấp</option>
                  {suppliers.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Details Display (Requirement 6) */}
            {selectedProduct && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50 animate-in zoom-in-95">
                <div>
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Phân loại</p>
                  <p className="font-bold text-blue-700">{(selectedProduct.categoryId as Category)?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Đơn vị</p>
                  <p className="font-bold text-blue-700 uppercase">{selectedProduct.unit}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">HSD tiêu chuẩn</p>
                  <p className="font-bold text-blue-700">{selectedProduct.shelfLife} ngày</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Giá bán hiện tại</p>
                  <p className="font-bold text-blue-700">{new Intl.NumberFormat('vi-VN').format(selectedProduct.currentSellingPrice)}đ</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Mã lô hàng (Batch) *</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    required
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl font-mono font-bold text-slate-800"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Ghi chú nhập hàng</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Lý do nhập, tình trạng hàng..."
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Ngày nhập kho *</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="date"
                    required
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Ngày hết hạn (EXP)</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="date"
                    name="expirationDate"
                    value={formData.expirationDate}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calculations & Submit */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-8 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Truck size={20} />
              </div>
              <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Chi phí & Số lượng</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Số lượng nhập {selectedProduct ? `(${selectedProduct.unit})` : ''} *</label>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="0.01"
                  name="quantityImported"
                  value={formData.quantityImported || ''}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-black text-xl text-blue-600 focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Giá nhập (đơn giá) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  name="purchasePrice"
                  value={formData.purchasePrice || ''}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-black text-xl text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tổng phí vận chuyển (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  name="transportationCost"
                  value={formData.transportationCost || ''}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-600"
                />
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-slate-50 rounded-[2rem] p-6 space-y-3 border border-slate-100">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400 uppercase tracking-wider">Tiền hàng:</span>
                <span className="text-slate-700">{new Intl.NumberFormat('vi-VN').format(totalItemCost)} đ</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400 uppercase tracking-wider">Phí VC / đơn vị:</span>
                <span className="text-blue-500">{new Intl.NumberFormat('vi-VN').format(transportPerUnit)} đ</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold border-t border-slate-200 pt-3">
                <span className="text-slate-400 uppercase tracking-wider">Giá vốn thực tế:</span>
                <span className="text-emerald-600 font-black">{new Intl.NumberFormat('vi-VN').format(actualCostPerUnit)} đ</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-black text-slate-800 uppercase tracking-tighter">Tổng chi phí:</span>
                <span className="text-2xl font-black text-blue-600 tracking-tighter">{new Intl.NumberFormat('vi-VN').format(totalCost)} đ</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-5 bg-blue-600 text-white rounded-[1.8rem] font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center uppercase tracking-widest"
            >
              <Save size={20} className="mr-2" /> Xác nhận nhập kho
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Purchase;
