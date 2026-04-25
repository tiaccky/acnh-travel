"use client";
import React, { useEffect, useState } from 'react';
import { Home, Calendar, Wallet, Wrench, Sticker as StickerIcon, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import StickerCanvas from '@/components/StickerCanvas';
import { useTripStore } from '@/store/useTripStore';

// 🌟 1. 這裡自動產生 1 到 20 的檔案路徑 (對應你放在 public/stickers/1.png ~ 20.png)
// 如果你只有 15 張，就把 20 改成 15！
const CUSTOM_STICKER_COUNT = 30;
const DEFAULT_STICKERS = Array.from({ length: CUSTOM_STICKER_COUNT }, (_, i) => `/stickers/${i + 1}.png`);

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const[isStickerDrawerOpen, setStickerDrawerOpen] = useState(false);
  // 🌟 補回 addCustomSticker！
  const { trips, activeTripId, addSticker, activeDayIndex, customStickers, addCustomSticker, removeCustomSticker } = useTripStore();

  useEffect(() => { setMounted(true); },[]);

  if (!mounted) return <div className="min-h-screen bg-[#F6F1E8]" />;

  const handleAddSticker = (url: string) => {
    if (activeTripId) {
      let currentDayIndex = undefined;
      if (pathname === '/plan') currentDayIndex = activeDayIndex;
      if (pathname === '/toolbox') {
        const tab = localStorage.getItem('toolboxTab') || 'PACKING';
        currentDayIndex = tab === 'SHOPPING' ? 1 : tab === 'MEMORIES' ? 2 : 0;
      }
      addSticker(activeTripId, { 
        id: Date.now().toString(), url, x: window.innerWidth / 2 - 40, y: window.innerHeight / 2 - 40, 
        scale: 1, rotate: 0, pagePath: pathname, dayIndex: currentDayIndex
      });
      setStickerDrawerOpen(false);
    }
  };

  const handleUploadSticker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const url = reader.result as string;
        addCustomSticker(url); // 🌟 存入貼紙簿
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
          <div className="fixed inset-0 z-[990]" onClick={() => setStickerDrawerOpen(false)} />
          {/* 🌟 2. 把寬度加寬一點點，並且讓選單可以捲動 (max-h-[300px] overflow-y-auto) */}
          <div className="fixed bottom-24 left-6 bg-[#FBF7F2] p-4 rounded-[20px] border-[3px] border-[#E2D6C8] shadow-xl z-[1000] w-[280px] print-hide">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-black text-[#7A5C3E]">選擇專屬貼紙 ✨</span>
              <button onClick={() => setStickerDrawerOpen(false)}><X size={16} className="text-[#B7A99A]"/></button>
            </div>
            
           {/* 🌟 貼圖網格：支援無限數量，可上下滑動 */}
            <div className="grid grid-cols-4 gap-2 max-h-[250px] overflow-y-auto pr-1 hide-scrollbar">
              {/* 預設貼紙 */}
              {DEFAULT_STICKERS.map((url, i) => (
                <button key={`def-${i}`} onClick={() => handleAddSticker(url)} className="p-2 bg-white rounded-xl border-2 border-[#E2D6C8] active:scale-95 transition-transform aspect-square flex items-center justify-center">
                  <img src={url} className="w-full h-full object-contain" onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }} />
                </button>
              ))}
              
              {/* 🌟 專屬貼紙簿 (加入半透明刪除按鈕) */}
              {customStickers?.map((url, i) => (
                <div key={`cus-${i}`} className="relative p-2 bg-white rounded-xl border-2 border-[#E2D6C8] active:scale-95 transition-transform aspect-square flex items-center justify-center">
                  <button onClick={() => handleAddSticker(url)} className="w-full h-full">
                    <img src={url} className="w-full h-full object-contain" />
                  </button>
                  {/* 🌟 移到內部 (top-1 left-1)，加入 80% 透明度與毛玻璃 */}
                  <button onClick={(e) => { e.stopPropagation(); removeCustomSticker(url); }} className="absolute top-1 right-1 bg-[#F28482]/80 backdrop-blur-md text-white rounded-full p-1 shadow-sm z-50 active:scale-90">
                    <X size={12} strokeWidth={3} />
                  </button>
                </div>
              ))}

              <label className="p-2 bg-[#A8E0BD] rounded-xl border-2 border-[#4FA76F] flex items-center justify-center cursor-pointer text-[#2F7D57] active:scale-95 transition-transform aspect-square">
                <Plus size={20} strokeWidth={3} />
                <input type="file" accept="image/*" className="hidden" onChange={handleUploadSticker} />
              </label>
            </div>
          </div>
        </>
      )}

      {/* 🌟 左下角貼圖主按鈕 */}
      <button 
        onClick={() => setStickerDrawerOpen(!isStickerDrawerOpen)} 
        className="fixed bottom-28 left-6 w-12 h-12 bg-[#F6C945] rounded-[16px] border-[3px] border-[#E2A622] flex items-center justify-center text-[#5C4A3D] transition-all z-[999] print-hide"
        style={{
          boxShadow: isStickerDrawerOpen ? 'none' : '0 4px 0 #E2A622',
          transform: isStickerDrawerOpen ? 'translateY(4px)' : 'none'
        }}
      >
        <StickerIcon size={24} />
      </button>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-[#FBF7F2] border-[3px] border-[#E2D6C8] z-[999] px-6 py-3 rounded-[24px] shadow-[0_8px_20px_rgba(0,0,0,0.08),_0_6px_0_#E2D6C8] flex justify-between items-center print-hide">
        {[ { icon: <Home size={24} />, label: "首頁", href: "/" }, { icon: <Calendar size={24} />, label: "行程", href: "/plan" }, { icon: <Wallet size={24} />, label: "帳目", href: "/budget" }, { icon: <Wrench size={24} />, label: "工具", href: "/toolbox" } ].map((item) => {
          const isActive = pathname === item.href;
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