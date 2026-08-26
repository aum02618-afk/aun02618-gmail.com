import React, { useState, useEffect, useMemo, useRef } from 'react';
import { onSnapshot, collection, query, addDoc, updateDoc, deleteDoc, doc, setDoc, serverTimestamp, orderBy, getDocFromServer, writeBatch } from 'firebase/firestore';
import { db, storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  Search,
  Plus, 
  Users, 
  Utensils, 
  Droplets,
  Zap,
  Flame,
  CreditCard, 
  Trash2, 
  CheckCircle2, 
  History, 
  Settings, 
  X, 
  Copy, 
  ChevronRight,
  AlertCircle,
  Share2,
  PencilLine,
  Image as ImageIcon,
  Upload,
  Filter,
  Calendar,
  Ticket,
  Check,
  RefreshCw,
  MessageSquare,
  HelpCircle,
  UserCheck,
  Camera,
  ShieldCheck,
  Bot,
  Sparkles,
  Send,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  QrCode,
  Download,
  Smartphone,
  CheckSquare,
  Square,
  Layers,
  XCircle,
  RotateCcw,
  Clock,
  PieChart as PieChartIcon,
  Trophy,
  Crown,
  Award,
  ChefHat,
  Palette,
  Sun,
  Moon,
  Paintbrush,
  Sliders,
  Pipette,
  Dices,
  Bookmark,
  Sparkle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { cn } from './lib/utils';
import generatePayload from 'promptpay-qr';

import { Toaster, toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import appLogo from './assets/images/app_logo_1782041663296.jpg';
import { PersonalStickerOverlay } from './components/PersonalStickerOverlay';
import { PersonalDIYStudioModal } from './components/PersonalDIYStudioModal';
import {
  PersonalDIYConfig,
  PersonalSticker,
  DEFAULT_PERSONAL_DIY,
} from './types/personalTheme';

const DEFAULT_APP_LOGO = '/app_logo.jpg';

// --- Types ---
interface Person {
  id: string;
  name: string;
  photoUrl?: string;
  credit?: number;
  order?: number;
  createdAt: any;
}

interface Eater {
  name: string;
  weight: number;
}

interface FoodItem {
  id: string;
  name: string;
  price: number;
  eaters: Eater[];
  category?: 'food' | 'water' | 'electricity' | 'gas';
  isFreeMedicine?: boolean;
  createdAt: any;
  cook?: string;
  createdBy?: string;
}

interface Payment {
  id: string;
  personName: string;
  amount: number;
  timestamp: any;
  foodId?: string;
  slipUrl?: string;
  status?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: any;
  rejectedBy?: string;
  rejectedAt?: any;
}

interface BankInfo {
  name: string;
  no: string;
  user: string;
}

interface CreditRequest {
  id: string;
  personId: string;
  personName: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

export type ThemeCategory = 'all' | 'cyber' | 'dark' | 'pastel' | 'nature' | 'sunset';

export type AppTheme = 
  | 'dark' 
  | 'slate'
  | 'abyss'
  | 'red' 
  | 'purple'
  | 'matrix'
  | 'synthwave'
  | 'electric'
  | 'pink' 
  | 'lavender'
  | 'mint'
  | 'white' 
  | 'emerald' 
  | 'teal' 
  | 'coffee' 
  | 'yellow' 
  | 'sunset' 
  | 'ocean' 
  | 'berry'
  | 'custom';

export interface ThemeConfig {
  id: AppTheme;
  name: string;
  thaiName: string;
  emoji: string;
  description: string;
  badge: string;
  category: ThemeCategory;
  pageBg: string;
  containerBg: string;
  headerGradient: string;
  headerBorder: string;
  navActiveGradient: string;
  navActiveBorder: string;
  navGlowColor: string;
  navContainerBg: string;
  accentColor: string;
  accentText: string;
  badgeBg: string;
  buttonGradient: string;
  brandSubColor: string;
  swatchPrimary: string;
  swatchAccent: string;
  swatchCard: string;
  cardBorder: string;
  previewBg: string;
}

export interface SavedCustomPreset {
  id: string;
  name: string;
  accentColor: string;
  secondaryColor?: string;
  bgTone: 'pitch_black' | 'midnight' | 'navy' | 'forest' | 'burgundy' | 'slate' | 'light';
  glowIntensity: 'soft' | 'neon' | 'sharp';
}

export interface CustomThemeSettings {
  accentColor: string;
  secondaryColor?: string;
  bgTone: 'pitch_black' | 'midnight' | 'navy' | 'forest' | 'burgundy' | 'slate' | 'light';
  glowIntensity: 'soft' | 'neon' | 'sharp';
  savedSlots: SavedCustomPreset[];
}

export const THEMES: Record<AppTheme, ThemeConfig> = {
  dark: {
    id: 'dark',
    name: 'ดำคลาสสิก (Midnight Dark)',
    thaiName: 'ธีมสีดำ',
    emoji: '🖤',
    description: 'โทนสีดำเข้ม สบายตา คมชัด ทันสมัย มินิมอลเรียบหรูระดับโปร',
    badge: 'คลาสสิก / สบายตา',
    category: 'dark',
    pageBg: 'bg-[#09090b]',
    containerBg: 'bg-slate-950 text-slate-100 border-indigo-950/80',
    headerGradient: 'from-slate-950 via-zinc-950 to-indigo-950/80',
    headerBorder: 'border-indigo-900/60',
    navActiveGradient: 'from-indigo-600 via-indigo-700 to-sky-600',
    navActiveBorder: 'border-indigo-400/80',
    navGlowColor: 'shadow-indigo-950/90',
    navContainerBg: 'bg-slate-900/95 border-indigo-900/50',
    accentColor: 'indigo',
    accentText: 'text-indigo-400',
    badgeBg: 'bg-indigo-950/80 text-indigo-200 border-indigo-800/80 hover:bg-indigo-900/90',
    buttonGradient: 'from-indigo-600 via-indigo-700 to-sky-600',
    brandSubColor: 'text-indigo-500',
    swatchPrimary: '#020617',
    swatchAccent: '#6366f1',
    swatchCard: '#0f172a',
    cardBorder: 'border-indigo-900/40',
    previewBg: 'bg-slate-950'
  },
  slate: {
    id: 'slate',
    name: 'เทากราไฟต์ (Graphite Carbon)',
    thaiName: 'ธีมเทากราไฟต์',
    emoji: '🌑',
    description: 'โทนสีเทาดำกราไฟต์ โมเดิร์น คมกริบ เรียบหรูสไตล์สแกนดิเนเวียน',
    badge: 'มินิมอล / เท่ คม',
    category: 'dark',
    pageBg: 'bg-[#0b0f17]',
    containerBg: 'bg-[#111827] text-slate-100 border-slate-800',
    headerGradient: 'from-[#111827] via-[#1f2937] to-[#111827]',
    headerBorder: 'border-slate-700/60',
    navActiveGradient: 'from-slate-600 via-zinc-600 to-slate-700',
    navActiveBorder: 'border-slate-400/80',
    navGlowColor: 'shadow-slate-950/90',
    navContainerBg: 'bg-[#182234]/95 border-slate-700/50',
    accentColor: 'slate',
    accentText: 'text-slate-300',
    badgeBg: 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700',
    buttonGradient: 'from-slate-700 via-zinc-700 to-slate-800',
    brandSubColor: 'text-slate-400',
    swatchPrimary: '#111827',
    swatchAccent: '#64748b',
    swatchCard: '#1e293b',
    cardBorder: 'border-slate-700/50',
    previewBg: 'bg-[#111827]'
  },
  abyss: {
    id: 'abyss',
    name: 'คอสมอสดีพสเปซ (Deep Cosmos)',
    thaiName: 'ธีมห้วงอวกาศ',
    emoji: '🌌',
    description: 'สีน้ำเงินคอสมอสลุ่มลึก ผสานความลึกลับของดวงดาว เรียบหรูทรงเสน่ห์',
    badge: 'อวกาศ / หรูหรา',
    category: 'dark',
    pageBg: 'bg-[#020512]',
    containerBg: 'bg-[#040a20] text-blue-50 border-blue-950',
    headerGradient: 'from-[#040a20] via-[#081542] to-[#03081a]',
    headerBorder: 'border-blue-800/60',
    navActiveGradient: 'from-blue-600 via-indigo-600 to-cyan-500',
    navActiveBorder: 'border-blue-400',
    navGlowColor: 'shadow-blue-950/90',
    navContainerBg: 'bg-[#09153a]/95 border-blue-800/50',
    accentColor: 'blue',
    accentText: 'text-blue-400',
    badgeBg: 'bg-blue-950/90 text-blue-200 border-blue-800',
    buttonGradient: 'from-blue-600 via-indigo-600 to-cyan-600',
    brandSubColor: 'text-blue-400',
    swatchPrimary: '#040a20',
    swatchAccent: '#3b82f6',
    swatchCard: '#0a1d52',
    cardBorder: 'border-blue-800/50',
    previewBg: 'bg-[#040a20]'
  },
  red: {
    id: 'red',
    name: 'แดงรูบี้ (Ruby Crimson)',
    thaiName: 'ธีมสีแดง',
    emoji: '🔴',
    description: 'โทนสีแดงมงคล พลังแห่งความสำเร็จ โดดเด่น ชัดเจน มีชีวิตชีวา มหาเฮง',
    badge: 'ยอดนิยม / มหาเฮง',
    category: 'dark',
    pageBg: 'bg-[#0e0304]',
    containerBg: 'bg-[#130507] text-rose-50 border-red-950/80',
    headerGradient: 'from-[#1a0508] via-[#24080d] to-[#140305]',
    headerBorder: 'border-red-900/60',
    navActiveGradient: 'from-red-600 via-rose-600 to-amber-600',
    navActiveBorder: 'border-rose-400/80',
    navGlowColor: 'shadow-red-950/90',
    navContainerBg: 'bg-[#1c080b]/95 border-red-900/50',
    accentColor: 'red',
    accentText: 'text-rose-400',
    badgeBg: 'bg-red-950/80 text-rose-200 border-red-800/80 hover:bg-red-900/90',
    buttonGradient: 'from-red-600 via-rose-600 to-amber-600',
    brandSubColor: 'text-rose-500',
    swatchPrimary: '#130507',
    swatchAccent: '#e11d48',
    swatchCard: '#240a0f',
    cardBorder: 'border-red-900/50',
    previewBg: 'bg-[#130507]'
  },
  purple: {
    id: 'purple',
    name: 'ม่วงนีออน (Cyber Violet)',
    thaiName: 'ธีมสีม่วง',
    emoji: '💜',
    description: 'โทนสีม่วงนีออน มีเสน่ห์ ลึกลับ ทรงพลัง สไตล์ไซเบอร์พังก์ระดับพรีเมียม',
    badge: 'ลึกลับ / เกมมิ่ง',
    category: 'cyber',
    pageBg: 'bg-[#0a0314]',
    containerBg: 'bg-[#100620] text-purple-50 border-purple-950/80',
    headerGradient: 'from-[#100620] via-[#1d0b38] to-[#0e051c]',
    headerBorder: 'border-purple-900/60',
    navActiveGradient: 'from-purple-600 via-fuchsia-600 to-indigo-600',
    navActiveBorder: 'border-purple-400/80',
    navGlowColor: 'shadow-purple-950/90',
    navContainerBg: 'bg-[#190c2e]/95 border-purple-900/50',
    accentColor: 'purple',
    accentText: 'text-purple-400',
    badgeBg: 'bg-purple-950/80 text-purple-200 border-purple-800/80 hover:bg-purple-900/90',
    buttonGradient: 'from-purple-600 via-fuchsia-600 to-indigo-600',
    brandSubColor: 'text-purple-400',
    swatchPrimary: '#100620',
    swatchAccent: '#a855f7',
    swatchCard: '#210e42',
    cardBorder: 'border-purple-900/50',
    previewBg: 'bg-[#100620]'
  },
  matrix: {
    id: 'matrix',
    name: 'นีออนเมทริกซ์ (Matrix Cyber)',
    thaiName: 'ธีมเมทริกซ์',
    emoji: '🟩',
    description: 'เขียวนีออนเรืองแสง สไตล์โลกไซเบอร์แฮกเกอร์ เท่ ดุดัน ล้ำยุค',
    badge: 'ไซเบอร์ / แฮกเกอร์',
    category: 'cyber',
    pageBg: 'bg-[#020d05]',
    containerBg: 'bg-[#041609] text-emerald-50 border-emerald-950',
    headerGradient: 'from-[#041609] via-[#092b13] to-[#041609]',
    headerBorder: 'border-emerald-700/60',
    navActiveGradient: 'from-emerald-500 via-green-500 to-lime-500 text-slate-950 font-black',
    navActiveBorder: 'border-emerald-300',
    navGlowColor: 'shadow-emerald-950/90',
    navContainerBg: 'bg-[#06200e]/95 border-emerald-700/50',
    accentColor: 'emerald',
    accentText: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/90 text-emerald-200 border-emerald-700',
    buttonGradient: 'from-emerald-500 via-green-600 to-teal-600',
    brandSubColor: 'text-emerald-400',
    swatchPrimary: '#041609',
    swatchAccent: '#22c55e',
    swatchCard: '#0a3317',
    cardBorder: 'border-emerald-700/50',
    previewBg: 'bg-[#041609]'
  },
  synthwave: {
    id: 'synthwave',
    name: 'ซินธ์เวฟ 80s (Synthwave Retro)',
    thaiName: 'ธีมซินธ์เวฟ',
    emoji: '🌆',
    description: 'การผสมผสานสีชมพูฟูเชียและม่วงนีออนเรโทร 80s สไตล์ไฟนีออนยุคทอง',
    badge: 'เรโทร 80s / นีออน',
    category: 'cyber',
    pageBg: 'bg-[#0c0314]',
    containerBg: 'bg-[#140620] text-pink-50 border-fuchsia-950',
    headerGradient: 'from-[#140620] via-[#260a3d] to-[#12041d]',
    headerBorder: 'border-fuchsia-800/60',
    navActiveGradient: 'from-fuchsia-600 via-pink-600 to-cyan-500',
    navActiveBorder: 'border-pink-300',
    navGlowColor: 'shadow-fuchsia-950/90',
    navContainerBg: 'bg-[#1c082e]/95 border-fuchsia-800/50',
    accentColor: 'pink',
    accentText: 'text-fuchsia-400',
    badgeBg: 'bg-fuchsia-950/90 text-fuchsia-200 border-fuchsia-700',
    buttonGradient: 'from-fuchsia-600 via-pink-600 to-cyan-600',
    brandSubColor: 'text-pink-400',
    swatchPrimary: '#140620',
    swatchAccent: '#d946ef',
    swatchCard: '#2b0c44',
    cardBorder: 'border-fuchsia-800/50',
    previewBg: 'bg-[#140620]'
  },
  electric: {
    id: 'electric',
    name: 'อิเล็กทริกโวลต์ (Electric Volt)',
    thaiName: 'ธีมเหลืองนีออน',
    emoji: '⚡',
    description: 'สีเหลืองมะนาวนีออนสว่างวาบ มีพลัง เร้าใจ คมชัดที่สุดทุกมุมมอง',
    badge: 'พลังแรงสูง / นีออน',
    category: 'cyber',
    pageBg: 'bg-[#0b0c03]',
    containerBg: 'bg-[#131405] text-lime-50 border-lime-950',
    headerGradient: 'from-[#131405] via-[#24270a] to-[#111204]',
    headerBorder: 'border-lime-800/60',
    navActiveGradient: 'from-lime-400 via-yellow-400 to-amber-500 text-slate-950 font-black',
    navActiveBorder: 'border-lime-200',
    navGlowColor: 'shadow-lime-950/90',
    navContainerBg: 'bg-[#1c1e08]/95 border-lime-800/50',
    accentColor: 'lime',
    accentText: 'text-lime-400',
    badgeBg: 'bg-lime-950/90 text-lime-200 border-lime-700',
    buttonGradient: 'from-lime-500 via-yellow-500 to-amber-600 text-slate-950 font-black',
    brandSubColor: 'text-lime-400',
    swatchPrimary: '#131405',
    swatchAccent: '#84cc16',
    swatchCard: '#272b0b',
    cardBorder: 'border-lime-800/50',
    previewBg: 'bg-[#131405]'
  },
  pink: {
    id: 'pink',
    name: 'ชมพูซากุระ (Rose Quartz)',
    thaiName: 'ธีมสีชมพู',
    emoji: '🌸',
    description: 'โทนสีชมพูหวานละมุน สดใส น่ารัก อบอุ่น ฟีลกู๊ด สบายตา',
    badge: 'หวานละมุน / สดใส',
    category: 'pastel',
    pageBg: 'bg-[#0f030a]',
    containerBg: 'bg-[#170510] text-pink-50 border-pink-950/80',
    headerGradient: 'from-[#170510] via-[#29091d] to-[#15040e]',
    headerBorder: 'border-pink-900/60',
    navActiveGradient: 'from-pink-500 via-rose-500 to-fuchsia-500',
    navActiveBorder: 'border-pink-400/80',
    navGlowColor: 'shadow-pink-950/90',
    navContainerBg: 'bg-[#220919]/95 border-pink-900/50',
    accentColor: 'pink',
    accentText: 'text-pink-400',
    badgeBg: 'bg-pink-950/80 text-pink-200 border-pink-800/80 hover:bg-pink-900/90',
    buttonGradient: 'from-pink-500 via-rose-500 to-purple-600',
    brandSubColor: 'text-pink-400',
    swatchPrimary: '#170510',
    swatchAccent: '#ec4899',
    swatchCard: '#2d0c22',
    cardBorder: 'border-pink-900/50',
    previewBg: 'bg-[#170510]'
  },
  lavender: {
    id: 'lavender',
    name: 'ลาเวนเดอร์ดรีม (Lavender Haze)',
    thaiName: 'ธีมลาเวนเดอร์',
    emoji: '🪻',
    description: 'โทนสีม่วงพาสเทลนุ่มละมุน ละไม ผ่อนคลาย อบอุ่น ฟีลคาเฟ่เกาหลี',
    badge: 'พาสเทล / คาเฟ่',
    category: 'pastel',
    pageBg: 'bg-[#0a0512]',
    containerBg: 'bg-[#120a1f] text-purple-50 border-purple-950',
    headerGradient: 'from-[#120a1f] via-[#22143b] to-[#10081c]',
    headerBorder: 'border-purple-800/60',
    navActiveGradient: 'from-purple-400 via-violet-400 to-pink-400 text-slate-950 font-black',
    navActiveBorder: 'border-purple-200',
    navGlowColor: 'shadow-purple-950/90',
    navContainerBg: 'bg-[#1c1030]/95 border-purple-800/50',
    accentColor: 'purple',
    accentText: 'text-purple-300',
    badgeBg: 'bg-purple-950/90 text-purple-200 border-purple-800',
    buttonGradient: 'from-purple-500 via-violet-500 to-pink-500',
    brandSubColor: 'text-purple-300',
    swatchPrimary: '#120a1f',
    swatchAccent: '#c084fc',
    swatchCard: '#271742',
    cardBorder: 'border-purple-800/50',
    previewBg: 'bg-[#120a1f]'
  },
  mint: {
    id: 'mint',
    name: 'มินท์พาสเทล (Mint Pastello)',
    thaiName: 'ธีมเขียวมิ้นท์',
    emoji: '🍃',
    description: 'สีเขียวมิ้นท์โทนสว่าง สดชื่น อ่อนโยน ให้ความรู้สึกสบายตา สบายใจ',
    badge: 'สดชื่น / มินิมอล',
    category: 'pastel',
    pageBg: 'bg-[#020b09]',
    containerBg: 'bg-[#041411] text-teal-50 border-teal-950',
    headerGradient: 'from-[#041411] via-[#082923] to-[#03110e]',
    headerBorder: 'border-teal-800/60',
    navActiveGradient: 'from-teal-400 via-emerald-400 to-cyan-400 text-slate-950 font-black',
    navActiveBorder: 'border-teal-200',
    navGlowColor: 'shadow-teal-950/90',
    navContainerBg: 'bg-[#07241e]/95 border-teal-800/50',
    accentColor: 'teal',
    accentText: 'text-teal-300',
    badgeBg: 'bg-teal-950/90 text-teal-200 border-teal-800',
    buttonGradient: 'from-teal-500 via-emerald-500 to-cyan-500 text-slate-950 font-black',
    brandSubColor: 'text-teal-300',
    swatchPrimary: '#041411',
    swatchAccent: '#2dd4bf',
    swatchCard: '#0d362e',
    cardBorder: 'border-teal-800/50',
    previewBg: 'bg-[#041411]'
  },
  white: {
    id: 'white',
    name: 'ขาวมินิมอล (Clean White / Light)',
    thaiName: 'ธีมสีขาว',
    emoji: '🤍',
    description: 'โทนสีขาวสว่าง สะอาดตา อ่านง่าย ชัดเจน สบายตาสำหรับใช้งานในทุกสภาพแสง',
    badge: 'คลีน / สว่างสดใส',
    category: 'pastel',
    pageBg: 'bg-slate-200',
    containerBg: 'bg-slate-900 text-slate-100 border-slate-700/80',
    headerGradient: 'from-slate-900 via-slate-800 to-indigo-950/80',
    headerBorder: 'border-slate-700',
    navActiveGradient: 'from-slate-100 via-white to-slate-200 text-slate-950 font-black',
    navActiveBorder: 'border-white/80',
    navGlowColor: 'shadow-slate-300/30',
    navContainerBg: 'bg-slate-800/95 border-slate-700/50',
    accentColor: 'sky',
    accentText: 'text-sky-300',
    badgeBg: 'bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-700/90',
    buttonGradient: 'from-slate-700 via-slate-800 to-indigo-900',
    brandSubColor: 'text-sky-400',
    swatchPrimary: '#f8fafc',
    swatchAccent: '#0ea5e9',
    swatchCard: '#ffffff',
    cardBorder: 'border-slate-700/60',
    previewBg: 'bg-slate-900'
  },
  emerald: {
    id: 'emerald',
    name: 'เขียวมรกต (Emerald Green)',
    thaiName: 'ธีมสีเขียว',
    emoji: '💚',
    description: 'โทนสีเขียวสดชื่น สบายตา ร่มรื่น ธรรมชาติ พลังบวกและการเติบโต',
    badge: 'สดชื่น / สบายตา',
    category: 'nature',
    pageBg: 'bg-[#020d07]',
    containerBg: 'bg-[#05140b] text-emerald-50 border-emerald-950/80',
    headerGradient: 'from-[#05140b] via-[#0a2314] to-[#041209]',
    headerBorder: 'border-emerald-900/60',
    navActiveGradient: 'from-emerald-600 via-teal-600 to-green-500',
    navActiveBorder: 'border-emerald-400/80',
    navGlowColor: 'shadow-emerald-950/90',
    navContainerBg: 'bg-[#082013]/95 border-emerald-900/50',
    accentColor: 'emerald',
    accentText: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/80 text-emerald-200 border-emerald-800/80 hover:bg-emerald-900/90',
    buttonGradient: 'from-emerald-600 via-teal-600 to-green-600',
    brandSubColor: 'text-emerald-400',
    swatchPrimary: '#05140b',
    swatchAccent: '#10b981',
    swatchCard: '#0d2d1b',
    cardBorder: 'border-emerald-900/50',
    previewBg: 'bg-[#05140b]'
  },
  teal: {
    id: 'teal',
    name: 'เขียวหัวเป็ด (Nordic Teal)',
    thaiName: 'ธีมเขียวหัวเป็ด',
    emoji: '🦚',
    description: 'โทนสีเขียวน้ำทะเลหัวเป็ด เรียบหรู พรีเมียม คมชัด สงบและมีระดับ',
    badge: 'พรีเมียม / สุขุม',
    category: 'nature',
    pageBg: 'bg-[#010b0d]',
    containerBg: 'bg-[#031518] text-teal-50 border-teal-950/80',
    headerGradient: 'from-[#031518] via-[#06242a] to-[#031518]',
    headerBorder: 'border-teal-900/60',
    navActiveGradient: 'from-teal-600 via-emerald-600 to-cyan-600',
    navActiveBorder: 'border-teal-400/80',
    navGlowColor: 'shadow-teal-950/90',
    navContainerBg: 'bg-[#07252a]/95 border-teal-900/50',
    accentColor: 'teal',
    accentText: 'text-teal-400',
    badgeBg: 'bg-teal-950/80 text-teal-200 border-teal-800/80 hover:bg-teal-900/90',
    buttonGradient: 'from-teal-600 via-cyan-600 to-emerald-600',
    brandSubColor: 'text-teal-400',
    swatchPrimary: '#031518',
    swatchAccent: '#14b8a6',
    swatchCard: '#0a3038',
    cardBorder: 'border-teal-900/50',
    previewBg: 'bg-[#031518]'
  },
  coffee: {
    id: 'coffee',
    name: 'กาแฟคาราเมล (Warm Mocha)',
    thaiName: 'ธีมกาแฟอบอุ่น',
    emoji: '☕',
    description: 'โทนสีกาแฟคั่วเข้มผสมคาราเมล อบอุ่น สบายตา วินเทจคลาสสิก',
    badge: 'อบอุ่น / ละมุน',
    category: 'nature',
    pageBg: 'bg-[#0b0805]',
    containerBg: 'bg-[#140e0a] text-amber-50 border-stone-800/80',
    headerGradient: 'from-[#140e0a] via-[#241a12] to-[#140e0a]',
    headerBorder: 'border-stone-800/60',
    navActiveGradient: 'from-amber-700 via-orange-700 to-yellow-600',
    navActiveBorder: 'border-amber-500/80',
    navGlowColor: 'shadow-amber-950/90',
    navContainerBg: 'bg-[#221811]/95 border-stone-800/50',
    accentColor: 'amber',
    accentText: 'text-amber-400',
    badgeBg: 'bg-stone-900 text-amber-200 border-stone-700 hover:bg-stone-800',
    buttonGradient: 'from-amber-700 via-orange-800 to-stone-800',
    brandSubColor: 'text-amber-500',
    swatchPrimary: '#140e0a',
    swatchAccent: '#d97706',
    swatchCard: '#271c14',
    cardBorder: 'border-stone-800/50',
    previewBg: 'bg-[#140e0a]'
  },
  yellow: {
    id: 'yellow',
    name: 'ทองอำพัน (Amber Gold / Sunshine)',
    thaiName: 'ธีมสีเหลืองทอง',
    emoji: '💛',
    description: 'โทนสีเหลืองทองคำ หรูหรา อบอุ่น มั่งคั่ง สีมงคลรับทรัพย์ โดดเด่นมีระดับ',
    badge: 'หรูหรา / มงคลรับทรัพย์',
    category: 'nature',
    pageBg: 'bg-[#0d0901]',
    containerBg: 'bg-[#161102] text-amber-50 border-amber-950/80',
    headerGradient: 'from-[#201703] via-[#2a1e05] to-[#140e02]',
    headerBorder: 'border-amber-800/60',
    navActiveGradient: 'from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-black',
    navActiveBorder: 'border-yellow-300/80',
    navGlowColor: 'shadow-amber-950/90',
    navContainerBg: 'bg-[#201804]/95 border-amber-800/50',
    accentColor: 'amber',
    accentText: 'text-amber-400',
    badgeBg: 'bg-amber-950/80 text-amber-200 border-amber-800/80 hover:bg-amber-900/90',
    buttonGradient: 'from-amber-600 via-yellow-600 to-amber-700',
    brandSubColor: 'text-amber-500',
    swatchPrimary: '#161102',
    swatchAccent: '#f59e0b',
    swatchCard: '#271d05',
    cardBorder: 'border-amber-800/50',
    previewBg: 'bg-[#161102]'
  },
  sunset: {
    id: 'sunset',
    name: 'ส้มซันเซ็ท (Sunset Flame)',
    thaiName: 'ธีมสีส้ม',
    emoji: '🌅',
    description: 'โทนสีส้มเพลิงพระอาทิตย์ตกดิน กระปรี้กระเปร่า มีพลัง สดใส โดดเด่น',
    badge: 'มีพลัง / เร่าร้อน',
    category: 'sunset',
    pageBg: 'bg-[#0e0601]',
    containerBg: 'bg-[#180a02] text-orange-50 border-orange-950/80',
    headerGradient: 'from-[#180a02] via-[#2b1304] to-[#150802]',
    headerBorder: 'border-orange-900/60',
    navActiveGradient: 'from-orange-500 via-amber-500 to-red-500',
    navActiveBorder: 'border-orange-400/80',
    navGlowColor: 'shadow-orange-950/90',
    navContainerBg: 'bg-[#241005]/95 border-orange-900/50',
    accentColor: 'orange',
    accentText: 'text-orange-400',
    badgeBg: 'bg-orange-950/80 text-orange-200 border-orange-800/80 hover:bg-orange-900/90',
    buttonGradient: 'from-orange-500 via-amber-500 to-red-600',
    brandSubColor: 'text-orange-400',
    swatchPrimary: '#180a02',
    swatchAccent: '#f97316',
    swatchCard: '#2f1607',
    cardBorder: 'border-orange-900/50',
    previewBg: 'bg-[#180a02]'
  },
  ocean: {
    id: 'ocean',
    name: 'ฟ้ามหาสมุทร (Ocean Sapphire)',
    thaiName: 'ธีมสีฟ้าคราม',
    emoji: '🌊',
    description: 'โทนสีฟ้าคราม มหาสมุทรน้ำลึก ผ่อนคลาย สบายใจ ทันสมัย สดใส',
    badge: 'ผ่อนคลาย / ล้ำสมัย',
    category: 'sunset',
    pageBg: 'bg-[#020817]',
    containerBg: 'bg-[#051026] text-sky-50 border-sky-950/80',
    headerGradient: 'from-[#051026] via-[#091e46] to-[#040e22]',
    headerBorder: 'border-sky-900/60',
    navActiveGradient: 'from-sky-600 via-blue-600 to-indigo-600',
    navActiveBorder: 'border-sky-400/80',
    navGlowColor: 'shadow-sky-950/90',
    navContainerBg: 'bg-[#091b38]/95 border-sky-900/50',
    accentColor: 'sky',
    accentText: 'text-sky-400',
    badgeBg: 'bg-sky-950/80 text-sky-200 border-sky-800/80 hover:bg-sky-900/90',
    buttonGradient: 'from-sky-600 via-blue-600 to-cyan-600',
    brandSubColor: 'text-sky-400',
    swatchPrimary: '#051026',
    swatchAccent: '#0ea5e9',
    swatchCard: '#092350',
    cardBorder: 'border-sky-900/50',
    previewBg: 'bg-[#051026]'
  },
  berry: {
    id: 'berry',
    name: 'รอยัลเบอร์รี่ (Royal Berry Wine)',
    thaiName: 'ธีมไวน์เบอร์รี่',
    emoji: '🍇',
    description: 'สีแดงไวน์องุ่นผสมเบอร์รี่เข้ม หรูหรา มีระดับ ดึงดูดสายตาอย่างมีสไตล์',
    badge: 'หรูหรา / พรีเมียม',
    category: 'sunset',
    pageBg: 'bg-[#0d0208]',
    containerBg: 'bg-[#15040d] text-rose-50 border-rose-950',
    headerGradient: 'from-[#15040d] via-[#29081a] to-[#12030b]',
    headerBorder: 'border-rose-900/60',
    navActiveGradient: 'from-rose-600 via-pink-700 to-purple-700',
    navActiveBorder: 'border-rose-400',
    navGlowColor: 'shadow-rose-950/90',
    navContainerBg: 'bg-[#1f0614]/95 border-rose-900/50',
    accentColor: 'rose',
    accentText: 'text-rose-400',
    badgeBg: 'bg-rose-950/90 text-rose-200 border-rose-800',
    buttonGradient: 'from-rose-600 via-fuchsia-700 to-purple-700',
    brandSubColor: 'text-rose-400',
    swatchPrimary: '#15040d',
    swatchAccent: '#f43f5e',
    swatchCard: '#2d091d',
    cardBorder: 'border-rose-900/50',
    previewBg: 'bg-[#15040d]'
  },
  custom: {
    id: 'custom',
    name: '🎨 กำหนดสีเองอิสระ (Custom DIY)',
    thaiName: 'กำหนดเอง',
    emoji: '✨',
    description: 'ปรับแต่งสีไฮไลท์หลักและโทนพื้นหลังได้ตามใจชอบ ทั้ง Palette สำเร็จรูปและ Color Picker',
    badge: 'DIY / ปรับแต่งเอง',
    category: 'all',
    pageBg: 'bg-[#09090b]',
    containerBg: 'bg-slate-950 text-slate-100 border-slate-800',
    headerGradient: 'from-slate-950 via-zinc-950 to-slate-900',
    headerBorder: 'border-slate-800',
    navActiveGradient: 'from-indigo-600 via-purple-600 to-pink-600',
    navActiveBorder: 'border-indigo-400/80',
    navGlowColor: 'shadow-indigo-950/90',
    navContainerBg: 'bg-slate-900/95 border-slate-800',
    accentColor: 'indigo',
    accentText: 'text-indigo-400',
    badgeBg: 'bg-indigo-950/80 text-indigo-200 border-indigo-800/80 hover:bg-indigo-900/90',
    buttonGradient: 'from-indigo-600 via-purple-600 to-pink-600',
    brandSubColor: 'text-indigo-400',
    swatchPrimary: '#09090b',
    swatchAccent: '#6366f1',
    swatchCard: '#18181b',
    cardBorder: 'border-indigo-500/40',
    previewBg: 'bg-slate-950'
  }
};

export interface QuickAccentColor {
  name: string;
  color: string;
  group: 'standard' | 'cyber' | 'pastel' | 'warm' | 'nature';
  emoji?: string;
}

export const STANDARD_QUICK_PALETTE: QuickAccentColor[] = [
  { name: 'แดงสด', color: '#ef4444', group: 'standard', emoji: '🔴' },
  { name: 'เขียวมิ้นท์', color: '#10b981', group: 'standard', emoji: '🌿' },
  { name: 'น้ำเงินคราม', color: '#3b82f6', group: 'standard', emoji: '🔷' },
  { name: 'เหลืองทอง', color: '#eab308', group: 'standard', emoji: '⚡' },
  { name: 'ม่วงสด', color: '#a855f7', group: 'standard', emoji: '💜' },
  { name: 'ชมพูสด', color: '#ec4899', group: 'standard', emoji: '🌸' },
  { name: 'ส้มเพลิง', color: '#f97316', group: 'standard', emoji: '🔥' },
  { name: 'ฟ้าไซอัน', color: '#06b6d4', group: 'standard', emoji: '💎' },
  { name: 'เขียวมะนาว', color: '#84cc16', group: 'standard', emoji: '🍋' },
  { name: 'เทากราไฟต์', color: '#64748b', group: 'standard', emoji: '🌑' },
  { name: 'ขาวบริสุทธิ์', color: '#f8fafc', group: 'standard', emoji: '🤍' },
  { name: 'แดงไวน์', color: '#be123c', group: 'standard', emoji: '🍷' },
];

export const QUICK_CUSTOM_ACCENTS: QuickAccentColor[] = [
  // Standard Essentials (แม่สีมาตรฐาน)
  { name: 'แดงสด', color: '#ef4444', group: 'standard', emoji: '🔴' },
  { name: 'เขียวมิ้นท์', color: '#10b981', group: 'standard', emoji: '🌿' },
  { name: 'น้ำเงินคราม', color: '#3b82f6', group: 'standard', emoji: '🔷' },
  { name: 'เหลืองทอง', color: '#eab308', group: 'standard', emoji: '⚡' },
  { name: 'ม่วงสด', color: '#a855f7', group: 'standard', emoji: '💜' },
  { name: 'ชมพูสด', color: '#ec4899', group: 'standard', emoji: '🌸' },
  { name: 'ส้มเพลิง', color: '#f97316', group: 'standard', emoji: '🔥' },
  { name: 'ฟ้าไซอัน', color: '#06b6d4', group: 'standard', emoji: '💎' },

  // Neon / Cyber
  { name: 'นีออนบลู', color: '#38bdf8', group: 'cyber', emoji: '🌐' },
  { name: 'นีออนม่วง', color: '#c084fc', group: 'cyber', emoji: '🔮' },
  { name: 'นีออนชมพู', color: '#f43f5e', group: 'cyber', emoji: '💖' },
  { name: 'นีออนมะนาว', color: '#a3e635', group: 'cyber', emoji: '⚡' },
  { name: 'นีออนกรีน', color: '#22c55e', group: 'cyber', emoji: '🟩' },
  { name: 'นีออนฟูเชีย', color: '#d946ef', group: 'cyber', emoji: '🎆' },
  
  // Pastel & Cute
  { name: 'ชมพูพาสเทล', color: '#f472b6', group: 'pastel', emoji: '🧁' },
  { name: 'ลาเวนเดอร์', color: '#d8b4fe', group: 'pastel', emoji: '🪻' },
  { name: 'มิ้นท์อ่อน', color: '#5eead4', group: 'pastel', emoji: '🍃' },
  { name: 'ฟ้าพาสเทล', color: '#7dd3fc', group: 'pastel', emoji: '☁️' },
  { name: 'พีชพาสเทล', color: '#fdba74', group: 'pastel', emoji: '🍑' },
  { name: 'ครีมวานิลลา', color: '#fef08a', group: 'pastel', emoji: '🍨' },

  // Warm & Solar
  { name: 'ทองคำสุก', color: '#facc15', group: 'warm', emoji: '👑' },
  { name: 'ส้มเปลวเพลิง', color: '#ea580c', group: 'warm', emoji: '🌅' },
  { name: 'แดงรูบี้เข้ม', color: '#e11d48', group: 'warm', emoji: '🌹' },
  { name: 'คาราเมล', color: '#d97706', group: 'warm', emoji: '🍯' },
  { name: 'กาแฟช็อกโกแลต', color: '#92400e', group: 'warm', emoji: '☕' },
  { name: 'กุหลาบแดง', color: '#9f1239', group: 'warm', emoji: '🍷' },

  // Nature & Minimal
  { name: 'เขียวฟอเรสต์', color: '#059669', group: 'nature', emoji: '🌲' },
  { name: 'ทีลทะเลลึก', color: '#0d9488', group: 'nature', emoji: '🌊' },
  { name: 'ครามสว่าง', color: '#6366f1', group: 'nature', emoji: '🌌' },
  { name: 'เทากราไฟต์', color: '#64748b', group: 'nature', emoji: '🌑' },
  { name: 'ขาวบริสุทธิ์', color: '#f8fafc', group: 'nature', emoji: '🤍' },
  { name: 'แบล็คสเปซ', color: '#1e293b', group: 'nature', emoji: '🖤' },
];



const getThaiDateTime = (timestamp: any) => {
  if (!timestamp) {
    const today = new Date();
    const d = today.getDate();
    const m = today.getMonth() + 1;
    const y = today.getFullYear() + 543;
    const hh = String(today.getHours()).padStart(2, '0');
    const mm = String(today.getMinutes()).padStart(2, '0');
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    return {
      d,
      m,
      y,
      hh,
      mm,
      monthText: thaiMonths[today.getMonth()]
    };
  }
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  
  try {
    const formatter = new Intl.DateTimeFormat('th-TH', {
      timeZone: 'Asia/Bangkok',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
    
    const parts = formatter.formatToParts(date);
    const partMap = Object.fromEntries(parts.map(p => [p.type, p.value]));
    
    const d = partMap.day || String(date.getDate());
    const monthText = partMap.month || 'มกราคม';
    let yearVal = parseInt(partMap.year);
    if (isNaN(yearVal)) {
      yearVal = date.getFullYear() + 543;
    } else if (yearVal < 2500) {
      yearVal += 543;
    }
    
    const hh = String(partMap.hour !== undefined ? partMap.hour : date.getHours()).padStart(2, '0');
    const mm = String(partMap.minute !== undefined ? partMap.minute : date.getMinutes()).padStart(2, '0');
    
    // Get numeric month
    const formatterShort = new Intl.DateTimeFormat('th-TH', {
      timeZone: 'Asia/Bangkok',
      month: 'numeric'
    });
    const mShort = formatterShort.format(date);
    
    return {
      d: parseInt(d),
      m: parseInt(mShort) || (date.getMonth() + 1),
      y: yearVal,
      hh,
      mm,
      monthText
    };
  } catch (e) {
    // Fallback if error occurs
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear() + 543;
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const thaiMonths = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    return {
      d,
      m,
      y,
      hh,
      mm,
      monthText: thaiMonths[date.getMonth()]
    };
  }
};

const formatThaiDate = (timestamp: any) => {
  if (!timestamp) return 'กำลังโหลด...';
  const info = getThaiDateTime(timestamp);
  const yShort = String(info.y).slice(-2);
  return `${info.d}/${info.m}/${yShort} ${info.hh}:${info.mm}`;
};

const formatPromptPayDisplay = (id: string) => {
  const clean = (id || '').replace(/[^0-9]/g, '');
  if (clean.length === 10) {
    return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6)}`;
  }
  if (clean.length === 13) {
    return `${clean.slice(0, 1)}-${clean.slice(1, 5)}-${clean.slice(5, 10)}-${clean.slice(10, 12)}-${clean.slice(12)}`;
  }
  if (clean.length === 15) {
    return `${clean.slice(0, 5)}-${clean.slice(5, 10)}-${clean.slice(10)}`;
  }
  return id || '-';
};

// --- Error Handling ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Components ---

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "ยืนยัน", cancelText = "ยกเลิก", isDanger = false }: { 
  isOpen: boolean, 
  onClose: () => void, 
  onConfirm: () => void, 
  title: string, 
  message: string,
  confirmText?: string,
  cancelText?: string,
  isDanger?: boolean
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    <div className="space-y-6">
      <p className="text-zinc-300 text-sm font-bold leading-relaxed">{message}</p>
      <div className="flex gap-3">
        <button 
          onClick={onClose}
          className="flex-1 py-4 bg-slate-900 border border-slate-800 text-zinc-300 rounded-2xl font-bold text-sm hover:bg-slate-850 hover:text-white transition-all cursor-pointer"
        >
          {cancelText}
        </button>
        <button 
          onClick={() => { onConfirm(); onClose(); }}
          className={cn(
            "flex-1 py-4 rounded-2xl font-black text-sm text-white transition-all shadow-lg cursor-pointer",
            isDanger ? "bg-red-600 hover:bg-red-700 shadow-red-950/50" : "bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 hover:from-indigo-500 hover:to-sky-500 shadow-indigo-950/50"
          )}
        >
          {confirmText}
        </button>
      </div>
    </div>
  </Modal>
);

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-slate-950 text-white border border-indigo-900/50 rounded-t-[32px] sm:rounded-3xl p-6 sm:p-8 shadow-[0_25px_80px_rgba(79,70,229,0.25)] overflow-hidden max-h-[90vh] flex flex-col"
        >
          <div className="flex justify-between items-center mb-6 border-b border-indigo-900/30 pb-4">
            <h3 className="text-xl font-black text-white">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-indigo-950/80 rounded-full transition-colors text-zinc-400 hover:text-white cursor-pointer">
              <X className="w-6 h-6 text-zinc-400" />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const DigitalSlip = ({ payment, bankInfo, foods }: { payment: Payment, bankInfo: BankInfo, foods: FoodItem[] }) => {
  const selectedPots = payment.foodId ? payment.foodId.split(',') : [];
  const items = foods.filter(f => selectedPots.includes(f.id));

  return (
    <div className="w-full max-w-[350px] mx-auto bg-white rounded-[20px] shadow-xl border border-slate-100 font-sans">
      <div className="bg-slate-950 text-white py-8 px-5 text-center">
        <div className="w-10 h-10 bg-white text-slate-950 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl">
          ✓
        </div>
        <h3 className="m-0 text-lg font-bold">โอนเงินสำเร็จ</h3>
        <p className="text-xs opacity-80 mt-1">{formatThaiDate(payment.timestamp)}</p>
      </div>

      <div className="p-6">
        <div className="relative pb-5">
          {/* Dashed Connector Line */}
          <div className="absolute left-[5px] top-4 bottom-0 w-0.5 border-l-2 border-dashed border-slate-200" />
          
          <div className="flex gap-4 relative z-10 mb-6">
            <div className="w-[12px] h-[12px] bg-sky-500 rounded-full mt-1.5 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400">จาก</span>
              <span className="font-bold text-slate-800">{payment.personName}</span>
              <span className="text-xs text-slate-500">บัญชีสมาชิก</span>
            </div>
          </div>

          <div className="flex gap-4 relative z-10">
            <div className="w-[12px] h-[12px] bg-slate-950 rounded-full mt-1.5 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[11px] text-slate-400">ไปยัง</span>
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <span>บัญชีกองกลาง</span>
                <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-black">เข้ากองกลาง</span>
              </span>
              <span className="text-xs text-slate-500">
                {bankInfo.no ? `${bankInfo.name || 'พร้อมเพย์'} ${bankInfo.no}${bankInfo.user ? ` (${bankInfo.user})` : ''}` : 'บัญชีกองกลาง'}
              </span>
            </div>
          </div>
        </div>

        {items.length > 0 && (
          <div className="mt-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">รายการที่ชำระ:</p>
            <div className="space-y-1.5">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-600 font-bold">{item.name}</span>
                  <span className="text-sky-600 font-bold">✓</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <hr className="border-none border-t border-slate-100 my-5" />

        <div className="flex justify-between items-center text-xs mb-4 text-slate-500">
          <span>เลขที่รายการ:</span>
          <strong className="text-slate-800 font-mono uppercase">{payment.id.slice(0, 16).replace(/-/g, '')}</strong>
        </div>
        
        <div className="text-center mt-6">
          <span className="text-sm text-slate-400">จำนวนเงิน</span>
          <div className="text-[32px] font-extrabold text-slate-800 leading-tight">
            {Math.ceil(payment.amount).toLocaleString()}.00 ฿
          </div>
        </div>
      </div>

      <div className="bg-slate-50 py-4 text-center text-[11px] text-slate-400">
        <p>ตรวจสอบข้อมูลเรียบร้อยแล้ว</p>
      </div>
    </div>
  );
};

// Client-side Image Compression for ultra-fast slip uploads (< 3 seconds)
const compressImage = (file: File, maxWidth = 1000, maxHeight = 1200, quality = 0.7): Promise<Blob | File> => {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        try {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > maxWidth) {
                  height = Math.round((height * maxWidth) / width);
                  width = maxWidth;
                }
              } else {
                if (height > maxHeight) {
                  width = Math.round((width * maxHeight) / height);
                  height = maxHeight;
                }
              }

              canvas.width = width;
              canvas.height = height;

              const ctx = canvas.getContext('2d');
              if (!ctx) {
                resolve(file);
                return;
              }

              ctx.drawImage(img, 0, 0, width, height);

              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    resolve(blob);
                  } else {
                    resolve(file);
                  }
                },
                'image/jpeg',
                quality
              );
            } catch (err) {
              console.error('Error during canvas drawing/compression:', err);
              resolve(file); // fallback to original file
            }
          };
          img.onerror = (err) => {
            console.error('Error loading image object:', err);
            resolve(file);
          };
        } catch (err) {
          console.error('Error creating image object:', err);
          resolve(file);
        }
      };
      reader.onerror = (err) => {
        console.error('Error reading file:', err);
        resolve(file);
      };
    } catch (err) {
      console.error('FileReader instantiation failed:', err);
      resolve(file);
    }
  });
};

const fileToDataURL = (file: Blob | File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

// Client-side Avatar Compression (Max 300x300 JPEG base64, ~20-30KB) for 100% reliable Firestore persistence
const compressAvatarImage = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        try {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              const maxDim = 300;
              let width = img.width;
              let height = img.height;

              if (width > height) {
                if (width > maxDim) {
                  height = Math.round((height * maxDim) / width);
                  width = maxDim;
                }
              } else {
                if (height > maxDim) {
                  width = Math.round((width * maxDim) / height);
                  height = maxDim;
                }
              }

              canvas.width = width;
              canvas.height = height;

              const ctx = canvas.getContext('2d');
              if (!ctx) {
                resolve(event.target?.result as string);
                return;
              }

              ctx.drawImage(img, 0, 0, width, height);
              const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
              resolve(compressedDataUrl);
            } catch (err) {
              console.error('Error in canvas avatar compression:', err);
              resolve(event.target?.result as string);
            }
          };
          img.onerror = () => resolve(event.target?.result as string);
        } catch (err) {
          resolve(event.target?.result as string);
        }
      };
      reader.onerror = () => resolve('');
    } catch (err) {
      resolve('');
    }
  });
};

export default function App() {
  const [activeTab, setActiveTabRaw] = useState<'people' | 'items' | 'water' | 'electricity' | 'gas' | 'summary'>(() => {
    return (localStorage.getItem('activeTab') as any) || 'people';
  });
  const setActiveTab = (tab: 'people' | 'items' | 'water' | 'electricity' | 'gas' | 'summary') => {
    setActiveTabRaw(tab);
    localStorage.setItem('activeTab', tab);
  };

  const [currentAppLogo, setCurrentAppLogo] = useState<string>(() => {
    const cached = localStorage.getItem('cache_appLogo');
    if (cached && (cached.startsWith('data:image/') || cached.startsWith('http://') || cached.startsWith('https://') || cached.startsWith('/'))) {
      return cached;
    }
    return DEFAULT_APP_LOGO;
  });
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const [people, setPeople] = useState<Person[]>(() => {
    const cached = localStorage.getItem('cache_people');
    return cached ? JSON.parse(cached) : [];
  });
  const [foods, setFoods] = useState<FoodItem[]>(() => {
    const cached = localStorage.getItem('cache_foods');
    return cached ? JSON.parse(cached) : [];
  });
  const [payments, setPayments] = useState<Payment[]>(() => {
    const cached = localStorage.getItem('cache_payments');
    return cached ? JSON.parse(cached) : [];
  });
  const [bankInfo, setBankInfo] = useState<BankInfo>(() => {
    const cached = localStorage.getItem('cache_bankInfo');
    return cached ? JSON.parse(cached) : { name: '', no: '', user: '' };
  });

  const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [targetCreditRequest, setTargetCreditRequest] = useState<Person | null>(null);
  const [creditRequestAmount, setCreditRequestAmount] = useState('');
  const [creditRequestReason, setCreditRequestReason] = useState('');
  
  const [dataLoaded, setDataLoaded] = useState({
    config: false,
    people: false,
    foods: false,
    payments: false
  });
  
  // Only show the heavy loading screen if there's ZERO data in the cache
  // This makes the app feel "instant" for returning users
  const isInitialLoading = (!dataLoaded.config || !dataLoaded.people || !dataLoaded.foods || !dataLoaded.payments) && people.length === 0;
  
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [bankModalTab, setBankModalTab] = useState<'qr' | 'settings' | 'theme'>('qr');
  const [selectedQrPerson, setSelectedQrPerson] = useState<string>('');
  const [qrAmount, setQrAmount] = useState<string>('');
  const [qrCustomName, setQrCustomName] = useState<string>('');

  // Custom Theme DIY Config
  const [customTheme, setCustomTheme] = useState<CustomThemeSettings>(() => {
    const saved = localStorage.getItem('app_custom_theme_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          accentColor: parsed.accentColor || '#38bdf8',
          secondaryColor: parsed.secondaryColor || '#818cf8',
          bgTone: parsed.bgTone || 'midnight',
          glowIntensity: parsed.glowIntensity || 'neon',
          savedSlots: Array.isArray(parsed.savedSlots) ? parsed.savedSlots : []
        };
      } catch (e) {}
    }
    return {
      accentColor: '#38bdf8',
      secondaryColor: '#818cf8',
      bgTone: 'midnight',
      glowIntensity: 'neon',
      savedSlots: [
        { id: '1', name: 'Cyber Neon', accentColor: '#06b6d4', secondaryColor: '#a855f7', bgTone: 'pitch_black', glowIntensity: 'neon' },
        { id: '2', name: 'Sakura Sweet', accentColor: '#f472b6', secondaryColor: '#c084fc', bgTone: 'midnight', glowIntensity: 'soft' }
      ]
    };
  });

  // Personal DIY Config (Local-only persistence)
  const [personalDIY, setPersonalDIY] = useState<PersonalDIYConfig>(() => {
    const saved = localStorage.getItem('app_personal_diy_decorations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_PERSONAL_DIY, ...parsed };
      } catch (e) {}
    }
    return DEFAULT_PERSONAL_DIY;
  });

  // Personal Stickers (Local-only persistence)
  const [personalStickers, setPersonalStickers] = useState<PersonalSticker[]>(() => {
    const saved = localStorage.getItem('app_personal_stickers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [
      { id: 'default-1', icon: '🍲', x: 86, y: 15, size: 40, rotation: 8, opacity: 0.95, label: 'หม้อต้ม' },
      { id: 'default-2', icon: '✨', x: 14, y: 16, size: 34, rotation: -12, opacity: 0.9, label: 'วิ้งวับ' },
    ];
  });

  const [isDIYStudioOpen, setIsDIYStudioOpen] = useState(false);

  const handleUpdatePersonalDIY = (updates: Partial<PersonalDIYConfig>) => {
    setPersonalDIY(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('app_personal_diy_decorations', JSON.stringify(next));
      return next;
    });
  };

  const handleUpdatePersonalStickers = (newStickers: PersonalSticker[]) => {
    setPersonalStickers(newStickers);
    localStorage.setItem('app_personal_stickers', JSON.stringify(newStickers));
  };

  // Main Theme Color State (Defaults to 'dark' or saved theme)
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('app_theme_color');
    const validThemes: AppTheme[] = [
      'dark', 'slate', 'abyss', 'red', 'purple', 'matrix', 'synthwave', 'electric',
      'pink', 'lavender', 'mint', 'white', 'emerald', 'teal', 'coffee', 'yellow',
      'sunset', 'ocean', 'berry', 'custom'
    ];
    if (saved && validThemes.includes(saved as AppTheme)) {
      return saved as AppTheme;
    }
    return 'dark';
  });

  const [themeSubTab, setThemeSubTab] = useState<'presets' | 'custom'>('presets');
  const [themeCategoryFilter, setThemeCategoryFilter] = useState<ThemeCategory>('all');
  const [quickAccentFilter, setQuickAccentFilter] = useState<'all' | 'standard' | 'cyber' | 'pastel' | 'warm' | 'nature'>('all');

  const handleSelectTheme = (themeId: AppTheme) => {
    setCurrentTheme(themeId);
    localStorage.setItem('app_theme_color', themeId);
    const themeName = THEMES[themeId]?.name || themeId;
    toast.success(`เปลี่ยนสีธีมหลักเป็น "${themeName}" เรียบร้อยแล้ว! ✨`);
  };

  const handleUpdateCustomTheme = (updates: Partial<CustomThemeSettings>) => {
    const next = { ...customTheme, ...updates };
    setCustomTheme(next);
    localStorage.setItem('app_custom_theme_config', JSON.stringify(next));
    if (currentTheme !== 'custom') {
      setCurrentTheme('custom');
      localStorage.setItem('app_theme_color', 'custom');
    }
  };

  const handleRandomizeTheme = () => {
    const randomAccents = [
      { primary: '#06b6d4', secondary: '#3b82f6', bg: 'pitch_black' },
      { primary: '#a855f7', secondary: '#ec4899', bg: 'midnight' },
      { primary: '#22c55e', secondary: '#06b6d4', bg: 'forest' },
      { primary: '#f43f5e', secondary: '#fb923c', bg: 'burgundy' },
      { primary: '#eab308', secondary: '#f97316', bg: 'midnight' },
      { primary: '#84cc16', secondary: '#10b981', bg: 'pitch_black' },
      { primary: '#38bdf8', secondary: '#818cf8', bg: 'navy' },
      { primary: '#f472b6', secondary: '#c084fc', bg: 'midnight' },
      { primary: '#14b8a6', secondary: '#38bdf8', bg: 'navy' },
      { primary: '#fb7185', secondary: '#fda4af', bg: 'pitch_black' },
    ];
    const picked = randomAccents[Math.floor(Math.random() * randomAccents.length)];
    handleUpdateCustomTheme({
      accentColor: picked.primary,
      secondaryColor: picked.secondary,
      bgTone: picked.bg as any,
      glowIntensity: 'neon'
    });
    toast.success('🎲 สุ่มชุดสีใหม่เรียบร้อยแล้ว!', {
      description: `สีหลัก ${picked.primary} • โทน ${picked.bg}`
    });
  };

  const handleSaveCurrentToSlot = () => {
    if (customTheme.savedSlots.length >= 6) {
      toast.error('บันทึกได้สูงสุด 6 ช่อง กรุณาลบช่องที่ไม่ใช้ออกก่อน');
      return;
    }
    const newSlot: SavedCustomPreset = {
      id: Date.now().toString(),
      name: `สูตรสี DIY #${customTheme.savedSlots.length + 1}`,
      accentColor: customTheme.accentColor,
      secondaryColor: customTheme.secondaryColor,
      bgTone: customTheme.bgTone,
      glowIntensity: customTheme.glowIntensity
    };
    handleUpdateCustomTheme({
      savedSlots: [...customTheme.savedSlots, newSlot]
    });
    toast.success(`💾 บันทึกสูตรสีลงในช่อง "${newSlot.name}" สำเร็จ!`);
  };

  const handleLoadCustomSlot = (slot: SavedCustomPreset) => {
    handleUpdateCustomTheme({
      accentColor: slot.accentColor,
      secondaryColor: slot.secondaryColor || '#818cf8',
      bgTone: slot.bgTone,
      glowIntensity: slot.glowIntensity || 'neon'
    });
    toast.success(`🎨 โหลดสูตรสี "${slot.name}" เรียบร้อยแล้ว!`);
  };

  const handleDeleteCustomSlot = (slotId: string) => {
    handleUpdateCustomTheme({
      savedSlots: customTheme.savedSlots.filter(s => s.id !== slotId)
    });
    toast.info('ลบช่องสูตรสีเรียบร้อยแล้ว');
  };

  const themeObj = useMemo<ThemeConfig>(() => {
    if (currentTheme !== 'custom') {
      return THEMES[currentTheme] || THEMES.dark;
    }
    const bgTone = customTheme.bgTone || 'midnight';
    const accent = customTheme.accentColor || '#38bdf8';

    let pageBg = 'bg-[#09090b]';
    let containerBg = 'bg-slate-950 text-slate-100 border-slate-800';
    let headerGradient = 'from-slate-950 via-zinc-950 to-slate-900';
    let navContainerBg = 'bg-slate-900/95 border-slate-800';
    let swatchPrimary = '#09090b';
    let swatchCard = '#18181b';
    let previewBg = 'bg-slate-950';
    let cardBorder = 'border-slate-700/60';

    if (bgTone === 'pitch_black') {
      pageBg = 'bg-[#030305]';
      containerBg = 'bg-[#08080c] text-slate-100 border-zinc-900';
      headerGradient = 'from-black via-[#08080c] to-[#040406]';
      navContainerBg = 'bg-[#0b0b12]/95 border-zinc-800';
      swatchPrimary = '#030305';
      swatchCard = '#0c0c14';
      previewBg = 'bg-[#08080c]';
      cardBorder = 'border-zinc-800';
    } else if (bgTone === 'navy') {
      pageBg = 'bg-[#020612]';
      containerBg = 'bg-[#060c1c] text-slate-100 border-blue-950';
      headerGradient = 'from-[#060c1c] via-[#0b1730] to-[#040914]';
      navContainerBg = 'bg-[#081226]/95 border-blue-900/60';
      swatchPrimary = '#020612';
      swatchCard = '#0d1d3d';
      previewBg = 'bg-[#060c1c]';
      cardBorder = 'border-blue-900/50';
    } else if (bgTone === 'forest') {
      pageBg = 'bg-[#020c06]';
      containerBg = 'bg-[#05180c] text-emerald-50 border-emerald-950';
      headerGradient = 'from-[#05180c] via-[#092915] to-[#04140a]';
      navContainerBg = 'bg-[#072010]/95 border-emerald-900/60';
      swatchPrimary = '#020c06';
      swatchCard = '#0c2e17';
      previewBg = 'bg-[#05180c]';
      cardBorder = 'border-emerald-900/50';
    } else if (bgTone === 'burgundy') {
      pageBg = 'bg-[#0d0208]';
      containerBg = 'bg-[#170510] text-rose-50 border-rose-950';
      headerGradient = 'from-[#170510] via-[#29081a] to-[#12030b]';
      navContainerBg = 'bg-[#1f0715]/95 border-rose-900/60';
      swatchPrimary = '#0d0208';
      swatchCard = '#2d091e';
      previewBg = 'bg-[#170510]';
      cardBorder = 'border-rose-900/50';
    } else if (bgTone === 'slate') {
      pageBg = 'bg-[#0f172a]';
      containerBg = 'bg-[#1e293b] text-slate-100 border-slate-700';
      headerGradient = 'from-[#1e293b] via-[#334155] to-[#1e293b]';
      navContainerBg = 'bg-[#1e293b]/95 border-slate-700';
      swatchPrimary = '#0f172a';
      swatchCard = '#334155';
      previewBg = 'bg-[#1e293b]';
      cardBorder = 'border-slate-700/60';
    } else if (bgTone === 'light') {
      pageBg = 'bg-slate-200';
      containerBg = 'bg-slate-900 text-slate-100 border-slate-700';
      headerGradient = 'from-slate-900 via-slate-800 to-indigo-950/80';
      navContainerBg = 'bg-slate-800/95 border-slate-700';
      swatchPrimary = '#f8fafc';
      swatchCard = '#ffffff';
      previewBg = 'bg-slate-900';
      cardBorder = 'border-slate-700/60';
    }

    return {
      id: 'custom',
      name: `🎨 กำหนดเอง (${accent})`,
      thaiName: 'ธีมกำหนดเอง',
      emoji: '🎨',
      description: `สีไฮไลท์ ${accent} โทนพื้นหลัง ${bgTone}`,
      badge: 'DIY / ปรับแต่งเอง',
      category: 'all',
      pageBg,
      containerBg,
      headerGradient,
      headerBorder: 'border-slate-700/80',
      navActiveGradient: 'from-sky-500 via-indigo-600 to-purple-600',
      navActiveBorder: 'border-white/80',
      navGlowColor: 'shadow-slate-950/90',
      navContainerBg,
      accentColor: 'sky',
      accentText: 'text-sky-400',
      badgeBg: 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700',
      buttonGradient: 'from-sky-600 via-indigo-600 to-purple-600',
      brandSubColor: 'text-sky-400',
      swatchPrimary,
      swatchAccent: accent,
      swatchCard,
      cardBorder,
      previewBg
    };
  }, [currentTheme, customTheme]);

  const promptpayPayload = useMemo(() => {
    const cleanId = (bankInfo?.no || '').replace(/[^0-9]/g, '');
    if (!cleanId || (cleanId.length !== 10 && cleanId.length !== 13 && cleanId.length !== 15)) {
      return '';
    }
    try {
      const amt = qrAmount && !isNaN(Number(qrAmount)) && Number(qrAmount) > 0 ? Number(qrAmount) : undefined;
      return generatePayload(cleanId, { amount: amt });
    } catch (e) {
      console.error("PromptPay QR generation error:", e);
      return '';
    }
  }, [bankInfo?.no, qrAmount]);

  const handleSelectQrMember = (personName: string) => {
    setSelectedQrPerson(personName);
    if (!personName) {
      setQrCustomName('');
      setQrAmount('');
      return;
    }
    setQrCustomName(personName);
    const debt = debts[personName] || 0;
    if (debt > 0) {
      setQrAmount(Math.ceil(debt).toString());
    } else {
      setQrAmount('');
    }
  };

  const handleDownloadPersonalQR = () => {
    const svg = document.getElementById('personal-promptpay-qr-svg');
    if (!svg) {
      toast.error('ไม่พบ QR Code กรุณาตั้งค่าเลขพร้อมเพย์กองกลางให้ถูกต้อง');
      return;
    }
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const qrSize = 360;
      const padding = 36;
      const headerHeight = 90;
      const footerHeight = 150;

      canvas.width = qrSize + (padding * 2);
      canvas.height = qrSize + headerHeight + footerHeight + (padding * 2);

      if (ctx) {
        ctx.fillStyle = '#ffffff';
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(0, 0, canvas.width, canvas.height, 28);
          ctx.fill();
        } else {
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.fillStyle = '#003b71';
        ctx.fillRect(0, 0, canvas.width, headerHeight);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px "Noto Sans Thai", -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Thai QR Payment | โอนเข้าบัญชีกองกลาง', canvas.width / 2, 54);

        ctx.drawImage(img, padding, headerHeight + padding, qrSize, qrSize);

        const receiverTitle = `โอนเข้าบัญชีกองกลาง: ${bankInfo.user || 'บัญชีกองกลาง'}`;
        const formattedNo = formatPromptPayDisplay(bankInfo.no || '');
        const payerText = selectedQrPerson || qrCustomName ? `ผู้ชำระ: ${selectedQrPerson || qrCustomName}` : '';

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 20px "Noto Sans Thai", -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillText(receiverTitle, canvas.width / 2, headerHeight + qrSize + padding + 36);

        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 18px monospace';
        ctx.fillText(formattedNo, canvas.width / 2, headerHeight + qrSize + padding + 66);

        if (payerText) {
          ctx.fillStyle = '#0284c7';
          ctx.font = 'bold 16px "Noto Sans Thai", -apple-system, BlinkMacSystemFont, sans-serif';
          ctx.fillText(`👤 ${payerText}`, canvas.width / 2, headerHeight + qrSize + padding + 94);
        }

        if (qrAmount && Number(qrAmount) > 0) {
          ctx.fillStyle = '#dc2626';
          ctx.font = 'bold 24px "Noto Sans Thai", -apple-system, BlinkMacSystemFont, sans-serif';
          ctx.fillText(`ยอดชำระ ${Number(qrAmount).toLocaleString()} ฿`, canvas.width / 2, headerHeight + qrSize + padding + 130);
        } else {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '15px "Noto Sans Thai", -apple-system, BlinkMacSystemFont, sans-serif';
          ctx.fillText('(การโอนเงินต้องเข้าบัญชีกองกลางเท่านั้น)', canvas.width / 2, headerHeight + qrSize + padding + 125);
        }

        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        const payerTag = selectedQrPerson || qrCustomName || 'CentralPot';
        downloadLink.download = `PromptPay-CentralPot-${payerTag}-${qrAmount ? qrAmount + 'THB' : 'Open'}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        toast.success('บันทึกรูปภาพ QR พร้อมเพย์กองกลางเรียบร้อยแล้ว!');
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isDevVerified, setIsDevVerified] = useState(() => localStorage.getItem('isDevVerified') === 'true');
  const [pinInput, setPinInput] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{ title: string, message: string, onConfirm: () => void, isDanger?: boolean }>({
    title: '', message: '', onConfirm: () => {}
  });

  // Food Items Search & Filter State
  const [foodSearchQuery, setFoodSearchQuery] = useState('');

  // Batch Multi-Select Deletion State
  const [isBatchSelectMode, setIsBatchSelectMode] = useState(false);
  const [selectedFoodIds, setSelectedFoodIds] = useState<Set<string>>(new Set());
  const [batchRangeInput, setBatchRangeInput] = useState('');
  const foodLongPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);
  
  // Admin Multi-Select Pending Payment Approval State
  const [selectedAdminPaymentIds, setSelectedAdminPaymentIds] = useState<Set<string>>(new Set());
  
  // Form States
  const [newName, setNewName] = useState('');
  const [foodNameRaw, setFoodNameRaw] = useState(() => localStorage.getItem('draft_foodName') || '');
  const setFoodName = (val: string) => {
    setFoodNameRaw(val);
    localStorage.setItem('draft_foodName', val);
  };

  const [foodPriceRaw, setFoodPriceRaw] = useState(() => localStorage.getItem('draft_foodPrice') || '');
  const setFoodPrice = (val: string) => {
    setFoodPriceRaw(val);
    localStorage.setItem('draft_foodPrice', val);
  };

  const [foodCook, setFoodCookRaw] = useState(() => localStorage.getItem('draft_foodCook') || '');
  const setFoodCook = (val: string) => {
    setFoodCookRaw(val);
    localStorage.setItem('draft_foodCook', val);
  };

  const [foodCreatedBy, setFoodCreatedByRaw] = useState(() => localStorage.getItem('draft_foodCreatedBy') || '');
  const setFoodCreatedBy = (val: string) => {
    setFoodCreatedByRaw(val);
    localStorage.setItem('draft_foodCreatedBy', val);
  };

  const [isFreeMedicine, setIsFreeMedicine] = useState<boolean>(false);

  // LINE Sharing states
  const [isLinePotsModalOpen, setIsLinePotsModalOpen] = useState(false);
  const [isLineUnpaidModalOpen, setIsLineUnpaidModalOpen] = useState(false);
  const [isLineSingleItemModalOpen, setIsLineSingleItemModalOpen] = useState(false);
  const [lineShareText, setLineShareText] = useState('');
  const [lineRangeInputRaw, setLineRangeInputRaw] = useState('26-50');

  // PWA & Installation states
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // App Welcome Entrance states
  const [currentUser, setCurrentUser] = useState<string | null>(() => localStorage.getItem('currentUser'));
  const isAdminUser = isDevVerified || (currentUser ? ['บัง', 'แป้ง', 'อั้ม'].includes(currentUser) : false);
  const [hasEnteredApp, setHasEnteredApp] = useState(() => localStorage.getItem('hasEnteredApp') === 'true');
  const [welcomeStep, setWelcomeStep] = useState<'landing' | 'select'>('landing');
  const [welcomeNameInput, setWelcomeNameInput] = useState('');
  const [selectedWelcomePersonId, setSelectedWelcomePersonId] = useState<string>('guest');
  const [isJoinNewOpen, setIsJoinNewOpen] = useState(false);
  const [welcomeTab, setWelcomeTab] = useState<'select' | 'register'>('select');

  // Platform & In-App Browser Detection for Mobile Compatibility
  const [isInApp, setIsInApp] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || '';
    const isLine = /Line/i.test(ua);
    const isFb = /FBAN|FBAV|Messenger/i.test(ua);
    setIsInApp(isLine || isFb);
    
    const ios = /iPhone|iPad|iPod/i.test(ua);
    setIsIOS(ios);
    setIsAndroid(/Android/i.test(ua));

    // Detect if running in standalone mode (installed as PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    
    // Check if the iOS prompt was previously dismissed
    const isDismissed = localStorage.getItem('ios_prompt_dismissed') === 'true';

    if (ios && !isStandalone && !isDismissed) {
      setShowIOSPrompt(true);
    }
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.info('คลิกสามจุดด้านบนของเบราว์เซอร์ แล้วเลือก เพิ่มลงในหน้าจอหลัก');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
      toast.success('ดาวน์โหลดและติดตั้งแอปสำเร็จ!');
    }
  };

  const foodName = foodNameRaw;
  const foodPrice = foodPriceRaw;

  const [selectedEaters, setSelectedEatersRaw] = useState<Record<string, number>>(() => {
    const cached = localStorage.getItem('draft_selectedEaters');
    return cached ? JSON.parse(cached) : {};
  });
  const setSelectedEaters = (val: Record<string, number> | ((prev: Record<string, number>) => Record<string, number>)) => {
    setSelectedEatersRaw(prev => {
      const newVal = typeof val === 'function' ? val(prev) : val;
      localStorage.setItem('draft_selectedEaters', JSON.stringify(newVal));
      return newVal;
    });
  };

  const [splitMode, setSplitMode] = useState<'equal' | 'shot' | 'proportional'>('equal');
  const [proportionalInputs, setProportionalInputs] = useState<Record<string, string>>({});

  const [targetPayment, setTargetPayment] = useState<{ name: string, amount: number, foodId?: string, payerAmount?: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [selectedPots, setSelectedPotsRaw] = useState<Record<string, string[]>>(() => {
    const cached = localStorage.getItem('draft_selectedPots');
    return cached ? JSON.parse(cached) : {};
  });
  const setSelectedPots = (val: Record<string, string[]> | ((prev: Record<string, string[]>) => Record<string, string[]>)) => {
    setSelectedPotsRaw(prev => {
      const newVal = typeof val === 'function' ? val(prev) : val;
      localStorage.setItem('draft_selectedPots', JSON.stringify(newVal));
      return newVal;
    });
  };
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);
  const [optimisticPayments, setOptimisticPayments] = useState<Payment[]>([]);

  const [viewingSlip, setViewingSlip] = useState<string | null>(null);
  const [viewingDigitalReceipt, setViewingDigitalReceipt] = useState<Payment | null>(null);
  const [localSlipPreviews, setLocalSlipPreviews] = useState<Record<string, string>>({}); // New: for optimistic image display
  const [isUploadingHistoryId, setIsUploadingHistoryId] = useState<string | null>(null);
  const historyFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const [isUpdatingAvatarPersonId, setIsUpdatingAvatarPersonId] = useState<string | null>(null);
  const [longPressPersonId, setLongPressPersonId] = useState<string | null>(null);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTouchStartAvatar = (personId: string) => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      setLongPressPersonId(personId);
      setIsAvatarMenuOpen(true);
    }, 500);
  };

  const handleTouchEndAvatar = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };
  const [editingCreditPersonId, setEditingCreditPersonId] = useState<string | null>(null);
  const [tempCreditValue, setTempCreditValue] = useState<string>('');
  const payModalFileInputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const [uploadedSlipUrl, setUploadedSlipUrl] = useState<string | null>(null);
  const [selectedSlipFile, setSelectedSlipFile] = useState<File | null>(null);
  const [isUploadingSlip, setIsUploadingSlip] = useState(false);

  // States for live payment notifications (Admin Panel / Real-time Popup)
  const [lastCheckedPayments, setLastCheckedPayments] = useState<Payment[]>([]);
  const [activePendingAlert, setActivePendingAlert] = useState<Payment | null>(null);
  const [highlightPaymentId, setHighlightPaymentId] = useState<string | null>(null);

  // Leaderboard tab state
  const [leaderboardTab, setLeaderboardTab] = useState<'all' | 'cook' | 'writer'>('all');



  const playNotificationChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain1.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gain2.gain.setValueAtTime(0.1, audioCtx.currentTime + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.2);
      osc2.start(audioCtx.currentTime + 0.1);
      osc2.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.error('Audio context error:', e);
    }
  };

  const scrollToHistory = () => {
    setViewingDigitalReceipt(null);
    setTimeout(() => {
      historyRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Filter States
  const [historyFilterPerson, setHistoryFilterPerson] = useState<string>('all');
  const [historyFilterStartDate, setHistoryFilterStartDate] = useState<string>('');
  const [historyFilterEndDate, setHistoryFilterEndDate] = useState<string>('');

  // --- Actions & Data Sync ---
  useEffect(() => {
    // Test connection
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'config', 'global'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();

    // Sync Global Config
    const unsubConfig = onSnapshot(doc(db, 'config', 'global'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.bank) {
          setBankInfo(data.bank);
          localStorage.setItem('cache_bankInfo', JSON.stringify(data.bank));
        }
        if (data.appLogo) {
          if (typeof data.appLogo === 'string' && (data.appLogo.startsWith('data:image/') || data.appLogo.startsWith('http://') || data.appLogo.startsWith('https://') || data.appLogo.startsWith('/'))) {
            setCurrentAppLogo(data.appLogo);
            localStorage.setItem('cache_appLogo', data.appLogo);
          }
        }
      }
      setDataLoaded(prev => ({ ...prev, config: true }));
    }, (err) => handleFirestoreError(err, OperationType.GET, 'config/global'));

    // Sync People
    const qPeople = query(collection(db, 'people'), orderBy('order', 'asc'), orderBy('createdAt', 'asc'));
    const unsubPeople = onSnapshot(qPeople, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Person));
      setPeople(data);
      localStorage.setItem('cache_people', JSON.stringify(data));
      setDataLoaded(prev => ({ ...prev, people: true }));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'people'));

    // Sync Foods
    const qFoods = query(collection(db, 'foods'), orderBy('createdAt', 'asc'));
    const unsubFoods = onSnapshot(qFoods, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as FoodItem));
      data.sort((a, b) => {
        const numA = a.name.match(/\d+/);
        const numB = b.name.match(/\d+/);
        if (numA && numB) {
          const valA = parseInt(numA[0], 10);
          const valB = parseInt(numB[0], 10);
          if (valA !== valB) return valA - valB;
        }
        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
        return timeA - timeB;
      });
      setFoods(data);
      localStorage.setItem('cache_foods', JSON.stringify(data));
      setDataLoaded(prev => ({ ...prev, foods: true }));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'foods'));

    // Sync Payments
    const qPayments = query(collection(db, 'payments'));
    const unsubPayments = onSnapshot(qPayments, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Payment));
      data.sort((a, b) => {
        const getEffectiveTime = (p: Payment) => {
          const t = (p.status === 'approved' && p.approvedAt) ? p.approvedAt : p.timestamp;
          if (!t) return Date.now();
          if (typeof t === 'object' && 'toDate' in t && typeof (t as any).toDate === 'function') {
            return (t as any).toDate().getTime();
          }
          const parsed = new Date(t).getTime();
          return isNaN(parsed) ? Date.now() : parsed;
        };
        return getEffectiveTime(b) - getEffectiveTime(a);
      });
      setPayments(data);
      localStorage.setItem('cache_payments', JSON.stringify(data));
      setDataLoaded(prev => ({ ...prev, payments: true }));
    }, (err) => console.error('Payments sync error:', err));

    // Sync Credit Requests
    const qCreditReqs = query(collection(db, 'creditRequests'));
    const unsubCreditReqs = onSnapshot(qCreditReqs, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as CreditRequest));
      data.sort((a, b) => {
        const tA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : Date.now());
        const tB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : Date.now());
        return tB - tA;
      });
      setCreditRequests(data);
    }, (err) => console.error('Credit requests sync error:', err));

    return () => {
      unsubConfig();
      unsubPeople();
      unsubFoods();
      unsubPayments();
      unsubCreditReqs();
    };
  }, []);

  // --- Calculations ---
  // personSharePerFood[foodId][personName] = share
  const personSharePerFood = useMemo(() => {
    const shares: Record<string, Record<string, number>> = {};
    foods.forEach(f => {
      shares[f.id] = {};
      const totalWeight = f.eaters.reduce((sum, e) => sum + e.weight, 0);
      if (totalWeight === 0) return;
      const unitPrice = f.price / totalWeight;
      f.eaters.forEach(e => {
        shares[f.id][e.name] = Math.ceil(unitPrice * e.weight);
      });
    });
    return shares;
  }, [foods]);

  const combinedPayments = useMemo(() => {
    const map = new Map<string, Payment>();
    payments.forEach(p => map.set(p.id, p));
    optimisticPayments.forEach(p => map.set(p.id, p));
    const list = Array.from(map.values());
    list.sort((a, b) => {
      const getEffectiveTime = (p: Payment) => {
        const t = (p.status === 'approved' && p.approvedAt) ? p.approvedAt : p.timestamp;
        if (!t) return Date.now();
        if (typeof t === 'object' && 'toDate' in t && typeof (t as any).toDate === 'function') {
          return (t as any).toDate().getTime();
        }
        const parsed = new Date(t).getTime();
        return isNaN(parsed) ? Date.now() : parsed;
      };
      return getEffectiveTime(b) - getEffectiveTime(a);
    });
    return list;
  }, [payments, optimisticPayments]);

  // personPaidTotal[personName] = total amount paid across all payments (only count approved or legacy payments)
  const personPaidTotal = useMemo(() => {
    const paid: Record<string, number> = {};
    const approvedPayments = combinedPayments.filter(p => !p.status || p.status === 'approved');
    approvedPayments.forEach(pay => {
      paid[pay.personName] = (paid[pay.personName] || 0) + pay.amount;
    });
    return paid;
  }, [combinedPayments]);

  // personPendingTotal[personName] = total amount pending across all pending payments
  const personPendingTotal = useMemo(() => {
    const pending: Record<string, number> = {};
    const pendingPays = combinedPayments.filter(p => p.status === 'pending');
    pendingPays.forEach(pay => {
      pending[pay.personName] = (pending[pay.personName] || 0) + pay.amount;
    });
    return pending;
  }, [combinedPayments]);

  const pendingPaymentsList = useMemo(() => {
    return combinedPayments.filter(p => p.status === 'pending');
  }, [combinedPayments]);

  useEffect(() => {
    if (!combinedPayments || combinedPayments.length === 0) return;
    
    // Check if any payment was updated to 'approved' or 'rejected' in real time by an admin
    if (lastCheckedPayments.length > 0) {
      const oldPendingMap = new Map(lastCheckedPayments.filter(p => p.status === 'pending').map(p => [p.id, p]));
      
      const newlyApproved = combinedPayments.find(p => p.status === 'approved' && oldPendingMap.has(p.id));
      if (newlyApproved) {
        playNotificationChime();
        const approverText = newlyApproved.approvedBy ? ` (โดย ${newlyApproved.approvedBy})` : '';
        toast.success(`✅ [แจ้งเตือนเรียลไทม์] อนุมัติสลิปโอนเงินของ ${newlyApproved.personName} (${Math.ceil(newlyApproved.amount).toLocaleString()} ฿)${approverText} เรียบร้อยแล้ว! (เด้งเข้าประวัติเรียลไทม์ ✨)`);
        
        // Highlight in history immediately
        setHistoryFilterPerson('all');
        setHighlightPaymentId(newlyApproved.id);
        setTimeout(() => setHighlightPaymentId(null), 10000);

        // Auto-dismiss or update active pending alert modal if it was open for this payment
        setActivePendingAlert(prev => (prev && (prev.id === newlyApproved.id || (prev.personName === newlyApproved.personName && Math.abs(prev.amount - newlyApproved.amount) < 1))) ? null : prev);
      }

      const newlyRejected = combinedPayments.find(p => p.status === 'rejected' && oldPendingMap.has(p.id));
      if (newlyRejected) {
        playNotificationChime();
        const rejecterText = newlyRejected.rejectedBy ? ` (โดย ${newlyRejected.rejectedBy})` : '';
        toast.error(`❌ [แจ้งเตือนแอดมินเรียลไทม์] ปฏิเสธสลิปโอนเงินของ ${newlyRejected.personName} (${Math.ceil(newlyRejected.amount).toLocaleString()} ฿)${rejecterText}`);
        
        setActivePendingAlert(prev => (prev && (prev.id === newlyRejected.id || (prev.personName === newlyRejected.personName && Math.abs(prev.amount - newlyRejected.amount) < 1))) ? null : prev);
      }

      // Check if new pending payment arrived
      if (isAdminUser) {
        const currentPending = combinedPayments.filter(p => p.status === 'pending');
        const oldPendingIds = new Set(lastCheckedPayments.filter(p => p.status === 'pending').map(p => p.id));
        const newPending = currentPending.find(p => !oldPendingIds.has(p.id));
        if (newPending) {
          setActivePendingAlert(newPending);
          playNotificationChime();
          toast.info(`🔔 มีสลิป/แจ้งโอนเงินใหม่จาก ${newPending.personName} (${Math.ceil(newPending.amount).toLocaleString()} ฿) - ส่งแจ้งเตือนแอดมินเรียลไทม์ (บัง, แป้ง, อั้ม) ⚡`);
        }
      }
    } else {
      if (isAdminUser) {
        const currentPending = combinedPayments.filter(p => p.status === 'pending');
        if (currentPending.length > 0) {
          setActivePendingAlert(currentPending[0]);
          playNotificationChime();
        }
      }
    }
    
    setLastCheckedPayments(combinedPayments);
  }, [combinedPayments, isAdminUser]);

  const personShareTotal = useMemo(() => {
    const totals: Record<string, number> = {};
    people.forEach(p => {
      let sum = 0;
      foods.forEach(f => {
        sum += personSharePerFood[f.id]?.[p.name] || 0;
      });
      totals[p.name] = sum;
    });
    return totals;
  }, [people, foods, personSharePerFood]);

  const personSharePerCategory = useMemo(() => {
    const categoryShare: Record<string, { food: number; water: number; electricity: number; gas: number; other: number }> = {};
    people.forEach(p => {
      categoryShare[p.name] = { food: 0, water: 0, electricity: 0, gas: 0, other: 0 };
    });

    foods.forEach(f => {
      const isFood = !f.category || f.category === 'food';
      f.eaters.forEach(e => {
        if (categoryShare[e.name]) {
          const share = personSharePerFood[f.id]?.[e.name] || 0;
          if (isFood) {
            categoryShare[e.name].food += share;
          } else {
            categoryShare[e.name].other += share;
            if (f.category === 'water') {
              categoryShare[e.name].water += share;
            } else if (f.category === 'electricity') {
              categoryShare[e.name].electricity += share;
            } else if (f.category === 'gas') {
              categoryShare[e.name].gas += share;
            }
          }
        }
      });
    });
    return categoryShare;
  }, [people, foods, personSharePerFood]);

  const debts = useMemo(() => {
    const d: Record<string, number> = {};
    people.forEach(p => {
      const shares = personSharePerCategory[p.name] || { food: 0, water: 0, electricity: 0, gas: 0, other: 0 };
      const paid = personPaidTotal[p.name] || 0;
      const credit = p.credit || 0;
      
      const netFood = Math.max(0, shares.food - credit);
      const remaining = netFood + shares.other - paid;
      d[p.name] = remaining <= 0.01 ? 0 : Math.ceil(remaining);
    });
    return d;
  }, [people, personSharePerCategory, personPaidTotal]);

  const paidFoodIdsPerPerson = useMemo(() => {
    const paid: Record<string, Set<string>> = {};
    combinedPayments
      .filter(p => !p.status || p.status === 'approved')
      .forEach(pay => {
        if (!paid[pay.personName]) paid[pay.personName] = new Set();
        if (pay.foodId) {
          pay.foodId.split(',').forEach(id => {
            const trimmed = id.trim();
            if (trimmed) paid[pay.personName].add(trimmed);
          });
        }
      });

    people.forEach(p => {
      const owed = debts[p.name] ?? 0;
      const totalDebt = personShareTotal[p.name] ?? 0;
      if (owed <= 0 && totalDebt > 0) {
        if (!paid[p.name]) paid[p.name] = new Set();
        foods.forEach(f => {
          if (f.eaters.some(e => e.name === p.name)) {
            paid[p.name].add(f.id);
          }
        });
      }
    });

    return paid;
  }, [combinedPayments, people, debts, personShareTotal, foods]);

  const paidAmounts = useMemo(() => {
    return personPaidTotal;
  }, [personPaidTotal]);

  const totalPotPrice = useMemo(() => foods.reduce<number>((sum, f) => sum + f.price, 0), [foods]);
  const totalPaidPrice = useMemo(() => 
    combinedPayments
      .filter(p => !p.status || p.status === 'approved')
      .reduce((sum, p) => sum + p.amount, 0), 
    [combinedPayments]
  );

  const monthlyExpenseData = useMemo(() => {
    const map: Record<string, { monthKey: string; timestamp: number; total: number; count: number }> = {};
    
    foods.forEach(f => {
      if (!f.createdAt) return;
      const dateObj = f.createdAt?.toDate ? f.createdAt.toDate() : new Date(f.createdAt);
      if (isNaN(dateObj.getTime())) return;
      
      const info = getThaiDateTime(f.createdAt);
      const key = `${info.monthText} ${info.y}`;
      const monthStartTimestamp = new Date(dateObj.getFullYear(), dateObj.getMonth(), 1).getTime();
      
      if (!map[key]) {
        map[key] = { monthKey: key, timestamp: monthStartTimestamp, total: 0, count: 0 };
      }
      map[key].total += (f.price || 0);
      map[key].count += 1;
    });

    return Object.values(map).sort((a, b) => a.timestamp - b.timestamp);
  }, [foods]);

  const categoryExpenseData = useMemo(() => {
    const summary: Record<string, { key: string; name: string; shortName: string; value: number; count: number; color: string; bgBadge: string; icon: string }> = {
      food: { key: 'food', name: 'ค่าต้ม (ยาต้ม/อาหาร)', shortName: 'ต้ม', value: 0, count: 0, color: '#6366f1', bgBadge: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60', icon: '🍲' },
      water: { key: 'water', name: 'ค่าน้ำ', shortName: 'น้ำ', value: 0, count: 0, color: '#0284c7', bgBadge: 'bg-sky-950/80 text-sky-300 border-sky-700/60', icon: '💧' },
      electricity: { key: 'electricity', name: 'ค่าไฟ', shortName: 'ไฟ', value: 0, count: 0, color: '#f59e0b', bgBadge: 'bg-amber-950/80 text-amber-300 border-amber-700/60', icon: '⚡' },
      gas: { key: 'gas', name: 'ค่าแก๊ส', shortName: 'แก๊ส', value: 0, count: 0, color: '#f97316', bgBadge: 'bg-orange-950/80 text-orange-300 border-orange-700/60', icon: '🔥' },
    };

    foods.forEach(f => {
      const cat = f.category && summary[f.category] ? f.category : 'food';
      summary[cat].value += (f.price || 0);
      summary[cat].count += 1;
    });

    const total = Object.values(summary).reduce((sum, item) => sum + item.value, 0);

    const list = Object.values(summary).map(item => ({
      ...item,
      percent: total > 0 ? (item.value / total) * 100 : 0
    }));

    const sorted = [...list].sort((a, b) => b.value - a.value);
    const dominant = sorted[0]?.value > 0 ? sorted[0] : null;

    return {
      items: list,
      chartData: list.filter(item => item.value > 0),
      total,
      dominant,
      activeCategoriesCount: list.filter(item => item.value > 0).length
    };
  }, [foods]);

  const leaderboardData = useMemo(() => {
    const potFoods = foods.filter(f => !f.category || f.category === 'food');
    const totalPots = potFoods.length;

    // 1. Cooks map
    const cooksMap: Record<string, { name: string; totalPots: number; regularPots: number; freePots: number; totalCost: number }> = {};
    // 2. Writers map
    const writersMap: Record<string, { name: string; totalPots: number; regularPots: number; freePots: number; totalCost: number }> = {};

    potFoods.forEach(f => {
      if (f.cook && f.cook.trim()) {
        const cookName = f.cook.trim();
        if (!cooksMap[cookName]) {
          cooksMap[cookName] = { name: cookName, totalPots: 0, regularPots: 0, freePots: 0, totalCost: 0 };
        }
        cooksMap[cookName].totalPots += 1;
        if (f.isFreeMedicine) {
          cooksMap[cookName].freePots += 1;
        } else {
          cooksMap[cookName].regularPots += 1;
        }
        cooksMap[cookName].totalCost += (f.price || 0);
      }

      const writerName = (f.createdBy || '').trim();
      if (writerName) {
        if (!writersMap[writerName]) {
          writersMap[writerName] = { name: writerName, totalPots: 0, regularPots: 0, freePots: 0, totalCost: 0 };
        }
        writersMap[writerName].totalPots += 1;
        if (f.isFreeMedicine) {
          writersMap[writerName].freePots += 1;
        } else {
          writersMap[writerName].regularPots += 1;
        }
        writersMap[writerName].totalCost += (f.price || 0);
      }
    });

    const cooksList = Object.values(cooksMap)
      .sort((a, b) => b.totalPots - a.totalPots || b.totalCost - a.totalCost);

    const writersList = Object.values(writersMap)
      .sort((a, b) => b.totalPots - a.totalPots || b.totalCost - a.totalCost);

    const allNames = Array.from(new Set([...Object.keys(cooksMap), ...Object.keys(writersMap)]));
    const combinedList = allNames.map(name => {
      const cookStat = cooksMap[name] || { totalPots: 0, regularPots: 0, freePots: 0, totalCost: 0 };
      const writerStat = writersMap[name] || { totalPots: 0, regularPots: 0, freePots: 0, totalCost: 0 };
      const totalActs = cookStat.totalPots + writerStat.totalPots;
      const score = (cookStat.totalPots * 2) + (writerStat.totalPots * 1);
      return {
        name,
        cookCount: cookStat.totalPots,
        writerCount: writerStat.totalPots,
        regularPots: cookStat.regularPots + writerStat.regularPots,
        freePots: cookStat.freePots + writerStat.freePots,
        totalActs,
        score,
        totalCost: cookStat.totalCost
      };
    })
    .sort((a, b) => b.score - a.score || b.totalActs - a.totalActs || b.cookCount - a.cookCount);

    return {
      cooksList,
      writersList,
      combinedList,
      totalPots,
      topCook: cooksList[0] || null,
      topWriter: writersList[0] || null,
      topMVP: combinedList[0] || null
    };
  }, [foods]);

  const unpaidCount = useMemo(() => {
    return people.filter(p => (debts[p.name] || 0) > 0).length;
  }, [people, debts]);

  const personHistory = useMemo(() => {
    const history: Record<string, Payment[]> = {};
    combinedPayments.forEach(p => {
      if (!history[p.personName]) history[p.personName] = [];
      history[p.personName].push(p);
    });
    return history;
  }, [combinedPayments]);

  const personSlipCount = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.entries(personHistory as Record<string, Payment[]>).forEach(([name, history]) => {
      counts[name] = history.filter(h => h.slipUrl).length;
    });
    return counts;
  }, [personHistory]);

  const formatThaiFullDate = (timestamp: any) => {
    const info = getThaiDateTime(timestamp);
    return `วันที่ ${info.d} ${info.monthText} ${info.y}`;
  };

  const getThaiTime = (timestamp: any) => {
    if (!timestamp) return '';
    const info = getThaiDateTime(timestamp);
    return `${info.hh}:${info.mm}`;
  };

  const generateLinePotsText = (foodsList: FoodItem[]) => {
    const onlyPots = foodsList.filter(f => !f.category || f.category === 'food');
    const sortedPots = [...onlyPots].sort((a, b) => {
      const numA = a.name.match(/\d+/);
      const numB = b.name.match(/\d+/);
      if (numA && numB) {
        const valA = parseInt(numA[0], 10);
        const valB = parseInt(numB[0], 10);
        if (valA !== valB) return valA - valB;
      }
      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
      return timeA - timeB;
    });

    const totalPotsPrice = onlyPots.reduce((sum, f) => sum + (f.price || 0), 0);
    const avgPotPrice = onlyPots.length > 0 ? Math.ceil(totalPotsPrice / onlyPots.length) : 0;

    const groups: Record<string, FoodItem[]> = {};
    sortedPots.forEach(f => {
      const dateStr = formatThaiFullDate(f.createdAt);
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(f);
    });

    let text = `ค่ากระท่อม\n`;
    text += `📍 ทั้งหมด ${onlyPots.length} ขวด 📍\n`;
    text += `ต้มหม้อละ ${avgPotPrice > 0 ? `${avgPotPrice.toLocaleString()} บาท` : '— บ.'}\n`;
    if (sortedPots.length > 0) {
      const firstDate = sortedPots[0].createdAt;
      const info = getThaiDateTime(firstDate);
      const d = info.d;
      const m = String(info.m).padStart(2, '0');
      const y = String(info.y).slice(-2);
      text += `( เปิดวันที่ ${d}/${m}/${y} )\n`;
    } else {
      text += `( เปิดวันที่ - )\n`;
    }
    text += `\n`;
    if (bankInfo.name) {
      text += `${bankInfo.name}\n`;
    }
    if (bankInfo.user) {
      text += `${bankInfo.user}\n`;
    }
    if (bankInfo.no) {
      text += `${bankInfo.no}\n`;
    }
    text += `------------------------------\n\n`;

    const groupEntries = Object.entries(groups);
    groupEntries.forEach(([dateStr, items], gIndex) => {
      text += `📅 ${dateStr}\n\n`;
      items.forEach(f => {
        const potNum = sortedPots.findIndex(p => p.id === f.id) + 1;
        const timeStr = getThaiTime(f.createdAt) ? ` ${getThaiTime(f.createdAt)} น.` : ` _ น.`;
        const displayName = f.name.includes("ยาขวด") || f.name.includes("หม้อ") ? f.name : `ยาขวดที่ ${potNum} (${f.name})`;
        text += `[ 📍 ] (เวลา${timeStr}) ${displayName}\n`;
        text += `ต้มหม้อละ : ${f.price} บาท\n`;

        const fullEaters = f.eaters.filter(e => e.weight === 1);
        const halfEaters = f.eaters.filter(e => e.weight === 0.5);

        const totalWeight = f.eaters.reduce((sum, e) => sum + e.weight, 0);
        const fullShare = fullEaters.length > 0 
          ? (personSharePerFood[f.id]?.[fullEaters[0].name] || Math.ceil(f.price / (totalWeight || 1))) 
          : null;

        const halfShare = halfEaters.length > 0 
          ? (personSharePerFood[f.id]?.[halfEaters[0].name] || Math.ceil((f.price / (totalWeight || 1)) * 0.5)) 
          : null;

        const formatEater = (e: Eater) => {
          const hasPaid = paidFoodIdsPerPerson[e.name]?.has(f.id);
          return hasPaid ? `${e.name}✅` : e.name;
        };

        const fullEatersText = fullEaters.length > 0 ? fullEaters.map(formatEater).join(' ') : '-';
        text += `คนกิน : ${fullEatersText}\n`;
        text += `คนละ : ${fullShare ? `${fullShare} บาท` : '-'}\n`;

        const halfEatersText = halfEaters.length > 0 ? halfEaters.map(formatEater).join(' ') : '-';
        text += `กินครึ่งหม้อ : ${halfEatersText}\n`;
        text += `คนละ : ${halfShare ? `${halfShare} บาท` : '-'}\n`;

        if (f.cook || f.createdBy) {
          let metaParts: string[] = [];
          if (f.cook) metaParts.push(`" ${f.cook} " เป็นคนต้ม`);
          if (f.createdBy) metaParts.push(`" ${f.createdBy} " เป็นคนเขียน`);
          text += `[ ${metaParts.join(' | ')} ]\n`;
        } else {
          text += `[ " - " เป็นคนต้ม ]\n`;
        }
        text += `\n`;
      });

      if (gIndex < groupEntries.length - 1) {
        text += `------------------------------\n\n`;
      }
    });

    return text;
  };

  const generateLineUnpaidText = (rangeName: string = "26-50") => {
    let text = "";
    const sortedPeople = [...people].sort((a, b) => {
      const debtA = debts[a.name] || 0;
      const debtB = debts[b.name] || 0;
      if (debtB !== debtA) return debtB - debtA;
      return (a.order || 99) - (b.order || 99);
    });

    sortedPeople.forEach(p => {
      const unpaidPots = foods.filter(f => {
        const isFood = !f.category || f.category === 'food';
        const isEater = f.eaters.some(e => e.name === p.name);
        const hasPaid = paidFoodIdsPerPerson[p.name]?.has(f.id);
        return isFood && isEater && !hasPaid;
      });

      if (unpaidPots.length > 0) {
        const sortedUnpaid = [...unpaidPots].sort((a, b) => {
          const numA = a.name.match(/\d+/);
          const numB = b.name.match(/\d+/);
          if (numA && numB) {
            const valA = parseInt(numA[0], 10);
            const valB = parseInt(numB[0], 10);
            if (valA !== valB) return valA - valB;
          }
          const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
          const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
          return timeA - timeB;
        });

        const shares = sortedUnpaid.map(f => Math.ceil(personSharePerFood[f.id]?.[p.name] || 0));
        const totalUnpaid = shares.reduce((acc, s) => acc + s, 0);

        const additionStr = shares.length > 1 ? ` (${shares.join('+')})` : '';
        text += `${p.name}  ${totalUnpaid}${additionStr}\n\n`;
      }
    });

    return text.trim();
  };

  const generateSingleItemShareText = (f: FoodItem) => {
    const info = getThaiDateTime(f.createdAt);
    const yShort = String(info.y).slice(-2);
    const dateStr = `วันที่ ${info.d}/${info.m}/${yShort}`;
    
    let typeName = f.isFreeMedicine ? "หม้อยาฟรี" : "ค่าต้ม";
    if (f.category === 'water') typeName = "ค่าน้ำ";
    else if (f.category === 'electricity') typeName = "ค่าไฟ";
    else if (f.category === 'gas') typeName = "ค่าแก๊ส";
    
    let titleStr = '';
    if (f.category && f.category !== 'food') {
      titleStr = f.name.includes(typeName) ? f.name : `${typeName} - ${f.name}`;
    } else {
      titleStr = f.name;
      if (!titleStr.includes(typeName)) {
        titleStr = `${typeName} - ${titleStr}`;
      }
    }

    const totalWeight = f.eaters.reduce((sum, eat) => sum + (eat.weight || 1), 0);
    const baseShare = f.price / (totalWeight || 1);
    const allEqual = f.eaters.every(e => e.weight === (f.eaters[0]?.weight || 1));
    
    let text = '';
    if (allEqual) {
      const shareVal = Math.ceil(f.price / (f.eaters.length || 1));
      text = `${titleStr} ${dateStr}  คนละ ${shareVal.toLocaleString()} บาท\n`;
    } else {
      text = `${titleStr} ${dateStr} (ยอดรวม ${Math.ceil(f.price).toLocaleString()} บาท)\n`;
    }

    f.eaters.forEach(e => {
      const hasPaid = paidFoodIdsPerPerson[e.name]?.has(f.id);
      const weightStr = e.weight > 1 ? ` (${e.weight} ช็อต)` : e.weight === 0.5 ? ' (ครึ่ง)' : '';
      const eaterShare = Math.ceil(baseShare * (e.weight || 1));
      const shareDisplay = allEqual ? '' : ` (${eaterShare.toLocaleString()} บ.)`;
      const suffix = hasPaid ? '✅' : '';
      text += `${e.name}${suffix}${weightStr}${shareDisplay}\n`;
    });

    return text.trim();
  };

  const generateTabUnpaidShareText = (category: 'water' | 'electricity' | 'gas') => {
    let typeName = "ค่าน้ำ";
    if (category === 'electricity') typeName = "ค่าไฟ";
    else if (category === 'gas') typeName = "ค่าแก๊ส";

    let text = `📋 ยอดค้าง${typeName}ทั้งหมด\n\n`;
    const catItems = foods.filter(f => f.category === category);
    
    catItems.forEach((f, index) => {
      const info = getThaiDateTime(f.createdAt);
      const yShort = String(info.y).slice(-2);
      const dateStr = `${info.d}/${info.m}/${yShort}`;
      const totalWeight = f.eaters.reduce((sum, eat) => sum + (eat.weight || 1), 0);
      const baseShare = f.price / (totalWeight || 1);
      const allEqual = f.eaters.every(e => e.weight === (f.eaters[0]?.weight || 1));
      
      let titleStr = f.name;
      if (!titleStr.includes(typeName)) {
        titleStr = `${typeName} - ${titleStr}`;
      }

      if (allEqual) {
        const shareVal = Math.ceil(f.price / (f.eaters.length || 1));
        text += `${titleStr} วันที่ ${dateStr}  คนละ ${shareVal.toLocaleString()} บาท\n`;
      } else {
        text += `${titleStr} วันที่ ${dateStr} (ยอดรวม ${Math.ceil(f.price).toLocaleString()} บ.)\n`;
      }

      f.eaters.forEach(e => {
        const hasPaid = paidFoodIdsPerPerson[e.name]?.has(f.id);
        const weightStr = e.weight === 0.5 ? ' (ครึ่ง)' : '';
        const eaterShare = Math.ceil(baseShare * (e.weight || 1));
        const shareDisplay = allEqual ? '' : ` (${eaterShare.toLocaleString()} บ.)`;
        const suffix = hasPaid ? '✅' : '';
        text += `${e.name}${suffix}${weightStr}${shareDisplay}\n`;
      });
      text += `\n`;
    });

    return text.trim();
  };

  const setLineRangeInput = (val: string) => {
    setLineRangeInputRaw(val);
    setLineShareText(generateLineUnpaidText(val));
  };

  const triggerLineNotify = async (message: string) => {
    try {
      const response = await fetch("/api/line-notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      if (response.ok) {
        const data = await response.json();
        console.log("LINE Notify status:", data.status || "completed");
      }
    } catch (e) {
      // Quietly handle client-side network offline state
    }
  };

  const filteredPayments = useMemo(() => {
    let filtered = combinedPayments;
    
    if (historyFilterPerson !== 'all') {
      filtered = filtered.filter(p => p.personName === historyFilterPerson);
    }
    
    if (historyFilterStartDate) {
      const start = new Date(historyFilterStartDate);
      start.setHours(0, 0, 0, 0);
      filtered = filtered.filter(p => {
        const date = p.timestamp.toDate ? p.timestamp.toDate() : new Date(p.timestamp);
        return date >= start;
      });
    }
    
    if (historyFilterEndDate) {
      const end = new Date(historyFilterEndDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(p => {
        const date = p.timestamp.toDate ? p.timestamp.toDate() : new Date(p.timestamp);
        return date <= end;
      });
    }
    
    return filtered;
  }, [combinedPayments, historyFilterPerson, historyFilterStartDate, historyFilterEndDate]);

  const filteredTotal = useMemo(() => {
    return filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  }, [filteredPayments]);

  // --- Actions ---
  const triggerConfirm = (title: string, message: string, onConfirm: () => void, isDanger = false) => {
    setConfirmConfig({ title, message, onConfirm, isDanger });
    setIsConfirmOpen(true);
  };

  const copyBankInfo = () => {
    if (!bankInfo.no) {
      toast.error('กรุณาตั้งค่าเลขบัญชีในเมนูแอดมิน');
      return;
    }
    const textToCopy = `${bankInfo.name} ${bankInfo.no} ${bankInfo.user}`;
    navigator.clipboard.writeText(textToCopy);
    toast.success('คัดลอกข้อมูลบัญชีแล้ว');
  };

  const handleAddPerson = async () => {
    if (!newName.trim()) return;
    if (people.some(p => p.name === newName.trim())) {
      toast.error('มีชื่อนี้อยู่ในกลุ่มแล้ว');
      return;
    }
    
    setIsSaving(true);
    try {
      const nextOrder = people.length > 0 ? Math.max(...people.map(p => p.order || 0)) + 1 : 1;
      await addDoc(collection(db, 'people'), {
        name: newName.trim(),
        order: nextOrder,
        createdAt: serverTimestamp()
      });
      setNewName('');
      toast.success('เพิ่มสมาชิกแล้ว');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'people');
      toast.error('เพิ่มสมาชิกไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetupRequestedList = async () => {
    const list = [
      "บัง", "นาย", "บอส", "แบงค์", "แป้ง", "อเล็ก", 
      "พลับ", "ไบร์ท", "อุ่น", "แทน", "อั้ม", "เจน"
    ];

    triggerConfirm(
      'จัดรายชื่อใหม่?',
      'ระบบจะลบสมาชิกปัจจุบันทั้งหมดและเพิ่มรายชื่อใหม่ 12 คนตามที่กำหนด (ข้อมูลเครดิตและรูปเดิมจะหายไป)',
      async () => {
        setIsSaving(true);
        try {
          // 1. Delete all current people
          const batch = writeBatch(db);
          people.forEach(p => {
            batch.delete(doc(db, 'people', p.id));
          });
          await batch.commit();

          // 2. Add new people in order
          for (let i = 0; i < list.length; i++) {
            await addDoc(collection(db, 'people'), {
              name: list[i],
              order: i + 1,
              createdAt: serverTimestamp()
            });
          }
          toast.success('จัดรายชื่อใหม่สำเร็จ');
        } catch (err) {
          toast.error('ตั้งค่าไม่สำเร็จ');
          console.error(err);
        } finally {
          setIsSaving(false);
        }
      },
      true
    );
  };

  const handleDeletePerson = async (id: string) => {
    triggerConfirm(
      'ลบสมาชิก?',
      'คุณแน่ใจหรือไม่ว่าต้องการลบสมาชิกคนนี้? ข้อมูลการหารค่าใช้จ่ายของคนนี้จะหายไปจากรายการปัจจุบัน',
      async () => {
        try {
          await deleteDoc(doc(db, 'people', id));
          toast.success('ลบสมาชิกแล้ว');
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `people/${id}`);
          toast.error('ลบสมาชิกไม่สำเร็จ');
        }
      },
      true
    );
  };

  const handleSaveFood = async () => {
    const isFood = !activeTab || activeTab === 'items';
    let finalPrice = 0;
    let eatersToSave: { name: string; weight: number }[] = [];

    if (isFood) {
      if (!foodName || !foodPrice || Object.keys(selectedEaters).length === 0) {
        toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
      }
      finalPrice = parseFloat(foodPrice);
      eatersToSave = Object.entries(selectedEaters)
        .filter(([_, weight]) => (weight as number) > 0)
        .map(([name, weight]) => ({ name, weight: weight as number }));
      
      if (eatersToSave.length === 0) {
        toast.error('กรุณาเลือกสมาชิกอย่างน้อย 1 คน');
        return;
      }
    } else {
      if (!foodName) {
        toast.error('กรุณากรอกวันที่');
        return;
      }
      eatersToSave = Object.entries(selectedEaters)
        .filter(([_, weight]) => (weight as number) > 0)
        .map(([name, weight]) => ({ name, weight: weight as number }));

      if (eatersToSave.length === 0) {
        toast.error('กรุณากรอกราคาของสมาชิกอย่างน้อย 1 คน');
        return;
      }
      finalPrice = eatersToSave.reduce((sum, e) => sum + e.weight, 0);
    }

    setIsSaving(true);
    try {
      const category = activeTab === 'water' ? 'water' : 
                       activeTab === 'electricity' ? 'electricity' : 
                       activeTab === 'gas' ? 'gas' : 'food';

      let notifyMsg = '';
      const activeWriter = foodCreatedBy || currentUser || '';
      if (!editingFood) {
        if (category === 'food') {
          const potTypeName = isFreeMedicine ? '💊 หม้อยาฟรี' : '🥘 หม้อต้มปกติ';
          const cookStr = foodCook ? `\n👨‍🍳 คนต้ม: ${foodCook}` : '';
          const writerStr = activeWriter ? `\n✍️ คนเขียน: ${activeWriter}` : '';
          if (splitMode === 'shot') {
            const totalShots = eatersToSave.reduce((sum, e) => sum + e.weight, 0);
            const pricePerShot = totalShots > 0 ? (finalPrice / totalShots) : 0;
            const eatersStr = eatersToSave.map(e => `${e.name}(${e.weight} ช็อต)`).join(', ');
            notifyMsg = `🥃 มีรายการ${potTypeName}แบบช็อตเพิ่มเข้ามาใหม่!\n🔢 รายการ: ${foodName}\n💰 ยอดรวม: ${finalPrice} ฿ (ตกช็อตละ ${pricePerShot.toFixed(2)} ฿)\n🥃 รวม ${totalShots} ช็อต: ${eatersStr}${cookStr}${writerStr}`;
          } else if (splitMode === 'proportional') {
            const totalWeight = eatersToSave.reduce((sum, e) => sum + e.weight, 0);
            const eatersStr = eatersToSave.map(e => `${e.name}(สัดส่วน ${e.weight})`).join(', ');
            notifyMsg = `⚖️ มีรายการ${potTypeName}แบบหารตามสัดส่วนเพิ่มเข้ามาใหม่!\n🔢 รายการ: ${foodName}\n💰 ยอดรวม: ${finalPrice} ฿ (น้ำหนักรวม ${totalWeight.toFixed(1)})\n👥 สมาชิก: ${eatersStr}${cookStr}${writerStr}`;
          } else {
            notifyMsg = `${isFreeMedicine ? '💊' : '🥘'} มีรายการ${potTypeName}เพิ่มเข้ามาใหม่!\n🔢 รายการ: ${foodName}\n💰 ราคา: ${finalPrice} ฿\n👥 สมาชิกกิน: ${eatersToSave.map(e => `${e.name}${e.weight > 1 ? `(${e.weight} ช็อต)` : e.weight === 0.5 ? '(ครึ่ง)' : ''}`).join(', ')}${cookStr}${writerStr}`;
          }
        } else {
          const typeName = category === 'water' ? 'ค่าน้ำ' : category === 'electricity' ? 'ค่าไฟ' : 'ค่าแก๊ส';
          notifyMsg = `📊 มีรายการค่าใช้จ่ายเพิ่มเข้ามาใหม่!\n📋 รายการ: ${typeName} - ${foodName}\n💰 ยอดรวม: ${finalPrice} ฿`;
        }
      }

      if (editingFood) {
        const payload: any = {
          name: foodName,
          price: finalPrice,
          eaters: eatersToSave,
          category: editingFood.category || category,
          isFreeMedicine: (editingFood.category === 'food' || !editingFood.category) ? isFreeMedicine : false,
          updatedAt: serverTimestamp()
        };
        if (editingFood.category === 'food' || (!editingFood.category && category === 'food')) {
          payload.cook = foodCook || '';
          if (activeWriter) payload.createdBy = activeWriter;
        }
        await updateDoc(doc(db, 'foods', editingFood.id), payload);
        toast.success('แก้ไขรายการสำเร็จ');
      } else {
        const payload: any = {
          name: foodName,
          price: finalPrice,
          eaters: eatersToSave,
          category,
          isFreeMedicine: category === 'food' ? isFreeMedicine : false,
          createdAt: serverTimestamp()
        };
        if (category === 'food') {
          if (foodCook) payload.cook = foodCook;
          if (activeWriter) payload.createdBy = activeWriter;
        }
        await addDoc(collection(db, 'foods'), payload);
        toast.success('บันทึกรายการแล้ว');
        
        if (notifyMsg) {
          triggerLineNotify(notifyMsg);
        }
      }
      setFoodName('');
      setFoodPrice('');
      setFoodCook('');
      setFoodCreatedBy('');
      setSelectedEaters({});
      setIsFreeMedicine(false);
      setEditingFood(null);
      setIsFoodModalOpen(false);
    } catch (err) {
      handleFirestoreError(err, editingFood ? OperationType.UPDATE : OperationType.CREATE, 'foods');
      toast.error('บันทึกไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditFood = (f: FoodItem) => {
    setEditingFood(f);
    setIsFreeMedicine(!!f.isFreeMedicine);
    // Set active tab to match food category for consistent UI in modal
    if (f.category === 'water') setActiveTab('water');
    else if (f.category === 'electricity') setActiveTab('electricity');
    else if (f.category === 'gas') setActiveTab('gas');
    else setActiveTab('items');
    
    setFoodName(f.name);
    setFoodPrice(f.price.toString());
    setFoodCook(f.cook || '');
    setFoodCreatedBy(f.createdBy || '');
    const eaters: Record<string, number> = {};
    const inputs: Record<string, string> = {};
    f.eaters.forEach(e => {
      eaters[e.name] = e.weight;
      inputs[e.name] = e.weight.toString();
    });
    setSelectedEaters(eaters);
    setProportionalInputs(inputs);
    const hasShots = f.eaters.some(e => e.weight > 1);
    const hasDecimals = f.eaters.some(e => e.weight !== 1 && e.weight !== 0.5 && e.weight !== 0 && !Number.isInteger(e.weight));
    if (hasShots) setSplitMode('shot');
    else if (hasDecimals || f.eaters.some(e => e.weight !== 1 && e.weight !== 0.5 && e.weight !== 0)) setSplitMode('proportional');
    else setSplitMode('equal');
    setIsFoodModalOpen(true);
  };

  const handleDeleteFood = async (target: FoodItem | string) => {
    const item = typeof target === 'string' ? foods.find(x => x.id === target) : target;
    const id = typeof target === 'string' ? target : target.id;
    const category = item?.category;

    let confirmTitle = 'ลบค่าต้ม?';
    let successMessage = 'ลบค่าต้มแล้ว';

    if (category === 'water') {
      confirmTitle = 'ลบค่าน้ำ?';
      successMessage = 'ลบค่าน้ำแล้ว';
    } else if (category === 'electricity') {
      confirmTitle = 'ลบค่าไฟ?';
      successMessage = 'ลบค่าไฟแล้ว';
    } else if (category === 'gas') {
      confirmTitle = 'ลบค่าแก๊ส?';
      successMessage = 'ลบค่าแก๊สแล้ว';
    }

    triggerConfirm(
      confirmTitle,
      'คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?',
      async () => {
        try {
          await deleteDoc(doc(db, 'foods', id));
          toast.success(successMessage);
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `foods/${id}`);
          toast.error('ลบไม่สำเร็จ');
        }
      },
      true
    );
  };

  const handleCardTouchStart = (foodId: string) => {
    isLongPressTriggeredRef.current = false;
    if (foodLongPressTimerRef.current) {
      clearTimeout(foodLongPressTimerRef.current);
    }
    foodLongPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        try { window.navigator.vibrate(60); } catch {}
      }
      setIsBatchSelectMode(true);
      setSelectedFoodIds(prev => {
        const next = new Set(prev);
        if (next.has(foodId)) {
          next.delete(foodId);
        } else {
          next.add(foodId);
        }
        return next;
      });
      toast.info('🎯 เข้าสู่โหมดเลือกหลายหม้อแล้ว! (แตะที่หม้อเพื่อเลือกเพิ่ม/ยกเลิก)', {
        duration: 3000
      });
    }, 500);
  };

  const handleCardTouchEnd = () => {
    if (foodLongPressTimerRef.current) {
      clearTimeout(foodLongPressTimerRef.current);
      foodLongPressTimerRef.current = null;
    }
  };

  const handleCardClick = (foodId: string) => {
    if (isLongPressTriggeredRef.current) {
      isLongPressTriggeredRef.current = false;
      return;
    }
    if (isBatchSelectMode) {
      setSelectedFoodIds(prev => {
        const next = new Set(prev);
        if (next.has(foodId)) {
          next.delete(foodId);
        } else {
          next.add(foodId);
        }
        return next;
      });
    }
  };

  const handleSelectRange = (rangeStr: string, activePots: FoodItem[]) => {
    const parts = rangeStr.split('-').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    if (parts.length === 2) {
      const min = Math.min(parts[0], parts[1]);
      const max = Math.max(parts[0], parts[1]);
      const newSelected = new Set(selectedFoodIds);
      let count = 0;
      activePots.forEach(f => {
        const m = f.name.match(/\d+/);
        if (m) {
          const val = parseInt(m[0], 10);
          if (val >= min && val <= max) {
            newSelected.add(f.id);
            count++;
          }
        }
      });
      setSelectedFoodIds(newSelected);
      toast.success(`เลือกหม้อที่ ${min} ถึง ${max} (เพิ่ม ${count} หม้อ) แล้ว`);
    } else if (parts.length === 1) {
      const target = parts[0];
      const newSelected = new Set(selectedFoodIds);
      activePots.forEach(f => {
        const m = f.name.match(/\d+/);
        if (m && parseInt(m[0], 10) === target) {
          newSelected.add(f.id);
        }
      });
      setSelectedFoodIds(newSelected);
      toast.success(`เลือกหม้อที่ ${target} แล้ว`);
    } else {
      toast.error('กรุณาระบุช่วงหม้อ เช่น 1-5');
    }
  };

  const handleBatchDeleteFoods = (activeCategoryPots: FoodItem[]) => {
    if (selectedFoodIds.size === 0) {
      toast.error('กรุณาเลือกอย่างน้อย 1 รายการเพื่อลบ');
      return;
    }
    const count = selectedFoodIds.size;
    const selectedPotNames = activeCategoryPots
      .filter(f => selectedFoodIds.has(f.id))
      .map(f => f.name)
      .slice(0, 5)
      .join(', ') + (count > 5 ? ` และอีก ${count - 5} รายการ` : '');

    triggerConfirm(
      `🗑️ ยืนยันลบทั้งหมด ${count} หม้อ?`,
      `คุณต้องการลบรายการที่เลือก (${selectedPotNames}) รวมทั้งหมด ${count} หม้อ ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`,
      async () => {
        setIsSaving(true);
        try {
          const batch = writeBatch(db);
          selectedFoodIds.forEach((id: string) => {
            batch.delete(doc(db, 'foods', id));
          });
          await batch.commit();
          toast.success(`ลบรายการสำเร็จทั้งหมด ${count} หม้อเรียบร้อยแล้ว! ✨`);
          setSelectedFoodIds(new Set());
          setIsBatchSelectMode(false);
        } catch (err) {
          console.warn('Batch delete falling back to sequential delete:', err);
          try {
            const idsToDelete: string[] = Array.from(selectedFoodIds);
            for (const id of idsToDelete) {
              await deleteDoc(doc(db, 'foods', id));
            }
            toast.success(`ลบรายการสำเร็จทั้งหมด ${count} หม้อเรียบร้อยแล้ว! ✨`);
            setSelectedFoodIds(new Set());
            setIsBatchSelectMode(false);
          } catch (seqErr) {
            handleFirestoreError(seqErr, OperationType.DELETE, 'foods/batch');
            toast.error('เกิดข้อผิดพลาดในการลบรายการ');
          }
        } finally {
          setIsSaving(false);
        }
      },
      true
    );
  };

  const handleDeletePayment = async (id: string) => {
    triggerConfirm(
      'ลบประวัติการจ่ายเงิน?',
      'การลบประวัตินี้จะทำให้ยอดที่จ่ายไปแล้วกลับมาเป็นยอดค้างชำระเหมือนเดิม',
      async () => {
        try {
          await deleteDoc(doc(db, 'payments', id));
          toast.success('ลบประวัติการจ่ายเงินแล้ว');
        } catch (err) {
          handleFirestoreError(err, OperationType.DELETE, `payments/${id}`);
          toast.error('ลบไม่สำเร็จ');
        }
      },
      true
    );
  };

  const handleSaveBank = async () => {
    if (!isAdminUser) {
      toast.error('เฉพาะแอดมินเท่านั้นที่สามารถเปลี่ยนข้อมูลบัญชีรับเงินได้ 🔒');
      return;
    }
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'config', 'global'), { bank: bankInfo });
      setIsBankModalOpen(false);
      toast.success('บันทึกข้อมูลบัญชีรับเงินเรียบร้อยแล้ว');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'config/global');
      toast.error('บันทึกไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePotSelection = (personName: string, foodId: string) => {
    setSelectedPotsRaw(prev => {
      const current = prev[personName] || [];
      const isSelected = current.includes(foodId);
      const next = isSelected
        ? current.filter(id => id !== foodId)
        : [...current, foodId];
      
      const newSelected = { ...prev, [personName]: next };
      localStorage.setItem('draft_selectedPots', JSON.stringify(newSelected));
      
      // Update targetPayment amount if modal is open
      if (targetPayment && targetPayment.name === personName) {
        const person = people.find(p => p.name === personName);
        const credit = person?.credit || 0;
        
        const foodList = next.map(id => foods.find(f => f.id === id)).filter(Boolean);
        const foodSum = foodList
          .filter(f => !f.category || f.category === 'food')
          .reduce((acc, f) => acc + (personSharePerFood[f!.id]?.[personName] || 0), 0);
        const otherSum = foodList
          .filter(f => f.category && f.category !== 'food')
          .reduce((acc, f) => acc + (personSharePerFood[f!.id]?.[personName] || 0), 0);
        
        const netFoodAmount = Math.max(0, foodSum - credit);
        const totalAmountToPay = netFoodAmount + otherSum;
        
        setTargetPayment(t => t ? { ...t, payerAmount: totalAmountToPay.toString(), foodId: next.join(',') } : null);
      }
      
      return newSelected;
    });
  };

  const handleDirectApprovePerson = async (personName: string) => {
    const amountOwed = debts[personName] || 0;
    if (amountOwed <= 0) return;
    const personPots = foods
      .filter(f => f.eaters.some(e => e.name === personName))
      .map(f => f.id);

    const tempId = `temp-${Date.now()}`;
    const approverName = currentUser || 'แอดมิน (บัง/แป้ง/อั้ม)';
    const now = new Date();
    const newPay: Payment = {
      id: tempId,
      personName: personName,
      amount: Math.ceil(amountOwed),
      timestamp: now,
      foodId: personPots.join(','),
      slipUrl: '',
      status: 'approved',
      approvedBy: approverName,
      approvedAt: now
    };

    setOptimisticPayments(prev => [...prev, newPay]);

    try {
      await addDoc(collection(db, 'payments'), {
        personName: personName,
        amount: Math.ceil(amountOwed),
        timestamp: serverTimestamp(),
        foodId: personPots.join(','),
        slipUrl: '',
        status: 'approved',
        approvedBy: approverName,
        approvedAt: serverTimestamp()
      });

      const person = people.find(p => p.name === personName);
      if (person && (person.credit || 0) > 0) {
        const selectedFoods = personPots.map(id => foods.find(f => f.id === id)).filter(Boolean);
        const foodSum = selectedFoods
          .filter(f => !f.category || f.category === 'food')
          .reduce((acc, f) => acc + (personSharePerFood[f!.id]?.[personName] || 0), 0);
        
        const newCredit = Math.max(0, (person.credit || 0) - foodSum);
        if ((person.credit || 0) !== newCredit) {
          await updateDoc(doc(db, 'people', person.id), {
            credit: newCredit
          });
        }
      }

      const notifyMsg = `⚡ [อนุญาตจ่ายแล้ว - หักยอดทันที]\n👤 สมาชิก: ${personName}\n💵 ยอดเงินที่หัก: ${Math.ceil(amountOwed).toLocaleString()} ฿\n👑 ดำเนินการโดย: ${approverName}\n✨ ยอดคงค้างของ ${personName} ถูกหักเป็น 0 ฿ เรียบร้อยแล้ว!`;
      triggerLineNotify(notifyMsg);

      toast.success(`⚡ อนุญาตจ่ายเงินของ ${personName} เรียบร้อยแล้ว (หักยอดคงค้างเป็น 0 ฿ ทันที ✨)`);
    } catch (err) {
      console.error('Direct approval failed:', err);
      toast.error('อนุญาตจ่ายไม่สำเร็จ');
      setOptimisticPayments(prev => prev.filter(p => p.id !== tempId));
    }
  };

  const handleConfirmPayment = async (forceApproved?: boolean) => {
    if (!targetPayment) return;
    
    const amountToPay = parseFloat(targetPayment.payerAmount || '0');
    if (isNaN(amountToPay) || amountToPay <= 0) {
      toast.error('กรุณาระบุจำนวนเงินที่ถูกต้อง');
      return;
    }

    const foodIdsStr = targetPayment.foodId ? targetPayment.foodId.split(',') : [];
    const currentTarget = { ...targetPayment, amountToPay, foodIds: foodIdsStr };
    
    const shouldDirectApprove = forceApproved !== undefined ? forceApproved : isAdminUser;
    const initialStatus: 'approved' | 'pending' = shouldDirectApprove ? 'approved' : 'pending';
    const approverName = currentUser || 'แอดมิน (บัง/แป้ง/อั้ม)';
    const now = new Date();

    // 1. Instant Optimistic Update for UI
    const tempId = `temp-${Date.now()}`;
    const tempPayments: Payment[] = [{
      id: tempId,
      personName: currentTarget.name,
      amount: currentTarget.amountToPay,
      timestamp: now,
      foodId: currentTarget.foodIds.join(','),
      slipUrl: uploadedSlipUrl || '',
      status: initialStatus,
      approvedBy: shouldDirectApprove ? approverName : undefined,
      approvedAt: shouldDirectApprove ? now : undefined
    }];
    
    setOptimisticPayments(prev => [...prev, ...tempPayments]);
    
    setIsPayModalOpen(false);
    setTargetPayment(null);
    setSelectedPots(prev => ({ ...prev, [currentTarget.name]: [] }));
    
    const fileToUpload = selectedSlipFile;
    const localUrlToCleanup = uploadedSlipUrl;

    // Reset fields for the next form entry
    setUploadedSlipUrl(null);
    setSelectedSlipFile(null);
    
    // Switch to summary tab immediately
    setActiveTab('summary');
    if (shouldDirectApprove) {
      toast.success(`⚡ อนุญาตจ่ายเงินของ ${currentTarget.name} เรียบร้อยแล้ว (หักยอดคงค้างทันที ✨)`);
    } else {
      toast.success('แจ้งชำระเงินเรียบร้อยแล้ว! (ส่งคำขออนุมัติไปยังแอดมินทุกคน) 🚀');
    }

    // 2. Asynchronous Background Processing
    const processInBackground = async () => {
      try {
        let finalSlipUrl = '';
        if (fileToUpload) {
          try {
            const compressedBlob = await compressImage(fileToUpload);
            try {
              const storageRef = ref(storage, `slips/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`);
              const snapshot = await uploadBytes(storageRef, compressedBlob);
              finalSlipUrl = await getDownloadURL(snapshot.ref);
            } catch (storageErr) {
              console.warn('Firebase Storage upload failed, falling back to base64 DataURL:', storageErr);
              finalSlipUrl = await fileToDataURL(compressedBlob);
            }
          } catch (compressErr) {
            console.warn('Compression failed, converting file directly to DataURL:', compressErr);
            finalSlipUrl = await fileToDataURL(fileToUpload);
          }
        }

        await addDoc(collection(db, 'payments'), {
          personName: currentTarget.name,
          amount: currentTarget.amountToPay,
          timestamp: serverTimestamp(),
          foodId: currentTarget.foodIds.join(','),
          slipUrl: finalSlipUrl,
          status: initialStatus,
          approvedBy: shouldDirectApprove ? approverName : null,
          approvedAt: shouldDirectApprove ? serverTimestamp() : null
        });

        // Clean up temp optimistic item once Firestore has saved the payment
        setOptimisticPayments(prev => prev.filter(p => p.id !== tempId));

        if (shouldDirectApprove) {
          const person = people.find(p => p.name === currentTarget.name);
          if (person && (person.credit || 0) > 0) {
            const selectedFoods = currentTarget.foodIds.map(id => foods.find(f => f.id === id)).filter(Boolean);
            const foodSum = selectedFoods
              .filter(f => !f.category || f.category === 'food')
              .reduce((acc, f) => acc + (personSharePerFood[f!.id]?.[currentTarget.name] || 0), 0);
            
            const newCredit = Math.max(0, (person.credit || 0) - foodSum);
            if ((person.credit || 0) !== newCredit) {
              await updateDoc(doc(db, 'people', person.id), {
                credit: newCredit
              });
            }
          }
        }

        const selectedFoods = currentTarget.foodIds.map(id => foods.find(f => f.id === id)).filter(Boolean);
        const potsPaidNames = selectedFoods.map(f => f?.name).filter(Boolean);
        const notifyMsg = shouldDirectApprove
          ? `⚡ [อนุญาตจ่ายแล้ว - หักยอดทันที]\n👤 ผู้จ่าย: ${currentTarget.name}\n💵 จำนวนเงิน: ${currentTarget.amountToPay.toLocaleString()} ฿\n🍲 รายการ: ${potsPaidNames.length > 0 ? potsPaidNames.join(', ') : 'ชำระค่าธรรมเนียมอื่นๆ'}\n👑 อนุมัติโดย: ${approverName}\n✨ หักยอดคงค้างของ ${currentTarget.name} เรียบร้อยแล้ว`
          : `⏳ แจ้งโอนเงินใหม่ (รออนุมัติ)\n👤 ผู้จ่าย: ${currentTarget.name}\n💵 จำนวนเงิน: ${currentTarget.amountToPay.toLocaleString()} ฿\n🍲 รายการที่จ่าย: ${potsPaidNames.length > 0 ? potsPaidNames.join(', ') : 'ชำระค่าธรรมเนียมอื่นๆ'}`;
        
        triggerLineNotify(notifyMsg);

        setTimeout(() => {
          if (localUrlToCleanup && localUrlToCleanup.startsWith('blob:')) {
            try {
              URL.revokeObjectURL(localUrlToCleanup);
            } catch (err) {
              console.error('Revoke URL failed:', err);
            }
          }
        }, 15000);
      } catch (err) {
        console.error('Payment background processing failed:', err);
        toast.error(`ส่งข้อมูลชำระเงินไม่สำเร็จของ ${currentTarget.name}`);
        setOptimisticPayments(prev => prev.filter(p => p.id !== tempId));
      }
    };

    processInBackground();
  };

  const handleUploadSlipForPayment = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const localUrl = URL.createObjectURL(file);
        setUploadedSlipUrl(localUrl);
        setSelectedSlipFile(file);
        toast.success('เลือกรูปสลิปเรียบร้อยแล้ว 📸');
      } catch (err) {
        console.error('Error creating object URL:', err);
        toast.error('ไม่สามารถโหลดรูปภาพสลิปได้');
      } finally {
        if (payModalFileInputRef.current) payModalFileInputRef.current.value = '';
      }
    }
  };

  const handleApprovePayment = async (pay: Payment) => {
    try {
      let targetDocId = pay.id;

      if (pay.id.startsWith('temp-')) {
        const realPay = payments.find(p => p.personName === pay.personName && Math.abs(p.amount - pay.amount) < 1 && p.status === 'pending' && !p.id.startsWith('temp-'));
        if (realPay) {
          targetDocId = realPay.id;
        } else {
          setOptimisticPayments(prev => prev.filter(p => p.id !== pay.id));
          toast.info('ระบบกำลังบันทึกข้อมูลสลิปไปยังเซิร์ฟเวอร์ กรุณารอสักครู่แล้วลองอนุมัติใหม่อีกครั้ง');
          return;
        }
      }

      const approverName = currentUser || 'แอดมิน (บัง/แป้ง/อั้ม)';
      const now = new Date();

      // 1. Update payment status to approved with approver info & timestamp
      await updateDoc(doc(db, 'payments', targetDocId), {
        status: 'approved',
        approvedBy: approverName,
        approvedAt: serverTimestamp(),
        timestamp: serverTimestamp()
      });

      setPayments(prev => prev.map(p => (p.id === targetDocId || p.id === pay.id) ? { 
        ...p, 
        status: 'approved', 
        approvedBy: approverName,
        approvedAt: now,
        timestamp: now
      } : p));
      setOptimisticPayments(prev => prev.filter(p => p.id !== pay.id && p.id !== targetDocId));

      // Trigger instant real-time history highlight & chime
      setHistoryFilterPerson('all');
      setHighlightPaymentId(targetDocId);
      setTimeout(() => setHighlightPaymentId(null), 10000);
      playNotificationChime();

      if (historyRef.current) {
        historyRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // 2. Deduct person's credit (if they paid for pots and had credit to deduct)
      const person = people.find(p => p.name === pay.personName);
      if (person) {
        const currentCredit = person.credit || 0;
        const foodIdsStr = pay.foodId ? pay.foodId.split(',') : [];
        const selectedFoods = foodIdsStr.map(id => foods.find(f => f.id === id)).filter(Boolean);
        const foodSum = selectedFoods
          .filter(f => !f.category || f.category === 'food')
          .reduce((acc, f) => acc + (personSharePerFood[f!.id]?.[pay.personName] || 0), 0);
        
        const newCredit = Math.max(0, currentCredit - foodSum);
        if (currentCredit !== newCredit) {
          await updateDoc(doc(db, 'people', person.id), {
            credit: newCredit
          });
        }
      }

      // 3. Trigger Line Notify
      const foodIdsStr = pay.foodId ? pay.foodId.split(',') : [];
      const selectedFoods = foodIdsStr.map(id => foods.find(f => f.id === id)).filter(Boolean);
      const potsPaidNames = selectedFoods.map(f => f?.name).filter(Boolean);
      const notifyMsg = `✅ อนุมัติการจ่ายเงินสำเร็จ!\n👤 ผู้จ่าย: ${pay.personName}\n💵 จำนวนเงิน: ${pay.amount.toLocaleString()} ฿\n🍲 รายการที่จ่าย: ${potsPaidNames.length > 0 ? potsPaidNames.join(', ') : 'ชำระค่าธรรมเนียมอื่นๆ'}\n👑 ผู้อนุมัติ: ${approverName}`;
      triggerLineNotify(notifyMsg);

      toast.success(`อนุมัติการจ่ายเงินของ ${pay.personName} สำเร็จ (แจ้งเตือนผู้ดูแลระบบทั้งหมดแล้ว)`);
    } catch (err) {
      console.error('Approval failed:', err);
      toast.error('อนุมัติไม่สำเร็จ');
    }
  };

  const handleRejectPayment = async (payId: string) => {
    try {
      let targetDocId = payId;
      if (payId.startsWith('temp-')) {
        const optPay = optimisticPayments.find(p => p.id === payId);
        const realPay = optPay ? payments.find(p => p.personName === optPay.personName && Math.abs(p.amount - optPay.amount) < 1 && p.status === 'pending' && !p.id.startsWith('temp-')) : null;
        if (realPay) {
          targetDocId = realPay.id;
        } else {
          setOptimisticPayments(prev => prev.filter(p => p.id !== payId));
          toast.success('ปฏิเสธการชำระเงินเรียบร้อยแล้ว');
          return;
        }
      }

      const rejecterName = currentUser || 'แอดมิน (บัง/แป้ง/อั้ม)';

      await updateDoc(doc(db, 'payments', targetDocId), {
        status: 'rejected',
        rejectedBy: rejecterName,
        rejectedAt: serverTimestamp()
      });
      setPayments(prev => prev.map(p => (p.id === targetDocId || p.id === payId) ? { ...p, status: 'rejected', rejectedBy: rejecterName } : p));
      setOptimisticPayments(prev => prev.filter(p => p.id !== payId && p.id !== targetDocId));
      toast.success('ปฏิเสธการชำระเงินเรียบร้อยแล้ว');
    } catch (err) {
      console.error('Rejection failed:', err);
      toast.error('ปฏิเสธการชำระเงินไม่สำเร็จ');
    }
  };

  const handleUpdateAppLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 1. Compress image to clean base64 data URL (~25-35KB max) for instant offline & cross-device sync
      const compressedBase64 = await compressAvatarImage(file);
      const dataUrl = compressedBase64 || DEFAULT_APP_LOGO;

      // 2. Immediate optimistic local state update
      setCurrentAppLogo(dataUrl);
      localStorage.setItem('cache_appLogo', dataUrl);
      toast.success('อัปเดตเปลี่ยนรูปภาพโลโก้แอปแสดงผลเรียบร้อยแล้ว! 🖼️✨');

      if (e.target) e.target.value = '';

      // 3. Save directly into Firestore config/global so ALL connected users receive the new logo instantly
      await setDoc(doc(db, 'config', 'global'), { appLogo: dataUrl }, { merge: true });

      // 4. Try uploading to Firebase storage as backup URL if available
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const storageRef = ref(storage, `logos/app_logo_${Date.now()}.${fileExt}`);
        const snapshot = await uploadBytes(storageRef, file);
        const firebaseUrl = await getDownloadURL(snapshot.ref);

        await setDoc(doc(db, 'config', 'global'), { appLogo: firebaseUrl }, { merge: true });
        setCurrentAppLogo(firebaseUrl);
        localStorage.setItem('cache_appLogo', firebaseUrl);
      } catch (err) {
        console.warn('Firebase storage backup logo upload notice:', err);
      }
    } catch (err) {
      console.error('Error updating app logo:', err);
      toast.error('อัปเดตโลโก้แอปไม่สำเร็จ');
    }
  };

  const handleAvatarChangeClick = (personId: string) => {
    if (!isAdminUser) {
      toast.error('เฉพาะแอดมินเท่านั้นที่สามารถเปลี่ยนรูปโปรไฟล์ได้ 🔒');
      return;
    }
    setIsUpdatingAvatarPersonId(personId);
    avatarFileInputRef.current?.click();
  };

  const handleUpdateAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isUpdatingAvatarPersonId) {
      if (!isAdminUser) {
        toast.error('เฉพาะแอดมินเท่านั้นที่สามารถเปลี่ยนรูปโปรไฟล์ได้ 🔒');
        setIsUpdatingAvatarPersonId(null);
        if (e.target) e.target.value = '';
        return;
      }

      const personId = isUpdatingAvatarPersonId;
      setIsUpdatingAvatarPersonId(null);

      try {
        // 1. Compress photo to clean lightweight base64 string
        const compressedDataUrl = await compressAvatarImage(file);
        if (!compressedDataUrl) {
          toast.error('อ่านไฟล์รูปภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
          if (e.target) e.target.value = '';
          return;
        }

        // 2. Update local state & cache immediately for responsive feel
        setPeople(prev => {
          const updated = prev.map(p => p.id === personId ? { ...p, photoUrl: compressedDataUrl } : p);
          localStorage.setItem('cache_people', JSON.stringify(updated));
          return updated;
        });

        // 3. IMMEDIATELY SAVE DIRECTLY TO FIRESTORE DATABASE
        await updateDoc(doc(db, 'people', personId), { photoUrl: compressedDataUrl });
        toast.success('อัปเดตและบันทึกรูปโปรไฟล์ลงฐานข้อมูลถาวรเรียบร้อยแล้ว! 🖼️✨');

        // 4. Background upload to Firebase Storage (for CDN URL) if available
        (async () => {
          try {
            const fileExt = file.name.split('.').pop() || 'jpg';
            const storageRef = ref(storage, `avatars/${Date.now()}_${personId}.${fileExt}`);
            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);

            await updateDoc(doc(db, 'people', personId), { photoUrl: url });

            setPeople(prev => {
              const updated = prev.map(p => p.id === personId ? { ...p, photoUrl: url } : p);
              localStorage.setItem('cache_people', JSON.stringify(updated));
              return updated;
            });
          } catch (err) {
            console.warn('Firebase storage avatar background notice (dataUrl retained in Firestore):', err);
          }
        })();
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `people/${personId}`);
        toast.error('บันทึกรูปโปรไฟล์ลงฐานข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      } finally {
        if (e.target) e.target.value = '';
      }
    }
  };

  const handleRemoveAvatar = async (personId: string) => {
    if (!isAdminUser) {
      toast.error('เฉพาะแอดมินเท่านั้นที่สามารถลบรูปโปรไฟล์ได้ 🔒');
      return;
    }

    try {
      await updateDoc(doc(db, 'people', personId), { photoUrl: '' });
      setPeople(prev => {
        const updated = prev.map(p => p.id === personId ? { ...p, photoUrl: '' } : p);
        localStorage.setItem('cache_people', JSON.stringify(updated));
        return updated;
      });
      toast.success('ลบรูปโปรไฟล์ออกเรียบร้อยแล้ว 🗑️');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `people/${personId}`);
      toast.error('ลบรูปโปรไฟล์ไม่สำเร็จ');
    }
  };

  const handleRequestCredit = async () => {
    if (!targetCreditRequest || !creditRequestAmount) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    const amount = parseFloat(creditRequestAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('กรุณาระบุจำนวนที่ถูกต้อง');
      return;
    }

    setIsSaving(true);
    try {
      await addDoc(collection(db, 'creditRequests'), {
        personId: targetCreditRequest.id,
        personName: targetCreditRequest.name,
        amount,
        reason: creditRequestReason || 'ขอรับเครดิตส่วนกลาง/ค่าต้ม',
        status: 'pending',
        createdAt: serverTimestamp()
      });
      toast.success('ส่งคำขอรับเครดิตแล้ว! รอแอดมินอนุมัติ ⏳');
      setIsCreditModalOpen(false);
      setCreditRequestAmount('');
      setCreditRequestReason('');
      setTargetCreditRequest(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'creditRequests');
      toast.error('ขอเครดิตไม่สำเร็จ');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveCredit = async (req: CreditRequest) => {
    setIsSaving(true);
    try {
      // 1. Update person's credit upon admin approval
      let targetPersonId = req.personId;
      let personRef = doc(db, 'people', targetPersonId);
      let personSnap = await getDocFromServer(personRef);
      
      if (!personSnap.exists()) {
        const matchedPerson = people.find(p => p.id === req.personId || p.name === req.personName);
        if (matchedPerson) {
          targetPersonId = matchedPerson.id;
          personRef = doc(db, 'people', targetPersonId);
          personSnap = await getDocFromServer(personRef);
        }
      }

      if (personSnap.exists()) {
        const currentCredit = personSnap.data().credit || 0;
        await updateDoc(personRef, {
          credit: currentCredit + req.amount
        });
      }

      // 2. Update request status to approved
      await updateDoc(doc(db, 'creditRequests', req.id), {
        status: 'approved'
      });
      
      toast.success(`อนุมัติเครดิต ${req.amount} ฿ ให้ ${req.personName} สำเร็จแล้ว (ระบบนำไปหักยอดค่าต้มให้อัตโนมัติ)`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `creditRequests/${req.id}`);
      toast.error('อนุมัติเครดิตไม่สำเร็จ');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRejectCredit = async (id: string) => {
    try {
      await updateDoc(doc(db, 'creditRequests', id), {
        status: 'rejected'
      });
      toast.info('ปฏิเสธคำขอเครดิตแล้ว (สถานะเปลี่ยนเป็น "คำขอไม่อนุญาต")');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `creditRequests/${id}`);
      toast.error('ทำรายการไม่สำเร็จ');
      console.error(err);
    }
  };

  const handleDismissCreditRequest = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'creditRequests', id));
      toast.info('ลบรายการแจ้งเตือนแล้ว');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `creditRequests/${id}`);
    }
  };

  const handleUpdateCredit = async (personId: string, creditValue: string) => {
    const credit = parseFloat(creditValue);
    if (isNaN(credit)) {
      toast.error('กรุณาระบุจำนวนเงินที่ถูกต้อง');
      return;
    }
    
    try {
      await updateDoc(doc(db, 'people', personId), {
        credit: credit
      });
      setEditingCreditPersonId(null);
      toast.success('อัปเดตเครดิตแล้ว');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `people/${personId}`);
      toast.error('อัปเดตไม่สำเร็จ');
      console.error(err);
    }
  };

  const handleUpdateSlip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isUploadingHistoryId) {
      // Perceived Speed: Show local preview immediately
      const previewUrl = URL.createObjectURL(file);
      setLocalSlipPreviews(prev => ({ ...prev, [isUploadingHistoryId]: previewUrl }));
      
      const currentId = isUploadingHistoryId; // capture id
      setIsUploadingHistoryId(null); // Close picker immediately for speed
      
      try {
        const compressedBlob = await compressImage(file);
        let url = '';
        try {
          const storageRef = ref(storage, `slips/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`);
          const snapshot = await uploadBytes(storageRef, compressedBlob);
          url = await getDownloadURL(snapshot.ref);
        } catch (storageErr) {
          console.warn('Firebase Storage upload failed, falling back to base64 DataURL:', storageErr);
          url = await fileToDataURL(compressedBlob);
        }
        
        await updateDoc(doc(db, 'payments', currentId), {
          slipUrl: url
        });
        
        toast.success('อัปโหลดสลิปสำเร็จ');
      } catch (err) {
        console.error('Upload failed:', err);
        // Remove preview on failure
        setLocalSlipPreviews(prev => {
          const next = { ...prev };
          delete next[currentId];
          return next;
        });
        toast.error('อัปโหลดสลิปไม่สำเร็จ');
      } finally {
        if (historyFileInputRef.current) historyFileInputRef.current.value = '';
      }
    }
  };

  const copyBankNo = () => {
    if (!bankInfo.no) return setIsBankModalOpen(true);
    navigator.clipboard.writeText(bankInfo.no);
    toast.success('คัดลอกเลขบัญชีแล้ว');
  };

  const handleShareReceipt = (p: Payment) => {
    const text = `📄 ใบเสร็จการชำระเงิน\n👤 ผู้จ่าย: ${p.personName}\n💰 จำนวน: ${Math.ceil(p.amount).toLocaleString()} ฿\n⏰ เวลา: ${formatThaiDate(p.timestamp)}\n✅ สถานะ: โอนเงินสำเร็จ`;
    
    if (navigator.share) {
      navigator.share({
        title: 'ใบเสร็จการชำระเงิน Pot Split',
        text: text,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      toast.success('คัดลอกข้อมูลใบเสร็จแล้ว');
    }
  };

  const handleShareFood = (f: FoodItem) => {
    const isFood = !f.category || f.category === 'food';
    const isShotItem = f.eaters.some(e => e.weight > 1);
    const totalShots = f.eaters.reduce((sum, e) => sum + e.weight, 0);
    const pricePerShot = totalShots > 0 ? (f.price / totalShots) : 0;

    let eatersText = '';
    if (isFood) {
      if (isShotItem) {
        eatersText = f.eaters.map(e => {
          const shareVal = personSharePerFood[f.id]?.[e.name] || Math.ceil(pricePerShot * e.weight);
          return `${e.name} (${e.weight} ช็อต = ${shareVal} ฿)`;
        }).join(', ') + ` [รวม ${totalShots} ช็อต / ตกช็อตละ ${pricePerShot.toFixed(2)} ฿]`;
      } else {
        eatersText = f.eaters.map(e => `${e.name}${e.weight === 0.5 ? '(ครึ่ง)' : ''}`).join(', ');
      }
    } else {
      eatersText = f.eaters.map((e, index) => {
        const shareVal = personSharePerFood[f.id]?.[e.name] || 0;
        return `\n${index + 1} ${e.name} ราคา ${Math.ceil(shareVal).toLocaleString()}`;
      }).join('');
    }

    const text = isFood
      ? `🍲 รายการ: ${f.name}\n💰 ราคา: ${f.price.toLocaleString()} ฿\n👥 สมาชิก: ${eatersText}\n⏰ เวลา: ${formatThaiDate(f.createdAt)}${f.createdBy ? ` ( ${f.createdBy} )` : ''}`
      : `🍲 รายการ: ${f.name}\n💰 ราคา: ${f.price.toLocaleString()} ฿\n👥 สมาชิก:${eatersText}\n⏰ เวลา: ${formatThaiDate(f.createdAt)}${f.createdBy ? ` ( ${f.createdBy} )` : ''}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Pot Split: ${f.name}`,
        text: text,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      toast.success('คัดลอกรายละเอียดรายการแล้ว');
    }
  };

  const handleDevLogin = () => {
    if (pinInput === '02618') {
      setIsDevVerified(true);
      localStorage.setItem('isDevVerified', 'true');
      setPinInput('');
      const isNamedAdmin = currentUser && ['บัง', 'แป้ง', 'อั้ม'].includes(currentUser);
      const adminMsg = isNamedAdmin
        ? `ยินดีต้อนรับแอดมิน ${currentUser}!`
        : 'ยินดีต้อนรับแอดมิน! (สิทธิ์ 3 ท่าน: บัง, แป้ง, อั้ม)';
      toast.success(`${adminMsg} เข้าสู่ระบบสำเร็จ 🔑 สามารถใช้งานเมนูแอดมินได้ทั้งหมด`);
    } else {
      toast.error('รหัสผ่านแอดมินไม่ถูกต้อง (รหัสผ่านคือ 02618)');
    }
  };

  const handleDevLogout = () => {
    setIsDevVerified(false);
    localStorage.removeItem('isDevVerified');
    toast.info('ออกจากระบบแอดมินแล้ว');
  };

  const handleClearAllDebts = async () => {
    if (!isAdminUser) {
      setIsAdminPanelOpen(true);
      toast.error('เฉพาะแอดมินเท่านั้นที่สามารถเคลียร์ยอดค้างชำระได้');
      return;
    }

    const peopleWithDebts = people.filter(p => (debts[p.name] || 0) > 0);
    if (peopleWithDebts.length === 0) {
      toast.info('ไม่มีสมาชิกที่มียอดค้างชำระในขณะนี้ ทุกคนจ่ายครบแล้ว! ✨');
      return;
    }

    triggerConfirm(
      '🧹 เคลียร์ยอดค้างชำระของทุกคน?',
      `ระบบจะบันทึกรายการชำระเงินเพื่อเคลียร์ยอดค้างชำระของสมาชิกจำนวน ${peopleWithDebts.length} คน ให้กลายเป็น "จ่ายครบแล้ว ✨" ทันที`,
      async () => {
        setIsSaving(true);
        try {
          // 1. Approve pending payments
          const pendingPays = payments.filter(p => p.status === 'pending');
          for (const pay of pendingPays) {
            await updateDoc(doc(db, 'payments', pay.id), { status: 'approved' });
          }

          // 2. Add approved settlement payment for each debtor
          let totalClearedAmount = 0;
          const clearedMemberDetails: string[] = [];
          const approverName = currentUser || 'แอดมิน (บัง/แป้ง/อั้ม)';

          for (const p of peopleWithDebts) {
            const remDebt = Math.ceil(debts[p.name] || 0);
            if (remDebt > 0) {
              totalClearedAmount += remDebt;
              clearedMemberDetails.push(`${p.name} (${remDebt.toLocaleString()} ฿)`);
              await addDoc(collection(db, 'payments'), {
                personName: p.name,
                amount: remDebt,
                foodId: '',
                slipUrl: '',
                status: 'approved',
                note: 'แอดมินเคลียร์ยอดค้างชำระทั้งหมด',
                approvedBy: approverName,
                timestamp: serverTimestamp()
              });
            }
          }

          // 3. Trigger LINE Notify notification to members
          const memberListText = clearedMemberDetails.length > 5 
            ? `${clearedMemberDetails.slice(0, 5).join(', ')} และอื่นๆ รวม ${clearedMemberDetails.length} คน`
            : clearedMemberDetails.join(', ');

          const notifyMsg = `🧹 [เคลียร์ยอดค้างชำระของทุกคน]\n👑 ดำเนินการโดย: ${approverName}\n👥 สมาชิกที่เคลียร์ยอด: ${peopleWithDebts.length} คน\n💵 ยอดรวมที่เคลียร์ทั้งหมด: ${totalClearedAmount.toLocaleString()} ฿\n📋 รายชื่อ: ${memberListText}\n✨ แอดมินได้เคลียร์รอบบัญชีเรียบร้อยแล้ว ทุกคนมียอดค้างชำระเป็น 0 ฿ 🎉`;
          triggerLineNotify(notifyMsg);

          toast.success('เคลียร์ยอดค้างชำระของทุกคนเรียบร้อยแล้ว ✨ (ส่ง LINE Notify แจ้งเตือนแล้ว)');
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, 'payments');
          toast.error('เกิดข้อผิดพลาดในการเคลียร์ยอดค้างชำระ');
        } finally {
          setIsSaving(false);
        }
      }
    );
  };

  const handleToggleSelectAdminPayment = (payId: string) => {
    setSelectedAdminPaymentIds(prev => {
      const next = new Set(prev);
      if (next.has(payId)) {
        next.delete(payId);
      } else {
        next.add(payId);
      }
      return next;
    });
  };

  const handleSelectAllAdminPayments = () => {
    const allPendingIds = pendingPaymentsList.map(p => p.id);
    setSelectedAdminPaymentIds(new Set(allPendingIds));
    toast.success(`เลือกคำขออนุมัติทั้งหมด (${allPendingIds.length} รายการ)`);
  };

  const handleClearSelectedAdminPayments = () => {
    setSelectedAdminPaymentIds(new Set());
    toast.success('ล้างคำขอที่เลือกเรียบร้อยแล้ว');
  };

  const handleApproveSelectedPayments = async () => {
    const selectedList = pendingPaymentsList.filter(p => selectedAdminPaymentIds.has(p.id));
    if (selectedList.length === 0) {
      toast.error('กรุณาเลือกคำขอที่ต้องการอนุมัติก่อน');
      return;
    }

    setIsSaving(true);
    try {
      let approvedCount = 0;
      for (const pay of selectedList) {
        await handleApprovePayment(pay);
        approvedCount++;
      }
      setSelectedAdminPaymentIds(new Set());
      const approverName = currentUser || 'แอดมิน (บัง/แป้ง/อั้ม)';
      const batchNotifyMsg = `⚡ [อนุมัติที่เลือก] แอดมิน ${approverName} ได้อนุมัติคำขอชำระเงินที่เลือก ${approvedCount} รายการเรียบร้อยแล้ว! (แจ้งเตือนทั้ง 3 แอดมิน)`;
      triggerLineNotify(batchNotifyMsg);
      toast.success(`🎉 อนุมัติคำขอที่เลือกสำเร็จ ${approvedCount} รายการเรียบร้อยแล้ว!`);
    } catch (err) {
      console.error(err);
      toast.error('อนุมัติบางรายการไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRejectSelectedPayments = async () => {
    const selectedIds: string[] = Array.from(selectedAdminPaymentIds);
    if (selectedIds.length === 0) {
      toast.error('กรุณาเลือกคำขอที่ต้องการปฏิเสธก่อน');
      return;
    }

    triggerConfirm(
      `ปฏิเสธคำขอที่เลือก (${selectedIds.length} รายการ)?`,
      `คุณต้องการปฏิเสธคำขอชำระเงินที่เลือกไว้ทั้งหมด ${selectedIds.length} รายการใช่หรือไม่?`,
      async () => {
        setIsSaving(true);
        try {
          let rejectedCount = 0;
          for (const id of selectedIds) {
            await handleRejectPayment(id);
            rejectedCount++;
          }
          setSelectedAdminPaymentIds(new Set());
          toast.success(`ปฏิเสธคำขอที่เลือก ${rejectedCount} รายการเรียบร้อยแล้ว`);
        } catch (err) {
          console.error(err);
          toast.error('ปฏิเสธบางรายการไม่สำเร็จ');
        } finally {
          setIsSaving(false);
        }
      },
      true
    );
  };

  const handleApproveAllPayments = async () => {
    const pendingPays = pendingPaymentsList;
    if (pendingPays.length === 0) return;

    setIsSaving(true);
    try {
      let approvedCount = 0;
      for (const pay of pendingPays) {
        await handleApprovePayment(pay);
        approvedCount++;
      }
      const approverName = currentUser || 'แอดมิน (บัง/แป้ง/อั้ม)';
      const batchNotifyMsg = `⚡ [อนุมัติทั้งหมด] แอดมิน ${approverName} ได้อนุมัติสลิปโอนเงินค้างชำระทั้งหมด ${approvedCount} รายการเรียบร้อยแล้ว! (แจ้งเตือนทั้ง 3 แอดมิน)`;
      triggerLineNotify(batchNotifyMsg);
      toast.success(`🎉 อนุมัติสลิป/คำขอชำระเงินทั้งหมด ${approvedCount} รายการเรียบร้อยแล้ว! (ส่งแจ้งเตือนทั้ง 3 แอดมินแล้ว)`);
    } catch (err) {
      console.error(err);
      toast.error('อนุมัติบางรายการไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveAllCreditRequests = async () => {
    const pendingReqs = creditRequests.filter(r => r.status === 'pending');
    if (pendingReqs.length === 0) return;

    setIsSaving(true);
    try {
      for (const req of pendingReqs) {
        await handleApproveCredit(req);
      }
      toast.success(`อนุมัติคำขอเครดิตทั้งหมด ${pendingReqs.length} รายการแล้ว`);
    } catch (err) {
      toast.error('อนุมัติบางรายการไม่สำเร็จ');
    } finally {
      setIsSaving(false);
    }
  };

  const resetAll = async () => {
    if (!isAdminUser) {
      setIsAdminPanelOpen(true);
      toast.error('เฉพาะแอดมินเท่านั้นที่สามารถล้างข้อมูลได้');
      return;
    }
    triggerConfirm(
      'ล้างข้อมูลทั้งหมด?',
      'คำเตือน: ข้อมูลสมาชิก ค่าต้ม และประวัติการจ่ายเงินทั้งหมดจะถูกลบถาวร ไม่สามารถกู้คืนได้',
      async () => {
        try {
          for (const p of people) await deleteDoc(doc(db, 'people', p.id));
          for (const f of foods) await deleteDoc(doc(db, 'foods', f.id));
          for (const pay of payments) await deleteDoc(doc(db, 'payments', pay.id));
          await setDoc(doc(db, 'config', 'global'), { bank: { name: '', no: '', user: '' } });
          localStorage.removeItem('cache_people');
          localStorage.removeItem('cache_foods');
          localStorage.removeItem('cache_payments');
          localStorage.removeItem('cache_bankInfo');
          localStorage.removeItem('draft_foodName');
          localStorage.removeItem('draft_foodPrice');
          localStorage.removeItem('draft_selectedEaters');
          localStorage.removeItem('draft_selectedPots');
          toast.success('ล้างข้อมูลสำเร็จ');
        } catch (err) {
          console.error(err);
          toast.error('ล้างข้อมูลไม่สำเร็จ');
        }
      },
      true
    );
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[48px] shadow-2xl shadow-blue-100 flex flex-col items-center border border-blue-50"
        >
          <div className="w-24 h-24 bg-gradient-to-tr from-amber-50 to-orange-50 rounded-[28px] p-1.5 shadow-xl shadow-indigo-150 border-4 border-white relative flex items-center justify-center animate-bounce overflow-hidden mb-3">
            <img 
              id="logo-loading"
              src={currentAppLogo || DEFAULT_APP_LOGO} 
              alt="G.BaanKen Logo" 
              referrerPolicy="no-referrer" 
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_APP_LOGO; }}
              className="w-full h-full object-contain rounded-2xl" 
            />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-1 font-display italic">G.Baan<span className="text-indigo-600 not-italic">Ken</span></h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mb-8">Modern & Comfortable</p>
          
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <motion.div 
                key={i}
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="w-2 h-2 bg-slate-400 rounded-full"
              />
            ))}
          </div>
          <p className="mt-8 text-slate-400 text-xs font-bold uppercase tracking-widest italic">กำลังเริ่มความอร่อย...</p>
        </motion.div>
      </div>
    );
  }

  if (!hasEnteredApp) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950 flex flex-col items-center justify-center p-4 selection:bg-indigo-900 selection:text-white relative overflow-hidden">
        {/* Animated Indigo/Violet/Sky Ambient Blobs */}
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-indigo-600/20 via-sky-600/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-900/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-purple-900/20 rounded-full blur-[90px] pointer-events-none" />
        
        <Toaster position="top-center" richColors />

        {welcomeStep === 'landing' ? (
          <motion.div 
            key="welcome-landing-step"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            className="max-w-[460px] w-full bg-slate-950/95 backdrop-blur-xl rounded-[36px] shadow-[0_25px_80px_rgba(79,70,229,0.35)] border border-indigo-900/50 overflow-hidden relative p-7 sm:p-8 flex flex-col items-center text-white"
          >
            {/* Indigo gradient panel top accent */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-600 via-sky-500 to-indigo-600" />

            {/* Top Badge */}
            <div className="flex flex-col items-center mb-4 text-center">
              <span className="text-[10px] font-black tracking-[0.15em] text-indigo-300 bg-indigo-950/90 px-3.5 py-1 rounded-full uppercase border border-indigo-800/80 shadow-xs mb-1 flex items-center gap-1.5">
                <span>G.BAANKEN SYSTEM</span>
                <span className="text-emerald-400 font-extrabold">• 120 FPS ULTRA SMOOTH</span>
              </span>
              <p className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-widest">
                ระบบจัดการและหารค่าต้ม • สมาชิกกลุ่มบ้านเคน
              </p>
            </div>

            {/* Interactive App Logo Display */}
            <div className="flex flex-col items-center mb-5 relative">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="w-32 h-32 bg-indigo-950/40 p-2 rounded-3xl border border-indigo-700/50 shadow-2xl relative flex items-center justify-center group/welcomelogo cursor-pointer"
                onClick={() => logoFileInputRef.current?.click()}
                title="คลิกเพื่อเลือกเปลี่ยนรูปภาพโลโก้แอปพลิเคชัน"
              >
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-1 rounded-2xl border border-dashed border-indigo-500/40"
                />
                <div className="absolute inset-2 bg-gradient-to-tr from-indigo-600 via-purple-600 to-sky-500 rounded-2xl blur-xl opacity-45 animate-pulse" />
                <div className="w-28 h-28 bg-slate-900 p-1 rounded-2xl shadow-md border border-indigo-900/60 relative overflow-hidden flex items-center justify-center z-10">
                  <img 
                    id="logo-welcome-landing"
                    src={currentAppLogo || DEFAULT_APP_LOGO} 
                    alt="G.BaanKen Logo" 
                    referrerPolicy="no-referrer" 
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_APP_LOGO; }}
                    className="w-full h-full object-contain" 
                  />
                  <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover/welcomelogo:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-1 text-center">
                    <Camera className="w-6 h-6 mb-0.5 text-amber-300" />
                    <span className="text-[10px] font-black">เปลี่ยนโลโก้แอป</span>
                  </div>
                </div>
              </motion.div>

              <button
                type="button"
                onClick={() => logoFileInputRef.current?.click()}
                className="mt-2.5 px-3.5 py-1 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 rounded-full text-[10px] font-black border border-indigo-800/80 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs"
                title="เปลี่ยนรูปภาพโลโก้แอปพลิเคชัน"
              >
                <Camera className="w-3.5 h-3.5 text-indigo-400" />
                <span>📸 เปลี่ยนรูปโลโก้แอป</span>
              </button>
            </div>

            {/* Prominent Welcome Headline */}
            <div className="text-center space-y-2 mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-900/60 border border-indigo-700/50 rounded-full text-indigo-200 text-[10px] font-black">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>แอปพลิเคชันคลังต้มกลุ่มบ้านเคน พร้อมใช้งาน</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug font-display">
                ยินดีต้อนรับ<br />
                <span className="bg-gradient-to-r from-indigo-300 via-sky-300 to-indigo-300 bg-clip-text text-transparent italic">
                  เข้าแอปหารค่าต้ม G.BaanKen
                </span>
              </h1>
              <p className="text-zinc-300 font-bold text-xs max-w-xs mx-auto leading-relaxed pt-1">
                ระบบบัญชีและคำนวณหารค่าต้ม สัดส่วนค่าน้ำ ค่าไฟ ค่าแก๊ส ของกลุ่มบ้านเคนร่วมกัน 🍲
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="w-full grid grid-cols-2 gap-2 mb-5 text-left">
              <div className="bg-indigo-950/60 border border-indigo-800/40 p-2.5 rounded-2xl flex items-center gap-2.5">
                <span className="text-base p-1.5 bg-indigo-900/60 rounded-xl border border-indigo-700/40">🍲</span>
                <div>
                  <p className="text-[10px] font-black text-indigo-200">หารต้มโปร่งใส</p>
                  <p className="text-[8px] font-bold text-zinc-400">คำนวณอัตโนมัติ</p>
                </div>
              </div>
              <div className="bg-indigo-950/60 border border-indigo-800/40 p-2.5 rounded-2xl flex items-center gap-2.5">
                <span className="text-base p-1.5 bg-sky-900/60 rounded-xl border border-sky-700/40">⚡</span>
                <div>
                  <p className="text-[10px] font-black text-indigo-200">ค่าน้ำ/ไฟ/แก๊ส</p>
                  <p className="text-[8px] font-bold text-zinc-400">สรุปแยกหมวดหมู่</p>
                </div>
              </div>
              <div className="bg-indigo-950/60 border border-indigo-800/40 p-2.5 rounded-2xl flex items-center gap-2.5">
                <span className="text-base p-1.5 bg-emerald-900/60 rounded-xl border border-emerald-700/40">💳</span>
                <div>
                  <p className="text-[10px] font-black text-indigo-200">แจ้งชำระ/สลิป</p>
                  <p className="text-[8px] font-bold text-zinc-400">ตัดยอดจ่ายทันที</p>
                </div>
              </div>
              <div className="bg-indigo-950/60 border border-indigo-800/40 p-2.5 rounded-2xl flex items-center gap-2.5">
                <span className="text-base p-1.5 bg-purple-900/60 rounded-xl border border-purple-700/40">📲</span>
                <div>
                  <p className="text-[10px] font-black text-indigo-200">แชร์ตรง LINE</p>
                  <p className="text-[8px] font-bold text-zinc-400">ส่งรูปสรุปสะดวก</p>
                </div>
              </div>
            </div>

            {/* Modern Kitchen Info Banner */}
            <div className="w-full bg-slate-900/80 border border-indigo-900/40 p-3 rounded-2xl mb-5 text-[10px] font-bold text-zinc-300 leading-relaxed text-center flex flex-col gap-0.5 shadow-sm">
              <span className="font-extrabold text-amber-400">“แชร์เท่าเทียม สรุปยอดไว โปร่งใสทุกรายการ”</span>
              <span className="text-[9px] text-zinc-400">กลุ่มสมาชิกบ้านเคน เพื่อความสะดวกและสบายใจของทุกคน</span>
            </div>

            {/* Help callout for Action Required / Cookie / In-App browser fix & Link Share */}
            <div className="w-full bg-slate-900/90 border border-indigo-800/60 p-3.5 rounded-2xl mb-4 text-left text-[10px] font-bold shadow-md space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-[11px]">
                <span>💡</span>
                <span>วิธีแก้ไขเมื่อเข้าแอปไม่ได้ / แชร์ให้เพื่อนเข้าใช้งาน:</span>
              </div>
              <ul className="text-zinc-300 space-y-1.5 pl-5 list-disc text-[10px] leading-relaxed">
                <li>
                  <strong className="text-amber-300">ติดหน้าจอ "Action required to load your app"?</strong> กดปุ่มสีดำ <strong className="text-white underline">"Authenticate in new window"</strong> บนหน้าจอนั้น 1 ครั้ง เพื่อเปิดเข้าแอปทันที
                </li>
                <li>
                  <strong className="text-sky-300">เปิดจากแชท LINE / Messenger?</strong> แตะจุดสามจุด <strong className="text-white font-black">(...)</strong> แล้วเลือก <strong className="text-indigo-300">"เปิดด้วย Safari"</strong> หรือ <strong className="text-indigo-300">"เปิดในเบราว์เซอร์อื่น"</strong>
                </li>
              </ul>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const shareUrl = 'https://ais-pre-av7xmdofxlqucsy3ngixgx-694089981369.asia-east1.run.app';
                    navigator.clipboard.writeText(shareUrl);
                    toast.success('คัดลอกลิงก์ตรงเรียบร้อยแล้ว! ส่งต่อให้เพื่อนเปิดเข้าใช้งานได้ทันที');
                  }}
                  className="w-full py-2.5 px-3 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-xl font-extrabold text-[10px] flex items-center justify-center gap-1.5 border border-indigo-400/40 transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  <span>🔗 คัดลอกลิงก์ตรงส่งต่อให้เพื่อนเข้าใช้งาน</span>
                </button>
              </div>
            </div>

            {/* Primary Action / Enter Button */}
            <button
              type="button"
              onClick={() => setWelcomeStep('select')}
              className="w-full py-4 text-white rounded-2xl font-black text-xs uppercase tracking-wide shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-center flex items-center justify-center gap-2 shadow-indigo-950/80 border border-indigo-500/50 bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 hover:from-indigo-500 hover:to-sky-500"
            >
              <span>เข้าสู่แอป / เลือกรายชื่อ 🚀</span>
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="welcome-select-step"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            className="max-w-[460px] w-full bg-slate-950/95 backdrop-blur-xl rounded-[36px] shadow-[0_25px_80px_rgba(79,70,229,0.3)] border border-indigo-900/50 overflow-hidden relative p-8 flex flex-col items-center text-white"
          >
            {/* Top Indigo Border */}
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-600 via-sky-500 to-indigo-600" />
            
            {/* Navigation back button to Landing Page */}
            <div className="w-full flex justify-between items-center mb-4">
              <button
                type="button"
                onClick={() => setWelcomeStep('landing')}
                className="px-3.5 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 rounded-full text-[10px] font-black border border-indigo-800/80 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
              >
                <span>⬅️ ย้อนกลับหน้าต้อนรับ</span>
              </button>
              <span className="text-[10px] font-black text-indigo-400/80 uppercase tracking-widest bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-900/50">
                ขั้นตอนที่ 2
              </span>
            </div>

            <div className="flex flex-col items-center mb-5">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="w-32 h-32 bg-indigo-950/40 p-2 rounded-3xl border border-indigo-700/50 shadow-xl relative flex items-center justify-center group/welcomelogo cursor-pointer"
                onClick={() => logoFileInputRef.current?.click()}
                title="คลิกเพื่อเลือกเปลี่ยนรูปภาพโลโก้แอปพลิเคชัน"
              >
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-1 rounded-2xl border border-dashed border-indigo-500/40"
                />
                {/* Glowing indigo/amber halo behind the logo */}
                <div className="absolute inset-2 bg-gradient-to-tr from-indigo-600 to-amber-500 rounded-2xl blur-xl opacity-40 animate-pulse" />
                <div className="w-28 h-28 bg-slate-900 p-1 rounded-2xl shadow-md border border-indigo-900/60 relative overflow-hidden flex items-center justify-center z-10">
                  <img 
                    id="logo"
                    src={currentAppLogo || DEFAULT_APP_LOGO} 
                    alt="G.BaanKen Logo" 
                    referrerPolicy="no-referrer" 
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_APP_LOGO; }}
                    className="w-full h-full object-contain" 
                  />
                  <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover/welcomelogo:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-1 text-center">
                    <Camera className="w-6 h-6 mb-0.5 text-amber-300" />
                    <span className="text-[10px] font-black">เปลี่ยนโลโก้แอป</span>
                  </div>
                </div>
              </motion.div>

              <button
                type="button"
                onClick={() => logoFileInputRef.current?.click()}
                className="mt-2.5 px-3.5 py-1 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 rounded-full text-[10px] font-black border border-indigo-800/80 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs"
                title="เปลี่ยนรูปภาพโลโก้แอปพลิเคชัน"
              >
                <Camera className="w-3.5 h-3.5 text-indigo-400" />
                <span>📸 เปลี่ยนรูปโลโก้แอป</span>
              </button>
            </div>

            <div className="text-center space-y-1 mb-5">
              <span className="text-[10px] font-black tracking-[0.15em] text-indigo-300 bg-indigo-950/90 px-3.5 py-1 rounded-full uppercase border border-indigo-800/80">
                G.BAANKEN SYSTEM • MEMBER ACCESS
              </span>
              <p className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-widest pt-1">เลือกตัวตนเข้าใช้งาน • สมาชิกกลุ่มบ้านเคน</p>
              <h2 className="text-3xl font-black text-white tracking-tight font-display mt-2 italic">
                G.Baan<span className="text-indigo-500 not-italic">Ken</span>
              </h2>
              <p className="text-zinc-400 font-bold text-[11px]">ระบบบัญชีและคำนวณฐานข้อมูลหารค่าต้มร่วมกัน 🍲</p>
            </div>

            {/* Tab Navigation for Selecting Existing Name vs Registering New Name */}
            <div className="w-full grid grid-cols-2 bg-slate-900/90 p-1.5 rounded-2xl mb-4 text-[11px] font-black border border-indigo-900/40">
              <button
                type="button"
                onClick={() => {
                  setWelcomeTab('select');
                  setIsJoinNewOpen(false);
                }}
                className={cn(
                  "py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  welcomeTab === 'select' 
                    ? "bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 text-white shadow-lg shadow-indigo-950/80 font-black border border-indigo-500/50"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <span>👥 เลือกรายชื่อเดิม</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setWelcomeTab('register');
                  setIsJoinNewOpen(true);
                }}
                className={cn(
                  "py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  welcomeTab === 'register' 
                    ? "bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 text-white shadow-lg shadow-indigo-950/80 font-black border border-indigo-500/50"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <span>➕ มีชื่อใหม่ / สมาชิกอื่น</span>
              </button>
            </div>

            <div className="w-full space-y-4">
              {welcomeTab === 'select' ? (
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-zinc-400 pl-1 uppercase tracking-wider">
                    👤 โปรดเลือกรายชื่อของคุณที่จะเข้าใช้งานปัจจุบัน:
                  </label>
                  <div className="relative">
                    <select
                      value={selectedWelcomePersonId}
                      onChange={(e) => {
                        setSelectedWelcomePersonId(e.target.value);
                      }}
                      className="w-full bg-slate-900 border border-indigo-900/50 rounded-2xl px-5 py-3.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 cursor-pointer appearance-none shadow-sm"
                    >
                      <option value="guest" className="bg-slate-950 text-white">👤 ผู้เยี่ยมชมทั่วไป (Guest)</option>
                      {people.map(p => {
                        const isAdmin = ['บัง', 'แป้ง', 'อั้ม'].includes(p.name);
                        return (
                          <option key={p.id} value={p.name} className="bg-slate-950 text-white">
                            {isAdmin ? `👑 ${p.name} (FULL ADMIN)` : `👤 ${p.name}`}
                          </option>
                        );
                      })}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-500 font-black text-[10px]">
                      ▼
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-zinc-400 pl-1 uppercase tracking-wider">
                    🆕 ลงทะเบียนเพิ่มชื่อของคุณเข้าสู่ระบบกลุ่ม:
                  </label>
                  <input
                    type="text"
                    placeholder="พิมพ์ชื่อของคุณเป็นภาษาไทย (เช่น บัง, นาย, บอส, แบงค์)"
                    value={welcomeNameInput}
                    onChange={(e) => setWelcomeNameInput(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        document.getElementById('welcome-submit-button')?.click();
                      }
                    }}
                    className="w-full bg-slate-900 border border-indigo-900/50 rounded-2xl px-5 py-3.5 text-xs font-bold text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 block shadow-inner"
                  />
                  <p className="text-[9px] text-zinc-400 font-bold pl-1 leading-normal">
                    *เมื่อกดตกลง รายชื่อจะถูกเพิ่มเข้าสู่เซิร์ฟเวอร์ และทุกคนในกลุ่มจะเห็นชื่อคุณทันที! 👍
                  </p>
                </div>
              )}

              <button
                id="welcome-submit-button"
                onClick={async () => {
                  let userToSet = 'ผู้เยี่ยมชม';
                  if (welcomeTab === 'register') {
                    const trimmed = welcomeNameInput.trim();
                    if (!trimmed) {
                      toast.error('กรุณาระบุชื่อของคุณเพื่อลงทะเบียนสมาชิกใหม่');
                      return;
                    }
                    
                    const nameExists = people.some(p => p.name.toLowerCase() === trimmed.toLowerCase());
                    if (nameExists) {
                      toast.error('มีชื่อสมาชิกนี้อยู่ในระบบแล้ว กรุณาสลับไปแถบ "เลือกรายชื่อเดิม"');
                      setWelcomeTab('select');
                      setSelectedWelcomePersonId(trimmed);
                      return;
                    }

                    setIsSaving(true);
                    try {
                      const nextOrder = people.length > 0 ? Math.max(...people.map(p => p.order || 0)) + 1 : 1;
                      await addDoc(collection(db, 'people'), {
                        name: trimmed,
                        order: nextOrder,
                        createdAt: serverTimestamp()
                      });
                      userToSet = trimmed;
                      toast.success(`เพิ่มรายชื่อ ${trimmed} เรียบร้อยแล้ว!`);
                    } catch (e) {
                      console.error(e);
                      toast.error('ลงทะเบียนรายชื่อไม่สำเร็จกรุณาลองใหม่อีกครั้ง');
                      setIsSaving(false);
                      return;
                    } finally {
                      setIsSaving(false);
                    }
                  } else {
                    if (selectedWelcomePersonId !== 'guest') {
                      userToSet = selectedWelcomePersonId;
                    }
                  }

                  localStorage.setItem('currentUser', userToSet);
                  localStorage.setItem('hasEnteredApp', 'true');
                  setCurrentUser(userToSet);
                  setHasEnteredApp(true);
                  toast.success(`สวัสดียินดีต้อนรับ ${userToSet}! เข้าใช้งานคลังต้มกลุ่มบ้านเคน 🎉`);
                }}
                className={cn(
                  "w-full py-4 text-white rounded-2xl font-black text-xs uppercase tracking-wide shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-center flex items-center justify-center gap-2 mt-2 shadow-indigo-950/80 border border-indigo-500/50 bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 hover:from-indigo-500 hover:to-sky-500"
                )}
              >
                <span>{welcomeTab === 'register' ? 'ลงทะเบียนใหม่และเข้าสู่ระบบ 🚀' : 'เข้าใช้งานระบบคลังต้ม G.BaanKen 🚀'}</span>
              </button>
              
              <p className="text-[9px] text-zinc-400 font-bold text-center leading-relaxed">
                สมาชิกร่วมรับประทานและผู้หารสัดส่วนแก๊ส/น้ำ/ไฟ คนอื่นๆ สามารถเข้ามาเซฟ<br />
                และปรับเปลี่ยนยอดด้วยรายชื่อแยกของตนเอง เพื่อแบ่งเบาภาระงานได้อย่างลงตัว!
              </p>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen selection:bg-indigo-900 selection:text-white pb-12 transition-colors duration-300 relative overflow-x-hidden",
      themeObj.pageBg,
      personalDIY.fontFamily === 'kanit' ? 'font-[Kanit]' :
      personalDIY.fontFamily === 'prompt' ? 'font-[Prompt]' :
      personalDIY.fontFamily === 'mitr' ? 'font-[Mitr]' :
      personalDIY.fontFamily === 'itim' ? 'font-[Itim]' :
      personalDIY.fontFamily === 'chonburi' ? 'font-[Chonburi]' :
      personalDIY.fontFamily === 'sarabun' ? 'font-[Sarabun]' : 'font-sans',
      personalDIY.bgPattern === 'stars' ? 'pattern-stars' :
      personalDIY.bgPattern === 'grid' ? 'pattern-grid' :
      personalDIY.bgPattern === 'dots' ? 'pattern-dots' :
      personalDIY.bgPattern === 'sakura' ? 'pattern-sakura' :
      personalDIY.bgPattern === 'bubbles' ? 'pattern-bubbles' :
      personalDIY.bgPattern === 'waves' ? 'pattern-waves' : ''
    )}>
      <Toaster position="top-center" richColors />

      <div className={cn(
        "max-w-[500px] mx-auto min-h-screen flex flex-col shadow-[0_0_120px_0_rgba(0,0,0,0.4)] relative border-x transition-colors duration-300",
        themeObj.containerBg,
        personalDIY.cardStyle === 'neon' ? 'border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.2)]' :
        personalDIY.cardStyle === 'rounded' ? 'rounded-[40px] my-2 border-2' :
        personalDIY.cardStyle === 'retro' ? 'rounded-none border-2 border-slate-700' : ''
      )}>
        {isSaving && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-[2px] z-[100] flex flex-col items-center justify-center pointer-events-auto">
            <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mb-4" />
          </div>
        )}
        
        {/* Header Decor */}
        <header className={cn("relative pt-16 pb-24 px-8 bg-gradient-to-b overflow-hidden isolate border-b transition-colors duration-300", themeObj.headerGradient, themeObj.headerBorder)}>
          {/* Help button in top-left */}
          <button 
            type="button"
            onClick={() => setIsInstructionsOpen(true)}
            className="absolute top-4 left-4 z-35 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 rounded-full text-[11px] font-black border border-slate-700/80 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="วิธีใช้งานแอป"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
            <span>วิธีใช้งาน</span>
          </button>

          {/* DIY Studio button in top-bar */}
          <button 
            type="button"
            onClick={() => setIsDIYStudioOpen(true)}
            className="absolute top-4 right-52 z-35 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white rounded-full text-[11px] font-black border border-pink-400/50 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="สตูดิโอตกแต่งแอปส่วนตัว (สติกเกอร์, สีกล่องข้อความ, ฟอนต์, ลวดลาย) - ขึ้นเฉพาะเครื่องคุณ"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span>✨ DIY ตกแต่ง</span>
          </button>

          {/* Theme switcher button in top-bar */}
          <button 
            type="button"
            onClick={() => {
              setBankModalTab('theme');
              setIsBankModalOpen(true);
            }}
            className={cn(
              "absolute top-4 right-32 z-35 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer",
              themeObj.badgeBg
            )}
            title="ปรับแต่งสีธีมหลัก (ดำ, แดง, ขาว, เหลือง)"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{themeObj.emoji} ธีม</span>
          </button>

          {/* User profile toggle button in top-right */}
          <button 
            type="button"
            onClick={() => {
              triggerConfirm(
                'สลับบัญชีผู้ใช้งาน?',
                'คุณแน่ใจหรือไม่ว่าต้องการออกจากเซสชันผู้ใช้ปัจจุบัน เพื่อเลือกเข้าใช้งานในฐานะสมาชิกคนอื่น?',
                () => {
                  localStorage.removeItem('hasEnteredApp');
                  localStorage.removeItem('currentUser');
                  setHasEnteredApp(false);
                  setWelcomeStep('landing');
                  setCurrentUser(null);
                  toast.info('ออกจากระบบเซสชันผู้ใช้ปัจจุบันแล้ว');
                }
              );
            }}
            className={cn(
              "absolute top-4 right-4 z-35 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-850 text-white rounded-full text-[11px] font-black border border-slate-700/80 shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer",
              personalDIY.avatarBorder === 'rainbow' ? 'ring-2 ring-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.4)]' :
              personalDIY.avatarBorder === 'gold' ? 'ring-2 ring-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]' :
              personalDIY.avatarBorder === 'neon' ? 'ring-2 ring-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]' :
              personalDIY.avatarBorder === 'blossom' ? 'ring-2 ring-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.4)]' :
              personalDIY.avatarBorder === 'cyber' ? 'ring-2 ring-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]' :
              personalDIY.avatarBorder === 'diamond' ? 'ring-2 ring-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.4)]' : ''
            )}
            title="เปลี่ยนผู้ใช้งาน / ออกจากระบบ"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="max-w-[70px] truncate">{currentUser || 'บุคคลทั่วไป'}</span>
          </button>

          {/* Abstract background blobs with floating animation */}
          <motion.div 
            animate={{ 
              x: [0, 20, 0],
              y: [0, -20, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-80 h-80 bg-indigo-600/15 blur-3xl rounded-full" 
          />
          <motion.div 
            animate={{ 
              x: [0, -30, 0],
              y: [0, 20, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-60 h-60 bg-sky-600/10 blur-3xl rounded-full" 
          />
          
          {/* Floating Icons Decor */}
          <div className="absolute top-10 left-10 opacity-[0.05] -rotate-12">
            <Utensils className="w-12 h-12 text-indigo-400" />
          </div>
          <div className="absolute bottom-10 right-10 opacity-[0.05] rotate-12">
            <Users className="w-16 h-16 text-indigo-400" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="flex flex-col items-center">
              <motion.div 
                style={{ cursor: 'pointer' }}
                onClick={() => logoFileInputRef.current?.click()}
                initial={{ scale: 0.9, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="w-32 h-32 sm:w-36 sm:h-36 bg-white p-1.5 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/10 mb-2 border-2 border-amber-200/80 overflow-hidden hover:scale-105 active:scale-95 transition-all relative group cursor-pointer"
                title="คลิกเพื่อเปลี่ยนรูปภาพโลโก้แอปทันที"
              >
                <img 
                  id="logo-header"
                  src={currentAppLogo || DEFAULT_APP_LOGO} 
                  alt="G.BaanKen Original Logo" 
                  referrerPolicy="no-referrer" 
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_APP_LOGO; }}
                  className="w-full h-full object-contain" 
                />
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 text-center rounded-2xl">
                  <Camera className="w-6 h-6 mb-1 text-amber-300 animate-bounce" />
                  <span className="text-[10px] font-black tracking-wide">เปลี่ยนโลโก้แอป</span>
                </div>
              </motion.div>

              <button
                type="button"
                onClick={() => logoFileInputRef.current?.click()}
                className="mb-4 px-3.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-full text-[11px] font-black border border-amber-500/40 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs hover:border-amber-400"
                title="เปลี่ยนรูปภาพโลโก้แอปพลิเคชัน"
              >
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>📸 เปลี่ยนรูปโลโก้แอป</span>
              </button>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-1"
            >
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display italic drop-shadow-md">
                {personalDIY.headerTitle === 'G.BaanKen' ? (
                  <>G.Baan<span className="text-indigo-500 not-italic">Ken</span></>
                ) : (
                  personalDIY.headerTitle || 'G.BaanKen'
                )}
              </h1>
            </motion.div>
            <div className="flex flex-wrap items-center gap-2 mb-4 justify-center">
              <p className="text-indigo-300/80 text-[10px] font-black uppercase tracking-[0.3em]">แอปหารค่าต้ม G.BaanKen</p>
              {personalDIY.customBadge && (
                <span className="px-2.5 py-0.5 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 text-pink-300 border border-pink-500/40 rounded-full text-[9px] font-black tracking-wider uppercase flex items-center gap-1 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
                  {personalDIY.customBadge}
                </span>
              )}
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[9px] font-black tracking-wider uppercase flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                120 FPS
              </span>
            </div>
            
            {/* Real-time Admin Banner for Pending Payment Approvals */}
            {isAdminUser && pendingPaymentsList.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => {
                  if (pendingPaymentsList[0]) {
                    setActivePendingAlert(pendingPaymentsList[0]);
                  } else {
                    setIsAdminPanelOpen(true);
                  }
                }}
                className="mb-6 w-full max-w-md mx-auto bg-gradient-to-r from-emerald-600 via-sky-600 to-indigo-600 p-3.5 rounded-2xl text-white flex items-center justify-between shadow-2xl border border-emerald-400/40 cursor-pointer hover:scale-102 transition-all"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <span className="text-lg animate-bounce">🔔</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black tracking-wide">
                        แอดมิน {currentUser ? `(${currentUser})` : ''}: มี {pendingPaymentsList.length} สลิป/รายการโอนรออนุมัติ!
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-emerald-100">
                      แตะเพื่อตรวจสลิปและอนุมัติการจ่ายเงินทันที ⚡
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1.5 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm shrink-0">
                  ตรวจสลิป 🔍
                </span>
              </motion.div>
            )}
            


            {/* Download/Install button for PWA/other users */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDownloadModalOpen(true)}
              className="mb-8 px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-600 hover:from-indigo-500 hover:to-sky-500 text-white rounded-full text-xs font-black shadow-xl shadow-indigo-950/80 flex items-center gap-2 border border-indigo-400/40 tracking-wide cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-300 animate-pulse" />
              ดาวน์โหลด / ติดตั้งแอปมือถือ 📲
            </motion.button>
            
            <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full">
              <div className="text-left bg-gradient-to-br from-black via-slate-950 to-zinc-900 p-5 rounded-3xl border border-indigo-900/60 shadow-xl relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-indigo-600/10 rounded-full blur-xl pointer-events-none" />
                <span className="block text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">ยอดรวมทั้งหมด</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-display font-black text-white tracking-tight">{totalPotPrice.toLocaleString()}</span>
                  <span className="text-sm font-bold text-indigo-400">฿</span>
                </div>
              </div>
              <div className="text-right bg-gradient-to-br from-indigo-950 via-zinc-950 to-slate-900 p-5 rounded-3xl border border-indigo-800/80 shadow-xl relative overflow-hidden">
                <span className="block text-[9px] text-indigo-300 font-black uppercase tracking-widest mb-1">สมาชิกในกลุ่ม</span>
                <div className="flex items-baseline gap-2 justify-end">
                   <span className="text-3xl font-display font-black text-indigo-400 tracking-tight">{people.length}</span>
                   <span className="text-sm font-bold text-indigo-300">คน</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="sticky top-0 z-40 px-6 -mt-8 pb-8 bg-transparent pointer-events-none">
          {/* Decorative background pattern behind navigation to fill space */}
          <div className="absolute inset-0 top-12 bottom-0 opacity-[0.03] pointer-events-none px-12">
            <div className="w-full h-full border-2 border-dashed border-indigo-900 rounded-[60px]" />
          </div>
          <div className={cn("backdrop-blur-2xl rounded-[40px] p-2 pr-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex gap-2 pointer-events-auto relative overflow-x-auto no-scrollbar transition-colors duration-300", themeObj.navContainerBg)}>
            {(['people', 'items', 'water', 'electricity', 'gas', 'summary'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 min-w-[70px] py-4 rounded-[30px] text-[12px] font-black tracking-tight transition-all duration-300 relative overflow-hidden whitespace-nowrap cursor-pointer active:scale-95",
                  activeTab === tab 
                    ? "text-white font-black" 
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {activeTab === tab && (
                  <motion.div 
                    layoutId="active-tab-glow"
                    className={cn("absolute inset-0 border rounded-[30px] shadow-xl", themeObj.navActiveGradient, themeObj.navActiveBorder, themeObj.navGlowColor)}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="active-tab-indicator"
                    className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-1 bg-white rounded-full shadow-xs"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex flex-col items-center justify-center gap-1">
                  {tab === 'people' && <Users className="w-3.5 h-3.5" />}
                  {tab === 'items' && <Utensils className="w-3.5 h-3.5" />}
                  {tab === 'water' && <Droplets className="w-3.5 h-3.5" />}
                  {tab === 'electricity' && <Zap className="w-3.5 h-3.5" />}
                  {tab === 'gas' && <Flame className="w-3.5 h-3.5" />}
                  {tab === 'summary' && <CreditCard className="w-3.5 h-3.5" />}
                  <span className="text-[10px]">
                    {tab === 'people' ? 'สมาชิก' : 
                     tab === 'items' ? 'ค่าต้ม' : 
                     tab === 'water' ? 'ค่าน้ำ' : 
                     tab === 'electricity' ? 'ค่าไฟ' : 
                     tab === 'gas' ? 'ค่าแก๊ส' : 'สรุปยอด'}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <main className="flex-1 px-6">
          <AnimatePresence mode="wait">
            {activeTab === 'people' && (
              <motion.div
                key="people"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex gap-3">
                  <div className="flex-1 relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2">
                      <Users className="w-4 h-4 text-indigo-400 group-focus-within:text-indigo-300 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddPerson()}
                      placeholder="เพิ่มชื่อคนหาร..."
                      className="w-full bg-slate-900 border border-indigo-900/50 rounded-[24px] pl-12 pr-5 py-5 text-[15px] font-bold text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all shadow-inner"
                    />
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={handleAddPerson}
                    className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 text-white w-16 h-16 rounded-[24px] flex items-center justify-center shadow-2xl shadow-indigo-950/90 hover:from-indigo-500 hover:to-sky-500 transition-all cursor-pointer border border-indigo-400/50"
                  >
                    <Plus className="w-7 h-7 text-white" />
                  </motion.button>
                </div>

                <div className="flex gap-2">
                  <motion.button 
                    whileHover={{ x: 5 }}
                    className="flex-1 bg-slate-900 border border-red-900/50 text-red-200 text-[10px] font-black uppercase tracking-[0.2em] py-4 rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-slate-850 hover:text-white shadow-md relative cursor-pointer" 
                    onClick={() => setIsAdminPanelOpen(true)}
                  >
                    <Settings className="w-4 h-4 text-red-500" />
                    <span>ตั้งค่าแอดมิน</span>
                    {pendingPaymentsList.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white font-display text-[9px] font-black animate-bounce shadow-lg shadow-red-950/50">
                        {pendingPaymentsList.length}
                      </span>
                    )}
                  </motion.button>

                  {isAdminUser && (
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-slate-900 border border-red-900/50 text-red-300 text-[10px] font-black uppercase tracking-[0.2em] py-4 rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-slate-850 hover:text-white shadow-md cursor-pointer" 
                      onClick={handleSetupRequestedList}
                    >
                      <RefreshCw className="w-4 h-4 text-red-400" /> จัดรายชื่อเริ่มต้น
                    </motion.button>
                  )}
                </div>

                <div className="space-y-4">
                  {people.length === 0 ? (
                    <div className="py-20 text-center bg-slate-900/50 rounded-[40px] border-2 border-dashed border-red-900/40">
                      <div className="w-16 h-16 bg-slate-950 border border-red-900/60 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Users className="w-8 h-8 text-red-500/60" />
                      </div>
                      <p className="text-zinc-400 text-sm font-black uppercase tracking-widest">ยังไม่มีสมาชิกในกลุ่ม</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {people
                        .sort((a, b) => (a.order || 99) - (b.order || 99))
                        .map((p, index) => {
                          const owed = debts[p.name] || 0;
                          const totalDebt = personShareTotal[p.name] || 0;
                          const isPaid = owed <= 0 && totalDebt > 0;
                          const credit = p.credit || 0;
                          const shares = personSharePerCategory[p.name] || { food: 0, water: 0, electricity: 0, gas: 0, other: 0 };
                          const creditUsed = Math.min(shares.food, credit);
                          
                          return (
                            <motion.div 
                              key={p.id} 
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.04 }}
                              className="group/row bg-slate-900 p-5 sm:p-6 rounded-[2.5rem] border border-red-900/40 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all hover:border-red-600/60 hover:shadow-red-950/40 text-white relative"
                            >
                              <div className="flex items-center gap-3 sm:gap-4">
                                <div className="flex items-center gap-2">
                                  {/* Profile Picture with Long Press detector */}
                                  <div 
                                    className="relative group/avatar cursor-pointer select-none"
                                    onTouchStart={() => handleTouchStartAvatar(p.id)}
                                    onTouchEnd={handleTouchEndAvatar}
                                    onTouchMove={handleTouchEndAvatar}
                                    onMouseDown={() => handleTouchStartAvatar(p.id)}
                                    onMouseUp={handleTouchEndAvatar}
                                    onMouseLeave={handleTouchEndAvatar}
                                    onClick={() => handleAvatarChangeClick(p.id)}
                                    title="กดค้างเพื่อเปิดเมนูรูป หรือคลิกเพื่อเปลี่ยนรูป"
                                  >
                                    <div className={cn(
                                      "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg border-2 border-red-900/60 shadow-xl transition-all group-hover/avatar:scale-105 overflow-hidden bg-slate-950 relative",
                                      isPaid 
                                        ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-950/50" 
                                        : "text-red-400 shadow-red-950/40"
                                    )}>
                                      {p.photoUrl ? (
                                        <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                                      ) : (
                                        isPaid ? <Check className="w-7 h-7" strokeWidth={4} /> : p.name.charAt(0)
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Change Photo Button */}
                                  <button 
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAvatarChangeClick(p.id);
                                    }}
                                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold border flex items-center gap-1 shadow-xs transition-all active:scale-95 cursor-pointer bg-slate-950 hover:bg-slate-850 text-zinc-300 border-red-900/60 hover:border-red-600"
                                    title={isAdminUser ? "เปลี่ยนรูปโปรไฟล์" : "เปลี่ยนรูปโปรไฟล์ (เฉพาะแอดมิน)"}
                                  >
                                    <Camera className="w-3.5 h-3.5 text-red-400" />
                                    <span className="text-[11px] font-black">เปลี่ยนรูป</span>
                                    {!isAdminUser && <span className="text-[9px] text-amber-400 font-bold ml-0.5">🔒</span>}
                                  </button>
                                </div>

                                <div className="flex flex-col">
                                  <span className="font-black text-white text-[17px] leading-tight tracking-tight">{p.name}</span>
                                  <div className="flex flex-col gap-1 mt-0.5">
                                    {(totalDebt > 0 || credit > 0) ? (
                                      <>
                                        <span className={cn(
                                          "text-[10px] font-black uppercase tracking-[0.1em]",
                                          isPaid ? "text-emerald-400" : "text-amber-400 animate-pulse font-black"
                                        )}>
                                          {isPaid ? "จ่ายครบแล้ว ✨" : `ค้าง ${Math.ceil(owed).toLocaleString()} ฿`}
                                        </span>
                                        {personPendingTotal[p.name] > 0 && (
                                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/80 text-amber-200 text-[10px] font-black rounded-xl border border-amber-800/80 animate-pulse">
                                            ⏳ แจ้งโอนแล้ว (+{Math.ceil(personPendingTotal[p.name]).toLocaleString()} ฿) รอแอดมินอนุมัติ
                                          </span>
                                        )}
                                        {creditUsed > 0 && (
                                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                                            หักเครดิตค่าต้มแล้ว {Math.ceil(creditUsed).toLocaleString()} ฿
                                          </span>
                                        )}
                                        {credit > creditUsed && (
                                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                                            เครดิตคงเหลือ {Math.ceil(credit - creditUsed).toLocaleString()} ฿
                                          </span>
                                        )}
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                          {shares.food > 0 && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-950/80 text-red-200 border border-red-800/80 text-[10px] font-black rounded-lg">
                                              🥘 ค่าต้ม: {Math.ceil(shares.food).toLocaleString()} ฿
                                            </span>
                                          )}
                                          {shares.water > 0 && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-950/80 text-sky-200 border border-sky-800/80 text-[10px] font-black rounded-lg">
                                              💧 ค่าน้ำ: {Math.ceil(shares.water).toLocaleString()} ฿
                                            </span>
                                          )}
                                          {shares.electricity > 0 && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-950/80 text-amber-200 border border-amber-800/80 text-[10px] font-black rounded-lg">
                                              ⚡ ค่าไฟ: {Math.ceil(shares.electricity).toLocaleString()} ฿
                                            </span>
                                          )}
                                          {shares.gas > 0 && (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-950/80 text-orange-200 border border-orange-800/80 text-[10px] font-black rounded-lg">
                                              🔥 ค่าแก๊ส: {Math.ceil(shares.gas).toLocaleString()} ฿
                                            </span>
                                          )}
                                        </div>
                                      </>
                                    ) : (
                                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">ยังไม่มีรายการ</span>
                                    )}
                                    
                                    {isAdminUser ? (
                                      <div className="mt-1">
                                        {editingCreditPersonId === p.id ? (
                                          <div className="flex items-center gap-1">
                                            <input 
                                              type="number"
                                              value={tempCreditValue}
                                              onChange={(e) => setTempCreditValue(e.target.value)}
                                              className="w-16 px-1.5 py-0.5 text-[10px] font-bold bg-slate-950 text-white border border-red-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-red-500"
                                              placeholder="เครดิต"
                                              autoFocus
                                              onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleUpdateCredit(p.id, tempCreditValue);
                                                if (e.key === 'Escape') setEditingCreditPersonId(null);
                                              }}
                                            />
                                            <button 
                                              onClick={() => handleUpdateCredit(p.id, tempCreditValue)}
                                              className="p-1 text-emerald-400 hover:bg-emerald-950 rounded cursor-pointer"
                                            >
                                              <Check className="w-2.5 h-2.5" strokeWidth={3} />
                                            </button>
                                            <button 
                                              onClick={() => setEditingCreditPersonId(null)}
                                              className="p-1 text-zinc-400 hover:bg-slate-800 rounded cursor-pointer"
                                            >
                                              <X className="w-2.5 h-2.5" />
                                            </button>
                                          </div>
                                        ) : (
                                          <button 
                                            onClick={() => {
                                              setEditingCreditPersonId(p.id);
                                              setTempCreditValue(p.credit?.toString() || '0');
                                            }}
                                            className="text-[9px] font-black text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                                          >
                                            <CreditCard className="w-2 h-2" /> {p.credit ? 'แก้ไขเครดิต (Admin)' : 'เพิ่มเครดิต (Admin)'}
                                          </button>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="mt-1 space-y-1">
                                        <button 
                                          onClick={() => {
                                            setTargetCreditRequest(p);
                                            setIsCreditModalOpen(true);
                                          }}
                                          className="text-[9px] font-black text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                                        >
                                          <Plus className="w-2 h-2" /> ขอเครดิต
                                        </button>
                                      </div>
                                    )}

                                    {/* Status of Pending or Rejected Credit Requests */}
                                    {(() => {
                                      const pPending = creditRequests.filter(r => (r.personId === p.id || r.personName === p.name) && r.status === 'pending');
                                      const pRejected = creditRequests.filter(r => (r.personId === p.id || r.personName === p.name) && r.status === 'rejected');
                                      return (
                                        <div className="space-y-1 mt-1">
                                          {pPending.map(req => (
                                            <div key={req.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 text-[10px] font-black rounded-xl border border-amber-200/80 animate-pulse">
                                              <span>⏳ คำขอเครดิต +{req.amount.toLocaleString()} ฿ (รอแอดมินอนุมัติ)</span>
                                            </div>
                                          ))}
                                          {pRejected.map(req => (
                                            <div key={req.id} className="flex items-center justify-between gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-800 text-[10px] font-black rounded-xl border border-rose-200/80">
                                              <span>❌ คำขอไม่อนุญาต (+{req.amount.toLocaleString()} ฿)</span>
                                              <button 
                                                type="button"
                                                onClick={() => handleDismissCreditRequest(req.id)}
                                                className="text-[9px] text-rose-600 hover:text-rose-800 underline font-bold cursor-pointer ml-1"
                                              >
                                                รับทราบ
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>
                              {/* Actions & Quick Pay Cluster */}
                              <div className="flex items-center gap-2 self-end sm:self-center shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60 sm:border-transparent">
                                {/* PromptPay QR Button */}
                                {isAdminUser && owed > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleDirectApprovePerson(p.name)}
                                    className="px-3 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-wider shadow-md shadow-emerald-950/50 border border-emerald-400/40 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
                                    title={`อนุญาตจ่ายเงินของ ${p.name} และหักยอดทันที ${Math.ceil(owed).toLocaleString()} ฿`}
                                  >
                                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                    <span>อนุญาตจ่าย ⚡</span>
                                  </button>
                                )}
                                <button 
                                  type="button"
                                  onClick={() => {
                                    handleSelectQrMember(p.name);
                                    setBankModalTab('qr');
                                    setIsBankModalOpen(true);
                                  }}
                                  className="p-2.5 sm:p-3 bg-slate-950 hover:bg-slate-850 text-sky-400 border border-sky-900/40 hover:border-sky-500/60 hover:text-sky-300 rounded-2xl text-[11px] font-black shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1 shrink-0"
                                  title={`สร้าง PromptPay QR Code สำหรับ ${p.name}`}
                                >
                                  <QrCode className="w-4 h-4" />
                                  <span className="text-[10px] font-black hidden xs:inline">QR</span>
                                </button>

                                {/* Quick Pay Floating / Action Button */}
                                {owed > 0 ? (
                                  <motion.button 
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => {
                                      const personPots = foods
                                        .filter(f => f.eaters.some(e => e.name === p.name))
                                        .map(f => f.id);
                                      setSelectedPotsRaw(prev => ({ ...prev, [p.name]: personPots }));
                                      setTargetPayment({
                                        name: p.name,
                                        amount: owed,
                                        payerAmount: Math.ceil(owed).toString(),
                                        foodId: personPots.join(',')
                                      });
                                      setIsPayModalOpen(true);
                                    }}
                                    className="relative group/qp px-4 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 via-rose-600 to-red-600 hover:from-amber-400 hover:via-rose-500 hover:to-red-500 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-red-950/70 border border-amber-300/40 flex items-center gap-2 cursor-pointer transition-all shrink-0"
                                    title={`แจ้งโอนเงินด่วน Quick Pay สำหรับ ${p.name} (ยอดคงค้าง ${Math.ceil(owed).toLocaleString()} ฿)`}
                                  >
                                    <span className="relative flex h-2 w-2">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-100"></span>
                                    </span>
                                    <Zap className="w-4 h-4 text-amber-200 fill-amber-300 shrink-0" />
                                    <div className="flex flex-col items-start text-left">
                                      <span className="text-[10px] sm:text-[11px] font-black leading-none tracking-tight">Quick Pay</span>
                                      <span className="text-[9px] text-amber-100 font-bold leading-none mt-0.5">{Math.ceil(owed).toLocaleString()} ฿</span>
                                    </div>
                                  </motion.button>
                                ) : isPaid ? (
                                  <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 rounded-2xl text-[11px] font-black shadow-md shadow-emerald-950/40 shrink-0">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span className="leading-none">จ่ายครบแล้ว</span>
                                  </div>
                                ) : (
                                  <button 
                                    type="button"
                                    onClick={() => {
                                      const personPots = foods
                                        .filter(f => f.eaters.some(e => e.name === p.name))
                                        .map(f => f.id);
                                      setSelectedPotsRaw(prev => ({ ...prev, [p.name]: personPots }));
                                      setTargetPayment({
                                        name: p.name,
                                        amount: 0,
                                        payerAmount: '0',
                                        foodId: personPots.join(',')
                                      });
                                      setIsPayModalOpen(true);
                                    }}
                                    className="px-3.5 py-2.5 bg-slate-950 hover:bg-slate-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                                    title={`แจ้งโอนเงินล่วงหน้า / ฝากเงินสำหรับ ${p.name}`}
                                  >
                                    <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                                    <span>โอนล่วงหน้า</span>
                                  </button>
                                )}

                                {/* Admin Delete Button */}
                                {isAdminUser && (
                                  <button 
                                    onClick={() => handleDeletePerson(p.id)}
                                    className="w-10 h-10 rounded-2xl bg-slate-950 text-zinc-500 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-950/80 hover:border-red-600 flex items-center justify-center cursor-pointer shrink-0"
                                    title={`ลบสมาชิก ${p.name} (Admin)`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                    </div>
                  )}
                </div>

                {isAdminUser && (
                  <button 
                    onClick={() => setIsBankModalOpen(true)}
                    className="w-full py-4 bg-slate-900 border border-red-900/50 hover:border-red-600/70 rounded-2xl text-zinc-300 hover:text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-sky-500" />
                    <span>ตั้งค่ารับเงิน</span>
                  </button>
                )}
              </motion.div>
            )}

            {(activeTab === 'items' || activeTab === 'water' || activeTab === 'electricity' || activeTab === 'gas') && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  {activeTab === 'items' && foods.filter(f => !f.category || f.category === 'food').length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mb-2 p-1.5 bg-slate-900/80 rounded-3xl border border-red-900/40">
                      <button 
                        onClick={() => {
                          setLineShareText(generateLinePotsText(foods));
                          setIsLinePotsModalOpen(true);
                        }}
                        className="py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl text-[12px] font-black uppercase tracking-wider shadow-md shadow-emerald-950/50 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Share2 className="w-4 h-4 text-emerald-300" />
                        แชร์ตารางต้มลง LINE
                      </button>
                      
                      <button 
                        onClick={() => {
                          const potCosts = foods.filter(f => !f.category || f.category === 'food');
                          let autoRange = "26-50";
                          if (potCosts.length > 0) {
                            const namesWithNum = potCosts.map(f => {
                              const m = f.name.match(/\d+/);
                              return m ? parseInt(m[0]) : null;
                            }).filter((v): v is number => v !== null);
                            if (namesWithNum.length > 0) {
                              const minStr = Math.min(...namesWithNum);
                              const maxStr = Math.max(...namesWithNum);
                              autoRange = `${minStr}-${maxStr}`;
                            }
                          }
                          setLineRangeInput(autoRange);
                          setIsLineUnpaidModalOpen(true);
                        }}
                        className="py-3 px-4 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-2xl text-[12px] font-black uppercase tracking-wider shadow-md shadow-red-950/50 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 text-red-300" />
                        แชร์ยอดค้างส่ง LINE
                      </button>
                    </div>
                  )}

                  {activeTab === 'water' && foods.filter(f => f.category === 'water').length > 0 && (
                    <div className="mb-2 p-1.5 bg-slate-900/80 rounded-3xl border border-red-900/40">
                      <button 
                        onClick={() => {
                          setLineShareText(generateTabUnpaidShareText('water'));
                          setIsLineSingleItemModalOpen(true);
                        }}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-600 to-sky-800 text-white rounded-2xl text-[12px] font-black uppercase tracking-wider shadow-md shadow-sky-950/50 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Share2 className="w-4 h-4 text-sky-300" />
                        แชร์สถานะค่าน้ำทั้งหมดลง LINE (ตามยอดค้าง/จ่ายแล้ว)
                      </button>
                    </div>
                  )}

                  {activeTab === 'electricity' && foods.filter(f => f.category === 'electricity').length > 0 && (
                    <div className="mb-2 p-1.5 bg-slate-900/80 rounded-3xl border border-red-900/40">
                      <button 
                        onClick={() => {
                          setLineShareText(generateTabUnpaidShareText('electricity'));
                          setIsLineSingleItemModalOpen(true);
                        }}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-600 to-amber-800 text-white rounded-2xl text-[12px] font-black uppercase tracking-wider shadow-md shadow-amber-950/50 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Share2 className="w-4 h-4 text-amber-300" />
                        แชร์สถานะค่าไฟทั้งหมดลง LINE (ตามยอดค้าง/จ่ายแล้ว)
                      </button>
                    </div>
                  )}

                  {activeTab === 'gas' && foods.filter(f => f.category === 'gas').length > 0 && (
                    <div className="mb-2 p-1.5 bg-slate-900/80 rounded-3xl border border-red-900/40">
                      <button 
                        onClick={() => {
                          setLineShareText(generateTabUnpaidShareText('gas'));
                          setIsLineSingleItemModalOpen(true);
                        }}
                        className="w-full py-3.5 px-4 bg-gradient-to-r from-orange-600 to-orange-800 text-white rounded-2xl text-[12px] font-black uppercase tracking-wider shadow-md shadow-orange-950/50 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Share2 className="w-4 h-4 text-orange-300" />
                        แชร์สถานะค่าแก๊สทั้งหมดลง LINE (ตามยอดค้าง/จ่ายแล้ว)
                      </button>
                    </div>
                  )}

                  {/* Food Items Search Bar & Batch Selection Toolbar */}
                  {(() => {
                    const activeCategoryPots = foods
                      .filter(f => {
                        if (activeTab === 'items') return !f.category || f.category === 'food';
                        return f.category === activeTab;
                      })
                      .sort((a, b) => {
                        const numA = a.name.match(/\d+/);
                        const numB = b.name.match(/\d+/);
                        if (numA && numB) {
                          const valA = parseInt(numA[0], 10);
                          const valB = parseInt(numB[0], 10);
                          if (valA !== valB) return valA - valB;
                        }
                        const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
                        const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
                        return timeA - timeB;
                      });

                    const q = foodSearchQuery.trim().toLowerCase();
                    const filteredCategoryPots = activeCategoryPots.filter(f => {
                      if (!q) return true;
                      const nameMatch = f.name?.toLowerCase().includes(q);
                      const cookMatch = f.cook?.toLowerCase().includes(q);
                      const createdByMatch = f.createdBy?.toLowerCase().includes(q);
                      const eaterMatch = f.eaters?.some(e => e.name?.toLowerCase().includes(q));
                      return !!(nameMatch || cookMatch || createdByMatch || eaterMatch);
                    });

                    const selectedTotalPrice = activeCategoryPots
                      .filter(f => selectedFoodIds.has(f.id))
                      .reduce((sum, f) => sum + (f.price || 0), 0);

                    if (activeCategoryPots.length === 0) return null;

                    return (
                      <div className="space-y-3 mb-3">
                        {/* Food Items Search Bar */}
                        <div className="relative group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 group-focus-within:text-red-400 transition-colors">
                            <Search className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            value={foodSearchQuery}
                            onChange={(e) => setFoodSearchQuery(e.target.value)}
                            placeholder="🔍 ค้นหาตามชื่อหม้อ, คนต้ม (👨‍🍳), หรือคนเขียน (✍️)..."
                            className="w-full bg-slate-900/90 border border-red-900/40 rounded-2xl pl-11 pr-24 py-3 text-xs font-bold text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all shadow-md"
                          />
                          {foodSearchQuery ? (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                              <span className="text-[10px] font-black bg-red-950/90 text-red-300 px-2 py-0.5 rounded-lg border border-red-800/80">
                                {filteredCategoryPots.length}/{activeCategoryPots.length} หม้อ
                              </span>
                              <button
                                type="button"
                                onClick={() => setFoodSearchQuery('')}
                                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                                title="ล้างคำค้นหา"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500 hidden sm:block pointer-events-none">
                              ชื่อ / คนต้ม / คนเขียน
                            </div>
                          )}
                        </div>

                        {/* Search Filter Info Active Badge */}
                        {foodSearchQuery && (
                          <div className="flex items-center justify-between px-1 text-[11px] font-bold text-zinc-400">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-zinc-400">ผลการค้นหาสำหรับ:</span>
                              <span className="bg-red-950 text-red-300 px-2 py-0.5 rounded-lg border border-red-800/60 font-black">
                                "{foodSearchQuery}"
                              </span>
                              <span className="text-zinc-500 text-[10px]">
                                (พบ {filteredCategoryPots.length} จาก {activeCategoryPots.length} หม้อ)
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setFoodSearchQuery('')}
                              className="text-xs text-red-400 hover:text-red-300 underline cursor-pointer ml-auto font-bold"
                            >
                              ล้างคำค้นหา
                            </button>
                          </div>
                        )}

                        {/* Batch Multi-Select Toolbar */}
                        <div className="flex items-center justify-between gap-2 bg-slate-900/90 p-2.5 rounded-2xl border border-red-900/40">
                          <button
                            type="button"
                            onClick={() => {
                              if (isBatchSelectMode) {
                                setIsBatchSelectMode(false);
                                setSelectedFoodIds(new Set());
                              } else {
                                setIsBatchSelectMode(true);
                                toast.info('🎯 แตะที่หม้อเพื่อเลือก หรือกรอกช่วงตัวเลขด้านล่าง');
                              }
                            }}
                            className={cn(
                              "px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer",
                              isBatchSelectMode
                                ? "bg-red-600 text-white shadow-md shadow-red-950/60"
                                : "bg-slate-950 text-zinc-300 hover:text-white border border-red-900/40 hover:border-red-600"
                            )}
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>{isBatchSelectMode ? "❌ ออกจากโหมดเลือกหม้อ" : "🔘 เลือกหลายหม้อเพื่อลบ (หรือกดค้าง)"}</span>
                          </button>

                          <div className="text-[11px] font-bold text-zinc-400">
                            {isBatchSelectMode ? (
                              <span className="text-red-400 font-extrabold">
                                เลือกแล้ว {selectedFoodIds.size} / {activeCategoryPots.length} หม้อ
                              </span>
                            ) : (
                              <span className="hidden sm:inline">กดค้างที่หม้อต้มเพื่อเลือกทีละหลายหม้อ</span>
                            )}
                          </div>
                        </div>

                        {/* Batch Controls Panel */}
                        {isBatchSelectMode && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gradient-to-br from-slate-900 via-zinc-950 to-black p-3.5 rounded-2xl border border-red-800/60 space-y-3 shadow-lg"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Range Input Tool (e.g. 1-5) */}
                              <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                                <input
                                  type="text"
                                  placeholder="เช่น 1-5 หรือ 26-30"
                                  value={batchRangeInput}
                                  onChange={(e) => setBatchRangeInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && batchRangeInput) {
                                      handleSelectRange(batchRangeInput, activeCategoryPots);
                                    }
                                  }}
                                  className="flex-1 bg-slate-950 border border-red-900/60 rounded-xl px-3 py-2 text-xs font-bold text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSelectRange(batchRangeInput, activeCategoryPots)}
                                  className="px-3 py-2 bg-red-950 text-red-300 hover:bg-red-800 hover:text-white rounded-xl text-xs font-black border border-red-800/80 transition-all cursor-pointer whitespace-nowrap"
                                >
                                  เลือกช่วง
                                </button>
                              </div>

                              {/* Quick Select Buttons */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const allIds = new Set(activeCategoryPots.map(f => f.id));
                                    setSelectedFoodIds(allIds);
                                    toast.success(`เลือกทั้งหมด ${allIds.size} หม้อแล้ว`);
                                  }}
                                  className="px-3 py-2 bg-slate-950 text-zinc-300 hover:text-white rounded-xl text-xs font-bold border border-red-900/40 cursor-pointer"
                                >
                                  เลือกทั้งหมด
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedFoodIds(new Set());
                                    toast.info('ล้างการเลือกแล้ว');
                                  }}
                                  className="px-3 py-2 bg-slate-950 text-zinc-400 hover:text-zinc-200 rounded-xl text-xs font-bold border border-red-900/40 cursor-pointer"
                                >
                                  ล้างที่เลือก
                                </button>
                              </div>
                            </div>

                            {/* Batch Delete Action Bar */}
                            {selectedFoodIds.size > 0 && (
                              <div className="pt-2 border-t border-red-900/40 flex items-center justify-between gap-3">
                                <div className="text-xs font-black text-white flex items-center gap-2">
                                  <span className="bg-red-950 text-red-300 px-2.5 py-1 rounded-xl border border-red-800/80">
                                    เลือก {selectedFoodIds.size} หม้อ
                                  </span>
                                  <span className="text-zinc-400">
                                    รวม <strong className="text-red-400">{selectedTotalPrice.toLocaleString()} ฿</strong>
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleBatchDeleteFoods(activeCategoryPots)}
                                  className="py-2 px-4 bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-red-950/80 hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer animate-pulse"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>ลบทั้งหมดที่เลือก ({selectedFoodIds.size} หม้อ)</span>
                                </button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Empty Search Result State */}
                  {(() => {
                    const activePots = foods.filter(f => {
                      if (activeTab === 'items') return !f.category || f.category === 'food';
                      return f.category === activeTab;
                    });
                    const q = foodSearchQuery.trim().toLowerCase();
                    const filteredPots = activePots.filter(f => {
                      if (!q) return true;
                      const nameMatch = f.name?.toLowerCase().includes(q);
                      const cookMatch = f.cook?.toLowerCase().includes(q);
                      const createdByMatch = f.createdBy?.toLowerCase().includes(q);
                      const eaterMatch = f.eaters?.some(e => e.name?.toLowerCase().includes(q));
                      return !!(nameMatch || cookMatch || createdByMatch || eaterMatch);
                    });

                    if (activePots.length > 0 && filteredPots.length === 0 && foodSearchQuery) {
                      return (
                        <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-red-900/40 space-y-3 my-2">
                          <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-800/80 flex items-center justify-center mx-auto text-red-400">
                            <Search className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-black text-white">ไม่พบรายการที่ตรงกับ "{foodSearchQuery}"</h4>
                            <p className="text-xs text-zinc-400 font-medium">
                              ลองค้นหาด้วยชื่อหม้อต้ม, ชื่อคนต้ม (👨‍🍳) หรือคนบันทึก (✍️)
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFoodSearchQuery('')}
                            className="px-4 py-2 bg-red-950 hover:bg-red-900 text-red-200 hover:text-white rounded-xl text-xs font-black border border-red-800 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>ล้างคำค้นหา (แสดงทั้งหมด {activePots.length} หม้อ)</span>
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {foods
                    .filter(f => {
                      if (activeTab === 'items') return !f.category || f.category === 'food';
                      return f.category === activeTab;
                    })
                    .filter(f => {
                      if (!foodSearchQuery.trim()) return true;
                      const q = foodSearchQuery.trim().toLowerCase();
                      const nameMatch = f.name?.toLowerCase().includes(q);
                      const cookMatch = f.cook?.toLowerCase().includes(q);
                      const createdByMatch = f.createdBy?.toLowerCase().includes(q);
                      const eaterMatch = f.eaters?.some(e => e.name?.toLowerCase().includes(q));
                      return !!(nameMatch || cookMatch || createdByMatch || eaterMatch);
                    })
                    .sort((a, b) => {
                      const numA = a.name.match(/\d+/);
                      const numB = b.name.match(/\d+/);
                      if (numA && numB) {
                        const valA = parseInt(numA[0], 10);
                        const valB = parseInt(numB[0], 10);
                        if (valA !== valB) return valA - valB;
                      }
                      const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
                      const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
                      return timeA - timeB;
                    })
                    .map((f, index) => {
                      const isSelected = selectedFoodIds.has(f.id);
                      return (
                        <motion.div 
                          key={f.id} 
                          layout
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onTouchStart={() => handleCardTouchStart(f.id)}
                          onTouchEnd={handleCardTouchEnd}
                          onTouchCancel={handleCardTouchEnd}
                          onMouseDown={() => handleCardTouchStart(f.id)}
                          onMouseUp={handleCardTouchEnd}
                          onMouseLeave={handleCardTouchEnd}
                          onClick={() => handleCardClick(f.id)}
                          className={cn(
                            "p-6 rounded-[2.5rem] shadow-xl flex justify-between items-center group/card transition-all text-white select-none relative",
                            isBatchSelectMode ? "cursor-pointer" : "",
                            isSelected
                              ? "bg-slate-900 border-2 border-red-500 shadow-red-950/80 ring-2 ring-red-500/40"
                              : "bg-slate-900 border border-red-900/40 hover:border-red-600/60 hover:shadow-red-950/40"
                          )}
                        >
                          {/* Selection Checkbox Indicator */}
                          {isBatchSelectMode && (
                            <div className="mr-3.5 shrink-0">
                              {isSelected ? (
                                <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-900/60">
                                  <Check className="w-5 h-5 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-xl bg-slate-950 border border-red-900/60 text-zinc-600 flex items-center justify-center hover:border-red-500">
                                  <Square className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex-1 pr-6">
                            <div className="flex items-center gap-3 mb-1">
                              <div className={cn(
                                "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors border border-red-900/60",
                                activeTab === 'items' ? "bg-red-950 text-red-400 group-hover/card:bg-red-600 group-hover/card:text-white" :
                                activeTab === 'water' ? "bg-sky-950 text-sky-400 group-hover/card:bg-sky-600 group-hover/card:text-white" :
                                activeTab === 'electricity' ? "bg-amber-950 text-amber-400 group-hover/card:bg-amber-600 group-hover/card:text-white" :
                                "bg-orange-950 text-orange-400 group-hover/card:bg-orange-600 group-hover/card:text-white"
                              )}>
                                 {activeTab === 'items' && <Utensils className="w-5 h-5" />}
                                 {activeTab === 'water' && <Droplets className="w-5 h-5" />}
                                 {activeTab === 'electricity' && <Zap className="w-5 h-5" />}
                                 {activeTab === 'gas' && <Flame className="w-5 h-5" />}
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="text-[18px] font-black text-white tracking-tight">
                                    {(() => {
                                      if (f.category === 'water') return `ค่าน้ำ - ${f.name} (${f.price.toLocaleString()} ฿)`;
                                      if (f.category === 'electricity') return `ค่าไฟ - ${f.name} (${f.price.toLocaleString()} ฿)`;
                                      if (f.category === 'gas') return `ค่าแก๊ส - ${f.name} (${f.price.toLocaleString()} ฿)`;
                                      
                                      const foodPots = foods.filter(item => !item.category || item.category === 'food');
                                      if (f.isFreeMedicine) {
                                        const freeIndex = foodPots.filter(item => item.isFreeMedicine).findIndex(item => item.id === f.id) + 1;
                                        const prefix = freeIndex > 0 ? `💊 ยาฟรี ขวดที่ ${freeIndex}: ` : '';
                                        return f.name.includes('ยาฟรี') || f.name.includes('หม้อ') ? f.name : `${prefix}${f.name}`;
                                      } else {
                                        const regIndex = foodPots.filter(item => !item.isFreeMedicine).findIndex(item => item.id === f.id) + 1;
                                        const prefix = regIndex > 0 ? `💊 ยาขวดที่ ${regIndex}: ` : '';
                                        return f.name.includes('ยาขวด') || f.name.includes('หม้อ') ? f.name : `${prefix}${f.name}`;
                                      }
                                    })()}
                                  </h4>
                                  <span className="text-[9px] font-black bg-slate-950 text-zinc-400 px-2 py-0.5 rounded-lg border border-red-900/40 whitespace-nowrap">
                                    {formatThaiDate(f.createdAt)}{f.createdBy ? ` ( ${f.createdBy} )` : ''}
                                  </span>
                                </div>
                                {(!f.category || f.category === 'food') && (
                                  <div className="flex items-center gap-2 mt-0.5 mb-1">
                                    {f.isFreeMedicine ? (
                                      <div className="text-[11px] font-black text-purple-300 flex items-center gap-1.5 bg-purple-950/80 px-2.5 py-0.5 rounded-lg border border-purple-800/80">
                                        <span>💊 หม้อยาฟรี:</span>
                                        <span className="text-white font-extrabold">{f.price.toLocaleString()} ฿</span>
                                      </div>
                                    ) : (
                                      <div className="text-[11px] font-black text-amber-400 flex items-center gap-1.5 bg-amber-950/40 px-2.5 py-0.5 rounded-lg border border-amber-900/40">
                                        <span>🍲 ต้มหม้อละ:</span>
                                        <span className="text-white font-extrabold">{f.price.toLocaleString()} ฿</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {(() => {
                                  const isFood = !f.category || f.category === 'food';
                                  const isShotItem = f.eaters.some(e => e.weight > 1);
                                  const totalShots = f.eaters.reduce((sum, e) => sum + e.weight, 0);
                                  const pricePerShot = totalShots > 0 ? (f.price / totalShots) : 0;

                                  if (isFood) {
                                    if (isShotItem) {
                                      return (
                                        <div className="space-y-1.5 mt-1">
                                          <div className="flex items-center gap-2 font-bold">
                                            <span className="text-[10px] font-black bg-red-950 text-red-200 px-2.5 py-1 rounded-xl border border-red-800/80 flex items-center gap-1">
                                              <span>🥃</span>
                                              <span>รวม {totalShots} ช็อต (ตกช็อตละ {pricePerShot.toFixed(2)} ฿)</span>
                                            </span>
                                          </div>
                                          <div className="text-[10px] text-zinc-300 font-bold flex flex-wrap gap-1 mt-1">
                                            {f.eaters.map(e => {
                                              const hasPaid = paidFoodIdsPerPerson[e.name]?.has(f.id);
                                              const shareVal = personSharePerFood[f.id]?.[e.name] || 0;
                                              return (
                                                <span key={e.name} className="bg-slate-950 border border-red-900/40 px-2 py-0.5 rounded-lg text-[10px] text-zinc-200">
                                                  {e.name}{hasPaid ? '✅' : ''}: <strong className="text-red-400">{e.weight} ช็อต</strong> ({shareVal} ฿)
                                                </span>
                                              );
                                            })}
                                          </div>
                                          {(f.cook || f.createdBy) && (
                                            <div className="flex flex-wrap gap-2 text-[10px] font-black items-center mt-1.5 pt-1 border-t border-red-900/20">
                                              {f.cook && (
                                                <div className="text-emerald-400 flex items-center gap-1">
                                                  <span>👨‍🍳 คนต้ม:</span>
                                                  <span className="bg-emerald-950 text-emerald-200 px-2 py-0.5 rounded-lg border border-emerald-800/80">{f.cook}</span>
                                                </div>
                                              )}
                                              {f.createdBy && (
                                                <div className="text-sky-400 flex items-center gap-1">
                                                  <span>✍️ คนเขียน:</span>
                                                  <span className="bg-sky-950 text-sky-200 px-2 py-0.5 rounded-lg border border-sky-800/80">{f.createdBy}</span>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    }
                                    return (
                                      <div className="space-y-1">
                                        <div className="flex gap-2 items-center font-bold">
                                          <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">
                                            {f.eaters.length} คน
                                          </span>
                                          <span className="w-1 h-1 bg-red-800 rounded-full" />
                                          <span className="text-[10px] text-zinc-300 font-bold italic line-clamp-1">
                                            {f.eaters.map(e => {
                                              const hasPaid = paidFoodIdsPerPerson[e.name]?.has(f.id);
                                              const weightStr = e.weight > 1 ? ` (${e.weight} ช็อต)` : e.weight === 0.5 ? '(ครึ่ง)' : '';
                                              return `${e.name}${hasPaid ? '✅' : ''}${weightStr}`;
                                            }).join(', ')}
                                          </span>
                                        </div>
                                        {(f.cook || f.createdBy) && (
                                          <div className="flex flex-wrap gap-2 text-[10px] font-black items-center mt-1.5 pt-1 border-t border-red-900/20">
                                            {f.cook && (
                                              <div className="text-emerald-400 flex items-center gap-1">
                                                <span>👨‍🍳 คนต้ม:</span>
                                                <span className="bg-emerald-950 text-emerald-200 px-2 py-0.5 rounded-lg border border-emerald-800/80">{f.cook}</span>
                                              </div>
                                            )}
                                            {f.createdBy && (
                                              <div className="text-sky-400 flex items-center gap-1">
                                                <span>✍️ คนเขียน:</span>
                                                <span className="bg-sky-950 text-sky-200 px-2 py-0.5 rounded-lg border border-sky-800/80">{f.createdBy}</span>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  } else {
                                    return (
                                      <div className="mt-2 space-y-1.5 border-t border-dashed border-red-900/40 pt-2">
                                        <span className="text-[9px] font-black text-red-400 uppercase tracking-widest block mb-1">
                                          คนหาร ({f.eaters.length} คน):
                                        </span>
                                        {f.eaters.map((e, index) => {
                                          const shareVal = personSharePerFood[f.id]?.[e.name] || 0;
                                          const hasPaid = paidFoodIdsPerPerson[e.name]?.has(f.id);
                                          return (
                                            <div key={e.name} className="text-[12px] font-bold text-zinc-200 flex items-center justify-between bg-slate-950 px-2.5 py-1 rounded-xl border border-red-900/30">
                                              <span className="flex items-center gap-1">
                                                {hasPaid && <span className="text-emerald-400 text-xs">✅</span>}
                                                <span>{index + 1} {e.name}</span>
                                              </span>
                                              <span className="text-amber-400 text-[11px] font-bold">ราคา {Math.ceil(shareVal).toLocaleString()} ฿</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    );
                                  }
                                })()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2 shrink-0">
                            <span className="text-2xl font-display font-black text-red-500 tracking-tighter">{Math.ceil(f.price).toLocaleString()} <small className="text-[12px] text-red-400">฿</small></span>
                            <div className="flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                               <button 
                                 onClick={() => {
                                   setLineShareText(generateSingleItemShareText(f));
                                   setIsLineSingleItemModalOpen(true);
                                 }} 
                                 className="w-10 h-10 rounded-2xl bg-emerald-950 text-emerald-400 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-md border border-emerald-800/80 cursor-pointer"
                                 title="แชร์ยอดและการจ่ายลง LINE"
                               >
                                 <Share2 className="w-4 h-4" />
                               </button>
                               <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover/card:opacity-100 transition-all scale-100 md:scale-90 md:group-hover/card:scale-100">
                                 <button onClick={() => handleEditFood(f)} className="w-10 h-10 rounded-2xl bg-slate-950 text-red-400 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-md border border-red-900/60 cursor-pointer">
                                   <PencilLine className="w-4 h-4" />
                                 </button>
                                 <button onClick={() => handleDeleteFood(f.id)} className="w-10 h-10 rounded-2xl bg-slate-950 text-zinc-400 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-md border border-red-900/60 cursor-pointer">
                                   <Trash2 className="w-4 h-4" />
                                 </button>
                               </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  
                  {foods.filter(f => {
                    if (activeTab === 'items') return !f.category || f.category === 'food';
                    return f.category === activeTab;
                  }).length === 0 && (
                    <div className="py-20 text-center bg-slate-900/50 rounded-[40px] border-2 border-dashed border-red-900/40">
                      <div className="w-16 h-16 bg-slate-950 border border-red-900/60 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                        {activeTab === 'items' && <Utensils className="w-8 h-8 text-red-500/60" />}
                        {activeTab === 'water' && <Droplets className="w-8 h-8 text-sky-500/60" />}
                        {activeTab === 'electricity' && <Zap className="w-8 h-8 text-amber-500/60" />}
                        {activeTab === 'gas' && <Flame className="w-8 h-8 text-orange-500/60" />}
                      </div>
                      <p className="text-zinc-400 text-sm font-black uppercase tracking-widest">
                        {activeTab === 'items' ? 'ยังไม่มีรายการค่าต้ม' : 
                         activeTab === 'water' ? 'ยังไม่มีรายการค่าน้ำ' : 
                         activeTab === 'electricity' ? 'ยังไม่มีรายการค่าไฟ' : 'ยังไม่มีรายการค่าแก๊ส'}
                      </p>
                    </div>
                  )}
                </div>
                
                {activeTab === 'items' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        setEditingFood(null);
                        setIsFreeMedicine(false);
                        const regularCount = foods.filter(f => (!f.category || f.category === 'food') && !f.isFreeMedicine).length;
                        setFoodName(`ยาขวดที่ ${regularCount + 1}`);
                        setFoodPrice('80');
                        setFoodCook('');
                        setFoodCreatedBy(currentUser || '');
                        setSelectedEaters({});
                        setIsFoodModalOpen(true);
                      }}
                      className="bg-gradient-to-r from-red-700 via-red-800 to-black text-white w-full py-4 px-4 rounded-[24px] font-black text-xs sm:text-sm tracking-wider shadow-xl shadow-red-950/80 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 border border-red-600/60 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-white" /> 
                      <span>เพิ่มหม้อใหม่ / ค่าต้มใหม่ (80฿)</span>
                    </button>

                    <button 
                      onClick={() => {
                        setEditingFood(null);
                        setIsFreeMedicine(true);
                        const freeCount = foods.filter(f => (!f.category || f.category === 'food') && f.isFreeMedicine).length;
                        setFoodName(`หม้อยาฟรีที่ ${freeCount + 1}`);
                        setFoodPrice('45');
                        setFoodCook('');
                        setFoodCreatedBy(currentUser || '');
                        setSelectedEaters({});
                        setIsFoodModalOpen(true);
                      }}
                      className="bg-gradient-to-r from-purple-800 via-purple-900 to-slate-950 text-white w-full py-4 px-4 rounded-[24px] font-black text-xs sm:text-sm tracking-wider shadow-xl shadow-purple-950/80 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 border border-purple-600/60 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-purple-300" /> 
                      <span>เพิ่มหม้อยาฟรี (45฿)</span>
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setEditingFood(null);
                      setFoodName('');
                      setFoodPrice('');
                      setFoodCook('');
                      setFoodCreatedBy(currentUser || '');
                      setSelectedEaters({});
                      setIsFoodModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-red-700 via-red-800 to-black text-white w-full py-5 rounded-[28px] font-black text-sm tracking-widest shadow-2xl shadow-red-950/90 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 hover:from-red-600 hover:to-red-900 border border-red-600/60 cursor-pointer"
                  >
                    <Plus className="w-5 h-5 text-white" /> 
                    {activeTab === 'water' ? 'เพิ่มรายการค่าน้ำ' : 
                     activeTab === 'electricity' ? 'เพิ่มรายการค่าไฟ' : 'เพิ่มรายการค่าแก๊ส'}
                  </button>
                )}
              </motion.div>
            )}

            {activeTab === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                {/* Summary Stats Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-red-950 via-black to-slate-950 p-8 rounded-[3rem] shadow-2xl shadow-black/80 relative overflow-hidden isolate border-2 border-red-800/80 text-white"
            >
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-40 h-40 bg-red-600/20 blur-3xl rounded-full" />
              <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-32 h-32 bg-amber-500/10 blur-2xl rounded-full" />
              
              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-red-300/80 uppercase tracking-[0.3em] block">ยอดหารรวมประวัติ</span>
                    <p className="text-5xl font-display font-black text-white leading-none tracking-tighter">{totalPotPrice.toLocaleString()} <small className="text-xl text-red-400">฿</small></p>
                  </div>
                  <div className="p-4 bg-red-900/40 rounded-3xl border border-red-700/50 backdrop-blur-md">
                     <CreditCard className="w-6 h-6 text-red-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-900/80 p-4 rounded-[2rem] border border-red-900/40 backdrop-blur-sm shadow-inner group">
                    <span className="text-[9px] font-black text-red-300/70 uppercase tracking-widest block mb-1 group-hover:text-red-200 transition-colors">ยอดรอจ่าย</span>
                    <p className="text-xl font-black text-amber-400 tracking-tight">{(totalPotPrice - totalPaidPrice).toLocaleString()} ฿</p>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-[2rem] border border-red-900/30 backdrop-blur-sm group">
                    <span className="text-[9px] font-black text-red-300/70 uppercase tracking-widest block mb-1 group-hover:text-red-200 transition-colors">สมาชิก</span>
                    <p className="text-xl font-black text-white tracking-tight">{people.length} คน</p>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-[2rem] border border-red-900/30 backdrop-blur-sm group">
                    <span className="text-[9px] font-black text-red-300/70 uppercase tracking-widest block mb-1 group-hover:text-red-200 transition-colors">จำนวนยาขวด</span>
                    <p className="text-xl font-black text-sky-300 tracking-tight">
                      {(() => {
                        const allPots = foods.filter(f => !f.category || f.category === 'food');
                        const freePots = allPots.filter(f => f.isFreeMedicine).length;
                        const regPots = allPots.filter(f => !f.isFreeMedicine).length;
                        if (freePots > 0) {
                          return `${allPots.length} ขวด (ต้ม ${regPots} / ฟรี ${freePots})`;
                        }
                        return `${allPots.length} ขวด`;
                      })()}
                    </p>
                  </div>
                  <div className="bg-slate-900/60 p-4 rounded-[2rem] border border-red-900/30 backdrop-blur-sm group">
                    <span className="text-[9px] font-black text-red-300/70 uppercase tracking-widest block mb-1 group-hover:text-red-200 transition-colors">ต้มหม้อละ (เฉลี่ย)</span>
                    <p className="text-xl font-black text-emerald-400 tracking-tight">
                      {(() => {
                        const pots = foods.filter(f => !f.category || f.category === 'food');
                        const total = pots.reduce((acc, p) => acc + (p.price || 0), 0);
                        return pots.length > 0 ? Math.ceil(total / pots.length).toLocaleString() : 0;
                      })()} ฿
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

                {/* Monthly Expense Trend Chart (Recharts) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/90 p-6 sm:p-8 rounded-[3rem] border border-red-900/40 shadow-xl space-y-6 text-white relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-950 border border-red-800 rounded-xl text-red-400">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">
                          แนวโน้มค่าใช้จ่ายรายเดือน (Monthly Expense Trend)
                        </h3>
                      </div>
                      <p className="text-xs text-zinc-400 font-medium">
                        แสดงภาพรวมยอดค่าใช้จ่ายย้อนหลังแต่ละเดือนผ่านกราฟ Recharts
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="bg-red-950/80 border border-red-800/60 px-3 py-1.5 rounded-2xl text-[11px] font-black text-red-300">
                        รวม {monthlyExpenseData.length} เดือน
                      </div>
                    </div>
                  </div>

                  {monthlyExpenseData.length > 0 ? (
                    <div className="h-64 sm:h-72 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyExpenseData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                          <XAxis 
                            dataKey="monthKey" 
                            stroke="#94a3b8" 
                            fontSize={11} 
                            tickLine={false} 
                            axisLine={{ stroke: '#475569' }}
                          />
                          <YAxis 
                            stroke="#94a3b8" 
                            fontSize={11} 
                            tickLine={false} 
                            axisLine={{ stroke: '#475569' }}
                            tickFormatter={(val) => `${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                          />
                          <Tooltip 
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-slate-950 border border-red-800/80 p-4 rounded-2xl shadow-2xl text-white space-y-1.5">
                                    <p className="text-xs font-black text-red-400">{label}</p>
                                    <p className="text-base font-black tracking-tight text-white">
                                      {Number(data.total).toLocaleString()} <span className="text-xs text-red-400">฿</span>
                                    </p>
                                    <p className="text-[10px] text-zinc-400 font-medium">
                                      จำนวนรายการหม้อ/ขวด: <span className="text-white font-bold">{data.count}</span> รายการ
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="total" 
                            stroke="#ef4444" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorTotal)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-zinc-500 text-xs font-medium">
                      ยังไม่มีข้อมูลประวัติค่าใช้จ่ายรายเดือน
                    </div>
                  )}
                </motion.div>

                {/* Category Expense Pie Chart (Recharts) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/90 p-6 sm:p-8 rounded-[3rem] border border-red-900/40 shadow-xl space-y-6 text-white relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-950 border border-red-800 rounded-xl text-red-400">
                          <PieChartIcon className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">
                          สัดส่วนค่าใช้จ่ายแยกหมวดหมู่ (Expense by Category)
                        </h3>
                      </div>
                      <p className="text-xs text-zinc-400 font-medium">
                        แสดงสัดส่วนยอดเงินรวมแยกตามหมวดหมู่ ต้ม, น้ำ, ไฟ, แก๊ส ผ่านกราฟวงกลม Recharts
                      </p>
                    </div>

                    {categoryExpenseData.dominant && (
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <div className="bg-gradient-to-r from-red-950/90 to-slate-900 border border-red-800/70 px-3.5 py-1.5 rounded-2xl text-[11px] font-black text-red-200 flex items-center gap-1.5 shadow-sm">
                          <span>{categoryExpenseData.dominant.icon}</span>
                          <span>จ่ายมากสุด: <strong className="text-white">{categoryExpenseData.dominant.shortName}</strong> ({categoryExpenseData.dominant.percent.toFixed(1)}%)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {categoryExpenseData.chartData.length > 0 ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                        {/* Recharts Pie Chart (Donut style) */}
                        <div className="lg:col-span-5 h-64 sm:h-72 w-full flex items-center justify-center relative">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Tooltip
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="bg-slate-950 border border-red-800/90 p-3.5 rounded-2xl shadow-2xl text-white space-y-1 z-50">
                                        <div className="flex items-center gap-2">
                                          <span className="text-base">{data.icon}</span>
                                          <p className="text-xs font-black text-white">{data.name}</p>
                                        </div>
                                        <p className="text-lg font-black tracking-tight text-red-400">
                                          {Number(data.value).toLocaleString()} <span className="text-xs text-zinc-400">฿</span>
                                        </p>
                                        <div className="flex items-center justify-between gap-4 text-[10px] text-zinc-400 font-medium pt-1 border-t border-slate-800">
                                          <span>สัดส่วน: <strong className="text-emerald-400">{data.percent.toFixed(1)}%</strong></span>
                                          <span>จำนวน: <strong className="text-white">{data.count}</strong> รายการ</span>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Pie
                                data={categoryExpenseData.chartData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={90}
                                paddingAngle={4}
                                stroke="#0f172a"
                                strokeWidth={2}
                              >
                                {categoryExpenseData.chartData.map((entry) => (
                                  <Cell 
                                    key={`cell-${entry.key}`} 
                                    fill={entry.color} 
                                    className="cursor-pointer transition-transform hover:opacity-90"
                                  />
                                ))}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>

                          {/* Center Info inside Donut */}
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">ยอดรวมทั้งหมด</span>
                            <span className="text-base sm:text-lg font-black text-white tracking-tight">
                              {categoryExpenseData.total.toLocaleString()} ฿
                            </span>
                          </div>
                        </div>

                        {/* Category Breakdown Details */}
                        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {categoryExpenseData.items.map(item => {
                            const isHighest = categoryExpenseData.dominant?.key === item.key && item.value > 0;
                            return (
                              <div
                                key={item.key}
                                className={cn(
                                  "p-3.5 rounded-2xl border transition-all relative overflow-hidden",
                                  item.value > 0 
                                    ? "bg-slate-950/60 border-slate-800/80 hover:border-red-900/50" 
                                    : "bg-slate-950/20 border-slate-900/40 opacity-40"
                                )}
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full shrink-0 shadow-xs" 
                                      style={{ backgroundColor: item.color }} 
                                    />
                                    <span className="text-xs font-black text-white">{item.icon} {item.name}</span>
                                  </div>
                                  {isHighest && (
                                    <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 tracking-wider shrink-0">
                                      สูงสุด 🔥
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-baseline justify-between mt-1">
                                  <span className="text-base font-black text-white tracking-tight">
                                    {item.value.toLocaleString()} <span className="text-[10px] text-zinc-400 font-normal">฿</span>
                                  </span>
                                  <span className="text-xs font-black" style={{ color: item.value > 0 ? item.color : '#94a3b8' }}>
                                    {item.percent.toFixed(1)}%
                                  </span>
                                </div>

                                {/* Mini Progress Bar */}
                                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                                  <div 
                                    className="h-full rounded-full transition-all duration-500" 
                                    style={{ 
                                      width: `${item.percent}%`,
                                      backgroundColor: item.color 
                                    }}
                                  />
                                </div>
                                <div className="flex justify-between items-center mt-1 text-[9px] text-zinc-500 font-medium">
                                  <span>{item.count} รายการ</span>
                                  <span>{item.shortName}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-zinc-500 text-xs font-medium">
                      ยังไม่มีข้อมูลค่าใช้จ่ายในระบบ
                    </div>
                  )}
                </motion.div>

                {/* Volunteer & Contribution Leaderboard */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/90 p-6 sm:p-8 rounded-[3rem] border border-amber-500/30 shadow-xl space-y-6 text-white relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-44 h-44 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
                  <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-40 h-40 bg-orange-500/10 blur-3xl rounded-full pointer-events-none" />

                  {/* Header & Tabs */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-amber-950/80 border border-amber-700/60 rounded-xl text-amber-400">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                          <span>🏆 ตารางอันดับจิตอาสาส่วนกลาง</span>
                          <span className="text-[10px] text-amber-400 font-bold bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded-full">Leaderboard</span>
                        </h3>
                      </div>
                      <p className="text-xs text-zinc-400 font-medium">
                        เชิดชูเกียรติสมาชิกคนต้ม (Food Cook) และคนช่วยเขียนรายการ (Food CreatedBy) บ่อยที่สุด
                      </p>
                    </div>

                    {/* Filter Switcher Tabs */}
                    <div className="flex items-center bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800/90 self-start sm:self-auto gap-1">
                      <button
                        type="button"
                        onClick={() => setLeaderboardTab('all')}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer",
                          leaderboardTab === 'all'
                            ? "bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md shadow-amber-950/50"
                            : "text-zinc-400 hover:text-white"
                        )}
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>🌟 รวม MVP</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLeaderboardTab('cook')}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer",
                          leaderboardTab === 'cook'
                            ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-950/50"
                            : "text-zinc-400 hover:text-white"
                        )}
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>👨‍🍳 คนต้ม ({leaderboardData.cooksList.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLeaderboardTab('writer')}
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer",
                          leaderboardTab === 'writer'
                            ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-950/50"
                            : "text-zinc-400 hover:text-white"
                        )}
                      >
                        <PencilLine className="w-3.5 h-3.5" />
                        <span>✍️ คนเขียน ({leaderboardData.writersList.length})</span>
                      </button>
                    </div>
                  </div>

                  {/* Leaderboard Content */}
                  <div className="relative z-10 space-y-6">
                    {/* TAB 1: MVP COMBINED */}
                    {leaderboardTab === 'all' && (
                      <div className="space-y-4">
                        {leaderboardData.combinedList.length > 0 ? (
                          <>
                            {/* Top MVP Highlights Podium */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {leaderboardData.combinedList.slice(0, 3).map((item, idx) => {
                                const personObj = people.find(p => p.name === item.name);
                                const rankColors = [
                                  { border: 'border-amber-400/80', bg: 'bg-gradient-to-b from-amber-950/80 via-slate-900 to-slate-950', badge: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950', medal: '🥇', label: 'อันดับ 1 (MVP ยอดเยี่ยม)' },
                                  { border: 'border-slate-300/80', bg: 'bg-gradient-to-b from-slate-800/80 via-slate-900 to-slate-950', badge: 'bg-slate-300 text-slate-950', medal: '🥈', label: 'อันดับ 2' },
                                  { border: 'border-amber-700/80', bg: 'bg-gradient-to-b from-amber-950/50 via-slate-900 to-slate-950', badge: 'bg-amber-700 text-amber-100', medal: '🥉', label: 'อันดับ 3' }
                                ][idx];

                                return (
                                  <div
                                    key={item.name}
                                    className={cn(
                                      "p-4 rounded-3xl border relative overflow-hidden flex flex-col items-center text-center shadow-lg transition-all hover:scale-[1.02]",
                                      rankColors.border,
                                      rankColors.bg
                                    )}
                                  >
                                    <div className="absolute top-3 left-3 text-lg font-black">{rankColors.medal}</div>
                                    <span className={cn("text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full mb-3 shadow-xs", rankColors.badge)}>
                                      {rankColors.label}
                                    </span>

                                    <div className="relative mb-2">
                                      <div className={cn(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center font-black text-lg border-2 overflow-hidden shadow-md bg-slate-950",
                                        idx === 0 ? "border-amber-400 ring-4 ring-amber-400/20" : "border-slate-700"
                                      )}>
                                        {personObj?.photoUrl ? (
                                          <img src={personObj.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                          item.name.charAt(0)
                                        )}
                                      </div>
                                      {idx === 0 && (
                                        <span className="absolute -top-2.5 -right-2.5 bg-amber-400 text-slate-950 p-1 rounded-full shadow-md">
                                          <Crown className="w-3.5 h-3.5" />
                                        </span>
                                      )}
                                    </div>

                                    <strong className="text-sm font-black text-white tracking-tight">{item.name}</strong>
                                    <span className="text-[10px] font-bold text-amber-400 mt-0.5">
                                      คะแนนจิตอาสา: <strong>{item.score}</strong> แต้ม
                                    </span>

                                    <div className="flex items-center justify-center gap-1.5 mt-2.5 w-full text-[10px] font-bold">
                                      <span className="px-2 py-0.5 rounded-lg bg-red-950/80 text-red-300 border border-red-800/60">
                                        👨‍🍳 ต้ม {item.cookCount}
                                      </span>
                                      <span className="px-2 py-0.5 rounded-lg bg-sky-950/80 text-sky-300 border border-sky-800/60">
                                        ✍️ เขียน {item.writerCount}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Full MVP Ranking Table */}
                            <div className="bg-slate-950/70 rounded-3xl border border-slate-800/80 overflow-hidden">
                              <div className="p-3.5 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-black text-zinc-400 uppercase tracking-wider">
                                <span>อันดับสมาชิก & ผลงาน</span>
                                <span>สถิติจิตอาสา (ต้ม + เขียน)</span>
                              </div>
                              <div className="divide-y divide-slate-800/60">
                                {leaderboardData.combinedList.map((item, idx) => {
                                  const personObj = people.find(p => p.name === item.name);
                                  const topScore = leaderboardData.combinedList[0]?.score || 1;
                                  const percentOfTop = Math.min(100, Math.round((item.score / topScore) * 100));

                                  return (
                                    <div key={item.name} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-900/40 transition-colors">
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-7 text-center shrink-0">
                                          {idx === 0 && <span className="text-base">🥇</span>}
                                          {idx === 1 && <span className="text-base">🥈</span>}
                                          {idx === 2 && <span className="text-base">🥉</span>}
                                          {idx > 2 && <span className="text-xs font-black text-zinc-500">#{idx + 1}</span>}
                                        </div>

                                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-xs shrink-0 overflow-hidden">
                                          {personObj?.photoUrl ? (
                                            <img src={personObj.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                                          ) : (
                                            item.name.charAt(0)
                                          )}
                                        </div>

                                        <div className="min-w-0">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="text-xs font-black text-white truncate">{item.name}</span>
                                            {idx === 0 && (
                                              <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase tracking-widest">
                                                MVP
                                              </span>
                                            )}
                                          </div>
                                          <div className="w-28 sm:w-40 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" style={{ width: `${percentOfTop}%` }} />
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex flex-col items-end gap-1 shrink-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className="px-2 py-0.5 rounded-lg bg-red-950/80 text-red-300 border border-red-800/50 text-[10px] font-bold">
                                            👨‍🍳 {item.cookCount} หม้อ
                                          </span>
                                          <span className="px-2 py-0.5 rounded-lg bg-sky-950/80 text-sky-300 border border-sky-800/50 text-[10px] font-bold">
                                            ✍️ {item.writerCount} ครั้ง
                                          </span>
                                        </div>
                                        <span className="text-[10px] font-black text-amber-400">
                                          รวม {item.totalActs} งาน ({item.score} คะแนน)
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="py-12 text-center text-zinc-500 text-xs font-medium bg-slate-950/40 rounded-3xl border border-slate-800">
                            ยังไม่มีข้อมูลการบันทึกคนต้มหรือคนเขียนรายการในระบบ
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 2: TOP COOKS */}
                    {leaderboardTab === 'cook' && (
                      <div className="space-y-4">
                        {leaderboardData.cooksList.length > 0 ? (
                          <>
                            {/* Top Cooks Podium */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {leaderboardData.cooksList.slice(0, 3).map((item, idx) => {
                                const personObj = people.find(p => p.name === item.name);
                                const rankColors = [
                                  { border: 'border-red-500/80', bg: 'bg-gradient-to-b from-red-950/80 via-slate-900 to-slate-950', badge: 'bg-gradient-to-r from-red-500 to-rose-500 text-white', medal: '🥇', label: 'เชฟอันดับ 1 (Top Chef)' },
                                  { border: 'border-orange-400/80', bg: 'bg-gradient-to-b from-orange-950/60 via-slate-900 to-slate-950', badge: 'bg-orange-400 text-slate-950', medal: '🥈', label: 'เชฟอันดับ 2' },
                                  { border: 'border-amber-600/80', bg: 'bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950', badge: 'bg-amber-600 text-white', medal: '🥉', label: 'เชฟอันดับ 3' }
                                ][idx];

                                const percentOfTotal = leaderboardData.totalPots > 0 
                                  ? ((item.totalPots / leaderboardData.totalPots) * 100).toFixed(1)
                                  : '0';

                                return (
                                  <div
                                    key={item.name}
                                    className={cn(
                                      "p-4 rounded-3xl border relative overflow-hidden flex flex-col items-center text-center shadow-lg transition-all hover:scale-[1.02]",
                                      rankColors.border,
                                      rankColors.bg
                                    )}
                                  >
                                    <div className="absolute top-3 left-3 text-lg font-black">{rankColors.medal}</div>
                                    <span className={cn("text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full mb-3 shadow-xs", rankColors.badge)}>
                                      {rankColors.label}
                                    </span>

                                    <div className="relative mb-2">
                                      <div className={cn(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center font-black text-lg border-2 overflow-hidden shadow-md bg-slate-950",
                                        idx === 0 ? "border-red-500 ring-4 ring-red-500/20" : "border-slate-700"
                                      )}>
                                        {personObj?.photoUrl ? (
                                          <img src={personObj.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                          item.name.charAt(0)
                                        )}
                                      </div>
                                      <span className="absolute -bottom-1 -right-1 bg-red-600 text-white p-1 rounded-full shadow-md text-xs">
                                        👨‍🍳
                                      </span>
                                    </div>

                                    <strong className="text-sm font-black text-white tracking-tight">{item.name}</strong>
                                    <div className="mt-1 text-center">
                                      <span className="text-lg font-black text-red-400">
                                        {item.totalPots} <small className="text-xs text-zinc-400">หม้อ</small>
                                      </span>
                                      <span className="text-[10px] text-zinc-400 block font-bold">
                                        (สัดส่วน {percentOfTotal}% ของทั้งหมด)
                                      </span>
                                    </div>

                                    <div className="mt-2 pt-2 border-t border-slate-800/80 w-full flex items-center justify-between text-[10px] font-medium text-zinc-400">
                                      <span>หม้อปกติ: <strong className="text-white">{item.regularPots}</strong></span>
                                      <span>หม้อยาฟรี: <strong className="text-emerald-400">{item.freePots}</strong></span>
                                    </div>
                                    <div className="text-[9px] font-bold text-amber-400 mt-1">
                                      มูลค่าที่ต้ม: {item.totalCost.toLocaleString()} ฿
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Full Cook Ranking Table */}
                            <div className="bg-slate-950/70 rounded-3xl border border-slate-800/80 overflow-hidden">
                              <div className="p-3.5 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-black text-zinc-400 uppercase tracking-wider">
                                <span>อันดับคนต้ม</span>
                                <span>จำนวนหม้อ & รายละเอียด</span>
                              </div>
                              <div className="divide-y divide-slate-800/60">
                                {leaderboardData.cooksList.map((item, idx) => {
                                  const personObj = people.find(p => p.name === item.name);
                                  const maxPots = leaderboardData.cooksList[0]?.totalPots || 1;
                                  const percentOfMax = Math.min(100, Math.round((item.totalPots / maxPots) * 100));

                                  return (
                                    <div key={item.name} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-900/40 transition-colors">
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-7 text-center shrink-0">
                                          {idx === 0 && <span className="text-base">🥇</span>}
                                          {idx === 1 && <span className="text-base">🥈</span>}
                                          {idx === 2 && <span className="text-base">🥉</span>}
                                          {idx > 2 && <span className="text-xs font-black text-zinc-500">#{idx + 1}</span>}
                                        </div>

                                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-xs shrink-0 overflow-hidden">
                                          {personObj?.photoUrl ? (
                                            <img src={personObj.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                                          ) : (
                                            item.name.charAt(0)
                                          )}
                                        </div>

                                        <div className="min-w-0">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-black text-white truncate">{item.name}</span>
                                            {idx === 0 && (
                                              <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-red-600 text-white uppercase tracking-widest">
                                                Top Chef
                                              </span>
                                            )}
                                          </div>
                                          <div className="w-28 sm:w-40 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-red-600 to-orange-500 rounded-full" style={{ width: `${percentOfMax}%` }} />
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                                        <span className="text-xs font-black text-red-400">
                                          👨‍🍳 {item.totalPots} หม้อ
                                        </span>
                                        <span className="text-[10px] text-zinc-400 font-bold">
                                          (ต้ม {item.regularPots} / ฟรี {item.freePots}) • {item.totalCost.toLocaleString()} ฿
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="py-12 text-center text-zinc-500 text-xs font-medium bg-slate-950/40 rounded-3xl border border-slate-800">
                            ยังไม่มีข้อมูลการระบุคนต้ม (Food Cook) ในรายการต้มยา
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 3: TOP WRITERS */}
                    {leaderboardTab === 'writer' && (
                      <div className="space-y-4">
                        {leaderboardData.writersList.length > 0 ? (
                          <>
                            {/* Top Writers Podium */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {leaderboardData.writersList.slice(0, 3).map((item, idx) => {
                                const personObj = people.find(p => p.name === item.name);
                                const rankColors = [
                                  { border: 'border-sky-400/80', bg: 'bg-gradient-to-b from-sky-950/80 via-slate-900 to-slate-950', badge: 'bg-gradient-to-r from-sky-500 to-blue-500 text-white', medal: '🥇', label: 'เลขาฯ อันดับ 1 (Top Writer)' },
                                  { border: 'border-indigo-400/80', bg: 'bg-gradient-to-b from-indigo-950/60 via-slate-900 to-slate-950', badge: 'bg-indigo-400 text-white', medal: '🥈', label: 'เลขาฯ อันดับ 2' },
                                  { border: 'border-cyan-600/80', bg: 'bg-gradient-to-b from-cyan-950/40 via-slate-900 to-slate-950', badge: 'bg-cyan-600 text-white', medal: '🥉', label: 'เลขาฯ อันดับ 3' }
                                ][idx];

                                const percentOfTotal = leaderboardData.totalPots > 0 
                                  ? ((item.totalPots / leaderboardData.totalPots) * 100).toFixed(1)
                                  : '0';

                                return (
                                  <div
                                    key={item.name}
                                    className={cn(
                                      "p-4 rounded-3xl border relative overflow-hidden flex flex-col items-center text-center shadow-lg transition-all hover:scale-[1.02]",
                                      rankColors.border,
                                      rankColors.bg
                                    )}
                                  >
                                    <div className="absolute top-3 left-3 text-lg font-black">{rankColors.medal}</div>
                                    <span className={cn("text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full mb-3 shadow-xs", rankColors.badge)}>
                                      {rankColors.label}
                                    </span>

                                    <div className="relative mb-2">
                                      <div className={cn(
                                        "w-16 h-16 rounded-2xl flex items-center justify-center font-black text-lg border-2 overflow-hidden shadow-md bg-slate-950",
                                        idx === 0 ? "border-sky-400 ring-4 ring-sky-400/20" : "border-slate-700"
                                      )}>
                                        {personObj?.photoUrl ? (
                                          <img src={personObj.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                          item.name.charAt(0)
                                        )}
                                      </div>
                                      <span className="absolute -bottom-1 -right-1 bg-sky-600 text-white p-1 rounded-full shadow-md text-xs">
                                        ✍️
                                      </span>
                                    </div>

                                    <strong className="text-sm font-black text-white tracking-tight">{item.name}</strong>
                                    <div className="mt-1 text-center">
                                      <span className="text-lg font-black text-sky-400">
                                        {item.totalPots} <small className="text-xs text-zinc-400">หม้อ</small>
                                      </span>
                                      <span className="text-[10px] text-zinc-400 block font-bold">
                                        (เขียน {percentOfTotal}% ของทั้งหมด)
                                      </span>
                                    </div>

                                    <div className="mt-2 pt-2 border-t border-slate-800/80 w-full flex items-center justify-between text-[10px] font-medium text-zinc-400">
                                      <span>หม้อปกติ: <strong className="text-white">{item.regularPots}</strong></span>
                                      <span>หม้อยาฟรี: <strong className="text-emerald-400">{item.freePots}</strong></span>
                                    </div>
                                    <div className="text-[9px] font-bold text-sky-300 mt-1">
                                      ยอดที่บันทึก: {item.totalCost.toLocaleString()} ฿
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Full Writer Ranking Table */}
                            <div className="bg-slate-950/70 rounded-3xl border border-slate-800/80 overflow-hidden">
                              <div className="p-3.5 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-black text-zinc-400 uppercase tracking-wider">
                                <span>อันดับคนเขียนรายการ</span>
                                <span>จำนวนรายการ & รายละเอียด</span>
                              </div>
                              <div className="divide-y divide-slate-800/60">
                                {leaderboardData.writersList.map((item, idx) => {
                                  const personObj = people.find(p => p.name === item.name);
                                  const maxPots = leaderboardData.writersList[0]?.totalPots || 1;
                                  const percentOfMax = Math.min(100, Math.round((item.totalPots / maxPots) * 100));

                                  return (
                                    <div key={item.name} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-900/40 transition-colors">
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-7 text-center shrink-0">
                                          {idx === 0 && <span className="text-base">🥇</span>}
                                          {idx === 1 && <span className="text-base">🥈</span>}
                                          {idx === 2 && <span className="text-base">🥉</span>}
                                          {idx > 2 && <span className="text-xs font-black text-zinc-500">#{idx + 1}</span>}
                                        </div>

                                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-xs shrink-0 overflow-hidden">
                                          {personObj?.photoUrl ? (
                                            <img src={personObj.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                                          ) : (
                                            item.name.charAt(0)
                                          )}
                                        </div>

                                        <div className="min-w-0">
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-black text-white truncate">{item.name}</span>
                                            {idx === 0 && (
                                              <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-sky-600 text-white uppercase tracking-widest">
                                                Top Writer
                                              </span>
                                            )}
                                          </div>
                                          <div className="w-28 sm:w-40 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-sky-500 to-blue-500 rounded-full" style={{ width: `${percentOfMax}%` }} />
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                                        <span className="text-xs font-black text-sky-400">
                                          ✍️ {item.totalPots} รายการ
                                        </span>
                                        <span className="text-[10px] text-zinc-400 font-bold">
                                          (ต้ม {item.regularPots} / ฟรี {item.freePots}) • {item.totalCost.toLocaleString()} ฿
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="py-12 text-center text-zinc-500 text-xs font-medium bg-slate-950/40 rounded-3xl border border-slate-800">
                            ยังไม่มีข้อมูลการระบุคนเขียน (Food CreatedBy) ในรายการต้มยา
                          </div>
                        )}
                      </div>
                    )}

                    {/* Community Motivation Banner */}
                    <div className="p-3.5 bg-amber-950/40 border border-amber-800/40 rounded-2xl flex items-center justify-between text-xs text-amber-200">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-[11px] font-bold">
                          ยิ่งช่วยต้ม (Food Cook) และช่วยเขียนรายการ (Food CreatedBy) ยิ่งได้รับแต้มจิตอาสาและสร้างรอยยิ้มให้เพื่อนๆ ในกลุ่ม! ✨
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Bank Card with PromptPay QR Button */}
                <div className="relative group">
                  <motion.div 
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="w-full text-left bg-slate-900/90 p-8 rounded-[3rem] border border-red-900/50 shadow-xl shadow-black/40 relative overflow-hidden transition-all text-white"
                  >
                     <div className="relative z-10 flex flex-col gap-5">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-950 border border-red-800 rounded-2xl flex items-center justify-center">
                              <CreditCard className="w-5 h-5 text-red-400" />
                            </div>
                            <span className="text-[10px] font-black text-red-400 uppercase tracking-[0.2em]">ช่องทางรับเงิน / พร้อมเพย์</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setBankModalTab('theme');
                                setIsBankModalOpen(true);
                              }}
                              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-900/60 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                              title="ปรับแต่งสีธีมหลัก (ดำ, แดง, ขาว, เหลือง)"
                            >
                              <Palette className="w-3.5 h-3.5 text-amber-400" />
                              <span>{themeObj.emoji} สีธีม</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setBankModalTab('qr');
                                setIsBankModalOpen(true);
                              }}
                              className="px-3.5 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-sky-950/50 active:scale-95 transition-all cursor-pointer"
                              title="สร้าง QR Code พร้อมเพย์"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>สร้าง QR</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyBankInfo();
                              }}
                              className="p-2 bg-slate-800 hover:bg-slate-700 text-zinc-300 rounded-xl text-xs font-bold border border-slate-700 transition-all cursor-pointer"
                              title="คัดลอกเลขบัญชี"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                       </div>
                       <div 
                         onClick={() => {
                           setBankModalTab('qr');
                           setIsBankModalOpen(true);
                         }}
                         className="cursor-pointer"
                       >
                         <div className="text-3xl font-display font-black text-white tracking-tighter mb-1 select-all">
                           {bankInfo.no ? bankInfo.no : 'ยังไม่ตั้งค่า'}
                         </div>
                         <div className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                           <span className="text-red-400 font-black">{bankInfo.name || 'BANK'}</span>
                           <span className="w-1 h-1 bg-red-800 rounded-full" />
                           <span>{bankInfo.user || 'ACCOUNT HOLDER'}</span>
                         </div>
                       </div>
                     </div>
                     <div className="absolute right-0 top-0 translate-x-1/3 -translate-y-1/3 w-40 h-40 bg-red-600/10 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity pointer-events-none" />
                     <div className="absolute right-10 top-1/2 -translate-y-1/2 text-red-950/80 text-8xl group-hover:scale-125 group-hover:rotate-12 transition-transform opacity-40 font-serif pointer-events-none italic">฿</div>
                  </motion.div>
                </div>

                <div className="space-y-4">
                  {/* Member Avatars Overview with Unpaid Badges */}
                  <div className="bg-slate-900/90 p-5 rounded-[2.5rem] border border-red-900/40 shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-red-400" />
                        <h3 className="text-xs font-black text-zinc-300 uppercase tracking-widest">
                          ภาพรวมสถานะรูปโปรไฟล์สมาชิก
                        </h3>
                      </div>
                      <span className="text-[10px] font-black text-red-400 bg-red-950/80 border border-red-800/60 px-2.5 py-1 rounded-full">
                        ค้างชำระ {people.filter(p => (debts[p.name] || 0) > 0).length} / {people.length} คน
                      </span>
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
                      {people
                        .sort((a, b) => {
                          const debtA = debts[a.name] || 0;
                          const debtB = debts[b.name] || 0;
                          if (debtB !== debtA) return debtB - debtA;
                          return (a.order || 99) - (b.order || 99);
                        })
                        .map(p => {
                          const amountOwed = debts[p.name] || 0;
                          const hasDebt = amountOwed > 0;

                          return (
                            <div key={p.id} className="flex flex-col items-center gap-1.5 shrink-0 relative group py-1">
                              <div className="relative">
                                <div className={cn(
                                  "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm border-2 shadow-lg overflow-hidden bg-slate-950 transition-all group-hover:scale-105",
                                  hasDebt 
                                    ? "border-red-600 shadow-red-950/80 text-red-400" 
                                    : "border-emerald-500/80 shadow-emerald-950/40 text-emerald-400"
                                )}>
                                  {p.photoUrl ? (
                                    <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                                  ) : (
                                    p.name.charAt(0)
                                  )}
                                </div>

                                {/* Corner Debt Badge */}
                                {hasDebt ? (
                                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 to-rose-700 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-red-300 shadow-md shadow-red-950/80 animate-pulse whitespace-nowrap z-10 flex items-center gap-0.5">
                                    {Math.ceil(amountOwed).toLocaleString()}฿
                                  </span>
                                ) : (
                                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[8px] font-black w-4 h-4 rounded-full border border-emerald-300 shadow-sm flex items-center justify-center z-10">
                                    ✓
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-black text-zinc-300 max-w-[56px] truncate text-center">
                                {p.name}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-2 pt-2">
                     <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                       รายชื่อคนที่ยังไม่จ่าย
                     </h3>
                     <div className="flex items-center gap-2">
                       {people.filter(p => debts[p.name] > 0).length > 0 && (
                         <button
                           onClick={() => {
                             const potCosts = foods.filter(f => !f.category || f.category === 'food');
                             let autoRange = "26-50";
                             if (potCosts.length > 0) {
                               const namesWithNum = potCosts.map(f => {
                                 const m = f.name.match(/\d+/);
                                 return m ? parseInt(m[0]) : null;
                               }).filter((v): v is number => v !== null);
                               if (namesWithNum.length > 0) {
                                 const minStr = Math.min(...namesWithNum);
                                 const maxStr = Math.max(...namesWithNum);
                                 autoRange = `${minStr}-${maxStr}`;
                               }
                             }
                             setLineRangeInput(autoRange);
                             setIsLineUnpaidModalOpen(true);
                           }}
                           className="flex items-center gap-1.5 px-3 py-2 bg-red-950/80 border border-red-800/80 hover:bg-red-900 text-red-200 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                         >
                           <MessageSquare className="w-3 h-3 text-red-400" />
                           แชร์ยอดค้างส่ง LINE
                         </button>
                       )}
                       <span className="text-[10px] font-black text-red-300 bg-red-950 border border-red-900/60 px-2 py-1 rounded-lg">
                         {people.filter(p => debts[p.name] > 0).length} คน
                       </span>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {people
                      .filter(p => debts[p.name] > 0)
                      .sort((a, b) => {
                        const debtA = debts[a.name] || 0;
                        const debtB = debts[b.name] || 0;
                        if (debtB !== debtA) return debtB - debtA;
                        return (a.order || 99) - (b.order || 99);
                      })
                      .map((p) => {
                         const amountOwed = debts[p.name];
                         const credit = p.credit || 0;
                         const shares = personSharePerCategory[p.name] || { food: 0, water: 0, electricity: 0, gas: 0, other: 0 };
                         return (
                           <div key={p.id} className="bg-slate-900 p-6 rounded-[32px] border border-red-900/40 shadow-lg flex justify-between items-center group transition-all hover:border-red-600/50 text-white">
                             <div className="flex items-center gap-4">
                                <div className="relative shrink-0">
                                  <div className="w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center text-red-400 font-black text-sm border-2 border-red-800/80 overflow-hidden shadow-lg">
                                    {p.photoUrl ? (
                                      <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                                    ) : (
                                      p.name.charAt(0)
                                    )}
                                  </div>
                                  {/* Corner Debt Badge on Profile Picture */}
                                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-600 via-red-700 to-rose-700 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border border-red-300 shadow-lg shadow-red-950/80 animate-pulse whitespace-nowrap z-10 flex items-center gap-0.5">
                                    {Math.ceil(amountOwed).toLocaleString()}฿
                                  </span>
                                </div>
                                <div>
                                  <strong className="text-[16px] font-black text-white tracking-tight">{p.name}</strong>
                                  <div className="flex flex-col mt-0.5">
                                    <p className="text-[11px] font-black text-amber-400 uppercase tracking-widest leading-none">ค้างจ่าย: {Math.ceil(amountOwed).toLocaleString()} ฿</p>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                      {shares.food > 0 && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-950/80 text-red-300 border border-red-800/60 text-[10px] font-black rounded-lg">
                                          🥘 ค่าต้ม: {Math.ceil(shares.food).toLocaleString()} ฿
                                        </span>
                                      )}
                                      {shares.water > 0 && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-950/80 text-sky-300 border border-sky-800/60 text-[10px] font-black rounded-lg">
                                          💧 ค่าน้ำ: {Math.ceil(shares.water).toLocaleString()} ฿
                                        </span>
                                      )}
                                      {shares.electricity > 0 && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-950/80 text-amber-300 border border-amber-800/60 text-[10px] font-black rounded-lg">
                                          ⚡ ค่าไฟ: {Math.ceil(shares.electricity).toLocaleString()} ฿
                                        </span>
                                      )}
                                      {shares.gas > 0 && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-950/80 text-orange-300 border border-orange-800/60 text-[10px] font-black rounded-lg">
                                          🔥 ค่าแก๊ส: {Math.ceil(shares.gas).toLocaleString()} ฿
                                        </span>
                                      )}
                                    </div>
                                    {credit > 0 && (
                                      <div className="flex items-center gap-1 mt-0.5">
                                        <span className="text-[9px] font-bold text-emerald-400 uppercase">(หักเครดิตค่าต้มแล้ว)</span>
                                        <div className="group/hint relative">
                                          <div className="w-2.5 h-2.5 rounded-full bg-slate-800 flex items-center justify-center text-[7px] font-black text-zinc-400 cursor-help">i</div>
                                          <div className="absolute left-0 bottom-full mb-2 w-32 p-2 bg-slate-950 text-[8px] text-white rounded-lg opacity-0 group-hover/hint:opacity-100 transition-opacity pointer-events-none z-50 border border-red-900/40 shadow-xl">
                                            เครดิตใช้หักได้เฉพาะรายการค่าต้ม/อาหารเท่านั้น ไม่สามารถหักค่าน้ำ ค่าไฟ หรือค่าแก๊สได้
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-2">
                               {isAdminUser && (
                                 <button
                                   onClick={() => handleDirectApprovePerson(p.name)}
                                   className="bg-emerald-600 text-white px-3.5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider shadow-md hover:bg-emerald-500 transition-all active:scale-95 cursor-pointer"
                                   title="อนุมัติจ่ายแล้วทันทีโดยไม่ต้องแนบสลิป"
                                 >
                                   อนุญาตจ่าย ⚡
                                 </button>
                               )}
                               <button
                                 type="button"
                                 onClick={() => {
                                   handleSelectQrMember(p.name);
                                   setBankModalTab('qr');
                                   setIsBankModalOpen(true);
                                 }}
                                 className="p-3 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-900/40 rounded-2xl text-[11px] font-black uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                                 title={`สร้าง PromptPay QR Code สำหรับ ${p.name}`}
                               >
                                 <QrCode className="w-4 h-4" />
                                 <span className="hidden sm:inline">QR</span>
                               </button>
                               <button 
                                 onClick={() => {
                                   const personPots = foods
                                     .filter(f => f.eaters.some(e => e.name === p.name))
                                     .map(f => f.id);
                                   
                                   setSelectedPotsRaw(prev => ({ ...prev, [p.name]: personPots }));
                                   setTargetPayment({ 
                                     name: p.name, 
                                     amount: amountOwed, 
                                     payerAmount: Math.ceil(amountOwed).toString(),
                                     foodId: personPots.join(',')
                                   });
                                   setIsPayModalOpen(true);
                                 }}
                                 className="bg-gradient-to-r from-red-600 to-red-800 text-white px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-red-950/50 hover:from-red-500 hover:to-red-700 transition-all active:scale-95 cursor-pointer"
                               >
                                 แจ้งโอน
                               </button>
                             </div>
                           </div>
                        );
                      })}
                  </div>
                </div>
                
                {isAdminUser && (
                  <center>
                    <button 
                      onClick={resetAll}
                      className="text-[12px] font-bold text-slate-300 mt-8 hover:text-sky-500 transition-colors"
                    >
                      ล้างข้อมูลทั้งหมด
                    </button>
                  </center>
                )}

                {/* Payment History Section */}
                {payments.length > 0 && (
                   <div className="space-y-4" ref={historyRef}>
                    <div className="flex flex-col gap-4 bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm mt-4">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                           <History className="w-4 h-4 text-sky-500" />
                          <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">ประวัติการจ่ายเงิน</h3>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] font-black text-white bg-slate-950 px-2.5 py-1 rounded-full border border-slate-900 uppercase tracking-widest leading-none">
                             รวม: {filteredTotal.toLocaleString()} ฿
                           </span>
                           <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                             {filteredPayments.length} รายการ
                           </span>
                        </div>
                      </div>

                      {/* Filter Controls */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                           <div className="absolute left-4 top-1/2 -translate-y-1/2">
                             <Filter className="w-3 h-3 text-slate-400" />
                           </div>
                           <select 
                             value={historyFilterPerson}
                             onChange={(e) => setHistoryFilterPerson(e.target.value)}
                             className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/10 appearance-none"
                           >
                             <option value="all">ทุกคน</option>
                             {people.map(p => (
                               <option key={p.id} value={p.name}>{p.name}</option>
                             ))}
                           </select>
                        </div>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <div className="absolute left-2 top-1.5">
                               <Calendar className="w-2.5 h-2.5 text-slate-300" />
                            </div>
                            <input 
                              type="date"
                              value={historyFilterStartDate}
                              onChange={(e) => setHistoryFilterStartDate(e.target.value)}
                              className="w-full px-2 pl-6 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/10"
                            />
                            <span className="absolute -top-3 left-1 text-[8px] font-black text-slate-400 uppercase tracking-tighter">เริ่ม</span>
                          </div>
                          <div className="relative flex-1">
                             <div className="absolute left-2 top-1.5">
                               <Calendar className="w-2.5 h-2.5 text-slate-300" />
                            </div>
                            <input 
                              type="date"
                              value={historyFilterEndDate}
                              onChange={(e) => setHistoryFilterEndDate(e.target.value)}
                              className="w-full px-2 pl-6 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500/10"
                            />
                            <span className="absolute -top-3 left-1 text-[8px] font-black text-slate-400 uppercase tracking-tighter">สิ้นสุด</span>
                          </div>
                        </div>
                      </div>
                      
                      {(historyFilterPerson !== 'all' || historyFilterStartDate || historyFilterEndDate) && (
                        <button 
                          onClick={() => {
                            setHistoryFilterPerson('all');
                            setHistoryFilterStartDate('');
                            setHistoryFilterEndDate('');
                          }}
                          className="text-[10px] font-bold text-sky-600 hover:text-sky-700 underline text-right px-2"
                        >
                          ล้างตัวกรอง
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {/* Grand Total Summary Card */}
                      {filteredPayments.length > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-indigo-600 p-6 rounded-[32px] shadow-xl shadow-indigo-100 relative overflow-hidden isolate border border-indigo-500"
                        >
                           <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-32 h-32 bg-white/10 blur-2xl rounded-full" />
                           <div className="relative z-10 flex flex-col gap-1 items-center justify-center text-white">
                              <span className="text-[9px] font-black text-white/50 uppercase tracking-[0.3em]">ยอดเงินที่เข้าแล้ว (รวม)</span>
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-display font-black text-white">{filteredTotal.toLocaleString()}</span>
                                <span className="text-sm font-bold text-white/50">฿</span>
                              </div>
                           </div>
                        </motion.div>
                      )}

                      {filteredPayments.length === 0 ? (
                        <div className="p-12 text-center bg-stone-50/50 rounded-3xl border-2 border-dashed border-stone-100">
                          <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest italic">ไม่พบข้อมูลประวัติ</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {filteredPayments.slice(0, 50).map((pay, index) => {
                            const slipToShow = localSlipPreviews[pay.id] || pay.slipUrl;
                            const isHighlighted = pay.id === highlightPaymentId;
                            return (
                              <motion.div 
                                key={pay.id} 
                                initial={isHighlighted ? { scale: 0.88, y: -20, opacity: 0 } : { opacity: 0, x: -10 }}
                                animate={{ scale: 1, y: 0, opacity: 1, x: 0 }}
                                transition={{ type: "spring", stiffness: 350, damping: 22, delay: isHighlighted ? 0 : index * 0.04 }}
                                className={cn(
                                  "p-5 rounded-[30px] flex justify-between items-center group transition-all relative overflow-hidden",
                                  isHighlighted 
                                    ? "bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-500 shadow-xl shadow-emerald-500/20 ring-4 ring-emerald-500/20" 
                                    : "bg-white border border-stone-100 shadow-sm hover:shadow-md"
                                )}
                              >
                                 <div className="flex items-center gap-4">
                                    <div 
                                       onClick={() => slipToShow && setViewingSlip(slipToShow)}
                                       className={cn(
                                         "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all overflow-visible relative shrink-0",
                                         slipToShow ? "cursor-pointer hover:ring-2 hover:ring-indigo-400 hover:scale-105" : "",
                                         "bg-indigo-50 text-indigo-400 border-indigo-100/50 group-hover:bg-indigo-600 group-hover:text-white"
                                       )}
                                       title={slipToShow ? "คลิกเพื่อดูสลิปภาพใหญ่" : undefined}
                                    >
                                       <div className="w-full h-full rounded-2xl overflow-hidden flex items-center justify-center relative">
                                         {slipToShow ? (
                                           <img src={slipToShow} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="Slip" />
                                         ) : (
                                           <History className="w-5 h-5" />
                                         )}
                                         {localSlipPreviews[pay.id] && !pay.slipUrl && (
                                           <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                             <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                           </div>
                                         )}
                                       </div>

                                       {/* Status Indicator Badge on Corner of Slip Image */}
                                       {pay.status === 'pending' && (
                                         <span 
                                           title="สถานะ: ⏳ รออนุมัติ" 
                                           className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md shadow-amber-950/20 z-10 animate-pulse"
                                         >
                                           <Clock className="w-2.5 h-2.5 stroke-[3]" />
                                         </span>
                                       )}
                                       {pay.status === 'rejected' && (
                                         <span 
                                           title="สถานะ: ❌ ปฏิเสธแล้ว" 
                                           className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md shadow-rose-950/20 z-10"
                                         >
                                           <X className="w-2.5 h-2.5 stroke-[3]" />
                                         </span>
                                       )}
                                       {(pay.status === 'approved' || !pay.status) && (
                                         <span 
                                           title="สถานะ: ✅ อนุมัติแล้ว (สำเร็จ)" 
                                           className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md shadow-emerald-950/20 z-10"
                                         >
                                           <Check className="w-2.5 h-2.5 stroke-[3]" />
                                         </span>
                                       )}
                                    </div>
                                    <div>
                                       <div className="flex items-center gap-2">
                                         <strong className="text-[16px] font-black text-slate-800 tracking-tight">{pay.personName}</strong>
                                         {isHighlighted && (
                                           <span className="inline-flex items-center gap-1 bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow-md animate-bounce">
                                             ✨ เพิ่งอนุมัติ!
                                           </span>
                                         )}
                                       </div>
                                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{formatThaiDate(pay.timestamp)}</p>
                                       <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                         {pay.status === 'pending' && (
                                           <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-50 text-amber-700 border border-amber-100 uppercase tracking-wider">
                                             ⏳ รออนุมัติ
                                           </span>
                                         )}
                                         {pay.status === 'rejected' && (
                                           <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-red-50 text-red-600 border border-red-100 uppercase tracking-wider">
                                             ❌ ปฏิเสธแล้ว {pay.rejectedBy && `(โดย ${pay.rejectedBy})`}
                                           </span>
                                         )}
                                         {(pay.status === 'approved' || !pay.status) && (
                                           <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                                             ✅ สำเร็จ {pay.approvedBy && `(อนุมัติโดย ${pay.approvedBy})`}
                                           </span>
                                         )}
                                       </div>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                   <div className={cn(
                                     "text-[18px] font-display font-black tracking-tight",
                                     pay.status === 'pending' ? "text-amber-500" :
                                     pay.status === 'rejected' ? "text-slate-400" :
                                     "text-indigo-600"
                                   )}>
                                     +{Math.ceil(pay.amount).toLocaleString()} ฿
                                   </div>
                                   <div className="flex gap-4 justify-end mt-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                     {slipToShow ? (
                                       <button onClick={() => setViewingSlip(slipToShow)} className="text-[10px] font-black text-indigo-400 hover:text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">สลิป</button>
                                     ) : (
                                       <button onClick={() => { setIsUploadingHistoryId(pay.id); historyFileInputRef.current?.click(); }} className="text-[10px] font-black text-indigo-500 hover:text-indigo-700 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">แนบรูป</button>
                                     )}
                                     {(pay.status === 'approved' || !pay.status) && (
                                       <button 
                                         onClick={() => setViewingDigitalReceipt(pay)}
                                         className="text-[10px] font-black text-emerald-500 hover:text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full"
                                       >
                                         ใบเสร็จ
                                       </button>
                                     )}
                                     <button onClick={() => handleDeletePayment(pay.id)} className="text-[10px] font-black text-slate-300 hover:text-red-500 uppercase tracking-widest">ลบ</button>
                                   </div>
                                 </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                  {isAdminUser && (
                    <div className="pt-8 flex justify-center mt-6 mb-4">
                      <button 
                        onClick={resetAll}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>ล้างข้อมูลทั้งหมด</span>
                      </button>
                    </div>
                  )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Modals */}
        
        <ConfirmModal 
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={confirmConfig.onConfirm}
          title={confirmConfig.title}
          message={confirmConfig.message}
          isDanger={confirmConfig.isDanger}
          confirmText={confirmConfig.isDanger ? "ยืนยันการลบ" : "ตกลง"}
        />
        
        {/* Admin Panel Modal */}
        <Modal isOpen={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} title="🔑 แผงควบคุมแอดมิน (Admin Panel)">
          <div className="space-y-6">
            {/* Admin Badge Banner showing the 3 admin users */}
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-4 rounded-2xl border border-indigo-700/60 text-white shadow-md">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  สิทธิ์ผู้ดูแลระบบ (3 คน)
                </span>
                <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-700/80">
                  FULL ADMIN ACCESS
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {['บัง', 'แป้ง', 'อั้ม'].map((adminName) => {
                  const isActiveUser = currentUser === adminName;
                  return (
                    <div 
                      key={adminName}
                      className={cn(
                        "flex-1 py-1.5 px-2.5 rounded-xl text-center text-xs font-black transition-all border flex items-center justify-center gap-1.5",
                        isActiveUser
                          ? "bg-emerald-500 text-slate-950 border-emerald-300 shadow-md scale-102"
                          : "bg-slate-800/90 text-indigo-200 border-indigo-800/70"
                      )}
                    >
                      <span>👑</span>
                      <span>{adminName}</span>
                      {isActiveUser && <span className="text-[9px] font-extrabold">(คุณ)</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {!isAdminUser ? (
              <div className="space-y-4">
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-300 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-xs font-black text-black leading-relaxed">
                    กรุณากรอกรหัสผ่านแอดมินเพื่อเข้าสู่แผงควบคุม (รหัสผ่านคือ <span className="underline font-black text-amber-950">02618</span>) <br/>
                    <span className="text-[11px] text-slate-700 font-bold block mt-1">
                      ปลดล็อกการใช้งานเมนูแอดมินทั้งหมดสำหรับ <strong className="text-black font-black underline">บัง, แป้ง, อั้ม</strong>
                    </span>
                  </p>
                </div>
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="กรอกรหัสผ่านแอดมิน (02618)"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDevLogin()}
                    className="w-full bg-white border border-slate-300 rounded-2xl px-5 py-4 text-sm font-black text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-center tracking-widest"
                  />
                  <button 
                    onClick={handleDevLogin}
                    className="w-full py-4 bg-slate-950 text-white rounded-2xl text-sm font-black shadow-lg shadow-slate-900/10 hover:bg-slate-900 transition-all active:scale-95 cursor-pointer"
                  >
                    🔑 เข้าสู่ระบบแอดมิน (บัง / แป้ง / อั้ม)
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-black">เข้าสู่ระบบแอดมินแล้ว {currentUser ? `(${currentUser})` : ''}</p>
                      <p className="text-[10px] font-extrabold text-emerald-800">มีสิทธิ์เต็มในการอนุมัติจ่ายเงิน, จัดการเครดิต และเคลียร์ยอด (บัง, แป้ง, อั้ม)</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleDevLogout}
                    className="text-[10px] font-black text-emerald-900 hover:text-rose-600 underline cursor-pointer"
                  >
                    ออกจากระบบ
                  </button>
                </div>

                {/* Admin Quick Tools */}
                <div className="space-y-2.5">
                  <button 
                    onClick={handleClearAllDebts}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4.5 h-4.5" />
                    <span>🧹 เคลียร์ยอดค้างชำระของทุกคน (Clear All Debts)</span>
                  </button>

                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => { setIsAdminPanelOpen(false); setBankModalTab('theme'); setIsBankModalOpen(true); }}
                      className="py-3 px-2 bg-purple-50 border border-purple-200 rounded-2xl text-purple-800 text-xs font-black flex items-center justify-center gap-1.5 hover:bg-purple-100 transition-all shadow-xs cursor-pointer"
                    >
                      <Palette className="w-4 h-4 text-purple-600" />
                      <span>{themeObj.emoji} ธีมสี</span>
                    </button>

                    <button 
                      onClick={() => { setIsAdminPanelOpen(false); setBankModalTab('settings'); setIsBankModalOpen(true); }}
                      className="py-3 px-2 bg-white border border-slate-200 rounded-2xl text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-sky-500" />
                      <span>บัญชีรับเงิน</span>
                    </button>

                    <button 
                      onClick={() => { setIsAdminPanelOpen(false); resetAll(); }}
                      className="py-3 px-2 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-red-100 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>ล้างข้อมูล</span>
                    </button>
                  </div>
                </div>

                {/* Accumulated Written Pots Count per Person */}
                <div className="mt-6 pt-6 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✍️</span>
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">ยอดสะสมเขียนค่าต้ม</h3>
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                      รวมทั้งหมด {foods.filter(f => !f.category || f.category === 'food').length} หม้อ
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                    {(() => {
                      const peopleNames = people.map(p => p.name);
                      const extraWriters = foods
                        .filter(f => (!f.category || f.category === 'food') && f.createdBy)
                        .map(f => f.createdBy!)
                        .filter(name => !peopleNames.includes(name));
                      const allWriters = Array.from(new Set([...peopleNames, ...extraWriters]));

                      return allWriters.map(writerName => {
                        const writtenFoods = foods.filter(f => (!f.category || f.category === 'food') && f.createdBy === writerName);
                        const regCount = writtenFoods.filter(f => !f.isFreeMedicine).length;
                        const freeCount = writtenFoods.filter(f => f.isFreeMedicine).length;

                        return (
                          <div key={writerName} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between shadow-2xs">
                            <span className="text-xs font-black text-slate-800">{writerName}</span>
                            <div className="flex flex-col items-end gap-0.5">
                              <span className="text-xs font-black text-sky-700 bg-sky-50 border border-sky-200/80 px-2.5 py-0.5 rounded-xl">
                                เขียนค่าต้ม {writtenFoods.length} หม้อ
                              </span>
                              {writtenFoods.length > 0 && (
                                <span className="text-[10px] font-extrabold text-slate-500">
                                  (ต้ม {regCount} / ยาฟรี {freeCount})
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>

                {/* Admin Credit Management section */}
                <div className="mt-6 pt-6 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-500" />
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">💳 จัดการ / เพิ่มเครดิตให้สมาชิกทุกคน</h3>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {people.map(p => (
                      <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <span className="text-xs font-black text-slate-800">{p.name}</span>
                          <span className="text-[10px] font-bold text-emerald-600 block">
                            เครดิตคงเหลือ: {p.credit ? Math.ceil(p.credit).toLocaleString() : 0} ฿
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="number"
                            placeholder="จำนวนเงิน"
                            className="w-20 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            id={`admin-credit-input-${p.id}`}
                            defaultValue={p.credit || ''}
                          />
                          <button 
                            type="button"
                            onClick={() => {
                              const el = document.getElementById(`admin-credit-input-${p.id}`) as HTMLInputElement;
                              if (el) handleUpdateCredit(p.id, el.value);
                            }}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                          >
                            บันทึก
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending Payment Approvals section in Admin Panel */}
                <div className="mt-6 pt-6 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4.5 h-4.5 text-sky-500 animate-pulse" />
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">คำขออนุมัติจ่ายเงิน ({pendingPaymentsList.length})</h3>
                    </div>
                    {pendingPaymentsList.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={handleApproveAllPayments}
                          className="px-2.5 py-1 bg-sky-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-sky-700 transition-all cursor-pointer shadow-sm flex items-center gap-1"
                        >
                          <Zap className="w-3 h-3 text-amber-300" />
                          <span>อนุมัติทั้งหมด</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Batch Selection Controls for Admin */}
                  {pendingPaymentsList.length > 0 && (
                    <div className="mb-3 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200/80">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handleSelectAllAdminPayments}
                            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-black flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                          >
                            <CheckSquare className="w-3.5 h-3.5 text-sky-600" />
                            <span>เลือกทั้งหมด ({pendingPaymentsList.length})</span>
                          </button>

                          {/* "ล้างคำขอที่เลือก" Button (Clear Selection in 1 Click) */}
                          <button
                            type="button"
                            onClick={handleClearSelectedAdminPayments}
                            disabled={selectedAdminPaymentIds.size === 0}
                            className={cn(
                              "px-2.5 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95",
                              selectedAdminPaymentIds.size > 0
                                ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-rose-100"
                                : "bg-slate-100 text-slate-400 border border-slate-200 opacity-60 cursor-not-allowed"
                            )}
                            title="ยกเลิกการเลือกคำขออนุมัติทั้งหมดที่เคยติ๊กไว้"
                          >
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                            <span>ล้างคำขอที่เลือก {selectedAdminPaymentIds.size > 0 ? `(${selectedAdminPaymentIds.size})` : ''}</span>
                          </button>
                        </div>

                        {selectedAdminPaymentIds.size > 0 && (
                          <span className="text-[11px] font-black text-sky-800 bg-sky-100/80 px-2.5 py-1 rounded-xl">
                            เลือกอยู่ {selectedAdminPaymentIds.size} / {pendingPaymentsList.length} รายการ
                          </span>
                        )}
                      </div>

                      {/* Floating Multi-Action Bar when items are selected */}
                      {selectedAdminPaymentIds.size > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-900 rounded-2xl text-white space-y-2.5 shadow-lg border border-sky-600/40"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-black text-sky-200 flex items-center gap-1.5">
                              <span>✅ เลือกอยู่ {selectedAdminPaymentIds.size} รายการ</span>
                              <span className="text-[10px] text-sky-300 font-bold">
                                (รวม {Math.ceil(pendingPaymentsList.filter(p => selectedAdminPaymentIds.has(p.id)).reduce((acc, curr) => acc + (curr.amount || 0), 0)).toLocaleString()} ฿)
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={handleClearSelectedAdminPayments}
                              className="text-[11px] font-black text-rose-300 hover:text-rose-100 underline flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>ล้างคำขอที่เลือก</span>
                            </button>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleApproveSelectedPayments}
                              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all active:scale-95 cursor-pointer"
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>อนุมัติที่เลือก ({selectedAdminPaymentIds.size})</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleRejectSelectedPayments}
                              className="py-2.5 px-3.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
                            >
                              <X className="w-4 h-4 stroke-[3]" />
                              <span>ปฏิเสธที่เลือก</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                  
                  {pendingPaymentsList.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic text-center py-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">ไม่มีคำขออนุมัติจ่ายเงินค้างอยู่</p>
                  ) : (
                    <div className="space-y-4">
                      {pendingPaymentsList.map(pay => {
                        const foodIdsStr = pay.foodId ? pay.foodId.split(',') : [];
                        const selectedFoods = foodIdsStr.map(id => foods.find(f => f.id === id)).filter(Boolean);
                        const potsPaidNames = selectedFoods.map(f => f?.name).filter(Boolean);
                        const hasSlip = Boolean(pay.slipUrl);
                        const isSelected = selectedAdminPaymentIds.has(pay.id);

                        return (
                          <motion.div 
                            key={pay.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className={cn(
                              "p-4 rounded-[24px] border-2 space-y-3 relative overflow-hidden transition-all animate-pulse-soft gpu-accelerated shadow-md",
                              isSelected
                                ? "bg-sky-50/90 border-sky-500 ring-2 ring-sky-400/40 shadow-sky-500/20"
                                : hasSlip 
                                  ? "bg-gradient-to-br from-sky-50 via-white to-sky-50/50 border-sky-400 shadow-sky-500/10" 
                                  : "bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 border-amber-400 shadow-amber-500/10"
                            )}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex items-start gap-2.5 min-w-0">
                                {/* Selection Checkbox */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleSelectAdminPayment(pay.id);
                                  }}
                                  className={cn(
                                    "w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all shrink-0 mt-0.5",
                                    isSelected 
                                      ? "bg-sky-600 border-sky-600 text-white shadow-sm scale-105" 
                                      : "bg-white border-slate-300 hover:border-sky-500 hover:bg-sky-50"
                                  )}
                                  title={isSelected ? "ยกเลิกเลือกคำขอนี้" : "เลือกคำขอนี้"}
                                >
                                  {isSelected ? (
                                    <Check className="w-4 h-4 stroke-[3]" />
                                  ) : (
                                    <div className="w-2 h-2 rounded-xs bg-transparent" />
                                  )}
                                </button>

                                <div className="text-left min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[14px] font-black text-slate-800">{pay.personName}</span>
                                    {hasSlip ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-[9px] font-black rounded-full shadow-md shadow-sky-500/20 animate-pulse">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                        📸 แนบสลิปแล้ว (รออนุมัติ)
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500 text-white text-[9px] font-black rounded-full shadow-sm animate-pulse">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                        ⏳ แจ้งโอน (รอสลิป)
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{formatThaiDate(pay.timestamp)}</span>
                                  {potsPaidNames.length > 0 && (
                                    <div className="mt-1.5 flex flex-wrap gap-1">
                                      {potsPaidNames.map((name, i) => (
                                        <span key={i} className="text-[9px] font-bold bg-white text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
                                          {name}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-[16px] font-display font-black text-sky-600 block">+{Math.ceil(pay.amount).toLocaleString()} ฿</span>
                              </div>
                            </div>

                            {pay.slipUrl && (
                              <div className="relative group rounded-xl overflow-hidden border-2 border-sky-200 aspect-[3/4] max-h-48 bg-slate-100 shadow-sm">
                                <img 
                                  src={pay.slipUrl} 
                                  alt="Slip" 
                                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" 
                                  onClick={() => {
                                    setViewingSlip(pay.slipUrl);
                                  }}
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                  <span className="text-white text-[9px] font-black uppercase tracking-wider bg-slate-950/80 px-2.5 py-1 rounded-full shadow-md">คลิกเพื่อดูรูปใหญ่ 🔍</span>
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2 pt-1">
                              <button 
                                onClick={() => handleApprovePayment(pay)}
                                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" strokeWidth={3} /> อนุมัติการจ่าย
                              </button>
                              <button 
                                onClick={() => handleRejectPayment(pay.id)}
                                className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" strokeWidth={3} /> ปฏิเสธ
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Pending Credit Requests section in Admin Panel */}
                <div className="mt-8 pt-8 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">คำขอเครดิตที่รอดำเนินการ</h3>
                    </div>
                    {creditRequests.filter(r => r.status === 'pending').length > 0 && (
                      <span className="px-2 py-0.5 bg-amber-500 text-white font-black text-[10px] rounded-full">
                        {creditRequests.filter(r => r.status === 'pending').length} คำขอ
                      </span>
                    )}
                  </div>
                  
                  {creditRequests.filter(r => r.status === 'pending').length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic text-center py-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">ไม่มีคำขอเครดิตที่ค้างอยู่</p>
                  ) : (
                    <div className="space-y-3">
                      {creditRequests
                        .filter(r => r.status === 'pending')
                        .map(req => (
                          <div key={req.id} className="bg-white p-4 rounded-2xl border border-amber-100 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="text-[13px] font-black text-slate-800">{req.personName}</span>
                                <p className="text-[10px] text-slate-400 font-bold">{req.reason || 'ไม่มีเหตุผล'}</p>
                              </div>
                              <span className="text-[14px] font-black text-emerald-600">+{req.amount.toLocaleString()} ฿</span>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleApproveCredit(req)}
                                className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all cursor-pointer shadow-sm"
                              >
                                อนุมัติ (เพิ่มเครดิต)
                              </button>
                              <button 
                                onClick={() => handleRejectCredit(req.id)}
                                className="flex-1 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                              >
                                ปฏิเสธ (คำขอไม่อนุญาต)
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* History of processed credit requests */}
                  {creditRequests.filter(r => r.status !== 'pending').length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                        ประวัติการดำเนินการคำขอเครดิต
                      </span>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {creditRequests
                          .filter(r => r.status !== 'pending')
                          .slice(0, 10)
                          .map(req => (
                            <div key={req.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl text-[11px]">
                              <div>
                                <span className="font-bold text-slate-700">{req.personName}</span>
                                <span className="text-[10px] text-slate-400 ml-2">+{req.amount.toLocaleString()} ฿</span>
                              </div>
                              <span className={cn(
                                "text-[9px] font-black px-2 py-0.5 rounded-full uppercase",
                                req.status === 'approved' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                              )}>
                                {req.status === 'approved' ? 'อนุมัติแล้ว' : 'คำขอไม่อนุญาต'}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </Modal>

        {/* Food Modal */}
        <Modal 
          isOpen={isFoodModalOpen} 
          onClose={() => {
            setIsFoodModalOpen(false);
            setEditingFood(null);
            setSplitMode('equal');
          }} 
          title={
            editingFood 
              ? (activeTab === 'items' ? "📝 แก้ไขค่าต้ม" : 
                 activeTab === 'water' ? "📝 แก้ไขค่าน้ำ" : 
                 activeTab === 'electricity' ? "📝 แก้ไขค่าไฟ" : "📝 แก้ไขค่าแก๊ส")
              : (activeTab === 'items' ? "🥘 เพิ่มหม้อใหม่" : 
                 activeTab === 'water' ? "💧 เพิ่มรายการค่าน้ำ" : 
                 activeTab === 'electricity' ? "⚡ เพิ่มรายการค่าไฟ" : "🔥 เพิ่มรายการค่าแก๊ส")
          }
        >
          <div className="space-y-5">
            <div className="space-y-4">
              {activeTab === 'items' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-black block pl-1">
                    ประเภทหม้อ / ค่าต้ม:
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFreeMedicine(false);
                        if (!foodPrice || foodPrice === '45') setFoodPrice('80');
                        if (!editingFood && foodName.startsWith('หม้อยาฟรี')) {
                          const regularCount = foods.filter(f => (!f.category || f.category === 'food') && !f.isFreeMedicine).length;
                          setFoodName(`ยาขวดที่ ${regularCount + 1}`);
                        }
                      }}
                      className={cn(
                        "py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                        !isFreeMedicine
                          ? "bg-red-700 text-white shadow-md shadow-red-900/30 font-black"
                          : "bg-transparent text-slate-600 hover:text-black hover:bg-slate-200/60"
                      )}
                    >
                      <span>🥘</span>
                      <span>หม้อต้มปกติ (80฿)</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setIsFreeMedicine(true);
                        if (!foodPrice || foodPrice === '80') setFoodPrice('45');
                        if (!editingFood && (foodName.startsWith('ยาขวดที่') || !foodName)) {
                          const freeCount = foods.filter(f => (!f.category || f.category === 'food') && f.isFreeMedicine).length;
                          setFoodName(`หม้อยาฟรีที่ ${freeCount + 1}`);
                        }
                      }}
                      className={cn(
                        "py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                        isFreeMedicine
                          ? "bg-purple-700 text-white shadow-md shadow-purple-900/30 font-black"
                          : "bg-transparent text-slate-600 hover:text-black hover:bg-slate-200/60"
                      )}
                    >
                      <span>💊</span>
                      <span>หม้อยาฟรี (45฿)</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-black text-black block pl-1">
                  {activeTab === 'items' ? (isFreeMedicine ? "💊 ยาฟรีขวดที่ / ชื่อรายการ" : "💊 ยาขวดที่ / ชื่อรายการ") : "ชื่อรายการ / วันที่"}
                </label>
                <input
                  type="text"
                  placeholder={
                    activeTab === 'items' ? (isFreeMedicine ? "หม้อยาฟรีที่" : "ยาขวดที่") : 
                    (activeTab === 'water' || activeTab === 'electricity' || activeTab === 'gas') ? "วันที่" : 
                    "ยาขวดที่"
                  }
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full bg-white border-2 border-slate-300 rounded-2xl px-5 py-4 text-base font-extrabold text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-600 transition-all shadow-xs"
                />
              </div>

              {activeTab === 'items' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-black block pl-1">
                      {isFreeMedicine ? "💊 ยาฟรีหม้อละ (บาท)" : "🍲 ต้มหม้อละ (บาท)"}
                    </label>
                    <input
                      type="number"
                      placeholder={isFreeMedicine ? "45" : "80"}
                      value={foodPrice}
                      onChange={(e) => setFoodPrice(e.target.value)}
                      className="w-full bg-white border-2 border-slate-300 rounded-2xl px-5 py-4 text-base font-extrabold text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-600 transition-all shadow-xs"
                    />
                  </div>
                  
                  <div className="space-y-2 border border-slate-200 p-4 rounded-2xl bg-stone-50/80 shadow-xs">
                    <label className="text-[11px] font-black text-black uppercase tracking-wider block pl-0.5 flex items-center gap-1.5">
                      <span>👨‍🍳</span>
                      <span>ใครเป็นคนต้ม (เลือกคนต้ม):</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {people.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setFoodCook(foodCook === p.name ? '' : p.name)}
                          className={cn(
                            "px-3.5 py-2 rounded-xl text-xs font-black transition-all border cursor-pointer active:scale-95 flex items-center gap-1.5",
                            foodCook === p.name 
                              ? "bg-slate-950 text-white border-2 border-red-600 shadow-md shadow-slate-950/30 ring-2 ring-red-500/20" 
                              : "bg-white text-black border-slate-300 hover:border-slate-950 hover:bg-slate-50 font-extrabold shadow-2xs"
                          )}
                        >
                          <span>{p.name}</span>
                          {foodCook === p.name && <span className="text-red-500 font-black text-[11px]">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 border border-slate-200 p-4 rounded-2xl bg-stone-50/80 shadow-xs">
                    <label className="text-[11px] font-black text-black uppercase tracking-wider block pl-0.5 flex items-center gap-1.5">
                      <span>✍️</span>
                      <span>ใครเป็นคนเขียน / บันทึกรายการ:</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {people.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setFoodCreatedBy(foodCreatedBy === p.name ? '' : p.name)}
                          className={cn(
                            "px-3.5 py-2 rounded-xl text-xs font-black transition-all border cursor-pointer active:scale-95 flex items-center gap-1.5",
                            foodCreatedBy === p.name 
                              ? "bg-slate-950 text-white border-2 border-sky-600 shadow-md shadow-slate-950/30 ring-2 ring-sky-500/20" 
                              : "bg-white text-black border-slate-300 hover:border-slate-950 hover:bg-slate-50 font-extrabold shadow-2xs"
                          )}
                        >
                          <span>{p.name}</span>
                          {foodCreatedBy === p.name && <span className="text-sky-500 font-black text-[11px]">✓</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {activeTab === 'items' ? (
              <div>
                {/* 3 Split Modes Selector */}
                <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 mb-4">
                  <button
                    type="button"
                    onClick={() => setSplitMode('equal')}
                    className={cn(
                      "py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95",
                      splitMode === 'equal' ? "bg-red-700 text-white shadow-md shadow-red-950/20" : "bg-transparent text-slate-600 hover:text-black"
                    )}
                  >
                    <span>🥘</span> หารปกติ/ครึ่ง
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitMode('shot')}
                    className={cn(
                      "py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95",
                      splitMode === 'shot' ? "bg-slate-950 text-white shadow-md shadow-black/30" : "bg-transparent text-slate-600 hover:text-black"
                    )}
                  >
                    <span>🥃</span> กินเป็นช็อต
                  </button>
                  <button
                    type="button"
                    onClick={() => setSplitMode('proportional')}
                    className={cn(
                      "py-2 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer active:scale-95",
                      splitMode === 'proportional' ? "bg-indigo-700 text-white shadow-md shadow-indigo-950/20" : "bg-transparent text-slate-600 hover:text-black"
                    )}
                  >
                    <span>⚖️</span> ตามสัดส่วน
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {splitMode === 'equal' ? 'เลือกคนกิน (แตะสลับ: เต็มหม้อ ➔ ครึ่งหม้อ ➔ ไม่กิน)' :
                     splitMode === 'shot' ? 'โหมดช็อต: แตะชื่อเพื่อนับจำนวนช็อต 🥃' : 'ระบุสัดส่วน / น้ำหนักของแต่ละคน'}
                  </p>
                  <div className="flex gap-2 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        const allSelected: Record<string, number> = {};
                        const allInputs: Record<string, string> = {};
                        people.forEach(p => { 
                          const val = splitMode === 'shot' ? ((selectedEaters[p.name] || 0) + 1) : 1;
                          allSelected[p.name] = val;
                          allInputs[p.name] = val.toString();
                        });
                        setSelectedEaters(allSelected);
                        setProportionalInputs(allInputs);
                        toast.success(splitMode === 'shot' ? 'เพิ่ม +1 ช็อตให้ทุกคนแล้ว 🥃' : 'เลือกทุกคนแล้ว');
                      }}
                      className="text-indigo-600 hover:text-indigo-800 underline transition-colors cursor-pointer font-black"
                    >
                      {splitMode === 'shot' ? '+1 ช็อตทุกคน' : 'เลือกทุกคน'}
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEaters({});
                        setProportionalInputs({});
                        toast.success('รีเซ็ตทั้งหมดแล้ว');
                      }}
                      className="text-slate-500 hover:text-slate-700 underline transition-colors cursor-pointer font-black"
                    >
                      ล้างทั้งหมด
                    </button>
                  </div>
                </div>

                {splitMode === 'equal' && (
                  <div className="flex flex-wrap gap-2">
                    {people.map(p => {
                      const weight = selectedEaters[p.name] || 0;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            const next = weight === 0 ? 1 : weight === 1 ? 0.5 : 0;
                            setSelectedEaters(prev => ({ ...prev, [p.name]: next }));
                          }}
                          className={cn(
                            "px-4 py-2.5 rounded-xl text-xs font-black transition-all border-2 cursor-pointer active:scale-95 shadow-2xs",
                            weight === 1 ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-200" :
                            weight === 0.5 ? "bg-amber-100 text-amber-950 border-amber-300 shadow-md shadow-amber-100/50" :
                            "bg-white text-slate-800 border-slate-200 hover:border-slate-400"
                          )}
                        >
                          {p.name} {weight === 0.5 ? '½ (ครึ่งหม้อ)' : weight === 1 ? '🍲 (เต็มหม้อ)' : ''}
                        </button>
                      );
                    })}
                  </div>
                )}

                {splitMode === 'shot' && (
                  <div className="flex flex-wrap gap-2">
                    {people.map(p => {
                      const shots = selectedEaters[p.name] || 0;
                      return (
                        <div key={p.id} className="relative inline-flex items-center">
                          <button
                            type="button"
                            onClick={() => {
                              const nextShots = shots + 1;
                              setSelectedEaters(prev => ({ ...prev, [p.name]: nextShots }));
                            }}
                            className={cn(
                              "px-3.5 py-2.5 rounded-xl text-xs font-black transition-all border-2 flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs",
                              shots > 0 
                                ? "bg-slate-950 text-white border-slate-950 shadow-md shadow-slate-950/30" 
                                : "bg-white text-slate-800 border-slate-250 hover:border-slate-950"
                            )}
                          >
                            <span>{p.name}</span>
                            {shots > 0 && (
                              <span className="bg-red-600 text-white px-1.5 py-0.5 rounded-md font-black text-[11px] shadow-xs">
                                {shots} ช็อต 🥃
                              </span>
                            )}
                          </button>

                          {shots > 0 && (
                            <button
                              type="button"
                              title="ลดจำนวนช็อต"
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextShots = Math.max(0, shots - 1);
                                setSelectedEaters(prev => ({ ...prev, [p.name]: nextShots }));
                              }}
                              className="ml-1 w-6 h-6 rounded-full bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 flex items-center justify-center font-black text-xs transition-colors cursor-pointer border border-slate-200"
                            >
                              -
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {splitMode === 'proportional' && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-black text-slate-500 px-1">
                      <span>น้ำหนัก/สัดส่วน (เช่น 1.5, 0.5, 1, 2):</span>
                      <span className="bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-lg text-xs font-black">
                        น้ำหนักรวม: {(Number(Object.values(selectedEaters).reduce((sum: number, val: unknown): number => sum + (Number(val) || 0), 0)) || 0).toFixed(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {people.map(p => {
                        const weight = selectedEaters[p.name] || 0;
                        const totalW = Number(Object.values(selectedEaters).reduce((sum: number, val: unknown): number => sum + (Number(val) || 0), 0)) || 1;
                        const priceNum = parseFloat(foodPrice) || 0;
                        const shareCalc = totalW > 0 ? (weight / totalW) * priceNum : 0;
                        return (
                          <div key={p.id} className="flex items-center justify-between gap-2 bg-white px-3.5 py-2.5 rounded-2xl border border-slate-300 shadow-2xs">
                            <span className="text-xs font-black text-slate-950">{p.name}</span>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={proportionalInputs[p.name] !== undefined ? proportionalInputs[p.name] : (weight === 0 ? '0' : weight.toString())}
                                onChange={(e) => {
                                  const raw = e.target.value;
                                  setProportionalInputs(prev => ({ ...prev, [p.name]: raw }));
                                  const num = parseFloat(raw);
                                  setSelectedEaters(prev => ({
                                    ...prev,
                                    [p.name]: isNaN(num) ? 0 : num
                                  }));
                                }}
                                placeholder="0"
                                className="w-16 bg-slate-100 border border-slate-300 rounded-xl px-2 py-1 text-xs font-black text-black text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                              <span className="text-[11px] font-bold text-indigo-700 min-w-[70px] text-right">
                                = {Math.round(shareCalc).toLocaleString()} ฿
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Shot calculation summary box */}
                {(() => {
                  const foodPriceNum = parseFloat(foodPrice) || 0;
                  const eaterEntries = Object.entries(selectedEaters).filter(([_, w]) => (w as number) > 0);
                  const eatersCount = eaterEntries.length;
                  const totalShots = eaterEntries.reduce((sum, [_, w]) => sum + (w as number), 0);

                  if (splitMode === 'shot' && totalShots > 0 && foodPriceNum > 0) {
                    const avgShotsPerPerson = totalShots / (eatersCount || 1);
                    const pricePerShot = foodPriceNum / totalShots;

                    return (
                      <div className="mt-4 p-4 bg-gradient-to-br from-red-950 via-zinc-950 to-black border border-red-800/80 rounded-2xl space-y-2.5 shadow-md text-white">
                        <div className="flex justify-between items-center border-b border-red-800/60 pb-2">
                          <span className="text-xs font-black text-red-300 flex items-center gap-1.5">
                            <span>🥃</span>
                            <span>การคำนวณราคาแบบช็อต</span>
                          </span>
                          <span className="bg-red-800 text-white px-3 py-1 rounded-full text-xs font-black shadow-xs border border-red-600/50">
                            ตกช็อตละ {pricePerShot.toFixed(2)} บาท
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                          <div className="bg-white/80 p-2 rounded-xl border border-red-100">
                            <span className="text-slate-400 block text-[10px]">ราคารวมทั้งรายการ:</span>
                            <span className="font-black text-slate-900 text-xs sm:text-sm">{foodPriceNum.toLocaleString()} ฿</span>
                          </div>
                          <div className="bg-white/80 p-2 rounded-xl border border-red-100">
                            <span className="text-slate-400 block text-[10px]">จำนวนคนกิน:</span>
                            <span className="font-black text-slate-900 text-xs sm:text-sm">{eatersCount} คน</span>
                          </div>
                          <div className="bg-white/80 p-2 rounded-xl border border-red-100">
                            <span className="text-slate-400 block text-[10px]">ช็อตรวมทั้งหมด:</span>
                            <span className="font-black text-red-600 text-xs sm:text-sm">{totalShots} ช็อต</span>
                          </div>
                          <div className="bg-white/80 p-2 rounded-xl border border-red-100">
                            <span className="text-slate-400 block text-[10px]">สูตรคำนวณ:</span>
                            <span className="font-bold text-slate-700 text-[10px]">({foodPriceNum} ÷ {eatersCount} คน) ÷ {avgShotsPerPerson.toFixed(1)} ช็อต</span>
                          </div>
                        </div>

                        <div className="pt-1 border-t border-red-100/80">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">ยอดจ่ายตามจำนวนช็อต:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {eaterEntries.map(([name, shots]) => {
                              const personCost = Math.ceil((shots as number) * pricePerShot);
                              return (
                                <div key={name} className="bg-white px-2.5 py-1 rounded-xl border border-red-100 text-[11px] font-bold shadow-2xs flex items-center gap-1">
                                  <span className="text-slate-800">{name}:</span>
                                  <span className="text-red-600 font-black">{shots} ช็อต</span>
                                  <span className="text-slate-500">= {personCost.toLocaleString()} ฿</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-black text-black uppercase tracking-widest">กรอกราคารายบุคคล</p>
                <div className="bg-sky-50 border border-sky-200 p-3.5 rounded-2xl flex flex-col gap-2">
                  <label className="text-[11px] font-black text-black uppercase tracking-widest block pl-0.5">เครื่องมือด่วน: กรอกยอดรวมทั้งหมดเพื่อหารเท่ากัน</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="เช่น ยอดรวมบิลทั้งหมด 1200 บาท"
                      id="bulk-split-total-input"
                      className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-extrabold text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const inputEl = document.getElementById('bulk-split-total-input') as HTMLInputElement;
                        const total = parseFloat(inputEl?.value || '0');
                        if (total > 0 && people.length > 0) {
                          const equalShare = parseFloat((total / people.length).toFixed(2));
                          const newEaters: Record<string, number> = {};
                          people.forEach(p => {
                            newEaters[p.name] = equalShare;
                          });
                          setSelectedEaters(newEaters);
                          toast.success(`หารเท่ากันคนละ ${equalShare} ฿ แล้ว`);
                        } else {
                          toast.error('กรุณากรอกยอดรวมเงินที่ถูกต้อง');
                        }
                      }}
                      className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-black hover:bg-sky-700 shadow-md shadow-sky-100 transition-all cursor-pointer"
                    >
                      หารเท่ากันทุกคน
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {people
                    .slice()
                    .sort((a, b) => (a.order || 99) - (b.order || 99))
                    .map((p, index) => {
                      const val = selectedEaters[p.name];
                      return (
                        <div key={p.id} className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-slate-300 shadow-2xs">
                          <span className="text-xs font-black text-black min-w-[20px]">{index + 1}. {p.name}</span>
                          <span className="text-sm font-black text-black flex-1"></span>
                          <div className="flex items-center gap-1.5 w-1/3 min-w-[120px]">
                            <input
                              type="number"
                              placeholder="0"
                              value={val || ""}
                              onChange={(e) => {
                                const parseVal = e.target.value === "" ? "" : parseFloat(e.target.value);
                                setSelectedEaters(prev => ({
                                  ...prev,
                                  [p.name]: parseVal === "" || isNaN(parseVal) ? 0 : parseVal
                                }));
                              }}
                              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-right font-black text-black placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                            />
                            <span className="text-[11px] font-black text-black">฿</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div className="bg-slate-100 border border-slate-300 rounded-2xl p-4 flex justify-between items-center mt-3">
                  <span className="text-xs font-black text-black uppercase tracking-widest">ราคารวมทั้งหมด</span>
                  <span className="text-lg font-black text-black">
                    {Math.ceil(
                      Object.values(selectedEaters).reduce<number>((sum, v) => sum + ((v as number) || 0), 0)
                    ).toLocaleString()} ฿
                  </span>
                </div>
              </div>
            )}

            <button 
              onClick={handleSaveFood}
              className="w-full py-5 bg-sky-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-sky-100 hover:bg-sky-700 transition-all mt-4"
            >
              {activeTab === 'items' ? "บันทึกค่าต้ม" : 
               activeTab === 'water' ? "บันทึกค่าน้ำ" : 
               activeTab === 'electricity' ? "บันทึกค่าไฟ" : "บันทึกค่าแก๊ส"}
            </button>
          </div>
        </Modal>

        {/* Bank & PromptPay QR Modal */}
        <Modal 
          isOpen={isBankModalOpen} 
          onClose={() => setIsBankModalOpen(false)} 
          title={
            bankModalTab === 'theme' 
              ? '🎨 ปรับแต่งสีธีมหลัก (Theme Settings)' 
              : bankModalTab === 'settings' 
              ? '⚙️ บัญชีกลางของกลุ่ม & ตั้งค่า' 
              : '💳 บัญชีรับเงิน & QR Code พร้อมเพย์'
          }
        >
          <div className="space-y-5">
            {/* Modal Segmented Navigation Tabs */}
            <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-indigo-900/40 gap-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setBankModalTab('qr')}
                className={cn(
                  "flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap",
                  bankModalTab === 'qr'
                    ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-600/30"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <QrCode className="w-4 h-4 text-sky-300" />
                <span>QR โอนเงิน</span>
              </button>
              <button
                onClick={() => setBankModalTab('settings')}
                className={cn(
                  "flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap",
                  bankModalTab === 'settings'
                    ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-600/30"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <CreditCard className="w-4 h-4 text-sky-300" />
                <span>บัญชีกลาง</span>
              </button>
              <button
                onClick={() => setBankModalTab('theme')}
                className={cn(
                  "flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap",
                  bankModalTab === 'theme'
                    ? "bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-md shadow-purple-600/30"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <Palette className="w-4 h-4 text-amber-300" />
                <span>🎨 สีธีม ({themeObj.emoji})</span>
              </button>
            </div>

            {/* TAB 1: PROMPTPAY QR GENERATOR (CENTRAL ACCOUNT ONLY) */}
            {bankModalTab === 'qr' && (
              <div className="space-y-4 text-left">
                {/* Mandatory Central Pot Notice Banner */}
                <div className="bg-gradient-to-r from-slate-900 via-sky-950/60 to-slate-900 border-2 border-sky-600/50 p-4 rounded-2xl space-y-2 shadow-lg">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🏛️</span>
                      <span className="text-xs font-black text-white uppercase tracking-wider">บัญชีรับเงินกองกลาง</span>
                    </div>
                    <span className="text-[10px] font-black bg-red-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
                      🔒 โอนเข้ากองกลางเท่านั้น
                    </span>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-xl border border-sky-900/40 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs font-black text-sky-300 truncate">
                        {bankInfo.name || 'พร้อมเพย์'}: <span className="font-mono text-white text-sm">{formatPromptPayDisplay(bankInfo.no || '') || 'ยังไม่ได้ตั้งค่า'}</span>
                      </div>
                      {bankInfo.user && (
                        <div className="text-[11px] text-zinc-300 font-bold truncate">
                          ชื่อบัญชีกองกลาง: <strong className="text-white">{bankInfo.user}</strong>
                        </div>
                      )}
                    </div>

                    {bankInfo.no && (
                      <button
                        type="button"
                        onClick={() => {
                          const clean = (bankInfo.no || '').replace(/[^0-9]/g, '');
                          navigator.clipboard.writeText(clean);
                          toast.success(`คัดลอกเลขบัญชีกองกลาง ${clean} เรียบร้อย!`);
                        }}
                        className="px-3 py-1.5 bg-sky-900/80 hover:bg-sky-700 text-sky-200 rounded-xl text-[11px] font-bold border border-sky-700/60 shrink-0 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอก</span>
                      </button>
                    )}
                  </div>

                  {!bankInfo.no && (
                    <div className="bg-amber-950/80 border border-amber-800 p-2.5 rounded-xl text-amber-200 text-xs font-bold flex items-center justify-between gap-2">
                      <span>⚠️ ยังไม่ได้ตั้งค่าเลขพร้อมเพย์กองกลาง</span>
                      <button
                        type="button"
                        onClick={() => setBankModalTab('settings')}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-black shrink-0"
                      >
                        ตั้งค่าที่นี่
                      </button>
                    </div>
                  )}
                </div>

                {/* 1. Member Selector (Payer) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-sky-400" />
                      <span>เลือกสมาชิกผู้ชำระเงิน (Payer)</span>
                    </label>
                    {selectedQrPerson && (
                      <button 
                        onClick={() => handleSelectQrMember('')}
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-200 underline"
                      >
                        ล้างการเลือก
                      </button>
                    )}
                  </div>

                  {/* Member Quick Chips Bar */}
                  <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {people.map(p => {
                      const debt = debts[p.name] || 0;
                      const isSelected = selectedQrPerson === p.name;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectQrMember(isSelected ? '' : p.name)}
                          className={cn(
                            "shrink-0 px-3 py-2 rounded-2xl border flex items-center gap-2 transition-all cursor-pointer text-left",
                            isSelected 
                              ? "bg-sky-600/30 border-sky-400 text-white shadow-sm ring-1 ring-sky-400" 
                              : "bg-slate-900/80 border-slate-800 text-zinc-300 hover:bg-slate-850 hover:border-slate-700"
                          )}
                        >
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0">
                            {p.photoUrl ? (
                              <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-black text-sky-400">{p.name.slice(0, 1)}</span>
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-bold leading-tight">{p.name}</div>
                            <div className={cn(
                              "text-[10px] font-bold",
                              debt > 0 ? "text-amber-400" : "text-emerald-400"
                            )}>
                              {debt > 0 ? `ค้าง ${Math.ceil(debt)}฿` : 'จ่ายครบแล้ว'}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Custom Note / Name of Payer */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-zinc-200 uppercase tracking-wider block">
                    👤 ชื่อผู้ชำระเงิน / บันทึกกำกับ
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น นายอั้ม ใจดี (หรือชื่อสมาชิกที่ต้องโอนเข้ากองกลาง)"
                    value={qrCustomName}
                    onChange={(e) => setQrCustomName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-3.5 text-sm font-bold text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                  />
                </div>

                {/* 3. Amount Input */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-200 uppercase tracking-wider block">
                    💵 จำนวนเงินที่โอนเข้ากองกลาง (บาท) <span className="text-zinc-500 font-normal text-[11px]">(เว้นว่างหรือใส่ 0 เพื่อให้ผู้โอนระบุเอง)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={qrAmount}
                      onChange={(e) => setQrAmount(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-2xl pl-5 pr-12 py-3.5 text-sm font-bold text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all"
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">฿</span>
                  </div>

                  {/* Amount Presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedQrPerson && debts[selectedQrPerson] > 0 && (
                      <button
                        type="button"
                        onClick={() => setQrAmount(Math.ceil(debts[selectedQrPerson]).toString())}
                        className="px-3 py-1 bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        🎯 ยอดค้างของ {selectedQrPerson}: {Math.ceil(debts[selectedQrPerson])}฿
                      </button>
                    )}
                    {['50', '100', '150', '200', '300', '500'].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setQrAmount(amt)}
                        className={cn(
                          "px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                          qrAmount === amt 
                            ? "bg-sky-600 border-sky-400 text-white" 
                            : "bg-slate-900 border-slate-800 text-zinc-400 hover:text-zinc-200 hover:border-slate-700"
                        )}
                      >
                        {amt}฿
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setQrAmount('')}
                      className={cn(
                        "px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                        !qrAmount || qrAmount === '0'
                          ? "bg-slate-700 border-slate-500 text-white"
                          : "bg-slate-900 border-slate-800 text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      ไม่ระบุยอด
                    </button>
                  </div>
                </div>

                {/* 4. Live PromptPay QR Preview Card */}
                {promptpayPayload ? (
                  <div className="pt-2">
                    <div className="bg-white rounded-[28px] overflow-hidden shadow-2xl border-4 border-slate-800 text-slate-900 text-center">
                      {/* Thai QR Banner */}
                      <div className="bg-[#003b71] text-white py-3 px-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-white rounded flex items-center justify-center p-0.5">
                            <QrCode className="w-4 h-4 text-[#003b71]" />
                          </div>
                          <span className="font-black text-xs sm:text-sm tracking-wide">Thai QR Payment | โอนเข้ากองกลาง</span>
                        </div>
                        <span className="text-[10px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full">
                          เข้ากองกลางเท่านั้น
                        </span>
                      </div>

                      {/* QR Body */}
                      <div className="p-6 flex flex-col items-center bg-white">
                        <div className="p-3 bg-white rounded-2xl border-2 border-slate-100 shadow-inner">
                          <QRCodeSVG
                            id="personal-promptpay-qr-svg"
                            value={promptpayPayload}
                            size={190}
                            level="M"
                            includeMargin={false}
                          />
                        </div>

                        {/* QR Details */}
                        <div className="mt-4 space-y-1.5 w-full">
                          <div className="text-xs font-black text-slate-500 uppercase tracking-widest">
                            โอนเข้าบัญชีกองกลาง
                          </div>
                          <div className="font-black text-base text-slate-900 truncate">
                            {bankInfo.user || 'บัญชีกองกลาง'} ({bankInfo.name || 'พร้อมเพย์'})
                          </div>
                          <div className="font-mono font-bold text-sm text-slate-600 select-all">
                            {formatPromptPayDisplay(bankInfo.no || '')}
                          </div>

                          {(selectedQrPerson || qrCustomName) && (
                            <div className="pt-1 text-xs font-bold text-sky-700">
                              👤 ผู้ชำระ: <strong>{selectedQrPerson || qrCustomName}</strong>
                            </div>
                          )}

                          <div className="pt-2">
                            {qrAmount && Number(qrAmount) > 0 ? (
                              <div className="inline-block px-4 py-1.5 bg-red-50 text-red-700 rounded-full font-black text-base border border-red-200">
                                ฿ {Number(qrAmount).toLocaleString()} บาท
                              </div>
                            ) : (
                              <div className="text-xs font-bold text-slate-400">
                                (ผู้โอนระบุจำนวนเงินได้เองในแอปธนาคาร)
                              </div>
                            )}
                          </div>

                          <div className="text-[10px] font-black text-red-600 bg-red-50 py-1 px-3 rounded-lg border border-red-200 mt-2">
                            ⚠️ การโอนเงินทุกรายการต้องโอนเข้าบัญชีกองกลางนี้เท่านั้น
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <button
                        onClick={handleDownloadPersonalQR}
                        className="py-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-950 transition-all active:scale-95 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>บันทึกรูป QR Code</span>
                      </button>
                      <button
                        onClick={() => {
                          const cleanNo = (bankInfo.no || '').replace(/[^0-9]/g, '');
                          navigator.clipboard.writeText(cleanNo);
                          toast.success(`คัดลอกเบอร์พร้อมเพย์กองกลาง ${cleanNo} เรียบร้อย!`);
                        }}
                        className="py-3.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-zinc-200 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                      >
                        <Copy className="w-4 h-4 text-sky-400" />
                        <span>คัดลอกเลขกองกลาง</span>
                      </button>
                      <button
                        onClick={() => {
                          const payer = selectedQrPerson || qrCustomName || 'สมาชิก';
                          const cleanNo = (bankInfo.no || '').replace(/[^0-9]/g, '');
                          const amtText = qrAmount && Number(qrAmount) > 0 ? `${Number(qrAmount).toLocaleString()} บาท` : 'ตามยอดค้างชำระ';
                          const shareText = `🏛️ แจ้งโอนเงินเข้าบัญชีกองกลาง\n👤 ผู้ชำระ: ${payer}\n🏦 โอนเข้า: บัญชีกองกลาง (${bankInfo.name || 'พร้อมเพย์'})\n🔢 เลขพร้อมเพย์กองกลาง: ${cleanNo}\n👤 ชื่อบัญชีกองกลาง: ${bankInfo.user || '-'}\n💰 จำนวนเงิน: ${amtText}\n⚠️ การโอนเงินทุกรายการต้องโอนเข้าบัญชีกองกลางเท่านั้น`;
                          navigator.clipboard.writeText(shareText);
                          toast.success('คัดลอกข้อความแจ้งโอนเข้ากองกลางเรียบร้อย!');
                        }}
                        className="col-span-2 py-3 bg-slate-850 border border-slate-700 hover:bg-slate-800 text-zinc-300 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5 text-sky-400" />
                        <span>คัดลอกข้อความแจ้งโอนสำหรับส่งในแชท</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-slate-900/80 rounded-2xl border border-slate-800 text-center space-y-2 mt-2">
                    <div className="w-12 h-12 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-500">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-zinc-400">
                      กรุณาตั้งค่าเลขพร้อมเพย์กองกลางที่แท็บ "บัญชีกลางของกลุ่ม" เพื่อแสดง QR Code
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: GROUP BANK ACCOUNT SETTINGS */}
            {bankModalTab === 'settings' && (
              <div className="space-y-4">
                {/* Admin Permission Status Banner */}
                <div className={cn(
                  "p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 border",
                  isAdminUser 
                    ? "bg-emerald-50 text-emerald-950 border-emerald-200" 
                    : "bg-amber-50 text-amber-950 border-amber-200"
                )}>
                  <span className="text-lg shrink-0">{isAdminUser ? '👑' : '🔒'}</span>
                  <div className="text-left">
                    <span className="font-black text-black block text-[13px]">
                      {isAdminUser ? 'สถานะแอดมิน (อนุญาตให้แก้ไขได้)' : 'เฉพาะแอดมินเท่านั้นที่สามารถเปลี่ยนได้'}
                    </span>
                    <span className="text-[11px] text-slate-700 font-medium block mt-0.5">
                      {isAdminUser 
                        ? 'ข้อมูลบัญชีนี้จะแสดงในหน้าแจ้งโอนเงินให้สมาชิกทุกคนเห็น' 
                        : 'สมาชิกทั่วไปดูข้อมูลได้อย่างเดียว หากต้องการแก้ไขโปรดติดต่อแอดมิน (บัง, แป้ง, อั้ม)'}
                    </span>
                  </div>
                </div>

                {/* Field 1: Bank Name */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-black text-zinc-200 uppercase tracking-wider">
                    🏦 ชื่อธนาคาร / พร้อมเพย์ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น กสิกรไทย, พร้อมเพย์"
                    value={bankInfo.name}
                    onChange={(e) => setBankInfo(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isAdminUser}
                    className={cn(
                      "w-full border rounded-2xl px-5 py-3.5 text-sm font-bold transition-all",
                      isAdminUser 
                        ? "bg-slate-900 border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500" 
                        : "bg-slate-900/50 border-slate-800 text-zinc-500 cursor-not-allowed"
                    )}
                  />
                </div>

                {/* Field 2: Account Number */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-black text-zinc-200 uppercase tracking-wider">
                    🔢 เลขที่บัญชี / เบอร์โทรศัพท์พร้อมเพย์ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 123-4-56789-0 หรือ 0812345678"
                    value={bankInfo.no}
                    onChange={(e) => setBankInfo(prev => ({ ...prev, no: e.target.value }))}
                    disabled={!isAdminUser}
                    className={cn(
                      "w-full border rounded-2xl px-5 py-3.5 text-sm font-bold transition-all font-mono",
                      isAdminUser 
                        ? "bg-slate-900 border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500" 
                        : "bg-slate-900/50 border-slate-800 text-zinc-500 cursor-not-allowed"
                    )}
                  />
                </div>

                {/* Field 3: Account Owner Name */}
                <div className="space-y-1.5 text-left">
                  <label className="block text-xs font-black text-zinc-200 uppercase tracking-wider">
                    👤 ชื่อบัญชี / ชื่อเจ้าของบัญชี <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น นายอั้ม ใจดี"
                    value={bankInfo.user}
                    onChange={(e) => setBankInfo(prev => ({ ...prev, user: e.target.value }))}
                    disabled={!isAdminUser}
                    className={cn(
                      "w-full border rounded-2xl px-5 py-3.5 text-sm font-bold transition-all",
                      isAdminUser 
                        ? "bg-slate-900 border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500" 
                        : "bg-slate-900/50 border-slate-800 text-zinc-500 cursor-not-allowed"
                    )}
                  />
                </div>

                {/* Action Button */}
                {isAdminUser ? (
                  <button 
                    onClick={handleSaveBank}
                    className="w-full py-4 bg-sky-600 hover:bg-sky-500 active:scale-98 text-white rounded-2xl font-black text-sm shadow-lg shadow-sky-600/20 transition-all mt-2 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>💾 บันทึกข้อมูลบัญชีกลาง</span>
                  </button>
                ) : (
                  <button 
                    disabled
                    className="w-full py-4 bg-slate-900 text-zinc-600 rounded-2xl font-black text-xs uppercase tracking-wider transition-all mt-2 cursor-not-allowed flex items-center justify-center gap-2 border border-slate-800"
                  >
                    <span>🔒 เฉพาะแอดมินเท่านั้นที่สามารถเปลี่ยนได้</span>
                  </button>
                )}
              </div>
            )}

            {/* TAB 3: THEME & COLOR CUSTOMIZATION */}
            {bankModalTab === 'theme' && (
              <div className="space-y-4 text-left">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border border-purple-800/40 p-4 rounded-2xl space-y-2 shadow-lg relative overflow-hidden">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🎨</span>
                      <span className="text-xs font-black text-white uppercase tracking-wider">ปรับแต่งสีธีมหลัก</span>
                    </div>
                    <span className="text-[10px] font-black bg-purple-600/90 text-purple-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>{themeObj.emoji} {themeObj.thaiName}</span>
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 font-bold leading-relaxed">
                    เลือกจาก 12 ธีมสีสำเร็จรูป หรือกำหนดสีไฮไลท์และโทนพื้นหลังได้เองอย่างอิสระตามใจชอบ
                  </p>

                  {/* Sub-mode Switcher: Presets vs DIY Custom */}
                  <div className="flex bg-slate-950/80 p-1 rounded-xl border border-purple-900/40 gap-1 mt-2">
                    <button
                      type="button"
                      onClick={() => setThemeSubTab('presets')}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                        themeSubTab === 'presets'
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                          : "text-zinc-400 hover:text-white"
                      )}
                    >
                      <Palette className="w-3.5 h-3.5" />
                      <span>🌟 ธีมสีสำเร็จรูป (12 เฉดสี)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setThemeSubTab('custom');
                        if (currentTheme !== 'custom') {
                          handleSelectTheme('custom');
                        }
                      }}
                      className={cn(
                        "flex-1 py-2 px-3 rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                        themeSubTab === 'custom'
                          ? "bg-gradient-to-r from-pink-600 to-amber-500 text-white shadow-md shadow-pink-600/30"
                          : "text-zinc-400 hover:text-white"
                      )}
                    >
                      <Paintbrush className="w-3.5 h-3.5 text-amber-300" />
                      <span>🎨 ผสมสีเองอิสระ (Custom DIY)</span>
                    </button>
                  </div>

                  {/* Open DIY Studio Banner Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsBankModalOpen(false);
                        setIsDIYStudioOpen(true);
                      }}
                      className="w-full py-2.5 px-3 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-between transition-all cursor-pointer border border-pink-400/40 active:scale-98"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
                        <span>✨ สตูดิโอตกแต่งส่วนตัว (สติกเกอร์ / ฟอนต์ / กล่องข้อความ / กรอบรูป)</span>
                      </div>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">เปิดสตูดิโอ ➜</span>
                    </button>
                  </div>
                </div>

                {/* MODE 1: PRESET THEMES GRID (19 PRESETS WITH CATEGORY FILTERS) */}
                {themeSubTab === 'presets' && (
                  <div className="space-y-3">
                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
                      {[
                        { id: 'all' as ThemeCategory, label: '🌟 ทั้งหมด (19)' },
                        { id: 'cyber' as ThemeCategory, label: '🎮 ไซเบอร์ & นีออน' },
                        { id: 'dark' as ThemeCategory, label: '🖤 ดาร์ก & AMOLED' },
                        { id: 'pastel' as ThemeCategory, label: '🌸 พาสเทล & คาเฟ่' },
                        { id: 'nature' as ThemeCategory, label: '🌿 ธรรมชาติ & เอิร์ธ' },
                        { id: 'sunset' as ThemeCategory, label: '🌅 ซันเซ็ท & รอยัล' },
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setThemeCategoryFilter(cat.id)}
                          className={cn(
                            "px-3 py-1.5 rounded-xl whitespace-nowrap text-[11px] transition-all font-black cursor-pointer shrink-0",
                            themeCategoryFilter === cat.id
                              ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400"
                              : "bg-slate-900/80 text-zinc-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                          )}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
                      {(Object.keys(THEMES) as AppTheme[])
                        .filter(themeKey => {
                          if (themeKey === 'custom') return false;
                          if (themeCategoryFilter === 'all') return true;
                          return THEMES[themeKey].category === themeCategoryFilter;
                        })
                        .map((themeKey) => {
                          const t = THEMES[themeKey];
                          const isSelected = currentTheme === themeKey;
                          return (
                            <button
                              key={themeKey}
                              type="button"
                              onClick={() => handleSelectTheme(themeKey)}
                              className={cn(
                                "p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden flex flex-col justify-between group",
                                isSelected
                                  ? "bg-slate-900/95 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-2 ring-amber-400/50"
                                  : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
                              )}
                            >
                              {isSelected && (
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-400/20 to-transparent pointer-events-none rounded-bl-3xl" />
                              )}

                              <div className="space-y-2">
                                {/* Top Row: Swatches & Badge */}
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center -space-x-1.5">
                                    <span 
                                      className="w-5 h-5 rounded-full border-2 border-slate-900 shadow-md flex items-center justify-center shrink-0"
                                      style={{ backgroundColor: t.swatchPrimary }}
                                    />
                                    <span 
                                      className="w-5 h-5 rounded-full border-2 border-slate-900 shadow-md flex items-center justify-center shrink-0"
                                      style={{ backgroundColor: t.swatchCard }}
                                    />
                                    <span 
                                      className="w-5 h-5 rounded-full border-2 border-slate-900 shadow-md flex items-center justify-center shrink-0"
                                      style={{ backgroundColor: t.swatchAccent }}
                                    />
                                  </div>

                                  <span className={cn(
                                    "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border",
                                    isSelected 
                                      ? "bg-amber-400/20 text-amber-300 border-amber-400/50" 
                                      : "bg-slate-800 text-zinc-400 border-slate-700"
                                  )}>
                                    {t.badge}
                                  </span>
                                </div>

                                {/* Theme Title & Emoji */}
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-base">{t.emoji}</span>
                                    <h4 className="text-xs font-black text-white">{t.name}</h4>
                                  </div>
                                  <p className="text-[10px] text-zinc-400 font-bold mt-1 line-clamp-1 leading-relaxed">
                                    {t.description}
                                  </p>
                                </div>
                              </div>

                              {/* Selection Status */}
                              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                                <span className="text-[9px] font-bold text-zinc-500">
                                  {isSelected ? "กำลังใช้งาน" : "เลือกธีมนี้"}
                                </span>
                                <span className={cn(
                                  "text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all",
                                  isSelected 
                                    ? "bg-amber-500 text-slate-950 font-black shadow-xs" 
                                    : "bg-slate-800 text-zinc-300 group-hover:bg-slate-700"
                                )}>
                                  {isSelected ? (
                                    <>
                                      <Check className="w-3 h-3 stroke-[3]" />
                                      <span>เลือกแล้ว</span>
                                    </>
                                  ) : (
                                    <span>เลือก</span>
                                  )}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* MODE 2: CUSTOM DIY THEME GENERATOR */}
                {themeSubTab === 'custom' && (
                  <div className="space-y-4">
                    {/* Quick Action: Randomize & Save to Slot */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleRandomizeTheme}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-600 hover:opacity-95 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98"
                      >
                        <Dices className="w-4 h-4 text-slate-950" />
                        <span>🎲 สุ่มคู่สีสวย (Smart Randomize)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveCurrentToSlot}
                        className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-98 shrink-0"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                        <span>บันทึกช่องสูตรสี</span>
                      </button>
                    </div>

                    {/* Saved Custom Slots */}
                    {customTheme.savedSlots && customTheme.savedSlots.length > 0 && (
                      <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                          <span>สูตรสี DIY ที่บันทึกไว้ ({customTheme.savedSlots.length}/6):</span>
                          <span className="text-zinc-500">คลิกเพื่อเรียกใช้ทันที</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {customTheme.savedSlots.map((slot) => (
                            <div
                              key={slot.id}
                              className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 group hover:border-purple-500/60 transition-all"
                            >
                              <button
                                type="button"
                                onClick={() => handleLoadCustomSlot(slot)}
                                className="flex items-center gap-2 min-w-0 text-left cursor-pointer flex-1"
                              >
                                <span
                                  className="w-4 h-4 rounded-full border border-white/30 shrink-0 shadow-sm"
                                  style={{ backgroundColor: slot.accentColor }}
                                />
                                <div className="min-w-0">
                                  <p className="text-[11px] font-black text-white truncate">{slot.name}</p>
                                  <p className="text-[9px] font-bold text-zinc-400 truncate">{slot.bgTone}</p>
                                </div>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCustomSlot(slot.id);
                                }}
                                className="text-zinc-500 hover:text-red-400 p-1 rounded-md opacity-70 hover:opacity-100 transition-all cursor-pointer"
                                title="ลบช่องนี้"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Section 1: Accent Color Selection with Quick Select Bar */}
                    <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-4">
                      {/* Header + Manual Color Picker & Hex Input */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <label className="text-xs font-black text-white flex items-center gap-1.5">
                          <Pipette className="w-4 h-4 text-pink-400" />
                          <span>1. เลือกสีไฮไลท์หลัก (Primary Accent)</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black text-zinc-300 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5">
                            <span 
                              className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-xs" 
                              style={{ backgroundColor: customTheme.accentColor }} 
                            />
                            {customTheme.accentColor}
                          </span>
                          <input
                            type="color"
                            value={customTheme.accentColor}
                            onChange={(e) => handleUpdateCustomTheme({ accentColor: e.target.value })}
                            className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                            title="เลือกสีด้วย Color Picker อิสระ"
                          />
                        </div>
                      </div>

                      {/* PROMINENT QUICK SELECT BAR (1-Click Standard Palette) */}
                      <div className="p-3 rounded-xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-950 border border-purple-800/40 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-amber-300 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span>แถบ Quick Select (คลิกเลือกสีมาตรฐานด่วนทันที):</span>
                          </span>
                          <span className="text-[10px] text-zinc-400 font-bold hidden sm:inline">
                            ไม่ต้องผสมสีเอง
                          </span>
                        </div>

                        {/* Fast Standard Pills Horizontal Scroll */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                          {STANDARD_QUICK_PALETTE.map((item) => {
                            const isMatch = customTheme.accentColor.toLowerCase() === item.color.toLowerCase();
                            return (
                              <button
                                key={item.name}
                                type="button"
                                onClick={() => {
                                  handleUpdateCustomTheme({ accentColor: item.color });
                                  toast.success(`⚡ เลือกสี "${item.name}" แล้ว!`);
                                }}
                                className={cn(
                                  "px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border",
                                  isMatch
                                    ? "bg-slate-900 border-amber-400 text-white shadow-md ring-2 ring-amber-400/50 scale-105"
                                    : "bg-slate-950/90 border-slate-800 text-zinc-300 hover:border-slate-700 hover:text-white hover:bg-slate-900"
                                )}
                              >
                                <span
                                  className="w-3 h-3 rounded-full shrink-0 shadow-xs border border-white/30"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span>{item.name}</span>
                                {isMatch && <Check className="w-3 h-3 text-amber-400 stroke-[3]" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Palette Group Filter & Full Swatches Grid */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-[10px] font-bold text-zinc-400">
                            จานสีคัดสรรทั้งหมด (Curated Swatches):
                          </span>

                          {/* Filter Tabs */}
                          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                            {[
                              { id: 'all' as const, label: '🌟 ทั้งหมด' },
                              { id: 'standard' as const, label: '🎯 แม่สีหลัก' },
                              { id: 'cyber' as const, label: '⚡ นีออน' },
                              { id: 'pastel' as const, label: '🌸 พาสเทล' },
                              { id: 'warm' as const, label: '🌅 อบอุ่น' },
                              { id: 'nature' as const, label: '🌿 ธรรมชาติ' }
                            ].map((tab) => (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => setQuickAccentFilter(tab.id)}
                                className={cn(
                                  "px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer whitespace-nowrap",
                                  quickAccentFilter === tab.id
                                    ? "bg-purple-600 text-white shadow-xs"
                                    : "bg-slate-950 text-zinc-400 hover:text-zinc-200 border border-slate-800"
                                )}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Swatches Grid */}
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                          {QUICK_CUSTOM_ACCENTS
                            .filter((swatch) => {
                              if (quickAccentFilter === 'all') return true;
                              return swatch.group === quickAccentFilter;
                            })
                            .map((swatch) => {
                              const isMatch = customTheme.accentColor.toLowerCase() === swatch.color.toLowerCase();
                              return (
                                <button
                                  key={swatch.color + swatch.name}
                                  type="button"
                                  onClick={() => handleUpdateCustomTheme({ accentColor: swatch.color })}
                                  className={cn(
                                    "p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer group",
                                    isMatch
                                      ? "bg-slate-800 border-amber-400 ring-2 ring-amber-400/40 shadow-md scale-102"
                                      : "bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                                  )}
                                >
                                  <span 
                                    className="w-5 h-5 rounded-full shadow-md border border-white/20 shrink-0 group-hover:scale-110 transition-transform"
                                    style={{ backgroundColor: swatch.color }}
                                  />
                                  <span className="text-[10px] font-bold text-zinc-200 truncate w-full">
                                    {swatch.name}
                                  </span>
                                  <span className="text-[8px] font-mono text-zinc-500 truncate w-full">
                                    {swatch.color}
                                  </span>
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Background Tone Selector (7 Tones) */}
                    <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                      <label className="text-xs font-black text-white flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-sky-400" />
                        <span>2. เลือกโทนสีพื้นหลัง (7 โทนพรีเมียม)</span>
                      </label>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'pitch_black', name: '🌑 ดำสนิท OLED', sub: 'Pitch Black' },
                          { id: 'midnight', name: '🖤 ดำมิดไนท์', sub: 'Midnight Deep' },
                          { id: 'navy', name: '🌌 น้ำเงินเนวี่', sub: 'Deep Space' },
                          { id: 'forest', name: '🌲 เขียวมรกตดาร์ก', sub: 'Emerald Forest' },
                          { id: 'burgundy', name: '🍷 แดงเบอร์กันดี', sub: 'Royal Wine' },
                          { id: 'slate', name: '🌑 เทากราไฟต์', sub: 'Slate Carbon' },
                          { id: 'light', name: '🤍 ขาวสว่าง', sub: 'Clean Light' }
                        ].map((tone) => {
                          const isToneActive = customTheme.bgTone === tone.id;
                          return (
                            <button
                              key={tone.id}
                              type="button"
                              onClick={() => handleUpdateCustomTheme({ bgTone: tone.id as any })}
                              className={cn(
                                "p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between",
                                isToneActive
                                  ? "bg-purple-950/60 border-purple-400 ring-2 ring-purple-400/40 text-white shadow-md shadow-purple-950/40"
                                  : "bg-slate-950 border-slate-800 hover:border-slate-700 text-zinc-400"
                              )}
                            >
                              <span className="text-xs font-black">{tone.name}</span>
                              <span className="text-[9px] font-bold text-zinc-500 mt-1">{tone.sub}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Live Preview Box */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                    <span>ตัวอย่างแสดงผลสด (Live Preview)</span>
                    <span className="text-amber-400">{themeObj.emoji} {themeObj.name}</span>
                  </div>

                  <div className={cn("p-3 rounded-xl border transition-all duration-300 flex items-center justify-between gap-3", themeObj.cardBorder, themeObj.previewBg)}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-sm shrink-0">
                        {themeObj.emoji}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-black text-white truncate">G.BaanKen System</div>
                        <div className={cn("text-[10px] font-bold truncate", themeObj.accentText)}>
                          {themeObj.thaiName} • กำลังใช้งาน
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={cn(
                        "px-3 py-1.5 rounded-xl text-[10px] font-black text-white shadow-md transition-all shrink-0 bg-gradient-to-r",
                        themeObj.buttonGradient
                      )}
                    >
                      <span>ปุ่มตัวอย่าง</span>
                    </button>
                  </div>
                </div>

                {/* Reset & Storage Info Note */}
                <div className="flex items-center justify-between gap-2 pt-1 text-zinc-400 text-[10px] font-bold">
                  <span>💡 บันทึกอัตโนมัติใน Browser ของคุณ</span>
                  <button
                    type="button"
                    onClick={() => handleSelectTheme('dark')}
                    className="text-zinc-400 hover:text-amber-300 underline cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>รีเซ็ตกลับเป็นสีเริ่มต้น</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>

        <Modal 
          isOpen={isPayModalOpen} 
          onClose={() => setIsPayModalOpen(false)} 
          title="💸 แจ้งโอนเงิน"
        >
          <div className="space-y-6">
            <div className={cn(
              "p-4 rounded-2xl border mb-1",
              isAdminUser ? "bg-emerald-50 border-emerald-200/80" : "bg-amber-50 border-amber-200/80"
            )}>
              <p className={cn(
                "text-[11px] font-bold leading-relaxed text-center",
                isAdminUser ? "text-emerald-800" : "text-amber-800"
              )}>
                {isAdminUser ? (
                  <>
                    👑 <strong>สิทธิ์แอดมิน:</strong> กดอนุญาตจ่ายแล้วระบบจะหักยอดคงค้างทันที <br/>
                    <span className="text-emerald-950 font-extrabold underline">ยอดหนี้จะลดลงและเปลี่ยนสถานะเป็น "จ่ายครบแล้ว" ให้ทันที ⚡</span>
                  </>
                ) : (
                  <>
                    💳 <strong>การชำระเงิน:</strong> เมื่อกดแจ้งโอนเงินแล้ว สลิปจะส่งไปยังแผงแอดมิน <br/>
                    <span className="text-amber-900 font-extrabold underline">เมื่อแอดมินกดอนุญาตจ่าย ยอดคงค้างจะถูกหักออกทันที ✨</span>
                  </>
                )}
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex flex-col items-center">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">ยอดที่ต้องโอน</span>
               <div className="flex items-center gap-3">
                 <input 
                   type="number"
                   value={targetPayment?.payerAmount ?? '0'}
                   onChange={(e) => setTargetPayment(prev => prev ? { ...prev, payerAmount: e.target.value } : null)}
                   className="text-4xl font-black text-sky-600 bg-transparent text-center w-32 focus:outline-none"
                 />
                 <span className="text-lg font-bold text-slate-400">฿</span>
               </div>
            </div>

            {/* Pot Selection */}
            {targetPayment && (
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">เลือกรายการที่จ่าย:</p>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        const personPots = foods
                          .filter(f => f.eaters.some(e => e.name === targetPayment.name))
                          .map(f => f.id);
                      x��}{sם���)�\k�hf��Â (�c�{���Hv����LKӡ����IVTe�����2� 7,�{M�ep����j���_�����G�yv�#��L�D�ӏӿ�{?J�������,�ir�Y�E�{-C�M�h4��$��:�.9=7H��s/A�'a ס�����|�?4���������� Ek^�E���x)���k��I�ր�a仍/��"XD����������,�o����*�6a}+;Iv�S��D5��[��rW��ǋ�:����q�0�]'�t)��^��(�U�G�EZi��ެ�����V:w�(�Z���jN�=�V&���O�T�@9�ubwɍaUVa\<�0a��$���a�u��xg�%_{M�v�%|�Xnz���"z�I���kS�Z��O��q�����9q��^.E�a�$��7�O<�?���g��Vk�ѧ:"�h�<������B����[�xk��C�w��]�ű�]O�G��Â���;�K�M.m�禦P?o;������VO��n���e7>�:n�{�;f|�1���>��}�������w������}�����������w���n/=�\�i�o|��h��08�{�K��5�k�E�7<��p�����S�9*���ƃ�����_��ݻ�� �z�}?��x��l��Q������Vk
�o��k����OC�DN��_Z(��?�~���zҎC�_v�1�z6W�LTa�.u�4����\8�Jb33%�r����n��X����V��{	'|�Z"��.N4����;nR��[��r8v�~����'(�>�܍�Mx��\�p�4\]�]�f�0��o8I��������/����
�v����K�^Ro�'�1�9�Eoe���k���>����So��h9�1���k�;�?6Y�4a+�C�[�-�2)�E��0�����$�����r��e��_,�	�?��6��H����܆~
�ncG�QY��U'����z�ҝ%{;���?�m%;;2���Zis�ݓ��1@�d�l�  [P%��u`���ɮ�e� ������J�8���������-�<VDTV�/�b�j���}��tZ��U�f�1Wz'�����a�����5l8Jj5 s��L[�"{�DƧ�݈���n�g��>��-c����NB����Q!��Uw�g�*Yb���Sӏ_Zlvz�a��*C���oM�(
�X;�Va�ҧ��c�Dd+Ú����k�a�>���!j��؀�� �����q�ö����B���5�:Ral%D��J����[������/h�~���(�+�LLG�"���iP��<�~���֧��KG�:��c�Q�Wh��2�7b�r�X O���}0^��Uv�t�O�r��ļ��86��o��u[�X����-��e|;�A|��}��}t�:��h7�l��s�v~�)?hSҾ���̦�h=���=eo�)��f(߉�M�;��q:�Wt���4��E��vN����?/����䮿��y+�&��^��*/�^U�k�nύ�vV����h�l�1=���IU;Q�Q-\��n۲ˌ� '��#+W�X���+/�YYoeu�S����|����+*�ƎF�����`y����������Q���D|%H�ωd�7Q�E���E�����[�c��oJ(5(_��GCe��3G�|��D�Ĳ�p�K�T�ⷉ�90LW0��Nbt�/�0�C��Ƅ�×��J`���ǘ�������1��U*2P5l���,>lJ����V�x=0}W�����G��b2�	G�F#	�P~��?<g����O(6L�ӏ=���;�o�7h�*юv]\%$�i�6!�O�w����?&��+ć�O�^���_���xK11 }�
`��]�=buVv�Xa�{�̰xvw�wH~së�n�
0e����եe�4�Y �L
MT �LK�:�(k��?���`�P��J�\Q~���c�'��c@��������V!K.份0-1�l=L�!N�c���a~���Ԏ7�$򝍚¨��'
W�)q2�(�zaY���!�� (��
u��K�0X�C� �G^#���{/��d��������%�f,݈���[�����`
��������ʫ�H*6�+3����Ի�I@Bc���}����(�qf�fc��,�/ՍNVz��0Sܧă����U����	�}�A��E��f#�xXd���ߜ�+�\�~���%�	��)�	���N�R�%�< ����g���a�y�7p~U��i����������h:�ʢ󨥢�h�]Wg�58Wv�$�»qǸE�k�X0��u���Qo�M��0�'���R���'�r; �󱏎-`��_Sn� .�f�pp��t����ZN���0Ӝ��hLyv��ƴ��:���Q�0�z�f���E�ݷ̧:~�8v��J�����
Ѥ������۶>�kc �/���o,�a�217#�R��YNB����$nZ���eus~
��k$�u���Q�'�a�����P��[q.\Z���yy;k$�Bz��Z����=8�,�d���(	e��_��� ��)U���BbX���[��-��hRB&���ng�V*�9�����SA�Oϸ+����7�pj͸�/q�}����%0�L0��S*��;�8I��ҝSC�X/�������D�}�9M�jNO���(K*;��ژ{�������VW�u�7Z��c.9�a<�F��״N�>r dk���$���+��2M�Im���Q�O\��������TX?"ǷEjl4C���F.�T�.]�G�T�b�s2�gh��@��UQm��H���b	� dv�ik�+�\��-
U��ɛ��M���rf�l3f���b�LѾ�cG�z��?a��j���}4�����܃���+Y���\z{-��v1"���2K�T�/���>��B�7�����<�F�txÙʚ�t|�d�xq/K/���Ei0J�9 ���P|u=�jZ�Þ�F�h�:��S%���=���35���.%���e��B� ;�\%�7a���z��n)gif�� �O�_w�O��J��Stؽ�����5��.��Ǆvo�k��`���0��0m��reT�88�$ƿD�cz����/��<7�X�������k< Oݻ�]R����Ԝ���s���Q�u2�Vjڢ*d�;���p.�%��z		C|�d�L;g (pG�`�F/ĳ��?V4h����ݩd���En`%�����Q���m��W�cLޜS��ۻ�B]�9s�1�!���e����(�6	d����z����'�	v�� ���C���\"�W��O�Q�R/�1��ݽ��Ի��k���7w�e.Ĝ)��$�|�WnV���T���=���NFk�u_w�]F�]$@��,#�,�6_��O�:��j�`�E	3[kХ�E�Kt��e�	3�:�f�(�B�w��S�$�7�U/ńv�m�^�@��JvaM�'j���5���Kb(|D��"�o��1�� ycPҜWgӸzcځA���yE���w�������Z��DFMr+�\7��Gr���_a&F�p���0B݃�%/L7�Z�P���T2f��Gu�@�5��@PHm�f��y��v���Zw.����a�1 
�"��K5�A�2�=,V��2�E�����*|U�y,Cb\��osO�k`m<!�ǟ�:Ił�Q��%�:Z��[�veb�HuZyƜh- l��,�Y����`7Ye�p_.���^��!���h9��X0��̈��z"�w�'�e�5̉r-������w�u�0P�ے�%S ~�=����)��
jΓ!��I���9ã�^��M��)�(WAP{�-˧ �%Ѫ�c\�ʥ
q�^�Ax$K�is����0G3�a�#e��U ���~-)��>R�7	G��_��w��j���M��U��K�;�hG�c��e�rS�{�W��lꥻ�_E�>Q}G$w�B�<�X��'1}��ه�h�M���3y�r�.����C�W�#>S�[Q��VH6s؜�Ť���b�(若�j[�Y"���p4ۡk�q]����������qZ�f~�)�A��O�X�������^(oI�h	G��4���e��iRf�קk;�� le����M��c6EVTѤ�G��$)S���i���),ݬ��^�n�y�����g���b�m�5�#�_n���,�DF_$b˥+��f�1J�7Q�a=��]͔9��Y��qnB&(����ر��'�g�0�U6� �A�������;t3���9�4����Йu�0�274Ac�g�]B�Aa��X�����p��0��.�uP�e�}���%����,�b&9L�Ӳ|Z(�ϡ4������iD�ހ�L�*E�YɊѵeK�� O��HJ�A�enDx;�.�7^#F��f��n��=B�#�	Ӄ.;~
�u�`�ua�҅.&����]fb)n�j�r���zō�B��:3ie6G��T�� �#�n����H�O�̥�K�!�Jś/|a�s�9vP�6T�2$��@Z���]r���Ư>bćK��u�q[�g@�G�FǸ�{�|X35	v�E���jV&m���;�m�LT�ELrV��8\K ��!� l�{�;V'�!��Yi�t!d�D7M�PiD�hx^X0xQQΐ
�+Ru�(���v%��S�����$7��8\\�MO��<�����"4�z��<���T��'0�<��p%�5r�9+`��蓻Vp�c5V����!*��8'?'�b����F0��������}b����)D�������ot],���W���!�-�A�E�#��1^����X���v�������X��ws>�����B�}�i_�4r���d.j�I��}�&�>���<����s]�� �m�ۢiĖ���kw�vyx���n�6�>t��Jx&LA\q��8�=-^R.>�𜞭�jXYvBnZ��%�J ��vr+�-�Y⒜��q�tA1Q��OҺ7	�T�cNG+Ă��� �,���9#�VjV�]u�\�V�4���,Z�)�X��T�p�ػ+�$m$�v�M�ڸ� ����i�chE-V)�,�㫔'�$(T֍3(1������P���w
r]�uC%�5��"o�k���E��y���%�M�����mb�*��Ϝ:�"�u�[�n����!h:��h�}����1S,yѢ����L��V����r���\!Z�-������/J���A�`F8��K/L�U�)V~�d�d��5^ w]�h^K�i4JE�j�`Y�,��X��ND;�0��uY�d
��mu���l����t� ZP��UW����5%��"�TZ�u%Bw �t(P����G$����h �)s��S���)+p,���N$�+7�XuX$��<��H�h�Bh���N�kT�"��`NBM�����s��;s�5�!V��e6��v�6;�n۴�K��P��ʲ�k�l���W���2n^�f���gߜ�/��V�Q�s��6u��F��;��JM�r�ǀ����_��6jz
��G}N¤p��>��+ȗ��	�V%k�5�����9������K����'^�/�����J[$�yt��z�J=�n���}�p�ê��(Bo�k��:����Cfټ���=�n��U]+Ԯ(��"޶�+VO'6K���?X����&'��O�fr���΀J#�q�.6@�F�YI�K���2�3��U@�BW1C+F��J~4�S�H�X؂���)u	)�u�Ն�cl�)��\h����t(��Y�%�����r}F�elJ��4�:�c~�_��d�$�dXSS������P���u���s�XZz��{o�g�]'f�n��8��r�S�l(?��0��M�UB�DZ������;�O��U�G��9&�U0{VW�C�X���A�x���7�Z��=|�;�Y:����#i�o&��<!�ϑ���Ȫ�㳣��L��d[�GM�6�k����P�g��bG�k��<e�k���ɑ+��v��A����2�/�y��>��HOi�,1���Oz�{�����m:��y��gQ< ���@��Dd4eN�}G�^��_�WY!29�*��ܿ�����'e��Γ0�a4@^Ҩ�	�SiXOgj1��2�GI�[��-���7�#����gw�x��
���DЉClax~N������nW��U�H)�a_�x/^a��ڧ�lx5�wռ�.؁M�-9�	(�����C�1PNޥ	�La����V��gay��,v��0��K�"��u�j��M~ĠFȿ�O˾\�˕LHj�ڭ�2�7!�*7E��Cu2g�b�)�bhaɸdKA�x��z�T딈���H�h�h|� <��v!˗�X螐�Q���bV��3�$����K�B¬�0��7︗=l��Nƨ^�ƴ���lmA>r
F��A/��X�ٟ�m�f`������co�?@���vIi�����!������7߽���c�T/h����և<li@�`�D���ͧ��l��S<��~J�r�1'o���A� ¨x�����5�#��gDp]�Y�J��l��Ho�kø
Z���(Z��;[�8���I*�S�
��t����*m�óŁ<�[`��1��*�
�u��G��	_�Z�l���س8M=�B��ALh=�a9���8�GD���1Ii��Sga����a�)$�N��#�54Q@W�U�ִc����ײ������U����ӏjt�l�����t擗o��L��T��~w�����&�q��7���:{���a��W2��;N�lYŷ0��5�Q<�����6���!'��H
�=V�k���cc�����o��S������t�j�~�\t��n01�~��۸Ϛ�c�emӺ1<�[}��{�`s���|��<ߩ۹&f׽����4pӗ�PW�9�2��_N� ��t	�E ��}���@�^�?"is�Hۇ]従���a�q^�+ͪ�|�̀j��<E����ͫ��c04F��=wԸ�������X/�t�(�%�E?s� cJU�S�J�
��S�'0�n4�ɭN�n����o�v�&V���#��E�X/S���]oh��H�w����1{;>.p[�y�� <�
+V�HTO��*}H�YI��O2zR��'�E����6��f�=�h_�
�F6o9�)<��X6�(&�}l����W�؇w���c"�[��B�*)��Dc*�QW��:�(|.W���UΠؕ1��"nL�	�Jȶ{�\�$�ȁ���\�ְt䌈�v�gE_����<&uE��ߐ�YV�r�=Q%��J���~�l�4���s+�*!�*�!X���ozE�K���;Aes"�9k���@Z\�1օzS�ј��C��$+LB�

Ku~@��0�D���sl���0� DE�����y�h�]]F�ME�}��0�A4�&��&ߌw�4J�4���ԣح;�__�uu���dc&X��W���g�^���?�pϩ�N�N7�~���ĸ)�8�/�9���&Q"����+�i8$v���� N[�� �K3Z�r��Z�cy+	&`��z4#u��r��*�nX8�2\��I����QBQ �\vw��1�β���[�6t��O�D7�k$�|⬺C�<�7���^P��t�B�K���Y*�r+6˟,�i6�n*uN%����]�
3�7Ȍ%hV��M�;1yI��yN���#N|�|�
c�*�:f��4����jt�r��4�Ͽ�ŋsST�l	T�v�^�G\��r�3T[���Er�f�BB����Z3�x��d5���J��?���z�Z��$p�TCa3l���\Q)�V��G��o�`l��FbN���\���4�UPn��ؔ��2)i��	�d6(G �Q�x�څ� ѥ��Ty�+�	��K��tv;3������o�Ê�9<�{���5BX.��GֹW�;������l
�����мkq����!4�!�4��Ė�۟�!Z>T�d��4r9��T�_�S?@�3쏞}V�O�+:%�e�d�9���e�8`����O��P:U��Y	��A����NNy[T�YIƀ&Qk���铮�c��P�Ñ�)��g_�2%t�RdC�nq1��8}��ޠ΂��th��ϸ'e[VE
�Dms��vn��	��S��g����R^���O�	���������L���o�|kf��<U�9/��W_��t������tʌ+��h���i�}��9��c�2������j���[�u?b��U��+J}9)u��RM���qn�����y2������������zײ��}�|ݣ�}���g=�pq.�(ԉ�
�B:2Uߚ,ą-���T�W<}�*�6��_�-AAt��1��z����$�"W�j�W��j��(�4ħ+_������%>^!v�}n��J΁��J*�3��7%RPt;9�A\����*�{�*��'^)�5����J��=a<VT_�,��&�įJg�k�Uc��=���ڷ�P��=�s����Z�D<֗�� �ph���@QWi�VYL�0<S�j�Jb���ʭ!��;�eV�-N{W��R��̥gw���N\vR'F�1��a�g��¨�wܠ?`���
.b��|�m�4,��r�Ż���3�-3�o�'y����.��+���'���gf	��ys�N�������p�3 �`p\���U��F#
VȈ�����|�!kP7���x^�A�\w��b/�ψ�Eļ�_r�q�B�'�ٴ���ԈL����iW�.ť��qӛA���n�Nkk����ݥ�V�À����� ����ǵ���< AiJ^�� ��[A�CrN��S�\�Q��
�q�3�Q�6 i?L����*7l@!�>u�S?y&j��������|֛�]�MG�CBX�R�x����T)�(�G�"U�4/*�/
�dp�kRGO:�~�~���,�F�.�sB����ua�J��æ�7�8!r��w+\�?j`e|qq�hv�u�4��EC˅��Ŭ��ṓ,O_���XUU��4�4��T��u�<r�H_C4y`9%����_�b��#�bb1Xh/dt(����۲����h˘�Tt�D
�]��=fE�5����Y�����"
;�w�P[E�4��Ҋ�,�k��a:F �V��َ��{���?EE�ă��˴��˃a�ygU�j	��뭂bsFˊj0���<o����o�as�����y�(u���Yߋ�́r>����65V�j(ub��u��ݕ�M]���N��F�����S�/�Q2��D�e�R��@l�\x�K�0�������� H0��v���
�%g��+@��Qb��(�[��3���SZ*����� �(��1"�{�`��#�RNx�L�ڮH�����n`��wԴb��Ѓz/���>�>�����r�'�Ӳ�e,2;1~�e����BҪ	/A�W^�y��/nn�0r�^�qMM"b��'>Қ21j��H�v:�v�\i��]�ҡ�hj��d�������f�^mE1W�	i��P���ج����#��s��ya�wY��e7]s��RG޵�WK�mƂ��	�0m[��e����j���k�@M�0��~�	S�������G�ݖu��F`�
]��-Z�i� �SyoZ�F��j��lM| ~��-cI$Y������y�:���_�Z��l-���n+�r� '�fK���+P)����@J|,�۪��hݎR�a�`^b�b�V@�
w��lcETnd%zv�Ҕ�^�Uef��"�R��K!�ٛ�PoDĖ��l�?��F��j7�@� aiͧ�ܺ�xI�;�ʨ�;���w���h��_3���a�M'ix:��l
3Fj[����PP�u��z���	ֈ�nM��5�(�C�W�`[(��<&
5!N�d,j��M�g����?ſZ_fp��:�Q,���@sJ����EV_:?%�Е
�P&a͖���C��q��0�H�x0�������E��<��ÐD��2�~t��S�]����Ȍ��/~�
D:���~,�N����'ݗJN�4�ǜB��`S��\����5[���e֧ac,��(d�����h�
ж��P��[g���33������Mǃ(L��i�]RӋ m��3��v7g�0f#�����f1l�)�����g\�<v�lX�X�s��Y)�G�������Aǿ������!a�_D3y`�+P�"��C��^�6|7XM���.P��BL�������0W΅0;��!���	s١�����+ߔ�0�2���Yco�E3T�P���޾gc�%ʰ�¥V��[H��zy��2�YvG͐~����p�����-U�&2rL�falLw�0�h����6����4��m%��$5����ڑIi�v��9��]�%>�G�Z�A
b@�ͥ��Ȇ�,a���'0�*G-�n�v꽳�j=Ba�Xb�ퟒ<�:g��$���~�)@���+y�_Y���H?�̘�-DӖ	f��k����L��(s��&.�)P������T��q�uDf,��.��ć�Ƙ�߅Bm����R��zΘ� ��S�ʵ��4����B����06��,�.+��=s;G�U��z�����g�[�aoC��/d���#��U���[�6���k�����rj�:��V��B�&�d��l� �{�_�^T� ���{^@�%S]�6��D��['��A2����V2���]d�b6�N��9��l⁵��s��ʻ�ٸ���4sk$	���Еgzb䘡J֠}&�L�@nhQ�Nr��B2rO[����B���:�i�l@	�Zu�c���icfۀ]��U�r����E�w���%���D㰟��|�YQ�*ȇ+����R�d�-�U�v]|Ȱ�{N�w�aTW�<WL�;`��M�@��	����´5�l��C�=-]I
5?���������H>5w=X�Xv��ǴTp%h�g�g�y���/� {�W��ȫ;�����0����=j�����C���	�3�hʟ!����'���ُK�_y ���;��;^�s��r5u,C|����O�uӓ�9¢������u�eKk��;���0X�V�-6�>�ϴ |�Ⳑ�(�6B� ٟ��n���  �� Q_5