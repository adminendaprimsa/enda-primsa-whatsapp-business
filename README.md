# Enda Primsa App

🚀 WhatsApp Business application untuk automasi pesan dan manajemen katalog produk Enda Primsa Market.

## Fitur Utama

✅ **Webhook WhatsApp Business** - Terima dan proses pesan otomatis  
✅ **Katalog Produk** - Kelola daftar produk dengan harga  
✅ **Manajemen Pesanan** - Lacak status pesanan customer  
✅ **Auto Response** - Respons otomatis untuk pertanyaan umum  
✅ **Broadcast Message** - Kirim pesan ke semua customer  
✅ **Admin Dashboard** - API untuk dashboard admin  

## Persyaratan

- Node.js >= 14.0.0
- npm atau yarn
- Akun WhatsApp Business API
- Phone Number ID dari Meta
- Access Token WhatsApp Business

## Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/adminendaprimsa/enda-primsa-whatsapp-business.git
cd enda-primsa-whatsapp-business
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

```bash
cp .env.example .env
```

Edit file `.env` dan isi dengan nilai Anda:

```env
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
WEBHOOK_SECRET=your_webhook_secret
PORT=3000
```

### 4. Jalankan Aplikasi

**Development (dengan auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

## Penggunaan

### Health Check
```bash
curl http://localhost:3000/health
```

### API Endpoints

#### Products
- `GET /api/products` - Dapatkan semua produk
- `GET /api/products/:id` - Dapatkan produk spesifik
- `POST /api/products` - Tambah produk baru
- `PUT /api/products/:id` - Update produk
- `DELETE /api/products/:id` - Hapus produk

#### Orders
- `GET /api/orders` - Dapatkan semua pesanan
- `GET /api/orders/:id` - Dapatkan pesanan spesifik
- `POST /api/orders` - Buat pesanan baru
- `PUT /api/orders/:id` - Update status pesanan

#### Admin
- `GET /api/admin/dashboard/stats` - Dapatkan statistik dashboard
- `POST /api/admin/broadcast` - Kirim broadcast message

### Webhook WhatsApp

#### Setup Webhook di Meta Business Manager
1. Masuk ke [Meta Business Manager](https://business.facebook.com)
2. Pilih App Anda
3. Klik WhatsApp > Configuration
4. Di bagian Webhooks, klik "Edit" dan masukkan:
   - **Callback URL:** `https://your-domain.com/webhook`
   - **Verify Token:** (gunakan nilai dari `.env` WEBHOOK_VERIFY_TOKEN)
5. Subscribe ke event: `messages`, `message_status`

#### Verification POST
Ketika setup, Meta akan mengirim GET request ke webhook untuk verifikasi.

#### Receiving Messages
WhatsApp akan mengirim POST request ke `/webhook` dengan format:

```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "123",
    "changes": [{
      "value": {
        "messages": [{
          "from": "62812345678",
          "id": "wamid.xxx",
          "type": "text",
          "text": {
            "body": "Hello"
          }
        }],
        "metadata": {
          "phone_number_id": "123456789"
        }
      }
    }]
  }]
}
```

## Database

Aplikasi menggunakan SQLite dengan skema berikut:

### Table: products
```sql
id (INTEGER PRIMARY KEY)
name (TEXT)
description (TEXT)
price (REAL)
image_url (TEXT)
category (TEXT)
created_at (DATETIME)
updated_at (DATETIME)
```

### Table: orders
```sql
id (INTEGER PRIMARY KEY)
customer_phone (TEXT)
customer_name (TEXT)
items (TEXT JSON)
total_price (REAL)
status (TEXT) - 'pending', 'confirmed', 'completed', 'cancelled'
created_at (DATETIME)
updated_at (DATETIME)
```

## Contoh Penggunaan

### Tambah Produk
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kopi Premium",
    "description": "Kopi pilihan berkualitas tinggi",
    "price": 50000,
    "category": "Minuman",
    "image_url": "https://example.com/kopi.jpg"
  }'
```

### Buat Pesanan
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_phone": "62812345678",
    "customer_name": "John Doe",
    "items": [{"product_id": 1, "quantity": 2}],
    "total_price": 100000,
    "status": "pending"
  }'
```

### Broadcast Message
```bash
curl -X POST http://localhost:3000/api/admin/broadcast \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Promo spesial hari ini! Diskon hingga 50% untuk semua produk."
  }'
```

## Keamanan

- ✅ Signature verification untuk webhook requests
- ✅ Environment variables untuk credentials
- ✅ CORS protection
- ✅ Request body size limiting
- ✅ Error handling yang aman

## Troubleshooting

### Webhook tidak diterima
- Pastikan URL webhook dapat diakses dari internet (gunakan ngrok untuk development)
- Verifikasi Webhook Verify Token di Meta Business Manager
- Cek logs untuk melihat error messages

### Message tidak terkirim
- Pastikan Access Token valid dan tidak expired
- Verifikasi Phone Number ID
- Cek format nomor telepon (harus dengan kode negara)

### Database error
- Pastikan folder `data/` dapat ditulis
- Cek permission file database

## Development

```bash
# Jalankan dengan auto-reload
npm run dev

# Jalankan tests
npm test

# Lint code
npm run lint
```

## Deployment

### Heroku
```bash
heroku create your-app-name
git push heroku main
heroku config:set WHATSAPP_PHONE_NUMBER_ID=your_id
heroku config:set WHATSAPP_ACCESS_TOKEN=your_token
# ... set other env vars
```

### Railway, Render, atau Platform Lainnya
Sesuaikan dengan dokumentasi platform masing-masing. Pastikan:
1. Set semua environment variables
2. Webhook URL mengarah ke domain aplikasi
3. Port sesuai dengan konfigurasi platform

## Lisensi

MIT License - Silakan gunakan dan modifikasi sesuai kebutuhan

## Support

Jika ada pertanyaan atau masalah, silakan buat issue di repository ini.

---

Dibuat dengan ❤️ untuk Enda Primsa Market