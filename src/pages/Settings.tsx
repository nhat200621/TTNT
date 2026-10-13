import React, { useEffect, useState } from 'react';
import { storeApi, categoryApi, adminApi } from '../services/api';
import { Store, StoreType, Category } from '../types';
import { Save, Store as StoreIcon, MapPin, Layers, RefreshCw } from 'lucide-react';

const Settings: React.FC = () => {
  const [store, setStore] = useState<Store | null>(null);
  const [storeTypes, setStoreTypes] = useState<StoreType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [configuredCities, setConfiguredCities] = useState<string[]>([]);
  const [configuredAreas, setConfiguredAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storeRes, typesRes, categoriesRes, citiesRes, areasRes] = await Promise.all([
          storeApi.getCurrent().catch((err: any) => {
            if (err.response?.status === 404) return { data: null };
            throw err;
          }),
          storeApi.getTypes(),
          categoryApi.getAll(),
          adminApi.getParameters('CITY'),
          adminApi.getParameters('AREA')
        ]);
        setStore(storeRes.data || { name: '', storeTypeId: '', city: '', areaType: '', productCategoryIds: [] } as unknown as Store);
        setStoreTypes(typesRes.data);
        setCategories(categoriesRes.data);
        setConfiguredCities(Array.from(new Set(citiesRes.data.filter((param: any) => param.isActive).map((param: any) => param.city).filter(Boolean))));
        setConfiguredAreas(Array.from(new Set(areasRes.data.filter((param: any) => param.isActive).map((param: any) => param.areaType).filter(Boolean))));
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Không thể tải thông tin cài đặt. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!store) return;
    const { name, value } = e.target;
    setStore({ ...store, [name]: value });
  };

  const handleCategoryToggle = (categoryId: string) => {
    if (!store) return;
    const currentCategories = (store.productCategoryIds || []).map((category: any) => typeof category === 'string' ? category : category._id);
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter((id: string) => id !== categoryId)
      : [...currentCategories, categoryId];

    setStore({ ...store, productCategoryIds: newCategories });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) return;

    if (!store.storeTypeId) {
      setError('Vui lòng chọn Loại cửa hàng.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const storeData = {
        name: store.name,
        storeTypeId: currentStoreTypeId,
        city: store.city,
        areaType: store.areaType,
        address: store.address,
        phone: store.phone,
        productCategoryIds: (store.productCategoryIds || []).map((category: any) => typeof category === 'string' ? category : category._id)
      };
      const saved = store._id
        ? await storeApi.updateStore(store._id, storeData)
        : await storeApi.createCurrent(storeData);
      setStore(saved.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating store:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu cài đặt.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center p-20 space-y-4">
      <RefreshCw className="animate-spin text-blue-600" size={40} />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Đang tải cấu hình cửa hàng...</p>
    </div>
  );

  const currentStoreTypeId = typeof store?.storeTypeId === 'object' ? store.storeTypeId._id : store?.storeTypeId;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic">CÀI ĐẶT CỬA HÀNG</h2>
          <p className="text-slate-500 font-bold text-sm mt-1">Thiết lập thông tin cơ bản và danh mục kinh doanh để AI hoạt động chính xác.</p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-2xl flex items-center animate-in slide-in-from-top-4">
          <Save className="mr-3" size={20} />
          <span className="font-bold">Cập nhật cấu hình cửa hàng thành công! AI sẽ áp dụng các thay đổi ngay lập tức.</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-2xl flex items-center animate-in shake">
          <InfoIcon className="mr-3" size={20} />
          <span className="font-bold">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cấu hình định danh & Vị trí */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center">
              <StoreIcon className="mr-3 text-blue-600" size={20} />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Thông tin cơ bản</h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tên cửa hàng *</label>
                <input
                  required
                  name="name"
                  value={store?.name || ''}
                  onChange={handleInputChange}
                  placeholder="Nhập tên cửa hàng của bạn"
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Loại cửa hàng (Chỉ được chọn 1) *</label>
                <select
                  required
                  name="storeTypeId"
                  value={currentStoreTypeId || ''}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none"
                >
                  <option value="" disabled>-- Chọn loại cửa hàng --</option>
                  {storeTypes.map(type => (
                    <option key={type._id} value={type._id}>{type.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Thành phố *</label>
                  <select
                    required
                    name="city"
                    value={store?.city || ''}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  >
                    {!configuredCities.includes(store?.city || '') && <option value={store?.city || ''}>{store?.city || '-- Chọn thành phố --'}</option>}
                    {configuredCities.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Khu vực *</label>
                  <select
                    required
                    name="areaType"
                    value={store?.areaType || ''}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  >
                    {!configuredAreas.includes(store?.areaType || '') && <option value={store?.areaType || ''}>{store?.areaType || '-- Chọn khu vực --'}</option>}
                    {configuredAreas.map(area => <option key={area} value={area}>{area === 'CITY_CENTER' ? 'Trung tâm thành phố' : area === 'SUBURBAN' ? 'Ngoại ô' : area === 'RURAL' ? 'Nông thôn' : area}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-xl space-y-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center">
              <MapPin size={14} className="mr-2" /> Thông tin liên hệ
            </h3>
            <div className="space-y-4">
              <input
                name="address"
                value={store?.address || ''}
                onChange={handleInputChange}
                placeholder="Địa chỉ chi tiết"
                className="w-full bg-slate-800 border-none rounded-xl px-5 py-4 text-sm font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <input
                name="phone"
                value={store?.phone || ''}
                onChange={handleInputChange}
                placeholder="Số điện thoại liên hệ"
                className="w-full bg-slate-800 border-none rounded-xl px-5 py-4 text-sm font-bold text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Cấu hình Danh mục kinh doanh */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center">
              <Layers className="mr-3 text-indigo-600" size={20} />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Danh mục kinh doanh (Chọn nhiều)</h3>
            </div>
            <div className="p-8 flex-1">
              <p className="text-xs font-bold text-slate-400 mb-6 italic">AI sẽ chỉ đề xuất các sản phẩm thuộc các danh mục bạn chọn ở dưới đây.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map(cat => {
                  const isSelected = store?.productCategoryIds?.some((category: any) => (typeof category === 'string' ? category : category._id) === cat._id);
                  return (
                    <div
                      key={cat._id}
                      onClick={() => handleCategoryToggle(cat._id)}
                      className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/30'
                          : 'border-slate-50 bg-slate-50/30 hover:border-slate-200'
                      }`}
                    >
                      <span className={`text-xs font-black uppercase tracking-widest ${isSelected ? 'text-indigo-700' : 'text-slate-500'}`}>
                        {cat.name}
                      </span>
                      <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600'
                          : 'border-slate-200 bg-white group-hover:border-slate-400'
                      }`}>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {(!store?.productCategoryIds || store.productCategoryIds.length === 0) && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start">
                  <InfoIcon className="text-amber-500 mr-3 shrink-0" size={16} />
                  <p className="text-[10px] font-bold text-amber-700 leading-relaxed uppercase tracking-widest">
                    Bạn chưa chọn danh mục nào. Hệ thống sẽ không thể đưa ra đề xuất AI nếu thiếu thông tin này.
                  </p>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-slate-50">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center disabled:bg-slate-400 disabled:shadow-none"
              >
                {saving ? (
                  <RefreshCw className="animate-spin mr-2" size={20} />
                ) : (
                  <Save className="mr-2" size={20} />
                )}
                LƯU CẤU HÌNH CỬA HÀNG
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const InfoIcon = ({ size, className }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
);

export default Settings;
