import React from 'react';
import { Wifi, Zap, ShieldCheck, Coffee } from 'lucide-react';

export const ValueProps: React.FC = () => {
  const values = [
    {
      icon: <Coffee className="w-8 h-8 text-[#FF5C8D]" />,
      title: 'Cà Phê Pha Chuẩn Vị',
      desc: 'Hạt Arabica & Robusta tuyển chọn, pha sẵn tươi ngon khi bạn bước vào quán.',
    },
    {
      icon: <Wifi className="w-8 h-8 text-[#FF5C8D]" />,
      title: 'Wi-Fi Doanh Nghiệp',
      desc: 'Băng thông cao 150 – 300 Mbps, ổn định cho cả ngày họp video Call và đẩy code.',
    },
    {
      icon: <Zap className="w-8 h-8 text-[#FF5C8D]" />,
      title: '100% Ổ Cắm Tại Bàn',
      desc: 'Mỗi vị trí ngồi đều trang bị tối thiểu 2 ổ cắm điện và sạc nhanh công suất lớn.',
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-[#FF5C8D]" />,
      title: 'Giữ Chỗ & Cọc 10%',
      desc: 'Chỉ cần cọc 10% giữ bàn chắc chắn 100%, thanh toán 90% còn lại tại quầy.',
    },
  ];

  return (
    <section className="py-12 border-y border-pink-200/60 bg-[#FFF9EE]">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 md:px-14 lg:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((v, idx) => (
            <div key={idx} className="flex items-start gap-4 p-4 rounded-3xl bg-white border border-pink-100 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center shrink-0 shadow-2xs">
                {v.icon}
              </div>
              <div>
                <h4 className="font-extrabold text-sm sm:text-base text-[#2E1A12] mb-1">
                  {v.title}
                </h4>
                <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                  {v.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
