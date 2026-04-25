import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware'; // 🌟 引入 createJSONStorage
import { get, set, del } from 'idb-keyval';

// 🌟 建立 IndexedDB 儲存驅動
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => { return (await get(name)) || null; },
  setItem: async (name: string, value: string): Promise<void> => { await set(name, value); },
  removeItem: async (name: string): Promise<void> => { await del(name); },
};

export interface Activity { id: string; time: string; type: string; location: string; address?: string; note?: string; cost: number; currency: string; costHKD: number; paidBy: 'Big' | 'Small' | 'Shared'; isShared: boolean; ratingBig: number; ratingSmall: number; isSurprise?: boolean; paymentMethod?: 'cash' | 'card' | null; } // 🌟 加入 Shared
export interface ChecklistItem { id: string; item: string; completed: boolean; category: 'carryOn' | 'checked'; subCategory?: 'clothes' | 'toiletries' | 'misc'; }
export interface ShoppingItem { id: string; name: string; priceKRW?: string; priceHKD?: string; url?: string; notes?: string; imageUrl?: string; completed: boolean; }
export interface Sticker { id: string; url: string; x: number; y: number; scale: number; rotate: number; pagePath: string; dayIndex?: number; }
export interface CashExchange { id: string; person: 'Big' | 'Small' | 'Shared'; date: string; amountHKD: number; amountKRW: number; rate: number; } // 🌟 加入 Shared

export interface Trip {
  id: string; title: string; location: string; startDate: string; endDate: string;
  dailyItinerary: { day: number; date: string; activities: Activity[]; diary: any; }[];
  wishlist: Activity[]; memories: { id: string; date: string; url: string; }[];
  budget: { total: number; spentHKD: number; spentLocal: number; };
  bigChecklist: ChecklistItem[]; smallChecklist: ChecklistItem[]; shoppingList: ShoppingItem[]; stickers: Sticker[];
  cashExchanges: CashExchange[];
}

interface TripStore {
  trips: Trip[]; activeTripId: string | null; activeDayIndex: number; exchangeRate: number;
  fetchExchangeRate: () => Promise<void>;
  setActiveTrip: (id: string) => void; setActiveDayIndex: (idx: number) => void;
  addTrip: (newTrip: any) => void;
  addActivity: (tripId: string, dayIdx: number, act: Activity) => void; updateActivity: (tripId: string, dayIdx: number, act: Activity) => void; deleteActivity: (tripId: string, dayIdx: number, actId: string) => void;
  addWishlistItem: (tripId: string, act: Activity) => void; deleteWishlistItem: (tripId: string, actId: string) => void;
  updateDiary: (tripId: string, dayIdx: number, diary: any) => void;
  toggleChecklist: (tripId: string, person: 'Big'|'Small', itemId: string) => void; addChecklistItem: (tripId: string, person: 'Big'|'Small', item: ChecklistItem) => void; deleteChecklistItem: (tripId: string, person: 'Big'|'Small', itemId: string) => void; updateChecklistItem: (tripId: string, person: 'Big'|'Small', itemId: string, newItemText: string) => void;
  fixChecklists: (tripId: string) => void; 
  addShoppingItem: (tripId: string, item: ShoppingItem) => void; updateShoppingItem: (tripId: string, itemId: string, updates: Partial<ShoppingItem>) => void; toggleShoppingItem: (tripId: string, itemId: string) => void; deleteShoppingItem: (tripId: string, itemId: string) => void;
  addSticker: (tripId: string, sticker: Sticker) => void; updateSticker: (tripId: string, stickerId: string, updates: Partial<Sticker>) => void; removeSticker: (tripId: string, stickerId: string) => void;
  addMemory: (tripId: string, memory: {id:string, date:string, url:string}) => void;
  addCashExchange: (tripId: string, exchange: CashExchange) => void; deleteCashExchange: (tripId: string, exchangeId: string) => void;
  customStickers: string[]; // 🌟 專屬貼紙簿
  addCustomSticker: (url: string) => void;
  removeCustomSticker: (url: string) => void;
}

const genId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

// 🌟 補回遺失的日期格式化函式
const formatDateDM = (dateObj: Date) => `${dateObj.getDate()}/${dateObj.getMonth() + 1}`;

