"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Camera, Utensils, CupSoda, IceCream, ShoppingBag, Ticket, Pencil, PenTool, Heart, X, Store, CreditCard, Navigation, Smile, PartyPopper, HeartHandshake, Sun, Cloud, CloudRain, Image as ImageIcon, Copy, Sparkles, Search, Wind, Banknote, Star, Leaf, Printer, Map, Bus, CloudSun } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTripStore, Activity } from '@/store/useTripStore';
import { motion, AnimatePresence } from 'framer-motion';

const smartTranslate = (name: string) => { const dict: Record<string, string> = { "甘川洞文化村": "감천문화마을", "Diart Coffee": "디아트커피", "釜山塔": "부산타워", "海雲台": "해운대", "味贊王": "맛찬들" }; return dict[name] || name; };

const NaverLogo = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M16.2 3H21v18h-4.8l-7.2-10.2V21H4V3h4.8l7.2 10.2V3z" fill="#03C75A"/></svg>;
const GoogleLogo = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#4285F4"/></svg>;
const DAY_THEMES =[ { bg: '#F2A3B3', border: '#D68192', text: '#5C4A3D' }, { bg: '#78BCC4', border: '#5A9BA3', text: '#FFFFFF' }, { bg: '#F6C945', border: '#E2A622', text: '#5C4A3D' }, { bg: '#6DBE8A', border: '#4FA76F', text: '#FFFFFF' }, { bg: '#9575CD', border: '#7E57C2', text: '#FFFFFF' }, { bg: '#FF8A65', border: '#E06B4A', text: '#FFFFFF' } ];
const CATEGORIES_PLAN =[
  { id: 'Sightseeing', label: '景點', icon: Camera, color: '#4A90E2', bg: 'rgba(74,144,226,0.1)' },
  { id: 'Food', label: '餐廳', icon: Utensils, color: '#FF8A65', bg: 'rgba(255,138,101,0.1)', imgs:['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEieX7WGvx2HYArIP6X_pqvQMH5z3Dn-MTiIeLhRnNxzPB5YCxPBBpws3lpgdSzd-e-6lQZnXvkhSn6x8OolkkvqAts-w0u6ffmrbwdg5wmb-k73SIGfqesifFQpz2wQfnYAgQXg3U1wMwUc/s400/hamburger_blt_burger.png', 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjLXr6AatvlqR6pDvLR5FL1v_5fgnq7yC7iM4ujCyFcNrgB7OcfuyzVDTqK1xvdC_dVsgKLo0GWSjtkEJSJ_v7ZluKkzPgJ4U7oSg77B-JXmx6ycpsPjFMwXUI_MKWVG0YZROCeOec4UTiS/s400/beer_glass.png'], koreaImg: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEidnnjss_sclSe9feHHjVuG-9C15x3C9ooqVtTDYw_PoVG9wdMkViUiZRIhg-j5v3EDQMkWUTz8wC6Nn3H2uoO03o2YgmQfXip9VTTowhZcePA11JA5jGeyC0LxZOYCq3i9aixwzNe9Z94/s400/food_kimuchi.png' },
  { id: 'Drinks', label: '飲品', icon: CupSoda, color: '#8D6E63', bg: 'rgba(141,110,99,0.1)', imgs:['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgtuQ7KsCeJSkP2Ez0wDAhF-zVyBtmi6ThBXmG1vAW_Kqvwg-OcqtdaV7aTJJF76EWK5SiAh-DUagw2qar_tuXIbVSeL2qYV6RUq67BRmvD3TQkE-WM1IRS3eubWBPQKtNP4EuneqQy71ji/s200/drink_coffee_cup03_espresso_lungo.png'] },
  { id: 'Dessert', label: '甜品', icon: IceCream, color: '#F06292', bg: 'rgba(240,98,146,0.1)', imgs:['https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhlUOiu1so-uBH7uwb-uhVsoyZnP5_56p71qDo2V9D0xaBYB9jDzhDfKldvzvsInbUP-vPD-Vr80jI8iVQdPsBr-oopjUg9CyR1KujN2JE9Dv4jDjJ8TNs3HvRyy-gqDLIylc9Zkuicm-Y/s400/sweets_fruit_pafe.png'] },
  { id: 'Shopping', label: '購物', icon: ShoppingBag, color: '#9575CD', bg: 'rgba(149,117,205,0.1)' },
  { id: 'Entertainment', label: '玩樂', icon: Ticket, color: '#78909C', bg: 'rgba(120,144,156,0.1)' },
];
const CATEGORIES_EXPENSE =[{ id: 'CVS', label: '便利店', icon: Store, color: '#10B981' }, { id: 'Transport', label: '交通', icon: Bus, color: '#4A90E2' }, { id: 'TopUp', label: '充值', icon: CreditCard, color: '#F5D372' }, { id: 'Shopping', label: '購物', icon: ShoppingBag, color: '#9575CD' }, { id: 'Food', label: '食物', icon: Utensils, color: '#FF8A65' }, { id: 'Other', label: '其他', icon: Heart, color: '#F2A3B3' }];
const MOOD_LIST =[{ id: 'happy', icon: Smile }, { id: 'loved', icon: Heart }, { id: 'excited', icon: Star }, { id: 'calm', icon: Leaf }];

// 🌟 專屬情侶日記提示題庫
const DIARY_PROMPTS = [
  "今天有什麼難忘回憶？💭", "今天最喜歡的是⋯？✨", "感恩有你一起創造回憶，寫下兩句感想吧！📝",
  "今天哪個瞬間讓你最心動？💖", "最爆笑的突發狀況是什麼？😂", "如果給今天打個分數，你想說什麼？🌟",
  "今天吃到最好吃的東西是⋯？😋", "走累了嗎？留句話給明天的我們吧！👣"
];
const getPrompt = (idx: number, person: 'Big'|'Small') => DIARY_PROMPTS[(idx + (person === 'Big' ? 0 : 1)) % DIARY_PROMPTS.length];

const timeToMin = (t: string) => {
  if (!t || t === '--:--') return 9999;
  try {
    let cleanTime = t.replace(/上午|下午/g, '').trim(); const parts = cleanTime.split(':');
    if (parts.length >= 2) {
      let h = parseInt(parts[0], 10); const m = parseInt(parts[1], 10);
      if (isNaN(h) || isNaN(m)) return 9999;
      if (t.includes('下午') && h < 12) h += 12; if (t.includes('上午') && h === 12) h = 0;
      return h * 60 + m;
    }
  } catch (e) { return 9999; } return 9999;
};

const compressImage = async (file: File): Promise<string> => {
  let fileToProcess = file;
  if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
    try { const heic2any = (await import('heic2any')).default; const convertedBlob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.8 }); fileToProcess = new File([convertedBlob as Blob], "photo.jpg", { type: "image/jpeg" }); } catch (e) {}
  }
  return new Promise((resolve) => {
    const reader = new FileReader(); reader.readAsDataURL(fileToProcess);
    reader.onload = (event) => {
      const img = new Image(); img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200; const MAX_HEIGHT = 1200; let width = img.width; let height = img.height;
        if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } } else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
        canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height); resolve(canvas.toDataURL('image/jpeg', 0.7)); 
      };
    };
  });
};

