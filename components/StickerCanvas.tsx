"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTripStore, Sticker } from '@/store/useTripStore';
import { usePathname } from 'next/navigation';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, Trash2 } from 'lucide-react';

const DraggableSticker = ({ sticker, tripId, isActive, setIsActive }: { sticker: Sticker, tripId: string, isActive: boolean, setIsActive: (id: string|null) => void }) => {
  const { updateSticker, removeSticker } = useTripStore();
  
  // 🌟 本地狀態緩存，提供極致流暢的操作
  const [localVisual, setLocalVisual] = useState({ x: sticker.x, y: sticker.y, scale: sticker.scale || 1, rotate: sticker.rotate || 0 });
  
  useEffect(() => { 
    setLocalVisual({ x: sticker.x, y: sticker.y, scale: sticker.scale || 1, rotate: sticker.rotate || 0 }); 
  }, [sticker.x, sticker.y, sticker.scale, sticker.rotate]);

  // 統一處理更新，並即時反映在畫面上
  const handleUpdate = (updates: Partial<Sticker>) => {
    setLocalVisual(prev => ({ ...prev, ...updates }));
    updateSticker(tripId, sticker.id, updates);
  };

  return (
    <>
      {/* 🌟 貼圖本體 */}
      <motion.div
        drag dragMomentum={false}
        onDrag={(e, info) => {
          // 拖曳時只更新本地狀態，不觸發全域渲染 (超順暢)
          setLocalVisual(prev => ({ ...prev, x: prev.x + info.delta.x, y: prev.y + info.delta.y }));
        }}
        onDragEnd={(_, info) => {
          // 放開時才寫入資料庫
          updateSticker(tripId, sticker.id, { x: localVisual.x, y: localVisual.y });
        }}
        // 將位置與本地狀態綁定
        style={{ x: localVisual.x, y: localVisual.y, zIndex: isActive ? 950 : 40 }}
        onPointerDown={(e) => { e.stopPropagation(); setIsActive(sticker.id); }}
        className="absolute pointer-events-auto touch-none"
      >
        <div style={{ width: 100, height: 100, transform: `scale(${localVisual.scale}) rotate(${localVisual.rotate}deg)`, transformOrigin: 'center' }}>
          <img src={sticker.url} alt="sticker" className={`w-full h-full object-contain pointer-events-none select-none transition-all ${isActive ? 'ring-4 ring-dashed ring-[#E2A622] rounded-[12px]' : ''}`} />
        </div>
      </motion.div>

      {/* 🌟 編輯選單：完全分離！不受貼圖縮放影響，永遠定位在貼圖下方！ */}
      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); }} // 🌟 攔截事件，保證絕對不會關閉！
            className="absolute z-[1000] flex gap-1 bg-[#FBF7F2] p-1.5 rounded-[16px] border-[3px] border-[#E2D6C8] shadow-xl w-max cursor-default pointer-events-auto touch-none"
            style={{
               // 🌟 完美定位：貼圖中心點 (x + 50)，高度固定在貼圖下方 (y + 120)
               left: localVisual.x + 50, 
               top: localVisual.y + 120 + (localVisual.scale > 1 ? (localVisual.scale - 1) * 50 : 0), 
               transform: 'translateX(-50%)'
            }}
          >
            <button onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); handleUpdate({ scale: Math.max(0.5, localVisual.scale - 0.2) }); }} className="p-2 bg-white rounded-xl border-2 border-[#E2D6C8] text-[#8A7A6A] active:bg-[#EFE7DB]"><ZoomOut size={16}/></button>
            <button onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); handleUpdate({ scale: Math.min(4, localVisual.scale + 0.2) }); }} className="p-2 bg-white rounded-xl border-2 border-[#E2D6C8] text-[#8A7A6A] active:bg-[#EFE7DB]"><ZoomIn size={16}/></button>
            <div className="w-[2px] bg-[#E2D6C8] mx-0.5 rounded-full" />
            <button onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); handleUpdate({ rotate: localVisual.rotate - 15 }); }} className="p-2 bg-[#FFF3D6] rounded-xl border-2 border-[#E2D6C8] text-[#E2A622] active:bg-[#EFE7DB]"><RotateCcw size={16}/></button>
            <button onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); handleUpdate({ rotate: localVisual.rotate + 15 }); }} className="p-2 bg-[#FFF3D6] rounded-xl border-2 border-[#E2D6C8] text-[#E2A622] active:bg-[#EFE7DB]"><RotateCw size={16}/></button>
            <div className="w-[2px] bg-[#E2D6C8] mx-0.5 rounded-full" />
            <button onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); removeSticker(tripId, sticker.id); setIsActive(null); }} className="p-2 bg-[#F28482] rounded-xl border-2 border-[#D68192] text-white active:bg-[#D68192]"><Trash2 size={16}/></button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default function StickerCanvas() {
  const pathname = usePathname();
  const { trips, activeTripId, activeDayIndex } = useTripStore();
  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);
  const [toolboxTab, setToolboxTab] = useState(0);

  useEffect(() => {
    const updateTab = () => {
      const tab = localStorage.getItem('toolboxTab') || 'SHOPPING'; // 預設通常是 SHOPPING
      setToolboxTab(tab === 'SHOPPING' ? 1 : tab === 'MEMORIES' ? 2 : 0); // PACKING=0
    };
    updateTab();
    window.addEventListener('toolboxTabChanged', updateTab);
    return () => window.removeEventListener('toolboxTabChanged', updateTab);
  }, []);

  const trip = trips.find(t => t.id === activeTripId);
  if (!trip) return null;
  
  const pageStickers = trip.stickers?.filter(s => {
    if (pathname === '/toolbox') return s.pagePath === pathname && s.dayIndex === toolboxTab;
    if (pathname === '/plan') return s.pagePath === pathname && s.dayIndex === activeDayIndex;
    return s.pagePath === pathname;
  }) || [];

  return (
    <>
      {/* 🌟 背景點擊關閉防護網 */}
      {activeStickerId && <div className="fixed inset-0 z-[900]" onPointerDown={() => setActiveStickerId(null)} />}
      
      <div className="absolute inset-0 pointer-events-none z-[40] overflow-hidden min-h-[150vh] print-hide">
        {pageStickers.map((sticker) => (
          <DraggableSticker key={sticker.id} sticker={sticker} tripId={trip.id} isActive={activeStickerId === sticker.id} setIsActive={setActiveStickerId} />
        ))}
      </div>
    </>
  );
}