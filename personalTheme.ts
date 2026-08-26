export type DecorationType = 'emoji' | 'image' | 'badge' | 'custom';
export type DecorationAnimation = 'none' | 'float' | 'bounce' | 'pulse' | 'spin-slow' | 'wiggle';
export type DecorationBorder = 'none' | 'gold' | 'neon' | 'rainbow' | 'white' | 'circle' | 'glass';
export type DecorationAnchor = 'page' | 'screen'; // 'page' scrolls with content (pins to member names/cards), 'screen' fixed to viewport

export interface PersonalSticker {
  id: string;
  type?: DecorationType;
  icon: string; // emoji or fallback icon symbol
  imageUrl?: string; // custom image url, uploaded base64 data, or gif
  text?: string; // custom text badge or member nickname tag
  x: number; // percentage from 0 to 100 (relative to container/page)
  y: number; // percentage from 0 to 100
  size: number; // in pixels (e.g. 24 - 240)
  rotation: number; // -180 to 180 degrees
  opacity: number; // 0.1 to 1
  label?: string;
  isLocked?: boolean; // individually locked in place
  anchor?: DecorationAnchor; // 'page' (scrolls with page, perfect for member names/cards) vs 'screen' (fixed)
  animation?: DecorationAnimation;
  borderStyle?: DecorationBorder;
  bgColor?: string; // for custom badges
  textColor?: string; // for custom badges
  zIndex?: number;
}

export type PersonalFontFamily = 'sans' | 'kanit' | 'prompt' | 'mitr' | 'itim' | 'chonburi' | 'sarabun';
export type PersonalBgPattern = 'none' | 'dots' | 'grid' | 'stars' | 'bubbles' | 'sakura' | 'waves';
export type PersonalCardStyle = 'solid' | 'glass' | 'neon' | 'rounded' | 'retro';
export type PersonalAvatarBorder = 'default' | 'rainbow' | 'gold' | 'neon' | 'blossom' | 'cyber' | 'diamond';

export interface PersonalChatBubbleConfig {
  myBubbleBg: string;
  myTextColor: string;
  otherBubbleBg: string;
  otherTextColor: string;
  bubbleRadius: 'sm' | 'md' | 'lg' | 'full';
  bubbleGlow: boolean;
  fontSize: 'xs' | 'sm' | 'base';
}

export interface PersonalDIYConfig {
  fontFamily: PersonalFontFamily;
  bgPattern: PersonalBgPattern;
  cardStyle: PersonalCardStyle;
  headerTitle: string;
  customBadge: string;
  avatarBorder: PersonalAvatarBorder;
  chatBubble: PersonalChatBubbleConfig;
  showStickers: boolean;
  lockStickers: boolean;
  stickerAnchorDefault?: DecorationAnchor;
}

export const DEFAULT_PERSONAL_DIY: PersonalDIYConfig = {
  fontFamily: 'kanit',
  bgPattern: 'stars',
  cardStyle: 'glass',
  headerTitle: 'G.BaanKen',
  customBadge: '🎨 สไตล์ส่วนตัวของฉัน',
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
  showStickers: true,
  lockStickers: false,
  stickerAnchorDefault: 'page',
};

export interface StickerCategory {
  id: string;
  name: string;
  icon: string;
  items: { emoji: string; name: string }[];
}

export interface ImageDecoPreset {
  id: string;
  name: string;
  url: string;
  category: 'crown' | 'badge' | 'deco' | 'cute' | 'gaming';
  defaultSize: number;
}

