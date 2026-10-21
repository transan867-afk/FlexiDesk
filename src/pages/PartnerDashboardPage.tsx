import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/databaseService';
import { Cafe, MenuItem, TableSeat, BookingOrder, MenuCategoryConfig } from '../types';
import { formatVND, formatDateVN } from '../utils/formatters';
import { calculateBookingCountdown } from '../utils/countdown';
import { InteractiveSeatMap } from '../components/cafe/InteractiveSeatMap';
import {
  LayoutDashboard,
  Coffee,
  ShoppingBag,
  Users,
  CalendarCheck,
  Settings,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  XCircle,
  ExternalLink,
  DollarSign,
  TrendingUp,
  Receipt,
  QrCode,
  Zap,
  Volume2,
  Wifi,
  X,
  Store,
  Clock,
  ArrowRight,
  Upload,
  Clipboard,
  FolderTree,
  Tag,
  Image as ImageIcon,
  BarChart3,
  Timer,
  Check,
  AlertCircle,
  ChevronRight
} from 'lucide-react';

export const PartnerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  // Active view tab (Added 'reports' tab)
  const [activeTab, setActiveTab] = useState<'pos' | 'menu' | 'tables' | 'orders' | 'reports' | 'settings'>('pos');

  // Load cafe managed by this partner
  const [cafe, setCafe] = useState<Cafe | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [bookings, setBookings] = useState<BookingOrder[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  // POS State (Menu first by default!)
  const [posCart, setPosCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [posCategory, setPosCategory] = useState<string>('all');
  const [posSearch, setPosSearch] = useState<string>('');
  const [posCheckInCode, setPosCheckInCode] = useState<string>('');
  const [posReceiptModal, setPosReceiptModal] = useState<any>(null);
  const [posViewMode, setPosViewMode] = useState<'menu' | 'seatmap'>('menu'); // Đẩy menu gọi món lên trước!
  const [posOrderType, setPosOrderType] = useState<'dine_in' | 'takeaway'>('dine_in'); // Tại quán vs Mang đi
  const [selectedPosTable, setSelectedPosTable] = useState<TableSeat | null>(null);
  const [posBookingFilter, setPosBookingFilter] = useState<'active' | 'all' | 'completed' | 'expired'>('active');
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<BookingOrder | null>(null);
  const [countdownTick, setCountdownTick] = useState<number>(0);

  // Menu Modal State
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [menuFormData, setMenuFormData] = useState({
    name: '',
    category: 'signature' as MenuItem['category'],
    categoryName: 'Sparkling',
    price: 45000,
    image: '',
    description: '',
    isAvailable: true,
  });

  // Menu Category Management State
  const [categories, setCategories] = useState<MenuCategoryConfig[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategories, setEditingCategories] = useState<MenuCategoryConfig[]>([]);
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  // Table Modal State
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableSeat | null>(null);
  const [tableFormData, setTableFormData] = useState({
    code: 'T01',
    name: 'Bàn Đơn Làm Việc',
    type: 'single' as TableSeat['type'],
    capacity: 1,
    zone: 'Khu Yên Tĩnh (Quiet Zone)' as TableSeat['zone'],
    hourlyRate: 0,
    status: 'available' as TableSeat['status'],
    featuresStr: '2 ổ cắm điện, Ghế êm',
  });

  // Settings State
  const [settingsFormData, setSettingsFormData] = useState({
    name: '',
    tagline: '',
    address: '',
    district: '',
    openHours: { open: '07:30', close: '22:30' },
    wifiSpeedMbps: 200,
    noiseLevel: 'Yên tĩnh' as Cafe['features']['noiseLevel'],
    powerSockets: 'Mỗi bàn đều có' as Cafe['features']['powerSockets'],
  });

  const loadData = () => {
    // Check auto-release first
    const autoExpired = db.checkAndAutoReleaseExpiredBookings();
    if (autoExpired.length > 0) {
      const names = autoExpired.map(b => `${b.id} (Bàn ${b.tableName})`).join(', ');
      triggerNotice(`⏱️ Đã tự động giải phóng bàn cho đơn quá 15 phút chưa check-in: ${names} về trạng thái "Trống"!`);
    }

    // Find cafe for this partner
    const allCafes = db.getCafes();
    let currentCafe: Cafe | undefined;

    if (currentUser?.cafeId) {
      currentCafe = db.getCafeById(currentUser.cafeId);
    }
    if (!currentCafe && currentUser?.id) {
      currentCafe = allCafes.find(c => c.ownerId === currentUser.id);
    }
    // Fallback to cafe-1 if none associated
    if (!currentCafe) {
      currentCafe = allCafes[0];
    }

    if (currentCafe) {
      setCafe(currentCafe);
      setMenuItems(db.getMenuByCafe(currentCafe.id));
      setCategories(db.getMenuCategories(currentCafe.id));
      setBookings(db.getBookingsByCafe(currentCafe.id));
      setSettingsFormData({
        name: currentCafe.name,
        tagline: currentCafe.tagline,
        address: currentCafe.address,
        district: currentCafe.district,
        openHours: currentCafe.openHours,
        wifiSpeedMbps: currentCafe.features.wifiSpeedMbps,
        noiseLevel: currentCafe.features.noiseLevel,
        powerSockets: currentCafe.features.powerSockets,
      });
    }
  };

  useEffect(() => {
    loadData();

    // Listen to database events
    const unsubscribe = db.subscribe(loadData);
    const handleDbUpdate = () => loadData();
    window.addEventListener('flexidesk_db_updated', handleDbUpdate);

    // 1-second live countdown timer and auto-release detector
    const timer = setInterval(() => {
      setCountdownTick(prev => prev + 1);
      const newlyExpired = db.checkAndAutoReleaseExpiredBookings();
      if (newlyExpired.length > 0) {
        loadData();
      }
    }, 1000);

    return () => {
      unsubscribe();
      window.removeEventListener('flexidesk_db_updated', handleDbUpdate);
      clearInterval(timer);
    };
  }, [currentUser]);

  const triggerNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  /* ================= POS ACTIONS ================= */
  const addToPosCart = (item: MenuItem) => {
    setPosCart(prev => {
      const idx = prev.findIndex(p => p.item.id === item.id);
      if (idx > -1) {
        return prev.map((p, i) => i === idx ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updatePosQty = (itemId: string, delta: number) => {
    setPosCart(prev =>
      prev
        .map(p => {
          if (p.item.id === itemId) {
            const newQ = p.quantity + delta;
            return newQ > 0 ? { ...p, quantity: newQ } : null;
          }
          return p;
        })
        .filter(Boolean) as { item: MenuItem; quantity: number }[]
    );
  };

  const handleAssignTableToPos = (table: TableSeat) => {
    if (!cafe) return;
    // Revert previous table to 'available' if changing table
    if (selectedPosTable && selectedPosTable.id !== table.id) {
      db.updateTableStatus(cafe.id, selectedPosTable.id, 'available');
    }

    // Tự động cập nhật status bàn sang 'occupied' (Khách ngồi) ngay khi nhân viên thao tác gán bàn!
    db.updateTableStatus(cafe.id, table.id, 'occupied');
    setSelectedPosTable({ ...table, status: 'occupied' });
    loadData();
    triggerNotice(`Đã gán bàn "${table.code} - ${table.name}" cho đơn và tự động cập nhật trạng thái "Khách ngồi"!`);
  };

  const handleUnassignPosTable = () => {
    if (!cafe || !selectedPosTable) return;
    db.updateTableStatus(cafe.id, selectedPosTable.id, 'available');
    const code = selectedPosTable.code;
    setSelectedPosTable(null);
    loadData();
    triggerNotice(`Đã hủy gán bàn ${code} và đưa về trạng thái "Trống"!`);
  };

  const clearPosCart = () => {
    if (selectedPosTable && cafe) {
      db.updateTableStatus(cafe.id, selectedPosTable.id, 'available');
    }
    setSelectedPosTable(null);
    setPosCart([]);
    loadData();
  };

  const posSubtotal = posCart.reduce((sum, p) => sum + p.item.price * p.quantity, 0);
  const posTax = Math.round(posSubtotal * 0.08); // 8% VAT
  const posTotal = posSubtotal + posTax;

  const handlePosPay = () => {
    if (posCart.length === 0) return;

    if (posOrderType === 'dine_in' && !selectedPosTable) {
      const proceed = window.confirm(
        'Bạn đang chọn đơn "Tại Quán" nhưng chưa gán bàn nào.\n\nNhấn OK để chọn bàn trên sơ đồ ngay, hoặc Cancel để thanh toán nhanh không gán bàn.'
      );
      if (proceed) {
        setPosViewMode('seatmap');
        triggerNotice('Vui lòng bấm vào 1 bàn trên sơ đồ để gán cho đơn này!');
        return;
      }
    }

    // Bàn đã được tự động chuyển sang 'occupied' ngay khi gán, đảm bảo giữ nguyên trạng thái
    if (posOrderType === 'dine_in' && selectedPosTable && cafe) {
      db.updateTableStatus(cafe.id, selectedPosTable.id, 'occupied');
    }

    setPosReceiptModal({
      id: `POS-${Math.floor(100000 + Math.random() * 900000)}`,
      items: [...posCart],
      subtotal: posSubtotal,
      tax: posTax,
      total: posTotal,
      time: new Date().toLocaleTimeString('vi-VN'),
      date: new Date().toLocaleDateString('vi-VN'),
      orderType: posOrderType,
      tableName: selectedPosTable ? `${selectedPosTable.name} (${selectedPosTable.code})` : undefined,
    });

    const isAssigned = posOrderType === 'dine_in' && selectedPosTable;
    setPosCart([]);
    setSelectedPosTable(null);
    loadData();
    triggerNotice(
      `Thanh toán đơn ${posOrderType === 'takeaway' ? 'mang đi' : 'tại quán'} thành công${isAssigned ? ' và bàn tiếp tục ở trạng thái "Khách ngồi"' : ''}!`
    );
  };

  const handleQuickCheckIn = () => {
    if (!posCheckInCode.trim()) return;
    const query = posCheckInCode.trim().toLowerCase();
    const booking = bookings.find(
      b => b.id.toLowerCase() === query || 
           b.customerInfo.name.toLowerCase().includes(query) ||
           b.customerInfo.phone.includes(query)
    );
    if (!booking) {
      alert(`Không tìm thấy đơn đặt chỗ nào khớp với "${posCheckInCode}". Vui lòng kiểm tra lại.`);
      return;
    }

    handleCheckInBooking(booking);
    setPosCheckInCode('');
  };

  const handleCheckInBooking = (booking: BookingOrder) => {
    booking.bookingStatus = 'completed';
    booking.paymentStatus = 'paid';
    booking.remainingAtCafe = 0;
    booking.updatedAt = new Date().toISOString();
    db.saveBooking(booking);
    db.updateTableStatus(booking.cafeId, booking.tableId, 'occupied');
    loadData();
    triggerNotice(`Check-in thành công cho khách ${booking.customerInfo.name} (Bàn ${booking.tableName})! Bàn đã chuyển sang trạng thái "Khách ngồi".`);
  };

  const handleReleaseOrCancelBooking = (booking: BookingOrder) => {
    if (window.confirm(`Bạn có chắc muốn hủy hoặc giải phóng đơn đặt chỗ ${booking.id} của khách "${booking.customerInfo.name}"? Bàn ${booking.tableName} sẽ lập tức chuyển về trạng thái "Trống".`)) {
      db.updateBookingStatus(booking.id, 'cancelled');
      if (booking.cafeId && booking.tableId) {
        db.updateTableStatus(booking.cafeId, booking.tableId, 'available');
      }
      loadData();
      triggerNotice(`Đã giải phóng bàn ${booking.tableName} về trạng thái "Trống"!`);
    }
  };

  /* ================= MENU & CATEGORIES CRUD ================= */
  const handleOpenCategoryModal = () => {
    if (!cafe) return;
    setEditingCategories(JSON.parse(JSON.stringify(categories)));
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategories = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cafe) return;
    const valid = editingCategories.filter(c => c.name.trim().length > 0);
    if (valid.length === 0) {
      alert('Vui lòng giữ ít nhất 1 danh mục có tên hợp lệ.');
      return;
    }
    db.saveMenuCategories(cafe.id, valid);
    setCategories(valid);
    setIsCategoryModalOpen(false);
    triggerNotice('Đã lưu thay đổi danh mục thực đơn thành công!');
    loadData();
  };

  const handleAddCategory = () => {
    const newId = `cat-${Date.now()}`;
    setEditingCategories(prev => [
      ...prev,
      { id: newId, name: 'Danh Mục Mới', viTitle: 'Mô tả danh mục mới' }
    ]);
  };

  const handleDeleteCategory = (catId: string) => {
    const inUseCount = menuItems.filter(i => i.category === catId).length;
    if (inUseCount > 0) {
      if (!window.confirm(`Đang có ${inUseCount} món thuộc danh mục này. Bạn có chắc chắn muốn xóa không?`)) {
        return;
      }
    }
    setEditingCategories(prev => prev.filter(c => c.id !== catId));
  };

  /* ================= IMAGE PASTE & UPLOAD ================= */
  const handlePasteImage = (e: React.ClipboardEvent | ClipboardEvent) => {
    const clipboardData = (e as React.ClipboardEvent).clipboardData || (e as ClipboardEvent).clipboardData;
    if (!clipboardData) return;

    const items = clipboardData.items;
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                setMenuFormData(prev => ({ ...prev, image: event.target!.result as string }));
                triggerNotice('Đã dán ảnh từ clipboard thành công!');
              }
            };
            reader.readAsDataURL(file);
            return;
          }
        }
      }
    }

    const text = clipboardData.getData('text');
    if (text && (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('data:image/'))) {
      setMenuFormData(prev => ({ ...prev, image: text.trim() }));
      triggerNotice('Đã nhận liên kết ảnh từ clipboard!');
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setMenuFormData(prev => ({ ...prev, image: event.target!.result as string }));
          triggerNotice('Đã tải ảnh lên thành công!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.indexOf('image') !== -1) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setMenuFormData(prev => ({ ...prev, image: event.target!.result as string }));
          triggerNotice('Đã nhận ảnh kéo thả thành công!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Window-level paste listener when menu modal is open
  useEffect(() => {
    if (!isMenuModalOpen) return;
    const handleWindowPaste = (e: ClipboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const activeInput = document.activeElement as HTMLInputElement;
      const isNormalTextInput = activeTag === 'input' && activeInput.type === 'text' && activeInput.name !== 'image';
      
      const items = e.clipboardData?.items;
      const hasImageFile = items && Array.from(items).some(item => item.type.indexOf('image') !== -1);
      
      if (hasImageFile || !isNormalTextInput) {
        handlePasteImage(e);
      }
    };

    window.addEventListener('paste', handleWindowPaste);
    return () => window.removeEventListener('paste', handleWindowPaste);
  }, [isMenuModalOpen]);

  /* ================= MENU ITEMS CRUD ================= */
  const handleOpenAddMenu = () => {
    setEditingMenuItem(null);
    const defaultCat = categories.length > 0 ? categories[0] : { id: 'signature', name: 'Sparkling' };
    setMenuFormData({
      name: '',
      category: defaultCat.id,
      categoryName: defaultCat.name,
      price: 45000,
      image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
      description: '',
      isAvailable: true,
    });
    setIsMenuModalOpen(true);
  };

  const handleOpenEditMenu = (item: MenuItem) => {
    setEditingMenuItem(item);
    const matched = categories.find(c => c.id === item.category);
    setMenuFormData({
      name: item.name,
      category: item.category,
      categoryName: matched ? matched.name : item.categoryName,
      price: item.price,
      image: item.image,
      description: item.description,
      isAvailable: item.isAvailable,
    });
    setIsMenuModalOpen(true);
  };

  const handleSaveMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cafe) return;

    const matched = categories.find(c => c.id === menuFormData.category);
    const payload = {
      ...menuFormData,
      categoryName: matched ? matched.name : menuFormData.categoryName,
    };

    if (editingMenuItem) {
      db.updateMenuItem(cafe.id, editingMenuItem.id, payload);
      triggerNotice(`Đã cập nhật món "${menuFormData.name}"!`);
    } else {
      db.createMenuItem(cafe.id, payload);
      triggerNotice(`Đã thêm món mới "${menuFormData.name}" thành công!`);
    }

    setIsMenuModalOpen(false);
    loadData();
  };

  const handleDeleteMenu = (itemId: string, name: string) => {
    if (!cafe) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa món "${name}" khỏi thực đơn?`)) {
      db.deleteMenuItem(cafe.id, itemId);
      triggerNotice(`Đã xóa món "${name}".`);
      loadData();
    }
  };

  const handleToggleMenuAvailability = (itemId: string) => {
    if (!cafe) return;
    db.toggleMenuItemAvailability(cafe.id, itemId);
    loadData();
  };

  /* ================= TABLE CRUD ================= */
  const handleOpenAddTable = () => {
    setEditingTable(null);
    setTableFormData({
      code: `T0${(cafe?.tables.length || 0) + 1}`,
      name: 'Bàn Làm Việc Mới',
      type: 'single',
      capacity: 1,
      zone: 'Khu Yên Tĩnh (Quiet Zone)',
      hourlyRate: 0,
      status: 'available',
      featuresStr: '2 ổ cắm điện, Ghế đệm',
    });
    setIsTableModalOpen(true);
  };

  const handleOpenEditTable = (table: TableSeat) => {
    setEditingTable(table);
    setTableFormData({
      code: table.code,
      name: table.name,
      type: table.type,
      capacity: table.capacity,
      zone: table.zone,
      hourlyRate: table.hourlyRate,
      status: table.status,
      featuresStr: table.features.join(', '),
    });
    setIsTableModalOpen(true);
  };

  const handleSaveTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cafe) return;

    const feats = tableFormData.featuresStr.split(',').map(s => s.trim()).filter(Boolean);

    if (editingTable) {
      db.updateTable(cafe.id, editingTable.id, {
        code: tableFormData.code,
        name: tableFormData.name,
        type: tableFormData.type,
        capacity: tableFormData.capacity,
        zone: tableFormData.zone,
        hourlyRate: tableFormData.hourlyRate,
        status: tableFormData.status,
        features: feats,
      });
      triggerNotice(`Đã cập nhật bàn "${tableFormData.code}"!`);
    } else {
      db.createTable(cafe.id, {
        code: tableFormData.code,
        name: tableFormData.name,
        type: tableFormData.type,
        capacity: tableFormData.capacity,
        zone: tableFormData.zone,
        hourlyRate: tableFormData.hourlyRate,
        status: tableFormData.status,
        features: feats,
        position: { row: 1, col: 1 },
      });
      triggerNotice(`Đã thêm bàn mới "${tableFormData.code}"!`);
    }

    setIsTableModalOpen(false);
    loadData();
  };

  const handleDeleteTable = (tableId: string, code: string) => {
    if (!cafe) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa bàn "${code}"?`)) {
      db.deleteTable(cafe.id, tableId);
      triggerNotice(`Đã xóa bàn "${code}".`);
      loadData();
    }
  };

  const handleToggleTableStatus = (tableId: string, currentStatus: TableSeat['status']) => {
    if (!cafe) return;
    const nextStatus: TableSeat['status'] =
      currentStatus === 'available' ? 'occupied' : currentStatus === 'occupied' ? 'maintenance' : 'available';
    db.updateTableStatus(cafe.id, tableId, nextStatus);
    loadData();
  };

  /* ================= SETTINGS SAVE ================= */
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cafe) return;

    db.updateCafe(cafe.id, {
      name: settingsFormData.name,
      tagline: settingsFormData.tagline,
      address: settingsFormData.address,
      district: settingsFormData.district,
      openHours: settingsFormData.openHours,
      features: {
        ...cafe.features,
        wifiSpeedMbps: settingsFormData.wifiSpeedMbps,
        noiseLevel: settingsFormData.noiseLevel,
        powerSockets: settingsFormData.powerSockets,
      },
    });

    triggerNotice('Đã lưu thông tin quán thành công vào cơ sở dữ liệu trực tuyến!');
    loadData();
  };

  if (!cafe) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-xl font-bold">Đang tải dữ liệu quán...</h2>
      </div>
    );
  }

  const filteredMenuItems = menuItems.filter(item => {
    if (posCategory !== 'all' && item.category !== posCategory) return false;
    if (posSearch && !item.name.toLowerCase().includes(posSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col md:flex-row">
      
      {/* 1. Left Sidebar with Deep Cocoa Mocha & Rose Pink aesthetic */}
      <aside className="w-full md:w-64 bg-[#2E1A12] text-white flex flex-col justify-between shrink-0 shadow-lg">
        <div>
          {/* Logo & Store header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF5C8D] to-[#E83D70] text-white flex items-center justify-center font-black shadow-sm">
                FD
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight block leading-tight">FlexiDesk</span>
                <span className="text-[11px] text-[#FFD9E2] block">POS & Management</span>
              </div>
            </Link>
          </div>

          {/* Current Managed Cafe Badge */}
          <div className="p-4 mx-4 my-4 bg-white/10 rounded-2xl border border-white/10 text-xs">
            <div className="text-[10px] text-[#FFD9E2] uppercase font-bold">Quán đang quản lý</div>
            <div className="font-bold text-sm truncate mt-0.5">{cafe.name}</div>
            <Link
              to={`/cafes/${cafe.id}`}
              target="_blank"
              className="text-[11px] text-[#FFD9E2] hover:text-white flex items-center gap-1 mt-1 font-semibold"
            >
              <span>Xem trang ngoài web</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            {currentUser?.role === 'admin' && (
              <div className="mt-2.5 pt-2.5 border-t border-white/10">
                <label className="text-[10px] text-stone-300 block mb-1 font-bold">Chuyển quán (Quyền Admin):</label>
                <select
                  value={cafe.id}
                  onChange={(e) => {
                    const selected = db.getCafeById(e.target.value);
                    if (selected) {
                      setCafe(selected);
                      setMenuItems(db.getMenuByCafe(selected.id));
                      setCategories(db.getMenuCategories(selected.id));
                      setBookings(db.getBookingsByCafe(selected.id));
                      triggerNotice(`Đã chuyển sang quản lý quán "${selected.name}"!`);
                    }
                  }}
                  className="w-full bg-[#1A0E08] text-white text-[11px] p-1.5 rounded-lg border border-white/20 outline-none font-medium cursor-pointer"
                >
                  {db.getCafes().map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className="px-3 flex md:flex-col overflow-x-auto md:overflow-visible gap-1.5 md:space-y-1 pb-3 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('pos')}
              className={`shrink-0 md:shrink md:w-full whitespace-nowrap flex items-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'pos'
                  ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-md'
                  : 'text-stone-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Bán Hàng & POS</span>
            </button>

            <button
              onClick={() => setActiveTab('menu')}
              className={`shrink-0 md:shrink md:w-full whitespace-nowrap flex items-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'menu'
                  ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-md'
                  : 'text-stone-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Coffee className="w-4 h-4" />
              <span>Quản Lý Món Nước</span>
              <span className="ml-1 md:ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{menuItems.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('tables')}
              className={`shrink-0 md:shrink md:w-full whitespace-nowrap flex items-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'tables'
                  ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-md'
                  : 'text-stone-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Sơ Đồ Bàn & Chỗ</span>
              <span className="ml-1 md:ml-auto text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{cafe.tables.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`shrink-0 md:shrink md:w-full whitespace-nowrap flex items-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-md'
                  : 'text-stone-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Đơn Khách Đặt Chỗ</span>
              <span className="ml-1 md:ml-auto text-[10px] bg-[#FF5C8D] px-2 py-0.5 rounded-full text-white">{bookings.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`shrink-0 md:shrink md:w-full whitespace-nowrap flex items-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'reports'
                  ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-md'
                  : 'text-stone-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Báo Cáo & Thống Kê</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`shrink-0 md:shrink md:w-full whitespace-nowrap flex items-center gap-2 sm:gap-3 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-md'
                  : 'text-stone-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Cài Đặt Quán</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                alt={currentUser?.name}
                className="w-9 h-9 rounded-xl object-cover border border-white/20"
              />
              <div className="text-left">
                <div className="font-bold text-xs truncate max-w-[110px]">{currentUser?.name}</div>
                <div className="text-[10px] text-[#FFD9E2]">Chủ quán (Partner)</div>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-[#FFD9E2] hover:text-white p-2 rounded-lg hover:bg-white/10 text-xs font-bold"
              title="Đăng xuất"
            >
              Thoát
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Workspace */}
      <main className="flex-1 p-4 sm:px-8 md:px-14 lg:px-16 py-8 overflow-y-auto w-full max-w-[1920px] mx-auto">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2E1A12] flex items-center gap-2">
              <span>Xin chào, {currentUser?.name}! 👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Hôm nay quán của bạn đang có <strong className="text-[#FF5C8D]">{cafe.tables.filter(t => t.status === 'occupied').length} bàn</strong> đang phục vụ và <strong className="text-[#FF6433]">{bookings.filter(b => b.bookingStatus === 'confirmed').length} đơn đặt trước</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-[#FFF9EE] text-[#2E1A12] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-[#FFD9E2]">
              <span className="w-2 h-2 rounded-full bg-[#FF5C8D] animate-pulse"></span>
              Đang kết nối Database Online
            </span>
            <Link
              to="/"
              className="p-2.5 rounded-2xl bg-white border border-[#FFD9E2] text-stone-600 hover:text-[#FF5C8D] hover:bg-[#FCECEF] font-semibold text-xs flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Xem Website Khách</span>
            </Link>
          </div>
        </div>

        {/* Floating Success Notice */}
        {notice && (
          <div className="mb-6 bg-[#FCECEF] border-2 border-[#FFD9E2] text-[#2E1A12] p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-[#FF5C8D]" />
            <span>{notice}</span>
          </div>
        )}

        {/* ================= TAB 1: POS & DASHBOARD ================= */}
        {activeTab === 'pos' && (
          <div className="space-y-6">
            
            {/* ================= PHẦN TRÊN: ĐƠN KHÁCH ĐẶT CHỖ HÔM NAY (THAY THẾ BÁO CÁO DOANH THU) ================= */}
            <div className="bg-white rounded-3xl p-5 border border-[#FFD9E2]/80 shadow-card space-y-4">
              
              {/* Header with Title and Quick Check-in */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-[#FF5C8D] bg-[#FCECEF] px-3 py-1 rounded-full border border-[#FFD9E2] flex items-center gap-1.5">
                      <CalendarCheck className="w-3.5 h-3.5" /> Đơn Khách Đặt Chỗ Hôm Nay
                    </span>
                    <span className="text-xs bg-[#FFF9EE] text-[#2E1A12] font-bold px-2.5 py-1 rounded-full border border-[#FFD9E2]/60">
                      Tự động đếm ngược 15p & giải phóng bàn
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-[#2E1A12] mt-1 flex items-center gap-2">
                    <span>Danh Sách Đặt Bàn Chờ Phục Vụ ({bookings.length} đơn)</span>
                  </h3>
                </div>

                {/* Quick Check-in Bar for Online Bookings */}
                <div className="flex items-center gap-2 w-full lg:w-auto">
                  <div className="relative flex-1 lg:w-56">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={posCheckInCode}
                      onChange={(e) => setPosCheckInCode(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleQuickCheckIn()}
                      placeholder="Mã đơn (FD-xxxx) hoặc SĐT..."
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-xs font-bold focus:ring-2 focus:ring-[#FF5C8D] outline-none text-[#2E1A12]"
                    />
                  </div>
                  <button
                    onClick={handleQuickCheckIn}
                    className="bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white text-xs font-bold px-4 py-2 rounded-xl shrink-0 transition-colors shadow-soft flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Check-in Nhanh</span>
                  </button>
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1 text-xs font-bold">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                  {[
                    {
                      id: 'active',
                      label: `Đang chờ phục vụ (${bookings.filter(b => b.bookingStatus === 'confirmed' && calculateBookingCountdown(b.date, b.startTime, b.createdAt).status !== 'expired').length})`
                    },
                    { id: 'all', label: `Tất cả hôm nay (${bookings.length})` },
                    { id: 'completed', label: `Đã Check-in (${bookings.filter(b => b.bookingStatus === 'completed').length})` },
                    { id: 'expired', label: `Hết hạn / Lịch sử (${bookings.filter(b => b.bookingStatus === 'expired' || b.bookingStatus === 'cancelled' || calculateBookingCountdown(b.date, b.startTime, b.createdAt).status === 'expired').length})` },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setPosBookingFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                        posBookingFilter === tab.id
                          ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-xs'
                          : 'bg-[#FFF9EE] text-[#2E1A12] border border-[#FFD9E2] hover:bg-[#FCECEF]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('reports')}
                  className="text-[#FF5C8D] hover:underline font-extrabold flex items-center gap-1 text-[11px] ml-auto py-1"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Mục Báo Cáo & Thống Kê →</span>
                </button>
              </div>

              {/* Bookings Card List */}
              {bookings.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-400 bg-[#FAF7F2] rounded-2xl border border-dashed border-[#FFD9E2]">
                  Chưa có đơn đặt bàn nào hôm nay. Khách đặt bàn qua sàn sẽ lập tức hiển thị tại đây!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[360px] overflow-y-auto pr-1">
                  {bookings
                    .filter(b => {
                      const cd = calculateBookingCountdown(b.date, b.startTime, b.createdAt);
                      const isExpired = b.bookingStatus === 'expired' || b.bookingStatus === 'cancelled' || cd.status === 'expired';
                      const isActive = b.bookingStatus === 'confirmed' && !isExpired;

                      if (posBookingFilter === 'active') return isActive;
                      if (posBookingFilter === 'completed') return b.bookingStatus === 'completed';
                      if (posBookingFilter === 'expired') return isExpired;
                      return true; // 'all'
                    })
                    .map(order => {
                      const countdown = calculateBookingCountdown(order.date, order.startTime, order.createdAt);
                      const isHolding = countdown.status === 'holding' && order.bookingStatus === 'confirmed';
                      const isUpcoming = countdown.status === 'upcoming' && order.bookingStatus === 'confirmed';
                      const isExpired = order.bookingStatus === 'expired' || (countdown.status === 'expired' && order.bookingStatus !== 'completed' && order.bookingStatus !== 'cancelled');

                      return (
                        <div
                          key={order.id}
                          className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between text-xs shadow-2xs ${
                            isHolding
                              ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 ring-2 ring-amber-300/60 animate-pulse'
                              : isExpired
                              ? 'bg-stone-50 border-stone-200 opacity-75'
                              : order.bookingStatus === 'completed'
                              ? 'bg-emerald-50/50 border-emerald-200'
                              : 'bg-white border-[#FFD9E2]/80 hover:border-[#FF5C8D]'
                          }`}
                        >
                          <div>
                            {/* Card Top: Code & Countdown */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-black text-[#FF5C8D] bg-[#FCECEF] border border-[#FFD9E2] px-2 py-0.5 rounded-lg text-[11px]">
                                {order.id}
                              </span>

                              {/* Real-time countdown badge */}
                              {order.bookingStatus === 'completed' ? (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Đã Check-in
                                </span>
                              ) : order.bookingStatus === 'cancelled' ? (
                                <span className="bg-stone-200 text-stone-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  Đã hủy
                                </span>
                              ) : isExpired ? (
                                <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> Hết hạn 15p - Đã trả bàn
                                </span>
                              ) : isHolding ? (
                                <span className="bg-amber-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                                  <Timer className="w-3 h-3 animate-spin" /> Giữ bàn: {countdown.formatted}
                                </span>
                              ) : (
                                <span className="bg-[#FFF9EE] text-[#2E1A12] border border-[#FFD9E2] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-[#FF5C8D]" /> Giờ hẹn: {order.startTime} (Giữ 15p)
                                </span>
                              )}
                            </div>

                            {/* Customer info */}
                            <div className="font-extrabold text-[#2E1A12] text-sm truncate">
                              {order.customerInfo.name}
                            </div>
                            <div className="text-[11px] text-stone-500 mb-2">
                              SĐT: {order.customerInfo.phone}
                            </div>

                            {/* Booking details */}
                            <div className="p-2 rounded-xl bg-white/80 border border-stone-100 space-y-1 text-[11px] text-stone-700">
                              <div className="flex justify-between">
                                <span className="text-stone-500">Vị trí bàn:</span>
                                <span className="font-black text-[#FF5C8D]">{order.tableName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-stone-500">Giờ hẹn check-in:</span>
                                <span className="font-bold">{order.startTime} ({formatDateVN(order.date)})</span>
                              </div>
                              {order.cartItems && order.cartItems.length > 0 && (
                                <div className="text-[10px] text-stone-500 truncate pt-0.5 border-t border-stone-100">
                                  Món: {order.cartItems.map(i => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Card Actions */}
                          <div className="pt-3 mt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedBookingDetails(order)}
                              className="text-[10px] font-bold text-stone-600 hover:text-[#FF5C8D] underline"
                            >
                              Xem QR / Chi tiết
                            </button>

                            <div className="flex items-center gap-1.5">
                              {order.bookingStatus === 'confirmed' && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleReleaseOrCancelBooking(order)}
                                    className="px-2 py-1 bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-700 font-bold text-[10px] rounded-lg border border-stone-200 transition-colors"
                                    title="Hủy đơn và trả bàn trống"
                                  >
                                    Hủy/Trả
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleCheckInBooking(order)}
                                    className="px-3 py-1 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white font-extrabold text-[10px] rounded-lg shadow-soft transition-all"
                                  >
                                    Check-in
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* ================= PHẦN DƯỚI: SPLIT POS SCREEN (ORDER SLIP + MENU GỌI MÓN / SƠ ĐỒ BÀN) ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column (5 cols): Current Sale / Order Slip */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-5 border border-[#FFD9E2]/80 shadow-card flex flex-col justify-between min-h-[500px]">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <h3 className="font-extrabold text-base text-[#2E1A12] flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-[#FF5C8D]" />
                      <span>Hóa Đơn Tại Quầy (Current Sale)</span>
                    </h3>
                    <span className="text-[11px] font-bold text-stone-400">
                      {posCart.length} món
                    </span>
                  </div>

                  {/* Order Type Selector: Tại Quán vs Mang Đi */}
                  <div className="grid grid-cols-2 gap-2 my-3 p-1 bg-[#FFF9EE] border border-[#FFD9E2] rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setPosOrderType('dine_in')}
                      className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                        posOrderType === 'dine_in'
                          ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-xs'
                          : 'text-[#2E1A12] hover:text-[#FF5C8D]'
                      }`}
                    >
                      <span>🪑 Tại Quán (Gán Bàn)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedPosTable) {
                          handleUnassignPosTable();
                        }
                        setPosOrderType('takeaway');
                      }}
                      className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                        posOrderType === 'takeaway'
                          ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-xs'
                          : 'text-[#2E1A12] hover:text-[#FF5C8D]'
                      }`}
                    >
                      <span>🥡 Mang Đi (Takeaway)</span>
                    </button>
                  </div>

                  {/* Selected Table Section */}
                  {posOrderType === 'takeaway' ? (
                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl text-xs text-stone-600 mb-3 flex items-center gap-2">
                      <span className="text-base">🥡</span>
                      <span><strong>Đơn Mang Đi:</strong> Không cần gán bàn trong sơ đồ. Phục vụ đóng gói tại quầy.</span>
                    </div>
                  ) : selectedPosTable ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-950 mb-3 flex items-center justify-between">
                      <div>
                        <div className="font-extrabold flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Bàn đã gán: {selectedPosTable.name} ({selectedPosTable.code})</span>
                        </div>
                        <div className="text-[11px] text-emerald-800 mt-0.5">
                          Khu: {selectedPosTable.zone} • {selectedPosTable.capacity} chỗ • Tình trạng: <strong>{selectedPosTable.status === 'available' ? 'Trống' : selectedPosTable.status === 'occupied' ? 'Khách ngồi' : selectedPosTable.status === 'reserved' ? 'Đã đặt' : 'Bảo trì'}</strong>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleUnassignPosTable}
                        className="text-rose-600 hover:text-rose-800 text-[11px] font-bold bg-white px-2.5 py-1 rounded-xl border border-rose-200"
                      >
                        Đổi bàn
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 mb-3 space-y-2">
                      <div className="flex items-center justify-between font-bold">
                        <span>Chưa gán bàn cho order tại quán:</span>
                        <button
                          type="button"
                          onClick={() => setPosViewMode('seatmap')}
                          className="text-[#FF5C8D] hover:underline flex items-center gap-1 font-extrabold text-[11px]"
                        >
                          <Store className="w-3.5 h-3.5" />
                          <span>Mở Sơ Đồ Bàn →</span>
                        </button>
                      </div>
                      <select
                        value=""
                        onChange={(e) => {
                          const tableId = e.target.value;
                          if (!tableId) return;
                          const t = cafe.tables.find(tbl => tbl.id === tableId);
                          if (t) {
                            handleAssignTableToPos(t);
                          }
                        }}
                        className="w-full p-2 bg-white rounded-xl border border-amber-300 text-xs font-bold text-[#2E1A12] outline-none"
                      >
                        <option value="">-- Chọn nhanh bàn trong quán --</option>
                        {cafe.tables.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.code} - {t.name} ({t.status === 'available' ? 'Trống' : t.status === 'occupied' ? 'Khách ngồi' : t.status === 'reserved' ? 'Đã đặt' : 'Bảo trì'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Cart Items list */}
                  <div className="py-2 space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                    {posCart.length === 0 ? (
                      <div className="text-center py-10 text-stone-400 text-xs bg-[#FAF7F2] rounded-2xl border border-dashed border-[#FFD9E2]">
                        Chưa chọn món nào.<br />Hãy nhấn dấu <strong>(+)</strong> trên Menu Gọi Món bên phải để thêm món vào đơn.
                      </div>
                    ) : (
                      posCart.map(({ item, quantity }) => (
                        <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFF9EE]/50 border border-[#FFD9E2]/60 text-xs">
                          <div className="flex-1 pr-2">
                            <div className="font-bold text-[#2E1A12] truncate">{item.name}</div>
                            <div className="text-[11px] text-stone-500">{formatVND(item.price)}</div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => updatePosQty(item.id, -1)}
                              className="w-6 h-6 rounded-md bg-white border border-[#FFD9E2] text-stone-700 hover:bg-[#FCECEF] flex items-center justify-center font-bold text-xs"
                            >
                              -
                            </button>
                            <span className="w-4 text-center font-extrabold text-xs text-[#2E1A12]">{quantity}</span>
                            <button
                              onClick={() => updatePosQty(item.id, 1)}
                              className="w-6 h-6 rounded-md bg-white border border-[#FFD9E2] text-stone-700 hover:bg-[#FCECEF] flex items-center justify-center font-bold text-xs"
                            >
                              +
                            </button>
                            <span className="font-extrabold text-[#FF5C8D] w-16 text-right ml-1">
                              {formatVND(item.price * quantity)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Subtotal & Pay button */}
                <div className="pt-4 border-t border-stone-100 space-y-2">
                  <div className="flex justify-between text-xs text-stone-500">
                    <span>Tạm tính (Subtotal):</span>
                    <span className="font-bold">{formatVND(posSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-stone-500">
                    <span>Thuế VAT (8%):</span>
                    <span className="font-bold">{formatVND(posTax)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-[#2E1A12] pt-2 border-t border-stone-100">
                    <span>Tổng thanh toán:</span>
                    <span className="text-[#FF5C8D] text-lg">{formatVND(posTotal)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <button
                      onClick={clearPosCart}
                      disabled={posCart.length === 0}
                      className="py-3 rounded-2xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-bold disabled:opacity-40"
                    >
                      Hủy Đơn
                    </button>
                    <button
                      onClick={handlePosPay}
                      disabled={posCart.length === 0}
                      className="py-3 rounded-2xl bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white text-xs font-extrabold shadow-soft disabled:opacity-40 flex items-center justify-center gap-1.5"
                    >
                      <span>Thanh Toán {formatVND(posTotal)}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column (7 cols): Menu Gọi Món lên trước Sơ Đồ Bàn */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-5 border border-stone-200 shadow-card">
                
                {/* View Switcher Header: ĐẨY MENU GỌI MÓN LÊN TRƯỚC! */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-stone-100">
                  <div className="flex items-center gap-1.5 bg-[#FFF9EE] border border-[#FFD9E2] p-1.5 rounded-2xl">
                    <button
                      onClick={() => setPosViewMode('menu')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                        posViewMode === 'menu'
                          ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-xs'
                          : 'text-[#2E1A12] hover:text-[#FF5C8D]'
                      }`}
                    >
                      <Coffee className="w-3.5 h-3.5" />
                      <span>Menu Gọi Món ({menuItems.length})</span>
                    </button>

                    <button
                      onClick={() => setPosViewMode('seatmap')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                        posViewMode === 'seatmap'
                          ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-xs'
                          : 'text-[#2E1A12] hover:text-[#FF5C8D]'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Sơ Đồ Bàn POS (Seat Map)</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        posViewMode === 'seatmap' ? 'bg-white/20 text-white' : 'bg-[#FCECEF] text-[#FF5C8D]'
                      }`}>
                        {cafe.tables.filter(t => t.status === 'occupied').length}/{cafe.tables.length} khách
                      </span>
                    </button>
                  </div>

                  {posViewMode === 'menu' ? (
                    <span className="text-[11px] text-stone-400 font-medium">
                      Bấm <strong>(+)</strong> để thêm món vào đơn
                    </span>
                  ) : (
                    <span className="text-[11px] text-stone-400 font-medium">
                      Bấm vào bàn để gán đơn hoặc chuyển trạng thái
                    </span>
                  )}
                </div>

                {/* View 1: Interactive Live Seat Map */}
                {posViewMode === 'seatmap' && (
                  <div className="space-y-4">
                    <InteractiveSeatMap
                      cafeId={cafe.id}
                      cafeName={cafe.name}
                      tables={cafe.tables}
                      isOwnerMode={true}
                      selectedTableId={selectedPosTable?.id}
                      onSelectTable={(table) => {
                        handleAssignTableToPos(table);
                      }}
                      onUpdateTableStatus={(tableId, newStatus) => {
                        db.updateTableStatus(cafe.id, tableId, newStatus);
                        if (selectedPosTable && selectedPosTable.id === tableId) {
                          if (newStatus === 'available') {
                            setSelectedPosTable(null);
                          } else {
                            setSelectedPosTable({ ...selectedPosTable, status: newStatus });
                          }
                        }
                        triggerNotice(`Đã đổi trạng thái bàn sang: ${newStatus === 'available' ? 'Trống' : newStatus === 'occupied' ? 'Khách ngồi' : newStatus === 'reserved' ? 'Đã đặt' : 'Bảo trì'}`);
                        loadData();
                      }}
                    />

                    {/* Selected Table Quick Actions Bar */}
                    {selectedPosTable && (
                      <div className="p-3.5 bg-[#FCECEF] rounded-2xl border border-[#FFD9E2] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5C8D] animate-pulse"></span>
                          <div>
                            <div className="font-extrabold text-[#2E1A12]">
                              Đang chọn: {selectedPosTable.name} ({selectedPosTable.code})
                            </div>
                            <div className="text-[11px] text-stone-500">
                              Khu: {selectedPosTable.zone} • {selectedPosTable.capacity} chỗ • Trạng thái: <strong>{selectedPosTable.status === 'available' ? 'Trống' : selectedPosTable.status === 'occupied' ? 'Khách ngồi' : selectedPosTable.status === 'reserved' ? 'Đã đặt' : 'Bảo trì'}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => {
                              const nextStatus = selectedPosTable.status === 'occupied' ? 'available' : 'occupied';
                              db.updateTableStatus(cafe.id, selectedPosTable.id, nextStatus);
                              if (nextStatus === 'available') {
                                setSelectedPosTable(null);
                                triggerNotice(`Đã trả bàn ${selectedPosTable.code} về trạng thái "Trống"!`);
                              } else {
                                setSelectedPosTable({ ...selectedPosTable, status: nextStatus });
                                triggerNotice(`Đã chuyển bàn ${selectedPosTable.code} thành "Khách ngồi"!`);
                              }
                              loadData();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white border border-[#FFD9E2] font-bold text-[#2E1A12] hover:bg-[#FFF9EE] transition-colors text-xs"
                          >
                            Đổi: {selectedPosTable.status === 'occupied' ? '→ Trống' : '→ Khách ngồi'}
                          </button>
                          <button
                            onClick={() => setPosViewMode('menu')}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white font-extrabold transition-colors shadow-soft text-xs"
                          >
                            Chọn Món Cho Bàn Này →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* View 2: Product Grid */}
                {posViewMode === 'menu' && (
                  <div>
                    {/* Search & Category Pills */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={posSearch}
                          onChange={(e) => setPosSearch(e.target.value)}
                          placeholder="Tìm món nhanh..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-xs focus:ring-2 focus:ring-[#FF5C8D] outline-none text-[#2E1A12]"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {['all', 'coffee', 'tea', 'signature', 'pastry'].map(cat => (
                          <button
                            key={cat}
                            onClick={() => setPosCategory(cat)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                              posCategory === cat
                                ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-xs'
                                : 'bg-[#FFF9EE] border border-[#FFD9E2] text-[#2E1A12] hover:bg-[#FCECEF]'
                            }`}
                          >
                            {cat === 'all' ? 'Tất cả' : cat === 'coffee' ? 'Cà phê' : cat === 'tea' ? 'Trà' : cat === 'signature' ? 'Signature' : 'Bánh'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Grid of Product Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[500px] overflow-y-auto pr-1">
                      {filteredMenuItems.map(item => (
                        <div
                          key={item.id}
                          onClick={() => addToPosCart(item)}
                          className="bg-white hover:bg-[#FFF9EE] rounded-2xl p-3 border border-[#FFD9E2]/80 hover:border-[#FF5C8D]/50 cursor-pointer transition-all hover:shadow-xs flex flex-col justify-between group shadow-2xs"
                        >
                          <div className="aspect-square rounded-xl overflow-hidden mb-2 bg-[#FAF7F2] p-1 flex items-center justify-center">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-[#2E1A12] truncate">{item.name}</h4>
                            <div className="flex items-center justify-between mt-1">
                              <span className="font-extrabold text-xs text-[#FF5C8D]">{formatVND(item.price)}</span>
                              <span className="w-6 h-6 rounded-lg bg-[#FCECEF] text-[#FF5C8D] flex items-center justify-center font-bold text-xs group-hover:bg-gradient-to-r group-hover:from-[#FF5C8D] group-hover:to-[#E83D70] group-hover:text-white transition-colors">
                                +
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* ================= TAB 2: MENU CRUD ================= */}
        {activeTab === 'menu' && (
          <div className="bg-white rounded-3xl p-6 border border-[#FFD9E2]/80 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-[#2E1A12]">Quản Lý Thực Đơn Quán ({menuItems.length} món)</h3>
                <p className="text-xs text-stone-500 mt-0.5">Thêm, sửa giá, tải ảnh món và bật/tắt trạng thái còn hàng trực tiếp</p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleOpenCategoryModal}
                  className="inline-flex items-center gap-2 bg-[#FFF9EE] hover:bg-[#FCECEF] text-[#2E1A12] border border-[#FFD9E2] font-bold text-xs px-4 py-2.5 rounded-full transition-all cursor-pointer shadow-2xs"
                >
                  <FolderTree className="w-4 h-4 text-[#FF5C8D]" />
                  <span>Quản Lý Danh Mục ({categories.length})</span>
                </button>

                <button
                  onClick={handleOpenAddMenu}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-soft transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Món Mới</span>
                </button>
              </div>
            </div>

            {/* Menu Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#FFD9E2] text-stone-400 uppercase font-bold text-[10px]">
                    <th className="py-3 px-4">Ảnh & Tên Món</th>
                    <th className="py-3 px-4">Danh Mục</th>
                    <th className="py-3 px-4">Đơn Giá</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {menuItems.map(item => (
                    <tr key={item.id} className="hover:bg-[#FFF9EE]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-2xs border border-[#FFD9E2]/50" />
                          <div>
                            <div className="font-bold text-[#2E1A12] text-sm">{item.name}</div>
                            <div className="text-[11px] text-stone-400 line-clamp-1">{item.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-[#FFF9EE] text-[#2E1A12] border border-[#FFD9E2] px-3 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5C8D]" />
                          <span>
                            {(() => {
                              const matched = categories.find(c => c.id === item.category);
                              return matched ? matched.name : (item.categoryName || item.category);
                            })()}
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#FF5C8D] text-sm">
                        {formatVND(item.price)}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleMenuAvailability(item.id)}
                          className={`px-3 py-1 rounded-full font-bold text-[10px] transition-colors ${
                            item.isAvailable
                              ? 'bg-[#FCECEF] text-[#FF5C8D] border border-[#FFD9E2]'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {item.isAvailable ? '● Còn hàng' : '✕ Tạm hết'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditMenu(item)}
                          className="p-1.5 rounded-lg text-stone-600 hover:text-[#FF5C8D] hover:bg-[#FCECEF]"
                          title="Sửa món"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMenu(item.id, item.name)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Xóa món"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: TABLES CRUD ================= */}
        {activeTab === 'tables' && (
          <div className="bg-white rounded-3xl p-6 border border-[#FFD9E2]/80 shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-extrabold text-[#2E1A12]">Quản Lý Sơ Đồ Bàn & Chỗ Ngồi ({cafe.tables.length} vị trí)</h3>
                <p className="text-xs text-stone-500 mt-0.5">Thêm bàn mới, chỉnh sửa sức chứa, khu vực hoặc chuyển trạng thái tức thì</p>
              </div>

              <button
                onClick={handleOpenAddTable}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-soft transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Bàn Mới</span>
              </button>
            </div>

            {/* Interactive Multi-Floor Seat Map for Owner POS */}
            <div className="mb-8">
              <InteractiveSeatMap
                cafeId={cafe.id}
                cafeName={cafe.name}
                tables={cafe.tables}
                isOwnerMode={true}
                onUpdateTableStatus={(tableId, newStatus) => {
                  db.updateTableStatus(cafe.id, tableId, newStatus);
                  triggerNotice(`Đã chuyển trạng thái chỗ ngồi sang: ${newStatus === 'available' ? 'Trống' : newStatus === 'occupied' ? 'Có khách' : newStatus === 'reserved' ? 'Đã đặt' : 'Bảo trì'}`);
                  loadData();
                }}
                onSelectTable={(table) => {
                  handleOpenEditTable(table);
                }}
              />
            </div>

            <div className="flex items-center justify-between mb-4 pt-4 border-t border-[#FFD9E2]/60">
              <h4 className="font-extrabold text-sm text-[#2E1A12] uppercase tracking-wider">
                Danh Sách Chi Tiết & Chỉnh Sửa Thông Tin Bàn ({cafe.tables.length})
              </h4>
              <span className="text-xs text-stone-500">
                Bấm vào biểu tượng sửa/xóa để cấu hình tiện ích hoặc đổi khu vực
              </span>
            </div>

            {/* Tables Grid View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cafe.tables.map(table => (
                <div
                  key={table.id}
                  className="p-4 rounded-2xl border border-[#FFD9E2]/80 bg-white hover:bg-[#FFF9EE]/40 transition-all flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl bg-[#FCECEF] text-[#FF5C8D] border border-[#FFD9E2] font-black text-xs flex items-center justify-center">
                          {table.code}
                        </span>
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-[#2E1A12]">{table.name}</h4>
                          <span className="text-[10px] text-stone-500">{table.zone}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleTableStatus(table.id, table.status)}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          table.status === 'available'
                            ? 'bg-[#FCECEF] text-[#FF5C8D] border-[#FFD9E2]'
                            : table.status === 'occupied'
                            ? 'bg-stone-200 text-stone-700 border-stone-300'
                            : table.status === 'reserved'
                            ? 'bg-[#FEF0C7] text-[#B54708] border-amber-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                        title="Bấm để đổi trạng thái"
                      >
                        {table.status === 'available' ? '● Trống' : table.status === 'occupied' ? 'Có khách' : table.status === 'reserved' ? 'Đã đặt' : 'Bảo trì'}
                      </button>
                    </div>

                    <div className="text-xs text-stone-600 my-2 space-y-1">
                      <div>Sức chứa: <strong>{table.capacity} người</strong></div>
                      <div>Phụ phí: <strong>{table.hourlyRate > 0 ? formatVND(table.hourlyRate) + '/h' : 'Miễn phí'}</strong></div>
                      <div className="text-[11px] text-stone-500">Tiện ích: {table.features.join(', ')}</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-stone-400">Click tag trạng thái để đổi nhanh</span>
                    <div className="space-x-1">
                      <button
                        onClick={() => handleOpenEditTable(table)}
                        className="p-1 rounded text-stone-600 hover:text-[#FF5C8D]"
                        title="Sửa bàn"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTable(table.id, table.code)}
                        className="p-1 rounded text-stone-400 hover:text-rose-600"
                        title="Xóa bàn"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: BOOKINGS & ORDERS ================= */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl p-6 border border-[#FFD9E2]/80 shadow-card">
            <h3 className="text-xl font-extrabold text-[#2E1A12] mb-1">Danh Sách Khách Đặt Chỗ ({bookings.length} đơn)</h3>
            <p className="text-xs text-stone-500 mb-6">Theo dõi khách đặt bàn trước qua sàn, duyệt check-in và xác nhận thu tiền</p>

            {bookings.length === 0 ? (
              <div className="text-center py-16 text-stone-400 text-xs">
                Chưa có đơn đặt chỗ nào cho quán này. Hãy thử đặt chỗ từ website ngoài để kiểm tra luồng!
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(order => (
                  <div key={order.id} className="p-4 rounded-2xl border border-[#FFD9E2]/80 bg-white hover:bg-[#FFF9EE]/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-2xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[#FF5C8D] bg-[#FCECEF] border border-[#FFD9E2] px-2.5 py-0.5 rounded-md">
                          {order.id}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                          order.bookingStatus === 'confirmed' ? 'bg-[#FCECEF] text-[#FF5C8D] border-[#FFD9E2]' :
                          order.bookingStatus === 'completed' ? 'bg-[#DDE8FA] text-[#1E3A8A] border-blue-200' :
                          order.bookingStatus === 'cancelled' ? 'bg-stone-100 text-stone-600 border-stone-200' : 'bg-[#FEF0C7] text-[#B54708] border-amber-200'
                        }`}>
                          {order.bookingStatus === 'confirmed' ? 'Đã xác nhận' :
                           order.bookingStatus === 'completed' ? 'Đã hoàn tất check-in' :
                           order.bookingStatus === 'cancelled' ? 'Đã hủy' : 'Chờ thanh toán'}
                        </span>
                      </div>

                      <div className="font-bold text-[#2E1A12] text-sm">
                        {order.customerInfo.name} • SĐT: {order.customerInfo.phone}
                      </div>

                      <div className="text-stone-600 flex flex-wrap gap-2 text-[11px]">
                        <span>Bàn: <strong>{order.tableName}</strong></span>
                        <span>• Giờ: <strong>{order.startTime} – {order.endTime}</strong></span>
                        <span>• Ngày: <strong>{formatDateVN(order.date)}</strong></span>
                      </div>

                      {order.cartItems && order.cartItems.length > 0 && (
                        <div className="text-[11px] text-stone-500 pt-1">
                          Đồ uống: {order.cartItems.map(i => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0 space-y-1.5">
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase block">Tổng đơn</span>
                        <span className="font-black text-sm text-[#2E1A12]">{formatVND(order.totalAmount)}</span>
                      </div>
                      <div className="text-[11px] text-[#FF5C8D] font-bold">
                        Đã cọc: {formatVND(order.depositAmount)}
                      </div>
                      {order.remainingAtCafe > 0 && (
                        <div className="text-[11px] text-[#FF6433] font-bold">
                          Cần thu tại quầy: {formatVND(order.remainingAtCafe)}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 flex-wrap mt-2">
                        {order.bookingStatus === 'confirmed' && (
                          <button
                            onClick={() => {
                              order.bookingStatus = 'completed';
                              order.remainingAtCafe = 0;
                              db.saveBooking(order);
                              db.updateTableStatus(order.cafeId, order.tableId, 'occupied');
                              loadData();
                              triggerNotice(`Đã xác nhận check-in và thu tiền cho khách ${order.customerInfo.name}!`);
                            }}
                            className="bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-soft transition-all"
                          >
                            Xác Nhận Check-In & Thu Tiền
                          </button>
                        )}

                        {order.bookingStatus !== 'cancelled' && order.bookingStatus !== 'completed' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Bạn có chắc muốn hủy đơn đặt chỗ ${order.id} của khách "${order.customerInfo.name}"? Bàn sẽ được giải phóng ngay.`)) {
                                db.updateBookingStatus(order.id, 'cancelled');
                                if (order.cafeId && order.tableId) {
                                  db.updateTableStatus(order.cafeId, order.tableId, 'available');
                                }
                                loadData();
                                triggerNotice(`Đã hủy đơn ${order.id} và giải phóng bàn!`);
                              }
                            }}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[11px] font-bold px-2.5 py-1.5 rounded-xl transition-all"
                          >
                            Hủy đơn
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (window.confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN đơn đặt chỗ ${order.id} của khách "${order.customerInfo.name}" khỏi hệ thống?`)) {
                              db.deleteBooking(order.id);
                              loadData();
                              triggerNotice(`Đã xóa vĩnh viễn đơn đặt chỗ ${order.id}!`);
                            }
                          }}
                          className="inline-flex items-center gap-1 bg-stone-50 hover:bg-rose-50 text-stone-500 hover:text-rose-600 border border-stone-200 hover:border-rose-200 text-[11px] font-bold px-2.5 py-1.5 rounded-xl transition-all"
                          title="Xóa vĩnh viễn đơn này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 5: REPORTS & ANALYTICS (MỤC BÁO CÁO RIÊNG) ================= */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="bg-white rounded-3xl p-6 border border-[#FFD9E2]/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs bg-[#FCECEF] text-[#FF5C8D] font-black px-3 py-1 rounded-full border border-[#FFD9E2] inline-block mb-1">
                  Trung Tâm Phân Tích & Thống Kê
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#2E1A12]">
                  Báo Cáo Hoạt Động & Doanh Thu Quán
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Theo dõi biến động doanh thu, lượt khách đặt bàn và hiệu suất khai thác sơ đồ chỗ ngồi
                </p>
              </div>

              {/* Timeframe pill selector */}
              <div className="flex items-center gap-1.5 p-1.5 bg-[#FFF9EE] border border-[#FFD9E2] rounded-2xl text-xs font-bold">
                <button className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] text-white shadow-xs">
                  Hôm nay
                </button>
                <button className="px-3.5 py-1.5 rounded-xl text-[#2E1A12] hover:bg-[#FCECEF]">
                  7 ngày qua
                </button>
                <button className="px-3.5 py-1.5 rounded-xl text-[#2E1A12] hover:bg-[#FCECEF]">
                  Tháng này
                </button>
              </div>
            </div>

            {/* 4 Stat Cards (Chuyển từ POS sang mục báo cáo riêng) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-[#FFD9E2]/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-stone-400 text-[11px] font-bold uppercase">Doanh Thu Hôm Nay</span>
                  <div className="text-xl sm:text-2xl font-black text-[#FF5C8D] mt-1">4.892.000 đ</div>
                  <span className="text-[10px] text-[#FF5C8D] font-bold flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> +12.5% so với hôm qua
                  </span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[#FCECEF] text-[#FF5C8D] flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#FFD9E2]/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-stone-400 text-[11px] font-bold uppercase">Lượt Khách Đặt Bàn</span>
                  <div className="text-xl sm:text-2xl font-black text-[#2E1A12] mt-1">{bookings.length + 24} đơn</div>
                  <span className="text-[10px] text-[#FF5C8D] font-bold flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> +8.2% đơn đặt chỗ sàn
                  </span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[#DDE8FA] text-[#1E3A8A] flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#FFD9E2]/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-stone-400 text-[11px] font-bold uppercase">Khách Đang Phục Vụ</span>
                  <div className="text-xl sm:text-2xl font-black text-[#2E1A12] mt-1">
                    {cafe.tables.filter(t => t.status === 'occupied').reduce((sum, t) => sum + t.capacity, 0) + 12} người
                  </div>
                  <span className="text-[10px] text-stone-500 font-bold flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-[#FF5C8D]" /> Công suất bàn 85%
                  </span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[#FFF9EE] text-[#FF6433] flex items-center justify-center font-bold border border-[#FFD9E2]">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#FFD9E2]/80 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-stone-400 text-[11px] font-bold uppercase">Giá Trị Đơn TB</span>
                  <div className="text-xl sm:text-2xl font-black text-[#2E1A12] mt-1">54.000 đ</div>
                  <span className="text-[10px] text-[#FF5C8D] font-bold flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> +3.1% đồ uống kèm
                  </span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[#FEF0C7] text-[#B54708] flex items-center justify-center font-bold">
                  <Coffee className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Grid 2: Real-time Table Status Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left (6 cols): Table Status Distribution */}
              <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#FFD9E2]/80 shadow-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h4 className="font-extrabold text-base text-[#2E1A12] flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#FF5C8D]" />
                    <span>Tình Trạng Sơ Đồ Bàn Hiện Tại ({cafe.tables.length} vị trí)</span>
                  </h4>
                  <span className="text-xs bg-[#FFF9EE] text-[#FF5C8D] font-bold px-2 py-0.5 rounded-full border border-[#FFD9E2]">
                    Thời gian thực
                  </span>
                </div>

                {/* Visual Stacked Progress Bar */}
                <div className="w-full h-4 rounded-full overflow-hidden flex bg-stone-100">
                  <div
                    style={{ width: `${(cafe.tables.filter(t => t.status === 'available').length / (cafe.tables.length || 1)) * 100}%` }}
                    className="bg-emerald-500 h-full transition-all"
                    title="Trống"
                  />
                  <div
                    style={{ width: `${(cafe.tables.filter(t => t.status === 'occupied').length / (cafe.tables.length || 1)) * 100}%` }}
                    className="bg-stone-500 h-full transition-all"
                    title="Khách ngồi"
                  />
                  <div
                    style={{ width: `${(cafe.tables.filter(t => t.status === 'reserved').length / (cafe.tables.length || 1)) * 100}%` }}
                    className="bg-[#FF5C8D] h-full transition-all"
                    title="Đã đặt"
                  />
                  <div
                    style={{ width: `${(cafe.tables.filter(t => t.status === 'maintenance').length / (cafe.tables.length || 1)) * 100}%` }}
                    className="bg-amber-500 h-full transition-all"
                    title="Bảo trì"
                  />
                </div>

                {/* 4 Status Breakdown Cards */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <span>Trống (Available)</span>
                      </div>
                      <div className="text-[11px] text-emerald-700 mt-0.5">Sẵn sàng nhận khách</div>
                    </div>
                    <span className="text-xl font-black text-emerald-900">
                      {cafe.tables.filter(t => t.status === 'available').length}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-stone-900">
                        <span className="w-2.5 h-2.5 rounded-full bg-stone-500"></span>
                        <span>Khách ngồi (Occupied)</span>
                      </div>
                      <div className="text-[11px] text-stone-600 mt-0.5">Đang phục vụ đồ uống</div>
                    </div>
                    <span className="text-xl font-black text-stone-900">
                      {cafe.tables.filter(t => t.status === 'occupied').length}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FCECEF] border border-[#FFD9E2] flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-[#2E1A12]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF5C8D]"></span>
                        <span>Đã đặt (Reserved)</span>
                      </div>
                      <div className="text-[11px] text-[#FF5C8D] mt-0.5">Giữ bàn (15p đếm ngược)</div>
                    </div>
                    <span className="text-xl font-black text-[#FF5C8D]">
                      {cafe.tables.filter(t => t.status === 'reserved').length}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-amber-950">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                        <span>Bảo trì (Maintenance)</span>
                      </div>
                      <div className="text-[11px] text-amber-700 mt-0.5">Tạm ngưng phục vụ</div>
                    </div>
                    <span className="text-xl font-black text-amber-900">
                      {cafe.tables.filter(t => t.status === 'maintenance').length}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#FFF9EE] rounded-2xl border border-[#FFD9E2] text-stone-600 text-[11px] flex items-center gap-2">
                  <span className="text-base">💡</span>
                  <span>
                    Chính sách giữ bàn: Hệ thống tự động giải phóng chỗ về <strong>Trống</strong> sau 15 phút nếu khách không đến check-in.
                  </span>
                </div>
              </div>

              {/* Right (6 cols): Peak Hours Distribution */}
              <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#FFD9E2]/80 shadow-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h4 className="font-extrabold text-base text-[#2E1A12] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#FF5C8D]" />
                    <span>Phân Bố Khách Theo Khung Giờ Trong Ngày</span>
                  </h4>
                  <span className="text-[11px] text-stone-400 font-bold">07:00 – 22:00</span>
                </div>

                {/* Hourly bars */}
                <div className="space-y-2 text-xs">
                  {[
                    { slot: '07:30 – 09:30', pct: 65, label: 'Sáng sớm (Cà phê đi làm)' },
                    { slot: '09:30 – 11:30', pct: 95, label: 'Cao điểm sáng (Freelancer / Họp)' },
                    { slot: '12:00 – 14:00', pct: 50, label: 'Nghỉ trưa & ăn nhẹ' },
                    { slot: '14:30 – 17:30', pct: 90, label: 'Cao điểm chiều (Làm việc yên tĩnh)' },
                    { slot: '18:00 – 21:30', pct: 80, label: 'Tối (Học nhóm & đọc sách)' },
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="font-bold text-[#2E1A12]">{item.slot} • {item.label}</span>
                        <span className="font-extrabold text-[#FF5C8D]">{item.pct}% công suất</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden">
                        <div
                          style={{ width: `${item.pct}%` }}
                          className={`h-full rounded-full transition-all ${
                            item.pct >= 90 ? 'bg-gradient-to-r from-[#FF5C8D] to-[#E83D70]' : 'bg-[#FFD9E2]'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary footer */}
                <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 flex justify-between items-center">
                  <span>Khung giờ lấp đầy cao nhất: <strong>09:30 – 11:30</strong></span>
                  <span className="font-bold text-[#FF5C8D]">Khuyến nghị: Mở thêm bàn ghép</span>
                </div>
              </div>

            </div>

            {/* Grid 3: Top Selling Items and Channels */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left (7 cols): Top Selling Menu Drinks */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#FFD9E2]/80 shadow-card">
                <h4 className="font-extrabold text-base text-[#2E1A12] mb-4 flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-[#FF5C8D]" />
                  <span>Top 5 Món Nước Được Khách Đặt Nhiều Nhất</span>
                </h4>

                <div className="space-y-3">
                  {menuItems.slice(0, 5).map((item, idx) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF9EE]/50 border border-[#FFD9E2]/60 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#FCECEF] text-[#FF5C8D] font-black text-xs flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 rounded-xl object-cover border border-[#FFD9E2]"
                        />
                        <div>
                          <div className="font-bold text-[#2E1A12]">{item.name}</div>
                          <div className="text-[11px] text-stone-500">{item.categoryName} • {formatVND(item.price)}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-[#FF5C8D]">{42 - idx * 7} ly đã bán</div>
                        <div className="text-[10px] text-stone-400">Doanh thu: {formatVND((42 - idx * 7) * item.price)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right (5 cols): Order Channels */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#FFD9E2]/80 shadow-card flex flex-col justify-between">
                <div>
                  <h4 className="font-extrabold text-base text-[#2E1A12] mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#FF5C8D]" />
                    <span>Cơ Cấu Kênh Đặt Hàng</span>
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-2xl bg-[#FCECEF] border border-[#FFD9E2] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#2E1A12]">Đặt Bàn Sàn FlexiDesk Online</div>
                        <div className="text-[10px] text-stone-500">Khách đặt chỗ trước kèm đồ uống</div>
                      </div>
                      <span className="text-base font-black text-[#FF5C8D]">58% (32 đơn)</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#FFF9EE] border border-[#FFD9E2] flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#2E1A12]">Khách Vãng Lai Tại Quán (POS)</div>
                        <div className="text-[10px] text-stone-500">Gọi món trực tiếp tại quầy</div>
                      </div>
                      <span className="text-base font-black text-[#2E1A12]">28% (15 đơn)</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-stone-800">Mang Đi (Takeaway)</div>
                        <div className="text-[10px] text-stone-500">Không chiếm chỗ ngồi làm việc</div>
                      </div>
                      <span className="text-base font-black text-stone-700">14% (8 đơn)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-stone-100 text-[11px] text-stone-400 text-center">
                  Dữ liệu được làm mới tự động theo thời gian thực từ FlexiDesk Database
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ================= TAB 6: CAFE SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FFD9E2]/80 shadow-card max-w-2xl">
            <h3 className="text-xl font-extrabold text-[#2E1A12] mb-1">Cài Đặt Thông Tin Quán Cà Phê</h3>
            <p className="text-xs text-stone-500 mb-6">Mọi thay đổi tại đây sẽ được lưu trực tiếp vào ổ đĩa và cập nhật ngay lên website khách</p>

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 uppercase block mb-1">Tên Quán Cà Phê</label>
                <input
                  type="text"
                  required
                  value={settingsFormData.name}
                  onChange={(e) => setSettingsFormData({ ...settingsFormData, name: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-sm font-bold focus:ring-2 focus:ring-[#FF5C8D] outline-none text-[#2E1A12]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 uppercase block mb-1">Câu Khẩu Hiệu (Tagline)</label>
                <input
                  type="text"
                  value={settingsFormData.tagline}
                  onChange={(e) => setSettingsFormData({ ...settingsFormData, tagline: e.target.value })}
                  className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-sm focus:ring-2 focus:ring-[#FF5C8D] outline-none text-[#2E1A12]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 uppercase block mb-1">Địa chỉ số nhà & đường</label>
                  <input
                    type="text"
                    value={settingsFormData.address}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, address: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-sm focus:ring-2 focus:ring-[#FF5C8D] outline-none text-[#2E1A12]"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 uppercase block mb-1">Quận / Khu vực</label>
                  <input
                    type="text"
                    value={settingsFormData.district}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, district: e.target.value })}
                    className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-sm focus:ring-2 focus:ring-[#FF5C8D] outline-none text-[#2E1A12]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 uppercase block mb-1">Tốc độ Wi-Fi (Mbps)</label>
                  <input
                    type="number"
                    value={settingsFormData.wifiSpeedMbps}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, wifiSpeedMbps: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-sm font-bold focus:ring-2 focus:ring-[#FF5C8D] outline-none text-[#2E1A12]"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 uppercase block mb-1">Mức độ ồn</label>
                  <select
                    value={settingsFormData.noiseLevel}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, noiseLevel: e.target.value as any })}
                    className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-sm font-semibold focus:ring-2 focus:ring-[#FF5C8D] outline-none text-[#2E1A12]"
                  >
                    <option value="Rất yên tĩnh">Rất yên tĩnh</option>
                    <option value="Yên tĩnh">Yên tĩnh</option>
                    <option value="Vừa phải">Vừa phải</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 uppercase block mb-1">Ổ cắm điện</label>
                  <select
                    value={settingsFormData.powerSockets}
                    onChange={(e) => setSettingsFormData({ ...settingsFormData, powerSockets: e.target.value as any })}
                    className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-sm font-semibold focus:ring-2 focus:ring-[#FF5C8D] outline-none text-[#2E1A12]"
                  >
                    <option value="Mỗi bàn đều có">Mỗi bàn đều có</option>
                    <option value="Nhiều ổ cắm">Nhiều ổ cắm</option>
                    <option value="Vừa đủ">Vừa đủ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 uppercase block mb-1">Giờ mở cửa</label>
                  <input
                    type="time"
                    value={settingsFormData.openHours.open}
                    onChange={(e) => setSettingsFormData({
                      ...settingsFormData,
                      openHours: { ...settingsFormData.openHours, open: e.target.value }
                    })}
                    className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-sm focus:ring-2 focus:ring-[#FF5C8D] outline-none text-[#2E1A12]"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 uppercase block mb-1">Giờ đóng cửa</label>
                  <input
                    type="time"
                    value={settingsFormData.openHours.close}
                    onChange={(e) => setSettingsFormData({
                      ...settingsFormData,
                      openHours: { ...settingsFormData.openHours, close: e.target.value }
                    })}
                    className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-sm focus:ring-2 focus:ring-[#FF5C8D] outline-none text-[#2E1A12]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white font-extrabold text-sm py-3.5 rounded-full shadow-soft transition-all mt-4"
              >
                Lưu Thay Đổi Thông Tin Quán
              </button>
            </form>
          </div>
        )}

      </main>

      {/* ================= MODAL: ADD / EDIT MENU ITEM ================= */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-[#FFD9E2]">
            <button
              onClick={() => setIsMenuModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-lg text-[#2E1A12] mb-4">
              {editingMenuItem ? 'Chỉnh Sửa Món Nước' : 'Thêm Món Mới Vào Thực Đơn'}
            </h3>

            <form onSubmit={handleSaveMenu} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Tên Món Nước / Bánh *</label>
                <input
                  type="text"
                  required
                  value={menuFormData.name}
                  onChange={(e) => setMenuFormData({ ...menuFormData, name: e.target.value })}
                  placeholder="Ví dụ: Cold Brew Mơ Rừng"
                  className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-sm font-semibold focus:ring-2 focus:ring-[#FF5C8D] outline-none text-[#2E1A12]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-stone-700 block">Danh Mục</label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-[10px] text-[#FF5C8D] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                      title="Chỉnh sửa danh sách danh mục"
                    >
                      <FolderTree className="w-3 h-3" />
                      <span>Sửa danh mục</span>
                    </button>
                  </div>
                  <select
                    value={menuFormData.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      const matched = categories.find(c => c.id === cat);
                      setMenuFormData({
                        ...menuFormData,
                        category: cat as any,
                        categoryName: matched ? matched.name : cat,
                      });
                    }}
                    className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-[#FF5C8D] outline-none text-[#2E1A12]"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.viTitle ? `(${c.viTitle})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Giá Bán (VNĐ) *</label>
                  <input
                    type="number"
                    step="1000"
                    required
                    value={menuFormData.price}
                    onChange={(e) => setMenuFormData({ ...menuFormData, price: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-sm font-bold text-[#FF5C8D] focus:ring-2 focus:ring-[#FF5C8D] outline-none"
                  />
                </div>
              </div>

              {/* Enhanced Image Uploader with Paste (Ctrl + V) and Drop support */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-stone-700 block">Hình Ảnh Món Nước</label>
                  <span className="text-[10px] text-[#FF5C8D] font-bold bg-[#FCECEF] px-2 py-0.5 rounded-full border border-[#FFD9E2]">
                    Dán ảnh (Ctrl + V) trực tiếp
                  </span>
                </div>

                {/* Interactive Drop & Paste Zone */}
                <div
                  tabIndex={0}
                  onPaste={handlePasteImage}
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingImage(true); }}
                  onDragLeave={() => setIsDraggingImage(false)}
                  onDrop={handleImageDrop}
                  className={`relative border-2 border-dashed rounded-2xl p-4 transition-all text-center focus:outline-none focus:ring-2 focus:ring-[#FF5C8D] ${
                    isDraggingImage
                      ? 'border-[#FF5C8D] bg-[#FCECEF]'
                      : menuFormData.image
                      ? 'border-[#FFD9E2] bg-[#FFF9EE]/40'
                      : 'border-[#FFD9E2] hover:border-[#FF5C8D] bg-[#FFF9EE]/50 hover:bg-[#FCECEF]/30'
                  }`}
                >
                  {menuFormData.image ? (
                    <div className="flex items-center gap-4 text-left">
                      <div className="relative w-18 h-18 rounded-xl overflow-hidden bg-white border border-[#FFD9E2] shrink-0 shadow-2xs">
                        <img
                          src={menuFormData.image}
                          alt="Preview món"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mb-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Đã nhận diện ảnh thành công</span>
                        </div>
                        <p className="text-[10px] text-stone-400 truncate mb-2">
                          {menuFormData.image.startsWith('data:') ? 'Ảnh dán từ clipboard (Base64)' : menuFormData.image}
                        </p>
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-bold text-[#FF5C8D] bg-white border border-[#FFD9E2] hover:bg-[#FCECEF] px-2.5 py-1 rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1 shadow-2xs">
                            <Upload className="w-3 h-3" />
                            <span>Đổi ảnh</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageFileChange}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => setMenuFormData(prev => ({ ...prev, image: '' }))}
                            className="text-[11px] font-bold text-stone-500 hover:text-rose-600 bg-white border border-stone-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs"
                          >
                            Xóa ảnh
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 cursor-pointer">
                      <div className="w-10 h-10 mx-auto rounded-full bg-white border border-[#FFD9E2] flex items-center justify-center text-[#FF5C8D] mb-1.5 shadow-2xs">
                        <Clipboard className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-[#2E1A12]">
                        Nhấn <kbd className="px-1.5 py-0.5 rounded bg-white border border-stone-300 text-[10px] font-mono shadow-2xs">Ctrl + V</kbd> bất kỳ đâu để dán ảnh
                      </p>
                      <p className="text-[11px] text-stone-400 mt-1">
                        hoặc kéo thả ảnh vào đây, hoặc{' '}
                        <label className="text-[#FF5C8D] font-bold underline cursor-pointer">
                          chọn file từ máy
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageFileChange}
                          />
                        </label>
                      </p>
                    </div>
                  )}
                </div>

                {/* Optional Direct URL input */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[11px] text-stone-400 shrink-0">Hoặc link URL:</span>
                  <input
                    type="url"
                    value={menuFormData.image.startsWith('data:') ? '' : menuFormData.image}
                    onChange={(e) => setMenuFormData({ ...menuFormData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/... hoặc dán link ảnh"
                    className="w-full p-2 rounded-lg bg-[#FFF9EE] border border-[#FFD9E2] text-[11px] focus:ring-1 focus:ring-[#FF5C8D] outline-none text-[#2E1A12]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Mô Tả Hương Vị & Thành Phần</label>
                <textarea
                  rows={2}
                  value={menuFormData.description}
                  onChange={(e) => setMenuFormData({ ...menuFormData, description: e.target.value })}
                  placeholder="Vị chua ngọt dịu, ủ lạnh 18h thơm nồng..."
                  className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-xs focus:ring-2 focus:ring-[#FF5C8D] outline-none text-[#2E1A12]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={menuFormData.isAvailable}
                  onChange={(e) => setMenuFormData({ ...menuFormData, isAvailable: e.target.checked })}
                  className="rounded text-[#FF5C8D] focus:ring-[#FF5C8D] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="availCheck" className="font-bold text-stone-800 text-xs cursor-pointer">
                  Còn hàng để khách đặt online
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white font-extrabold rounded-full text-xs shadow-soft mt-4 transition-all cursor-pointer"
              >
                {editingMenuItem ? 'Lưu Cập Nhật' : 'Tạo Món Mới'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: MANAGE CATEGORIES ================= */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-[#FFD9E2]">
            <button
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-[#FCECEF] border border-[#FFD9E2] flex items-center justify-center text-[#FF5C8D] shadow-2xs">
                <FolderTree className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-[#2E1A12]">
                  Chỉnh Sửa Danh Mục Thực Đơn
                </h3>
                <p className="text-xs text-stone-500">
                  Tùy chỉnh danh mục hiển thị đồng bộ giữa trang quản trị và thực đơn ngoài web
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveCategories} className="mt-5 space-y-4">
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {editingCategories.map((cat, idx) => {
                  const itemCount = menuItems.filter(i => i.category === cat.id).length;
                  return (
                    <div
                      key={cat.id || idx}
                      className="p-3.5 rounded-2xl bg-[#FFF9EE]/70 border border-[#FFD9E2] space-y-2 relative"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#FF5C8D] bg-white px-2 py-0.5 rounded-md border border-[#FFD9E2]">
                          Danh mục #{idx + 1} • {itemCount} món
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="text-stone-400 hover:text-rose-600 hover:bg-white p-1 rounded-lg transition-colors cursor-pointer"
                          title="Xóa danh mục này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-bold text-stone-600 block mb-0.5">
                            Tên danh mục (Tiêu đề lớn) *
                          </label>
                          <input
                            type="text"
                            required
                            value={cat.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditingCategories(prev =>
                                prev.map((c, i) => i === idx ? { ...c, name: val } : c)
                              );
                            }}
                            placeholder="Ví dụ: Sparkling, Fresh Fruit..."
                            className="w-full p-2.5 rounded-xl bg-white border border-[#FFD9E2] text-xs font-bold text-[#2E1A12] focus:ring-2 focus:ring-[#FF5C8D] outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-stone-600 block mb-0.5">
                            Phụ đề tiếng Việt mô tả
                          </label>
                          <input
                            type="text"
                            value={cat.viTitle || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditingCategories(prev =>
                                prev.map((c, i) => i === idx ? { ...c, viTitle: val } : c)
                              );
                            }}
                            placeholder="Ví dụ: Món sủi tăm & cold brew..."
                            className="w-full p-2.5 rounded-xl bg-white border border-[#FFD9E2] text-xs text-stone-700 focus:ring-2 focus:ring-[#FF5C8D] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Category Button */}
              <button
                type="button"
                onClick={handleAddCategory}
                className="w-full py-2.5 rounded-2xl border-2 border-dashed border-[#FFD9E2] text-[#FF5C8D] hover:bg-[#FCECEF]/40 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Danh Mục Mới</span>
              </button>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2.5 rounded-full border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-50 cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white font-extrabold text-xs shadow-soft transition-all cursor-pointer"
                >
                  Lưu Thay Đổi Danh Mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT TABLE ================= */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-[#FFD9E2]">
            <button
              onClick={() => setIsTableModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-extrabold text-lg text-[#2E1A12] mb-4">
              {editingTable ? 'Chỉnh Sửa Bàn' : 'Thêm Bàn Mới'}
            </h3>

            <form onSubmit={handleSaveTable} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Mã Bàn (Code) *</label>
                  <input
                    type="text"
                    required
                    value={tableFormData.code}
                    onChange={(e) => setTableFormData({ ...tableFormData, code: e.target.value })}
                    placeholder="T01, M01..."
                    className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-sm font-bold uppercase focus:ring-2 focus:ring-[#FF5C8D] outline-none text-[#2E1A12]"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Sức Chứa (Người) *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={tableFormData.capacity}
                    onChange={(e) => setTableFormData({ ...tableFormData, capacity: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-sm font-bold focus:ring-2 focus:ring-[#FF5C8D] outline-none text-[#2E1A12]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Tên Hiển Thị Của Bàn *</label>
                <input
                  type="text"
                  required
                  value={tableFormData.name}
                  onChange={(e) => setTableFormData({ ...tableFormData, name: e.target.value })}
                  placeholder="Ví dụ: Bàn Đơn Cửa Sổ #01"
                  className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-sm font-semibold focus:ring-2 focus:ring-[#FF5C8D] outline-none text-[#2E1A12]"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Khu Vực (Zone)</label>
                <select
                  value={tableFormData.zone}
                  onChange={(e) => setTableFormData({ ...tableFormData, zone: e.target.value as any })}
                  className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-sm font-semibold focus:ring-2 focus:ring-[#FF5C8D] outline-none text-[#2E1A12]"
                >
                  <option value="Khu Yên Tĩnh (Quiet Zone)">Khu Yên Tĩnh (Quiet Zone)</option>
                  <option value="Khu Cửa Sổ View Đẹp">Khu Cửa Sổ View Đẹp</option>
                  <option value="Khu Làm Việc Nhóm">Khu Làm Việc Nhóm</option>
                  <option value="Phòng Họp Kín">Phòng Họp Kín</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Phụ Phí Theo Giờ (VNĐ)</label>
                  <input
                    type="number"
                    step="5000"
                    value={tableFormData.hourlyRate}
                    onChange={(e) => setTableFormData({ ...tableFormData, hourlyRate: Number(e.target.value) })}
                    placeholder="0 nếu miễn phí"
                    className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-sm font-bold focus:ring-2 focus:ring-[#FF5C8D] outline-none text-[#2E1A12]"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Trạng Thái Ban Đầu</label>
                  <select
                    value={tableFormData.status}
                    onChange={(e) => setTableFormData({ ...tableFormData, status: e.target.value as any })}
                    className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-sm font-semibold focus:ring-2 focus:ring-[#FF5C8D] outline-none text-[#2E1A12]"
                  >
                    <option value="available">Còn trống</option>
                    <option value="occupied">Có khách</option>
                    <option value="reserved">Đã đặt</option>
                    <option value="maintenance">Bảo trì</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Tiện Ích Đi Kèm (Cách nhau dấu phẩy)</label>
                <input
                  type="text"
                  value={tableFormData.featuresStr}
                  onChange={(e) => setTableFormData({ ...tableFormData, featuresStr: e.target.value })}
                  placeholder="2 ổ cắm, Ghế Herman Miller, Đèn học"
                  className="w-full p-3 rounded-xl bg-[#FFF9EE] border border-[#FFD9E2] text-xs focus:ring-2 focus:ring-[#FF5C8D] outline-none text-[#2E1A12]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white font-extrabold rounded-full text-xs shadow-soft mt-4 transition-all"
              >
                {editingTable ? 'Lưu Cập Nhật Bàn' : 'Tạo Bàn Mới'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: POS RECEIPT SLIP ================= */}
      {posReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-center text-xs border border-[#FFD9E2]">
            <button
              onClick={() => setPosReceiptModal(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-full bg-[#FCECEF] text-[#FF5C8D] border border-[#FFD9E2] flex items-center justify-center mx-auto mb-2 font-black">
              ✓
            </div>
            <h3 className="font-black text-lg text-[#2E1A12]">{cafe.name}</h3>
            <p className="text-[11px] text-stone-400">Hóa đơn thanh toán tại quầy</p>
            <div className="my-2 py-1 px-3 bg-[#FFF9EE] border border-[#FFD9E2] text-[#FF5C8D] rounded-lg inline-block font-bold">
              Mã GD: {posReceiptModal.id}
            </div>

            {posReceiptModal.orderType && (
              <div className="text-[11px] font-bold text-stone-600 mb-2">
                {posReceiptModal.orderType === 'takeaway'
                  ? '🥡 Hình thức: Mang đi (Takeaway)'
                  : `🪑 Hình thức: Tại quán ${posReceiptModal.tableName ? `• ${posReceiptModal.tableName}` : ''}`}
              </div>
            )}

            <div className="border-t border-b border-dashed border-[#FFD9E2] my-4 py-3 space-y-1.5 text-left">
              {posReceiptModal.items.map((i: any, idx: number) => (
                <div key={idx} className="flex justify-between">
                  <span>{i.quantity}x {i.item.name}</span>
                  <span className="font-bold">{formatVND(i.item.price * i.quantity)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-stone-100 flex justify-between text-stone-500">
                <span>Tạm tính:</span>
                <span>{formatVND(posReceiptModal.subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Thuế VAT 8%:</span>
                <span>{formatVND(posReceiptModal.tax)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-[#FF5C8D] pt-1">
                <span>TỔNG CỘNG:</span>
                <span>{formatVND(posReceiptModal.total)}</span>
              </div>
            </div>

            <p className="text-[10px] text-stone-400 mb-4">
              Cảm ơn quý khách! Hẹn gặp lại quý khách lần sau.
            </p>

            <button
              onClick={() => setPosReceiptModal(null)}
              className="w-full py-3 bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white font-extrabold rounded-full text-xs shadow-soft transition-all cursor-pointer"
            >
              Đóng Hóa Đơn
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: BOOKING QR & DETAILS MODAL ================= */}
      {selectedBookingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-xs border border-[#FFD9E2] max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedBookingDetails(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="font-black text-sm text-[#FF5C8D] bg-[#FCECEF] px-2.5 py-1 rounded-xl border border-[#FFD9E2]">
                {selectedBookingDetails.id}
              </span>
              <span className="text-[11px] font-bold text-stone-500">
                Chi tiết đơn đặt chỗ
              </span>
            </div>

            <h3 className="font-black text-lg text-[#2E1A12] mb-1">
              Khách: {selectedBookingDetails.customerInfo.name}
            </h3>
            <p className="text-stone-500 mb-4">
              SĐT: <strong>{selectedBookingDetails.customerInfo.phone}</strong> • Email: {selectedBookingDetails.customerInfo.email || 'Không có'}
            </p>

            {/* QR Code representation */}
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#FFD9E2] text-center my-3">
              <div className="w-36 h-36 mx-auto bg-white p-2 rounded-2xl border border-[#FFD9E2] flex items-center justify-center shadow-xs">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(selectedBookingDetails.id)}`}
                  alt="Mã QR Check-in"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[10px] text-stone-400 block mt-2 font-mono">
                Mã quét: {selectedBookingDetails.id}
              </span>
            </div>

            {/* Booking Details Table */}
            <div className="space-y-2 py-3 border-t border-b border-stone-100 text-stone-700">
              <div className="flex justify-between">
                <span className="text-stone-500">Vị trí bàn được gán:</span>
                <span className="font-black text-[#FF5C8D]">{selectedBookingDetails.tableName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Khung giờ đặt:</span>
                <span className="font-bold">{selectedBookingDetails.startTime} ({formatDateVN(selectedBookingDetails.date)})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Trạng thái đơn:</span>
                <span className="font-extrabold capitalize text-[#2E1A12]">{selectedBookingDetails.bookingStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Tổng tiền đơn:</span>
                <span className="font-bold">{formatVND(selectedBookingDetails.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Đã thanh toán cọc:</span>
                <span className="font-bold text-[#FF5C8D]">{formatVND(selectedBookingDetails.depositAmount)}</span>
              </div>
              {selectedBookingDetails.remainingAtCafe > 0 && (
                <div className="flex justify-between font-bold text-amber-700">
                  <span>Cần thu tại quầy:</span>
                  <span>{formatVND(selectedBookingDetails.remainingAtCafe)}</span>
                </div>
              )}
            </div>

            {/* Cart Items */}
            {selectedBookingDetails.cartItems && selectedBookingDetails.cartItems.length > 0 && (
              <div className="my-3">
                <span className="font-bold text-stone-500 block mb-1">Món nước đã đặt trước:</span>
                <div className="space-y-1">
                  {selectedBookingDetails.cartItems.map((c, i) => (
                    <div key={i} className="flex justify-between text-[11px] p-1.5 bg-[#FFF9EE] rounded-lg">
                      <span>{c.quantity}x {c.menuItem.name}</span>
                      <span className="font-bold">{formatVND(c.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 flex items-center justify-end gap-2">
              {selectedBookingDetails.bookingStatus === 'confirmed' && (
                <>
                  <button
                    onClick={() => {
                      handleReleaseOrCancelBooking(selectedBookingDetails);
                      setSelectedBookingDetails(null);
                    }}
                    className="px-3.5 py-2.5 rounded-full border border-stone-200 text-stone-600 font-bold hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    Hủy & Giải Phóng Bàn
                  </button>
                  <button
                    onClick={() => {
                      handleCheckInBooking(selectedBookingDetails);
                      setSelectedBookingDetails(null);
                    }}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FF5C8D] to-[#E83D70] hover:from-[#E83D70] hover:to-[#C2185B] text-white font-extrabold shadow-soft transition-all cursor-pointer"
                  >
                    Xác Nhận Check-In
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedBookingDetails(null)}
                className="px-4 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
