"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTripStore, Sticker } from '@/store/useTripStore';
import { usePathname } from 'next/navigation';
import { X, ZoomIn, ZoomOut, RotateCcw, RotateCw, Trash2 } from 'lucide-react';

// 🌟 獨立的單個貼圖元件
const DraggableSticker = ({ sticker, tripId, isActive, setIsActive }: { sticker: Sticker, tripId: string, isActive: boolean, setIsActive: (id: string|null) => void }) => {
  const { updateSticker, removeSticker } = useTripStore();

  return (
    <motion.div
      drag dragMomentum={false}
      onDragEnd={(_, info) => updateSticker(tripId, sticker.id, { x: sticker.x + info.offset.x, y: sticker.y + info.offset.y })}
      initial={{ x: sticker.x, y: sticker.y }} animate={{ x: sticker.x, y: sticker.y }}
      onPointerDown={(e) => { e.stopPropagation(); setIsActive(sticker.id); }}
      className="absolute pointer-events-auto touch-none"
      style={{ zIndex: isActive ? 950 : 40, left: 0, top: 0 }}
    >
      <div style={{ width: 100, height: 100, transform: `scale(${sticker.scale || 1}) rotate(${sticker.rotate || 0}deg)`, transformOrigin: 'center' }}>
        <div className={`relative w-full h-full transition-all ${isActive ? 'ring-4 ring-dashed ring-[#E2A622] rounded-[16px]' : ''}`}>
          <img src={sticker.url} className="w-full h-full object-contain drop-shadow-md pointer-events-none select-none" />
          
          {/* 🌟 完美的右上角刪除按鈕 */}
          {isActive && (
            <button 
              onPointerDown={(e) => { e.stopPropagation(); removeSticker(tripId, sticker.id); setIsActive(null); }} 
              className="absolute -top-2 -right-2 bg-[#F28482]/90 backdrop-blur-md text-white rounded-full p-1.5 shadow-sm z-50 active:scale-90 cursor-pointer"
            >
              <X size={14} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// 🌟 貼圖畫布主元件
export default function StickerCanvas() {
  const pathname = usePathname();
  const { trips, activeTripId, activeDayIndex, updateSticker, removeSticker } = useTripStore();
  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);
  const [toolboxTab, setToolboxTab] = useState(0);

  useEffect(() => {
    const updateTab = () => {
      const tab = localStorage.getItem('toolboxTab') || 'PACKING';
      setToolboxTab(tab === 'SHOPPING' ? 1 : tab === 'MEMORIES' ? 2 : 0);
    };
    updateTab();
    window.addEventListener('toolboxTabChanged', updateTab);
    return () => window.removeEventListener('toolboxTabChanged', updateTab);
  },[]);

  const trip = trips.find(t => t.id === activeTripId);
  if (!trip) return null;
  
  // 確保貼圖只在對應的頁籤與日期中顯示
  const pageStickers = trip.stickers?.filter(s => {
    if (pathname === '/toolbox') return s.pagePath === pathname && s.dayIndex === toolboxTab;
    if (pathname === '/plan') return s.pagePath === pathname && s.dayIndex === activeDayIndex;
    return s.pagePath === pathname;
  }) ||[];
  
  const activeSticker = pageStickers.find(s => s.id === activeStickerId);

  return (
    <>
      {/* 點擊背景解除選取 */}
      {activeStickerId && <div className="fixed inset-0 z-[900]" onPointerDown={() => setActiveStickerId(null)} />}
      
      <div className="absolute inset-0 pointer-events-none z-[40] overflow-hidden min-h-[150vh] print-hide">
        {pageStickers.map((sticker) => (
          <DraggableSticker key={sticker.id} sticker={sticker} tripId={trip.id} isActive={activeStickerId === sticker.id} setIsActive={setActiveStickerId} />
        ))}
      </div>

      {/* 🌟 固定在畫面正下方的貼圖編輯控制台 */}
      <AnimatePresence>
        {activeSticker && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-[100px] left-1/2 -translate-x-1/2 z-[1000] flex gap-2 bg-[#FBF7F2] p-2 rounded-[20px] border-[4px] border-[#E2D6C8] shadow-[0_10px_30px_rgba(0,0,0,0.1)] w-max pointer-events-auto"
          >
            <button onClick={() => updateSticker(trip.id, activeSticker.id, { scale: Math.max(0.5, (activeSticker.scale || 1) - 0.2) })} className="p-3 bg-white rounded-xl border-2 border-[#E2D6C8] text-[#8A7A6A] active:bg-[#EFE7DB]"><ZoomOut size={20}/></button>
            <button onClick={() => updateSticker(trip.id, activeSticker.id, { scale: Math.min(4, (activeSticker.scale || 1) + 0.2) })} className="p-3 bg-white rounded-xl border-2 border-[#E2D6C8] text-[#8A7A6A] active:bg-[#EFE7DB]"><ZoomIn size={20}/></button>
            <div className="w-[2px] bg-[#E2D6C8] mx-1 rounded-full" />
            <button onClick={() => updateSticker(trip.id, activeSticker.id, { rotate: (activeSticker.rotate || 0) - 15 })} className="p-3 bg-[#FFF3D6] rounded-xl border-2 border-[#E2D6C8] text-[#E2A622] active:bg-[#EFE7DB]"><RotateCcw size={20}/></button>
            <button onClick={() => updateSticker(trip.id, activeSticker.id, { rotate: (activeSticker.rotate || 0) + 15 })} className="p-3 bg-[#FFF3D6] rounded-xl border-2 border-[#E2D6C8] text-[#E2A622] active:bg-[#EFE7DB]"><RotateCw size={20}/></button>
            <div className="w-[2px] bg-[#E2D6C8] mx-1 rounded-full" />
            <button onClick={() => { removeSticker(trip.id, activeSticker.id); setActiveStickerId(null); }} className="p-3 bg-[#F28482] rounded-xl border-2 border-[#D68192] text-white active:bg-[#D68192]"><Trash2 size={20}/></button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}