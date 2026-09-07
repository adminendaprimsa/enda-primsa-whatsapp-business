const axios = require('axios');

const WHATSAPP_API_URL = `https://graph.instagram.com/${process.env.WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}`;
const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

const sendMessage = async (phoneNumber, message, mediaUrl = null) => {
  try {
    const payload = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: mediaUrl ? 'image' : 'text'
    };
    
    if (mediaUrl) {
      payload.image = { link: mediaUrl };
    } else {
      payload.text = { body: message };
    }
    
    const response = await axios.post(
      `${WHATSAPP_API_URL}/messages`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('WhatsApp API Error:', error.response?.data || error.message);
    throw error;
  }
};

const sendButtonMessage = async (phoneNumber, message, buttons) => {
  try {
    const payload = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: message },
        action: {
          buttons: buttons.map((btn, idx) => ({
            type: 'reply',
            reply: {
              id: `${idx}`,
              title: btn
            }
          }))
        }
      }
    };
    
    const response = await axios.post(
      `${WHATSAPP_API_URL}/messages`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('WhatsApp API Error:', error.response?.data || error.message);
    throw error;
  }
};

const markAsRead = async (messageId) => {
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/messages`,
      {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('WhatsApp API Error:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = {
  sendMessage,
  sendButtonMessage,
  markAsRead
};