const generateChecklist = (isBig: boolean, days: number): ChecklistItem[] => {
  const p = isBig ? 'B' : 'S'; const list: ChecklistItem[] =[]; const add = (item: string, cat: 'carryOn'|'checked', sub?: 'clothes'|'toiletries'|'misc') => list.push({ id: genId(p), item, completed: false, category: cat, subCategory: sub });
  if (isBig) {['銀包(港幣/外幣/提款卡/信用卡)','證件(護照/身份證/簽證)','登機證','尿袋','紙巾','手提電話','空的水樽','交通卡','外套'].forEach(i => add(i, 'carryOn'));} else {['銀包(港幣/外幣/提款卡/信用卡)','證件(護照/身份證/簽證)','登機證','尿袋','紙巾','相機(菲林)','手提電話','空的水樽','保濕用品(潤唇膏/手部/面部)','交通卡','筆','外套','iPad'].forEach(i => add(i, 'carryOn'));}
  add(`出街衫褲 x ${days > 1 ? days - 1 : 1}`, 'checked', 'clothes'); add(`打底衫 x ${days}`, 'checked', 'clothes'); add(`保暖內衣 x ${days > 1 ? days - 1 : 1}`, 'checked', 'clothes'); add('外套/薄羽絨', 'checked', 'clothes'); add('睡衣', 'checked', 'clothes'); add(`內衣褲 x ${days + 1}`, 'checked', 'clothes'); add(`襪 x ${days + 1}`, 'checked', 'clothes'); add('毛巾 x 2', 'checked', 'clothes'); add('拖鞋', 'checked', 'clothes');
  add('牙膏/牙刷', 'checked', 'toiletries'); add('牙線', 'checked', 'toiletries'); add('護理用品(淋浴露/洗頭水/護髮素)', 'checked', 'toiletries'); add(isBig ? '洗面用品' : '洗面用品/卸妝', 'checked', 'toiletries'); add('護膚品', 'checked', 'toiletries'); if (!isBig) { add('化妝品', 'checked', 'toiletries'); add('防曬用品', 'checked', 'toiletries'); add('面膜', 'checked', 'toiletries'); add('潤膚膏', 'checked', 'toiletries'); add('M巾', 'checked', 'toiletries'); }
  add('迷你藥包(感冒藥/腸胃藥/膠布)', 'checked', 'misc'); add(`紙巾 x ${days}`, 'checked', 'misc'); add('轉換插頭', 'checked', 'misc'); add('充電器(手機/相機)', 'checked', 'misc'); if (!isBig) { add('360', 'checked', 'misc'); add('購物袋', 'checked', 'misc'); } add('垃圾膠袋', 'checked', 'misc'); add('雨傘', 'checked', 'misc'); add('旅行袋/密碼鎖', 'checked', 'misc');
  return list;
};

