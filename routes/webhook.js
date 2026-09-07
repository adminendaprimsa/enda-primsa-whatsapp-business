const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');
const messageHandler = require('../services/messageHandler');

// Webhook Verification (for initial setup)
router.get('/', (req, res) => {
  const verifyToken = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  
  if (!verifyToken || !challenge) {
    return res.status(400).json({ error: 'Missing parameters' });
  }
  
  if (verifyToken === process.env.WEBHOOK_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  
  return res.status(403).json({ error: 'Invalid verify token' });
});

// Webhook POST handler
router.post('/', async (req, res) => {
  try {
    const body = req.body;
    
    // Handle webhook events
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry[0];
      const changes = entry.changes[0];
      const value = changes.value;
      
      // Process messages
      if (value.messages) {
        for (const message of value.messages) {
          await messageHandler.processMessage(message, value.metadata);
        }
      }
      
      // Process status updates
      if (value.statuses) {
        for (const status of value.statuses) {
          console.log(`Message ${status.id} status: ${status.status}`);
        }
      }
      
      return res.status(200).json({ received: true });
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;