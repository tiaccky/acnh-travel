"use client";

import dynamic from "next/dynamic";

// 我們在這裡重新正確引入 dynamic
const HomeView = dynamic(() => import("./HomeView"), {
  ssr: false,
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