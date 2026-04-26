"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTripStore, Sticker } from '@/store/useTripStore';
import { usePathname } from 'next/navigation';
import { ZoomIn, ZoomOut, Trash2 } from 'lucide-react';

const DraggableSticker = ({ sticker, tripId, isActive, setIsActive }: { sticker: Sticker, tripId: string, isActive: boolean, setIsActive: (id: string|null) => void }) => {
  const { updateSticker } = useTripStore();
  
  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragEnd={(_, info) => updateSticker(tripId, sticker.id, { x: sticker.x + info.offset.x, y: sticker.y + info.offset.y })}
      onTap={() => setIsActive(sticker.id)}
      className="absolute z-[40] touch-none cursor-pointer p-2"
      style={{ x: sticker.x, y: sticker.y }}
    >
      <div 
        className={`${isActive ? 'ring-2 ring-dashed ring-[#E2A622] rounded-[12px]' : ''}`}
        style={{ width: 100, height: 100, transform: `scale(${sticker.scale || 1}) rotate(${sticker.rotate || 0}deg)`, transformOrigin: 'center' }}
      >
        <img src={sticker.url} className="w-full h-full object-contain pointer-events-none select-none" />
      </div>
    </motion.div>
  );
};

export default function StickerCanvas() {
  const pathname = usePathname();
  const { trips, activeTripId, activeDayIndex, updateSticker, removeSticker } = useTripStore();
  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);
  const [toolboxTab, setToolboxTab] = useState(0);

  const trip = trips.find(t => t.id === activeTripId);
  if (!trip) return null;

  const pageStickers = trip.stickers?.filter(s => {
    if (pathname === '/toolbox') return s.pagePath === pathname && s.dayIndex === toolboxTab;
    if (pathname === '/plan') return s.pagePath === pathname && s.dayIndex === activeDayIndex;
    return s.pagePath === pathname;
  }) || [];

  return (
    <>
      {activeStickerId && <div className="fixed inset-0 z-[800]" onPointerDown={() => setActiveStickerId(null)} />}
      
      {/* 貼圖渲染層 */}
      <div className="absolute inset-0 z-[40] pointer-events-none overflow-hidden min-h-[150vh]">
        <div className="pointer-events-auto">
          {pageStickers.map((sticker) => (
            <DraggableSticker key={sticker.id} sticker={sticker} tripId={trip.id} isActive={activeStickerId === sticker.id} setIsActive={setActiveStickerId} />
          ))}
        </div>
      </div>

      {/* 固定底部控制列 */}
      {activeStickerId && (
        <div className="fixed bottom-24 left-5 right-5 z-[1000] bg-[#FBF7F2] p-4 rounded-2xl border-[3px] border-[#E2D6C8] shadow-2xl flex justify-between items-center print-hide">
          <span className="text-[10px] font-black text-[#8A7A6A]">編輯貼圖</span>
          <div className="flex gap-2">
            <button onClick={() => { const s = trip.stickers.find(x=>x.id===activeStickerId); if(s) updateSticker(trip.id, activeStickerId, { scale: Math.max(0.5, (s.scale||1)-0.2) }); }} className="p-2 bg-white rounded-lg border-2 border-[#E2D6C8]"><ZoomOut size={20} /></button>
            <button onClick={() => { const s = trip.stickers.find(x=>x.id===activeStickerId); if(s) updateSticker(trip.id, activeStickerId, { scale: Math.min(3, (s.scale||1)+0.2) }); }} className="p-2 bg-white rounded-lg border-2 border-[#E2D6C8]"><ZoomIn size={20} /></button>
            <button onClick={() => { removeSticker(trip.id, activeStickerId); setActiveStickerId(null); }} className="p-2 bg-[#F28482] text-white rounded-lg border-2 border-[#D68192]"><Trash2 size={20} /></button>
          </div>
        </div>
      )}
    </>
  );
}