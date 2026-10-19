import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/databaseService';
import { Cafe, User, UserRole, PromotionCode, BookingOrder } from '../types';
import { formatVND, formatDateVN } from '../utils/formatters';
import { DISTRICTS } from '../data/cafesData';
import {
  ShieldCheck,
  Store,
  Users,
  Ticket,
  Database,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  RotateCcw,
  ExternalLink,
  DollarSign,
  TrendingUp,
  LayoutDashboard,
  Lock,
  Unlock,
  X,
  FileJson,
  Coffee,
  UserPlus,
  LogIn,
  KeyRound
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout, loginAsUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'cafes' | 'users' | 'promotions' | 'database'>('overview');

  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [promotions, setPromotions] = useState<PromotionCode[]>([]);
  const [bookings, setBookings] = useState<BookingOrder[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  // Search filters
  const [cafeSearch, setCafeSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Cafe Modal State
  const [isCafeModalOpen, setIsCafeModalOpen] = useState(false);
  const [editingCafe, setEditingCafe] = useState<Cafe | null>(null);
  const [cafeFormData, setCafeFormData] = useState({
    name: '',
    tagline: '',
    address: '',
    district: 'Quận 1',
    priceRange: '45.000đ - 75.000đ',
    wifiSpeedMbps: 250,
    noiseLevel: 'Rất yên tĩnh' as Cafe['features']['noiseLevel'],
    heroImage: '/cafes/the-workshop-haven-main.jpg',
    description: '',
  });

  // Promo Modal State
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [promoFormData, setPromoFormData] = useState<PromotionCode>({
    code: '',
    name: '',
    description: '',
    discountType: 'fixed',
    value: 20000,
    minOrder: 50000,
    isActive: true,
  });

  // User Modal State (Create Partner & Assign Cafe)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '123',
    role: 'partner' as UserRole,
    cafeId: '',
    status: 'active' as User['status'],
  });

  // Database JSON raw string
  const [rawJson, setRawJson] = useState('');

  const loadData = () => {
    setCafes([...db.getCafes()]);
    setUsers([...db.getUsers()]);
    setPromotions([...db.getPromotions()]);
    setBookings([...db.getBookings()]);
    setRawJson(db.exportJSON());
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe(() => {
      loadData();
    });
    return unsub;
  }, []);

  const triggerNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  /* ================= CAFES CRUD ================= */
  const handleOpenAddCafe = () => {
    setEditingCafe(null);
    setCafeFormData({
      name: '',
      tagline: 'Không gian làm việc & cà phê phong cách mới',
      address: '',
      district: 'Quận 1',
      priceRange: '40.000đ - 70.000đ',
      wifiSpeedMbps: 250,
      noiseLevel: 'Yên tĩnh',
      heroImage: '/cafes/the-workshop-haven-main.jpg',
      description: 'Không gian được trang bị đầy đủ bàn ghế làm việc, Wi-Fi tốc độ cao và menu đa dạng.',
    });
    setIsCafeModalOpen(true);
  };

  const handleOpenEditCafe = (c: Cafe) => {
    setEditingCafe(c);
    setCafeFormData({
      name: c.name,
      tagline: c.tagline,
      address: c.address,
      district: c.district,
      priceRange: c.priceRange,
      wifiSpeedMbps: c.features.wifiSpeedMbps,
      noiseLevel: c.features.noiseLevel,
      heroImage: c.heroImage,
      description: c.description,
    });
    setIsCafeModalOpen(true);
  };

  const handleSaveCafe = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCafe) {
      db.updateCafe(editingCafe.id, {
        name: cafeFormData.name,
        tagline: cafeFormData.tagline,
        address: cafeFormData.address,
        district: cafeFormData.district,
        priceRange: cafeFormData.priceRange,
        heroImage: cafeFormData.heroImage,
        description: cafeFormData.description,
        features: {
          ...editingCafe.features,
          wifiSpeedMbps: cafeFormData.wifiSpeedMbps,
          noiseLevel: cafeFormData.noiseLevel,
        },
      });
      triggerNotice(`Đã cập nhật quán "${cafeFormData.name}"!`);
    } else {
      db.createCafe({
        name: cafeFormData.name,
        tagline: cafeFormData.tagline,
        address: cafeFormData.address,
        ward: 'Phường 1',
        district: cafeFormData.district,
        city: 'Hồ Chí Minh',
        priceRange: cafeFormData.priceRange,
        heroImage: cafeFormData.heroImage,
        images: [cafeFormData.heroImage],
        openHours: { open: '07:30', close: '22:30' },
        features: {
          noiseLevel: cafeFormData.noiseLevel,
          wifiSpeedMbps: cafeFormData.wifiSpeedMbps,
          powerSockets: 'Mỗi bàn đều có',
          naturalLight: 'Ánh sáng tốt',
          meetingRooms: false,
          airConditioning: true,
          parking: 'Chỗ gửi xe miễn phí',
          outdoorSpace: false,
        },
        categories: ['Làm việc tập trung', 'Cà phê đặc sản'],
        tables: [
          {
            id: `t-${Date.now()}-1`,
            cafeId: '',
            code: 'T01',
            name: 'Bàn Đơn Focus #01',
            type: 'single',
            capacity: 1,
            features: ['Ổ cắm điện', 'Ghế êm'],
            status: 'available',
            hourlyRate: 0,
            zone: 'Khu Yên Tĩnh (Quiet Zone)',
            position: { row: 1, col: 1 },
          }
        ],
        description: cafeFormData.description,
      });
      triggerNotice(`Đã tạo quán mới "${cafeFormData.name}" thành công!`);
    }

    setIsCafeModalOpen(false);
    loadData();
  };

  const handleDeleteCafe = (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa quán "${name}" khỏi sàn FlexiDesk?`)) {
      db.deleteCafe(id);
      triggerNotice(`Đã xóa quán "${name}".`);
      loadData();
    }
  };

  /* ================= USERS CRUD ================= */
  const handleOpenAddUser = (preselectedCafeId?: string) => {
    const latestCafes = db.getCafes();
    setCafes(latestCafes);
    setEditingUser(null);
    setUserFormData({
      name: '',
      email: '',
      phone: '',
      password: '123',
      role: 'partner',
      cafeId: preselectedCafeId || latestCafes[0]?.id || '',
      status: 'active',
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (u: User) => {
    const latestCafes = db.getCafes();
    setCafes(latestCafes);
    setEditingUser(u);
    setUserFormData({
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      password: u.password || '123',
      role: u.role,
      cafeId: u.cafeId || '',
      status: u.status,
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = userFormData.name.trim();
    const trimmedEmail = userFormData.email.trim().toLowerCase();
    const trimmedPhone = userFormData.phone.trim();
    const trimmedPassword = userFormData.password.trim();

    if (!trimmedName || !trimmedEmail) {
      alert('Vui lòng nhập họ tên và email hợp lệ.');
      return;
    }

    if (editingUser) {
      db.updateUser(editingUser.id, {
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone || '0900 000 000',
        password: trimmedPassword || '123',
        role: userFormData.role,
        status: userFormData.status,
        cafeId: userFormData.role === 'partner' ? userFormData.cafeId : undefined,
      });

      if (userFormData.role === 'partner' && userFormData.cafeId) {
        db.assignPartnerToCafe(editingUser.id, userFormData.cafeId);
      }

      const assignedCafe = cafes.find(c => c.id === userFormData.cafeId);
      triggerNotice(`Đã cập nhật tài khoản "${trimmedName}"${assignedCafe && userFormData.role === 'partner' ? ` (Quán: ${assignedCafe.name})` : ''}!`);
    } else {
      // Check duplicate email
      const existing = db.getUserByEmail(trimmedEmail);
      if (existing) {
        alert(`Email "${trimmedEmail}" đã tồn tại trong hệ thống. Vui lòng sử dụng email khác!`);
        return;
      }

      const newUser = db.createUser({
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone || '0908 000 111',
        password: trimmedPassword || '123',
        role: userFormData.role,
        status: userFormData.status,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(trimmedName)}`,
        cafeId: userFormData.role === 'partner' ? userFormData.cafeId : undefined,
      });

      if (userFormData.role === 'partner' && userFormData.cafeId) {
        db.assignPartnerToCafe(newUser.id, userFormData.cafeId);
      }

      const assignedCafe = cafes.find(c => c.id === userFormData.cafeId);
      triggerNotice(
        userFormData.role === 'partner' && assignedCafe
          ? `Đã tạo tài khoản Chủ Quán "${trimmedName}" và gán quyền quản lý quán "${assignedCafe.name}" thành công!`
          : `Đã tạo tài khoản "${trimmedName}" thành công!`
      );
    }

    setIsUserModalOpen(false);
    loadData();
  };

  const handleQuickAssignCafe = (userId: string, newCafeId: string) => {
    db.assignPartnerToCafe(userId, newCafeId);
    const cafe = cafes.find(c => c.id === newCafeId);
    if (cafe) {
      triggerNotice(`Đã gán quyền quản trị quán "${cafe.name}" cho tài khoản!`);
    } else {
      triggerNotice(`Đã hủy gán quán cho tài khoản.`);
    }
    loadData();
  };

  const handleLoginAsPartner = (targetUser: User) => {
    if (window.confirm(`Bạn có muốn đăng nhập thử vào trang Quản Lý Quán (Partner Dashboard) với tư cách chủ quán "${targetUser.name}"?`)) {
      loginAsUser(targetUser);
      navigate('/partner/dashboard');
    }
  };

  const handleChangeRole = (userId: string, newRole: UserRole) => {
    db.updateUserRole(userId, newRole);
    triggerNotice(`Đã chuyển quyền tài khoản sang ${newRole.toUpperCase()}!`);
    loadData();
  };

  const handleToggleUserStatus = (userId: string, currentStatus: User['status']) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    db.updateUserStatus(userId, nextStatus);
    triggerNotice(`Đã cập nhật trạng thái tài khoản!`);
    loadData();
  };

  const handleDeleteUser = (userId: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${name}"?`)) {
      db.deleteUser(userId);
      triggerNotice(`Đã xóa tài khoản "${name}".`);
      loadData();
    }
  };

  /* ================= PROMOTIONS CRUD ================= */
  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    db.createPromotion({
      ...promoFormData,
      code: promoFormData.code.toUpperCase().trim(),
    });
    triggerNotice(`Đã tạo mã giảm giá "${promoFormData.code}"!`);
    setIsPromoModalOpen(false);
    loadData();
  };

  const handleDeletePromo = (code: string) => {
    if (window.confirm(`Xóa mã ưu đãi "${code}"?`)) {
      db.deletePromotion(code);
      triggerNotice(`Đã xóa mã "${code}".`);
      loadData();
    }
  };

  /* ================= DATABASE BACKUP & RESTORE ================= */
  const handleExportJSON = () => {
    const jsonString = db.exportJSON();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flexidesk_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerNotice('Đã xuất file sao lưu JSON thành công!');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const res = db.importJSON(content);
        if (res.success) {
          triggerNotice(res.message);
          loadData();
        } else {
          alert(res.message);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefault = () => {
    if (window.confirm('CẢNH BÁO: Thao tác này sẽ đặt lại toàn bộ dữ liệu mẫu ban đầu! Bạn có chắc chắn muốn tiếp tục?')) {
      db.resetToDefault();
      triggerNotice('Đã khôi phục dữ liệu gốc ban đầu thành công!');
      loadData();
    }
  };

  const filteredCafes = cafes.filter(c =>
    c.name.toLowerCase().includes(cafeSearch.toLowerCase()) ||
    c.district.toLowerCase().includes(cafeSearch.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const totalGMV = bookings.reduce((sum, b) => sum + b.totalAmount, 0) + 18500000;
  const platformFee = Math.round(totalGMV * 0.1); // 10% platform take rate

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#2E1A12] text-white flex flex-col justify-between shrink-0 shadow-xl">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF5C8D] to-[#E83D70] text-white flex items-center justify-center font-black shadow-md">
                👑
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight block">Admin Portal</span>
                <span className="text-[10px] text-[#FFD9E2] uppercase tracking-widest block font-bold">FlexiDesk Hub</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1.5 text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                activeTab === 'overview' ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-md' : 'text-stone-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Toàn Cảnh Sàn</span>
            </button>

            <button
              onClick={() => setActiveTab('cafes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                activeTab === 'cafes' ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-md' : 'text-stone-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Quán Cà Phê</span>
              <span className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{cafes.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                activeTab === 'users' ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-md' : 'text-stone-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Người Dùng & Phân Quyền</span>
              <span className="ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{users.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('promotions')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                activeTab === 'promotions' ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-md' : 'text-stone-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>Mã Giảm Giá / Voucher</span>
              <span className="ml-auto text-[10px] bg-[#FF5C8D] px-2 py-0.5 rounded-full text-white">{promotions.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                activeTab === 'database' ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-md' : 'text-stone-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Cơ Sở Dữ Liệu & Sao Lưu</span>
            </button>
          </nav>
        </div>

        {/* User profile */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={currentUser?.name}
                className="w-9 h-9 rounded-xl object-cover border border-white/20"
              />
              <div className="text-left">
                <div className="font-bold text-xs truncate max-w-[110px]">{currentUser?.name}</div>
                <div className="text-[10px] text-[#FFD9E2] font-bold">Admin Cấp Cao</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-[#FFD9E2] hover:text-white text-xs font-bold p-1"
            >
              Thoát
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:px-8 md:px-14 lg:px-16 py-8 overflow-y-auto w-full max-w-[1920px] mx-auto">
        
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#2E1A12]">
              Bảng Quản Trị Hệ Thống FlexiDesk
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Toàn quyền quản lý dữ liệu trực tuyến, thêm sửa xóa quán, phân quyền thành viên và sao lưu database.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-[#FFF9EE] text-[#2E1A12] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-[#FFD9E2]">
              <span className="w-2 h-2 rounded-full bg-[#FF5C8D] animate-pulse"></span>
              File: data/db.json (Permanent Storage)
            </span>
            <Link
              to="/"
              className="p-2.5 rounded-2xl bg-white border border-[#FFD9E2] text-stone-700 hover:text-[#FF5C8D] hover:bg-[#FCECEF] font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Xem Web Khách</span>
            </Link>
          </div>
        </div>

        {notice && (
          <div className="mb-6 bg-[#FCECEF] border-2 border-[#FFD9E2] text-[#2E1A12] p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-[#FF5C8D]" />
            <span>{notice}</span>
          </div>
        )}

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-[#FFD9E2]/80 shadow-xs">
                <span className="text-[11px] font-bold text-stone-400 uppercase">Tổng Doanh Thu Toàn Sàn</span>
                <div className="text-2xl font-black text-[#FF5C8D] mt-1">{formatVND(totalGMV)}</div>
                <div className="text-[11px] text-[#FF5C8D] font-bold mt-1">Phí sàn 10%: {formatVND(platformFee)}</div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#FFD9E2]/80 shadow-xs">
                <span className="text-[11px] font-bold text-stone-400 uppercase">Quán Cà Phê Đối Tác</span>
                <div className="text-2xl font-black text-[#2E1A12] mt-1">{cafes.length} quán</div>
                <div className="text-[11px] text-stone-500 mt-1">Phủ khắp 6 quận trọng điểm</div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#FFD9E2]/80 shadow-xs">
                <span className="text-[11px] font-bold text-stone-400 uppercase">Tổng Thành Viên</span>
                <div className="text-2xl font-black text-[#2E1A12] mt-1">{users.length} tài khoản</div>
                <div className="text-[11px] text-stone-500 mt-1">
                  {users.filter(u => u.role === 'customer').length} Khách • {users.filter(u => u.role === 'partner').length} Chủ quán
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#FFD9E2]/80 shadow-xs">
                <span className="text-[11px] font-bold text-stone-400 uppercase">Tổng Lượt Đặt Chỗ</span>
                <div className="text-2xl font-black text-[#2E1A12] mt-1">{bookings.length + 512} lượt</div>
                <div className="text-[11px] text-[#FF5C8D] font-bold mt-1">Tỷ lệ hoàn thành 98.4%</div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => { setActiveTab('cafes'); handleOpenAddCafe(); }}
                className="p-5 rounded-3xl bg-white border border-[#FFD9E2]/80 shadow-xs text-left hover:border-[#FF5C8D]/60 transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#FCECEF] text-[#FF5C8D] flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-[#2E1A12]">Thêm Quán Cà Phê Mới</h4>
                <p className="text-xs text-stone-500 mt-1">Khai báo quán, địa chỉ, ảnh hero và tốc độ Wi-Fi</p>
              </button>

              <button
                onClick={() => { setActiveTab('promotions'); setIsPromoModalOpen(true); }}
                className="p-5 rounded-3xl bg-white border border-[#FFD9E2]/80 shadow-xs text-left hover:border-[#FF5C8D]/60 transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#FFF9EE] text-[#FF6433] border border-[#FFD9E2] flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
                  <Ticket className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-[#2E1A12]">Tạo Mã Giảm Giá Mới</h4>
                <p className="text-xs text-stone-500 mt-1">Kích cầu đơn đặt bàn trong các dịp lễ và cuối tuần</p>
              </button>

              <button
                onClick={() => setActiveTab('database')}
                className="p-5 rounded-3xl bg-white border border-[#FFD9E2]/80 shadow-xs text-left hover:border-[#FF5C8D]/60 transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#DDE8FA] text-[#1E3A8A] flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
                  <Database className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-[#2E1A12]">Sao Lưu & Quản Lý Dữ Liệu</h4>
                <p className="text-xs text-stone-500 mt-1">Tải file JSON backup, khôi phục hoặc xem trực tiếp</p>
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 2: CAFES CRUD ================= */}
        {activeTab === 'cafes' && (
          <div className="bg-white rounded-3xl p-6 border border-[#FFD9E2]/60 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-[#2E1A12]">Danh Sách Quán Cà Phê Trên Sàn ({cafes.length})</h3>
                <p className="text-xs text-[#8C7A70]">Toàn quyền thêm quán mới, chỉnh sửa thông tin hoặc xóa quán</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#8C7A70] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={cafeSearch}
                    onChange={(e) => setCafeSearch(e.target.value)}
                    placeholder="Tìm theo tên quán..."
                    className="pl-9 pr-3 py-2 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-xs text-[#2E1A12] focus:ring-2 focus:ring-[#FF5C8D] outline-none w-48"
                  />
                </div>
                <button
                  onClick={handleOpenAddCafe}
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-md hover:shadow-lg hover:shadow-[#FF5C8D]/25 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Quán Mới</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#FFD9E2]/60 text-[#8C7A70] uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">Ảnh & Tên Quán</th>
                    <th className="py-3 px-4">Khu Vực</th>
                    <th className="py-3 px-4">Chủ Quán / Quản Lý</th>
                    <th className="py-3 px-4">Wi-Fi & Độ Ồn</th>
                    <th className="py-3 px-4">Số Bàn</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FFD9E2]/30">
                  {filteredCafes.map(c => (
                    <tr key={c.id} className="hover:bg-[#FFF9EE]/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={c.heroImage} alt={c.name} className="w-14 h-11 rounded-xl object-cover shrink-0 border border-[#FFD9E2]/50" />
                          <div>
                            <div className="font-bold text-[#2E1A12] text-sm">{c.name}</div>
                            <div className="text-[11px] text-[#8C7A70]">{c.address}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-[#FFF9EE] border border-[#FFD9E2]/60 text-[#2E1A12] px-2.5 py-1 rounded-full font-bold">{c.district}</span>
                      </td>
                      <td className="py-3 px-4">
                        {(() => {
                          const owner = users.find(u => u.cafeId === c.id || c.ownerId === u.id);
                          if (owner) {
                            return (
                              <div className="flex items-center gap-2">
                                <img src={owner.avatar} alt={owner.name} className="w-6 h-6 rounded-full border border-[#FFD9E2] object-cover shrink-0" />
                                <div>
                                  <div className="font-bold text-[#2E1A12] text-[11px] leading-tight">{owner.name}</div>
                                  <div className="text-[10px] text-[#8C7A70]">{owner.email}</div>
                                </div>
                              </div>
                            );
                          }
                          return (
                            <button
                              onClick={() => handleOpenAddUser(c.id)}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FF5C8D] bg-[#FCECEF] hover:bg-[#FFD9E2] border border-[#FFD9E2] px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                              title="Tạo tài khoản chủ quán và gán quyền cho quán này"
                            >
                              <UserPlus className="w-3 h-3" />
                              <span>+ Gán Chủ Quán</span>
                            </button>
                          );
                        })()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#2E1A12]">{c.features.wifiSpeedMbps} Mbps</div>
                        <div className="text-[11px] text-[#8C7A70]">{c.features.noiseLevel}</div>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#FF5C8D]">
                        {c.tables.length} loại bàn
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Link
                          to={`/cafes/${c.id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-[#8C7A70] hover:text-[#2E1A12]"
                          title="Xem trang web khách"
                        >
                          <ExternalLink className="w-4 h-4 inline" />
                        </Link>
                        <button
                          onClick={() => handleOpenEditCafe(c)}
                          className="p-1.5 rounded-lg text-[#8C7A70] hover:text-[#FF5C8D]"
                          title="Sửa quán"
                        >
                          <Edit3 className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDeleteCafe(c.id, c.name)}
                          className="p-1.5 rounded-lg text-[#8C7A70] hover:text-rose-600"
                          title="Xóa quán"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: USERS & ROLES ================= */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl p-6 border border-[#FFD9E2]/60 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-[#2E1A12]">Quản Lý Người Dùng & Phân Quyền ({users.length})</h3>
                <p className="text-xs text-[#8C7A70]">Tạo tài khoản, phân quyền chủ quán và gán quyền quản lý cơ sở quán tương ứng</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#8C7A70] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Tìm theo tên, email..."
                    className="pl-9 pr-3 py-2 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-xs text-[#2E1A12] focus:ring-2 focus:ring-[#FF5C8D] outline-none w-48"
                  />
                </div>

                <button
                  onClick={() => handleOpenAddUser()}
                  className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-md hover:shadow-lg hover:shadow-[#FF5C8D]/25 transition-all shrink-0 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Tạo Tài Khoản Chủ Quán</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#FFD9E2]/60 text-[#8C7A70] uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">Thành Viên</th>
                    <th className="py-3 px-4">Số Điện Thoại</th>
                    <th className="py-3 px-4">Vai Trò (Role)</th>
                    <th className="py-3 px-4">Quán Gán Quyền Quản Trị</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FFD9E2]/30">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-[#FFF9EE]/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#FFD9E2]" />
                          <div>
                            <div className="font-bold text-[#2E1A12] flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.role === 'partner' && (
                                <span className="text-[9px] bg-[#FCECEF] text-[#FF5C8D] font-bold px-1.5 py-0.2 rounded border border-[#FFD9E2]">
                                  Chủ Quán
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#8C7A70]">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-[#2E1A12]">{u.phone}</td>
                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => {
                            const newRole = e.target.value as UserRole;
                            if (newRole === 'partner' && !u.cafeId) {
                              handleOpenEditUser({ ...u, role: newRole });
                            } else {
                              handleChangeRole(u.id, newRole);
                            }
                          }}
                          className={`font-bold px-3 py-1 rounded-full text-[11px] outline-none border cursor-pointer ${
                            u.role === 'admin' ? 'bg-[#FEF0C7] text-amber-900 border-amber-300' :
                            u.role === 'partner' ? 'bg-[#FCECEF] text-[#FF5C8D] border-[#FFD9E2]' :
                            'bg-[#DDE8FA] text-blue-900 border-[#BFDBFE]'
                          }`}
                        >
                          <option value="customer">Khách Hàng (Customer)</option>
                          <option value="partner">Chủ Quán (Partner)</option>
                          <option value="admin">Quản Trị Viên (Admin)</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        {u.role === 'partner' ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={u.cafeId || ''}
                              onChange={(e) => handleQuickAssignCafe(u.id, e.target.value)}
                              className={`text-[11px] font-bold py-1 px-2.5 rounded-xl border outline-none cursor-pointer max-w-[200px] truncate ${
                                u.cafeId
                                  ? 'bg-[#FFF9EE] text-[#2E1A12] border-[#FF5C8D]/60'
                                  : 'bg-rose-50 text-rose-600 border-rose-300 animate-pulse'
                              }`}
                            >
                              <option value="">-- Chọn quán để gán --</option>
                              {cafes.map(c => (
                                <option key={c.id} value={c.id}>
                                  {c.name} ({c.district})
                                </option>
                              ))}
                            </select>
                            {u.cafeId && (
                              <Link
                                to={`/cafes/${u.cafeId}`}
                                target="_blank"
                                className="text-stone-400 hover:text-[#FF5C8D] p-1"
                                title="Xem trang web quán"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </div>
                        ) : u.role === 'admin' ? (
                          <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-amber-600" />
                            <span>Toàn quyền sàn</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-stone-400 italic">
                            — (Khách hàng)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          u.status === 'active' ? 'bg-[#FCECEF] text-[#FF5C8D] border border-[#FFD9E2]' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {u.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        {u.role === 'partner' && (
                          <button
                            onClick={() => handleLoginAsPartner(u)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors inline-flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                            title="Đăng nhập thử vào POS / Quản lý của quán này"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span className="hidden xl:inline">Vào Dashboard</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditUser(u)}
                          className="p-1.5 rounded-lg text-[#8C7A70] hover:text-[#FF5C8D] hover:bg-[#FCECEF] cursor-pointer"
                          title="Chỉnh sửa tài khoản & quán gán"
                        >
                          <Edit3 className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.status)}
                          className="p-1.5 rounded-lg text-[#8C7A70] hover:text-[#2E1A12] hover:bg-[#FFF9EE] cursor-pointer"
                          title={u.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa'}
                        >
                          {u.status === 'active' ? <Lock className="w-4 h-4 inline" /> : <Unlock className="w-4 h-4 inline text-[#FF5C8D]" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="p-1.5 rounded-lg text-[#8C7A70] hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Xóa người dùng"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 4: PROMOTIONS ================= */}
        {activeTab === 'promotions' && (
          <div className="bg-white rounded-3xl p-6 border border-[#FFD9E2]/60 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-[#2E1A12]">Mã Khuyến Mãi / Voucher ({promotions.length})</h3>
                <p className="text-xs text-[#8C7A70]">Khách hàng có thể nhập các mã này tại bước Đặt Chỗ để được giảm giá</p>
              </div>

              <button
                onClick={() => setIsPromoModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white font-bold text-xs px-4 py-2.5 rounded-full shadow-md hover:shadow-lg hover:shadow-[#FF5C8D]/25 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Mã Mới</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {promotions.map(promo => (
                <div key={promo.code} className="p-4 rounded-2xl border-2 border-[#FFD9E2] bg-[#FFF9EE]/70 flex flex-col justify-between hover:border-[#FF5C8D]/50 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-sm bg-[#FCECEF] text-[#FF5C8D] px-3 py-1 rounded-xl border border-[#FFD9E2]">
                        {promo.code}
                      </span>
                      <span className="text-[10px] bg-[#FCECEF] text-[#FF5C8D] font-bold px-2 py-0.5 rounded-full border border-[#FFD9E2]">
                        Đang hoạt động
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-[#2E1A12] mt-2">{promo.name}</h4>
                    <p className="text-[11px] text-[#8C7A70] mt-1">{promo.description}</p>
                    <div className="text-xs font-bold text-[#FF5C8D] mt-2">
                      {promo.discountType === 'fixed' ? `Giảm ${formatVND(promo.value)}` : `Giảm ${promo.value}%`}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#FFD9E2]/60 flex items-center justify-between mt-3 text-xs">
                    <span className="text-[10px] text-[#8C7A70]">Đơn tối thiểu: {formatVND(promo.minOrder)}</span>
                    <button
                      onClick={() => handleDeletePromo(promo.code)}
                      className="text-[#8C7A70] hover:text-rose-600 p-1"
                      title="Xóa mã"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: DATABASE & BACKUP ================= */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFD9E2]/60 shadow-sm">
              <h3 className="text-xl font-extrabold text-[#2E1A12] mb-1 flex items-center gap-2">
                <Database className="w-5 h-5 text-[#FF5C8D]" />
                <span>Cơ Sở Dữ Liệu Trực Tuyến & Sao Lưu (Permanent Storage)</span>
              </h3>
              <p className="text-xs text-[#8C7A70] mb-6">
                Dữ liệu được lưu trữ trực tiếp vào file <code>data/db.json</code> trên máy tính. Dù bạn tắt và khởi động lại server, toàn bộ dữ liệu bạn tạo vẫn sẽ được giữ nguyên 100%!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Export */}
                <button
                  onClick={handleExportJSON}
                  className="p-5 rounded-2xl border-2 border-[#FFD9E2] bg-[#FCECEF]/40 text-left hover:bg-[#FCECEF] transition-all"
                >
                  <Download className="w-6 h-6 text-[#FF5C8D] mb-2" />
                  <h4 className="font-bold text-sm text-[#2E1A12]">Xuất File Sao Lưu (.JSON)</h4>
                  <p className="text-[11px] text-[#8C7A70] mt-1">Tải về toàn bộ database để lưu trữ hoặc nộp báo cáo môn học</p>
                </button>

                {/* Import */}
                <label className="p-5 rounded-2xl border-2 border-[#BFDBFE] bg-[#DDE8FA]/40 text-left hover:bg-[#DDE8FA] transition-all cursor-pointer block">
                  <Upload className="w-6 h-6 text-blue-600 mb-2" />
                  <h4 className="font-bold text-sm text-blue-950">Nhập File Dữ Liệu (.JSON)</h4>
                  <p className="text-[11px] text-[#8C7A70] mt-1">Khôi phục lại dữ liệu từ một bản sao lưu trước đó</p>
                  <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                </label>

                {/* Reset */}
                <button
                  onClick={handleResetDefault}
                  className="p-5 rounded-2xl border-2 border-rose-200 bg-rose-50/50 text-left hover:bg-rose-50 transition-all"
                >
                  <RotateCcw className="w-6 h-6 text-rose-600 mb-2" />
                  <h4 className="font-bold text-sm text-rose-900">Khôi Phục Gốc Ban Đầu</h4>
                  <p className="text-[11px] text-[#8C7A70] mt-1">Đặt lại danh sách 4 quán và người dùng mẫu ban đầu</p>
                </button>
              </div>
            </div>

            {/* Live Database Viewer */}
            <div className="bg-[#2E1A12] text-stone-200 rounded-3xl p-6 shadow-card font-mono text-xs border border-[#FFD9E2]/30">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-3">
                <span className="flex items-center gap-2 font-bold text-[#FF5C8D]">
                  <FileJson className="w-4 h-4" /> data/db.json (Live View)
                </span>
                <span className="text-[10px] text-stone-400">Cập nhật tự động mỗi khi thao tác trên giao diện</span>
              </div>
              <pre className="max-h-80 overflow-y-auto overflow-x-auto text-[11px] leading-relaxed text-[#FFD9E2]/90">
                {rawJson}
              </pre>
            </div>
          </div>
        )}

      </main>

      {/* ================= MODAL: ADD/EDIT CAFE ================= */}
      {isCafeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-[#FFD9E2]">
            <button
              onClick={() => setIsCafeModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#8C7A70] hover:text-[#2E1A12] rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-lg text-[#2E1A12] mb-4">
              {editingCafe ? 'Chỉnh Sửa Quán Cà Phê' : 'Thêm Quán Cà Phê Mới Vào Sàn'}
            </h3>

            <form onSubmit={handleSaveCafe} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#2E1A12] block mb-1">Tên Quán Cà Phê *</label>
                <input
                  type="text"
                  required
                  value={cafeFormData.name}
                  onChange={(e) => setCafeFormData({ ...cafeFormData, name: e.target.value })}
                  placeholder="Ví dụ: Kaffeine Hub"
                  className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-[#2E1A12] text-sm font-bold focus:ring-2 focus:ring-[#FF5C8D] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#2E1A12] block mb-1">Khẩu Hiệu Ngắn (Tagline)</label>
                <input
                  type="text"
                  value={cafeFormData.tagline}
                  onChange={(e) => setCafeFormData({ ...cafeFormData, tagline: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-[#2E1A12] text-sm focus:ring-2 focus:ring-[#FF5C8D] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#2E1A12] block mb-1">Địa Chỉ Số Nhà & Đường</label>
                  <input
                    type="text"
                    required
                    value={cafeFormData.address}
                    onChange={(e) => setCafeFormData({ ...cafeFormData, address: e.target.value })}
                    placeholder="123 Đường Số..."
                    className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-[#2E1A12] text-sm focus:ring-2 focus:ring-[#FF5C8D] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#2E1A12] block mb-1">Khu Vực Quận</label>
                  <select
                    value={cafeFormData.district}
                    onChange={(e) => setCafeFormData({ ...cafeFormData, district: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-[#2E1A12] text-sm font-bold focus:ring-2 focus:ring-[#FF5C8D] outline-none"
                  >
                    {DISTRICTS.filter(d => d !== 'Tất cả khu vực').map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#2E1A12] block mb-1">Tốc Độ Wi-Fi (Mbps)</label>
                  <input
                    type="number"
                    value={cafeFormData.wifiSpeedMbps}
                    onChange={(e) => setCafeFormData({ ...cafeFormData, wifiSpeedMbps: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-[#2E1A12] text-sm font-bold focus:ring-2 focus:ring-[#FF5C8D] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#2E1A12] block mb-1">Mức Độ Ồn</label>
                  <select
                    value={cafeFormData.noiseLevel}
                    onChange={(e) => setCafeFormData({ ...cafeFormData, noiseLevel: e.target.value as any })}
                    className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-[#2E1A12] text-sm font-semibold focus:ring-2 focus:ring-[#FF5C8D] outline-none"
                  >
                    <option value="Rất yên tĩnh">Rất yên tĩnh</option>
                    <option value="Yên tĩnh">Yên tĩnh</option>
                    <option value="Vừa phải">Vừa phải</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#2E1A12] block mb-1">Link Ảnh Bìa Quán (URL)</label>
                <input
                  type="url"
                  value={cafeFormData.heroImage}
                  onChange={(e) => setCafeFormData({ ...cafeFormData, heroImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-xs text-[#2E1A12] focus:ring-2 focus:ring-[#FF5C8D] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#2E1A12] block mb-1">Mô Tả Quán</label>
                <textarea
                  rows={2}
                  value={cafeFormData.description}
                  onChange={(e) => setCafeFormData({ ...cafeFormData, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-xs text-[#2E1A12] focus:ring-2 focus:ring-[#FF5C8D] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white font-extrabold rounded-full text-xs shadow-md hover:shadow-lg hover:shadow-[#FF5C8D]/25 mt-4 transition-all"
              >
                {editingCafe ? 'Lưu Thay Đổi Quán' : 'Tạo Quán Mới Lên Sàn'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD PROMO ================= */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-xs border border-[#FFD9E2]">
            <button
              onClick={() => setIsPromoModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#8C7A70] hover:text-[#2E1A12] rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-lg text-[#2E1A12] mb-4">Tạo Mã Giảm Giá Mới</h3>

            <form onSubmit={handleSavePromo} className="space-y-3.5">
              <div>
                <label className="font-bold text-[#2E1A12] block mb-1">Mã Code (In Hoa) *</label>
                <input
                  type="text"
                  required
                  value={promoFormData.code}
                  onChange={(e) => setPromoFormData({ ...promoFormData, code: e.target.value })}
                  placeholder="VÍ DỤ: FLEXI50"
                  className="w-full p-2.5 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] font-black text-sm uppercase text-[#2E1A12] focus:ring-2 focus:ring-[#FF5C8D] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#2E1A12] block mb-1">Tên Ưu Đãi *</label>
                <input
                  type="text"
                  required
                  value={promoFormData.name}
                  onChange={(e) => setPromoFormData({ ...promoFormData, name: e.target.value })}
                  placeholder="Khuyến Mãi Mùa Hè"
                  className="w-full p-2.5 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] font-bold text-[#2E1A12] focus:ring-2 focus:ring-[#FF5C8D] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#2E1A12] block mb-1">Loại Giảm</label>
                  <select
                    value={promoFormData.discountType}
                    onChange={(e) => setPromoFormData({ ...promoFormData, discountType: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] font-semibold text-[#2E1A12] focus:ring-2 focus:ring-[#FF5C8D] outline-none"
                  >
                    <option value="fixed">Số tiền (VNĐ)</option>
                    <option value="percent">Phần trăm (%)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#2E1A12] block mb-1">Giá Trị Giảm</label>
                  <input
                    type="number"
                    required
                    value={promoFormData.value}
                    onChange={(e) => setPromoFormData({ ...promoFormData, value: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] font-bold text-[#2E1A12] focus:ring-2 focus:ring-[#FF5C8D] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#2E1A12] block mb-1">Đơn Hàng Tối Thiểu (VNĐ)</label>
                <input
                  type="number"
                  step="10000"
                  value={promoFormData.minOrder}
                  onChange={(e) => setPromoFormData({ ...promoFormData, minOrder: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] font-semibold text-[#2E1A12] focus:ring-2 focus:ring-[#FF5C8D] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:shadow-lg hover:shadow-[#FF5C8D]/25 text-white font-extrabold rounded-full text-xs shadow-md mt-2 transition-all"
              >
                Kích Hoạt Mã Ngay
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT PARTNER & USER ================= */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-xs border border-[#FFD9E2]">
            <button
              onClick={() => setIsUserModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-[#8C7A70] hover:text-[#2E1A12] rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-[#FCECEF] text-[#FF5C8D] flex items-center justify-center shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#2E1A12]">
                  {editingUser ? 'Chỉnh Sửa Tài Khoản Phân Quyền' : 'Tạo Tài Khoản Chủ Quán / Admin'}
                </h3>
                <p className="text-[11px] text-[#8C7A70]">
                  Phân quyền quản trị: Chủ quán quản lý cơ sở hoặc Quản trị viên toàn sàn
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 mt-4">
              <div>
                <label className="font-bold text-[#2E1A12] block mb-1">Họ và Tên *</label>
                <input
                  type="text"
                  required
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  placeholder="Ví dụ: Lê Thị Bích Trâm"
                  className="w-full p-2.5 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] font-semibold text-[#2E1A12] text-xs focus:ring-2 focus:ring-[#FF5C8D] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#2E1A12] block mb-1">Email Đăng Nhập *</label>
                  <input
                    type="email"
                    required
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    placeholder="chubotanica@flexidesk.vn"
                    className="w-full p-2.5 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] font-semibold text-[#2E1A12] text-xs focus:ring-2 focus:ring-[#FF5C8D] outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#2E1A12] block mb-1">Mật Khẩu *</label>
                  <input
                    type="text"
                    required
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    placeholder="Mặc định: 123"
                    className="w-full p-2.5 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] font-semibold text-[#2E1A12] text-xs focus:ring-2 focus:ring-[#FF5C8D] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#2E1A12] block mb-1">Số Điện Thoại</label>
                <input
                  type="tel"
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                  placeholder="0918 888 999"
                  className="w-full p-2.5 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] font-semibold text-[#2E1A12] text-xs focus:ring-2 focus:ring-[#FF5C8D] outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#2E1A12] block mb-1">Vai Trò Hệ Thống (Role)</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setUserFormData({ ...userFormData, role: 'partner' })}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      userFormData.role === 'partner'
                        ? 'border-[#FF5C8D] bg-[#FCECEF] text-[#FF5C8D] font-extrabold shadow-2xs'
                        : 'border-[#FFD9E2]/60 bg-white text-stone-600 hover:bg-[#FFF9EE]'
                    }`}
                  >
                    <Coffee className="w-4 h-4 mx-auto mb-1" />
                    <span className="block text-xs">Chủ Quán (Partner)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserFormData({ ...userFormData, role: 'admin' })}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      userFormData.role === 'admin'
                        ? 'border-amber-500 bg-amber-50 text-amber-800 font-extrabold shadow-2xs'
                        : 'border-[#FFD9E2]/60 bg-white text-stone-600 hover:bg-[#FFF9EE]'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 mx-auto mb-1" />
                    <span className="block text-xs">Quản Trị Viên (Admin)</span>
                  </button>
                </div>
              </div>

              {/* Admin note when Admin is selected */}
              {userFormData.role === 'admin' && (
                <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="text-[11px] leading-relaxed">
                    Tài khoản <strong>Quản Trị Viên (Admin)</strong> có toàn quyền cao nhất trên toàn hệ thống (quản lý toàn bộ quán cà phê, thực đơn, phân quyền và dữ liệu sao lưu).
                  </div>
                </div>
              )}

              {/* Cafe Assignment Selection */}
              {userFormData.role === 'partner' && (
                <div className="p-3.5 bg-gradient-to-br from-[#FFF9EE] to-[#FCECEF]/40 rounded-2xl border-2 border-[#FFD9E2] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-extrabold text-[#2E1A12] text-xs flex items-center gap-1.5">
                      <Store className="w-4 h-4 text-[#FF5C8D]" />
                      <span>Gán Quán Cà Phê Quản Trị *</span>
                    </label>
                    <span className="text-[10px] text-[#FF5C8D] font-bold bg-[#FCECEF] px-2 py-0.5 rounded-full">
                      Quyền Quản Trị Quán
                    </span>
                  </div>

                  <select
                    required
                    value={userFormData.cafeId}
                    onChange={(e) => setUserFormData({ ...userFormData, cafeId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#FFD9E2] font-bold text-xs text-[#2E1A12] focus:ring-2 focus:ring-[#FF5C8D] outline-none cursor-pointer"
                  >
                    <option value="">-- Chọn quán cà phê được gán quyền --</option>
                    {cafes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.address}, {c.district}
                      </option>
                    ))}
                  </select>

                  <div className="text-[10px] text-stone-500 leading-relaxed bg-white/80 p-2 rounded-xl border border-[#FFD9E2]/60">
                    💡 <strong>Quyền hạn:</strong> Tài khoản này sẽ được cấp quyền đăng nhập vào <strong>Partner Dashboard</strong>, toàn quyền quản lý thực đơn đồ uống, sơ đồ bàn và xác nhận check-in thu tiền của quán đã chọn.
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-[#FFD9E2]/50">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2.5 rounded-full border border-stone-200 text-stone-500 hover:bg-stone-50 font-bold cursor-pointer"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white font-extrabold rounded-full shadow-md hover:shadow-lg hover:shadow-[#FF5C8D]/25 transition-all cursor-pointer"
                >
                  {editingUser ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản & Gán Quyền'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
