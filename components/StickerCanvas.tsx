"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTripStore, Sticker } from '@/store/useTripStore';
import { usePathname } from 'next/navigation';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, Trash2 } from 'lucide-react';

const DraggableSticker = ({ sticker, tripId, isActive, setIsActive }: { sticker: Sticker, tripId: string, isActive: boolean, setIsActive: (id: string|null) => void }) => {
  const { updateSticker } = useTripStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [localVisual, setLocalVisual] = useState({ scale: sticker.scale || 1, rotate: sticker.rotate || 0 });
  useEffect(() => { setLocalVisual({ scale: sticker.scale || 1, rotate: sticker.rotate || 0 }); },[sticker.scale, sticker.rotate]);

  return (
    <>
      <motion.div
        ref={containerRef} drag dragMomentum={false}
        onDragEnd={(_, info) => updateSticker(tripId, sticker.id, { x: sticker.x + info.offset.x, y: sticker.y + info.offset.y })}
        initial={{ x: sticker.x, y: sticker.y }} animate={{ x: sticker.x, y: sticker.y }}
        // 🌟 防穿透：強制攔截所有指標事件！
        onPointerDown={(e) => { e.stopPropagation(); setIsActive(sticker.id); }}
        className="absolute touch-none"
        // 🌟 pointer-events-auto 讓點擊只停在這裡，不會穿透到底下的網頁！
        style={{ zIndex: isActive ? 950 : 40, left: 0, top: 0, pointerEvents: 'auto' }}
      >
        <div style={{ width: 100, height: 100, transform: `scale(${localVisual.scale}) rotate(${localVisual.rotate}deg)`, transformOrigin: 'center' }}>
          <img src={sticker.url} className={`w-full h-full object-contain pointer-events-none select-none transition-all ${isActive ? 'ring-4 ring-dashed ring-[#E2A622] rounded-[16px]' : ''}`} />
        </div>
      </motion.div>

      {/* 🌟 編輯選單完全分離在 motion.div 外，絕對不會互相干擾 */}
      <AnimatePresence>
        {isActive && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            // 🌟 攔截選單上的所有點擊，防止穿透關閉！
            onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            className="absolute z-[1000] flex gap-1 bg-[#FBF7F2] p-1.5 rounded-[16px] border-[3px] border-[#E2D6C8] shadow-xl w-max pointer-events-auto touch-none"
            style={{ left: `${sticker.x + 50}px`, top: `${sticker.y + 50 + (50 * localVisual.scale) + 12}px`, transform: 'translateX(-50%)' }}
          >
            <button onPointerDown={(e) => { e.stopPropagation(); const s = Math.max(0.5, localVisual.scale - 0.2); setLocalVisual(p=>({...p, scale: s})); updateSticker(tripId, sticker.id, { scale: s }); }} className="p-2 bg-white rounded-xl border-2 border-[#E2D6C8] text-[#8A7A6A] active:bg-[#EFE7DB]"><ZoomOut size={16}/></button>
            <button onPointerDown={(e) => { e.stopPropagation(); const s = Math.min(4, localVisual.scale + 0.2); setLocalVisual(p=>({...p, scale: s})); updateSticker(tripId, sticker.id, { scale: s }); }} className="p-2 bg-white rounded-xl border-2 border-[#E2D6C8] text-[#8A7A6A] active:bg-[#EFE7DB]"><ZoomIn size={16}/></button>
            <div className="w-[2px] bg-[#E2D6C8] mx-0.5 rounded-full" />
            <button onPointerDown={(e) => { e.stopPropagation(); const r = localVisual.rotate - 15; setLocalVisual(p=>({...p, rotate: r})); updateSticker(tripId, sticker.id, { rotate: r }); }} className="p-2 bg-[#FFF3D6] rounded-xl border-2 border-[#E2D6C8] text-[#E2A622] active:bg-[#EFE7DB]"><RotateCcw size={16}/></button>
            <button onPointerDown={(e) => { e.stopPropagation(); const r = localVisual.rotate + 15; setLocalVisual(p=>({...p, rotate: r})); updateSticker(tripId, sticker.id, { rotate: r }); }} className="p-2 bg-[#FFF3D6] rounded-xl border-2 border-[#E2D6C8] text-[#E2A622] active:bg-[#EFE7DB]"><RotateCw size={16}/></button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default function StickerCanvas() {
  const pathname = usePathname();
  const { trips, activeTripId, activeDayIndex, removeSticker } = useTripStore();
  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);

  const trip = trips.find(t => t.id === activeTripId);
  if (!trip) return null;
  
  // 🌟 精準過濾：行程頁嚴格比對 activeDayIndex！
  const pageStickers = trip.stickers?.filter(s => {
    if (pathname === '/plan') return s.pagePath === pathname && s.dayIndex === activeDayIndex;
    if (pathname === '/toolbox') {
       const tab = localStorage.getItem('toolboxTab') || 'SHOPPING';
       const tabIdx = tab === 'SHOPPING' ? 1 : tab === 'MEMORIES' ? 2 : 0;
       return s.pagePath === pathname && s.dayIndex === tabIdx;
    }
    return s.pagePath === pathname;
  }) || [];

  const activeSticker = pageStickers.find(s => s.id === activeStickerId);

  return (
    <>
      {/* 🌟 背景防護網：點擊空白處取消編輯 */}
      {activeStickerId && <div className="fixed inset-0 z-[900]" onPointerDown={(e) => { e.preventDefault(); setActiveStickerId(null); }} />}
      
      {/* 貼圖畫布 */}
      <div className="absolute inset-0 pointer-events-none z-[40] overflow-hidden min-h-[150vh] print-hide">
        {pageStickers.map((sticker) => (
          <DraggableSticker key={sticker.id} sticker={sticker} tripId={trip.id} isActive={activeStickerId === sticker.id} setIsActive={setActiveStickerId} />
        ))}
      </div>

      {/* 🌟 將刪除鍵獨立在左下角，防止誤觸 */}
      <AnimatePresence>
        {activeSticker && (
           <motion.button 
             initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }}
             onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); removeSticker(trip.id, activeSticker.id); setActiveStickerId(null); }}
             className="fixed bottom-[180px] right-6 p-4 bg-[#F28482] rounded-full text-white shadow-xl z-[1000] active:scale-90"
           >
             <Trash2 size={24} />
           </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}