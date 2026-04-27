"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTripStore, Sticker } from '@/store/useTripStore';
import { usePathname } from 'next/navigation';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, Trash2 } from 'lucide-react';

const DraggableSticker = ({ sticker, tripId, isActive, setIsActive }: { sticker: Sticker, tripId: string, isActive: boolean, setIsActive: (id: string|null) => void }) => {
  const { updateSticker, removeSticker } = useTripStore();
  
  const [localVisual, setLocalVisual] = useState({ x: sticker.x, y: sticker.y, scale: sticker.scale || 1, rotate: sticker.rotate || 0 });
  
  useEffect(() => { 
    setLocalVisual({ x: sticker.x, y: sticker.y, scale: sticker.scale || 1, rotate: sticker.rotate || 0 }); 
  }, [sticker.x, sticker.y, sticker.scale, sticker.rotate]);

  const handleUpdate = (updates: Partial<Sticker>) => {
    setLocalVisual(prev => ({ ...prev, ...updates }));
    updateSticker(tripId, sticker.id, updates);
  };

  return (
    <motion.div
      drag dragMomentum={false}
      onDrag={(e, info) => {
        setLocalVisual(prev => ({ ...prev, x: prev.x + info.delta.x, y: prev.y + info.delta.y }));
      }}
      onDragEnd={() => {
        updateSticker(tripId, sticker.id, { x: localVisual.x, y: localVisual.y });
      }}
      style={{ x: localVisual.x, y: localVisual.y, zIndex: isActive ? 950 : 40 }}
      onPointerDown={(e) => { e.stopPropagation(); setIsActive(sticker.id); }}
      // 🌟 確保這整個區塊是絕對定位，並作為選單的父層基準
      className="absolute pointer-events-auto touch-none"
    >
      {/* 🌟 1. 貼圖本體 (只對這個 div 做縮放旋轉，不影響外層容器) */}
      <div style={{ width: 100, height: 100, transform: `scale(${localVisual.scale}) rotate(${localVisual.rotate}deg)`, transformOrigin: 'center' }}>
        <img src={sticker.url} alt="sticker" className={`w-full h-full object-contain pointer-events-none select-none transition-all ${isActive ? 'ring-4 ring-dashed ring-[#E2A622] rounded-[12px]' : ''}`} />
      </div>

      {/* 🌟 2. 編輯選單 (放在 motion.div 裡面！) */}
      {/* 這樣它會自動跟著貼圖移動，我們只需要計算 Y 軸往下推多少即可 */}
      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            // 🌟 關鍵：攔截點擊事件，絕對不讓 Framer Motion 觸發拖曳或關閉！
            onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); }} 
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
            className="absolute flex gap-1 bg-[#FBF7F2] p-1.5 rounded-[16px] border-[3px] border-[#E2D6C8] shadow-xl w-max cursor-default z-[1000]"
            style={{
               // 🌟 完美公式：中心點是 50。高度是 50 + (50 * 縮放比例) + 15px空隙
               top: 50 + (50 * localVisual.scale) + 15,
               left: 50, 
               transform: 'translateX(-50%)'
            }}
          >
            {/* 🌟 改用 onClick 確保按鈕在手機端能 100% 觸發 */}
            <button onClick={() => handleUpdate({ scale: Math.max(0.5, localVisual.scale - 0.2) })} className="p-2 bg-white rounded-xl border-2 border-[#E2D6C8] text-[#8A7A6A] active:bg-[#EFE7DB]"><ZoomOut size={16}/></button>
            <button onClick={() => handleUpdate({ scale: Math.min(4, localVisual.scale + 0.2) })} className="p-2 bg-white rounded-xl border-2 border-[#E2D6C8] text-[#8A7A6A] active:bg-[#EFE7DB]"><ZoomIn size={16}/></button>
            <div className="w-[2px] bg-[#E2D6C8] mx-0.5 rounded-full" />
            <button onClick={() => handleUpdate({ rotate: localVisual.rotate - 15 })} className="p-2 bg-[#FFF3D6] rounded-xl border-2 border-[#E2D6C8] text-[#E2A622] active:bg-[#EFE7DB]"><RotateCcw size={16}/></button>
            <button onClick={() => handleUpdate({ rotate: localVisual.rotate + 15 })} className="p-2 bg-[#FFF3D6] rounded-xl border-2 border-[#E2D6C8] text-[#E2A622] active:bg-[#EFE7DB]"><RotateCw size={16}/></button>
            <div className="w-[2px] bg-[#E2D6C8] mx-0.5 rounded-full" />
            <button onClick={() => { removeSticker(tripId, sticker.id); setIsActive(null); }} className="p-2 bg-[#F28482] rounded-xl border-2 border-[#D68192] text-white active:bg-[#D68192]"><Trash2 size={16}/></button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function StickerCanvas() {
  const pathname = usePathname();
  const { trips, activeTripId, activeDayIndex } = useTripStore();
  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);
  const [toolboxTab, setToolboxTab] = useState(0);

  useEffect(() => {
    const updateTab = () => {
      const tab = localStorage.getItem('toolboxTab') || 'SHOPPING'; 
      setToolboxTab(tab === 'SHOPPING' ? 1 : tab === 'MEMORIES' ? 2 : 0);
    };
    updateTab();
    window.addEventListener('toolboxTabChanged', updateTab);
    return () => window.removeEventListener('toolboxTabChanged', updateTab);
  }, []);

  // 🌟 關鍵修正：當切換日期 (activeDayIndex) 或頁面時，強制關閉正在編輯的貼圖！
  // 避免舊日期的狀態殘留到新日期
  useEffect(() => {
    setActiveStickerId(null);
  }, [pathname, activeDayIndex, toolboxTab]);

  const trip = trips.find(t => t.id === activeTripId);
  if (!trip) return null;
  
  // 🌟 更嚴謹的路由與日期比對邏輯
  const pageStickers = trip.stickers?.filter(s => {
    const isPlanPage = pathname.includes('/plan') && s.pagePath.includes('/plan');
    const isToolboxPage = pathname.includes('/toolbox') && s.pagePath.includes('/toolbox');

    // 加入 ?? 0 防呆，避免早期舊資料沒有 dayIndex 導致錯亂
    if (isPlanPage) return (s.dayIndex ?? 0) === activeDayIndex;
    if (isToolboxPage) return (s.dayIndex ?? 0) === toolboxTab;
    
    return s.pagePath === pathname;
  }) || [];

  return (
    <>
      {activeStickerId && <div className="fixed inset-0 z-[900]" onPointerDown={() => setActiveStickerId(null)} />}
      
      <div className="absolute inset-0 pointer-events-none z-[40] overflow-hidden min-h-[150vh] print-hide">
        {pageStickers.map((sticker) => (
          <DraggableSticker key={sticker.id} sticker={sticker} tripId={trip.id} isActive={activeStickerId === sticker.id} setIsActive={setActiveStickerId} />
        ))}
      </div>
    </>
  );
}