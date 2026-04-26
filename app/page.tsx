// page.tsx
"use client";

import dynamic from "next/dynamic";

// 🌟 1. 這裡改成引入剛改名的 HomeView.tsx
const HomeView = dynamic(() => import("./HomeView"), {
  ssr: false,
  // 🌟 2. 附贈：加入手機端友善的 Loading 畫面，避免 Vercel 初次渲染時出現白屏閃爍
  loading: () => (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FBF7F2] text-[#8A7A6A] font-bold gap-3">
      <div className="w-10 h-10 border-4 border-[#6DBE8A] border-t-transparent rounded-full animate-spin"></div>
      <p>加載島嶼中... ✈️</p>
    </div>
  )
});

export default function Page() {
  return <HomeView />;
}