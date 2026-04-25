"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useTripStore, ChecklistItem } from '@/store/useTripStore';
import { CheckCircle2, Circle, Trash2, Pencil, Package, Check, Plus, Link as LinkIcon, Camera, X, ChevronDown, Luggage, Umbrella } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const FRAME_COLORS = ['bg-[#FBF7F2]', 'bg-[#F2A3B3]/20', 'bg-[#78BCC4]/20', 'bg-[#F6C945]/20', 'bg-[#A8E0BD]/20'];

// 🌟 1. 獨立的編輯輸入框元件：保證輸入文字時絕對流暢，不跳字、不失去焦點！
const ChecklistEditInput = ({ initialValue, onSave }: { initialValue: string, onSave: (val: string) => void }) => {
  const [val, setVal] = useState(initialValue);
  return (
    <div className="flex w-full items-center gap-1.5 pr-0.5">
      <input autoFocus value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onSave(val); }} className="flex-1 min-w-0 bg-[#F6F1E8] border-none text-[12px] font-bold p-1 rounded focus:outline-[#6DBE8A]" />
      <button onClick={() => onSave(val)} className="p-1 bg-[#6DBE8A] rounded text-white shrink-0"><Check size={12}/></button>
    </div>
  );
};

// 🌟 2. 極致浪漫飄落特效：增加數量、提高透明度、飄出螢幕外
const FallingRomance = ({ active }: { active: boolean }) => {
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[5]">
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -50, x: Math.random() * window.innerWidth, opacity: 0, rotate: 0 }}
          animate={{ y: '120vh', x: Math.random() * window.innerWidth, opacity: [0, 0.5, 0.5, 0], rotate: 300 }}
          transition={{ duration: 8 + Math.random() * 8, repeat: Infinity, delay: Math.random() * 4, ease: "linear" }}
          className="absolute drop-shadow-sm"
          style={{ fontSize: `${11 + Math.random() * 15}px` }}
        >
          {i % 4 === 0 ? '🌸' : i % 4 === 1 ? '✨' : i % 4 === 2 ? '💖' : '🤍'}
        </motion.div>
      ))}
    </div>
  );
};

const compressImage = async (file: File): Promise<string> => {
  let fileToProcess = file;
  if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
    try {
      const heic2any = (await import('heic2any')).default;
      const convertedBlob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.8 });
      fileToProcess = new File([convertedBlob as Blob], "photo.jpg", { type: "image/jpeg" });
    } catch (e) { console.warn("HEIC 轉換失敗", e); }
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

// 🌟 智慧拍立得引擎：自動產生 Instax Mini (直) 或 Instax Wide (橫)
const exportInstax = async (imageUrl: string, date: string, caption: string) => {
  const img = new Image(); img.crossOrigin = 'anonymous'; img.src = imageUrl;
  await new Promise(r => img.onload = r);

  // 🌟 自動偵測是否為橫式照片 (Landscape)
  const isLand = img.width > img.height; 

  const canvas = document.createElement('canvas');
  // 設定畫布寬度 (Wide: 2160, Mini: 1080)
  const cW = isLand ? 2160 : 1080;
  const cH = 1720;
  canvas.width = cW; canvas.height = cH;
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  
  ctx.fillStyle = '#FBF7F2';
  ctx.fillRect(0, 0, cW, cH);

  // 設定照片內框比例
  const pX = isLand ? 90 : 100;
  const pY = 120;
  const imgW = isLand ? 1980 : 880;
  const imgH = isLand ? 1240 : 1186;
  
  ctx.fillStyle = '#E2D6C8'; ctx.fillRect(pX-4, pY-4, imgW+8, imgH+8);
  
  const scale = Math.max(imgW / img.width, imgH / img.height);
  const x = (img.width / 2) - (imgW / 2 / scale); const y = (img.height / 2) - (imgH / 2 / scale);
  ctx.drawImage(img, x, y, imgW / scale, imgH / scale, pX, pY, imgW, imgH);

  ctx.fillStyle = '#5C4A3D'; ctx.textAlign = 'center';
  const textX = cW / 2; // 置中點
  if (caption) { ctx.font = 'bold 54px sans-serif'; ctx.fillText(caption, textX, 1500); }
  ctx.font = 'bold 36px sans-serif'; ctx.fillStyle = '#8A7A6A'; ctx.fillText(date, textX, 1600);

  const link = document.createElement('a'); link.download = `Instax-Memory-${Date.now()}.jpeg`; link.href = canvas.toDataURL('image/jpeg', 0.9); link.click();
};

