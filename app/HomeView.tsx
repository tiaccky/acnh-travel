"use client";
import React, { useState, useEffect } from 'react';
import { useTripStore } from '@/store/useTripStore';
import { Plus, Leaf, Plane, MapPin, Calendar as CalendarIcon, Trophy, Camera, Utensils, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const formatDateDMY = (dateStr: string) => {
  if(!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
};

export default function HomePage() {
  const router = useRouter();
  const { trips, setActiveTrip, addTrip } = useTripStore();
  const[isModalOpen, setIsModalOpen] = useState(false);
  const [newTrip, setNewTrip] = useState({ location: '', startDate: '', endDate: '' });

  // 🌟 移除了所有的 if (!mounted) return null; 強制顯示畫面！
  useEffect(() => { window.scrollTo(0,0); },[]);

  const handleStartDateChange = (val: string) => {
    const start = new Date(val); const end = new Date(start.getTime() + 4 * 86400000); 
    setNewTrip({ ...newTrip, startDate: val, endDate: end.toISOString().split('T')[0] });
  };

  const handleCreate = () => {
    if (!newTrip.location || !newTrip.startDate) return alert("請填寫島嶼名稱與日期喔！");
    addTrip(newTrip); setIsModalOpen(false); setTimeout(() => router.push('/plan'), 100);
  };

  const getTripStats = (trip: any) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const start = new Date(trip.startDate);
    const diffDays = Math.ceil((start.getTime() - today.getTime()) / 86400000);
    let statusText = diffDays > 0 ? `還有 ${diffDays} 天出發！` : diffDays === 0 ? '今天出發！✈️' : '旅程回憶 🌸';

    let foodCount = 0; let photoCount = 0;
    trip.dailyItinerary?.forEach((day: any) => {
      foodCount += day.activities?.filter((a:any) => a.type === 'Food' || a.type === 'Dessert').length || 0;
      photoCount += (day.diary?.photosBig?.length || 0) + (day.diary?.photosSmall?.length || 0);
    });
    return { statusText, diffDays, foodCount, photoCount };
  };

   return (
    <div className="px-6 pt-20 min-h-screen relative z-10 print-hide pb-[calc(8rem+env(safe-area-inset-bottom))] select-none [-webkit-tap-highlight-color:transparent]">
      <header className="mb-8">
        <div className="inline-flex items-center gap-2 bg-[#FFF3D6] border-2 border-[#E2D6C8] px-3 py-1 rounded-full mb-3 shadow-[0_2px_0_#E2D6C8]">
          <Leaf className="text-[#6DBE8A]" size={14} fill="currentColor" />
          <span className="text-[#7A5C3E] font-black text-xs">狸克旅遊服務處</span>
        </div>
        <h1 className="text-3xl font-black text-[#5C4A3D] leading-tight">大寶寶 & 小寶寶<br/><span className="text-[#6DBE8A]">的專屬旅行島</span></h1>
      </header>

      <div className="space-y-5">
        <h3 className="font-black text-[#B7A99A] text-sm ml-2">我們的旅行紀錄</h3>
        {trips.length === 0 && <div className="acnh-card p-8 text-center border-dashed text-[#B7A99A]">還沒有規劃行程，快來申請新島嶼吧！</div>}
        
        {trips.map(trip => {
          const stats = getTripStats(trip);
          return (
            <div key={trip.id} onClick={() => { setActiveTrip(trip.id); router.push('/plan'); }} className="acnh-card p-4 flex flex-col gap-3 cursor-pointer active:scale-95 transition-transform">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#A8E0BD] border-2 border-[#6DBE8A] rounded-[14px] flex items-center justify-center shrink-0"><Plane className="text-[#2F7D57]" size={24} /></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-black text-[#5C4A3D] text-lg leading-tight">{trip.title}</h4>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-md ${stats.diffDays > 0 ? 'bg-[#F6C945] text-[#5C4A3D]' : 'bg-[#EFE7DB] text-[#8A7A6A]'}`}>{stats.statusText}</span>
                  </div>
                  <p className="text-[11px] font-bold text-[#8A7A6A] mt-1">{formatDateDMY(trip.startDate)} — {formatDateDMY(trip.endDate)}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t-2 border-dashed border-[#E2D6C8]">
                <div className="flex items-center gap-1 bg-[#FBF7F2] border border-[#E2D6C8] px-2 py-1 rounded-md shadow-sm"><Trophy size={10} className="text-[#F6C945]"/><span className="text-[9px] font-black text-[#7A5C3E]">島嶼建立</span></div>
                {stats.foodCount > 2 && (<div className="flex items-center gap-1 bg-[#FBF7F2] border border-[#E2D6C8] px-2 py-1 rounded-md shadow-sm"><Utensils size={10} className="text-[#FF8A65]"/><span className="text-[9px] font-black text-[#7A5C3E]">吃貨寶寶 x{stats.foodCount}</span></div>)}
                {stats.photoCount > 0 && (<div className="flex items-center gap-1 bg-[#FBF7F2] border border-[#E2D6C8] px-2 py-1 rounded-md shadow-sm"><Camera size={10} className="text-[#4A90E2]"/><span className="text-[9px] font-black text-[#7A5C3E]">攝影大師 x{stats.photoCount}</span></div>)}
              </div>
            </div>
          )
        })}

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild><button className="w-full acnh-btn-primary py-4 mt-4 text-base flex gap-2"><Plus size={20} strokeWidth={4} /> 規劃新行程</button></DialogTrigger>
          <className="rounded-t-[32px] p-0 bg-[#FBF7F2] w-full bottom-0 top-auto translate-y-0 border-t-[4px] border-x-[4px] border-[#E2D6C8] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] max-h-[85vh] flex flex-col pb-[env(safe-area-inset-bottom)]"
          >
            <DialogHeader className="sr-only">
              <DialogTitle>設定</DialogTitle>
              <DialogDescription>設定目的地</DialogDescription>
            </DialogHeader>
            
            {/* 🌟 UX新增：手機端常見的抽屜拖拽提示線 (Handlebar) */}
            <div className="w-full flex justify-center pt-3 pb-1" aria-hidden="true">
              <div className="w-12 h-1.5 bg-[#E2D6C8] rounded-full"></div>
            </div>

            <div className="p-6 overflow-y-auto pb-40">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-[#5C4A3D] ml-2">出發去哪裡？ ✈️</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-[#EFE7DB] rounded-full text-[#8A7A6A] active:scale-90"><X size={20}/></button>
              </div>
              <div className="space-y-4 pt-2 px-1">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B7A99A]" size={18} />
                  <Input placeholder="輸入目的地 (例如：東京)" value={newTrip.location} onChange={e => setNewTrip({...newTrip, location: e.target.value})} className="rounded-xl bg-white border-2 border-[#E2D6C8] h-14 pl-12 pr-4 text-base font-black focus-visible:ring-0 focus-visible:border-[#6DBE8A] shadow-[0_2px_0_#E2D6C8]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><p className="text-[11px] font-black text-[#8A7A6A] ml-2 flex items-center gap-1"><CalendarIcon size={12}/> 出發日</p><Input type="date" value={newTrip.startDate} onChange={e => handleStartDateChange(e.target.value)} className="rounded-xl bg-white border-2 border-[#E2D6C8] h-12 px-3 text-sm font-bold shadow-[0_2px_0_#E2D6C8] focus-visible:ring-0 focus-visible:border-[#6DBE8A]" /></div>
                  <div className="space-y-1.5"><p className="text-[11px] font-black text-[#8A7A6A] ml-2 flex items-center gap-1"><CalendarIcon size={12}/> 回程日</p><Input type="date" value={newTrip.endDate} onChange={e => setNewTrip({...newTrip, endDate: e.target.value})} className="rounded-xl bg-white border-2 border-[#E2D6C8] h-12 px-3 text-sm font-bold shadow-[0_2px_0_#E2D6C8] focus-visible:ring-0 focus-visible:border-[#6DBE8A]" /></div>
                </div>
                <button onClick={handleCreate} className="w-full acnh-btn-primary h-14 mt-6 text-lg">確認航班！</button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}