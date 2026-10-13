import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import AIChatPanel from '../components/AIChatPanel';
import {
  Zap, TrendingUp, ShieldCheck, AlertCircle, Store, MapPin,
  ChevronRight, RefreshCw, BarChart3, Info, ArrowRight,
  Package, ArrowLeft, Search, Calculator, Settings, HelpCircle
} from 'lucide-react';

const AiRecommendations: React.FC = () => {
  const navigate = useNavigate();
  const [currentStore, setCurrentStore] = useState<any>(null);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [fallbackMessage, setFallbackMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [incompleteConfig, setIncompleteConfig] = useState(false);
  const [configMessage, setConfigMessage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLongerExpiryPrompt, setShowLongerExpiryPrompt] = useState(false);
  const [calculationError, setCalculationError] = useState('');

  // Form dữ liệu đầu vào (Phần 3)
  const [inputData, setInputData] = useState(() => {
    const dateOnly = (date: Date) => {
      const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      return localDate.toISOString().slice(0, 10);
    };
    const start = new Date();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return {
      expectedStartDate: dateOnly(start),
      expectedPurchasePrice: 0,
      expectedSellingPrice: 0,
      expectedTransportCost: 0,
      expectedLeadTime: 0,
      expectedExpiryDate: dateOnly(expiry)
    };
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getNewProductRecommendations();
      if (res.data.incompleteConfig) {
        setIncompleteConfig(true);
        setConfigMessage(res.data.message);
      } else {
        setIncompleteConfig(false);
        setCurrentStore(res.data.storeSettings);
        setDatasets(res.data.recommendations || []);
        setFallbackMessage(res.data.fallbackMessage || '');
      }
    } catch (err: any) {
      console.error('Lỗi tải đề xuất:', err);
      setIncompleteConfig(true);
      setConfigMessage(err.response?.data?.message || 'Không thể tải danh sách sản phẩm từ cơ sở dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCalculate = async () => {
    if (!selectedProduct) return;
    setCalculating(true);
    setCalculationError('');
    setShowLongerExpiryPrompt(false);
    try {
      const res = await analyticsApi.calculateNewProductTrial({
        datasetProductId: selectedProduct._id,
        ...inputData
      });
      setCalculationResult(res.data);
      setSelectedProduct((current: any) => ({
        ...current,
        aiIntroduction: res.data.aiIntroduction,
        aiIntroductionStatus: res.data.aiIntroductionStatus
      }));
      if (res.data.decision === 'TÌM NGUỒN HÀNG CÓ HẠN SỬ DỤNG DÀI HƠN' || res.data.expectedProfit < 0) {
        setShowLongerExpiryPrompt(true);
      }
    } catch (err: any) {
      const data = err.response?.data;
      const code = data?.code ? ` (${data.code})` : '';
      const matchDetails = data?.details?.matchedProductCount !== undefined
        ? ` Đã khớp ${data.details.matchedProductCount} sản phẩm, ${data.details.matchedPurchaseBatchCount} lô nhập và ${data.details.matchedPurchasedQuantity} đơn vị nhập trong nhóm${data.details.matchedCategoryNames?.length ? ` [${data.details.matchedCategoryNames.join(' / ')}]` : ''}.`
        : '';
      setCalculationError(`${data?.message || 'Không thể tính đề xuất lúc này. Vui lòng thử lại.'}${matchDetails}${code}`);
      if ((import.meta as any).env?.DEV) console.error('New product trial calculation failed:', { status: err.response?.status, code: data?.code, message: data?.message });
    } finally {
      setCalculating(false);
    }
  };

  const resetSelection = () => {
    setSelectedProduct(null);
    setCalculationResult(null);
    setShowLongerExpiryPrompt(false);
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center p-20 space-y-4">
      <RefreshCw className="animate-spin text-blue-600" size={40} />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">AI đang đối chiếu dữ liệu với database của cửa hàng...</p>
    </div>
  );

  if (incompleteConfig) return (
    <div className="bg-rose-50 border border-rose-100 rounded-[2.5rem] p-12 text-center max-w-2xl mx-auto my-10 shadow-sm animate-in fade-in">
      <AlertCircle className="mx-auto text-rose-500 mb-6" size={56} />
      <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">CHƯA THIẾT LẬP THÔNG TIN CỬA HÀNG</h3>
      <p className="text-slate-600 font-bold mt-3 text-sm leading-relaxed">
        {configMessage || "Vui lòng vào phần Cài đặt cửa hàng để thiết lập Loại cửa hàng và Phân loại sản phẩm trước khi sử dụng tính năng Đề xuất AI."}
      </p>
      <div className="mt-8">
        <button
          onClick={() => navigate('/settings')}
          className="px-8 py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-blue-600 transition-all"
        >
          Đi tới Cài đặt cửa hàng ngay
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* 1. Thông tin cửa hàng thiết lập sẵn (Phần 16.1 & 20) */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col lg:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 p-2 bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-bl-xl border-l border-b border-slate-50">
          Mô phỏng bối cảnh AI
        </div>
        <div className="flex items-center space-x-4 shrink-0 border-r border-slate-100 pr-8">
          <div className="p-4 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-3xl shadow-lg shadow-blue-200">
            <Store size={28} />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Loại cửa hàng</h4>
            <p className="text-xl font-black text-slate-800 tracking-tight">{currentStore?.storeType || 'Chưa cấu hình'}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
          <div className="flex items-center space-x-3">
            <MapPin className="text-blue-500 shrink-0" size={18} />
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Thành phố & Khu vực</p>
              <p className="text-xs font-bold text-slate-700">{currentStore?.city} — {currentStore?.region === 'CITY_CENTER' ? 'Trung tâm thành phố' : currentStore?.region}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <TrendingUp className="text-emerald-500 shrink-0" size={18} />
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phân loại đang kinh doanh</p>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {currentStore?.categories?.map((c: any) => (
                  <span key={c._id} className="text-[9px] font-black bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-100">{c.name}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ShieldCheck className="text-indigo-500 shrink-0" size={18} />
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quyền tham số AI</p>
              <p className="text-xs font-bold text-slate-500 italic">Hệ thống áp dụng cấu hình Admin</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="text-xs font-black bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-3 rounded-xl transition-all border border-slate-200/60 shrink-0 uppercase tracking-widest"
        >
          Thay đổi cài đặt
        </button>
      </div>

      {!selectedProduct ? (
        <>
          {fallbackMessage && <p className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">{fallbackMessage}</p>}
          {/* 2. Danh sách mặt hàng đề xuất (Phần 16.2 & 20) */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center italic">
                  <Zap className="text-yellow-500 mr-3 fill-yellow-500" size={32} />
                  ĐỀ XUẤT MẶT HÀNG MỚI
                </h2>
                <p className="text-slate-500 font-bold text-xs mt-1">
                  Hệ thống sẽ khuyến nghị các mặt hàng cùng phân loại nhưng chưa bán tại cửa hàng thông qua đối chiếu database.
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm mới..."
                  className="pl-12 pr-6 py-3.5 bg-white border border-slate-100 rounded-2xl text-xs font-bold shadow-sm w-full sm:w-72 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {datasets.length === 0 ? (
              <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-12 text-center text-slate-400 font-bold text-sm">
                Không tìm thấy mặt hàng mới nào phù hợp với danh mục đăng ký kinh doanh hiện tại của bạn.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {datasets.filter(ds => ds.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                  <div key={item._id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group flex flex-col relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        <Package size={24} />
                      </div>
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-amber-100">
                        Chưa bán tại cửa hàng
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 leading-tight mb-2 group-hover:text-blue-600 transition-colors">{item.name}</h3>
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2 py-0.5 bg-slate-100 rounded">{item.categoryId?.name}</span>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2 py-0.5 bg-slate-100 rounded">ĐVT: {item.unit}</span>
                    </div>
                    <p className="text-xs text-slate-500 font-bold line-clamp-3 mb-6 flex-1 leading-relaxed">
                      {item.description || item.features || "Thông tin chi tiết chưa có trong dataset."}
                    </p>
                    <button
                      onClick={() => setSelectedProduct(item)}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center group-hover:bg-blue-600 transition-all shadow-md"
                    >
                      XEM PHÂN TÍCH CHI TIẾT <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Khu vực phân tích chi tiết sản phẩm được lựa chọn */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-right-4 duration-500">
          <div className="lg:col-span-4 space-y-8">
            <button onClick={resetSelection} className="flex items-center text-xs font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
              <ArrowLeft size={16} className="mr-2" /> Quay lại danh sách đề xuất
            </button>

            {/* 3. Chi tiết sản phẩm từ Dataset (Phần 16.3 & 12) */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
               <div className="p-8 bg-slate-900 text-white relative overflow-hidden">
                 <ShieldCheck className="absolute -right-4 -bottom-4 text-white/5 rotate-12" size={120} />
                 <h3 className="text-2xl font-black leading-tight relative z-10">{selectedProduct.name}</h3>
                 <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mt-1 relative z-10">Phân loại: {selectedProduct.categoryId?.name}</p>
               </div>
               <div className="p-8 space-y-6">
                 <div>
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center">
                     <Zap size={12} className="mr-2 text-yellow-500 fill-yellow-500" /> Giới thiệu từ Hệ thống / Dataset
                   </h4>
                   <p className="text-xs font-bold text-slate-600 bg-slate-50 p-4 rounded-2xl leading-relaxed italic border border-slate-100">
                     "{selectedProduct.features || selectedProduct.description || "Chưa có thông tin mô tả trong dataset."}"
                   </p>
                 </div>

                 <div className="space-y-3 text-xs font-bold text-slate-700">
                    <div className="flex justify-between border-b pb-2 border-slate-50">
                      <span className="text-slate-400 font-medium">Mùa vụ sản phẩm:</span>
                      <span>{selectedProduct.seasonId?.name || "Chưa có dữ liệu"}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2 border-slate-50">
                      <span className="text-slate-400 font-medium">Điều kiện bảo quản:</span>
                      <span>{selectedProduct.storageCondition || "Chưa có dữ liệu"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Hạn sử dụng tham khảo:</span>
                      <span className="text-blue-600">{selectedProduct.shelfLifeDays != null ? `${selectedProduct.shelfLifeDays} ngày` : "Chưa có dữ liệu"}</span>
                    </div>
                 </div>
                 <div className="space-y-2 text-xs font-bold text-slate-700">
                   <div className="flex justify-between"><span className="text-slate-400">Thương hiệu:</span><span>{selectedProduct.brand || "Chưa có dữ liệu"}</span></div>
                   <div className="flex justify-between"><span className="text-slate-400">Nhà cung cấp:</span><span>{selectedProduct.supplierId?.name || "Chưa có dữ liệu"}</span></div>
                   {selectedProduct.aiIntroduction && (
                     <p className="pt-2 text-slate-500">
                       <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                         {selectedProduct.aiIntroductionStatus === 'SUCCESS' ? 'Giới thiệu bởi Cohere AI' : 'Thông tin dự phòng từ dataset'}
                       </span>
                       {selectedProduct.aiIntroduction}
                     </p>
                   )}
                 </div>
               </div>
            </div>

            {/* 4. Khu vực thu thập dữ liệu đầu vào thuật toán (Phần 16.4 & 3) */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl space-y-6 text-white">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center">
                <Calculator size={14} className="mr-2 text-blue-500" /> Dữ liệu kinh doanh thực tế
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Giá nhập dự kiến (đ)</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={inputData.expectedPurchasePrice}
                      onChange={(e) => setInputData({...inputData, expectedPurchasePrice: Math.max(0, parseInt(e.target.value) || 0)})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Giá bán dự kiến (đ)</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={inputData.expectedSellingPrice}
                      onChange={(e) => setInputData({...inputData, expectedSellingPrice: Math.max(0, parseInt(e.target.value) || 0)})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Phí vận chuyển (đ)</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={inputData.expectedTransportCost}
                      onChange={(e) => setInputData({...inputData, expectedTransportCost: Math.max(0, parseInt(e.target.value) || 0)})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Thời gian nhập (Ngày)</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      value={inputData.expectedLeadTime}
                      onChange={(e) => setInputData({...inputData, expectedLeadTime: Math.max(0, parseInt(e.target.value) || 0)})}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Ngày bắt đầu nhập thử</label>
                  <input
                    type="date"
                    className="w-full bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={inputData.expectedStartDate}
                    onChange={(e) => setInputData({...inputData, expectedStartDate: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase ml-1 text-yellow-400">Hạn sử dụng hàng dự tính nhập về *</label>
                  <input
                    type="date"
                    id="expectedExpiryDate"
                    className="w-full bg-slate-800 border-yellow-500 border rounded-xl px-4 py-3 text-sm font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={inputData.expectedExpiryDate}
                    onChange={(e) => setInputData({...inputData, expectedExpiryDate: e.target.value})}
                  />
                </div>
              </div>
              <button
                onClick={handleCalculate}
                disabled={calculating}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center disabled:bg-slate-600"
              >
                {calculating ? <RefreshCw className="animate-spin mr-2" size={16} /> : <Zap className="mr-2" size={16} />}
                CHẠY THUẬT TOÁN ĐỀ XUẤT
              </button>
              {calculationError && (
                <div role="alert" className="rounded-xl border border-rose-300 bg-rose-950/40 px-4 py-3 text-sm font-bold text-rose-200">
                  {calculationError}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-8">
            {/* 5. Kết quả thuật toán & Snapshots (Phần 16.5 & 13) */}
            {calculationResult ? (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tham số hệ thống từ Admin (Chỉ đọc) */}
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
                        <Settings size={14} className="mr-2" /> Tham số cấu hình (Chỉ đọc)
                      </h4>
                      <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Từ Admin</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 text-center mb-6">
                      {['X', 'Y', 'Z', 'W', 'V'].map(p => (
                        <div key={p} className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <p className="text-[9px] font-black text-slate-400 mb-0.5">{p}</p>
                          <p className="text-xs font-black text-slate-800">{calculationResult[p]?.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                         <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Hệ số rủi ro (R)</span>
                         <span className="text-sm font-black text-slate-800">{calculationResult.R?.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3.5 bg-blue-600 rounded-xl shadow-lg shadow-blue-100 text-white">
                         <span className="text-[9px] font-black uppercase tracking-widest">THAM SỐ TỔNG (R²)</span>
                         <span className="text-base font-black">{calculationResult.THAM_SO?.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Chỉ số kinh doanh cùng loại tổng hợp */}
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center">
                      <BarChart3 size={14} className="mr-2 text-indigo-500" /> Tổng hợp nhóm {selectedProduct.categoryId?.name}
                    </h4>
                    <div className="space-y-3.5 text-xs font-bold text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Ngày dữ liệu nhóm hàng:</span>
                        <span className="text-slate-800">{calculationResult.categorySalesDays} ngày</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Đã bán / đã nhập:</span>
                        <span className="text-slate-800">{calculationResult.sameCategorySold} / {calculationResult.sameCategoryPurchased} {selectedProduct.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Tỉ lệ bán tích lũy:</span>
                        <span className="text-slate-800">{(calculationResult.soldRatio * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Tỉ lệ bán trung bình:</span>
                        <span className="text-slate-800">{(calculationResult.dailySoldRate * 100).toFixed(2)}%/ngày</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Tồn kho hiện tại:</span>
                        <span className="text-slate-800">{calculationResult.sameCategoryInventory} {selectedProduct.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Dự kiến bán hết tồn kho hiện tại:</span>
                        <span className="text-slate-800">{calculationResult.daysToSellRemainingStock?.toFixed(1)} ngày</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-50 pt-3">
                        <span className="text-slate-500 font-black">Số ngày an toàn cho lô mới (sau thời gian nhập):</span>
                        <span className={`text-base font-black ${calculationResult.daysAvailableForTrial > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {calculationResult.daysAvailableForTrial} ngày
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kết luận và logic lựa chọn đặc biệt (Phần 13) */}
                <div className={`rounded-[3rem] p-8 border-4 shadow-xl ${
                  calculationResult.decision === 'NÊN NHẬP THỬ' ? 'bg-emerald-50/60 border-emerald-100' :
                  calculationResult.decision === 'TÌM NGUỒN HÀNG CÓ HẠN SỬ DỤNG DÀI HƠN' ? 'bg-amber-50/60 border-amber-100' :
                  'bg-rose-50/60 border-rose-100'
                }`}>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 space-y-3 text-center md:text-left">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-white rounded-md shadow-sm text-slate-500 border border-slate-100">Kết luận đề xuất</span>
                      <h3 className={`text-3xl font-black tracking-tighter ${
                        calculationResult.decision === 'NÊN NHẬP THỬ' ? 'text-emerald-700' :
                        calculationResult.decision === 'TÌM NGUỒN HÀNG CÓ HẠN SỬ DỤNG DÀI HƠN' ? 'text-amber-700' :
                        'text-rose-700'
                      }`}>
                        {calculationResult.decision}
                      </h3>
                      <p className="text-xs font-bold text-slate-600 leading-relaxed">
                        <span className="block text-[9px] uppercase tracking-widest text-slate-400 mb-1">{calculationResult.aiExplanationSource === 'cohere_ai' ? 'Phân tích và giải thích bởi Cohere AI' : 'Kết quả dự phòng từ thuật toán hệ thống'}</span>
                        {calculationResult.aiExplanation || `Theo kết quả thuật toán, ${calculationResult.decision.toLowerCase()}; lợi nhuận dự tính ${new Intl.NumberFormat('vi-VN').format(calculationResult.expectedProfit)}đ.`}
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-[2rem] shadow-md border border-emerald-100 text-center min-w-[180px]">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Số lượng đề xuất</p>
                        <p className="text-3xl font-black text-emerald-600 tracking-tighter">{calculationResult.recommendedQuantity}</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase">{selectedProduct.unit}</p>
                        <div className="mt-3 pt-3 border-t border-slate-50">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Lợi nhuận dự tính</p>
                           <p className="text-lg font-black text-slate-800">{new Intl.NumberFormat('vi-VN').format(calculationResult.expectedProfit)}đ</p>
                        </div>
                    </div>
                  </div>

                  {/* Phần 13: Hiển thị 2 lựa chọn khi lợi nhuận dự tính <= 0 hoặc yêu cầu date dài hơn */}
                  {showLongerExpiryPrompt && (
                    <div className="mt-6 p-6 bg-white rounded-2xl border border-amber-200 space-y-4 animate-in fade-in">
                      <div className="flex items-start space-x-3">
                        <HelpCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                        <div>
                          <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider">Hành động khả thi đề xuất</h5>
                          <p className="text-slate-500 text-xs font-bold mt-0.5">Lợi nhuận dự tính hiện tại không đạt tối ưu hoặc âm. Vui lòng chọn 1 trong 2 hướng đi:</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                          onClick={() => {
                            alert("Đã ghi nhận lựa chọn: Không nhập thử mặt hàng này.");
                            resetSelection();
                          }}
                          className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                        >
                          1. Không nhập thử mặt hàng này
                        </button>
                        <button
                          onClick={() => {
                            const expiryInput = document.getElementById('expectedExpiryDate');
                            if (expiryInput) (expiryInput as HTMLInputElement).focus();
                            alert("Vui lòng thay đổi 'Hạn sử dụng hàng dự tính nhập về' ở khung dữ liệu bên trái và nhấn chạy lại thuật toán.");
                          }}
                          className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md"
                        >
                          2. Tìm nguồn hàng có hạn sử dụng dài hơn
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4 border-2 border-dashed border-slate-100 rounded-[3rem] p-20 bg-slate-50/50">
                <Calculator size={64} className="opacity-20" />
                <p className="font-black uppercase tracking-widest text-xs tracking-wider">Nhấn nút bên trái để chạy thuật toán AI phân tích dữ liệu</p>
              </div>
            )}
          </div>
        </div>
      )}
      <AIChatPanel
        pageContext="ai-recommendations"
        title={selectedProduct ? `Hỏi về ${selectedProduct.name}` : 'Hỏi trợ lý về Đề xuất AI'}
        context={{
          datasetProductId: selectedProduct?._id,
          trialInput: calculationResult ? inputData : undefined
        }}
        suggestions={calculationResult ? ['Vì sao có kết luận này?', 'Giải thích các hệ số X, Y, Z, W, V và R.', 'Hạn sử dụng ảnh hưởng thế nào?'] : ['Cách dùng chức năng Đề xuất AI?', 'Cần nhập dữ liệu nào để phân tích?']}
      />
    </div>
  );
};

export default AiRecommendations;
