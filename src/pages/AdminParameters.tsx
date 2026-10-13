import React, { useEffect, useState } from 'react';
import { adminApi, categoryApi, storeApi, productApi } from '../services/api';
import {
  Plus, Edit2, Save, X, Trash2,
  Store, Tags, CloudSun, Building2,
  MapPin, ShieldAlert, Settings as SettingsIcon,
  CheckCircle2, AlertCircle, Info
} from 'lucide-react';

type OptionGroup = 'STORE_TYPE' | 'CATEGORY_MAPPING' | 'SEASON' | 'CITY' | 'AREA' | 'RISK' | 'SYSTEM';

const AdminParameters: React.FC = () => {
  const [activeGroup, setActiveGroup] = useState<OptionGroup>('STORE_TYPE');
  const [parameters, setParameters] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [editingParam, setEditingParam] = useState<any>(null);
  const [editingSeason, setEditingSeason] = useState<any>(null);

  // Data for select inputs
  const [storeTypes, setStoreTypes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    parameterName: '',
    parameterType: '',
    value: 0,
    storeTypeId: '',
    categoryId: '',
    city: '',
    areaType: 'CITY_CENTER',
    description: '',
    isActive: true
  });

  const [seasonFormData, setSeasonFormData] = useState({
    name: '',
    code: '',
    startMonth: 1,
    startDay: 1,
    endMonth: 12,
    endDay: 31,
    midMonth: 6,
    midDay: 15,
    appliedCategoryIds: [] as string[],
    appliedProductIds: [] as string[],
    isActive: true,
    description: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeGroup === 'SEASON') {
        const res = await adminApi.getSeasons();
        setSeasons(res.data);
      } else {
        const res = await adminApi.getParameters(activeGroup);
        setParameters(res.data);
      }

      const [typeRes, catRes, prodRes] = await Promise.all([
        storeApi.getTypes(),
        categoryApi.getAll(),
        productApi.getAll()
      ]);
      setStoreTypes(typeRes.data);
      setCategories(catRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeGroup]);

  const handleGroupChange = (group: OptionGroup) => {
    setActiveGroup(group);
    setEditingParam(null);
    setEditingSeason(null);
  };

  const resetForm = () => {
    setFormData({
      parameterName: activeGroup === 'STORE_TYPE' ? 'X' :
                     activeGroup === 'CATEGORY_MAPPING' ? 'Y' :
                     activeGroup === 'CITY' ? 'W' :
                     activeGroup === 'AREA' ? 'V' :
                     activeGroup === 'RISK' ? 'R' : '',
      parameterType: activeGroup,
      value: 1.0,
      storeTypeId: '',
      categoryId: '',
      city: '',
      areaType: 'CITY_CENTER',
      description: '',
      isActive: true
    });
  };

  const resetSeasonForm = () => {
    setSeasonFormData({
      name: '',
      code: '',
      startMonth: 1,
      startDay: 1,
      endMonth: 12,
      endDay: 31,
      midMonth: 6,
      midDay: 15,
      appliedCategoryIds: [],
      appliedProductIds: [],
      isActive: true,
      description: ''
    });
  };

  const handleEdit = (p: any) => {
    setEditingParam(p);
    setFormData({
      parameterName: p.parameterName,
      parameterType: p.parameterType,
      value: p.value,
      storeTypeId: p.storeTypeId?._id || '',
      categoryId: p.categoryId?._id || '',
      city: p.city || '',
      areaType: p.areaType || 'CITY_CENTER',
      description: p.description || '',
      isActive: p.isActive
    });
    setShowModal(true);
  };

  const handleEditSeason = (s: any) => {
    setEditingSeason(s);
    setSeasonFormData({
      name: s.name,
      code: s.code,
      startMonth: s.startMonth,
      startDay: s.startDay,
      endMonth: s.endMonth,
      endDay: s.endDay,
      midMonth: s.midMonth,
      midDay: s.midDay,
      appliedCategoryIds: s.appliedCategoryIds?.map((c: any) => c._id || c) || [],
      appliedProductIds: s.appliedProductIds?.map((p: any) => p._id || p) || [],
      isActive: s.isActive,
      description: s.description || ''
    });
    setShowSeasonModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Xóa tham số này sẽ ảnh hưởng đến kết quả tính toán. Tiếp tục?')) {
      try {
        await adminApi.deleteParameter(id);
        fetchData();
      } catch (err) {
        alert('Lỗi khi xóa');
      }
    }
  };

  const handleDeleteSeason = async (id: string) => {
    if (window.confirm('Xóa cấu hình mùa vụ này sẽ làm thay đổi hệ số Z của các sản phẩm liên quan. Tiếp tục?')) {
      try {
        await adminApi.deleteSeason(id);
        fetchData();
      } catch (err) {
        alert('Lỗi khi xóa mùa vụ');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingParam) {
        await adminApi.updateParameter(editingParam._id, formData);
      } else {
        await adminApi.createParameter(formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Lỗi khi lưu dữ liệu');
    }
  };

  const handleSeasonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSeason) {
        await adminApi.updateSeason(editingSeason._id, seasonFormData);
      } else {
        await adminApi.createSeason(seasonFormData);
      }
      setShowSeasonModal(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi lưu mùa vụ');
    }
  };

  const groups = [
    { id: 'STORE_TYPE', label: '1. Loại cửa hàng (X)', icon: Store, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'CATEGORY_MAPPING', label: '2. Phân loại hàng hóa (Y)', icon: Tags, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'SEASON', label: '3. Mùa vụ (Z)', icon: CloudSun, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'CITY', label: '4. Thành phố (W)', icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'AREA', label: '5. Khu vực (V)', icon: MapPin, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'RISK', label: '6. Rủi ro hàng mới (R)', icon: ShieldAlert, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'SYSTEM', label: '7. Tham số hệ thống', icon: SettingsIcon, color: 'text-slate-600', bg: 'bg-slate-100' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <ShieldAlert className="mr-3 text-rose-600" size={32} />
            Quản trị Tham số AI
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            {activeGroup === 'SEASON'
              ? 'Quản lý mùa vụ và quy tắc tính tham số Z dựa trên ngày hiện tại và mùa phù hợp của từng sản phẩm.'
              : 'Cấu hình độc lập các hệ số X, Y, W, V cho thuật toán Inventory.'}
          </p>
        </div>
        <button
          onClick={() => {
            if (activeGroup === 'SEASON') {
              resetSeasonForm(); setEditingSeason(null); setShowSeasonModal(true);
            } else {
              resetForm(); setEditingParam(null); setShowModal(true);
            }
          }}
          className="px-6 py-3 bg-rose-600 text-white rounded-2xl font-black text-sm hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20 flex items-center"
        >
          <Plus size={20} className="mr-2" /> {activeGroup === 'SEASON' ? 'THÊM CẤU HÌNH MÙA VỤ' : 'THÊM THAM SỐ MỚI'}
        </button>
      </div>

      {/* Group Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {groups.map((group) => (
          <button
            key={group.id}
            onClick={() => handleGroupChange(group.id as OptionGroup)}
            className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center space-y-2 group ${
              activeGroup === group.id
              ? `${group.bg} border-transparent shadow-lg scale-105 ring-2 ring-offset-2 ring-opacity-50 ring-current`
              : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-md'
            }`}
          >
            <div className={`p-3 rounded-xl ${activeGroup === group.id ? 'bg-white shadow-sm' : group.bg} ${group.color}`}>
              <group.icon size={24} />
            </div>
            <span className={`text-[11px] font-black uppercase tracking-tighter leading-tight ${activeGroup === group.id ? 'text-slate-900' : 'text-slate-500'}`}>
              {group.label}
            </span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-800 flex items-center">
            {groups.find(g => g.id === activeGroup)?.label}
          </h3>
          <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {(activeGroup === 'SEASON' ? seasons.length : parameters.length)} bản ghi
          </span>
        </div>

        {loading ? (
          <div className="p-20 flex justify-center items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-600"></div>
          </div>
        ) : activeGroup === 'SEASON' ? (
          /* Season Table Layout */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/30">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tên mùa / Mã</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Khoảng thời gian</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ngày giữa mùa</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Áp dụng cho</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {seasons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold italic">
                      Chưa có cấu hình mùa vụ nào. Z mặc định sẽ là 1.
                    </td>
                  </tr>
                ) : (
                  seasons.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="font-bold text-slate-900">{s.name}</div>
                        <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">{s.code}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-bold text-slate-600">
                          {s.startDay}/{s.startMonth} - {s.endDay}/{s.endMonth}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-black text-blue-600">
                          {s.midDay}/{s.midMonth}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="max-w-xs truncate text-[10px] font-bold text-slate-500 uppercase">
                          {s.appliedCategoryIds?.length > 0 && `DM: ${s.appliedCategoryIds.map((c: any) => c.name).join(', ')}`}
                          {s.appliedProductIds?.length > 0 && ` | SP: ${s.appliedProductIds.length} mặt hàng`}
                          {(!s.appliedCategoryIds?.length && !s.appliedProductIds?.length) && 'Tất cả sản phẩm'}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          s.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditSeason(s)} className="p-2 hover:bg-white hover:shadow-md rounded-xl text-blue-600 transition-all">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDeleteSeason(s._id)} className="p-2 hover:bg-rose-50 rounded-xl text-rose-600 transition-all">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Calculation Rules Info Panel (Requirement 24) */}
            <div className="p-8 bg-slate-50/50 border-t border-slate-50">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                  <Info className="text-amber-500" size={24} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Quy tắc tính tham số Z (Động)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[11px] font-bold text-slate-500 leading-relaxed">
                    <div className="space-y-2">
                      <p className="flex items-center text-emerald-600">
                        <CheckCircle2 size={14} className="mr-2" /> Cùng mùa: Z = 1
                      </p>
                      <p className="flex items-start">
                        <AlertCircle size={14} className="mr-2 mt-0.5 text-blue-500" />
                        <span>Khác mùa: Z_raw = 1 - (Khoảng cách ngày / Số ngày trong năm)</span>
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-1">
                      <p>• IF Z_raw ≥ 0.875 → Z = Z_raw</p>
                      <p>• IF 0.625 &lt; Z_raw &lt; 0.875 → Z = 0.6</p>
                      <p>• IF Z_raw ≤ 0.625 → Z = 0</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Standard Parameter Table Layout */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/30">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tham số</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Áp dụng cho</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Giá trị</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {parameters.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold italic">
                      Chưa có tham số nào trong nhóm này.
                    </td>
                  </tr>
                ) : (
                  parameters.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center">
                          <div className="font-mono text-xl font-black text-rose-600 mr-3">{p.parameterName}</div>
                          <div>
                             <p className="text-xs font-bold text-slate-700">{p.description || 'Không có mô tả'}</p>
                             <p className="text-[10px] text-slate-400 uppercase font-black">Type: {p.parameterType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-bold text-slate-600">
                          {p.parameterType === 'STORE_TYPE' && `Cửa hàng: ${p.storeTypeId?.name || '-'}`}
                          {p.parameterType === 'CATEGORY_MAPPING' && (
                            <div className="flex flex-col">
                              <span>Loại: {p.storeTypeId?.name || 'Tất cả'}</span>
                              <span className="text-xs text-blue-500">→ DM: {p.categoryId?.name || '-'}</span>
                            </div>
                          )}
                          {p.parameterType === 'CITY' && `Thành phố: ${p.city}`}
                          {p.parameterType === 'AREA' && `Vùng: ${p.areaType}`}
                          {p.parameterType === 'SYSTEM' && 'Toàn hệ thống'}
                          {p.parameterType === 'RISK' && 'Tính toán mặt hàng mới'}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-2xl font-black text-slate-900 tracking-tighter">
                          {p.value}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          p.isActive
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-2 hover:bg-white hover:shadow-md rounded-xl text-blue-600 transition-all"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="p-2 hover:bg-rose-50 rounded-xl text-rose-600 transition-all"
                          >
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
        )}
      </div>

      {/* Season Modal (New) */}
      {showSeasonModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-in slide-in-from-bottom-8 duration-500">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                  {editingSeason ? 'Sửa cấu hình mùa vụ' : 'Thêm cấu hình mùa vụ'}
                </h3>
                <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mt-1">
                  Tham số Z (Mùa vụ động)
                </p>
              </div>
              <button onClick={() => setShowSeasonModal(false)} className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-600 transition-all shadow-sm">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSeasonSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tên mùa</label>
                  <input required value={seasonFormData.name} onChange={e => setSeasonFormData({...seasonFormData, name: e.target.value})} placeholder="Đầu mùa thu..." className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-amber-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Mã mùa (Unique)</label>
                  <input required value={seasonFormData.code} onChange={e => setSeasonFormData({...seasonFormData, code: e.target.value.toUpperCase()})} placeholder="EARLY_AUTUMN" className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-mono font-black focus:ring-2 focus:ring-amber-500 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Bắt đầu</label>
                  <div className="flex space-x-2">
                    <input type="number" min="1" max="31" value={seasonFormData.startDay} onChange={e => setSeasonFormData({...seasonFormData, startDay: parseInt(e.target.value)})} className="w-full px-3 py-2 rounded-xl border-none font-bold text-center" placeholder="Ngày" />
                    <input type="number" min="1" max="12" value={seasonFormData.startMonth} onChange={e => setSeasonFormData({...seasonFormData, startMonth: parseInt(e.target.value)})} className="w-full px-3 py-2 rounded-xl border-none font-bold text-center" placeholder="Tháng" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Kết thúc</label>
                  <div className="flex space-x-2">
                    <input type="number" min="1" max="31" value={seasonFormData.endDay} onChange={e => setSeasonFormData({...seasonFormData, endDay: parseInt(e.target.value)})} className="w-full px-3 py-2 rounded-xl border-none font-bold text-center" placeholder="Ngày" />
                    <input type="number" min="1" max="12" value={seasonFormData.endMonth} onChange={e => setSeasonFormData({...seasonFormData, endMonth: parseInt(e.target.value)})} className="w-full px-3 py-2 rounded-xl border-none font-bold text-center" placeholder="Tháng" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Giữa mùa (Mid)</label>
                  <div className="flex space-x-2">
                    <input type="number" min="1" max="31" value={seasonFormData.midDay} onChange={e => setSeasonFormData({...seasonFormData, midDay: parseInt(e.target.value)})} className="w-full px-3 py-2 rounded-xl border-none font-black text-blue-600 text-center" placeholder="Ngày" />
                    <input type="number" min="1" max="12" value={seasonFormData.midMonth} onChange={e => setSeasonFormData({...seasonFormData, midMonth: parseInt(e.target.value)})} className="w-full px-3 py-2 rounded-xl border-none font-black text-blue-600 text-center" placeholder="Tháng" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Áp dụng cho Phân loại</label>
                <div className="flex flex-wrap gap-2 p-4 bg-slate-50 rounded-2xl">
                  {categories.map(cat => (
                    <label key={cat._id} className="flex items-center space-x-2 px-3 py-1 bg-white rounded-lg border border-slate-100 cursor-pointer hover:border-amber-200 transition-colors">
                      <input
                        type="checkbox"
                        checked={seasonFormData.appliedCategoryIds.includes(cat._id)}
                        onChange={e => {
                          const newIds = e.target.checked
                            ? [...seasonFormData.appliedCategoryIds, cat._id]
                            : seasonFormData.appliedCategoryIds.filter(id => id !== cat._id);
                          setSeasonFormData({...seasonFormData, appliedCategoryIds: newIds});
                        }}
                        className="rounded text-amber-600"
                      />
                      <span className="text-[11px] font-bold text-slate-600">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Mô tả chi tiết</label>
                <textarea rows={2} value={seasonFormData.description} onChange={e => setSeasonFormData({...seasonFormData, description: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border-none rounded-2xl text-sm" placeholder="..." />
              </div>

              <div className="flex items-center p-4 bg-slate-50 rounded-2xl">
                 <input type="checkbox" id="seasonActive" checked={seasonFormData.isActive} onChange={e => setSeasonFormData({...seasonFormData, isActive: e.target.checked})} className="w-5 h-5 rounded-lg border-none bg-white text-amber-600 focus:ring-amber-500" />
                 <label htmlFor="seasonActive" className="ml-3 text-sm font-bold text-slate-700 cursor-pointer">Kích hoạt mùa vụ này</label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={() => setShowSeasonModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest">Hủy</button>
                <button type="submit" className="flex-2 py-4 px-12 bg-amber-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-amber-600/20 uppercase tracking-widest">Lưu cấu hình</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Standard Parameter Modal (Existing) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden border border-slate-100 animate-in slide-in-from-bottom-8 duration-500">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">
                  {editingParam ? 'Cập nhật tham số' : 'Thêm tham số mới'}
                </h3>
                <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mt-1">
                  Nhóm: {groups.find(g => g.id === activeGroup)?.label}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-3 hover:bg-white rounded-2xl text-slate-400 hover:text-slate-600 transition-all shadow-sm"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Ký hiệu tham số</label>
                  <input
                    required
                    name="parameterName"
                    value={formData.parameterName}
                    onChange={(e) => setFormData({...formData, parameterName: e.target.value})}
                    placeholder="X, Y, Z..."
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-mono text-lg font-black focus:ring-2 focus:ring-rose-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Giá trị hệ số (≤ 1)</label>
                  <input
                    type="number"
                    step="0.001"
                    max="1"
                    min="0"
                    required
                    name="value"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value)})}
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl text-xl font-black text-blue-600 focus:ring-2 focus:ring-rose-500 transition-all"
                  />
                </div>
              </div>

              {activeGroup === 'STORE_TYPE' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Loại cửa hàng</label>
                  <select
                    required
                    name="storeTypeId"
                    value={formData.storeTypeId}
                    onChange={(e) => setFormData({...formData, storeTypeId: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-rose-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Chọn loại cửa hàng...</option>
                    {storeTypes.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </select>
                </div>
              )}

              {activeGroup === 'CATEGORY_MAPPING' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Cửa hàng</label>
                    <select
                      name="storeTypeId"
                      value={formData.storeTypeId}
                      onChange={(e) => setFormData({...formData, storeTypeId: e.target.value})}
                      className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl font-bold"
                    >
                      <option value="">Tất cả cửa hàng</option>
                      {storeTypes.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Danh mục</label>
                    <select
                      required
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                      className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl font-bold"
                    >
                      <option value="">Chọn danh mục...</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {activeGroup === 'CITY' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tên thành phố</label>
                  <input
                    required
                    name="city"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    placeholder="Hà Nội, Hồ Chí Minh, Đà Nẵng..."
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold"
                  />
                </div>
              )}

              {activeGroup === 'AREA' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Loại khu vực</label>
                  <select
                    required
                    name="areaType"
                    value={formData.areaType}
                    onChange={(e) => setFormData({...formData, areaType: e.target.value})}
                    className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-bold"
                  >
                    <option value="CITY_CENTER">Trung tâm thành phố</option>
                    <option value="SUBURBAN">Ngoại ô</option>
                    <option value="RURAL">Nông thôn</option>
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Ghi chú / Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  placeholder="Mô tả ý nghĩa của tham số này..."
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl font-medium text-sm focus:ring-2 focus:ring-rose-500 transition-all resize-none"
                />
              </div>

              <div className="flex items-center p-4 bg-slate-50 rounded-2xl">
                 <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-5 h-5 rounded-lg border-none bg-white text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="isActive" className="ml-3 text-sm font-bold text-slate-700 cursor-pointer">Kích hoạt tham số này</label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all uppercase tracking-widest"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-2 py-4 px-12 bg-rose-600 text-white rounded-2xl font-black text-sm hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/20 uppercase tracking-widest"
                >
                  XÁC NHẬN LƯU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminParameters;
