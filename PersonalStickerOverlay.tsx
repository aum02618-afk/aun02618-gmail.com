import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PersonalSticker, DecorationAnimation, DecorationBorder, DecorationAnchor } from '../types/personalTheme';
import {
  Trash2,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Sparkles,
  X,
  Copy,
  Layers,
  Move,
  Sliders,
  Anchor,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

interface PersonalStickerOverlayProps {
  stickers?: PersonalSticker[];
  onUpdateStickers: (stickers: PersonalSticker[]) => void;
  showStickers?: boolean;
  lockStickers?: boolean;
  onToggleLock?: () => void;
  onToggleShow?: () => void;
  onOpenStickerPicker?: () => void;
}

export const PersonalStickerOverlay: React.FC<PersonalStickerOverlayProps> = ({
  stickers = [],
  onUpdateStickers = (_stickers: PersonalSticker[]) => {},
  showStickers = true,
  lockStickers = false,
  onToggleLock = () => {},
  onToggleShow = () => {},
  onOpenStickerPicker = () => {},
}) => {
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [showAdvancedMenu, setShowAdvancedMenu] = useState(false);
  const [localStickers, setLocalStickers] = useState<PersonalSticker[]>(stickers);
  
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const screenContainerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const pendingUpdateRef = useRef<PersonalSticker[] | null>(null);

  // Sync props stickers when not actively dragging
  useEffect(() => {
    if (!activeDragId) {
      setLocalStickers(stickers);
    }
  }, [stickers, activeDragId]);

  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initX: number;
    initY: number;
    isScreenAnchor: boolean;
  }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
    isScreenAnchor: false,
  });

  const handlePointerDown = useCallback((e: React.PointerEvent, sticker: PersonalSticker) => {
    if (lockStickers || sticker.isLocked) return;
    e.stopPropagation();
    try {
      (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
    } catch {}

    setSelectedStickerId(sticker.id);
    setActiveDragId(sticker.id);

    const isScreen = sticker.anchor === 'screen';
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: sticker.x,
      initY: sticker.y,
      isScreenAnchor: isScreen,
    };
  }, [lockStickers]);

  useEffect(() => {
    if (!activeDragId) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!activeDragId) return;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const isScreen = dragStartRef.current.isScreenAnchor;
        const targetContainer = isScreen ? screenContainerRef.current : pageContainerRef.current;
        
        let containerWidth = window.innerWidth;
        let containerHeight = window.innerHeight;

        if (targetContainer) {
          const rect = targetContainer.getBoundingClientRect();
          containerWidth = rect.width || window.innerWidth;
          containerHeight = isScreen ? window.innerHeight : (targetContainer.scrollHeight || rect.height || window.innerHeight);
        }

        const deltaX = e.clientX - dragStartRef.current.startX;
        const deltaY = e.clientY - dragStartRef.current.startY;

        const deltaPercentX = (deltaX / containerWidth) * 100;
        const deltaPercentY = (deltaY / containerHeight) * 100;

        const newX = Math.max(1, Math.min(98, dragStartRef.current.initX + deltaPercentX));
        const newY = Math.max(1, Math.min(99, dragStartRef.current.initY + deltaPercentY));

        setLocalStickers((prev) => {
          const next = prev.map((s) => (s.id === activeDragId ? { ...s, x: newX, y: newY } : s));
          pendingUpdateRef.current = next;
          return next;
        });
      });
    };

    const handlePointerUp = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (pendingUpdateRef.current) {
        onUpdateStickers(pendingUpdateRef.current);
        pendingUpdateRef.current = null;
      }
      setActiveDragId(null);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [activeDragId, onUpdateStickers]);

  const handleUpdateSingleSticker = useCallback((id: string, updates: Partial<PersonalSticker>) => {
    const updated = localStickers.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setLocalStickers(updated);
    onUpdateStickers(updated);
  }, [localStickers, onUpdateStickers]);

  const handleResize = useCallback((id: string, delta: number) => {
    const updated = localStickers.map((s) => {
      if (s.id !== id) return s;
      const newSize = Math.max(18, Math.min(260, (s.size || 44) + delta));
      return { ...s, size: newSize };
    });
    setLocalStickers(updated);
    onUpdateStickers(updated);
  }, [localStickers, onUpdateStickers]);

  const handleRotate = useCallback((id: string, deltaDeg: number) => {
    const updated = localStickers.map((s) => {
      if (s.id !== id) return s;
      let newRot = ((s.rotation || 0) + deltaDeg) % 360;
      if (newRot > 180) newRot -= 360;
      if (newRot < -180) newRot += 360;
      return { ...s, rotation: newRot };
    });
    setLocalStickers(updated);
    onUpdateStickers(updated);
  }, [localStickers, onUpdateStickers]);

  const handleDuplicate = useCallback((sticker: PersonalSticker) => {
    const cloned: PersonalSticker = {
      ...sticker,
      id: `deco-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      x: Math.min(95, sticker.x + 3),
      y: Math.min(95, sticker.y + 3),
    };
    const updated = [...localStickers, cloned];
    setLocalStickers(updated);
    onUpdateStickers(updated);
    setSelectedStickerId(cloned.id);
    toast.success('คัดลอกของตกแต่งเพิ่ม 1 ชิ้นแล้ว ✨');
  }, [localStickers, onUpdateStickers]);

  const handleDelete = useCallback((id: string) => {
    const updated = localStickers.filter((s) => s.id !== id);
    setLocalStickers(updated);
    onUpdateStickers(updated);
    if (selectedStickerId === id) {
      setSelectedStickerId(null);
      setShowAdvancedMenu(false);
    }
  }, [localStickers, onUpdateStickers, selectedStickerId]);

  const handleToggleSingleLock = useCallback((sticker: PersonalSticker) => {
    const nextLocked = !sticker.isLocked;
    handleUpdateSingleSticker(sticker.id, { isLocked: nextLocked });
    toast.success(nextLocked ? '🔒 ล็อกของตกแต่งชิ้นนี้ให้อยู่กับที่แล้ว' : '🔓 ปลดล็อกให้ขยับชิ้นนี้ได้');
  }, [handleUpdateSingleSticker]);

  const handleToggleAnchor = useCallback((sticker: PersonalSticker) => {
    const nextAnchor: DecorationAnchor = sticker.anchor === 'screen' ? 'page' : 'screen';
    handleUpdateSingleSticker(sticker.id, { anchor: nextAnchor });
    toast.success(
      nextAnchor === 'page'
        ? '📄 ล็อกเกาะติดเนื้อหาหน้าเว็บ (เลื่อนตามชื่อสมาชิก/การ์ด)'
        : '📱 ตรึงติดมุมหน้าจอ (Heads-Up Display)'
    );
  }, [handleUpdateSingleSticker]);

  // Render animation classes
  const getAnimationClass = (anim?: DecorationAnimation) => {
    switch (anim) {
      case 'float':
        return 'animate-bounce [animation-duration:3s]';
      case 'bounce':
        return 'animate-bounce [animation-duration:1.5s]';
      case 'pulse':
        return 'animate-pulse';
      case 'spin-slow':
        return 'animate-spin [animation-duration:10s]';
      case 'wiggle':
        return 'hover:rotate-12 transition-transform';
      default:
        return '';
    }
  };

  // Render border styles
  const getBorderClass = (border?: DecorationBorder) => {
    switch (border) {
      case 'gold':
        return 'ring-2 ring-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)] rounded-2xl';
      case 'neon':
        return 'ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.6)] rounded-2xl';
      case 'rainbow':
        return 'ring-2 ring-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.6)] rounded-2xl';
      case 'white':
        return 'ring-2 ring-white shadow-md rounded-2xl';
      case 'circle':
        return 'ring-2 ring-amber-300 rounded-full shadow-lg overflow-hidden';
      case 'glass':
        return 'backdrop-blur-md bg-slate-900/60 ring-1 ring-white/20 rounded-2xl shadow-lg';
      default:
        return '';
    }
  };

  const selectedSticker = useMemo(() => {
    return localStickers.find((s) => s.id === selectedStickerId) || null;
  }, [localStickers, selectedStickerId]);

  // Separate stickers by anchor: page (scrolls with container) vs screen (fixed HUD)
  const { pageStickers, screenStickers } = useMemo(() => {
    const page: PersonalSticker[] = [];
    const screen: PersonalSticker[] = [];
    localStickers.forEach((s) => {
      if (s.anchor === 'screen') {
        screen.push(s);
      } else {
        page.push(s); // Default: page content anchor
      }
    });
    return { pageStickers: page, screenStickers: screen };
  }, [localStickers]);

  const renderStickerItem = (sticker: PersonalSticker) => {
    const isGloballyLocked = lockStickers;
    const isItemLocked = sticker.isLocked || isGloballyLocked;
    const isSelected = selectedStickerId === sticker.id && !isGloballyLocked;
    const isDragging = activeDragId === sticker.id;
    const isImage = Boolean(sticker.imageUrl);
    const isBadge = Boolean(sticker.text);

    return (
      <div
        key={sticker.id}
        style={{
          position: 'absolute',
          left: `${sticker.x}%`,
          top: `${sticker.y}%`,
          transform: `translate3d(-50%, -50%, 0) rotate(${sticker.rotation || 0}deg)`,
          opacity: sticker.opacity ?? 1,
          fontSize: `${sticker.size || 44}px`,
          lineHeight: 1,
          userSelect: 'none',
          touchAction: isItemLocked ? 'auto' : 'none',
          zIndex: isSelected ? 40 : sticker.zIndex || 20,
          willChange: isDragging ? 'transform, left, top' : 'auto',
        }}
        onPointerDown={(e) => handlePointerDown(e, sticker)}
        className={`select-none transition-transform ${
          isItemLocked
            ? 'pointer-events-none'
            : 'pointer-events-auto cursor-grab active:cursor-grabbing hover:scale-105'
        } ${
          isSelected
            ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950 rounded-2xl shadow-2xl z-30'
            : ''
        }`}
      >
        <div className={`relative group inline-flex items-center justify-center ${getAnimationClass(sticker.animation)} ${getBorderClass(sticker.borderStyle)}`}>
          {/* 1. Custom Image / GIF Mode */}
          {isImage ? (
            <img
              src={sticker.imageUrl}
              alt={sticker.label || 'deco image'}
              referrerPolicy="no-referrer"
              className="object-contain pointer-events-none rounded-xl drop-shadow-md select-none"
              style={{
                width: `${sticker.size || 48}px`,
                height: `${sticker.size || 48}px`,
                maxWidth: 'none',
              }}
              draggable={false}
            />
          ) : isBadge ? (
            /* 2. Custom Text / Member Name Tag Badge Mode */
            <div
              className="px-2.5 py-1 rounded-full font-black flex items-center gap-1 shadow-lg whitespace-nowrap select-none border border-white/20"
              style={{
                backgroundColor: sticker.bgColor || '#f59e0b',
                color: sticker.textColor || '#ffffff',
                fontSize: `${Math.max(11, Math.floor((sticker.size || 44) * 0.3))}px`,
              }}
            >
              {sticker.icon && <span className="text-[1.1em]">{sticker.icon}</span>}
              <span>{sticker.text}</span>
            </div>
          ) : (
            /* 3. Emoji Sticker Mode */
            <span className="inline-block filter drop-shadow-md select-none pointer-events-none">
              {sticker.icon}
            </span>
          )}

          {/* Small Locked Padlock Indicator on Item when Individually Locked */}
          {sticker.isLocked && !lockStickers && (
            <div className="absolute -bottom-2 -right-2 bg-slate-950/90 text-emerald-400 border border-emerald-500/50 p-1 rounded-full text-[9px] shadow-md pointer-events-none">
              <Lock className="w-2.5 h-2.5" />
            </div>
          )}

          {/* Anchor Indicator (Screen vs Page) */}
          {sticker.anchor === 'screen' && !lockStickers && (
            <div className="absolute -top-2 -left-2 bg-slate-950/90 text-sky-400 border border-sky-500/50 p-1 rounded-full text-[9px] shadow-md pointer-events-none" title="ตรึงติดหน้าจอ">
              <Anchor className="w-2.5 h-2.5" />
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!showStickers && localStickers.length === 0) return null;

  return (
    <>
      {/* 1. Page-Anchored Decorations Container (Absolute inside scrollable app body - SCROLLS NATURALLY WITH MEMBERS & CONTENT) */}
      {showStickers && (
        <div
          ref={pageContainerRef}
          className="absolute inset-0 w-full h-full min-h-full overflow-visible pointer-events-none z-20"
          onClick={(e) => {
            if (e.target === pageContainerRef.current) {
              setSelectedStickerId(null);
              setShowAdvancedMenu(false);
            }
          }}
        >
          {pageStickers.map(renderStickerItem)}
        </div>
      )}

      {/* 2. Screen-Anchored Decorations Container (Fixed to viewport HUD) */}
      {showStickers && screenStickers.length > 0 && (
        <div
          ref={screenContainerRef}
          className="fixed inset-0 overflow-hidden pointer-events-none z-25"
        >
          {screenStickers.map(renderStickerItem)}
        </div>
      )}

      {/* 3. Floating Quick Control Box for Selected Decoration */}
      <AnimatePresence>
        {selectedSticker && !lockStickers && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-950/95 border-2 border-amber-400/90 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl p-2.5 max-w-[94vw] sm:max-w-md text-white pointer-events-auto"
          >
            {/* Top Bar of Selected Deco */}
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800 text-xs font-bold">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-amber-400 font-black">
                  {selectedSticker.imageUrl ? '🖼️ รูปภาพ' : selectedSticker.text ? '🏷️ ป้ายชื่อ' : '✨ สติกเกอร์'}
                </span>
                <span className="text-zinc-400 text-[11px] truncate max-w-[120px]">
                  {selectedSticker.label || selectedSticker.text || selectedSticker.icon}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {/* Lock Single Item */}
                <button
                  type="button"
                  onClick={() => handleToggleSingleLock(selectedSticker)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all ${
                    selectedSticker.isLocked
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : 'bg-slate-900 text-zinc-400 hover:text-white border border-slate-800'
                  }`}
                  title={selectedSticker.isLocked ? 'ล็อกชิ้นนี้อยู่' : 'ปลดล็อกชิ้นนี้'}
                >
                  {selectedSticker.isLocked ? <Lock className="w-3 h-3 text-emerald-400" /> : <Unlock className="w-3 h-3" />}
                  <span>{selectedSticker.isLocked ? 'ล็อกตำแหน่ง' : 'ขยับได้'}</span>
                </button>

                {/* Anchor Mode Toggle (Page vs Screen) */}
                <button
                  type="button"
                  onClick={() => handleToggleAnchor(selectedSticker)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all border ${
                    selectedSticker.anchor === 'screen'
                      ? 'bg-sky-950 text-sky-300 border-sky-700'
                      : 'bg-purple-950 text-purple-300 border-purple-800'
                  }`}
                  title={
                    selectedSticker.anchor === 'screen'
                      ? 'ตรึงติดมุมจอ (Screen HUD)'
                      : 'เกาะติดเนื้อหาหน้าเว็บ (เลื่อนตามชื่อสมาชิก/ต้ม)'
                  }
                >
                  <Anchor className="w-3 h-3" />
                  <span>{selectedSticker.anchor === 'screen' ? 'ตรึงมุมจอ' : 'เกาะติดชื่อ/หน้าเว็บ'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedStickerId(null);
                    setShowAdvancedMenu(false);
                  }}
                  className="p-1 rounded-lg hover:bg-slate-800 text-zinc-400 hover:text-white cursor-pointer"
                  title="ปิดแถบควบคุม"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Action Buttons Row */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
              {/* Size Adjustment */}
              <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                <span className="text-[10px] text-zinc-400 font-bold">ขนาด:</span>
                <button
                  type="button"
                  onClick={() => handleResize(selectedSticker.id, -8)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-zinc-300 hover:text-white cursor-pointer"
                  title="ย่อขนาด"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono font-bold text-amber-300 min-w-[24px] text-center">
                  {selectedSticker.size || 44}
                </span>
                <button
                  type="button"
                  onClick={() => handleResize(selectedSticker.id, 8)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-zinc-300 hover:text-white cursor-pointer"
                  title="ขยายขนาด"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Rotate Adjustment */}
              <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800">
                <span className="text-[10px] text-zinc-400 font-bold">หมุน:</span>
                <button
                  type="button"
                  onClick={() => handleRotate(selectedSticker.id, -15)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-amber-400 cursor-pointer"
                  title="หมุนซ้าย 15°"
                >
                  <span className="text-[10px] font-black">-15°</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRotate(selectedSticker.id, 15)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-amber-400 cursor-pointer"
                  title="หมุนขวา 15°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                {selectedSticker.rotation !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleUpdateSingleSticker(selectedSticker.id, { rotation: 0 })}
                    className="text-[9px] px-1 py-0.5 rounded bg-slate-800 text-zinc-400 hover:text-white cursor-pointer"
                    title="รีเซ็ตเป็น 0 องศา"
                  >
                    0°
                  </button>
                )}
              </div>

              {/* Duplicate & Advanced Toggle */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleDuplicate(selectedSticker)}
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 hover:text-sky-200 border border-slate-800 cursor-pointer"
                  title="คัดลอกชิ้นนี้"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdvancedMenu(!showAdvancedMenu)}
                  className={`p-1.5 rounded-xl border cursor-pointer transition-colors ${
                    showAdvancedMenu
                      ? 'bg-purple-600 text-white border-purple-400'
                      : 'bg-slate-900 text-zinc-300 border-slate-800 hover:text-white'
                  }`}
                  title="ปรับแต่งแอนิเมชัน & กรอบวิบวับ"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(selectedSticker.id)}
                  className="p-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/80 cursor-pointer"
                  title="ลบของตกแต่งนี้"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Expandable Advanced Decor Options */}
            {showAdvancedMenu && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-2.5 pt-2.5 border-t border-slate-800 space-y-2 text-xs"
              >
                {/* Animation FX */}
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 block mb-1">
                    ✨ แอนิเมชันการเคลื่อนไหว:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: 'none' as DecorationAnimation, label: 'นิ่งสนิท' },
                      { id: 'float' as DecorationAnimation, label: '🎈 ลอยดุ๊กดิ๊ก' },
                      { id: 'bounce' as DecorationAnimation, label: '🦘 กระโดด' },
                      { id: 'pulse' as DecorationAnimation, label: '💫 ส่องแสงวิบวับ' },
                      { id: 'spin-slow' as DecorationAnimation, label: '🎡 หมุนเอื่อยๆ' },
                    ].map((fx) => (
                      <button
                        key={fx.id}
                        type="button"
                        onClick={() => handleUpdateSingleSticker(selectedSticker.id, { animation: fx.id })}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                          (selectedSticker.animation || 'none') === fx.id
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-900 text-zinc-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {fx.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Border / Glow Style */}
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 block mb-1">
                    🖼️ กรอบ & แสงเรืองรอง:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {[
                      { id: 'none' as DecorationBorder, label: 'ไม่มีกรอบ' },
                      { id: 'gold' as DecorationBorder, label: '👑 ทองคำ' },
                      { id: 'neon' as DecorationBorder, label: '⚡ นีออนไซเบอร์' },
                      { id: 'rainbow' as DecorationBorder, label: '🌈 โฮโลแกรม' },
                      { id: 'glass' as DecorationBorder, label: '💎 กระจกใส' },
                      { id: 'circle' as DecorationBorder, label: '⭕ กรอบกลม' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleUpdateSingleSticker(selectedSticker.id, { borderStyle: b.id })}
                        className={`px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-all ${
                          (selectedSticker.borderStyle || 'none') === b.id
                            ? 'bg-amber-500 text-black font-black'
                            : 'bg-slate-900 text-zinc-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Opacity Slider */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-bold text-zinc-400 min-w-[65px]">
                    ความโปร่งใส:
                  </span>
                  <input
                    type="range"
                    min="0.2"
                    max="1"
                    step="0.05"
                    value={selectedSticker.opacity ?? 1}
                    onChange={(e) =>
                      handleUpdateSingleSticker(selectedSticker.id, {
                        opacity: parseFloat(e.target.value),
                      })
                    }
                    className="flex-1 accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] font-mono font-bold text-zinc-300 w-8 text-right">
                    {Math.round((selectedSticker.opacity ?? 1) * 100)}%
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Floating Master Control Pill (Bottom Right Corner) */}
      <div className="fixed bottom-6 right-4 z-40 pointer-events-auto flex items-center gap-1.5 bg-slate-950/95 border-2 border-purple-800/80 p-1.5 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.8)] backdrop-blur-md">
        {/* Open DIY Studio / Add Decoration */}
        <button
          type="button"
          onClick={onOpenStickerPicker}
          className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-black flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
          title="สตูดิโอตกแต่ง & แปะรูปภาพ/สติกเกอร์/ป้ายชื่อ"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span className="font-black">ตกแต่ง & รูปภาพ</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-bold">
            {localStickers.length}
          </span>
        </button>

        {localStickers.length > 0 && (
          <>
            {/* Global Lock / Unlock Button (Crucial for freezing items above member names) */}
            <button
              type="button"
              onClick={onToggleLock}
              className={`px-2.5 py-1.5 rounded-full transition-all text-xs font-black flex items-center gap-1 cursor-pointer border ${
                lockStickers
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600 shadow-md shadow-emerald-950/50'
                  : 'bg-amber-950 text-amber-300 border-amber-600 animate-pulse shadow-md shadow-amber-950/50'
              }`}
              title={
                lockStickers
                  ? '🔒 ล็อกตำแหน่งแล้ว — ตรึงแน่นไม่ขยับ (กดปุ่มและใช้งานแอปได้ตามปกติ)'
                  : '🔓 โหมดขยับ — แตะลากย้ายตำแหน่งและปรับแต่งได้'
              }
            >
              {lockStickers ? <Lock className="w-3.5 h-3.5 text-emerald-400" /> : <Unlock className="w-3.5 h-3.5 text-amber-400" />}
              <span className="hidden sm:inline">
                {lockStickers ? 'ล็อกตำแหน่งแล้ว' : 'โหมดลากย้าย'}
              </span>
            </button>

            {/* Toggle Show / Hide */}
            <button
              type="button"
              onClick={onToggleShow}
              className="p-1.5 rounded-full bg-slate-900 text-zinc-400 hover:text-white border border-slate-800 transition-all cursor-pointer"
              title={showStickers ? 'ซ่อนของตกแต่งชั่วคราว' : 'แสดงของตกแต่ง'}
            >
              {showStickers ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </button>
          </>
        )}
      </div>
    </>
  );
};
