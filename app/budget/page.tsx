"use client";
import React, { useState, useEffect } from 'react';
import { useTripStore } from '@/store/useTripStore';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Leaf, PiggyBank, Camera, Utensils, CupSoda, IceCream, ShoppingBag, Ticket, Store, CreditCard, Heart, Bus, Banknote, Trash2, X } from 'lucide-react';

const CAT_INFO: Record<string, { label: string, color: string, icon: any }> = {
  Sightseeing: { label: '景點', color: '#4A90E2', icon: Camera }, Food: { label: '餐廳', color: '#FF8A65', icon: Utensils },
  Drinks: { label: '飲品', color: '#8D6E63', icon: CupSoda }, Dessert: { label: '甜品', color: '#F06292', icon: IceCream },
  Shopping: { label: '購物', color: '#9575CD', icon: ShoppingBag }, Entertainment: { label: '玩樂', color: '#78909C', icon: Ticket },
  CVS: { label: '便利店', color: '#10B981', icon: Store }, Transport: { label: '交通', color: '#4A90E2', icon: Bus }, TopUp: { label: '充值', color: '#F5D372', icon: CreditCard }, Other: { label: '其他', color: '#F2A3B3', icon: Heart }
};

// 🌟 移到這裡，這是一個獨立的元件
const DelayedPie = ({ data }: { data: any[] }) => {
  const [show, setShow] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setShow(true), 150); return () => clearTimeout(timer); }, []);
  if (!show) return <div className="w-full h-[100px] flex items-center justify-center text-[10px] text-[#B7A99A]">載入圖表中...</div>;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart><Pie data={data} innerRadius={25} outerRadius={45} paddingAngle={4} dataKey="value" stroke="none">{data.map((e,i) => <Cell key={i} fill={e.color} />)}</Pie></PieChart>
    </ResponsiveContainer>
  );
};

