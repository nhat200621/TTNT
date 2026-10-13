import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { analyticsApi } from '../services/api';
import AIChatPanel from '../components/AIChatPanel';
import {
  ArrowLeft, Zap, AlertTriangle, TrendingUp,
  MapPin, Store, Info, RefreshCw, BarChart3,
  Calendar, ShieldCheck, CalendarDays, HelpCircle
} from 'lucide-react';

const ProductAnalytics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Custom new expiry date state for "Find a supplier with a longer expiry date" choice
  const [customExpiryDate, setCustomExpiryDate] = useState<string>('');
  const [showExpiryInput, setShowExpiryInput] = useState<boolean>(false);

  const fetchAnalytics = async (expiryOverride?: string) => {
    if (!id) return;
    setIsRecalculating(true);
    try {
      const res = await analyticsApi.getProductAnalytics(id, expiryOverride || undefined);
      setData(res.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching product analytics:', err);
      setError(err.response?.data?.message || 'Store configuration is incomplete or missing required data.');
    } finally {
      setLoading(false);
      setIsRecalculating(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [id]);

  function handleExpiryRecalculate(e: React.FormEvent) {
    e.preventDefault();
    if (!customExpiryDate) {
      alert('Vui lòng chọn ngày hết hạn mới.');
      return;
    }
    fetchAnalytics(customExpiryDate);
  }

  if (loading && !data) return (
    <div className="flex flex-col justify-center items-center p-20 space-y-4">
      <RefreshCw className="animate-spin text-blue-600" size={40} />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">AI đang tính toán phân tích chu kỳ nhập hàng thực tế...</p>
    </div>
  );

  if (error) {
    const isStoreConfigError = error.includes('Store configuration') || error.includes('configure Store');
    return (
      <div className="bg-rose-50 border border-rose-100 rounded-[2.5rem] p-12 text-center max-w-2xl mx-auto my-10 shadow-sm animate-in fade-in">
        <AlertTriangle className="mx-auto text-rose-500 mb-6" size={56} />
        <h3 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">THIẾU CẤU HÌNH THAM SỐ AI</h3>
        <p className="text-slate-600 font-bold mt-3 text-sm leading-relaxed">{error}</p>
        {error.toLowerCase().includes('expected purchase expiry') && (
          <form onSubmit={handleExpiryRecalculate} className="mt-6 max-w-md mx-auto space-y-3 text-left">
            <label className="block text-xs font-bold text-slate-600">Ngày hết hạn dự kiến của lô hàng mới</label>
            <input
              type="date"
              required
              min={new Date().toISOString().slice(0, 10)}
              value={customExpiryDate}
              onChange={e => setCustomExpiryDate(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold"
            />
            <button type="submit" className="w-full px-6 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-700">
              TÍNH TOÁN VỚI NGÀY HẾT HẠN NÀY
            </button>
          </form>
        )}
        <div className="mt-8 flex gap-4 justify-center">
          <Link to="/products" className="px-6 py-3 bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-300 transition-all">
            Quay lại sản phẩm
          </Link>
          {isStoreConfigError && (
            <button
              onClick={() => navigate('/settings')}
              className="px-6 py-3 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-all shadow-md"
            >
              Đi tới Cài đặt cửa hàng
            </button>
          )}
        </div>
      </div>
    );
  }

  const getRecommendationStyle = () => {
    if (!data) return '';
    switch (data.recommendation) {
      case 'REORDER': return 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-emerald-200';
      case 'HOLD': return 'bg-gradient-to-tr from-blue-500 to-indigo-600 text-white shadow-blue-200';
      case 'DO_NOT_REORDER': return 'bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-rose-200';
      default: return 'bg-slate-500 text-white shadow-slate-200';
    }
  };

  const getRecommendationLabel = () => {
    if (!data) return '';
    switch (data.recommendation) {
      case 'REORDER': return 'NÊN NHẬP THÊM';
      case 'HOLD': return 'DUY TRÌ THEO DÕI';
      case 'DO_NOT_REORDER': return 'KHÔNG NÊN NHẬP THÊM';
      default: return data.recommendation;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
      {/* Top navigation */}
      <div className="flex justify-between items-center">
        <Link to="/products" className="flex items-center text-slate-400 hover:text-blue-600 font-bold text-sm transition-all group">
          <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 mr-3 group-hover:bg-blue-50 transition-colors">
            <ArrowLeft size={18} />
          </div>
          QUAY LẠI DANH SÁCH SẢN PHẨM
        </Link>
        {isRecalculating && (
          <div className="flex items-center text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 animate-pulse">
            <RefreshCw size={12} className="mr-2 animate-spin" /> AI ĐANG TÍNH TOÁN LẠI THEO THAM SỐ THỜI GIAN THỰC...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar: Actual Config Context from Database (Single Source of Truth) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 p-1.5 bg-indigo-50 text-indigo-600 text-[8px] font-black uppercase tracking-widest rounded-bl-lg border-l border-b border-slate-50">
              Đồng bộ hệ thống
            </div>

            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Store size={18} />
              </div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Cửa hàng hiện tại</h3>
            </div>

            <div className="space-y-4 text-xs font-bold text-slate-700">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100/60">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Loại cửa hàng</p>
                <p className="text-slate-800 font-black">{data?.storeTypeName}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100/60">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Thành phố</p>
                <p className="text-slate-800 font-black">{data?.city}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100/60">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Khu vực kinh doanh</p>
                <p className="text-slate-800 font-black">
                  {data?.areaType === 'CITY_CENTER' ? 'Trung tâm thành phố' : data?.areaType === 'SUBURBAN' ? 'Ngoại ô' : data?.areaType === 'RURAL' ? 'Nông thôn' : data?.areaType}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100/60">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Mùa vụ hiện tại</p>
                <p className="text-slate-800 font-black flex items-center gap-1.5">
                  <CalendarDays size={12} className="text-amber-500" />
                  {data?.zDetails?.currentSeasonName || 'Trong mùa chính'}
                </p>
              </div>
            </div>
          </div>

          {/* AI Parameter Snapshot from Admin Configuration */}
          {data && data.factors && (
            <div className="bg-slate-900 rounded-[2.5rem] p-8 space-y-5 shadow-2xl text-white">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-slate-800 text-blue-400 rounded-xl">
                  <ShieldCheck size={18} />
                </div>
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider">Bộ tham số chuẩn Admin</h3>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-[10px] text-slate-400 font-black">Hệ số X (Cửa hàng)</span>
                  <span className="text-blue-400 font-black">{data.factors.X?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-[10px] text-slate-400 font-black">Hệ số Y (Phân loại)</span>
                  <span className="text-blue-400 font-black">{data.factors.Y?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-[10px] text-slate-400 font-black">Hệ số Z (Mùa vụ)</span>
                  <span className="text-blue-400 font-black">{data.factors.Z?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-[10px] text-slate-400 font-black">Hệ số W (Thành phố)</span>
                  <span className="text-blue-400 font-black">{data.factors.W?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-800">
                  <span className="text-[10px] text-slate-400 font-black">Hệ số V (Khu vực)</span>
                  <span className="text-blue-400 font-black">{data.factors.V?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-3">
                  <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Hệ số tổng hợp</span>
                  <span className="text-2xl text-emerald-400 font-black tracking-tighter">{data.factors.baseFactor?.toFixed(4)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content: Deterministic Algorithm Output */}
        <div className="lg:col-span-3 space-y-8">
           {data && (
             <>
               {/* Suggestion Card */}
               <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden group">
                  <div className="p-10 flex flex-col md:flex-row items-center gap-10">
                    <div className={`w-28 h-28 rounded-[2rem] flex items-center justify-center shrink-0 shadow-xl group-hover:scale-105 transition-transform ${getRecommendationStyle()}`}>
                       <Zap size={44} className="fill-white" />
                    </div>
                    <div className="flex-1 space-y-3.5 text-center md:text-left">
                      <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quyết định thuật toán</span>
                        <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${data.recommendation === 'REORDER' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                          {getRecommendationLabel()}
                        </div>
                      </div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-relaxed italic">
                        "{data.aiExplanation || 'Hệ thống đang tải nội dung giải thích chi tiết từ mô hình dữ liệu...'}"
                      </h2>
                      <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400">
                        {data.aiSource === 'cohere_ai' ? 'Phân tích và giải thích bởi Cohere AI' : 'Kết quả dự phòng từ thuật toán hệ thống'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 border-t border-slate-50 bg-slate-50/50 text-slate-700">
                    <div className="p-6 text-center border-r border-slate-100">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Số lượng đề xuất</p>
                       <p className="text-2xl font-black text-blue-600 tracking-tight">{data.recommendedQuantity} <span className="text-xs uppercase font-bold text-slate-400">{data.unit}</span></p>
                    </div>
                    <div className="p-6 text-center border-r border-slate-100">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tốc độ bán trung bình</p>
                       <p className="text-2xl font-black text-slate-800 tracking-tight">{data.metrics?.salesVelocity?.toFixed(2)} <span className="text-xs uppercase font-bold text-slate-400">{data.unit}/ngày</span></p>
                    </div>
                    <div className="p-6 text-center border-r border-slate-100">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Dự kiến bán hết tồn</p>
                       <p className="text-2xl font-black text-amber-600 tracking-tight">
                         {data.metrics?.inventoryDays === Infinity ? '∞' : data.metrics?.inventoryDays?.toFixed(1)}
                         <span className="text-xs uppercase font-bold text-slate-400"> ngày</span>
                       </p>
                    </div>
                    <div className="p-6 text-center">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Lợi nhuận dự tính</p>
                       <p className="text-2xl font-black text-emerald-600 tracking-tight">{new Intl.NumberFormat('vi-VN').format(data.metrics?.expectedProfit || 0)}đ</p>
                    </div>
                  </div>
               </div>

               {/* Metrics & Warning Display */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-[2rem] border border-slate-100 p-8 space-y-6 shadow-sm">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center">
                       <TrendingUp className="text-blue-600 mr-2.5" size={18} /> Chỉ số tiêu thụ thực tế
                    </h3>
                    <div className="space-y-1">
                      <MetricRow label="Tỷ lệ bán hết (STR)" value={`${((data.metrics?.sellThroughRate || 0) * 100).toFixed(1)}%`} />
                      <MetricRow label="Số ngày đã bán" value={`${data.metrics?.daysSold ?? 0} ngày`} />
                      <MetricRow label="Tỷ lệ bán trung bình mỗi ngày" value={`${((data.metrics?.averageDailySoldRatio || 0) * 100).toFixed(2)}%/ngày`} />
                      <MetricRow label="Biên lợi nhuận gộp" value={`${((data.metrics?.profitMargin || 0) * 100).toFixed(1)}%`} color="text-emerald-600" />
                      <MetricRow label="Lợi nhuận đơn vị sản phẩm" value={`${new Intl.NumberFormat('vi-VN').format(data.metrics?.profitPerUnit || 0)}đ`} />
                      <MetricRow label="Tỷ lệ tồn kho hiện tại" value={`${((data.metrics?.inventoryRate || 0) * 100).toFixed(1)}%`} />
                      <MetricRow label="Ngày còn đến hạn lô mới" value={`${data.metrics?.availableCalendarDays ?? 0} ngày`} />
                      <MetricRow label="Lead time nhập hàng" value={`${data.inputSnapshot?.expectedLeadTime ?? 0} ngày`} />
                      <MetricRow label="Số lượng dùng để tính" value={`${data.recommendedQuantity} ${data.unit} (dư địa ${data.metrics?.quantityMultiplier ?? 0} ngày)`} />
                      {data.inputSnapshot?.expectedNewPurchaseExpiry && <MetricRow label="Hạn lô hàng mới" value={new Intl.DateTimeFormat('vi-VN').format(new Date(data.inputSnapshot.expectedNewPurchaseExpiry))} />}
                      <MetricRow label="Giá nhập / giá bán" value={`${new Intl.NumberFormat('vi-VN').format(data.inputSnapshot?.purchasePrice || 0)}đ / ${new Intl.NumberFormat('vi-VN').format(data.inputSnapshot?.sellingPrice || 0)}đ`} />
                      <MetricRow label="Phí vận chuyển" value={`${new Intl.NumberFormat('vi-VN').format(data.inputSnapshot?.transportCost || 0)}đ`} />
                    </div>
                  </div>

                  <div className="bg-white rounded-[2rem] border border-slate-100 p-8 space-y-6 shadow-sm">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center">
                       <Info className="text-indigo-500 mr-2.5" size={18} /> Cơ sở dữ liệu phân tích
                    </h3>
                    <div className="space-y-4">
                      {data.reasons?.map((reason: string, i: number) => (
                        <div key={i} className="flex items-start text-xs font-bold text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 mr-2.5 shrink-0"></div>
                          <span className="leading-relaxed">{reason}</span>
                        </div>
                      ))}
                      {data.warnings?.map((warning: string, i: number) => (
                        <div key={i} className="flex items-start p-4 bg-rose-50 rounded-xl border border-rose-100/60 text-xs font-black text-rose-700">
                          <AlertTriangle className="text-rose-500 mr-2.5 shrink-0 mt-0.5" size={14} />
                          <span className="leading-relaxed">{warning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>

               {/* Section 8: Interactive longer supplier expiry option fallback */}
               {data.showLongerExpiryPrompt && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-[2rem] p-8 shadow-sm space-y-6 animate-in fade-in">
                    <div className="flex items-start space-x-3">
                      <HelpCircle className="text-amber-600 shrink-0 mt-0.5" size={22} />
                      <div>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Lựa chọn tối ưu chu kỳ lưu kho</h4>
                        <p className="text-slate-500 text-xs font-bold mt-1 leading-relaxed">
                          Lợi nhuận dự tính cho đợt hàng mới bị âm do thời gian bán an toàn ngắn hơn chu kỳ tồn kho. Hãy chọn phương án hành động phù hợp:
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                      <button
                        onClick={() => {
                          alert('Đã ghi nhận quyết định: Không nhập thêm mặt hàng này.');
                          navigate('/products');
                        }}
                        className="flex-1 py-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-sm"
                      >
                        1. Không nhập thêm mặt hàng này
                      </button>

                      <button
                        onClick={() => setShowExpiryInput(true)}
                        className="flex-1 py-4 bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md"
                      >
                        2. Tìm nguồn cung có hạn sử dụng dài hơn
                      </button>
                    </div>

                    {showExpiryInput && (
                      <form onSubmit={handleExpiryRecalculate} className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm space-y-4 animate-in slide-in-from-top-2">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nhập ngày hết hạn mới từ nhà cung cấp dài ngày</label>
                          <input
                            type="date"
                            required
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={customExpiryDate}
                            onChange={(e) => setCustomExpiryDate(e.target.value)}
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-sm"
                        >
                          TÍNH TOÁN LẠI TOÀN BỘ THUẬT TOÁN
                        </button>
                      </form>
                    )}
                  </div>
               )}
             </>
           )}
        </div>
      </div>
      <AIChatPanel
        pageContext="reorder"
        title={data?.product?.name ? `Hỏi về ${data.product.name}` : 'Hỏi về đề xuất nhập thêm'}
        context={{ productId: id, overrideNewExpiry: data?.inputSnapshot?.expectedNewPurchaseExpiry ? String(data.inputSnapshot.expectedNewPurchaseExpiry).slice(0, 10) : undefined }}
        suggestions={['Vì sao hệ thống đưa ra kết luận này?', 'Tồn kho hiện tại dự kiến bán hết trong bao lâu?', 'Giải thích tốc độ bán trung bình.']}
      />
    </div>
  );
};

const MetricRow: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = 'text-slate-800' }) => (
  <div className="flex justify-between items-center py-3.5 border-b border-slate-50 last:border-0">
    <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">{label}</span>
    <span className={`text-sm font-black ${color}`}>{value}</span>
  </div>
);

export default ProductAnalytics;
