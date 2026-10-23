"use client";

import React from "react";
import toast, { Toaster as HotToaster } from "react-hot-toast";

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      icon: (
        <span className="w-2 h-2 rounded-full bg-[#5EE1D2] shadow-[0_0_8px_rgba(94,225,210,0.6)]" />
      ),
      style: {
        background: "rgba(18, 22, 29, 0.95)",
        backdropFilter: "blur(16px)",
        color: "#F2F4F7",
        border: "1px solid rgba(94, 225, 210, 0.3)",
        borderRadius: "9999px",
        padding: "10px 18px",
        fontSize: "14px",
        boxShadow: "0 16px 36px -8px rgba(0, 0, 0, 0.7)",
      },
    });
  },

  error: (message: string) => {
    toast.error(message, {
      icon: (
        <span className="w-2 h-2 rounded-full bg-[#FF4D5E] shadow-[0_0_8px_rgba(255,77,94,0.6)]" />
      ),
      style: {
        background: "rgba(18, 22, 29, 0.95)",
        backdropFilter: "blur(16px)",
        color: "#F2F4F7",
        border: "1px solid rgba(255, 77, 94, 0.3)",
        borderRadius: "9999px",
        padding: "10px 18px",
        fontSize: "14px",
        boxShadow: "0 16px 36px -8px rgba(0, 0, 0, 0.7)",
      },
    });
  },

  info: (message: string) => {
    toast(message, {
      icon: (
        <span className="w-2 h-2 rounded-full bg-[#FFB86B] shadow-[0_0_8px_rgba(255,184,107,0.6)]" />
      ),
      style: {
        background: "rgba(18, 22, 29, 0.95)",
        backdropFilter: "blur(16px)",
        color: "#F2F4F7",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "9999px",
        padding: "10px 18px",
        fontSize: "14px",
        boxShadow: "0 16px 36px -8px rgba(0, 0, 0, 0.7)",
      },
    });
  },
};

export function ToastContainer() {
  return (
    <HotToaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
      }}
    />
  );
}
