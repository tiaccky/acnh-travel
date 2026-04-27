"use client";
import React, { useEffect, useState } from 'react';
import { Home, Calendar, Wallet, Wrench, Sticker as StickerIcon, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import StickerCanvas from '@/components/StickerCanvas';
import { useTripStore } from '@/store/useTripStore';

const CUSTOM_STICKER_COUNT = 30;
const DEFAULT_STICKERS = Array.from({ length: CUSTOM_STICKER_COUNT }, (_, i) => `/stickers/${i + 1}.png`);

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isStickerDrawerOpen, setStickerDrawerOpen] = useState(false);
  
  const { trips, activeTripId, addSticker, customStickers, addCustomSticker, removeCustomSticker } = useTripStore();

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="min-h-screen bg-[#F6F1E8]" />;

  // 🌟 核心修復 1：使用 .getState() 動態抓取最新的日期狀態！
  const handleAddSticker = (url: string, e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation(); 
      if (e.type === 'touchend') e.preventDefault(); 
    }

    const state = useTripStore.getState(); // 動態抓取最新狀態
    const targetId = state.activeTripId || (state.trips.length > 0 ? state.trips[0].id : null);

    if (targetId) {
      let currentDayIndex: number | undefined = undefined;
      
      // 確保抓到的是「當下」的 activeDayIndex
      if (pathname === '/plan') currentDayIndex = state.activeDayIndex; 
      if (pathname === '/toolbox') {
        const tab = localStorage.getItem('toolboxTab') || 'SHOPPING'; // 預設是 SHOPPING
        currentDayIndex = tab === 'SHOPPING' ? 1 : tab === 'MEMORIES' ? 2 : 0; // PACKING 是 0
      }
      
      addSticker(targetId, { 
        id: Date.now().toString(), 
        url, 
        x: window.innerWidth / 2 - 50, // 初始位置置中
        y: window.innerHeight / 2 - 50, 
        scale: 1, 
        rotate: 0, 
        pagePath: pathname,
        dayIndex: currentDayIndex // 寫入正確的日期或分頁 ID
      });
      setStickerDrawerOpen(false);
    } else {
      alert("請先到首頁選擇或建立一個行程，才能在島上貼貼紙喔！🏝️");
    }
  };

  const handleUploadSticker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        addCustomSticker(url);
        handleAddSticker(url);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative min-h-screen font-huninn">
      <main className="min-h-screen pb-[100px]">{children}</main>
      <StickerCanvas />

      {isStickerDrawerOpen && (
        <>
          <div 
            className="fixed inset-0 z-[990]" 
            onClick={() => setStickerDrawerOpen(false)} 
            onTouchEnd={(e) => { e.preventDefault(); setStickerDrawerOpen(false); }}
          />
          <div className="fixed bottom-[160px] left-4 bg-[#FBF7F2] p-4 rounded-[20px] border-[3px] border-[#E2D6C8] shadow-xl z-[1000] w-[280px] print-hide">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-black text-[#7A5C3E]">選擇專屬貼紙 ✨</span>
              <button 
                onClick={() => setStickerDrawerOpen(false)} 
                onTouchEnd={(e) => { e.preventDefault(); setStickerDrawerOpen(false); }}
              >
                <X size={16} className="text-[#B7A99A]"/>
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-2 max-h-[250px] overflow-y-auto pr-1 hide-scrollbar">
              {DEFAULT_STICKERS.map((url, i) => (
                <button 
                  key={`def-${i}`} 
                  onClick={(e) => handleAddSticker(url, e)} 
                  onTouchEnd={(e) => handleAddSticker(url, e)}
                  className="p-2 bg-white rounded-xl border-2 border-[#E2D6C8] active:scale-95 transition-transform aspect-square flex items-center justify-center cursor-pointer"
                >
                  <img src={url} className="w-full h-full object-contain pointer-events-none" onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }} />
                </button>
              ))}
              
              {customStickers?.map((url, i) => (
                <div key={`cus-${i}`} className="relative p-2 bg-white rounded-xl border-2 border-[#E2D6C8] active:scale-95 transition-transform aspect-square flex items-center justify-center">
                  <button 
                    onClick={(e) => handleAddSticker(url, e)} 
                    onTouchEnd={(e) => handleAddSticker(url, e)}
                    className="w-full h-full cursor-pointer"
                  >
                    <img src={url} className="w-full h-full object-contain pointer-events-none" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeCustomSticker(url); }} 
                    onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); removeCustomSticker(url); }}
                    className="absolute top-1 right-1 bg-[#F28482]/80 backdrop-blur-md text-white rounded-full p-1 shadow-sm z-50 active:scale-90"
                  >
                    <X size={10} strokeWidth={4} />
                  </button>
                </div>
              ))}

              <label className="p-2 bg-[#A8E0BD] rounded-xl border-2 border-[#4FA76F] flex items-center justify-center cursor-pointer text-[#2F7D57] active:scale-95 transition-transform aspect-square">
                <Plus size={20} strokeWidth={3} className="pointer-events-none" />
                <input type="file" accept="image/*" className="hidden" onChange={handleUploadSticker} />
              </label>
            </div>
          </div>
        </>
      )}

      <button 
        onClick={() => setStickerDrawerOpen(!isStickerDrawerOpen)} 
        onTouchEnd={(e) => { e.preventDefault(); setStickerDrawerOpen(!isStickerDrawerOpen); }}
        className="fixed bottom-[100px] left-4 w-12 h-12 bg-[#F6C945] rounded-[16px] border-[3px] border-[#E2A622] flex items-center justify-center text-[#5C4A3D] transition-all z-[999] print-hide active:translate-y-1 active:shadow-none shadow-[0_4px_0_#E2A622]"
      >
        <StickerIcon size={24} />
      </button>

      <nav className="fixed bottom-0 left-0 right-0 w-full bg-[#FBF7F2] border-t-[3px] border-[#E2D6C8] z-[999] px-6 py-3 pb-[calc(12px+env(safe-area-inset-bottom))] flex justify-between items-center shadow-[0_-8px_20px_rgba(0,0,0,0.05)] print-hide">
        {[ 
          { icon: <Home size={24} />, label: "首頁", href: "/" }, 
          { icon: <Calendar size={24} />, label: "行程", href: "/plan" }, 
          { icon: <Wallet size={24} />, label: "帳目", href: "/budget" }, 
          { icon: <Wrench size={24} />, label: "工具", href: "/toolbox" } 
        ].map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 group">
              <div className={`transition-all duration-300 ${isActive ? "text-[#6DBE8A] -translate-y-1 scale-110" : "text-[#B7A99A]"}`}>{item.icon}</div>
              <span className={`text-[10px] transition-all ${isActive ? "font-black text-[#6DBE8A]" : "font-bold text-[#B7A99A]"}`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}