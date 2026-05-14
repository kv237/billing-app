const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");

const sendEmail = async (to, billData) => {

  try {

    console.log("Sending To:", to);

    // ---------- CREATE PDF ----------

    const pdfPath = `bill-${Date.now()}.pdf`;

    const doc = new PDFDocument();

    doc.pipe(fs.createWriteStream(pdfPath));

    doc.fontSize(22).text("SREE AADYA DRY CLEANING", {
      align: "center",
    });

    doc.moveDown();

    doc.fontSize(14).text(`Customer Name: ${billData.customerName}`);
    doc.text(`Phone: ${billData.phone}`);
    doc.text(`Bill No: ${billData.billNo}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);

    doc.moveDown();

    doc.fontSize(16).text("Items:");

    let total = 0;

    billData.items.forEach((item) => {

      const itemTotal = item.qty * item.price;

      total += itemTotal;

      doc.text(
        `${item.name} | Qty: ${item.qty} | ₹${item.price} each | Total: ₹${itemTotal}`
      );
    });

    doc.moveDown();

    doc.fontSize(18).text(`Grand Total: ₹${total}`);

    doc.moveDown();

    doc.text("Thank you for visiting our shop!");

    doc.end();

    // ---------- EMAIL SETUP ----------

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Wait PDF creation

    await new Promise(resolve => setTimeout(resolve, 2000));

    // ---------- SEND EMAIL ----------

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: "Dry Cleaning Bill Receipt",

      html: `
        <div style="font-family: Arial; padding:20px;">
        
          <h1 style="color:blue;">
            SREE AADYA DRY CLEANING
          </h1>

          <h2>Your Bill Receipt is Attached</h2>

          <p>Thank you for visiting our shop.</p>

          <p>Your clothes will be ready soon.</p>

        </div>
      `,

      attachments: [
        {
          filename: "bill.pdf",
          path: pdfPath,
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Message ID:", info.messageId);

    console.log("Email Sent Successfully");

  } catch (error) {

    console.log(error);

  }

};

module.exports = sendEmail;