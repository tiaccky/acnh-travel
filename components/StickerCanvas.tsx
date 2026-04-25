"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTripStore, Sticker } from '@/store/useTripStore';
import { usePathname } from 'next/navigation';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, Trash2 } from 'lucide-react';

const DraggableSticker = ({ sticker, tripId, isActive, setIsActive }: { sticker: Sticker, tripId: string, isActive: boolean, setIsActive: (id: string|null) => void }) => {
  const { updateSticker, removeSticker } = useTripStore();
  const [localVisual, setLocalVisual] = useState({ scale: sticker.scale || 1, rotate: sticker.rotate || 0 });
  
  useEffect(() => { setLocalVisual({ scale: sticker.scale || 1, rotate: sticker.rotate || 0 }); },[sticker.scale, sticker.rotate]);

  return (
    <motion.div
      drag dragMomentum={false}
      onDragEnd={(_, info) => updateSticker(tripId, sticker.id, { x: sticker.x + info.offset.x, y: sticker.y + info.offset.y })}
      initial={{ x: sticker.x, y: sticker.y }} animate={{ x: sticker.x, y: sticker.y }}
      onPointerDown={(e) => { e.stopPropagation(); setIsActive(sticker.id); }} // 🌟 點擊貼圖啟動
      className="absolute pointer-events-auto touch-none"
      style={{ zIndex: isActive ? 950 : 40, left: 0, top: 0 }}
    >
      {/* 🌟 貼圖本體 */}
      <div style={{ width: 100, height: 100, transform: `scale(${localVisual.scale}) rotate(${localVisual.rotate}deg)`, transformOrigin: 'center' }}>
        <img src={sticker.url} className={`w-full h-full object-contain pointer-events-none select-none transition-all ${isActive ? 'ring-2 ring-dashed ring-[#E2A622] rounded-[12px]' : ''}`} />
      </div>

      {/* 🌟 迷你控制台：置中貼齊下方、無陰影、保證點擊不消失 */}
      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
            onPointerDown={(e) => e.stopPropagation()} // 🌟 攔截觸控
            onClick={(e) => e.stopPropagation()}       // 🌟 攔截點擊
            className="absolute z-[1000] flex gap-1 bg-[#FBF7F2] p-1.5 rounded-xl border-2 border-[#E2D6C8] w-max cursor-default"
            style={{ 
              // 🌟 完美置中公式：左側向右推 50px (貼圖寬度的一半)，再用 transform 扣除自身寬度的一半
              left: '50px', 
              top: `${50 + (50 * localVisual.scale) + 8}px`, 
              transform: 'translateX(-50%)' 
            }}
          >
            {/* 🌟 每個按鈕都加上 type="button" 且阻止預設行為，保證不會連動 */}
            <button type="button" onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); const s = Math.max(0.5, localVisual.scale - 0.2); setLocalVisual(p=>({...p, scale: s})); updateSticker(tripId, sticker.id, { scale: s }); }} className="p-1.5 bg-white rounded-lg border border-[#E2D6C8] text-[#8A7A6A] active:bg-[#EFE7DB]"><ZoomOut size={14}/></button>
            <button type="button" onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); const s = Math.min(4, localVisual.scale + 0.2); setLocalVisual(p=>({...p, scale: s})); updateSticker(tripId, sticker.id, { scale: s }); }} className="p-1.5 bg-white rounded-lg border border-[#E2D6C8] text-[#8A7A6A] active:bg-[#EFE7DB]"><ZoomIn size={14}/></button>
            <div className="w-[1.5px] bg-[#E2D6C8] mx-0.5 rounded-full" />
            <button type="button" onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); const r = localVisual.rotate - 15; setLocalVisual(p=>({...p, rotate: r})); updateSticker(tripId, sticker.id, { rotate: r }); }} className="p-1.5 bg-[#FFF3D6] rounded-lg border border-[#E2D6C8] text-[#E2A622] active:bg-[#EFE7DB]"><RotateCcw size={14}/></button>
            <button type="button" onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); const r = localVisual.rotate + 15; setLocalVisual(p=>({...p, rotate: r})); updateSticker(tripId, sticker.id, { rotate: r }); }} className="p-1.5 bg-[#FFF3D6] rounded-lg border border-[#E2D6C8] text-[#E2A622] active:bg-[#EFE7DB]"><RotateCw size={14}/></button>
            <div className="w-[1.5px] bg-[#E2D6C8] mx-0.5 rounded-full" />
            <button type="button" onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); removeSticker(tripId, sticker.id); setIsActive(null); }} className="p-1.5 bg-[#F28482] rounded-lg border border-[#D68192] text-white active:bg-[#D68192]"><Trash2 size={14}/></button>
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
      const tab = localStorage.getItem('toolboxTab') || 'PACKING';
      setToolboxTab(tab === 'SHOPPING' ? 1 : tab === 'MEMORIES' ? 2 : 0);
    };
    updateTab(); window.addEventListener('toolboxTabChanged', updateTab);
    return () => window.removeEventListener('toolboxTabChanged', updateTab);
  },[]);

  const trip = trips.find(t => t.id === activeTripId);
  if (!trip) return null;
  
  const pageStickers = trip.stickers?.filter(s => {
    if (pathname === '/toolbox') return s.pagePath === pathname && s.dayIndex === toolboxTab;
    if (pathname === '/plan') return s.pagePath === pathname && s.dayIndex === activeDayIndex;
    return s.pagePath === pathname;
  }) ||[];

  return (
    <>
      {/* 🌟 只有點背景才會關閉選單 */}
      {activeStickerId && <div className="fixed inset-0 z-[900]" onPointerDown={() => setActiveStickerId(null)} />}
      
      <div className="absolute inset-0 pointer-events-none z-[40] overflow-hidden min-h-[150vh] print-hide">
        {pageStickers.map((sticker) => (
          <DraggableSticker key={sticker.id} sticker={sticker} tripId={trip.id} isActive={activeStickerId === sticker.id} setIsActive={setActiveStickerId} />
        ))}
      </div>
    </>
  );
}