import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Download,
  ShoppingCart,
  Database,
  History,
  Tags,
  Settings,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  ShieldCheck,
  Zap,
  ClipboardList,
  ChevronRight,
  Store,
  UserCog,
  Users,
  MessageCircle
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      setUser(JSON.parse(userJson));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Sản phẩm', icon: Package, path: '/products' },
    { name: 'Nhập hàng', icon: Download, path: '/purchase' },
    { name: 'Bán hàng', icon: ShoppingCart, path: '/sale' },
    { name: 'Tồn kho', icon: Database, path: '/inventory' },
    { name: 'Lịch sử', icon: History, path: '/history' },
    { name: 'Danh mục', icon: Tags, path: '/categories' },
    { name: 'Đề xuất AI', icon: Zap, path: '/ai-recommendations' },
    { name: 'Hỗ trợ', icon: MessageCircle, path: '/support' },
  ];

  const adminItems = [
    { name: 'Quản lý tài khoản', icon: Users, path: '/admin/users' },
    { name: 'Loại cửa hàng', icon: Store, path: '/admin/store-types' },
    { name: 'Cấu hình AI', icon: ShieldCheck, path: '/admin/parameters' },
    { name: 'Nhật ký tính toán', icon: ClipboardList, path: '/admin/logs' },
  ];

  const isActive = (path: string) => location.pathname === path;

  if (!user) return null;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-72' : 'w-20'
        } bg-slate-900 transition-all duration-300 ease-in-out flex flex-col z-30 shadow-2xl`}
      >
        <div className="h-20 flex items-center px-6 bg-slate-950/50 shrink-0">
          <div className="bg-blue-600 p-2 rounded-xl mr-3 shadow-lg shadow-blue-500/30">
            <Zap className="text-white fill-white" size={20} />
          </div>
          {isSidebarOpen && (
            <span className="text-xl font-black text-white tracking-tighter uppercase italic">
              AI <span className="text-blue-500">Inventory</span>
            </span>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center group px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(item.path)
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className={`${isActive(item.path) ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'} transition-colors`} />
              {isSidebarOpen && (
                <div className="ml-4 flex-1 flex justify-between items-center">
                  <span className="font-semibold text-sm">{item.name}</span>
                  {isActive(item.path) && <ChevronRight size={14} className="opacity-50" />}
                </div>
              )}
            </Link>
          ))}

          {user.role === 'ADMIN' && (
            <div className="pt-6">
              {isSidebarOpen && (
                <div className="px-4 mb-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  Quản trị hệ thống
                </div>
              )}
              <div className="space-y-1">
                {adminItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center group px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive(item.path)
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <item.icon size={20} className={`${isActive(item.path) ? 'text-white' : 'text-slate-500 group-hover:text-rose-400'} transition-colors`} />
                    {isSidebarOpen && (
                      <div className="ml-4 flex-1 flex justify-between items-center">
                        <span className="font-semibold text-sm">{item.name}</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="p-4 bg-slate-950/30 space-y-3 shrink-0">
          <div
            className={`flex items-center justify-center w-full py-2.5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all border ${
              user.role === 'ADMIN'
              ? 'bg-rose-600/10 text-rose-500 border-rose-600/20'
              : 'bg-emerald-600/10 text-emerald-500 border-emerald-600/20'
            }`}
          >
            {user.role === 'ADMIN' ? <ShieldCheck size={14} className="mr-2" /> : <UserCog size={14} className="mr-2" />}
            {isSidebarOpen ? `Role: ${user.role}` : user.role.charAt(0)}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 rounded-xl text-slate-400 hover:bg-red-600/10 hover:text-red-500 transition-all group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            {isSidebarOpen && <span className="ml-4 font-bold text-sm">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-white">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 hover:bg-slate-50 text-slate-500 rounded-xl transition-colors md:hidden"
            >
              <Menu size={22} />
            </button>
            <div className="hidden md:block">
              <h1 className="text-xl font-black text-slate-800 tracking-tight">AI Inventory System</h1>
              <div className="flex items-center mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Tài khoản: {user.username}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-6">
             <div className="hidden lg:flex items-center space-x-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-tighter">Hệ thống đang hoạt động</span>
             </div>

            <button className="p-2.5 relative text-slate-400 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center pl-4 border-l border-slate-100 group cursor-pointer">
              <div className="mr-3 text-right hidden sm:block">
                <p className="text-sm font-black text-slate-800 leading-none mb-1">{user.name || user.username}</p>
                <p className={`text-[10px] font-black uppercase tracking-wider italic ${user.role === 'ADMIN' ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {user.role} ACCESS
                </p>
              </div>
              <div className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105 ${user.role === 'ADMIN' ? 'bg-rose-600 border-rose-100 shadow-rose-200' : 'bg-slate-900 border-slate-100 shadow-slate-200'}`}>
                {user.role === 'ADMIN' ? <ShieldCheck size={20} /> : <UserIcon size={20} />}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 scroll-smooth">
          <div className="p-8 max-w-[1600px] mx-auto min-h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
