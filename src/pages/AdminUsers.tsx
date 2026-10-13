import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import {
  Users,
  Shield,
  User as UserIcon,
  Lock,
  Unlock,
  Trash2,
  Mail,
  Calendar,
  Search,
  AlertTriangle
} from 'lucide-react';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await adminApi.getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách người dùng', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: any) => {
    if (window.confirm(`Bạn có chắc muốn ${user.isActive ? 'khóa' : 'mở khóa'} tài khoản ${user.username}?`)) {
      try {
        await adminApi.updateUserStatus(user._id, !user.isActive);
        fetchUsers();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Không thể cập nhật trạng thái.');
      }
    }
  };

  const handleToggleRole = async (user: any) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (window.confirm(`Bạn có chắc muốn cấp quyền ${newRole} cho ${user.username}?`)) {
      try {
        await adminApi.updateUserRole(user._id, newRole);
        fetchUsers();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Không thể cập nhật quyền.');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await adminApi.deleteUser(id);
        fetchUsers();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Không thể xóa người dùng.');
      }
    }
  };

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center">
            <Users className="mr-3 text-rose-600" size={32} /> QUẢN LÝ TÀI KHOẢN
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">
            Danh sách nhân viên và quản trị viên hệ thống
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            className="w-full pl-12 pr-6 py-3 bg-white border-none rounded-2xl font-bold text-slate-800 shadow-sm focus:ring-2 focus:ring-rose-500 transition-all outline-none"
            placeholder="Tìm theo username, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Người dùng</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Vai trò</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Trạng thái</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ngày tạo</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-10 text-center font-bold text-slate-400">Đang tải...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="px-8 py-10 text-center font-bold text-slate-400">Không tìm thấy người dùng</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${user.role === 'ADMIN' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                          {user.role === 'ADMIN' ? <Shield size={20} /> : <UserIcon size={20} />}
                        </div>
                        <div>
                          <p className="font-black text-slate-800 leading-tight">{user.username}</p>
                          <p className="text-xs font-bold text-slate-400 flex items-center mt-0.5">
                            <Mail size={12} className="mr-1" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        user.role === 'ADMIN' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      {user.isActive ? (
                        <span className="flex items-center text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                          Đang hoạt động
                        </span>
                      ) : (
                        <span className="flex items-center text-rose-500 text-[10px] font-black uppercase tracking-widest">
                          <Lock size={12} className="mr-1" /> Đã khóa
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-slate-500 flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          title={user.isActive ? "Khóa tài khoản" : "Mở khóa"}
                          className={`p-2 rounded-xl transition-all ${user.isActive ? 'hover:bg-rose-50 text-rose-500' : 'hover:bg-emerald-50 text-emerald-500'}`}
                        >
                          {user.isActive ? <Lock size={18} /> : <Unlock size={18} />}
                        </button>
                        <button
                          onClick={() => handleToggleRole(user)}
                          title="Thay đổi quyền"
                          className="p-2 hover:bg-slate-100 text-slate-500 rounded-xl transition-all"
                        >
                          <Shield size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          title="Xóa tài khoản"
                          className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"
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
      </div>

      <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start">
        <AlertTriangle className="text-amber-500 mr-4 shrink-0" size={24} />
        <div>
          <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest mb-1">Lưu ý quan trọng</h4>
          <p className="text-xs font-bold text-amber-700 leading-relaxed">
            Mọi thay đổi về quyền ADMIN sẽ có hiệu lực ngay lập tức. Hãy cẩn trọng khi cấp quyền quản trị cao nhất.
            Tài khoản bị khóa sẽ không thể đăng nhập hoặc thực hiện bất kỳ thao tác nào trên hệ thống API.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