export const PRESET_DECO_IMAGES: ImageDecoPreset[] = [
  {
    id: 'crown_gold',
    name: '👑 มงกุฎทองคำจักรพรรดิ',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop&q=80',
    category: 'crown',
    defaultSize: 52,
  },
  {
    id: 'sparkle_stars',
    name: '✨ กลุ่มดาววิบวับ',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80',
    category: 'deco',
    defaultSize: 64,
  },
  {
    id: 'sakura_blossom',
    name: '🌸 กลีบซากุระหวาน',
    url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=200&auto=format&fit=crop&q=80',
    category: 'deco',
    defaultSize: 58,
  },
  {
    id: 'neon_flame',
    name: '🔥 เปลวไฟนีออน',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200&auto=format&fit=crop&q=80',
    category: 'gaming',
    defaultSize: 60,
  },
  {
    id: 'cyber_badge',
    name: '👾 ตราสัญลักษณ์ไซเบอร์',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    category: 'badge',
    defaultSize: 56,
  },
  {
    id: 'cafe_latte',
    name: '☕ กาแฟ & ชิลล์',
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&auto=format&fit=crop&q=80',
    category: 'cute',
    defaultSize: 54,
  },
];

export const PRESET_NAME_BADGES = [
  { text: '👑 หัวหน้าก๊วน', bg: '#f59e0b', textCol: '#ffffff', label: 'มงกุฎหัวหน้า' },
  { text: '💎 MVP ประจำต้ม', bg: '#06b6d4', textCol: '#ffffff', label: 'MVP ต้ม' },
  { text: '🍵 สายต้มเบอร์ 1', bg: '#10b981', textCol: '#ffffff', label: 'เซียนต้ม' },
  { text: '💸 โอนไว ไร้หนี้', bg: '#8b5cf6', textCol: '#ffffff', label: 'โอนไว' },
  { text: '🔥 ตัวตึงประจำโต๊ะ', bg: '#ef4444', textCol: '#ffffff', label: 'ตัวตึง' },
  { text: '✨ น่ารักที่สุด', bg: '#ec4899', textCol: '#ffffff', label: 'น่ารัก' },
  { text: '⭐ VIP Exclusive', bg: '#eab308', textCol: '#000000', label: 'VIP' },
  { text: '🍗 สั่งแหลก แดกยับ', bg: '#f97316', textCol: '#ffffff', label: 'สายกิน' },
];

