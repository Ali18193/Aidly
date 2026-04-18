# Aidly — Netlify Deploy Təlimatı

## Qovluq strukturu

```
aidly-netlify/
├── netlify.toml              ← Netlify konfiqurasiyası
├── netlify/
│   └── functions/
│       └── advice.js         ← Claude API proxy (server-side)
└── public/
    └── index.html            ← Aidly v4 frontend
```

---

## 1. Netlify hesabı aç

→ [netlify.com](https://netlify.com) → **Sign up** (GitHub ilə tövsiyə edilir)

---

## 2. GitHub repo yarat

```bash
# Terminal aç, bu qovluğa gir
cd aidly-netlify

git init
git add .
git commit -m "Aidly v4 initial"

# GitHub-da yeni repo yarat (aidly adı ilə)
# sonra:
git remote add origin https://github.com/SENİN_ADIN/aidly.git
git push -u origin main
```

---

## 3. Netlify-a deploy et

1. Netlify dashboard → **"Add new site"** → **"Import an existing project"**
2. GitHub seç → `aidly` repo-nu seç
3. Build settings avtomatik doldurulur (`netlify.toml`-dən):
   - **Publish directory:** `public`
   - **Functions directory:** `netlify/functions`
4. **"Deploy site"** düyməsinə bas

---

## 4. API Key əlavə et ⚠️ ÇOX VACİB

Netlify dashboard-da:

```
Site settings → Environment variables → Add variable

Key:   ANTHROPIC_API_KEY
Value: sk-ant-api03-XXXXXXXXXXXXXXXX  ← Anthropic Console-dan al
```

→ [console.anthropic.com](https://console.anthropic.com) → API Keys → Create key

Dəyişkən əlavə etdikdən sonra: **Deploys → Trigger deploy** (yenidən deploy lazımdır)

---

## 5. Yoxla

Deploy bitdikdən sonra:

```bash
# Funksiyanı birbaşa test et:
curl -X POST https://SENİN_SITE.netlify.app/api/advice \
  -H "Content-Type: application/json" \
  -d '{"score": 45, "lang": "az"}'

# Cavab belə gəlməlidir:
# {"advice": "...Claude məsləhəti..."}
```

---

## 6. Custom domen (isteğe bağlı)

Netlify dashboard → **Domain settings** → **Add custom domain**

`aidly.az` və ya `app.aidly.az` kimi bir domen bağlaya bilərsiniz.

---

## Necə işləyir?

```
Browser  →  POST /api/advice  →  Netlify Function  →  Anthropic API
                                    (API key gizlidir)
```

API key heç vaxt brauzerdə görünmür. ✅

---

## Növbəti addımlar (isteğe bağlı)

| Funksiya | Texnologiya | Vaxt |
|----------|-------------|------|
| Real auth (login/qeydiyyat) | Supabase Auth | ~2 saat |
| Booking DB | Supabase PostgreSQL | ~1 saat |
| Email bildiriş | Netlify + Resend | ~1 saat |
| Analytics | Plausible.io | 15 dəq |

---

Sualın olsa — hər addımda kömək edə bilərəm! 🚀
