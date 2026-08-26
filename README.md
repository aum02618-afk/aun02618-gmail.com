# 🍲 แอปหาค่าต้ม G.BaanKen - คู่มือการติดตั้งและ Deploy บนโฮสติ้งภายนอก

แอปพลิเคชันระบบหารค่าต้ม ค่าอาหาร ค่าน้ำ ค่าไฟ และค่าใช้จ่ายส่วนกลางของกลุ่มเพื่อน รองรับระบบคำนวณแบบสัดส่วน แจ้งโอนเงิน แนบสลิป อนุมัติยอด และเชื่อมต่อฐานข้อมูล Firebase Firestore แบบ Real-time

---

## 📥 1. วิธีดาวน์โหลดโค้ดทั้งหมดออกจาก Google AI Studio

คุณสามารถดาวน์โหลดโค้ดโปรเจกต์นี้ทั้งหมดได้โดยตรงจากหน้าจอ Google AI Studio ดังนี้:
1. กดที่เมนู **Settings / เมนู 3 จุด (⋯ หรือ ไอคอนแชร์/ส่งออก)** ที่มุมบนขวาของหน้าจอ AI Studio
2. เลือก **Export** > **Download ZIP** เพื่อบันทึกไฟล์โค้ดทั้งหมดลงในเครื่องคอมพิวเตอร์ของคุณ
   *(หรือเลือก **Export to GitHub** เพื่อส่งโค้ดขึ้น Repository บน GitHub ของคุณโดยอัตโนมัติ)*

---

## 🛠️ 2. สิ่งที่ต้องเตรียมก่อนติดตั้ง (Prerequisites)

- **Node.js**: เวอร์ชัน 18.x หรือ 20.x ขึ้นไป ([ดาวน์โหลด Node.js](https://nodejs.org/))
- **npm** (มาพร้อมกับ Node.js) หรือ **bun / yarn / pnpm**

---

## 🚀 3. วิธีติดตั้งและรันในเครื่อง (Local Development)

1. แตกไฟล์ ZIP และเปิด Terminal / Command Prompt ในโฟลเดอร์โปรเจกต์
2. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```
3. คัดลอกไฟล์ Environment Variables:
   ```bash
   cp .env.example .env
   ```
   *(หากมี LINE Notify Token สามารถใส่ค่า `LINE_NOTIFY_TOKEN=...` ลงในไฟล์ `.env` ได้)*
4. เริ่มต้นเซิร์ฟเวอร์สำหรับ Development:
   ```bash
   npm run dev
   ```
5. เปิดเบราว์เซอร์แล้วไปที่: `http://localhost:3000`

---

## 📦 4. การ Build และรันสำหรับ Production (Production Build)

1. สั่ง Build โปรเจกต์:
   ```bash
   npm run build
   ```
   *(ระบบจะคอมไพล์ Frontend ด้วย Vite ไปไว้ที่โฟลเดอร์ `dist/` และคอมไพล์ Backend `server.ts` เป็น `dist/server.cjs` ด้วย esbuild)*

2. เริ่มต้นรันเซิร์ฟเวอร์แบบ Production:
   ```bash
   npm start
   ```
   หรือ
   ```bash
   node dist/server.cjs
   ```

---

## ☁️ 5. วิธีการ Deploy ขึ้นโฮสติ้งภายนอก (Hosting Options)

### แบบที่ A: Cloud PaaS (Render / Railway / Fly.io / Koyeb) ⭐ แนะนำ สะดวกที่สุด
1. นำโค้ดขึ้น GitHub Repository
2. เชื่อมต่อ GitHub Repo กับ Render หรือ Railway
3. ตั้งค่าการ Build & Start:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/server.cjs` (หรือ `npm start`)
   - **Environment Variables**: กำหนด `NODE_ENV=production` และ `PORT=3000` (หรือปล่อยให้ระบบกำหนดให้อัตโนมัติ)

---

### แบบที่ B: VPS / Cloud Server (Ubuntu, Debian, CentOS, DigitalOcean, Linode)
1. อัปโหลดไฟล์ขึ้นเซิร์ฟเวอร์ หรือ `git clone` โค้ดลงบน VPS
2. ติดตั้ง Node.js 20 และ Dependencies:
   ```bash
   npm install
   npm run build
   ```
3. ใช้ **PM2** เพื่อให้เซิร์ฟเวอร์ทำงานตลอดเวลาใน Background:
   ```bash
   npm install -g pm2
   pm2 start dist/server.cjs --name "baanken-app"
   pm2 startup
   pm2 save
   ```
4. ตั้งค่า **Nginx Reverse Proxy** ชี้โดเมนของคุณมาที่พอร์ต `3000` (พร้อมเปิดใช้งาน HTTPS ด้วย Let's Encrypt / Certbot)

---

### แบบที่ C: Docker Container
โปรเจกต์นี้มีไฟล์ `Dockerfile` พร้อมใช้งานแล้ว คุณสามารถ Build และรันด้วยคำสั่ง:
```bash
docker build -t baanken-app .
docker run -d -p 3000:3000 --name baanken-app baanken-app
```

---

## 🔒 6. ข้อมูลการเชื่อมต่อ Firebase Firestore

ไฟล์ `firebase-applet-config.json` มีการตั้งค่าเชื่อมต่อกับ Firestore Database และ Storage ไว้เรียบร้อยแล้ว เมื่อนำไปรันบนโฮสติ้งภายนอก ระบบจะสามารถอ่าน-เขียนข้อมูลแบบ Real-time ได้ทันทีโดยไม่ต้องแก้ไขโค้ดเพิ่มเติม