export default function BudgetPage() {
  const { trips, activeTripId, exchangeRate, addCashExchange, deleteCashExchange } = useTripStore();
  const[activeCat, setActiveCat] = useState<{name: string, val: number} | null>(null);
  const[isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [exchangeForm, setExchangeForm] = useState({ person: 'Big' as 'Big'|'Small'|'Shared', amountHKD: '', amountKRW: '', rate: 0.0058, date: new Date().toISOString().split('T')[0] });

  const trip = trips.find(t => t.id === activeTripId) || trips[0];
  // 🌟 請在 Plan, Budget, Toolbox 這三個檔案裡，把原本的 if (!isMounted) return null 換成這行！
  if (!trip) return <div className="min-h-screen bg-[#F6F1E8] flex items-center justify-center p-10 text-center font-bold text-[#8A7A6A]">尚未建立行程，請先到首頁新增喔！🏝️</div>;

  let bigPaid = 0; let smallPaid = 0; let bigShouldPay = 0; let totalLocal = 0;
  const categoryTotals = { Big: {} as Record<string, { hkd: number, local: number }>, Small: {} as Record<string, { hkd: number, local: number }> };
  
  let bigTotalCash = 0; let smallTotalCash = 0; let sharedTotalCash = 0;
  trip.cashExchanges?.forEach(ex => { 
    if (ex.person === 'Big') bigTotalCash += Number(ex.amountKRW); 
    else if (ex.person === 'Small') smallTotalCash += Number(ex.amountKRW);
    else sharedTotalCash += Number(ex.amountKRW);
  });
  
  let bigSpentCash = 0; let smallSpentCash = 0; let sharedSpentCash = 0;

  trip.dailyItinerary?.forEach(day => {
    day?.activities?.forEach(act => {
      if (!act.cost || act.cost <= 0) return; 

      // 🌟 恢復使用即時抓取的線上匯率 exchangeRate
      const costHKD = act.currency === 'KRW' ? act.cost * exchangeRate : act.cost; 
      const costLocal = act.currency === 'KRW' ? act.cost : 0;
      if (act.currency === 'KRW') totalLocal += act.cost;
      
      if (act.paidBy === 'Shared') {
         bigPaid += costHKD / 2; smallPaid += costHKD / 2;
         if (act.currency === 'KRW' && act.paymentMethod === 'cash') sharedSpentCash += costLocal;
         
         if (!categoryTotals.Big[act.type]) categoryTotals.Big[act.type] = { hkd: 0, local: 0 };
         if (!categoryTotals.Small[act.type]) categoryTotals.Small[act.type] = { hkd: 0, local: 0 };
         categoryTotals.Big[act.type].hkd += costHKD / 2; categoryTotals.Big[act.type].local += costLocal / 2;
         categoryTotals.Small[act.type].hkd += costHKD / 2; categoryTotals.Small[act.type].local += costLocal / 2;
      } else {
         const p = act.paidBy === 'Big' ? 'Big' : 'Small';
         if (p === 'Big') bigPaid += costHKD; else smallPaid += costHKD;
         
         if (act.currency === 'KRW' && act.paymentMethod === 'cash') {
            if (p === 'Big') bigSpentCash += costLocal; else smallSpentCash += costLocal;
         }

         if (!categoryTotals[p][act.type]) categoryTotals[p][act.type] = { hkd: 0, local: 0 };
         categoryTotals[p][act.type].hkd += costHKD; categoryTotals[p][act.type].local += costLocal;

         if (act.isShared) bigShouldPay += costHKD/2; else if (act.paidBy === 'Big') bigShouldPay += costHKD;
      }
    });
  });

  const bigRemainingCash = bigTotalCash - bigSpentCash;
  const smallRemainingCash = smallTotalCash - smallSpentCash;
  const smallOwesBig = bigPaid - bigShouldPay;

  const bigPieData = Object.keys(categoryTotals.Big).length ? Object.entries(categoryTotals.Big).map(([k, v]) => ({ name: k, value: v.local, color: CAT_INFO[k]?.color || '#000' })) :[{ name: '無', value: 1, color: '#E2D6C8' }];
  const smallPieData = Object.keys(categoryTotals.Small).length ? Object.entries(categoryTotals.Small).map(([k, v]) => ({ name: k, value: v.local, color: CAT_INFO[k]?.color || '#000' })) :[{ name: '無', value: 1, color: '#E2D6C8' }];

// 然後在原本放 <ResponsiveContainer> 的地方，直接改用 <DelayedPie data={bigPieData} />

  const handleSaveExchange = () => {
    if (!exchangeForm.amountHKD || !exchangeForm.amountKRW) return;
    const rate = Number(exchangeForm.amountHKD) / Number(exchangeForm.amountKRW);
    addCashExchange(trip.id, { id: Date.now().toString(), person: exchangeForm.person, date: exchangeForm.date, amountHKD: Number(exchangeForm.amountHKD), amountKRW: Number(exchangeForm.amountKRW), rate });
    setIsExchangeModalOpen(false);
  };

  return (
    <div className="min-h-screen px-5 pt-16 pb-32 space-y-6 bg-acnh-bg">
      <header className="flex items-center gap-3 mb-6">
        <div className="bg-[#6DBE8A] p-2.5 rounded-2xl border-[3px] border-[#4FA76F] shadow-[0_4px_0_#4FA76F]">
          <PiggyBank className="text-white" size={24} />
        </div>
        <h1 className="text-2xl font-black text-[#5C4A3D]">小島帳目</h1>
      </header>

      <div className="acnh-card p-5 space-y-4 border-[3px] border-[#E2D6C8]">
         <div className="flex justify-between items-center border-b-2 border-dashed border-[#E2D6C8] pb-2">
           <h3 className="text-sm font-black text-[#5C4A3D] flex items-center gap-2"><Banknote size={16} className="text-green-600"/> 現金小金庫</h3>
           <p className="text-[10px] font-bold text-[#8A7A6A] bg-[#EFE7DB] px-2 py-1 rounded-md">匯率估算: 1 KRW = {exchangeRate.toFixed(4)} HKD</p>
         </div>

         <div className="grid grid-cols-3 gap-2">
           <div className="bg-[#FBF7F2] p-2 rounded-xl border-2 border-[#E2D6C8] text-center">
             <p className="text-[9px] font-black text-[#78BCC4] mb-1">大寶寶</p>
             <p className="text-sm font-black text-[#5C4A3D]">₩ {bigRemainingCash.toLocaleString()}</p>
           </div>
           <div className="bg-[#FBF7F2] p-2 rounded-xl border-2 border-[#E2D6C8] text-center">
             <p className="text-[9px] font-black text-[#F2A3B3] mb-1">小寶寶</p>
             <p className="text-sm font-black text-[#5C4A3D]">₩ {smallRemainingCash.toLocaleString()}</p>
           </div>
           <div className="bg-[#FBF7F2] p-2 rounded-xl border-2 border-[#E2D6C8] text-center">
             <p className="text-[9px] font-black text-[#E2A622] mb-1">公用現金</p>
             <p className="text-sm font-black text-[#5C4A3D]">₩ {(sharedTotalCash - sharedSpentCash).toLocaleString()}</p>
           </div>
         </div>

         {trip.cashExchanges?.length > 0 && (
           <div className="space-y-2 mt-2">
             {trip.cashExchanges.map(ex => (
               <div key={ex.id} className="flex justify-between items-center text-[10px] font-bold text-[#8A7A6A] bg-white p-2 rounded-lg border border-[#E2D6C8]">
                 <div className="flex items-center gap-1.5">
                   <div className={`w-2 h-2 rounded-full ${ex.person === 'Big' ? 'bg-[#78BCC4]' : ex.person === 'Small' ? 'bg-[#F2A3B3]' : 'bg-[#F6C945]'}`} />
                   <span>{ex.date}</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <span className="text-[#5C4A3D] font-black">₩ {ex.amountKRW.toLocaleString()} (HK$ {ex.amountHKD})</span>
                   <button onClick={() => deleteCashExchange(trip.id, ex.id)}><Trash2 size={11} className="text-[#B7A99A] hover:text-[#F28482]"/></button>
                 </div>
               </div>
             ))}
           </div>
         )}
         
         <button onClick={() => setIsExchangeModalOpen(true)} className="w-full py-2 bg-white border-2 border-dashed border-[#E2D6C8] rounded-xl text-xs font-black text-[#8A7A6A] active:bg-[#EFE7DB]">
           + 新增換匯紀錄
         </button>
      </div>

      <div className="bg-[#FFF3D6] rounded-[24px] p-6 text-[#5C4A3D] shadow-[0_8px_0_#E2D6C8] border-[4px] border-[#E2D6C8] relative overflow-hidden">
        <Leaf className="absolute -right-4 -top-4 text-[#E2A622] opacity-10 rotate-45" size={100} />
        <div className="relative z-10">
          {/* 🌟 刪除 (當地貨幣) 文字 */}
          <p className="text-[10px] font-black opacity-80 uppercase tracking-widest mb-1">總計消費</p>
          
          {/* 🌟 將當地貨幣與 HKD 並排顯示 */}
          <div className="flex items-end gap-3 mb-2">
            <h2 className="text-4xl font-black text-[#E2A622] leading-none"><span className="text-xl mr-1">₩</span>{totalLocal.toLocaleString()}</h2>
            <p className="text-xs font-bold opacity-80 bg-white/60 px-2 py-1 rounded-lg border border-[#E2D6C8] mb-1">約 HK$ {(bigPaid + smallPaid).toFixed(0)}</p>
          </div>
          <div className="bg-[#FBF7F2] rounded-[16px] p-3 border-[3px] border-[#E2D6C8] text-center shadow-inner flex flex-col items-center">
            {smallOwesBig > 0 ? (
              <p className="text-[13px] font-black text-[#7A5C3E]"><span className="text-[#F2A3B3]">小寶寶</span> 應給 <span className="text-[#78BCC4]">大寶寶</span> HK${Math.abs(smallOwesBig).toFixed(0)}</p>
            ) : smallOwesBig < 0 ? (
              <p className="text-[13px] font-black text-[#7A5C3E]"><span className="text-[#78BCC4]">大寶寶</span> 應給 <span className="text-[#F2A3B3]">小寶寶</span> HK${Math.abs(smallOwesBig).toFixed(0)}</p>
            ) : (
              <p className="text-[13px] font-black text-[#6DBE8A]">目前完全平分喔！</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="acnh-card p-3 flex flex-col items-center">
          <h3 className="text-xs font-black text-[#78BCC4] mb-2 bg-[#78BCC4]/20 px-3 py-1 rounded-full">大寶寶</h3>
          <p className="text-[10px] font-black text-[#8A7A6A] mb-4">HK$ {bigPaid.toFixed(0)}</p>
          <div className="w-full h-[100px] mb-6 cursor-pointer">
            <DelayedPie data={bigPieData} />
          </div>
          
          <div className="w-full space-y-1.5 border-t-2 border-dashed border-[#E2D6C8] pt-3">
            {Object.entries(categoryTotals.Big).map(([type, val]) => {
              const info = CAT_INFO[type] || CAT_INFO['Other'];
              return (
                <div key={type} className="flex justify-between items-center bg-[#F6F1E8] px-1.5 py-2 rounded-lg border-2 border-transparent active:border-[#E2D6C8]" onClick={() => setActiveCat({name: type, val: val.local})}>
                  <div className="flex items-center gap-1 text-[11px] font-black text-[#5C4A3D] whitespace-nowrap"><info.icon size={12} style={{ color: info.color }} /> {info.label}</div>
                  <span className="text-[11px] font-black text-[#5C4A3D] whitespace-nowrap ml-1">₩ {val.local.toLocaleString()}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="acnh-card p-3 flex flex-col items-center">
          <h3 className="text-xs font-black text-[#F2A3B3] mb-2 bg-[#F2A3B3]/20 px-3 py-1 rounded-full">小寶寶</h3>
          <p className="text-[10px] font-black text-[#8A7A6A] mb-4">HK$ {smallPaid.toFixed(0)}</p>
          <div className="w-full h-[100px] mb-6 cursor-pointer">
            <DelayedPie data={smallPieData} />
          </div>
          
          <div className="w-full space-y-1.5 border-t-2 border-dashed border-[#E2D6C8] pt-3">
            {Object.entries(categoryTotals.Small).map(([type, val]) => {
              const info = CAT_INFO[type] || CAT_INFO['Other'];
              return (
                <div key={type} className="flex justify-between items-center bg-[#F6F1E8] px-1.5 py-2 rounded-lg border-2 border-transparent active:border-[#E2D6C8]" onClick={() => setActiveCat({name: type, val: val.local})}>
                  <div className="flex items-center gap-1 text-[11px] font-black text-[#5C4A3D] whitespace-nowrap"><info.icon size={12} style={{ color: info.color }} /> {info.label}</div>
                  <span className="text-[11px] font-black text-[#5C4A3D] whitespace-nowrap ml-1">₩ {val.local.toLocaleString()}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {activeCat && activeCat.name !== '無' && (
        <div onClick={() => setActiveCat(null)} className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#5C4A3D] text-white px-6 py-3 rounded-full shadow-2xl font-black text-[12px] animate-in fade-in slide-in-from-bottom-5 z-[999] flex items-center gap-2 whitespace-nowrap cursor-pointer">
          <span>{CAT_INFO[activeCat.name]?.label || activeCat.name}</span>
          <span className="text-[#F6C945]">₩ {activeCat.val.toLocaleString()}</span>
        </div>
      )}

      {/* 🌟 加入 z-[9999] 保證蓋過導航列 */}
      <Dialog open={isExchangeModalOpen} onOpenChange={setIsExchangeModalOpen}>
        <DialogContent showCloseButton={false} className="rounded-t-[32px] p-0 bg-[#FBF7F2] w-full bottom-0 top-auto translate-y-0 border-t-[4px] border-x-[4px] border-[#E2D6C8] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] max-h-[90vh] flex flex-col z-[9999] pb-safe print-hide">
          
          <div className="flex-1 overflow-visible p-6 pb-32"> 
            <DialogHeader className="sr-only"><DialogTitle>換匯</DialogTitle><DialogDescription>輸入現金</DialogDescription></DialogHeader>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-[#5C4A3D]">新增現金換匯 💱</h3>
              <button onClick={() => setIsExchangeModalOpen(false)} className="p-2 bg-[#EFE7DB] rounded-full text-[#8A7A6A] active:scale-90"><X size={20}/></button>
            </div>
            
            <div className="space-y-4 px-1">
              <div className="flex gap-1 bg-[#EFE7DB] p-1.5 rounded-[16px] border-2 border-[#E2D6C8]">
               <button onClick={() => setExchangeForm({...exchangeForm, person: 'Big'})} className={`flex-1 py-2.5 rounded-[12px] text-[11px] font-black transition-all ${exchangeForm.person === 'Big' ? 'bg-[#78BCC4] text-white shadow-sm' : 'text-[#8A7A6A]'}`}>大寶寶</button>
               <button onClick={() => setExchangeForm({...exchangeForm, person: 'Small'})} className={`flex-1 py-2.5 rounded-[12px] text-[11px] font-black transition-all ${exchangeForm.person === 'Small' ? 'bg-[#F2A3B3] text-white shadow-sm' : 'text-[#8A7A6A]'}`}>小寶寶</button>
               <button onClick={() => setExchangeForm({...exchangeForm, person: 'Shared'})} className={`flex-1 py-2.5 rounded-[12px] text-[11px] font-black transition-all ${exchangeForm.person === 'Shared' ? 'bg-[#F6C945] text-[#5C4A3D] shadow-sm' : 'text-[#8A7A6A]'}`}>公用錢包</button>
             </div>
              
              <Input type="date" value={exchangeForm.date} onChange={e => setExchangeForm({...exchangeForm, date: e.target.value})} className="rounded-xl bg-white border-2 border-[#E2D6C8] h-14 px-4 text-base font-black shadow-[0_2px_0_#E2D6C8]" />
              
              <div className="bg-white border-2 border-[#E2D6C8] rounded-[16px] p-2 pl-3 flex items-center gap-2 shadow-[0_2px_0_#E2D6C8] h-14">
                 <span className="text-[10px] font-black text-[#8A7A6A]">匯率 1 KRW =</span>
                 <Input type="number" placeholder="例如 0.0053" value={exchangeForm.rate || ''} onChange={e => { const r = e.target.value; setExchangeForm(prev => ({...prev, rate: r as any, amountKRW: prev.amountHKD ? (Number(prev.amountHKD) / Number(r)).toFixed(0) : prev.amountKRW }))}} className="bg-transparent border-none text-xs font-black flex-1 focus-visible:ring-0 px-1" />
              </div>
              
              <div className="flex gap-2">
                <div className="bg-white border-2 border-[#E2D6C8] rounded-[16px] p-2 pl-3 flex-1 flex flex-col justify-center shadow-[0_2px_0_#E2D6C8] h-16">
                   <span className="text-[9px] font-black text-[#B7A99A]">支付 HKD</span>
                   <Input type="number" placeholder="輸入港幣" value={exchangeForm.amountHKD} onChange={e => { const hkd = e.target.value; setExchangeForm(prev => ({...prev, amountHKD: hkd, amountKRW: prev.rate ? (Number(hkd) / Number(prev.rate)).toFixed(0) : prev.amountKRW }))}} className="bg-transparent border-none text-sm font-black w-full focus-visible:ring-0 p-0 h-6" />
                </div>
                <div className="bg-white border-2 border-[#E2D6C8] rounded-[16px] p-2 pl-3 flex-1 flex flex-col justify-center shadow-[0_2px_0_#E2D6C8] h-16">
                   <span className="text-[9px] font-black text-[#B7A99A]">換得 KRW</span>
                   <Input type="number" placeholder="輸入韓幣" value={exchangeForm.amountKRW} onChange={e => setExchangeForm({...exchangeForm, amountKRW: e.target.value})} className="bg-transparent border-none text-sm font-black w-full focus-visible:ring-0 p-0 h-6 text-[#E2A622]" />
                </div>
              </div>
            </div>
          </div>
          
          {/* 🌟 底部固定儲存按鈕，保證不被遮擋 */}
          <div className="p-5 pt-2 bg-[#FBF7F2] shrink-0 border-t-2 border-[#E2D6C8] rounded-b-[32px]">
            <button onClick={handleSaveExchange} className="w-full bg-[#6DBE8A] text-white border-[3px] border-[#4FA76F] shadow-[0_4px_0_#4FA76F] rounded-full h-14 font-black text-lg active:translate-y-1 active:shadow-none transition-all">
              儲存紀錄
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}