# Fontaine Forms — Pembuat Formulir untuk Guru

Aplikasi web bertema Furina untuk guru membuat formulir,
membagikannya kepada siswa, dan melihat respons.

## Tech Stack
- **Frontend:** Next.js 14, Tailwind CSS, Framer Motion
- **Backend:** Python Flask, Flask-JWT-Extended
- **Database:** PostgreSQL (Supabase)
- **Hosting:** Vercel (frontend) + Render.com (backend)

## Pengembangan Lokal

### Backend
cd backend |
python -m venv venv |
venv\Scripts\activate # windows |
pip install -r requirements.txt |
python app.py

### Frontend
cd frontend |
npm install |
npm run dev

## Strategi Branch Tim
- main — hanya untuk production, dilindungi
- dev — branch pengembangan bersama
- feature/* — branch untuk fitur individu

## Variabel Environment
Lihat .env.example untuk variabel yang diperlukan (minta nilainya ke ketua tim).
