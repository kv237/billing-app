require("dotenv").config();

const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

client.messages
  .create({
    body: "Hello from billing app!",
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to: "whatsapp:+916302539132"
  })
  .then(message => console.log("Message SID:", message.sid))
  .catch(err => console.log(err));