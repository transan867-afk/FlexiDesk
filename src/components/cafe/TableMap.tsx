import React, { useState } from 'react';
import { TableSeat, TableStatus } from '../../types';
import { Check, Users, Zap, ShieldAlert, Sparkles, Monitor, Lamp } from 'lucide-react';
import { formatVND } from '../../utils/formatters';

interface TableMapProps {
  tables: TableSeat[];
  selectedTableId?: string;
  onSelectTable: (table: TableSeat) => void;
}

export const TableMap: React.FC<TableMapProps> = ({
  tables,
  selectedTableId,
  onSelectTable,
}) => {
  const [activeZone, setActiveZone] = useState<string>('all');
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const zones = [
    { id: 'all', name: 'Tất cả vị trí' },
    { id: 'quiet', name: 'Khu Yên Tĩnh (Quiet Zone)' },
    { id: 'window', name: 'Khu Cửa Sổ View Đẹp' },
    { id: 'team', name: 'Khu Làm Việc Nhóm' },
    { id: 'meeting', name: 'Phòng Họp Kín' },
  ];

  const filteredTables = tables.filter(table => {
    if (activeZone === 'all') return true;
    if (activeZone === 'quiet') return table.zone.includes('Yên Tĩnh');
    if (activeZone === 'window') return table.zone.includes('Cửa Sổ');
    if (activeZone === 'team') return table.zone.includes('Nhóm');
    if (activeZone === 'meeting') return table.zone.includes('Họp');
    return true;
  });

  const handleTableClick = (table: TableSeat) => {
    if (table.status === 'occupied') {
      setWarningMessage(`Bàn ${table.name} hiện đang có khách ngồi. Vui lòng chọn bàn có màu xanh còn trống.`);
      setTimeout(() => setWarningMessage(null), 4000);
      return;
    }
    if (table.status === 'reserved') {
      setWarningMessage(`Bàn ${table.name} đã được khách khác đặt trước trong khung giờ này. Vui lòng chọn bàn khác.`);
      setTimeout(() => setWarningMessage(null), 4000);
      return;
    }

    setWarningMessage(null);
    onSelectTable(table);
  };

  const getStatusBadge = (status: TableStatus, isSelected: boolean) => {
    if (isSelected) {
      return (
        <span className="bg-brand-green text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
          <Check className="w-3 h-3" /> Đang chọn
        </span>
      );
    }
    switch (status) {
      case 'available':
        return (
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
            ● Còn trống
          </span>
        );
      case 'occupied':
        return (
          <span className="bg-stone-200 text-stone-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
            Đang có khách
          </span>
        );
      case 'reserved':
        return (
          <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
            Đã được đặt
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-card">
      
      {/* Header and Zone Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-extrabold text-brand-espresso flex items-center gap-2">
            <span>Sơ Đồ Chọn Chỗ Ngồi & Bàn Làm Việc</span>
            <span className="text-xs bg-brand-lightgreen text-brand-green font-bold px-2.5 py-1 rounded-full">
              Trực quan
            </span>
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Chọn vị trí ngồi phù hợp với nhu cầu. Không thu phụ phí chỗ ngồi khi gọi đồ uống (trừ phòng họp riêng).
          </p>
        </div>

        {/* Legend status indicators */}
        <div className="flex items-center gap-3 text-xs font-semibold text-stone-600 bg-cream-50 p-2.5 rounded-2xl border border-stone-200/60">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span>Trống</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-stone-300 inline-block"></span>
            <span>Có khách</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-400 inline-block"></span>
            <span>Đã đặt</span>
          </div>
        </div>
      </div>

      {/* Warning banner if clicked on occupied table */}
      {warningMessage && (
        <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm p-4 rounded-2xl flex items-center gap-3 animate-shake">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          <p className="font-semibold">{warningMessage}</p>
        </div>
      )}

      {/* Zone filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
        {zones.map(zone => (
          <button
            key={zone.id}
            onClick={() => setActiveZone(zone.id)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeZone === zone.id
                ? 'bg-brand-espresso text-white shadow-sm'
                : 'bg-cream-100 text-stone-600 hover:bg-cream-200'
            }`}
          >
            {zone.name}
          </button>
        ))}
      </div>

      {/* Tables Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTables.map(table => {
          const isSelected = selectedTableId === table.id;
          const isAvailable = table.status === 'available';

          return (
            <div
              key={table.id}
              onClick={() => handleTableClick(table)}
              className={`relative rounded-2xl p-5 border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-brand-green bg-emerald-50/70 shadow-floating scale-[1.02]'
                  : isAvailable
                  ? 'border-stone-200 hover:border-brand-green/70 bg-white hover:bg-cream-50/50 hover:shadow-md'
                  : 'border-stone-200/60 bg-stone-50/80 opacity-60 cursor-not-allowed'
              }`}
            >
              <div>
                {/* Top Table Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-xl font-extrabold text-xs flex items-center justify-center ${
                      isSelected
                        ? 'bg-brand-green text-white'
                        : isAvailable
                        ? 'bg-brand-lightgreen text-brand-darkgreen'
                        : 'bg-stone-200 text-stone-600'
                    }`}>
                      {table.code}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 leading-tight">
                        {table.name}
                      </h4>
                      <span className="text-[11px] text-stone-500 font-medium">
                        {table.zone}
                      </span>
                    </div>
                  </div>

                  {getStatusBadge(table.status, isSelected)}
                </div>

                {/* Capacity & Price */}
                <div className="flex items-center gap-4 text-xs text-stone-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-stone-400" />
                    <span>{table.capacity} chỗ ngồi</span>
                  </div>
                  <div>
                    {table.hourlyRate > 0 ? (
                      <span className="font-bold text-brand-coral">
                        {formatVND(table.hourlyRate)}/giờ
                      </span>
                    ) : (
                      <span className="font-bold text-brand-green">
                        Miễn phí theo nước
                      </span>
                    )}
                  </div>
                </div>

                {/* Amenities / Features List */}
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-stone-100">
                  {table.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-white border border-stone-200/80 text-stone-600 font-medium px-2 py-0.5 rounded-md flex items-center gap-1"
                    >
                      <Zap className="w-2.5 h-2.5 text-brand-green" />
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Selection confirmation button inside card */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-400">
                  {isAvailable ? (isSelected ? 'Đã lựa chọn' : 'Nhấn để chọn bàn này') : 'Không khả dụng'}
                </span>
                {isSelected ? (
                  <span className="w-6 h-6 rounded-full bg-brand-green text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                ) : isAvailable ? (
                  <span className="text-xs font-bold text-brand-green hover:underline">
                    Chọn bàn →
                  </span>
                ) : null}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
