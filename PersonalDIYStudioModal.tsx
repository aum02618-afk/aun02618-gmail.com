import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PersonalDIYConfig,
  PersonalSticker,
  STICKER_PACKS,
  PRESET_DECO_IMAGES,
  PRESET_NAME_BADGES,
  PersonalFontFamily,
  PersonalBgPattern,
  PersonalCardStyle,
  PersonalAvatarBorder,
  DEFAULT_PERSONAL_DIY,
  DecorationAnchor,
  DecorationAnimation,
  DecorationBorder,
} from '../types/personalTheme';
import {
  Palette,
  MessageSquare,
  Sparkles,
  Type,
  BadgePercent,
  X,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Check,
  RotateCcw,
  Pipette,
  ShieldCheck,
  Smartphone,
  Eye,
  Sliders,
  Smile,
  Image as ImageIcon,
  Upload,
  Link,
  Tag,
  Anchor,
  Copy,
  Layers,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';

interface PersonalDIYStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  diyConfig: PersonalDIYConfig;
  onUpdateDIYConfig: (updates: Partial<PersonalDIYConfig>) => void;
  stickers: PersonalSticker[];
  onUpdateStickers: (stickers: PersonalSticker[]) => void;
  currentThemeContent?: React.ReactNode;
  currentUser?: string | null;
}

