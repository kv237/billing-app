const fs = require("fs");

const {
  sendWhatsAppInvoice,
} = require("../whatsapp");

// =====================================================
// SEND WHATSAPP
// =====================================================

const sendWhatsApp = async ({
  phone,
  customerName,
  pdfPath,
}) => {

  try {

    // =========================================
    // VALIDATION
    // =========================================

    if (!phone) {
      throw new Error(
        "Phone number missing"
      );
    }

    if (!pdfPath) {
      throw new Error(
        "PDF path missing"
      );
    }

    // =========================================
    // FILE CHECK
    // =========================================

    if (
      !fs.existsSync(pdfPath)
    ) {

      throw new Error(
        "PDF file not found"
      );
    }

    // =========================================
    // SEND WHATSAPP
    // =========================================

    await sendWhatsAppInvoice(
      phone,
      pdfPath,
      customerName
    );

    console.log(
      "WhatsApp message sent successfully"
    );

    return {
      success: true,
    };

  } catch (error) {

    console.log(
      "WhatsApp Error:",
      error.message
    );

    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = sendWhatsApp;