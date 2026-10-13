import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import { LogIn, User, Lock, Zap, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authApi.login(formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // Chuyển hướng dựa trên role
      if (res.data.user.role === 'ADMIN') {
        navigate('/admin/parameters');
      } else {
        navigate('/');
      }
      window.location.reload(); // Để Layout cập nhật lại menu
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 bg-blue-600 rounded-3xl shadow-xl shadow-blue-500/20 mb-6">
            <Zap size={40} className="text-white fill-white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
            AI <span className="text-blue-500">Inventory</span>
          </h1>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs">Hệ thống quản trị thông minh</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl">
          <h2 className="text-2xl font-black text-slate-800 mb-8 flex items-center">
            <LogIn className="mr-3 text-blue-600" /> ĐĂNG NHẬP
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center text-rose-600 text-sm font-bold animate-in shake duration-300">
              <AlertCircle size={18} className="mr-2 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username / Email</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  placeholder="admin hoặc email..."
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  required
                  type="password"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.8rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Đang xác thực...' : 'VÀO HỆ THỐNG'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-slate-500 text-sm font-bold">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-blue-600 hover:underline">Đăng ký ngay</Link>
            </p>
          </div>
        </div>

        <p className="text-center mt-10 text-slate-600 text-xs font-bold uppercase tracking-tighter">
          &copy; 2024 AI Inventory. Strictly for internal use.
        </p>
      </div>
    </div>
  );
};

export default Login;