export default function ToolboxPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'PACKING' | 'SHOPPING' | 'MEMORIES'>('SHOPPING');
  const [packCategory, setPackCategory] = useState<'carryOn' | 'checked'>('carryOn');
  
  const { trips, activeTripId, toggleChecklist, addChecklistItem, deleteChecklistItem, updateChecklistItem, fixChecklists, addShoppingItem, toggleShoppingItem, deleteShoppingItem, updateShoppingItem, exchangeRate, fetchExchangeRate } = useTripStore();
  
  const [newItemText, setNewItemText] = useState('');
  const [editingItem, setEditingItem] = useState<{ person: 'Big'|'Small', id: string } | null>(null);
  const [editingItemText, setEditingItemText] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [editingShopId, setEditingShopId] = useState<string | null>(null);
  const [shopForm, setShopForm] = useState({ name: '', priceKRW: '', url: '', notes: '', imageUrl: '' });
// 🌟 新增：浪漫特效的觸發與計時器
  const [romanceActive, setRomanceActive] = useState(false);
  const romanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRomance = () => {
    setRomanceActive(true);
    if (romanceTimerRef.current) clearTimeout(romanceTimerRef.current);
    romanceTimerRef.current = setTimeout(() => setRomanceActive(false), 10000); // 10秒後停止
  };
  const [igExportModal, setIgExportModal] = useState<{url: string, date: string, isLand: boolean} | null>(null);
  const [igCaption, setIgCaption] = useState('');
  const pressTimer = useRef<NodeJS.Timeout | null>(null);

  const trip = trips.find(t => t.id === activeTripId);

  useEffect(() => { 
    setIsMounted(true); window.scrollTo(0, 0); fetchExchangeRate();
    const savedTab = localStorage.getItem('toolboxTab');
    if (savedTab) setActiveTab(savedTab as any);
    if (trip?.id) fixChecklists(trip.id); 
  }, [trip?.id]);
  
  const handleTabChange = (tab: 'PACKING' | 'SHOPPING' | 'MEMORIES') => {
    setActiveTab(tab); localStorage.setItem('toolboxTab', tab); 
    window.dispatchEvent(new Event('toolboxTabChanged'));
    window.scrollTo(0,0);
  };

  if (!isMounted || !trip) return null;

  const formatItemText = (text: string) => {
    let cleanText = text.replace(/[，、]/g, '/').replace(/（/g, '(').replace(/）/g, ')');
    const parts = cleanText.split('(');
    if (parts.length === 1) return <span>{cleanText}</span>;
    return <span>{parts[0].trim()} <span className="text-[10px] text-[#B7A99A]">({parts.slice(1).join('(')}</span></span>;
  };

  const handleAddChecklist = (person: 'Big'|'Small', category: 'carryOn'|'checked', subCategory?: 'clothes'|'toiletries'|'misc') => {
    if (newItemText.trim()) { addChecklistItem(trip.id, person, { id: Date.now().toString(), item: newItemText, completed: false, category, subCategory }); setNewItemText(''); }
  };

   const ChecklistItemRow = ({ item, person, uniqueKey, isExpanded, onToggleExpand, onToggleCompleted, onEdit, onDelete }: any) => {
    const textRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    // 即時偵測文字寬度是否大於容器寬度
    useEffect(() => {
      const checkOverflow = () => {
        if (textRef.current) {
          setIsOverflowing(textRef.current.scrollWidth > textRef.current.clientWidth);
        }
      };
      checkOverflow();
      window.addEventListener('resize', checkOverflow);
      return () => window.removeEventListener('resize', checkOverflow);
    }, [item.item]); // 當文字改變時重新偵測

    return (
      <div className={`flex items-center justify-between p-1.5 rounded-[10px] border-2 transition-all w-full ${item.completed ? 'bg-[#EFE7DB] border-[#E2D6C8] opacity-60' : 'bg-white border-[#E2D6C8] shadow-[0_2px_0_#E2D6C8]'}`}>
        {editingItem?.id === item.id && editingItem?.person === person ? (
                 <ChecklistEditInput 
                   initialValue={editingItemText} 
                   onSave={(newVal) => { updateChecklistItem(trip.id, person, item.id, newVal); setEditingItem(null); }} 
                 />
              ) : (
          <>
            <div className="flex items-start gap-1 flex-1 text-left min-w-0">
              <div className="mt-[2px] shrink-0 cursor-pointer" onClick={onToggleCompleted}>
                {item.completed ? <CheckCircle2 size={14} className={person === 'Big' ? 'text-[#78BCC4]' : 'text-[#F2A3B3]'} /> : <Circle size={14} className="text-[#B7A99A]" />}
              </div>
              
              {/* 🌟 完美的 CSS 螢幕寬度裁切與專屬配色的收起按鈕 */}
                    <div className="flex-1 min-w-0 flex items-end">
                      <div 
                        onClick={(e) => { 
                          if(!isExpanded) { e.stopPropagation(); const next = new Set(expandedItems); next.add(uniqueKey); setExpandedItems(next); }
                          else { toggleChecklist(trip.id, person, item.id); }
                        }}
                        className={`flex-1 min-w-0 text-[12px] font-bold leading-tight cursor-pointer ${isExpanded ? 'whitespace-normal break-all' : 'truncate'} ${item.completed ? 'line-through text-[#8A7A6A]' : 'text-[#5C4A3D]'}`}
                      >
                        {formatItemText(item.item)}
                        
                        {/* 🌟 只要是展開狀態，絕對顯示收起按鈕！並套用大/小寶寶專屬色 */}
                        {isExpanded && (
                          <span 
                            onClick={(e) => { e.stopPropagation(); const next = new Set(expandedItems); next.delete(uniqueKey); setExpandedItems(next); }} 
                            className={`${person === 'Big' ? 'text-[#78BCC4]' : 'text-[#F2A3B3]'} font-black text-[10px] ml-1.5 cursor-pointer inline-block align-baseline whitespace-nowrap`}
                          >
                            收起
                          </span>
                        )}
                      </div>
                      
                      {/* 🌟 未展開時顯示的箭頭，自動偵測是否溢出 */}
                      {!isExpanded && isOverflowing && (
                        <button onClick={(e) => { e.stopPropagation(); const next = new Set(expandedItems); next.add(uniqueKey); setExpandedItems(next); }} className="ml-1 shrink-0 bg-[#F6F1E8] text-[#8A7A6A] p-[2px] rounded-[4px] active:scale-95 flex items-center justify-center">
                          <ChevronDown size={12} />
                        </button>
                      )}
                    </div>
            </div>
            
            <div className="flex gap-1.5 shrink-0 ml-1">
              <button onClick={onEdit}><Pencil size={10} className="text-[#B7A99A] hover:text-[#5C4A3D]"/></button>
              <button onClick={onDelete}><Trash2 size={10} className="text-[#B7A99A] hover:text-[#F28482]"/></button>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderChecklist = (person: 'Big' | 'Small', category: 'carryOn' | 'checked', subCategory?: 'clothes' | 'toiletries' | 'misc') => {
    const list = (person === 'Big' ? trip.bigChecklist : trip.smallChecklist).filter(i => i.category === category && i.subCategory === subCategory);
    if (list.length === 0) return null;
    
    return (
      <div className="space-y-1.5 mb-4 w-full">
        {subCategory && <h4 className="text-[11px] font-black text-[#8A7A6A] px-1 border-b-2 border-dashed border-[#E2D6C8] pb-1 mb-2">
          {subCategory === 'clothes' ? '👕 衣物' : subCategory === 'toiletries' ? '🧴 日用品' : '☂️ 雜物'}
        </h4>}
        
        {list.map(item => {
          const uniqueKey = `${person}-${item.id}`;
          return (
            <ChecklistItemRow 
              key={item.id} item={item} person={person} uniqueKey={uniqueKey} 
              isExpanded={expandedItems.has(uniqueKey)}
              onToggleExpand={(e: any) => { e.stopPropagation(); const next = new Set(expandedItems); if(next.has(uniqueKey)) next.delete(uniqueKey); else next.add(uniqueKey); setExpandedItems(next); }}
              onToggleCompleted={() => toggleChecklist(trip.id, person, item.id)}
              onEdit={() => { setEditingItem({ person, id: item.id }); setEditingItemText(item.item); }}
              onDelete={() => deleteChecklistItem(trip.id, person, item.id)}
            />
          );
        })}
        
        <div className="mt-2 flex items-center gap-1.5 bg-white p-1 rounded-xl border-2 border-[#E2D6C8] focus-within:border-[#6DBE8A] transition-all">
           <input value={newItemText} onChange={(e) => setNewItemText(e.target.value)} placeholder="新增項目..." className="flex-1 bg-transparent border-none px-2 py-1 text-[10px] focus:text-[14px] font-bold focus:outline-none transition-all min-w-0" onKeyDown={(e) => { if(e.key === 'Enter') handleAddChecklist(person, category, subCategory); }} />
           <button onClick={() => handleAddChecklist(person, category, subCategory)} className="p-1.5 bg-[#6DBE8A] rounded-lg text-white active:scale-95 shrink-0"><Plus size={14} strokeWidth={3} /></button>
        </div>
      </div>
    );
  };

  const handleSaveShopping = () => {
    if (!shopForm.name) return alert('請填寫物品名稱喔！');
    const priceHKD = shopForm.priceKRW ? (Number(shopForm.priceKRW) * exchangeRate).toFixed(0) : '';
    if (editingShopId) {
      updateShoppingItem(trip.id, editingShopId, { name: shopForm.name, priceKRW: shopForm.priceKRW, priceHKD, url: shopForm.url, notes: shopForm.notes, imageUrl: shopForm.imageUrl });
    } else {
      addShoppingItem(trip.id, { id: Date.now().toString(), name: shopForm.name, priceKRW: shopForm.priceKRW, priceHKD, url: shopForm.url, notes: shopForm.notes, imageUrl: shopForm.imageUrl, completed: false });
    }
    setShopForm({ name: '', priceKRW: '', url: '', notes: '', imageUrl: '' }); setIsShopModalOpen(false); setEditingShopId(null);
  };

  const handleShopImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(file) { const compressedBase64 = await compressImage(file); setShopForm({ ...shopForm, imageUrl: compressedBase64 }); }
  };

  // 🌟 6. 購物清單長按貼上 (手機、iPad 支援)
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if(file) { const compressed = await compressImage(file); setShopForm({ ...shopForm, imageUrl: compressed }); } return;
      }
    }
    const text = e.clipboardData.getData('text');
    if (text && text.match(/^https?:\/\/.*\.(jpeg|jpg|gif|png|webp|heic)$/i)) setShopForm({ ...shopForm, imageUrl: text });
  };

  const sortedShoppingList = [...(trip.shoppingList || [])].sort((a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1);

  return (
    <div className="px-4 pt-16 pb-32 bg-acnh-bg min-h-screen print:bg-white">
      <header className="flex items-center gap-3 mb-6 px-1 print-hide">
        <div className="bg-[#6DBE8A] p-2.5 rounded-2xl border-[3px] border-[#4FA76F] shadow-[0_4px_0_#4FA76F]">
          <Package className="text-white" size={24} />
        </div>
        <h1 className="text-2xl font-black text-[#5C4A3D]">旅行百寶箱</h1>
      </header>

      <div className="flex bg-[#EFE7DB] p-1.5 rounded-[20px] shadow-inner border-2 border-[#E2D6C8] mb-6 print-hide">
        {[ { id: 'SHOPPING', label: '購物清單' }, { id: 'PACKING', label: '行李清單' }, { id: 'MEMORIES', label: '島嶼回憶' } ].map(t => (
          <button key={t.id} onClick={() => handleTabChange(t.id as any)} className={`flex-1 py-3 rounded-[16px] text-xs font-black transition-all ${activeTab === t.id ? 'bg-[#FBF7F2] text-[#6DBE8A] shadow-[0_2px_0_#E2D6C8]' : 'text-[#8A7A6A] hover:bg-white/50'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <main className="py-2">
        {/* 🌟 購物清單專屬浮動新增按鈕 (在貼圖按鈕正上方) */}
      <AnimatePresence>
        {activeTab === 'SHOPPING' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="fixed bottom-[172px] left-6 z-[800] print-hide">
            <button onClick={() => { setEditingShopId(null); setShopForm({name:'', priceKRW:'', url:'', notes:'', imageUrl:''}); setIsShopModalOpen(true); }} className="w-12 h-12 bg-[#9575CD] text-white rounded-[16px] border-[3px] border-[#7E57C2] shadow-[0_4px_0_#7E57C2] flex items-center justify-center active:translate-y-1 active:shadow-none transition-all">
              <Plus size={24} strokeWidth={3} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
        <AnimatePresence mode="wait">
          {activeTab === 'PACKING' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
               <div className="flex gap-2 mb-4 print-hide">
                 <button onClick={() => setPackCategory('carryOn')} className={`flex-1 py-3 rounded-xl border-[3px] font-black text-sm transition-all flex items-center justify-center gap-1.5 ${packCategory === 'carryOn' ? 'bg-[#F6C945] border-[#E2A622] text-[#5C4A3D] shadow-[0_4px_0_#E2A622]' : 'bg-[#EFE7DB] border-[#E2D6C8] text-[#8A7A6A]'}`}>🎒 手提行李</button>
                 <button onClick={() => setPackCategory('checked')} className={`flex-1 py-3 rounded-xl border-[3px] font-black text-sm transition-all flex items-center justify-center gap-1.5 ${packCategory === 'checked' ? 'bg-[#9575CD] border-[#7E57C2] text-white shadow-[0_4px_0_#7E57C2]' : 'bg-[#EFE7DB] border-[#E2D6C8] text-[#8A7A6A]'}`}><Luggage size={16}/> 寄艙行李</button>
               </div>

               <div className="grid grid-cols-2 gap-3 overflow-x-hidden items-start">
                  <div className="bg-[#FBF7F2] p-2 rounded-[20px] border-[3px] border-[#E2D6C8] shadow-[0_4px_0_#E2D6C8]">
                     <h3 className="font-black text-sm mb-3 text-center text-[#78BCC4] bg-[#78BCC4]/20 rounded-lg py-1.5">大寶寶</h3>
                     {packCategory === 'carryOn' ? renderChecklist('Big', 'carryOn') : (<>{renderChecklist('Big', 'checked', 'clothes')}{renderChecklist('Big', 'checked', 'toiletries')}{renderChecklist('Big', 'checked', 'misc')}</>)}
                  </div>
                  <div className="bg-[#FBF7F2] p-2 rounded-[20px] border-[3px] border-[#E2D6C8] shadow-[0_4px_0_#E2D6C8]">
                     <h3 className="font-black text-sm mb-3 text-center text-[#F2A3B3] bg-[#F2A3B3]/20 rounded-lg py-1.5">小寶寶</h3>
                     {packCategory === 'carryOn' ? renderChecklist('Small', 'carryOn') : (<>{renderChecklist('Small', 'checked', 'clothes')}{renderChecklist('Small', 'checked', 'toiletries')}{renderChecklist('Small', 'checked', 'misc')}</>)}
                  </div>
               </div>
             </motion.div>
          )}

          {activeTab === 'SHOPPING' && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                {sortedShoppingList.length === 0 ? (
                  <div className="acnh-card p-10 text-center border-dashed text-[#B7A99A] font-black text-sm mt-4">還沒有想買的東西喔，快來新增吧！🛍️</div>
                ) : (
                  // 🌟 改為一體成型手帳本，移除卡片空隙
                  <div className="bg-white border-[3px] border-[#E2D6C8] shadow-[0_4px_0_#E2D6C8] rounded-[24px] flex flex-col relative print-hide">
                    {sortedShoppingList.map((item, idx, arr) => (
                      <div key={item.id} className={`p-3 relative z-10 transition-colors active:bg-[#FBF7F2] ${idx !== arr.length - 1 ? 'border-b-2 border-dashed border-[#E2D6C8]/50' : ''} ${item.completed ? 'opacity-50 grayscale' : ''}`}>
                        <div className="flex gap-3 items-start">
                          <button onClick={() => toggleShoppingItem(trip.id, item.id)} className="shrink-0 mt-0.5">
                            {item.completed ? <CheckCircle2 size={18} className="text-[#6DBE8A]" /> : <Circle size={18} className="text-[#B7A99A]" />}
                          </button>
                          
                          {item.imageUrl && (
                            <div className="w-14 h-14 rounded-[10px] overflow-hidden shrink-0 border border-[#E2D6C8]">
                              <img src={item.imageUrl} className="w-full h-full object-cover" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h4 className={`font-black text-sm truncate ${item.completed ? 'line-through text-[#8A7A6A]' : 'text-[#5C4A3D]'}`}>{item.name}</h4>
                              <div className="flex gap-1.5 shrink-0 print-hide">
                              <button onClick={() => { setEditingShopId(item.id); setShopForm({ name: item.name, priceKRW: item.priceKRW||'', url: item.url||'', notes: item.notes||'', imageUrl: item.imageUrl||'' }); setIsShopModalOpen(true); }}><Pencil size={11} className="text-[#B7A99A] hover:text-[#5C4A3D]"/></button>
                              <button onClick={() => deleteShoppingItem(trip.id, item.id)}><Trash2 size={11} className="text-[#B7A99A] hover:text-[#F28482]"/></button>
                            </div>
                            </div>
                            
                            {item.priceKRW && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[10px] font-black text-[#5C4A3D] bg-[#F6C945] px-1.5 py-0.5 rounded-md shadow-sm">₩ {Number(item.priceKRW).toLocaleString()}</span>
                                <span className="text-[9px] font-bold text-[#8A7A6A] bg-[#EFE7DB] px-1.5 py-0.5 rounded-md">約 HK$ {item.priceHKD}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2 mt-1.5">
                              {item.url && (<button onClick={() => window.open(item.url, '_blank')} className="p-1 bg-[#F6F1E8] border border-[#E2D6C8] rounded-md shadow-sm active:bg-[#EFE7DB] print-hide flex items-center justify-center"><LinkIcon size={10} className="text-[#4A90E2]" /></button>)}
                              {item.notes && <p className="text-[10px] font-bold text-[#8A7A6A] truncate max-w-full">{item.notes}</p>}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 🌟 加入 z-[9999] 保證蓋過導航列 */}
                <Dialog open={isShopModalOpen} onOpenChange={setIsShopModalOpen}>
                  <DialogContent onPaste={handlePaste} showCloseButton={false} className="rounded-t-[32px] p-0 bg-[#FBF7F2] w-full bottom-0 top-auto translate-y-0 border-t-[4px] border-x-[4px] border-[#E2D6C8] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] max-h-[90vh] flex flex-col z-[9999] pb-safe print-hide">
                    <DialogHeader className="sr-only"><DialogTitle>編輯</DialogTitle><DialogDescription>設定</DialogDescription></DialogHeader>
                    
                    {/* 🌟 頂部標題固定 */}
                    <div className="flex justify-between items-center p-5 border-b-2 border-dashed border-[#E2D6C8] shrink-0">
                      <h3 className="text-xl font-black text-[#5C4A3D] ml-2">{editingShopId ? '編輯想買的東西 📝' : '新增想買的東西 🛍️'}</h3>
                      <button onClick={() => setIsShopModalOpen(false)} className="p-2 bg-[#EFE7DB] rounded-full text-[#8A7A6A] active:scale-90"><X size={20}/></button>
                    </div>

                    {/* 🌟 中間內容滑動區 */}
                    <div className="p-5 overflow-y-auto flex-1 space-y-4">
                      <div className="flex flex-col items-center justify-center mb-4 space-y-2">
                        <label className="w-24 h-24 rounded-[20px] bg-[#EFE7DB] border-4 border-dashed border-[#E2D6C8] flex flex-col items-center justify-center cursor-pointer overflow-hidden relative active:scale-95 transition-transform">
                          {shopForm.imageUrl ? <img src={shopForm.imageUrl} className="w-full h-full object-cover" /> : <Camera size={28} className="text-[#B7A99A] mb-1"/>}
                          {!shopForm.imageUrl && <span className="text-[10px] font-black text-[#8A7A6A]">加入照片</span>}
                          <input type="file" accept="image/*,.heic,.heif,.HEIC,.HEIF" className="hidden" onChange={handleShopImageUpload} />
                        </label>
                        <p className="text-[10px] font-bold text-[#B7A99A]">或直接在此貼上 (Ctrl+V) 圖片或網址</p>
                      </div>

                      <Input placeholder="物品名稱 *" value={shopForm.name} onChange={e => setShopForm({...shopForm, name: e.target.value})} className="rounded-xl bg-white border-2 border-[#E2D6C8] h-14 px-4 text-base font-black shadow-[0_2px_0_#E2D6C8] focus-visible:ring-0 focus-visible:border-[#6DBE8A]" />
                      
                      <div className="bg-white border-2 border-[#E2D6C8] rounded-[16px] p-2 pl-3 flex items-center gap-2 shadow-[0_2px_0_#E2D6C8] h-14">
                        <span className="px-2 py-1 bg-[#F6C945] rounded-lg text-[10px] font-black text-[#5C4A3D]">KRW</span>
                        <Input type="number" placeholder="參考價錢" value={shopForm.priceKRW} onChange={e => setShopForm({...shopForm, priceKRW: e.target.value})} className="bg-transparent border-none text-base font-black flex-1 focus-visible:ring-0 px-2" />
                        <div className="text-[10px] font-black text-[#8A7A6A] bg-[#EFE7DB] px-3 py-1.5 rounded-lg whitespace-nowrap">約 HK$ {shopForm.priceKRW ? (Number(shopForm.priceKRW) * exchangeRate).toFixed(0) : '0'}</div>
                      </div>

                      <Input placeholder="商品或圖片網址 (選填)" value={shopForm.url} onChange={e => { const val = e.target.value; setShopForm({...shopForm, url: val}); if(val.match(/\.(jpeg|jpg|gif|png|webp)$/i)) setShopForm(prev => ({...prev, imageUrl: val})); }} className="rounded-xl bg-white border-2 border-[#E2D6C8] h-12 px-4 text-sm font-bold shadow-[0_2px_0_#E2D6C8] focus-visible:ring-0 focus-visible:border-[#6DBE8A]" />
                      <textarea placeholder="備註 (色號、尺寸、代購資訊...)" value={shopForm.notes} onChange={e => setShopForm({...shopForm, notes: e.target.value})} className="w-full bg-white border-2 border-[#E2D6C8] rounded-xl px-4 py-3 text-sm font-bold shadow-[0_2px_0_#E2D6C8] h-20 resize-none outline-none focus:border-[#6DBE8A]" />
                    </div>
                    
                    {/* 🌟 底部固定儲存按鈕 */}
                    <div className="p-5 pt-2 bg-[#FBF7F2] shrink-0 border-t-2 border-[#E2D6C8] rounded-b-[32px]">
                      <button onClick={handleSaveShopping} className="w-full bg-[#9575CD] text-white border-[3px] border-[#7E57C2] shadow-[0_4px_0_#7E57C2] rounded-full h-14 font-black text-lg active:translate-y-1 active:shadow-none transition-all">
                        儲存清單
                      </button>
                    </div>
                  </DialogContent>
                </Dialog>
             </motion.div>
          )}

          {activeTab === 'MEMORIES' && (() => {
            const allPhotos: { url: string, date: string }[] =[];
            trip.dailyItinerary?.forEach(day => {
              if (day.diary?.photosBig) day.diary.photosBig.forEach((p: string) => allPhotos.push({ url: p, date: day.date }));
              if (day.diary?.photosSmall) day.diary.photosSmall.forEach((p: string) => allPhotos.push({ url: p, date: day.date }));
            });
            const wallPhotos = allPhotos.reverse();

            return (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-2 relative">
                {/* 🌟 掛載浪漫特效 */}
                <FallingRomance active={romanceActive} />

                {wallPhotos.length === 0 ? (
                  <div className="acnh-card p-10 text-center border-dashed text-[#B7A99A] font-black text-sm mt-4 relative z-10">去「行程」裡的交換日記上傳照片，這裡就會自動變成照片牆喔！📷</div>
                ) : (
                  <div className="columns-3 gap-2 space-y-4 pt-2 -mx-1 relative z-10">
                    {wallPhotos.map((m, idx) => (
                      <motion.div 
                        key={idx} 
                        whileTap={{ scale: 1.05, rotate:[0, -5, 5, -2, 2, 0], zIndex: 50, transition: { duration: 0.3 } }}
                        // 🌟 加入長按 0.6 秒偵測
                        // 🌟 抓取 HTML 圖片真實比例，傳給預覽彈窗
                        onPointerDown={(e) => { 
                          triggerRomance(); // 🌟 同時觸發浪漫飄落特效！
                          const imgEl = e.currentTarget.querySelector('img'); 
                          const isLand = imgEl ? imgEl.naturalWidth > imgEl.naturalHeight : false; 
                          pressTimer.current = setTimeout(() => { setIgExportModal({url: m.url, date: m.date, isLand}); setIgCaption(''); }, 600); 
                        }}
                        onPointerUp={() => { if(pressTimer.current) clearTimeout(pressTimer.current); }}
                        onPointerCancel={() => { if(pressTimer.current) clearTimeout(pressTimer.current); }}
                        className={`relative break-inside-avoid p-1.5 pb-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)] border-[2px] border-[#E2D6C8]/50 rounded-[4px] cursor-pointer bg-white ${FRAME_COLORS[idx % FRAME_COLORS.length]}`} 
                        style={{ transform: `rotate(${idx % 2 === 0 ? -3 : 3}deg)`, marginTop: idx > 2 ? '-10px' : '0' }}
                      >
                        <img src={m.url} className="w-full h-auto object-cover border border-[#E2D6C8]/50 rounded-[2px]" alt="回憶" />
                        <p className="mt-2 text-center text-[8px] font-black text-[#5C4A3D] opacity-80">{m.date}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </main>

      {/* 🌟 真正的 Instax Mini 拍立得製作彈窗 */}
      <AnimatePresence>
        {igExportModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-[#FBF7F2]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 print-hide">
             <button onClick={() => setIgExportModal(null)} className="absolute top-12 right-6 p-2 bg-[#EFE7DB] rounded-full text-[#8A7A6A] shadow-[0_4px_0_#E2D6C8] active:translate-y-1 active:shadow-none"><X size={24} strokeWidth={3}/></button>
             
             <h2 className="text-2xl font-black text-[#5C4A3D] mb-6 drop-shadow-md">製作實體拍立得 📷</h2>
             
             {/* 🌟 動態切換：橫式變寬變扁，直式變窄變長 */}
             <div className={`bg-white p-3 rounded-[4px] shadow-[0_8px_16px_rgba(0,0,0,0.15)] border border-[#E2D6C8] w-full mb-8 rotate-1 ${igExportModal.isLand ? 'max-w-[340px] pb-10' : 'max-w-[260px] pb-16'}`}>
               <img src={igExportModal.url} className={`w-full object-cover border border-[#EFE7DB] ${igExportModal.isLand ? 'aspect-[99/62]' : 'aspect-[46/62]'}`} />
               <div className="mt-4 mb-2 text-center text-[#B7A99A] font-black text-xs">{igExportModal.date}</div>
               <Input placeholder="寫下一句感動的話吧..." value={igCaption} onChange={e => setIgCaption(e.target.value)} className="bg-[#F6F1E8] border-none font-bold text-center text-xs text-[#5C4A3D] focus-visible:ring-2 focus-visible:ring-[#F2A3B3]" />
             </div>

             <button onClick={() => { exportInstax(igExportModal.url, igExportModal.date, igCaption); setIgExportModal(null); }} className="w-full max-w-[260px] bg-[#F2A3B3] text-white border-[3px] border-[#D68192] shadow-[0_4px_0_#D68192] rounded-full h-14 font-black text-lg active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2">
                <Camera size={20} /> 儲存拍立得照片
             </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}