"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTripStore, Sticker } from '@/store/useTripStore';
import { usePathname } from 'next/navigation';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, Trash2 } from 'lucide-react';

const DraggableSticker = ({ sticker, tripId, isActive, setIsActive }: { sticker: Sticker, tripId: string, isActive: boolean, setIsActive: (id: string|null) => void }) => {
  const { updateSticker, removeSticker } = useTripStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [localVisual, setLocalVisual] = useState({ scale: sticker.scale || 1, rotate: sticker.rotate || 0 });
  useEffect(() => { setLocalVisual({ scale: sticker.scale || 1, rotate: sticker.rotate || 0 }); }, [sticker.scale, sticker.rotate]);

  return (
    <>
      <motion.div
        ref={containerRef} drag dragMomentum={false}
        onDragEnd={(_, info) => updateSticker(tripId, sticker.id, { x: sticker.x + info.offset.x, y: sticker.y + info.offset.y })}
        initial={{ x: sticker.x, y: sticker.y }} animate={{ x: sticker.x, y: sticker.y }}
        // 🌟 點擊貼圖進入編輯狀態，並阻止事件穿透
        onPointerDown={(e) => { e.stopPropagation(); setIsActive(sticker.id); }}
        className="absolute pointer-events-auto touch-none"
        style={{ zIndex: isActive ? 950 : 40, left: 0, top: 0 }}
      >
        <div style={{ width: 100, height: 100, transform: `scale(${localVisual.scale}) rotate(${localVisual.rotate}deg)`, transformOrigin: 'center' }}>
          <img src={sticker.url} alt="sticker" className={`w-full h-full object-contain pointer-events-none select-none transition-all ${isActive ? 'ring-2 ring-dashed ring-[#E2A622] rounded-[12px]' : ''}`} />
        </div>
      </motion.div>

      {/* 🌟 編輯控制台：完美置中於貼圖下方，並包含刪除按鈕 */}
      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
            onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); }} 
            className="absolute z-[1000] flex gap-1 bg-[#FBF7F2] p-1.5 rounded-[16px] border-[3px] border-[#E2D6C8] shadow-xl w-max cursor-default pointer-events-auto touch-none"
            style={{
               // 🌟 完美置中公式：
               // left: 貼圖 x 座標 + (貼圖原始寬度 100 / 2) = 貼圖中心點
               left: `${sticker.x + 50}px`, 
               // top: 貼圖 y 座標 + (貼圖原始高度 100) + (縮放後增加的高度的一半) + 10px 的間距
               top: `${sticker.y + 100 + (100 * localVisual.scale - 100)/2 + 10}px`,
               // 使用 transform 將選單本身的中心點對齊 left
               transform: 'translateX(-50%)'
            }}
          >
            <button onPointerDown={(e) => { e.stopPropagation(); const s = Math.max(0.5, localVisual.scale - 0.2); setLocalVisual(p=>({...p, scale: s})); updateSticker(tripId, sticker.id, { scale: s }); }} className="p-2 bg-white rounded-xl border-2 border-[#E2D6C8] text-[#8A7A6A] active:bg-[#EFE7DB]"><ZoomOut size={16}/></button>
            <button onPointerDown={(e) => { e.stopPropagation(); const s = Math.min(4, localVisual.scale + 0.2); setLocalVisual(p=>({...p, scale: s})); updateSticker(tripId, sticker.id, { scale: s }); }} className="p-2 bg-white rounded-xl border-2 border-[#E2D6C8] text-[#8A7A6A] active:bg-[#EFE7DB]"><ZoomIn size={16}/></button>
            <div className="w-[2px] bg-[#E2D6C8] mx-0.5 rounded-full" />
            <button onPointerDown={(e) => { e.stopPropagation(); const r = localVisual.rotate - 15; setLocalVisual(p=>({...p, rotate: r})); updateSticker(tripId, sticker.id, { rotate: r }); }} className="p-2 bg-[#FFF3D6] rounded-xl border-2 border-[#E2D6C8] text-[#E2A622] active:bg-[#EFE7DB]"><RotateCcw size={16}/></button>
            <button onPointerDown={(e) => { e.stopPropagation(); const r = localVisual.rotate + 15; setLocalVisual(p=>({...p, rotate: r})); updateSticker(tripId, sticker.id, { rotate: r }); }} className="p-2 bg-[#FFF3D6] rounded-xl border-2 border-[#E2D6C8] text-[#E2A622] active:bg-[#EFE7DB]"><RotateCw size={16}/></button>
            <div className="w-[2px] bg-[#E2D6C8] mx-0.5 rounded-full" />
            {/* 🌟 刪除按鈕放回這裡 */}
            <button onPointerDown={(e) => { e.stopPropagation(); removeSticker(tripId, sticker.id); setIsActive(null); }} className="p-2 bg-[#F28482] rounded-xl border-2 border-[#D68192] text-white active:bg-[#D68192]"><Trash2 size={16}/></button>
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

  const trip = trips.find(t => t.id === activeTripId);

  // 🌟 即時監聽 Toolbox 的分頁切換
  useEffect(() => {
    const updateTab = () => {
      const tab = localStorage.getItem('toolboxTab') || 'PACKING'; // 注意：你預設可能是 SHOPPING，請以你的實際設定為準
      // 對應 tabIndex: PACKING=0, SHOPPING=1, MEMORIES=2
      setToolboxTab(tab === 'PACKING' ? 0 : tab === 'SHOPPING' ? 1 : tab === 'MEMORIES' ? 2 : 0);
    };
    updateTab();
    window.addEventListener('toolboxTabChanged', updateTab);
    return () => window.removeEventListener('toolboxTabChanged', updateTab);
  }, []);

  if (!trip) return null;

  // 🌟 最嚴格的過濾機制：保證絕不重複顯示
  const pageStickers = trip.stickers?.filter(s => {
    // 條件 1：必須在同一個頁面路徑 (例如都在 /plan)
    if (s.pagePath !== pathname) return false;
    
    // 條件 2：如果是行程頁 (/plan)，必須在同一個「天數」 (dayIndex)
    if (pathname === '/plan') {
      return s.dayIndex === activeDayIndex;
    }
    
    // 條件 3：如果是工具箱 (/toolbox)，必須在同一個「分頁」 (tabIndex)
    if (pathname === '/toolbox') {
      // 確保舊貼圖 (沒有 dayIndex 的) 也能顯示在預設分頁
      const sIndex = s.dayIndex === undefined ? 0 : s.dayIndex;
      return sIndex === toolboxTab;
    }
    
    // 首頁或其他頁面，只要路徑對就顯示
    return true;
  }) || [];

  return (
    <>
      {/* 🌟 背景遮罩：點擊空白處關閉編輯列 */}
      {activeStickerId && <div className="fixed inset-0 z-[900]" onPointerDown={() => setActiveStickerId(null)} />}
      
      <div className="absolute inset-0 pointer-events-none z-[40] overflow-hidden min-h-[150vh] print-hide">
        {pageStickers.map((sticker) => (
          <DraggableSticker key={sticker.id} sticker={sticker} tripId={trip.id} isActive={activeStickerId === sticker.id} setIsActive={setActiveStickerId} />
        ))}
      </div>
    </>
  );
}