export const PersonalDIYStudioModal: React.FC<PersonalDIYStudioModalProps> = ({
  isOpen,
  onClose,
  diyConfig = DEFAULT_PERSONAL_DIY,
  onUpdateDIYConfig = (_updates: Partial<PersonalDIYConfig>) => {},
  stickers = [],
  onUpdateStickers = (_stickers: PersonalSticker[]) => {},
  currentThemeContent,
  currentUser,
}) => {
  const activeConfig: PersonalDIYConfig = {
    ...DEFAULT_PERSONAL_DIY,
    ...(diyConfig || {}),
    chatBubble: {
      ...DEFAULT_PERSONAL_DIY.chatBubble,
      ...(diyConfig?.chatBubble || {}),
    },
  };

  const [activeTab, setActiveTab] = useState<'stickers' | 'chat' | 'font_pattern' | 'identity' | 'theme'>('stickers');
  const [stickerSubTab, setStickerSubTab] = useState<'emoji' | 'images' | 'badges' | 'manage'>('emoji');
  const [selectedPackId, setSelectedPackId] = useState<string>('crowns_ranks');
  const [customEmojiInput, setCustomEmojiInput] = useState<string>('');
  const [customImageUrlInput, setCustomImageUrlInput] = useState<string>('');
  
  // Custom Badge Creator state
  const [customBadgeText, setCustomBadgeText] = useState<string>('');
  const [customBadgeIcon, setCustomBadgeIcon] = useState<string>('👑');
  const [customBadgeBg, setCustomBadgeBg] = useState<string>('#f59e0b');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAddSticker = (emoji: string, label?: string) => {
    const newSticker: PersonalSticker = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'emoji',
      icon: emoji,
      x: 35 + Math.random() * 30, // Centered placement
      y: 35 + Math.random() * 30,
      size: 44,
      rotation: Math.floor(Math.random() * 16) - 8,
      opacity: 1,
      label: label || emoji,
      anchor: 'page', // Default: scrolls with page content (perfect for member names)
      isLocked: false,
    };

    onUpdateStickers([...stickers, newSticker]);
    toast.success(`✨ แปะสติกเกอร์ "${emoji}" แล้ว! (ลากไปวางเหนือชื่อสมาชิกหรือส่วนที่ต้องการได้เลย)`);
  };

  const handleAddImageSticker = (imageUrl: string, label: string, size = 56) => {
    if (!imageUrl.trim()) return;
    const newSticker: PersonalSticker = {
      id: `img-deco-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'image',
      icon: '🖼️',
      imageUrl: imageUrl.trim(),
      x: 35 + Math.random() * 30,
      y: 35 + Math.random() * 30,
      size: size,
      rotation: 0,
      opacity: 1,
      label: label,
      anchor: 'page',
      isLocked: false,
    };

    onUpdateStickers([...stickers, newSticker]);
    toast.success(`🖼️ แปะรูปภาพ "${label}" บนหน้าจอแล้ว! (ลากย้ายตำแหน่งได้ตามใจ)`);
  };

  const handleAddBadgeSticker = (text: string, bg: string, icon = '👑', label = '') => {
    if (!text.trim()) return;
    const newSticker: PersonalSticker = {
      id: `badge-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'badge',
      icon: icon,
      text: text.trim(),
      bgColor: bg,
      textColor: '#ffffff',
      x: 40 + Math.random() * 20,
      y: 40 + Math.random() * 20,
      size: 48,
      rotation: 0,
      opacity: 1,
      label: label || text,
      anchor: 'page',
      isLocked: false,
      borderStyle: 'gold',
    };

    onUpdateStickers([...stickers, newSticker]);
    toast.success(`🏷️ แปะป้ายชื่อ "${text}" แล้ว! (ลากไปติดเหนือชื่อสมาชิกได้ทันที)`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('กรุณาเลือกไฟล์รูปภาพ (PNG, JPG, WebP, GIF)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        // Compress / resize image if needed
        const img = new Image();
        img.onload = () => {
          const maxDim = 320;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const compressedUrl = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.85);
            handleAddImageSticker(compressedUrl, file.name.slice(0, 15), 64);
          } else {
            handleAddImageSticker(result, file.name.slice(0, 15), 64);
          }
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const handleClearAllStickers = () => {
    onUpdateStickers([]);
    toast.info('ลบของตกแต่งทั้งหมดบนหน้าจอแล้ว');
  };

  const handleResetToDefault = () => {
    onUpdateDIYConfig({
      fontFamily: 'kanit',
      bgPattern: 'stars',
      cardStyle: 'glass',
      avatarBorder: 'rainbow',
      chatBubble: {
        myBubbleBg: '#6366f1',
        myTextColor: '#ffffff',
        otherBubbleBg: '#1e293b',
        otherTextColor: '#e2e8f0',
        bubbleRadius: 'lg',
        bubbleGlow: true,
        fontSize: 'sm',
      },
    });
    toast.success('รีเซ็ตการตกแต่งกลับสู่ค่าเริ่มต้นแล้ว ✨');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.95 }}
        className="w-full max-w-2xl bg-slate-950 border border-purple-900/60 rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white"
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 border-b border-purple-900/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-950/80 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-200 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">สตูดิโอตกแต่งแอป & รูปภาพส่วนตัว</h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-pink-500/20 text-pink-300 border border-pink-500/40">
                  เครื่องนี้เท่านั้น
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-bold">
                แปะรูปภาพ สติกเกอร์ มงกุฎติดชื่อสมาชิก • ล็อกตำแหน่งให้อยู่กับที่ได้ 🔒
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-zinc-400 hover:text-white border border-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Device-Only Privacy Notice Banner */}
        <div className="px-4 py-2 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/70 border-b border-emerald-900/40 flex items-center justify-between text-[11px] font-bold text-emerald-200">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              🔒 สไตล์ส่วนตัวของคุณ <strong>({currentUser || 'ผู้ใช้ปัจจุบัน'})</strong> บันทึกเฉพาะเครื่องนี้ ไม่กระทบคนอื่น
            </span>
          </div>
          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-[10px] text-zinc-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>คืนค่าเดิม</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center bg-slate-900/90 p-1.5 border-b border-slate-800 gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'stickers' as const, label: '✨ ของตกแต่ง & รูปภาพ', count: stickers.length },
            { id: 'chat' as const, label: '💬 กล่องข้อความ & แชท' },
            { id: 'font_pattern' as const, label: '🔤 ฟอนต์ & ลวดลาย' },
            { id: 'identity' as const, label: '👑 ฉายา & กรอบรูป' },
            { id: 'theme' as const, label: '🎨 สีธีมหลัก' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && tab.count > 0 && (
                <span className="text-[9px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {/* TAB 1: STICKERS & IMAGES DECORATION STUDIO */}
          {activeTab === 'stickers' && (
            <div className="space-y-4">
              {/* Top Lock & Freeze Status Banner */}
              <div className="p-3.5 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 rounded-2xl border border-purple-800/50 flex items-center justify-between flex-wrap gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-300">
                      📍 ของตกแต่งที่ติดอยู่: {stickers.length} ชิ้น
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-black border ${
                        activeConfig.lockStickers
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                          : 'bg-amber-950 text-amber-300 border-amber-600'
                      }`}
                    >
                      {activeConfig.lockStickers ? '🔒 ตรึงแน่นอยู่กับที่' : '🔓 โหมดลากย้าย/ปรับแต่ง'}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-medium">
                    {activeConfig.lockStickers
                      ? 'สติกเกอร์จะล็อกนิ่งเหนือชื่อสมาชิก/การ์ด และคลิกทะลุได้ 100%'
                      : 'แตะลากย้ายตำแหน่ง ย่อ-ขยาย หรือหมุนองศาบนหน้าจอได้ตามใจ'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const nextLock = !activeConfig.lockStickers;
                      onUpdateDIYConfig({ lockStickers: nextLock });
                      toast.success(
                        nextLock
                          ? '🔒 ล็อกตำแหน่งแล้ว — ของตกแต่งจะไม่ขยับและกดปุ่มด้านล่างได้ปกติ'
                          : '🔓 ปลดล็อก — สามารถแตะลากย้ายของตกแต่งได้แล้ว'
                      );
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all border shadow-md ${
                      activeConfig.lockStickers
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
                        : 'bg-amber-500 hover:bg-amber-400 text-black border-amber-300'
                    }`}
                  >
                    {activeConfig.lockStickers ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    <span>{activeConfig.lockStickers ? 'ล็อกตำแหน่งแล้ว' : 'กดเพื่อล็อกแน่น'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateDIYConfig({ showStickers: !activeConfig.showStickers })}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-zinc-300 cursor-pointer border border-slate-700"
                    title={activeConfig.showStickers ? 'ซ่อนของตกแต่ง' : 'แสดงของตกแต่ง'}
                  >
                    {activeConfig.showStickers ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4 opacity-40" />}
                  </button>

                  {stickers.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAllStickers}
                      className="p-2 rounded-xl bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 cursor-pointer"
                      title="ลบของตกแต่งทั้งหมด"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Sub-Tabs: [อิโมจิ, รูปภาพ/GIF, ป้ายชื่อสมาชิก, จัดการชิ้นงาน] */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {[
                  { id: 'emoji' as const, label: '👑 สติกเกอร์ & มงกุฎ', icon: '👑' },
                  { id: 'images' as const, label: '🖼️ แปะรูปภาพ & GIF', icon: '🖼️' },
                  { id: 'badges' as const, label: '🏷️ ป้ายฉายา & ชื่อ', icon: '🏷️' },
                  { id: 'manage' as const, label: `📋 รายการ (${stickers.length})`, icon: '📋' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStickerSubTab(st.id)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                      stickerSubTab === st.id
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>{st.icon}</span>
                    <span>{st.label}</span>
                  </button>
                ))}
              </div>

              {/* SUBTAB 1: EMOJI STICKERS */}
              {stickerSubTab === 'emoji' && (
                <div className="space-y-3">
                  {/* Custom Emoji Sticker Input */}
                  <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800 flex items-center gap-2">
                    <Smile className="w-4 h-4 text-pink-400 shrink-0" />
                    <input
                      type="text"
                      placeholder="พิมพ์อิโมจิหรือข้อความ เช่น 👑, 😻, หรือ MVP..."
                      value={customEmojiInput}
                      onChange={(e) => setCustomEmojiInput(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customEmojiInput.trim()) {
                          handleAddSticker(customEmojiInput.trim());
                          setCustomEmojiInput('');
                        }
                      }}
                      disabled={!customEmojiInput.trim()}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-black text-xs cursor-pointer transition-all flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>แปะ</span>
                    </button>
                  </div>

                  {/* Sticker Packs Category Tabs */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {STICKER_PACKS.map((pack) => (
                      <button
                        key={pack.id}
                        type="button"
                        onClick={() => setSelectedPackId(pack.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 border ${
                          selectedPackId === pack.id
                            ? 'bg-gradient-to-r from-pink-600 to-purple-600 border-pink-400 text-white shadow-md'
                            : 'bg-slate-900/80 border-slate-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <span>{pack.icon}</span>
                        <span>{pack.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Stickers Grid */}
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 p-3 bg-slate-900/50 rounded-2xl border border-slate-800 max-h-[260px] overflow-y-auto custom-scrollbar">
                    {STICKER_PACKS.find((p) => p.id === selectedPackId)?.items.map((item) => (
                      <button
                        key={item.emoji + item.name}
                        type="button"
                        onClick={() => handleAddSticker(item.emoji, item.name)}
                        className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 hover:border-pink-500 hover:bg-slate-900/90 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer hover:scale-110 active:scale-95 group shadow-sm"
                      >
                        <span className="text-2xl filter drop-shadow-md group-hover:animate-bounce">
                          {item.emoji}
                        </span>
                        <span className="text-[9px] font-bold text-zinc-400 truncate w-full text-center group-hover:text-zinc-200">
                          {item.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBTAB 2: IMAGES & GIFS DECORATIONS */}
              {stickerSubTab === 'images' && (
                <div className="space-y-4">
                  {/* Upload Image from device */}
                  <div className="p-4 bg-slate-900/80 rounded-2xl border border-purple-800/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4 text-pink-400" />
                        <span className="text-xs font-black text-white">อัปโหลดรูปภาพ / GIF จากเครื่องของคุณ</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-bold">PNG, JPG, WebP, GIF</span>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-purple-600/60 hover:border-purple-400 bg-purple-950/20 hover:bg-purple-950/40 text-purple-200 font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
                    >
                      <ImageIcon className="w-4 h-4 text-pink-400" />
                      <span>แตะเพื่อเลือกรูปภาพ / สติกเกอร์โปร่งใสจากมือถือหรือคอมพิวเตอร์</span>
                    </button>
                  </div>

                  {/* Paste Image URL / GIF Link */}
                  <div className="p-3 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-black text-white">
                      <Link className="w-3.5 h-3.5 text-sky-400" />
                      <span>หรือวางลิงก์รูปภาพ / Animated GIF:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        placeholder="วางลิงก์รูป เช่น https://example.com/sticker.png หรือ GIF..."
                        value={customImageUrlInput}
                        onChange={(e) => setCustomImageUrlInput(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 font-medium focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customImageUrlInput.trim()) {
                            handleAddImageSticker(customImageUrlInput, 'รูปจากลิงก์');
                            setCustomImageUrlInput('');
                          }
                        }}
                        disabled={!customImageUrlInput.trim()}
                        className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-black text-xs cursor-pointer transition-all"
                      >
                        แปะรูป
                      </button>
                    </div>
                  </div>

                  {/* Preset Aesthetic Artwork / Badges */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-black text-zinc-300 block">
                      ✨ รูปภาพ & สติกเกอร์สำเร็จรูปยอดนิยม:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {PRESET_DECO_IMAGES.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleAddImageSticker(item.url, item.name, item.defaultSize)}
                          className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-purple-500 hover:bg-slate-900 transition-all flex items-center gap-2.5 text-left cursor-pointer group shadow-sm"
                        >
                          <img
                            src={item.url}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-xl object-cover border border-white/10 group-hover:scale-105 transition-transform"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[11px] font-black text-white truncate block">
                              {item.name}
                            </span>
                            <span className="text-[9px] text-zinc-400 font-bold">แตะเพื่อแปะ</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 3: NAME BADGES & TITLES */}
              {stickerSubTab === 'badges' && (
                <div className="space-y-4">
                  {/* Preset Name Tags */}
                  <div className="space-y-2">
                    <span className="text-xs font-black text-zinc-300 block">
                      👑 ป้ายฉายายอดฮิต (แตะเพื่อแปะติดชื่อสมาชิกทันที):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PRESET_NAME_BADGES.map((badge) => (
                        <button
                          key={badge.text}
                          type="button"
                          onClick={() => handleAddBadgeSticker(badge.text, badge.bg, badge.text.slice(0, 2), badge.label)}
                          className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-400 hover:bg-slate-900 transition-all flex flex-col items-start gap-1 cursor-pointer group"
                        >
                          <div
                            className="px-2 py-0.5 rounded-full text-[11px] font-black shadow-md border border-white/20"
                            style={{ backgroundColor: badge.bg, color: badge.textCol }}
                          >
                            {badge.text}
                          </div>
                          <span className="text-[9px] text-zinc-400 font-bold group-hover:text-amber-300">
                            {badge.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Name Badge Maker */}
                  <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
                    <span className="text-xs font-black text-white flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-amber-400" />
                      <span>สร้างป้ายฉายาหรือป้ายชื่อแบบกำหนดเอง:</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="ไอคอน เช่น 👑 หรือ ☕"
                        value={customBadgeIcon}
                        onChange={(e) => setCustomBadgeIcon(e.target.value)}
                        className="w-16 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-center text-sm text-white"
                      />
                      <input
                        type="text"
                        placeholder="ข้อความฉายา เช่น เซียนต้มหม้อทองคำ..."
                        value={customBadgeText}
                        onChange={(e) => setCustomBadgeText(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-500 font-bold focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    {/* Color Swatches */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-400 font-bold">สีป้าย:</span>
                      {['#f59e0b', '#06b6d4', '#10b981', '#8b5cf6', '#ec4899', '#ef4444', '#3b82f6'].map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setCustomBadgeBg(col)}
                          className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                            customBadgeBg === col ? 'ring-2 ring-white scale-110 shadow-md' : 'opacity-70 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (customBadgeText.trim()) {
                          handleAddBadgeSticker(
                            `${customBadgeIcon} ${customBadgeText.trim()}`,
                            customBadgeBg,
                            customBadgeIcon,
                            customBadgeText
                          );
                          setCustomBadgeText('');
                        }
                      }}
                      disabled={!customBadgeText.trim()}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-black font-black text-xs cursor-pointer shadow-md transition-all active:scale-[0.99]"
                    >
                      แปะป้ายชื่อนี้ลงบนหน้าจอ ✨
                    </button>
                  </div>
                </div>
              )}

              {/* SUBTAB 4: MANAGE PLACED ITEMS */}
              {stickerSubTab === 'manage' && (
                <div className="space-y-3">
                  {stickers.length === 0 ? (
                    <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-2">
                      <Sparkles className="w-8 h-8 text-zinc-600 mx-auto" />
                      <p className="text-xs text-zinc-400 font-bold">ยังไม่มีของตกแต่งบนหน้าจอ</p>
                      <p className="text-[10px] text-zinc-500">
                        เลือกสติกเกอร์ รูปภาพ หรือป้ายชื่อจากแท็บด้านบนเพื่อเริ่มตกแต่ง
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {stickers.map((s, idx) => (
                        <div
                          key={s.id}
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-xs font-mono text-zinc-500 font-bold w-4">
                              {idx + 1}.
                            </span>
                            {s.imageUrl ? (
                              <img
                                src={s.imageUrl}
                                alt="thumb"
                                referrerPolicy="no-referrer"
                                className="w-7 h-7 rounded-lg object-contain bg-slate-950 border border-white/10"
                              />
                            ) : (
                              <span className="text-lg">{s.icon}</span>
                            )}
                            <div className="min-w-0">
                              <span className="text-xs font-black text-white truncate block">
                                {s.label || s.text || s.icon}
                              </span>
                              <span className="text-[9px] text-zinc-400 font-mono">
                                ขนาด: {s.size}px • หมุน: {s.rotation || 0}° • {s.anchor === 'screen' ? 'ตรึงจอ' : 'เกาะติดหน้าเว็บ'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Toggle Lock on item */}
                            <button
                              type="button"
                              onClick={() => {
                                const next = stickers.map((item) =>
                                  item.id === s.id ? { ...item, isLocked: !item.isLocked } : item
                                );
                                onUpdateStickers(next);
                                toast.success(
                                  !s.isLocked ? '🔒 ล็อกของชิ้นนี้แล้ว' : '🔓 ปลดล็อกของชิ้นนี้'
                                );
                              }}
                              className={`p-1.5 rounded-lg border cursor-pointer ${
                                s.isLocked
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                  : 'bg-slate-800 text-zinc-400 hover:text-white border-slate-700'
                              }`}
                              title={s.isLocked ? 'ล็อกตำแหน่งอยู่' : 'ปลดล็อกอยู่'}
                            >
                              {s.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                            </button>

                            {/* Delete single item */}
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateStickers(stickers.filter((item) => item.id !== s.id));
                                toast.info('ลบของตกแต่งชิ้นนี้แล้ว');
                              }}
                              className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 cursor-pointer"
                              title="ลบชิ้นนี้"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CHAT BUBBLES & TEXT COLORS */}
          {activeTab === 'chat' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-indigo-950/40 rounded-2xl border border-indigo-800/40 flex items-center gap-2 text-xs text-indigo-200">
                <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  ตกแต่งสีกล่องข้อความ สีตัวหนังสือ และเงาเรืองแสงของข้อความในแอปได้ตามใจชอบ
                </span>
              </div>

              {/* Live Chat Bubble Preview */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                  ตัวอย่างการแสดงผลกล่องข้อความ (Live Preview):
                </span>

                <div className="space-y-3">
                  {/* Other's Message */}
                  <div className="flex items-start gap-2 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-black shrink-0">
                      แป้ง
                    </div>
                    <div
                      className={`p-3 transition-all ${
                        activeConfig.chatBubble.bubbleRadius === 'sm'
                          ? 'rounded-md'
                          : activeConfig.chatBubble.bubbleRadius === 'md'
                          ? 'rounded-xl'
                          : activeConfig.chatBubble.bubbleRadius === 'full'
                          ? 'rounded-3xl'
                          : 'rounded-2xl'
                      } ${
                        activeConfig.chatBubble.bubbleGlow
                          ? 'shadow-[0_0_15px_rgba(30,41,59,0.5)] border border-white/10'
                          : ''
                      }`}
                      style={{
                        backgroundColor: activeConfig.chatBubble.otherBubbleBg,
                        color: activeConfig.chatBubble.otherTextColor,
                      }}
                    >
                      <p className="text-xs font-bold leading-relaxed">
                        วันนี้ต้มหม้อสมุนไพรเสร็จแล้วนะ ใครมากินบ้าง? 🍲
                      </p>
                      <span className="text-[9px] opacity-60 mt-1 block">12:30 น.</span>
                    </div>
                  </div>

                  {/* My Message */}
                  <div className="flex items-end justify-end gap-2">
                    <div
                      className={`p-3 transition-all max-w-[85%] ${
                        activeConfig.chatBubble.bubbleRadius === 'sm'
                          ? 'rounded-md'
                          : activeConfig.chatBubble.bubbleRadius === 'md'
                          ? 'rounded-xl'
                          : activeConfig.chatBubble.bubbleRadius === 'full'
                          ? 'rounded-3xl'
                          : 'rounded-2xl'
                      } ${
                        activeConfig.chatBubble.bubbleGlow
                          ? 'shadow-[0_0_20px_rgba(99,102,241,0.5)] border border-white/20'
                          : ''
                      }`}
                      style={{
                        backgroundColor: activeConfig.chatBubble.myBubbleBg,
                        color: activeConfig.chatBubble.myTextColor,
                      }}
                    >
                      <p className="text-xs font-bold leading-relaxed">
                        โอนเงินค่าน้ำต้มเรียบร้อยแล้วจ้า แนบสลิปแล้วนะ ✨
                      </p>
                      <span className="text-[9px] opacity-75 mt-1 block text-right">12:32 น.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chat Customization Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* My Bubble Background */}
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-xs font-black text-white block">
                    🎨 สีพื้นหลังข้อความของฉัน:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={activeConfig.chatBubble.myBubbleBg}
                      onChange={(e) =>
                        onUpdateDIYConfig({
                          chatBubble: { ...activeConfig.chatBubble, myBubbleBg: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={activeConfig.chatBubble.myBubbleBg}
                      onChange={(e) =>
                        onUpdateDIYConfig({
                          chatBubble: { ...activeConfig.chatBubble, myBubbleBg: e.target.value },
                        })
                      }
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                {/* My Bubble Text Color */}
                <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-xs font-black text-white block">
                    ✏️ สีตัวหนังสือของฉัน:
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={activeConfig.chatBubble.myTextColor}
                      onChange={(e) =>
                        onUpdateDIYConfig({
                          chatBubble: { ...activeConfig.chatBubble, myTextColor: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={activeConfig.chatBubble.myTextColor}
                      onChange={(e) =>
                        onUpdateDIYConfig({
                          chatBubble: { ...activeConfig.chatBubble, myTextColor: e.target.value },
                        })
                      }
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FONT & BACKGROUND PATTERNS */}
          {activeTab === 'font_pattern' && (
            <div className="space-y-4">
              {/* Font Family Selection */}
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-black text-white flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-purple-400" />
                  <span>1. รูปแบบฟอนต์ตัวอักษรทั้งแอป (Font Style):</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'kanit' as PersonalFontFamily, name: 'Kanit (คณิต)', preview: 'กขค ทันสมัย' },
                    { id: 'prompt' as PersonalFontFamily, name: 'Prompt (พร้อมท์)', preview: 'โมเดิร์นคลีน' },
                    { id: 'mitr' as PersonalFontFamily, name: 'Mitr (มิตร)', preview: 'เรียบหรู' },
                    { id: 'itim' as PersonalFontFamily, name: 'Itim (ไอติม)', preview: 'น่ารัก กวนๆ' },
                    { id: 'chonburi' as PersonalFontFamily, name: 'Chonburi (ชลบุรี)', preview: 'หัวข้อเด่นชัด' },
                    { id: 'sarabun' as PersonalFontFamily, name: 'Sarabun (สารบรรณ)', preview: 'ทางการอ่านง่าย' },
                  ].map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => onUpdateDIYConfig({ fontFamily: font.id })}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        activeConfig.fontFamily === font.id
                          ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-black block">{font.name}</span>
                      <span className="text-[10px] opacity-70 block mt-1">{font.preview}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Pattern */}
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-black text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <span>2. ลวดลายกราฟิกพื้นหลัง (Background Pattern Overlay):</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'stars' as PersonalBgPattern, name: '✨ ละอองดาว (Stars)', desc: 'ประกายดาววิบวับ' },
                    { id: 'grid' as PersonalBgPattern, name: '📐 ไซเบอร์กริด (Grid)', desc: 'ตารางสไตล์เกมมิ่ง' },
                    { id: 'dots' as PersonalBgPattern, name: '⚪ จุดโพลก้าดอท (Dots)', desc: 'จุดกระจายมินิมอล' },
                    { id: 'sakura' as PersonalBgPattern, name: '🌸 กลีบซากุระ (Sakura)', desc: 'กลีบดอกไม้หวาน' },
                    { id: 'bubbles' as PersonalBgPattern, name: '🫧 ฟองคลื่นน้ำ (Bubbles)', desc: 'ฟองอากาศสดชื่น' },
                    { id: 'none' as PersonalBgPattern, name: '🚫 เรียบเนียน (None)', desc: 'ไม่มีลวดลาย' },
                  ].map((pat) => (
                    <button
                      key={pat.id}
                      type="button"
                      onClick={() => onUpdateDIYConfig({ bgPattern: pat.id })}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        activeConfig.bgPattern === pat.id
                          ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                          : 'bg-slate-950 border-slate-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-black block">{pat.name}</span>
                      <span className="text-[10px] opacity-70 block mt-1">{pat.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: IDENTITY & AVATAR BORDER */}
          {activeTab === 'identity' && (
            <div className="space-y-4">
              {/* Custom Header Title / Badge */}
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-black text-white flex items-center gap-1.5">
                  <BadgePercent className="w-4 h-4 text-amber-400" />
                  <span>1. ป้ายฉายาส่วนตัวหัวแอป (Custom Title / Badge):</span>
                </span>
                <input
                  type="text"
                  placeholder="เช่น ✨ สไตล์ของบัง / 🍵 คลังต้มสูตรเด็ด..."
                  value={activeConfig.customBadge}
                  onChange={(e) => onUpdateDIYConfig({ customBadge: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-zinc-500 font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Avatar Aura / Border Frame */}
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-black text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>2. กรอบออร่าโปรไฟล์ของฉัน (Personal Avatar Halo Frame):</span>
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'rainbow' as PersonalAvatarBorder, name: '🌈 สเปกตรัมรุ้ง', class: 'ring-4 ring-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.5)]' },
                    { id: 'gold' as PersonalAvatarBorder, name: '👑 มงกุฎทองคำ', class: 'ring-4 ring-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]' },
                    { id: 'neon' as PersonalAvatarBorder, name: '⚡ นีออนไซอัน', class: 'ring-4 ring-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]' },
                    { id: 'blossom' as PersonalAvatarBorder, name: '🌸 ซากุระบลอสซั่ม', class: 'ring-4 ring-rose-400 shadow-[0_0_20px_rgba(251,113,133,0.5)]' },
                    { id: 'cyber' as PersonalAvatarBorder, name: '👾 ไซเบอร์เพอร์เพิล', class: 'ring-4 ring-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]' },
                    { id: 'diamond' as PersonalAvatarBorder, name: '💎 ประกายเพชร', class: 'ring-4 ring-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.5)]' },
                  ].map((border) => {
                    const isSelected = activeConfig.avatarBorder === border.id;
                    return (
                      <button
                        key={border.id}
                        type="button"
                        onClick={() => {
                          onUpdateDIYConfig({ avatarBorder: border.id });
                          toast.success(`เลือกกรอบโปรไฟล์ "${border.name}" แล้ว!`);
                        }}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                          isSelected
                            ? 'bg-slate-900 border-amber-400 ring-2 ring-amber-400/40 text-white shadow-md'
                            : 'bg-slate-950 border-slate-800 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-black text-sm text-white ${border.class}`}>
                          {currentUser ? currentUser.charAt(0) : 'U'}
                        </div>
                        <span className="text-[11px] font-bold">{border.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: THEME PRESETS & DIY SWATCHES */}
          {activeTab === 'theme' && (
            <div className="space-y-4">
              {currentThemeContent}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>บันทึกอัตโนมัติลงในเบราว์เซอร์นี้ทันที</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-black text-xs shadow-lg shadow-purple-950/80 hover:opacity-95 cursor-pointer active:scale-95 transition-all"
          >
            เสร็จสิ้น (บันทึกแล้ว) ✨
          </button>
        </div>
      </motion.div>
    </div>
  );
};