export const STICKER_PACKS: StickerCategory[] = [
  {
    id: 'crowns_ranks',
    name: '👑 มงกุฎติดชื่อ & ตำแหน่ง',
    icon: '👑',
    items: [
      { emoji: '👑', name: 'มงกุฎทอง' },
      { emoji: '👸', name: 'มงกุฎเจ้าหญิง' },
      { emoji: '🤴', name: 'มงกุฎเจ้าชาย' },
      { emoji: '💎', name: 'เพชรยอดมงกุฎ' },
      { emoji: '🏆', name: 'ถ้วยแชมเปียน' },
      { emoji: '🥇', name: 'เหรียญทอง' },
      { emoji: '🎖️', name: 'เหรียญเกียรติยศ' },
      { emoji: '⭐', name: 'ดาวทอง' },
      { emoji: '🌟', name: 'ดาวประกาย' },
      { emoji: '✨', name: 'วิ้งวับ' },
      { emoji: '🕊️', name: 'นกพิราบสันติ' },
      { emoji: '🕊️', name: 'ปีกนางฟ้า' },
    ],
  },
  {
    id: 'cute',
    name: 'สัตว์น่ารัก & สัตว์เลี้ยง',
    icon: '🐱',
    items: [
      { emoji: '🐱', name: 'แมวเหมียว' },
      { emoji: '🐶', name: 'น้องหมา' },
      { emoji: '🐰', name: 'กระต่าย' },
      { emoji: '🐻', name: 'พี่หมี' },
      { emoji: '🦊', name: 'จิ้งจอก' },
      { emoji: '🐸', name: 'กบน้อย' },
      { emoji: '🐼', name: 'แพนด้า' },
      { emoji: '🐥', name: 'ลูกเจี๊ยบ' },
      { emoji: '🐨', name: 'โคอาล่า' },
      { emoji: '🦄', name: 'ยูนิคอร์น' },
      { emoji: '🐧', name: 'เพนกวิน' },
      { emoji: '🐹', name: 'แฮมสเตอร์' },
    ],
  },
  {
    id: 'sparkle',
    name: 'ประกายดาว & อารมณ์',
    icon: '✨',
    items: [
      { emoji: '💖', name: 'หัวใจประกาย' },
      { emoji: '✨', name: 'วิ้งวับ' },
      { emoji: '🌟', name: 'ดาวทอง' },
      { emoji: '🔥', name: 'ไฟแรง' },
      { emoji: '🎉', name: 'ฉลอง' },
      { emoji: '💎', name: 'เพชรวิบวับ' },
      { emoji: '🌸', name: 'ซากุระ' },
      { emoji: '💫', name: 'ดาวหมุน' },
      { emoji: '🍀', name: 'โชคดี' },
      { emoji: '🌈', name: 'สายรุ้ง' },
      { emoji: '🎀', name: 'โบว์ชมพู' },
      { emoji: '❤️‍🔥', name: 'หัวใจไฟลุก' },
    ],
  },
  {
    id: 'food',
    name: 'คาเฟ่ & ของอร่อย',
    icon: '🧋',
    items: [
      { emoji: '🧋', name: 'ชานมไข่มุก' },
      { emoji: '🍰', name: 'เค้กสตอเบอร์รี่' },
      { emoji: '🍣', name: 'ซูชิ' },
      { emoji: '🍓', name: 'สตรอว์เบอร์รี' },
      { emoji: '🍕', name: 'พิซซ่าชีส' },
      { emoji: '🍔', name: 'เบอร์เกอร์' },
      { emoji: '🍦', name: 'ไอศกรีม' },
      { emoji: '🍫', name: 'ช็อกโกแลต' },
      { emoji: '🍜', name: 'ราเมง' },
      { emoji: '🥑', name: 'อะโวคาโด' },
      { emoji: '🍩', name: 'โดนัท' },
      { emoji: '☕', name: 'กาแฟสด' },
    ],
  },
  {
    id: 'gaming',
    name: 'เกมเมอร์ & ไซเบอร์',
    icon: '👾',
    items: [
      { emoji: '👾', name: 'สเปซมอนสเตอร์' },
      { emoji: '🕹️', name: 'จอยสติ๊ก' },
      { emoji: '👑', name: 'มงกุฎทอง' },
      { emoji: '🏆', name: 'ถ้วยแชมป์' },
      { emoji: '💯', name: 'เต็มร้อย' },
      { emoji: '🚀', name: 'จรวดซิ่ง' },
      { emoji: '⚡', name: 'สายฟ้า' },
      { emoji: '🎯', name: 'เป้าหมาย' },
      { emoji: '🛸', name: 'ยูเอฟโอ' },
      { emoji: '🎧', name: 'หูฟังเกมมิ่ง' },
      { emoji: '⚔️', name: 'ดาบคู่' },
      { emoji: '🛡️', name: 'โล่ป้องกัน' },
    ],
  },
  {
    id: 'pins',
    name: 'หมุดปัก & ป้ายข้อความ',
    icon: '📌',
    items: [
      { emoji: '📌', name: 'หมุดปักแดง' },
      { emoji: '🏷️', name: 'ป้ายแท็ก' },
      { emoji: '💡', name: 'ไอเดียปิ๊ง' },
      { emoji: '🎵', name: 'ตัวโน้ต' },
      { emoji: '🧸', name: 'ตุ๊กตาหมี' },
      { emoji: '💰', name: 'ถุงเงิน' },
      { emoji: '💵', name: 'ธนบัตร' },
      { emoji: '🔥', name: 'ยอดฮิต' },
      { emoji: '⭐', name: 'ติดดาว' },
      { emoji: '🪄', name: 'ไม้กายสิทธิ์' },
      { emoji: '🪴', name: 'กระถางต้นไม้' },
      { emoji: '☕', name: 'พักเบรก' },
    ],
  },
];
