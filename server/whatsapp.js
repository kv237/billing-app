const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
} = require("@whiskeysockets/baileys");

const qrcode = require("qrcode-terminal");
const fs = require("fs");

let sock;

// =====================================================
// CONNECT WHATSAPP
// =====================================================

async function connectWhatsApp() {

  const { state, saveCreds } =
    await useMultiFileAuthState("auth_info");

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
  });

  // Save Session
  sock.ev.on("creds.update", saveCreds);

  // Connection Updates
  sock.ev.on(
    "connection.update",
    async ({ connection, lastDisconnect, qr }) => {

      // =====================================================
      // SHOW QR CODE
      // =====================================================

      if (qr) {

        console.log("\nScan this QR Code with WhatsApp:\n");

        qrcode.generate(qr, {
          small: true,
        });
      }

      // =====================================================
      // CONNECTION CLOSED
      // =====================================================

      if (connection === "close") {

        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !==
          DisconnectReason.loggedOut;

        console.log("WhatsApp disconnected");

        if (shouldReconnect) {
          connectWhatsApp();
        }

      }

      // =====================================================
      // CONNECTION OPEN
      // =====================================================

      else if (connection === "open") {

        console.log("WhatsApp connected successfully");
      }
    }
  );
}

// =====================================================
// SEND WHATSAPP INVOICE
// =====================================================

async function sendWhatsAppInvoice(
  phone,
  pdfPath,
  customerName
) {

  try {

    if (!sock) {

      console.log("WhatsApp not connected");
      return;
    }

    // Remove spaces and special chars
    const cleanPhone =
      phone.toString().replace(/\D/g, "");

    const number =
      `91${cleanPhone}@s.whatsapp.net`;

    await sock.sendMessage(number, {

      document: fs.readFileSync(pdfPath),

      mimetype: "application/pdf",

      fileName: "invoice.pdf",

      caption:
        `Hello ${customerName}, your invoice is attached.`,
    });

    console.log("Invoice sent on WhatsApp");

  } catch (error) {

    console.log(
      "WhatsApp Send Error:",
      error
    );
  }
}

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  connectWhatsApp,
  sendWhatsAppInvoice,
};