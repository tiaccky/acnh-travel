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
    <>
      {/* 貼圖渲染區 */}
      {pageStickers.map(sticker => (
        <DraggableSticker key={sticker.id} ... />
      ))}

      {/* 🌟 永遠固定在螢幕底部的編輯列 */}
      <AnimatePresence>
        {activeStickerId && (
          <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
            className="fixed bottom-24 left-5 right-5 z-[1000] bg-[#FBF7F2] p-3 rounded-2xl border-[3px] border-[#E2D6C8] flex justify-between items-center"
          >
             <span className="text-[10px] font-black text-[#8A7A6A]">編輯貼圖</span>
             <div className="flex gap-2">
                <button onClick={() => { /* 更新 scale -0.2 */ }}><ZoomOut /></button>
                <button onClick={() => { /* 更新 scale +0.2 */ }}><ZoomIn /></button>
                <button onClick={() => { /* 刪除 */ }} className="text-red-500"><Trash2 /></button>
             </div>
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
      
      // StickerCanvas.tsx 內部的 return 區塊
<div className="absolute inset-0 z-[40] pointer-events-none overflow-hidden min-h-[150vh]">
  {pageStickers.map((sticker) => (
    <DraggableSticker key={sticker.id} sticker={sticker} tripId={trip.id} isActive={activeStickerId === sticker.id} setIsActive={setActiveStickerId} />
         ))}
</div>
    </>
  );
}