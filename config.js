require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,

  SMSPOOL_API_KEY: process.env.SMSPOOL_API_KEY,

  NOWPAYMENTS_API_KEY: process.env.NOWPAYMENTS_API_KEY,

  DEFAULT_SERVICE: "whatsapp",
  DEFAULT_COUNTRY: "FR"
};
