# 🦁 เกมเปิดป้ายทายสัตว์ผสม (Peechy Game Show Edition) 🐾

เว็บเกมเปิดแผ่นป้ายจิ๊กซอทายภาพ **หมวดสัตว์ผสม (Hybrid Animals / Chimera)** จำนวน 10 ข้อ ได้รับแรงบันดาลใจจากสไตล์เกมโชว์ใน TikTok ของครีเอเตอร์ชื่อดัง [@peechy_game](https://www.tiktok.com/@peechy_game) 

ออกแบบด้วย UI สวยงามระดับพรีเมียม (Neon Game Show / Glassmorphism) พร้อมระบบเสียงสังเคราะห์ Web Audio API ครบครันในตัวโดยไม่ต้องต่อเน็ตหรือโหลดไฟล์ภายนอก

---

## ✨ จุดเด่นและฟีเจอร์เด่น (Features)

1. **หมวดสัตว์ผสมสุดสร้างสรรค์ 10 ข้อ (10 Unique Hybrid Animals):**
   - ข้อ 1: **กริฟฟอน (Griffin)** = สิงโต 🦁 + นกอินทรี 🦅
   - ข้อ 2: **แมวฮูก (Meowl)** = แมว 🐱 + นกฮูก 🦉
   - ข้อ 3: **ช้างผีเสื้อ (Ele-fly)** = ช้าง 🐘 + ผีเสื้อ 🦋
   - ข้อ 4: **วาฬกวิน (Peng-whale)** = เพนกวิน 🐧 + วาฬเพชฌฆาต 🐋
   - ข้อ 5: **คอร์กี้เป็ด (Duck-Corgi)** = คอร์กี้ 🐶 + เป็ด 🦆
   - ข้อ 6: **จระราฟ (Croc-o-raffe)** = จระเข้ 🐊 + ยีราฟ 🦒
   - ข้อ 7: **เสือผึ้ง (Bumble-Tiger)** = เสือโคร่ง 🐯 + ผึ้ง 🐝
   - ข้อ 8: **มังกรต่าย (Dragon-Bunny)** = กระต่าย 🐰 + มังกร 🐉
   - ข้อ 9: **ม้าฉลาม (Shark-Horse)** = ม้า 🐴 + ฉลามขาว 🦈
   - ข้อ 10: **แพนด้าเลียน (Panda-leon)** = แพนด้า 🐼 + กิ้งก่าคาเมเลียน 🦎

2. **ระบบเสียงสมจริงครบวงจร (Web Audio API Synthesizer):**
   - 🔊 **เสียงตอนเปิดจิ๊กซอ (Tile Pop):** เสียงคลิกและป๊อปแบบไม้/พลาสติก ปรับระดับเสียงไมโครทูนนิ่งตามตำแหน่งแผ่นป้าย ให้ความรู้สึกลื่นไหลเพลิดเพลิน
   - 🎺 **เสียงเฉลย / ตอบถูก (Round Victory Fanfare):** เสียงแตรและคอร์ด Major Arpeggio สไตล์เกมโชว์
   - 🎆 **เสียงตอนจบเกม (Grand Finale Fanfare):** เมื่อเล่นจบครบ 10 ข้อ จะมีเสียงดนตรีเฉลิมฉลองชัยชนะเต็มรูปแบบ พร้อมเอฟเฟกต์กระดิ่ง Chimes และพายุ Confetti
   - ❌ **เสียงบัซเซอร์ (Wrong Buzzer):** เมื่อตอบผิดในโหมดควิซ
   - 🎵 **เพลงประกอบเกม (Dynamic BGM):** บีทเกมโชว์ฟังก์สร้างบรรยากาศสดใส สามารถกดเปิด/ปิด หรือปรับระดับเสียงได้

3. **รองรับ 2 รูปแบบการเล่น (Dual Game Modes):**
   - 🎙️ **โหมดพิธีกร TikTok (Host Mode):** เหมาะสำหรับเปิดไลฟ์สตรีม, ปาร์ตี้กับเพื่อน หรือจัดกิจกรรมในห้องเรียน โดยผู้จัดสามารถกด "เปิดสุ่ม 1 ช่อง", "เปิดคำใบ้", หรือ "เฉลยทันทีพร้อมซาวด์เอฟเฟกต์" ได้ตามต้องการ
   - 🎯 **โหมดเล่นคนเดียว (Solo Quiz):** มีตัวเลือก 4 ช้อยส์ (A, B, C, D) พร้อมช่องพิมพ์ทายคำตอบ และระบบนับเวลาถอยหลัง (Timer 30s)

4. **ปรับขนาดตารางแผ่นป้ายได้อิสระ:**
   - 3 × 3 (9 ช่อง) - โหมดเล่นไว
   - 4 × 4 (16 ช่อง) - ค่าเริ่มต้น สไตล์มาตรฐาน TikTok Peechy Game
   - 5 × 5 (25 ช่อง) - โหมดยากท้าทาย

5. **สลับโหมดจอ TikTok 9:16 ได้ทันที (📱 TikTok Preview Frame):**
   - มีปุ่มจำลองกรอบสมาร์ตโฟน 9:16 ให้แคปหน้าจอหรืออัดคลิปลง TikTok / Shorts / Reels ได้อย่างสวยงาม

---

## 🚀 วิธีเปิดใช้งาน (Getting Started)

โครงสร้างโปรเจกต์เป็น Standalone HTML/CSS/Vanilla JS 100% ไม่ต้องติดตั้ง Node.js หรือ build tools:

```bash
# Clone repository
git clone https://github.com/thanakornnopp-dev/hybrid-animal-jigsaw-game.git

# เข้าโฟลเดอร์
cd hybrid-animal-jigsaw-game

# ดับเบิ้ลคลิกเปิด index.html ในเบราว์เซอร์ได้ทันที!
open index.html
```

หรือสามารถเปิดผ่านเว็บเซิร์ฟเวอร์แบบง่าย:
```bash
python3 -m http.server 8080
# แล้วเข้าไปที่ http://localhost:8080
```

---

## 🌐 การนำขึ้น GitHub Pages

1. ไปที่แท็บ **Settings** ใน GitHub Repository ของคุณ
2. เลือกเมนู **Pages** ด้านซ้าย
3. ในหัวข้อ **Build and deployment > Branch** ให้เลือก Branch `main` และโฟลเดอร์ `/ (root)` แล้วกด **Save**
4. เว็บไซต์จะออนไลน์พร้อมเล่นผ่าน URL: `https://thanakornnopp-dev.github.io/hybrid-animal-jigsaw-game/`

---

## 📁 โครงสร้างไฟล์ในโปรเจกต์ (File Structure)

```text
├── index.html            # โครงสร้างหน้าเว็บหลัก Responsive & Accessible
├── style.css             # ตกแต่งสไตล์เกมโชว์ แอนิเมชัน 3D Flip และ Glassmorphism
├── sound.js              # โมดูลสังเคราะห์เสียง Web Audio API (Tile Pop, Fanfares, BGM)
├── animals-data.js       # ฐานข้อมูลสัตว์ผสม 10 ชนิด พร้อมภาพเวกเตอร์ SVG คุณภาพสูง
├── game.js               # ตรรกะควบคุมเกม คะแนน ระบบใบ้ และระบบอนุภาค Confetti
├── README.md             # เอกสารแนะนำการใช้งาน
└── .gitignore            # ค่าละเว้นไฟล์ระบบ
```

---
> พัฒนาโดย Thanaporn Nopparat (Faculty of Engineering, Thammasat University)
