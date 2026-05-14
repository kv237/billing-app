const express = require("express");
const router = express.Router();

const PDFDocument = require("pdfkit");
const fs = require("fs");
const nodemailer = require("nodemailer");
const bwipjs = require("bwip-js");

router.post("/send-bill", async (req, res) => {

  try {

    const data = req.body;

    // =====================================================
    // VALIDATION
    // =====================================================

    if (
      !data.items ||
      data.items.length === 0
    ) {

      return res.status(400).json({
        success: false,
        error: "No items provided",
      });
    }

    // =====================================================
    // INVOICE
    // =====================================================

    const invoiceNo =
      `SADC-${Date.now()}`;

    const pdfPath =
      `bill-${Date.now()}.pdf`;

    // =====================================================
    // TOTALS
    // =====================================================

    let grandTotal = 0;

    data.items.forEach((item) => {

      grandTotal +=
        item.qty * item.price;
    });

    const advanceAmount =
      data.advanceAmount || 0;

    const pendingAmount =
      Math.max(
        grandTotal - advanceAmount,
        0
      );

    // =====================================================
    // BARCODE
    // =====================================================

    const barcodeBuffer =
      await bwipjs.toBuffer({

        bcid: "code128",

        text: invoiceNo,

        scale: 2,

        height: 10,

        includetext: true,
      });

    // =====================================================
    // PDF
    // =====================================================

    const doc =
      new PDFDocument({
        size: "A4",
        margin: 40,
      });

    const stream =
      fs.createWriteStream(
        pdfPath
      );

    doc.pipe(stream);

    // =====================================================
    // HEADER
    // =====================================================

    // ---------- LOGO ----------

    if (
      fs.existsSync("logo.png")
    ) {

      doc.image(
        "logo.png",
        30,
        15,
        {
          width: 95,
        }
      );
    }

    // ---------- TITLE ----------

    doc
      .fillColor("#2563EB")
      .fontSize(24)
      .text(
        "SREE AADYA DRY CLEANING",
        0,
        28,
        {
          align: "center",
        }
      );

    doc
      .fillColor("black")
      .fontSize(11)
      .text(
        "Professional Laundry Service",
        0,
        58,
        {
          align: "center",
        }
      );

    doc.text(
      "Phone: 8019315716",
      0,
      75,
      {
        align: "center",
      }
    );

    // =====================================================
    // CUSTOMER BOX
    // =====================================================

    doc
      .roundedRect(
        40,
        110,
        515,
        125,
        8
      )
      .fillAndStroke(
        "#F8FAFC",
        "#D1D5DB"
      );

    doc.fillColor("black");

    doc.fontSize(11);

    // ---------- LEFT ----------

    doc.text(
      `Customer Name : ${data.customerName}`,
      60,
      130
    );

    doc.text(
      `Phone Number  : ${data.phone}`,
      60,
      155
    );

    // ---------- RIGHT ----------

    doc.text(
      `Invoice No : ${invoiceNo}`,
      320,
      130
    );

    doc.text(
      `Bill Date  : ${new Date().toLocaleDateString()}`,
      320,
      155
    );

    // ---------- BARCODE ----------

    doc.image(
      barcodeBuffer,
      320,
      175,
      {
        width: 170,
      }
    );

    // =====================================================
    // TABLE HEADER
    // =====================================================

    doc
      .rect(
        40,
        260,
        515,
        30
      )
      .fill("#2563EB");

    doc
      .fillColor("white")
      .fontSize(11);

    doc.text(
      "Item",
      55,
      270
    );

    doc.text(
      "Service",
      170,
      270
    );

    doc.text(
      "Qty",
      315,
      270
    );

    doc.text(
      "Price",
      385,
      270
    );

    doc.text(
      "Total",
      470,
      270
    );

    // =====================================================
    // ITEMS
    // =====================================================

    let y = 305;

    doc.fillColor("black");

    data.items.forEach(
      (item, index) => {

        const itemTotal =
          item.qty * item.price;

        // alternate row color

        if (index % 2 === 0) {

          doc
            .rect(
              40,
              y - 5,
              515,
              24
            )
            .fill("#F9FAFB");

          doc.fillColor("black");
        }

        // ITEM

        doc.text(
          item.name,
          55,
          y,
          {
            width: 100,
          }
        );

        // SERVICE

        doc.text(
          item.service || "-",
          170,
          y,
          {
            width: 120,
          }
        );

        // QTY

        doc.text(
          item.qty.toString(),
          315,
          y
        );

        // PRICE

        doc.text(
          `₹${item.price}`,
          385,
          y
        );

        // TOTAL

        doc.text(
          `₹${itemTotal}`,
          470,
          y
        );

        y += 28;
      }
    );

    // =====================================================
    // TOTAL BOX
    // =====================================================

    y += 20;

    doc
      .roundedRect(
        350,
        y,
        180,
        85,
        8
      )
      .fill("#EFF6FF");

    doc
      .fillColor("black")
      .fontSize(11);

    doc.text(
      `Grand Total : ₹${grandTotal}`,
      365,
      y + 15
    );

    doc
      .fillColor("green")
      .text(
        `Advance Paid : ₹${advanceAmount}`,
        365,
        y + 40
      );

    doc
      .fillColor("red")
      .text(
        `Pending Amt : ₹${pendingAmount}`,
        365,
        y + 63
      );

    // =====================================================
    // QR + SIGNATURE SECTION
    // =====================================================

    const sectionY =
      y + 120;

    // ---------- QR ----------

    doc
      .fillColor("black")
      .fontSize(12)
      .text(
        "UPI PAYMENT",
        65,
        sectionY
      );

    if (
      fs.existsSync(
        "paymentQR.png"
      )
    ) {

      doc.image(
        "paymentQR.png",
        50,
        sectionY + 25,
        {
          width: 95,
          height: 95,
        }
      );

    } else {

      doc
        .fontSize(10)
        .fillColor("red")
        .text(
          "QR NOT FOUND",
          55,
          sectionY + 60
        );
    }

    doc
      .fillColor("black")
      .fontSize(9)
      .text(
        "Scan QR To Pay",
        55,
        sectionY + 130
      );

    // ---------- SIGNATURE ----------

    if (
      fs.existsSync(
        "signature.png"
      )
    ) {

      doc.image(
        "signature.png",
        385,
        sectionY + 10,
        {
          width: 95,
        }
      );

    } else {

      doc
        .fontSize(10)
        .fillColor("red")
        .text(
          "SIGNATURE NOT FOUND",
          370,
          sectionY + 60
        );
    }

    doc
      .fillColor("black")
      .fontSize(9)
      .text(
        "Authorized Signature",
        370,
        sectionY + 115
      );

    // =====================================================
    // THANK YOU
    // =====================================================

    doc
      .fontSize(17)
      .fillColor("#16A34A")
      .text(
        "Thank You! Visit Again.",
        0,
        sectionY + 165,
        {
          align: "center",
        }
      );

    // =====================================================
    // FOOTER
    // =====================================================

    doc
      .fontSize(9)
      .fillColor("gray")
      .text(
        "© 2026 SREE AADYA DRY CLEANING",
        0,
        sectionY + 195,
        {
          align: "center",
        }
      );

    doc.text(
      "Developed by Krishna Vamshi",
      0,
      sectionY + 210,
      {
        align: "center",
      }
    );

    // =====================================================
    // END PDF
    // =====================================================

    doc.end();

    // =====================================================
    // WAIT FOR PDF
    // =====================================================

    await new Promise(
      (resolve, reject) => {

        stream.on(
          "finish",
          resolve
        );

        stream.on(
          "error",
          reject
        );
      }
    );

    // =====================================================
    // EMAIL
    // =====================================================

    const transporter =
      nodemailer.createTransport({

        host: "smtp.gmail.com",

        port: 465,

        secure: true,

        auth: {

          user:
            process.env.EMAIL_USER,

          pass:
            process.env.EMAIL_PASS,
        },
      });

    await transporter.sendMail({

      from:
        process.env.EMAIL_USER,

      to: data.email,

      subject:
        "SREE AADYA DRY CLEANING Invoice",

      html: `
        <div style="font-family:Arial;padding:20px;">

          <h2 style="color:#2563EB;">
            SREE AADYA DRY CLEANING
          </h2>

          <p>
            Your invoice is attached.
          </p>

        </div>
      `,

      attachments: [
        {
          filename:
            "invoice.pdf",

          path: pdfPath,
        },
      ],
    });

    // =====================================================
    // DELETE PDF
    // =====================================================

    fs.unlinkSync(pdfPath);

    res.json({
      success: true,
      message:
        "Bill Sent Successfully",
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;