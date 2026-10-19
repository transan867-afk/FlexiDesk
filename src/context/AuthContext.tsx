import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { db } from '../services/databaseService';

interface RegisterData {
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: UserRole;
  cafeName?: string;
  cafeAddress?: string;
  district?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  login: (email: string, password?: string) => Promise<{ success: boolean; message: string; user?: User }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string; user?: User }>;
  logout: () => void;
  quickLoginAs: (role: UserRole) => void;
  loginAsUser: (user: User) => void;
  updateProfile: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SESSION_KEY = 'flexidesk_auth_user_v2';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading user session:', e);
    }
    // Default logged in as Customer for smooth initial browsing
    return db.getUserById('u-customer-1') || null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [currentUser]);

  const login = async (email: string, _password?: string) => {
    const user = db.getUserByEmail(email);
    if (!user) {
      return { success: false, message: 'Email này chưa được đăng ký trong hệ thống.' };
    }
    if (user.status === 'suspended') {
      return { success: false, message: 'Tài khoản của bạn hiện đang bị tạm khóa. Vui lòng liên hệ Admin.' };
    }

    setCurrentUser(user);
    return { success: true, message: `Chào mừng ${user.name} quay trở lại!`, user };
  };

  const register = async (data: RegisterData) => {
    const existing = db.getUserByEmail(data.email);
    if (existing) {
      return { success: false, message: 'Email này đã tồn tại trong hệ thống. Vui lòng đăng nhập.' };
    }

    let cafeId: string | undefined = undefined;
    let cafeName: string | undefined = data.cafeName;

    // If registering as a Cafe Owner (partner), automatically create their Cafe on the platform!
    if (data.role === 'partner') {
      const createdCafe = db.createCafe({
        name: data.cafeName || `Quán Cà Phê của ${data.name}`,
        tagline: 'Không gian làm việc & thưởng thức cà phê yên tĩnh mới tham gia sàn',
        description: 'Quán cà phê vừa đăng ký kinh doanh trên sàn FlexiDesk, đang hoàn thiện menu và sơ đồ bàn.',
        address: data.cafeAddress || '123 Đường Số 1',
        ward: 'Phường 1',
        district: data.district || 'Quận 1',
        city: 'Hồ Chí Minh',
        priceRange: '35.000đ - 65.000đ',
        heroImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
        images: [
          'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80'
        ],
        openHours: { open: '07:30', close: '22:30' },
        features: {
          noiseLevel: 'Yên tĩnh',
          wifiSpeedMbps: 200,
          powerSockets: 'Nhiều ổ cắm',
          naturalLight: 'Ánh sáng tốt',
          meetingRooms: false,
          airConditioning: true,
          parking: 'Chỗ giữ xe rộng rãi',
          outdoorSpace: false,
        },
        categories: ['Làm việc tập trung', 'Cà phê đặc sản'],
        tables: [
          {
            id: `t-${Date.now()}-1`,
            cafeId: '',
            code: 'T01',
            name: 'Bàn Đơn Làm Việc #01',
            type: 'single',
            capacity: 1,
            features: ['Ghế êm', 'Ổ cắm điện'],
            status: 'available',
            hourlyRate: 0,
            zone: 'Khu Yên Tĩnh (Quiet Zone)',
            position: { row: 1, col: 1 },
          },
          {
            id: `t-${Date.now()}-2`,
            cafeId: '',
            code: 'T02',
            name: 'Bàn Đôi Thảo Luận #02',
            type: 'double',
            capacity: 2,
            features: ['2 ổ cắm', 'View cửa sổ'],
            status: 'available',
            hourlyRate: 0,
            zone: 'Khu Cửa Sổ View Đẹp',
            position: { row: 1, col: 2 },
          }
        ],
        ownerId: '',
        status: 'active',
      });

      cafeId = createdCafe.id;
      cafeName = createdCafe.name;

      // Add a couple of initial sample drinks to the new cafe
      db.createMenuItem(cafeId, {
        name: 'Cà Phê Muối Đặc Sản',
        category: 'signature',
        categoryName: 'Món Đặc Trưng',
        description: 'Cà phê phin truyền thống thơm nồng kết hợp lớp kem muối béo ngậy.',
        price: 45000,
        image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
        isPopular: true,
      });
      db.createMenuItem(cafeId, {
        name: 'Trà Đào Cam Sả',
        category: 'tea',
        categoryName: 'Trà Trái Cây',
        description: 'Trà hoa vàng thanh mát với đào miếng giòn rụm và hương sả thơm lừng.',
        price: 48000,
        image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
      });
    }

    const newUser = db.createUser({
      name: data.name,
      email: data.email,
      password: data.password || '123',
      phone: data.phone,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      role: data.role,
      cafeId,
      cafeName,
      status: 'active',
      businessRegistration: data.role === 'partner' ? {
        cafeName: data.cafeName || '',
        address: data.cafeAddress || '',
        city: 'Hồ Chí Minh',
        district: data.district || 'Quận 1',
        phone: data.phone,
        approvedAt: new Date().toISOString(),
      } : undefined,
    });

    setCurrentUser(newUser);
    return { success: true, message: 'Đăng ký tài khoản thành công!', user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const quickLoginAs = (role: UserRole) => {
    let targetUser: User | undefined;
    if (role === 'admin') {
      targetUser = db.getUserById('u-admin');
    } else if (role === 'partner') {
      targetUser = db.getUserById('u-partner-1');
    } else {
      targetUser = db.getUserById('u-customer-1');
    }

    if (targetUser) {
      setCurrentUser(targetUser);
    }
  };

  const loginAsUser = (user: User) => {
    setCurrentUser(user);
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    db.updateUser(currentUser.id, data);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        userRole: currentUser ? currentUser.role : null,
        login,
        register,
        logout,
        quickLoginAs,
        loginAsUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
