const whatsappService = require('./whatsappService');
const db = require('../utils/database');

const processMessage = async (message, metadata) => {
  try {
    const phoneNumberId = metadata.phone_number_id;
    const phoneNumber = message.from;
    const messageType = message.type;
    
    console.log(`\n📨 New message from ${phoneNumber}:`);
    console.log(`   Type: ${messageType}`);
    
    // Mark message as read
    await whatsappService.markAsRead(message.id);
    
    let responseMessage = '';
    
    if (messageType === 'text') {
      const text = message.text.body.toLowerCase().trim();
      responseMessage = await handleTextMessage(text, phoneNumber);
    } else if (messageType === 'button') {
      const buttonId = message.button.payload;
      responseMessage = await handleButtonResponse(buttonId, phoneNumber);
    } else if (messageType === 'interactive') {
      const selection = message.interactive.button_reply?.id;
      responseMessage = await handleButtonResponse(selection, phoneNumber);
    }
    
    // Send response if message is not empty
    if (responseMessage) {
      await whatsappService.sendMessage(phoneNumber, responseMessage);
    }
  } catch (error) {
    console.error('Message processing error:', error);
  }
};

const handleTextMessage = async (text, phoneNumber) => {
  if (text === 'hi' || text === 'hello' || text === 'halo') {
    return `👋 Selamat datang di Enda Primsa App!\n\nSaya siap membantu Anda. Silakan ketik salah satu perintah:\n\n1️⃣ *katalog* - Lihat daftar produk\n2️⃣ *order* - Buat pesanan\n3️⃣ *bantuan* - Dapatkan bantuan`;
  }
  
  if (text === 'katalog') {
    return await getProductCatalog();
  }
  
  if (text === 'bantuan') {
    return `📞 Hubungi Kami:\n\nTelefon: ${process.env.ADMIN_PHONE}\n\nJam Operasional: Senin - Jumat, 09:00 - 17:00 WIB`;
  }
  
  if (text === 'order') {
    return `📦 Cara Memesan:\n\n1. Pilih produk dari katalog\n2. Kirimkan nama produk\n3. Konfirmasi jumlah dan detail\n4. Selesai! Kami akan menghubungi Anda untuk pembayaran\n\nKetik *katalog* untuk melihat produk tersedia`;
  }
  
  return `Maaf, saya tidak memahami perintah tersebut. Ketik *bantuan* untuk melihat opsi yang tersedia.`;
};

const handleButtonResponse = async (buttonId, phoneNumber) => {
  return `Terima kasih atas responsnya! Tim kami akan segera memproses permintaan Anda.`;
};

const getProductCatalog = async () => {
  return new Promise((resolve) => {
    db.all('SELECT * FROM products LIMIT 10', [], (err, rows) => {
      if (err || !rows || rows.length === 0) {
        resolve('Maaf, katalog produk sedang tidak tersedia.');
        return;
      }
      
      let catalog = '📦 *KATALOG PRODUK ENDA PRIMSA*\n\n';
      rows.forEach((product, idx) => {
        catalog += `${idx + 1}. *${product.name}*\n`;
        catalog += `   Harga: Rp ${product.price.toLocaleString('id-ID')}\n`;
        if (product.description) {
          catalog += `   Deskripsi: ${product.description}\n`;
        }
        catalog += '\n';
      });
      
      catalog += `Untuk memesan, kirimkan nama produk yang Anda minati!`;
      resolve(catalog);
    });
  });
};

module.exports = {
  processMessage,
  handleTextMessage,
  handleButtonResponse,
  getProductCatalog
};