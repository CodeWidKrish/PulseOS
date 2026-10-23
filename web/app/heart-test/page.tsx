"use client";

import React from "react";
import dynamic from "next/dynamic";

const DynamicElectricLogo = dynamic(
  () => import("@/components/ui/ElectricLogo"),
  { ssr: false }
);

export default function HeartTestPage() {
  const panels = [
    { id: "A", name: "A: heart-anatomy.svg", src: "/media/heart-anatomy.svg" },
    { id: "B", name: "B: heart-vessels.svg", src: "/media/heart-vessels.svg" },
    { id: "C", name: "C: heart-plain.svg", src: "/media/heart-plain.svg" },
    { id: "D", name: "D: heart-plain.png", src: "/media/heart-plain.png" },
  ];

  return (
    <div className="min-h-screen bg-[#07090D] text-white p-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-[#F2F4F7]">
        ElectricLogo Isolation Test (/heart-test)
      </h1>
      <div className="grid grid-cols-2 gap-10 justify-items-center max-w-[1500px] mx-auto">
        {panels.map((panel) => (
          <div key={panel.id} className="flex flex-col items-center">
            <h2 className="text-base font-mono mb-3 text-[#F2F4F7] font-semibold">{panel.name}</h2>
            {/* 700x700 div, position: relative, no transforms, no tilt, no clipping */}
            <div
              className="relative border border-white/10 rounded-xl bg-black/40"
              style={{ width: "700px", height: "700px" }}
            >
              <DynamicElectricLogo
                src={panel.src}
                color="#FFD3D8"
                glowColor="#FF4D5E"
                scale={0.7}
                strands={4}
                speed={1.6}
                interactive={false}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
