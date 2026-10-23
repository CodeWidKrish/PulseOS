"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MARKETING_CONTENT } from "@/lib/content";
import { useLenis } from "@/lib/use-lenis";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scrollTo } = useLenis();

  const commands = MARKETING_CONTENT.commandPalette.commands;

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase())
  );

  const executeCommand = useCallback(
    (href: string) => {
      onClose();
      if (href.startsWith("#")) {
        scrollTo(href, -70);
      } else {
        window.location.href = href;
      }
    },
    [onClose, scrollTo]
  );

  // Focus input automatically and lock body scroll when dialog is rendered
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Global keyboard shortcuts (Ctrl+K, Cmd+K, Escape, Arrow Navigation, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex].href);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, executeCommand, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-md animate-[fadeIn_0.15s_ease-out]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setQuery("");
          setSelectedIndex(0);
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        ref={containerRef}
        className="w-full max-w-[540px] bg-[#161B23] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-[scaleUp_0.15s_ease-out]"
      >
        {/* Search Input Bar */}
        <div className="relative border-b border-white/10">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={MARKETING_CONTENT.commandPalette.placeholder}
            aria-label="Search navigation commands"
            className="w-full px-5 py-4 bg-transparent text-sm sm:text-base text-[#F2F4F7] placeholder-[#8B93A1] focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedIndex(0);
              onClose();
            }}
            aria-label="Close command palette"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#8B93A1] hover:text-white px-2 py-1 bg-white/5 rounded border border-white/10"
          >
            ESC
          </button>
        </div>

        {/* Command Items List */}
        <ul className="p-2 max-h-[320px] overflow-y-auto list-none m-0" role="listbox">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <li
                  key={cmd.title}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => executeCommand(cmd.href)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer text-sm transition-colors ${
                    isSelected
                      ? "bg-white/10 text-white font-medium"
                      : "text-[#C9CFD9] hover:bg-white/5"
                  }`}
                >
                  <span>{cmd.title}</span>
                  <span className="text-xs text-[#8B93A1] font-mono">
                    {cmd.group}
                  </span>
                </li>
              );
            })
          ) : (
            <li className="px-4 py-6 text-center text-sm text-[#8B93A1]">
              {MARKETING_CONTENT.commandPalette.emptyMessage}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