const HeartRating = ({ score }: { score: number }) => (
  <div className="flex gap-0.5 shrink-0 bg-[#EFE7DB] px-1.5 py-0.5 rounded-full border border-[#E2D6C8] shadow-inner ml-1">
    {[1, 2, 3, 4, 5].map(v => (
      <div key={v} className="relative w-2.5 h-2.5 mx-[0.5px]">
        <Heart size={10} className="text-[#E2D6C8]" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: score >= v ? '100%' : score >= v - 0.5 ? '50%' : '0%' }}><Heart size={10} className="text-[#F28482] fill-[#F28482]" /></div>
      </div>
    ))}
  </div>
);

export default function PlanPage() {
  
  const [isMounted, setIsMounted] = useState(false);
  const { trips, activeTripId, addActivity, updateActivity, deleteActivity, updateDiary, activeDayIndex, setActiveDayIndex, exchangeRate, fetchExchangeRate } = useTripStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'PLAN' | 'EXPENSE'>('PLAN');
  const [editingAct, setEditingAct] = useState<Activity | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [isFabOpen, setIsFabOpen] = useState(false); // 🌟 新增 FAB 選單狀態

  const [timeState, setTimeState] = useState({ period: '上午', hour: '10', minute: '00' });
  const [formData, setFormData] = useState<{location:string, cost:string, type:string, currency:string, paidBy:'Big'|'Small'|'Shared', isShared:boolean, paymentMethod?:'cash'|'card'|null, note?:string}>({ location: '', cost: '', type: 'Sightseeing', currency: 'KRW', paidBy: 'Big', isShared: true, paymentMethod: null, note: '' });
  useEffect(() => { setIsMounted(true); window.scrollTo(0,0); fetchExchangeRate(); },[]);

// 🌟 加上防呆畫面，如果連一個行程都沒有，提示去首頁建立
if (!trip) {
  return (
    <div className="min-h-screen bg-[#F6F1E8] flex flex-col items-center justify-center p-10 text-center gap-4">
      <div className="text-4xl">🏝️</div>
      <h2 className="text-xl font-black text-[#5C4A3D]">尚未建立行程</h2>
      <p className="text-sm font-bold text-[#8A7A6A]">請先到首頁申請一個新的旅行島嶼喔！</p>
    </div>
  );
}

  const currentDay = trip?.dailyItinerary?.[activeDayIndex];
  const isKorea = trip?.location?.includes("釜山") || trip?.location?.includes("韓國");
  // 🌟 行程頁的 HKD 估算也套用相同的邏輯
  const getPreviewRate = () => {
    if (formData.paymentMethod === 'cash' && formData.paidBy) {
      const personExchanges = trip.cashExchanges?.filter(ex => ex.person === formData.paidBy);
      if (personExchanges && personExchanges.length > 0) return personExchanges[personExchanges.length - 1].rate;
    }
    return exchangeRate; 
  };
  const hkdPreview = formData.cost ? (Number(formData.cost) * (formData.currency === 'KRW' ? getPreviewRate() : 1)).toFixed(0) : '0';

  const currentTheme = DAY_THEMES[activeDayIndex % DAY_THEMES.length];
  const itineraryActivities = (currentDay?.activities?.filter(a => a.time !== '--:--') ||[]).sort((a,b) => timeToMin(a.time) - timeToMin(b.time));
  const expenseActivities = currentDay?.activities?.filter(a => a.time === '--:--') ||[];

  const openNewModal = (mode: 'PLAN' | 'EXPENSE') => {
    setModalMode(mode); setEditingAct(null);
    setFormData({ location: '', cost: '', type: mode === 'PLAN' ? 'Sightseeing' : 'Food', currency: 'KRW', paidBy: 'Big', isShared: true, paymentMethod: null, note: '' });
    setTimeState({ period: '上午', hour: '10', minute: '00' }); setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.location) return;
    const timeStr = modalMode === 'PLAN' ? `${timeState.period} ${timeState.hour}:${timeState.minute}` : '--:--';
    const uniqueId = editingAct?.id || (Date.now().toString() + Math.random().toString(36).substring(2, 9));
    const actData = { ...formData, id: uniqueId, time: timeStr, cost: Number(formData.cost) || 0, costHKD: Number(hkdPreview), ratingBig: editingAct?.ratingBig || 0, ratingSmall: editingAct?.ratingSmall || 0 } as Activity;
    editingAct ? updateActivity(trip.id, activeDayIndex, actData) : addActivity(trip.id, activeDayIndex, actData);
    setIsModalOpen(false);
  };

  const handleCopy = (text: string, e: React.MouseEvent) => { e.stopPropagation(); navigator.clipboard.writeText(text); alert(`已複製：${text}`); };

  const handleImageUpload = async (person: 'Big'|'Small', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(file) {
      const compressedBase64 = await compressImage(file);
      const existingPhotos = currentDay?.diary?.[`photos${person}`] ||[];
      updateDiary(trip.id, activeDayIndex, { [`photos${person}`]: [...existingPhotos, compressedBase64] });
    }
  };

  const CardFallingEffect = ({ type }: { type: string }) => {
    const cat = CATEGORIES_PLAN.find(c => c.id === type); if (!cat || !cat.imgs) return null;
    let activeImgs = [...cat.imgs]; if (isKorea && cat.koreaImg) activeImgs.push(cat.koreaImg);
    const[isVisible, setIsVisible] = useState(true);
    useEffect(() => { const timer = setTimeout(() => setIsVisible(false), 8000); return () => clearTimeout(timer); },[]);
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div exit={{ opacity: 0, transition: { duration: 1.5 } }} className="absolute inset-0 w-full h-[200px] pointer-events-none overflow-hidden rounded-[16px] z-20">
            {[...Array(12)].map((_, i) => (
              <motion.img key={i} src={activeImgs[i % activeImgs.length]} className="absolute w-5 h-5 opacity-70 drop-shadow-sm" style={{ left: `${(i * 37 + 13) % 85}%` }} initial={{ y: -30, rotate: 0 }} animate={{ y: 180, rotate: 360 }} transition={{ duration: 2.5+(i%3), repeat: Infinity, delay: (i%5)*0.3, ease: "linear" }} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="flex flex-col min-h-screen text-base bg-acnh-bg">
      <div className="print-hide">
        <header className="sticky top-0 z-[50] bg-[#FBF7F2]/95 backdrop-blur-md border-b-[3px] border-[#E2D6C8] pt-4 pb-2 px-4 shadow-sm">
          <div className="flex justify-between items-center mb-2 px-1">
            <div className="flex items-center gap-2">
              <Sparkles className="text-[#E2A622]" size={20} />
              <h1 className="text-xl font-black text-[#5C4A3D]">{trip?.title}</h1>
              <Sparkles className="text-[#E2A622]" size={20} />
            </div>
            <div className="flex gap-2 print-hide">
               <button onClick={() => window.open(isKorea ? 'https://weather.naver.com/today/08110580' : `https://www.google.com/search?q=${encodeURIComponent(trip?.location || '')}+weather`, '_blank')} className="p-2 bg-[#EFE7DB] rounded-full text-[#8A7A6A] hover:bg-[#E2D6C8] transition-colors active:scale-95 shadow-sm">
                 <CloudSun size={18} />
               </button>
               <button onClick={() => window.print()} className="p-2 bg-[#EFE7DB] rounded-full text-[#8A7A6A] hover:bg-[#E2D6C8] transition-colors active:scale-95 shadow-sm">
                 <Printer size={18} />
               </button>
            </div>
          </div>
          <div className="flex overflow-x-auto gap-3 pb-3 pt-1 px-1 hide-scrollbar items-end">
            {trip?.dailyItinerary?.map((day, idx) => {
              const isActive = activeDayIndex === idx; const theme = DAY_THEMES[idx % DAY_THEMES.length];
              return (
                <button key={idx} onClick={() => { setActiveDayIndex(idx); window.scrollTo({top:0}); }} className={`shrink-0 w-14 h-14 rounded-[14px] flex flex-col items-center justify-center transition-all border-[3px]`}
                  style={{ backgroundColor: isActive ? theme.bg : '#FFFFFF', borderColor: isActive ? theme.border : '#E2D6C8', color: isActive ? theme.text : '#8A7A6A', boxShadow: isActive ? `0 4px 0 ${theme.border}` : `0 2px 0 #E2D6C8`, transform: isActive ? 'translateY(-4px)' : 'none' }}>
                  <span className="text-[10px] font-bold opacity-80 leading-tight">D{day.day}</span>
                  <span className="text-sm font-black">{new Date(new Date(trip.startDate).getTime() + idx * 86400000).getDate()}/{new Date(new Date(trip.startDate).getTime() + idx * 86400000).getMonth() + 1}</span>
                </button>
              )
            })}
          </div>
        </header>

        <main className="flex-1 px-4 py-4 space-y-4 pb-32">
              {/* 🌟 升級為手帳式 (Timeline) 排版，消除卡片空隙 */}
        <section className="w-full">
          <div className="bg-white border-[3px] border-[#E2D6C8] shadow-[0_4px_0_#E2D6C8] rounded-[24px] flex flex-col relative print-hide">
            {itineraryActivities.length === 0 && (
              <div className="p-8 text-center text-[#B7A99A] font-black text-sm">還沒有行程喔，快來新增吧！📝</div>
            )}
            
            {itineraryActivities.map((act, idx, arr) => {
              const cat = CATEGORIES_PLAN.find(c => c.id === act.type) || CATEGORIES_PLAN[0];
              const hasBothRated = act.ratingBig > 0 && act.ratingSmall > 0;
              const nextAct = arr[idx+1];
              
              return (
                <div key={act.id + idx} className="relative">
                  {/* 🌟 單個行程項目 */}
                  <div 
                    className={`p-3 relative z-10 transition-colors active:bg-[#FBF7F2] ${idx !== arr.length - 1 ? 'border-b-2 border-dashed border-[#E2D6C8]/50' : ''}`}
                    onClick={() => { if(act.type.match(/Food|Drinks|Dessert/)) { setAnimatingId(act.id); setTimeout(()=>setAnimatingId(null), 8000); } }}
                  >
                    {animatingId === act.id && <CardFallingEffect type={act.type} />}

                    <div className="flex gap-2.5 items-start">
                      {/* 圖示 */}
                      <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 border-2 border-white/50 shadow-inner mt-0.5" style={{ backgroundColor: cat.bg }}>
                        <cat.icon size={18} style={{ color: cat.color }} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* 🌟 第一層：時間與編輯刪除按鈕 */}
                        <div className="flex justify-between items-center mb-1">
                          {/* 🌟 時間底色變淺：加入 40 (約25%透明度)，文字改用深色邊框色 */}
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm border" style={{ backgroundColor: `${currentTheme.bg}40`, color: currentTheme.border, borderColor: `${currentTheme.border}40` }}>{act.time}</span>
                          <div className="flex gap-1.5 shrink-0 print-hide">
                            <button onClick={(e) => { e.stopPropagation(); setModalMode('PLAN'); setEditingAct(act); setFormData({...act, cost: act.cost.toString(), isShared: act.isShared??true, type: act.type, paymentMethod: act.paymentMethod||null, note: act.note||''}); try { let clean = act.time.replace(/上午|下午/g, '').trim(); let parts = clean.split(':'); if (parts.length >= 2) { setTimeState({ period: act.time.includes('下午') ? '下午' : '上午', hour: parseInt(parts[0]).toString(), minute: parts[1] }); } } catch(e){} setIsModalOpen(true); }}><Pencil size={11} className="text-[#B7A99A] hover:text-[#5C4A3D]"/></button>
                            <button onClick={(e) => { e.stopPropagation(); deleteActivity(trip.id, activeDayIndex, act.id); }}><Trash2 size={11} className="text-[#B7A99A] hover:text-[#F28482]"/></button>
                          </div>
                        </div>

                        {/* 🌟 第二層：景點名稱與地圖/複製按鈕 */}
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h4 className="font-black text-[#5C4A3D] text-sm leading-tight flex-1 break-words pt-0.5">{act.location}</h4>
                          <div className="flex items-center gap-1 shrink-0 print-hide">
                            {/* 🌟 統一按鈕大小與樣式：p-1 */}
                            <button onClick={(e) => { e.stopPropagation(); window.open(isKorea ? `https://map.naver.com/v5/search/${encodeURIComponent(smartTranslate(act.location))}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.location)}`, '_blank'); }} className="p-1 bg-[#F6F1E8] rounded border border-[#E2D6C8] shadow-sm flex items-center justify-center z-30 active:scale-95">{isKorea ? <NaverLogo /> : <GoogleLogo />}</button>
                            <button onClick={(e) => handleCopy(smartTranslate(act.location), e)} className="p-1 bg-[#FFF3D6] rounded border border-[#E2D6C8] shadow-sm flex items-center justify-center z-30 active:scale-95"><Copy size={12} className="text-[#E2A622]"/></button>
                          </div>
                        </div>

                        {/* 🌟 第三層：獨立的備註欄位 (如果有填寫才顯示，自動換行且不會影響其他按鈕) */}
                        {act.note && (
                          <div className="mb-2.5">
                            <span className="text-[10px] font-bold text-[#8A7A6A] bg-[#FBF7F2] px-2 py-1 rounded-lg border border-[#E2D6C8]/60 inline-block w-full break-words leading-relaxed shadow-inner">
                              {act.note}
                            </span>
                          </div>
                        )}
                        
                        {/* 🌟 第四層：評分區塊 (加上 flex-wrap 允許彈性換行) */}
                        <div className="pt-2 border-t-2 border-dashed border-[#E2D6C8] flex flex-wrap items-center justify-between gap-1.5 relative z-30 print-hide">
                           <div className="flex gap-0.5 shrink-0 items-center">
                             <span className="text-[9px] font-black text-[#78BCC4]">大</span>
                             {[1,2,3,4,5].map(v => <button key={v} onClick={(e) => { e.stopPropagation(); updateActivity(trip.id, activeDayIndex, {...act, ratingBig: v}); }}><Heart size={11} className={act.ratingBig >= v ? "text-[#78BCC4] fill-[#78BCC4]" : "text-[#E2D6C8]"}/></button>)}
                             <div className="w-[1.5px] h-3 bg-[#E2D6C8] mx-1.5 rounded-full" />
                             <span className="text-[9px] font-black text-[#F2A3B3]">小</span>
                             {[1,2,3,4,5].map(v => <button key={v} onClick={(e) => { e.stopPropagation(); updateActivity(trip.id, activeDayIndex, {...act, ratingSmall: v}); }}><Heart size={11} className={act.ratingSmall >= v ? "text-[#F2A3B3] fill-[#F2A3B3]" : "text-[#E2D6C8]"}/></button>)}
                           </div>
                           {hasBothRated && <HeartRating score={(act.ratingBig + act.ratingSmall) * 0.5} />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

          <section className="bg-[#FFF3D6] rounded-[24px] p-4 border-[3px] border-[#E2D6C8] shadow-inner space-y-3 mt-4">
             <div className="flex items-center gap-2 text-[#7A5C3E] font-black text-base"><Store size={18} /> 今日花費</div>
             {expenseActivities.map(act => {
               const cat = CATEGORIES_EXPENSE.find(c => c.id === act.type) || CATEGORIES_EXPENSE[4];
               const isBig = act.paidBy === 'Big';
               
               return (
                 <div key={act.id} className="flex justify-between items-center bg-white p-3 rounded-[12px] border-2 border-[#E2D6C8] shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-[#EFE7DB] rounded-lg relative"><cat.icon size={14} style={{color: cat.color}} /></div>
                      <span className="text-sm font-bold text-[#5C4A3D] leading-none">{act.location}</span>
                    </div>
                    <div className="text-right flex items-center gap-2">
                       <div className="flex items-center gap-1.5 mr-1">
                        {act.paymentMethod === 'cash' && <Banknote size={14} className="text-green-600" />}
                        {act.paymentMethod === 'card' && <CreditCard size={14} className="text-blue-600" />}
                        {/* 🌟 根據付款人顯示專屬顏色：大寶寶(藍)、小寶寶(粉)、公用(橙) */}
                        <div className={`w-2.5 h-2.5 rounded-full shadow-inner ${act.paidBy === 'Big' ? 'bg-[#78BCC4]' : act.paidBy === 'Small' ? 'bg-[#F2A3B3]' : act.paidBy === 'Shared' ? 'bg-[#F6C945]' : '' }`}/>
                        {act.isShared && <span className="text-[8px] font-black px-1.5 py-[2px] rounded-md bg-[#F6C945] text-[#5C4A3D] leading-none">平分</span>}
                     </div>
                       <p className="text-[13px] font-black text-[#5C4A3D] leading-none">{act.currency === 'KRW' ? '₩' : '$'}{act.cost.toLocaleString()}</p>
                       <button onClick={() => { setModalMode('EXPENSE'); setEditingAct(act); setFormData({...act, cost: act.cost.toString(), type: act.type, paymentMethod: act.paymentMethod ?? null,}); setIsModalOpen(true); }} className="p-1.5 bg-[#F6F1E8] rounded-md active:bg-[#E2D6C8] ml-1"><Pencil size={12} className="text-[#8A7A6A]" /></button>
                    </div>
                 </div>
               )
             })}
          </section>

          <section className="bg-[#FBF7F2] rounded-[24px] p-4 border-[3px] border-[#E2D6C8] shadow-[0_4px_0_#E2D6C8] space-y-4">
            {/* 🌟 3. 換成 PenTool 圖示 */}
            <div className="flex items-center gap-2 text-[#7A5C3E] font-black text-base"><PenTool size={18} /> 交換日記</div>
            {['Big', 'Small'].map((person) => {
              const isBig = person === 'Big'; const pColor = isBig ? '#78BCC4' : '#F2A3B3';
              const diaryData = currentDay?.diary || {}; const photos = diaryData[`photos${person}`] ||[];

              return (
                <div key={person} className="bg-white p-3 rounded-[16px] border-2 border-[#E2D6C8] shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-base" style={{ color: pColor }}>{isBig ? '大寶寶' : '小寶寶'}的日記</span>
                    <div className="flex gap-1">
                      {/* 🌟 替換為這段：判斷如果已經選中，再次點擊就設為 null 取消 */}
                      {MOOD_LIST.map(m => {
                        const isSelected = diaryData[`mood${person}`] === m.id;
                        return (
                          <button key={m.id} onClick={() => updateDiary(trip.id, activeDayIndex, { [`mood${person}`]: isSelected ? null : m.id })} className={`p-1.5 rounded-full ${isSelected ? 'bg-[#EFE7DB] scale-110 shadow-inner' : 'grayscale opacity-40'}`}>
                            <m.icon size={18} style={{ color: pColor }} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {/* 🌟 3. 縮小字體與隨機每日主題題庫 */}
                  <textarea placeholder={getPrompt(activeDayIndex, person as any)} value={diaryData[`text${person}`] || ''} onChange={(e) => updateDiary(trip.id, activeDayIndex, { [`text${person}`]: e.target.value })}
                    className="w-full bg-[#F6F1E8] rounded-xl p-3 text-[13px] border-none focus:ring-2 focus:ring-[#E2D6C8] resize-none h-20 placeholder:text-[#B7A99A] font-bold text-[#5C4A3D] leading-relaxed" />
                  
                  <div className="flex flex-wrap gap-2">
                    {photos.map((url: string, i: number) => (
                      <div key={i} onClick={(e) => { e.stopPropagation(); e.preventDefault(); setViewingImage(url); }} className="w-14 h-14 rounded-lg overflow-hidden border-2 border-[#E2D6C8] cursor-zoom-in relative group touch-manipulation">
                        <img src={url} className="w-full h-full object-cover pointer-events-none" />
                        {/* 🌟 統一為右上角、半透明毛玻璃的優雅 X 刪除鍵 */}
                        <button onClick={(e) => { e.stopPropagation(); const newPhotos = [...photos]; newPhotos.splice(i, 1); updateDiary(trip.id, activeDayIndex, { [`photos${person}`]: newPhotos }); }} className="absolute top-1 right-1 bg-[#F28482]/80 backdrop-blur-md text-white rounded-full p-1 shadow-sm z-50 active:scale-90"><X size={12} strokeWidth={3}/></button>
                      </div>
                    ))}
                    <label className="flex items-center justify-center w-14 h-14 bg-[#EFE7DB] border-2 border-dashed border-[#E2D6C8] rounded-lg cursor-pointer text-[#8A7A6A] hover:bg-[#E2D6C8]/40">
                      <Plus size={20} />
                      <input type="file" accept="image/*,.heic,.heif,.HEIC,.HEIF" className="hidden" onChange={(e) => handleImageUpload(person as any, e)} />
                    </label>
                  </div>
                </div>
              );
            })}
          </section>
        </main>
      </div>

      <div className="hidden print:block p-8 bg-white text-black w-full min-h-screen font-sans">
        <h1 className="text-2xl font-black mb-2">{trip?.title}</h1>
        <p className="text-[12px] text-gray-500 mb-6 border-b border-gray-300 pb-2">{trip?.startDate} ~ {trip?.endDate}</p>
        {trip?.dailyItinerary?.map(day => (
          <div key={day.day} className="mb-6 break-inside-avoid">
            <h2 className="text-[16px] font-bold mb-3 bg-gray-100 p-1.5 rounded">Day {day.day} - {day.date}</h2>
            {day.activities?.filter(a => a.time !== '--:--').length > 0 && (
              <div className="mb-3 pl-2"><h3 className="text-[14px] font-bold mb-1">📍 行程</h3><ul className="list-disc pl-5 space-y-0.5">{day.activities.filter(a => a.time !== '--:--').sort((a,b) => timeToMin(a.time) - timeToMin(b.time)).map(act => (<li key={act.id} className="text-[12px] mb-1">
                       <span className="font-bold mr-2">{act.time}</span> {act.location} 
                       {/* 🌟 匯出 PDF 時顯示該項目花費 */}
                       {act.cost > 0 && <span className="text-gray-500 font-bold"> [₩ {act.cost.toLocaleString()}]</span>}
                       {act.ratingBig > 0 && act.ratingSmall > 0 && ` (❤️ ${((act.ratingBig + act.ratingSmall) * 0.5).toFixed(1)})`}
                     </li>))}</ul></div>
            )}
            {(day.diary?.textBig || day.diary?.textSmall) && (
              <div className="mb-3 pl-2"><h3 className="text-[14px] font-bold mb-1">📝 交換日記</h3>{day.diary?.textBig && <p className="mb-0.5 text-[12px]"><span className="font-bold">大寶寶:</span> {day.diary.textBig}</p>}{day.diary?.textSmall && <p className="mb-0.5 text-[12px]"><span className="font-bold">小寶寶:</span> {day.diary.textSmall}</p>}</div>
            )}
            {day.activities?.filter(a => a.time === '--:--').length > 0 && (
              <div className="mb-3 pl-2"><h3 className="text-[14px] font-bold mb-1">💰 花費</h3><ul className="list-disc pl-5 space-y-0.5">{day.activities.filter(a => a.time === '--:--').map(act => (<li key={act.id} className="text-[12px]"><span className="font-bold mr-2">{act.location}</span> ₩ {act.cost.toLocaleString()}</li>))}</ul></div>
            )}
          </div>
        ))}
        {trip?.shoppingList && trip.shoppingList.length > 0 && (
           <div className="mb-6 break-inside-avoid"><h2 className="text-[16px] font-bold mb-3 bg-gray-100 p-1.5 rounded">🛍️ 購物清單</h2><ul className="list-disc pl-6 space-y-0.5">{trip.shoppingList.map(item => (<li key={item.id} className="text-[12px]">{item.completed ? '✅ ' : '⬜ '}{item.name} {item.priceKRW ? `- ₩ ${Number(item.priceKRW).toLocaleString()}` : ''}</li>))}</ul></div>
        )}
      </div>

{/* 🌟 完美對齊：設定為 bottom-[172px]，與貼圖按鈕保持完美的 12px 間距 */}
      <div className="fixed bottom-[160px] left-4 z-[990] print-hide flex flex-col items-start gap-3">
        {isFabOpen && <div className="fixed inset-0 z-[990]" onClick={() => setIsFabOpen(false)} onTouchStart={() => setIsFabOpen(false)} />}
        
        <AnimatePresence>
          {isFabOpen && (
            <motion.div initial={{ opacity: 0, y: 10, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.8 }} className="flex flex-col gap-3 mb-2 origin-bottom-left relative z-[999]">
              <button onClick={() => { openNewModal('EXPENSE'); setIsFabOpen(false); }} className="flex items-center gap-3 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-[#E2D6C8]/50 active:scale-95 transition-all text-[#5C4A3D] font-black text-sm">
                <Store size={18} className="text-[#E2A622]" /> 新增花費
              </button>
              <button onClick={() => { openNewModal('PLAN'); setIsFabOpen(false); }} className="flex items-center gap-3 bg-white/95 backdrop-blur-sm px-5 py-3 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.1)] border border-[#E2D6C8]/50 active:scale-95 transition-all text-[#5C4A3D] font-black text-sm">
                <Camera size={18} style={{ color: currentTheme.bg }} /> 新增行程
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button 
          onClick={() => setIsFabOpen(!isFabOpen)} 
          className="w-12 h-12 rounded-[16px] border-[3px] flex items-center justify-center text-white transition-all relative z-[999]"
          style={{ 
            backgroundColor: currentTheme.bg, borderColor: currentTheme.border, 
            boxShadow: isFabOpen ? 'none' : `0 4px 0 ${currentTheme.border}`, transform: isFabOpen ? 'translateY(4px)' : 'none'
          }}
        >
          <motion.div animate={{ rotate: isFabOpen ? 45 : 0 }}><Plus size={26} strokeWidth={3} /></motion.div>
        </button>
      </div>

      {/* 🌟 加入 z-[9999] 保證蓋過底部導航列 */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent showCloseButton={false} className="rounded-t-[32px] p-0 bg-[#FBF7F2] w-full bottom-0 top-auto translate-y-0 border-t-[4px] border-x-[4px] border-[#E2D6C8] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] max-h-[90vh] flex flex-col z-[9999] pb-safe print-hide">
          <DialogHeader className="sr-only"><DialogTitle>編輯</DialogTitle><DialogDescription>設定行程</DialogDescription></DialogHeader>
          
          {/* 🌟 頂部標題區固定 */}
          <div className="flex justify-between items-center p-5 border-b-2 border-dashed border-[#E2D6C8] shrink-0">
            <h3 className="text-xl font-black text-[#5C4A3D] ml-2">{modalMode === 'PLAN' ? '編輯行程 📝' : '新增花費 💰'}</h3>
            <button onClick={() => setIsModalOpen(false)} className="p-2 bg-[#EFE7DB] rounded-full text-[#8A7A6A] active:scale-90"><X size={20}/></button>
          </div>
          
          {/* 🌟 中間內容區，可獨立滑動 */}
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {(modalMode === 'PLAN' ? CATEGORIES_PLAN : CATEGORIES_EXPENSE).map(cat => (
                <button key={cat.id} onClick={() => setFormData({...formData, type: cat.id, location: modalMode==='EXPENSE'?cat.label:formData.location})} 
                  className={`flex flex-col items-center p-2.5 rounded-[14px] border-[3px] transition-all`}
                  style={{ borderColor: formData.type === cat.id ? currentTheme.border : '#E2D6C8', backgroundColor: formData.type === cat.id ? `${currentTheme.bg}40` : '#FFFFFF', opacity: formData.type === cat.id ? 1 : 0.6 }}>
                  <cat.icon size={20} style={{ color: cat.color }} />
                  <span className="text-[10px] font-black mt-1 text-[#5C4A3D]">{cat.label}</span>
                </button>
              ))}
            </div>
            
            <Input placeholder="地點/花費名稱" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="rounded-xl bg-white border-2 border-[#E2D6C8] h-14 px-4 text-base font-black focus-visible:ring-0 focus-visible:border-[#6DBE8A] shadow-[0_2px_0_#E2D6C8]" />
            
            {modalMode === 'PLAN' && (
              <>
                <div className="flex gap-2 w-full">
                  <select value={timeState.period} onChange={e => setTimeState({...timeState, period: e.target.value})} className="flex-1 rounded-xl bg-white border-2 border-[#E2D6C8] h-12 text-sm font-black shadow-[0_2px_0_#E2D6C8] outline-none text-center appearance-none cursor-pointer"><option value="上午">上午</option><option value="下午">下午</option></select>
                  <select value={timeState.hour} onChange={e => setTimeState({...timeState, hour: e.target.value})} className="flex-1 rounded-xl bg-white border-2 border-[#E2D6C8] h-12 text-sm font-black shadow-[0_2px_0_#E2D6C8] outline-none text-center appearance-none cursor-pointer">{Array.from({length: 12}, (_, i) => i + 1).map(h => <option key={h} value={h}>{h} 時</option>)}</select>
                  <select value={timeState.minute} onChange={e => setTimeState({...timeState, minute: e.target.value})} className="flex-1 rounded-xl bg-white border-2 border-[#E2D6C8] h-12 text-sm font-black shadow-[0_2px_0_#E2D6C8] outline-none text-center appearance-none cursor-pointer">{['00', '15', '30', '45'].map(m => <option key={m} value={m}>{m} 分</option>)}</select>
                </div>
                <Input placeholder="備註 (如：開放時間、預約了18:30)" value={formData.note || ''} onChange={e => setFormData({...formData, note: e.target.value})} className="rounded-xl bg-white border-2 border-[#E2D6C8] h-12 px-4 text-sm font-bold shadow-[0_2px_0_#E2D6C8] focus-visible:ring-0 focus-visible:border-[#6DBE8A]" />
              </>
            )}
            
            <div className="flex items-center gap-1 bg-[#EFE7DB] p-1 rounded-[14px] border-2 border-[#E2D6C8]">
                 <button onClick={() => setFormData({...formData, paidBy: formData.paidBy === 'Big' ? ('' as any) : 'Big'})} className={`flex-1 py-2.5 rounded-[10px] text-[11px] font-black transition-all ${formData.paidBy === 'Big' ? 'bg-[#78BCC4] text-white shadow-sm' : 'text-[#8A7A6A]'}`}>大寶寶</button>
                 <button onClick={() => setFormData({...formData, paidBy: formData.paidBy === 'Small' ? ('' as any) : 'Small'})} className={`flex-1 py-2.5 rounded-[10px] text-[11px] font-black transition-all ${formData.paidBy === 'Small' ? 'bg-[#F2A3B3] text-white shadow-sm' : 'text-[#8A7A6A]'}`}>小寶寶</button>
                 <button onClick={() => setFormData({...formData, paidBy: formData.paidBy === 'Shared' ? ('' as any) : 'Shared', isShared: true})} className={`flex-1 py-2.5 rounded-[10px] text-[11px] font-black transition-all ${formData.paidBy === 'Shared' ? 'bg-[#F6C945] text-[#5C4A3D] shadow-sm' : 'text-[#8A7A6A]'}`}>公用錢包</button>
                 <div className="w-[2px] h-5 bg-[#E2D6C8] mx-0.5 rounded-full" />
                 <button onClick={() => setFormData({...formData, isShared: formData.isShared === true ? false : true})} className={`flex-1 py-2.5 rounded-[10px] text-[11px] font-black transition-all ${formData.isShared && formData.paidBy !== 'Shared' ? 'bg-[#A8E0BD] text-[#2F7D57] shadow-sm' : 'text-[#8A7A6A]'}`}>平分</button>
              </div>

            {/* 🌟 補回：行程與花費都可以選擇現金/信用卡 */}
            <div className="flex gap-2 w-full bg-[#EFE7DB] p-1.5 rounded-[16px] border-2 border-[#E2D6C8]">
              <button onClick={() => setFormData({...formData, paymentMethod: formData.paymentMethod === 'cash' ? null : 'cash'})} className={`flex-1 py-2.5 rounded-[12px] text-xs font-black flex items-center justify-center gap-1 transition-all ${formData.paymentMethod === 'cash' ? 'bg-white border border-green-400 text-green-600 shadow-sm' : 'bg-transparent text-[#8A7A6A]'}`}><Banknote size={14}/> 現金</button>
              <button onClick={() => setFormData({...formData, paymentMethod: formData.paymentMethod === 'card' ? null : 'card'})} className={`flex-1 py-2.5 rounded-[12px] text-xs font-black flex items-center justify-center gap-1 transition-all ${formData.paymentMethod === 'card' ? 'bg-white border border-blue-400 text-blue-600 shadow-sm' : 'bg-transparent text-[#8A7A6A]'}`}><CreditCard size={14}/> 信用卡</button>
            </div>

            <div className="bg-white border-2 border-[#E2D6C8] rounded-[16px] p-2 pl-3 flex items-center gap-2 shadow-[0_2px_0_#E2D6C8] h-14 w-full">
                <div className="flex gap-1 shrink-0">
                  {['KRW', 'HKD'].map(c => <button key={c} onClick={() => setFormData({...formData, currency: c})} className={`px-3 py-1.5 rounded-[10px] text-xs font-black transition-all ${formData.currency === c ? 'text-white' : 'text-[#B7A99A]'}`} style={{ backgroundColor: formData.currency === c ? currentTheme.bg : 'transparent' }}>{c}</button>)}
                </div>
                <Input type="number" placeholder="輸入金額" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} className="bg-transparent border-none text-base font-black flex-1 focus-visible:ring-0 px-2 w-full" />
                <div className="text-[10px] font-black text-[#8A7A6A] bg-[#EFE7DB] px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0">約 HK$ {hkdPreview}</div>
            </div>
          </div>

          {/* 🌟 底部按鈕區固定，不隨內容滾動，保證永遠按得到！ */}
          <div className="p-5 pt-2 bg-[#FBF7F2] shrink-0 border-t-2 border-[#E2D6C8] rounded-b-[32px]">
            <button onClick={handleSave} className="w-full text-white border-[3px] rounded-full h-14 font-black text-lg active:translate-y-1 active:shadow-none transition-all" style={{ backgroundColor: currentTheme.bg, borderColor: currentTheme.border, boxShadow: `0 4px 0 ${currentTheme.border}` }}>
              完成儲存
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}