export const useTripStore = create<TripStore>()(
  persist(
    (set) => ({
      trips:[], activeTripId: null, activeDayIndex: 0, exchangeRate: 0.0053,
      fetchExchangeRate: async () => {
        try { 
          // 🌟 捨棄 Google 爬蟲，改用業界最穩定的開源外匯 API，永不 403 報錯
          const res = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/krw.json', { cache: 'no-store' });
          const data = await res.json();
          if (data.krw && data.krw.hkd) {
            set({ exchangeRate: data.krw.hkd });
          }
        } catch (e) { 
          console.warn("匯率抓取失敗，使用預設 0.0053"); 
          set({ exchangeRate: 0.0053 });
        }
      },
      setActiveTrip: (id) => set({ activeTripId: id, activeDayIndex: 0 }), setActiveDayIndex: (idx) => set({ activeDayIndex: idx }),
      addTrip: (newTrip) => set((state) => {
        const start = new Date(newTrip.startDate); const end = new Date(newTrip.endDate); const diffDays = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
        const trip: Trip = {
          id: Date.now().toString(), title: `${newTrip.location}大冒險`, location: newTrip.location, startDate: newTrip.startDate, endDate: newTrip.endDate,
          dailyItinerary: Array.from({ length: diffDays > 0 ? diffDays : 1 }, (_, i) => { const d = new Date(start.getTime() + i * 86400000); return { day: i + 1, date: formatDateDM(d), activities:[], diary: {} }; }),
          wishlist: [], memories:[], budget: { total: 0, spentHKD: 0, spentLocal: 0 }, 
          bigChecklist: generateChecklist(true, diffDays), smallChecklist: generateChecklist(false, diffDays), shoppingList:[], stickers:[], cashExchanges:[]
        };
        return { trips:[trip, ...state.trips], activeTripId: trip.id, activeDayIndex: 0 };
      }),
      fixChecklists: (tripId) => set((state) => ({ trips: state.trips.map(t => { if (t.id !== tripId) return t; if (t.bigChecklist?.length > 5 && t.wishlist && t.cashExchanges) return t; const diffDays = Math.ceil((new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / 86400000) + 1; return { ...t, cashExchanges: t.cashExchanges ||[], wishlist: t.wishlist ||[], bigChecklist: t.bigChecklist?.length > 5 ? t.bigChecklist : generateChecklist(true, diffDays), smallChecklist: t.smallChecklist?.length > 5 ? t.smallChecklist : generateChecklist(false, diffDays) }; }) })),
      addActivity: (tripId, dayIdx, act) => set((state) => ({ trips: state.trips.map(t => t.id === tripId ? { ...t, dailyItinerary: t.dailyItinerary.map((d, i) => i === dayIdx ? { ...d, activities:[...d.activities, act] } : d) } : t) })),
      updateActivity: (tripId, dayIdx, act) => set((state) => ({ trips: state.trips.map(t => t.id === tripId ? { ...t, dailyItinerary: t.dailyItinerary.map((d, i) => i === dayIdx ? { ...d, activities: d.activities.map(a => a.id === act.id ? act : a) } : d) } : t) })),
      deleteActivity: (tripId, dayIdx, actId) => set((state) => ({ trips: state.trips.map(t => t.id === tripId ? { ...t, dailyItinerary: t.dailyItinerary.map((d, i) => i === dayIdx ? { ...d, activities: d.activities.filter(a => a.id !== actId) } : d) } : t) })),
      addWishlistItem: (tripId, act) => set((state) => ({ trips: state.trips.map(t => t.id === tripId ? { ...t, wishlist: [...(t.wishlist||[]), act] } : t) })),
      deleteWishlistItem: (tripId, actId) => set((state) => ({ trips: state.trips.map(t => t.id === tripId ? { ...t, wishlist: (t.wishlist||[]).filter(a => a.id !== actId) } : t) })),
      updateDiary: (tripId, dayIdx, diary) => set((state) => ({ trips: state.trips.map(t => t.id === tripId ? { ...t, dailyItinerary: t.dailyItinerary.map((d, i) => i === dayIdx ? { ...d, diary: { ...d.diary, ...diary } } : d) } : t) })),
      toggleChecklist: (tripId, person, itemId) => set((state) => ({ trips: state.trips.map(t => { if (t.id !== tripId) return t; const k = person === 'Big' ? 'bigChecklist' : 'smallChecklist'; return { ...t, [k]: t[k].map(i => i.id === itemId ? { ...i, completed: !i.completed } : i) }; }) })),
      addChecklistItem: (tripId, person, item) => set((state) => ({ trips: state.trips.map(t => { if (t.id !== tripId) return t; const k = person === 'Big' ? 'bigChecklist' : 'smallChecklist'; return { ...t, [k]: [...t[k], item] }; }) })),
      deleteChecklistItem: (tripId, person, itemId) => set((state) => ({ trips: state.trips.map(t => { if (t.id !== tripId) return t; const k = person === 'Big' ? 'bigChecklist' : 'smallChecklist'; return { ...t, [k]: t[k].filter(i => i.id !== itemId) }; }) })),
      updateChecklistItem: (tripId, person, itemId, newItemText) => set((state) => ({ trips: state.trips.map(t => { if (t.id !== tripId) return t; const k = person === 'Big' ? 'bigChecklist' : 'smallChecklist'; return { ...t, [k]: t[k].map(i => i.id === itemId ? { ...i, item: newItemText } : { ...i }) }; }) })),
      addShoppingItem: (tripId, item) => set((state) => ({ trips: state.trips.map(t => t.id === tripId ? { ...t, shoppingList: [...(t.shoppingList||[]), item] } : t) })),
      updateShoppingItem: (tripId, itemId, updates) => set((state) => ({ trips: state.trips.map(t => t.id === tripId ? { ...t, shoppingList: t.shoppingList.map(i => i.id === itemId ? { ...i, ...updates } : i) } : t) })),
      toggleShoppingItem: (tripId, itemId) => set((state) => ({ trips: state.trips.map(t => t.id === tripId ? { ...t, shoppingList: t.shoppingList.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i) } : t) })),
      deleteShoppingItem: (tripId, itemId) => set((state) => ({ trips: state.trips.map(t => t.id === tripId ? { ...t, shoppingList: t.shoppingList.filter(i => i.id !== itemId) } : t) })),
      addSticker: (tripId, sticker) => set((state) => ({ trips: state.trips.map(t => t.id === tripId ? { ...t, stickers: [...(t.stickers || []), sticker] } : t) })),
      updateSticker: (tripId, stickerId, updates) => set((state) => ({ trips: state.trips.map(t => t.id === tripId ? { ...t, stickers: (t.stickers||[]).map(s => s.id === stickerId ? { ...s, ...updates } : s) } : t) })),
      removeSticker: (tripId, stickerId) => set((state) => ({ trips: state.trips.map(t => t.id === tripId ? { ...t, stickers: (t.stickers||[]).filter(s => s.id !== stickerId) } : t) })),
      addMemory: (tripId, memory) => set((state) => ({ trips: state.trips.map(t => t.id === tripId ? { ...t, memories:[...(t.memories||[]), memory] } : t) })),
      addCashExchange: (tripId, exchange) => set((state) => ({ trips: state.trips.map(t => t.id === tripId ? { ...t, cashExchanges: [...(t.cashExchanges||[]), exchange] } : t) })),
      deleteCashExchange: (tripId, exchangeId) => set((state) => ({ trips: state.trips.map(t => t.id === tripId ? { ...t, cashExchanges: (t.cashExchanges||[]).filter(e => e.id !== exchangeId) } : t) })),
      customStickers:[], // 🌟 初始化貼紙簿
      addCustomSticker: (url) => set((state) => ({ customStickers: [...state.customStickers, url] })),
      removeCustomSticker: (url) => set((state) => ({ customStickers: state.customStickers.filter(s => s !== url) })),
    }), 
    { 
      name: 'acnh-travel-flow',
      storage: createJSONStorage(() => {
  if (typeof window === 'undefined') {
    // SSR fallback (must match StateStorage type)
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }

  return idbStorage;
})