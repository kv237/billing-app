const express = require("express");

const cors = require("cors");

const dotenv = require("dotenv");

dotenv.config();

// =====================================================
// DATABASE
// =====================================================

const connectDB = require("./db");

// =====================================================
// WHATSAPP
// =====================================================

const {
  connectWhatsApp,
} = require("./whatsapp");

// =====================================================
// ROUTES
// =====================================================

const billRoutes =
  require("./routes/billRoutes");

const whatsappRoutes =
  require("./routes/whatsappRoutes");

// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// DATABASE CONNECTION
// =====================================================

connectDB()
  .then(() => {

    console.log(
      "MongoDB Connected Successfully"
    );

  })
  .catch((err) => {

    console.log(
      "MongoDB Connection Error:",
      err.message
    );
  });

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// =====================================================
// START WHATSAPP
// =====================================================

connectWhatsApp();

// =====================================================
// API ROUTES
// =====================================================

app.use(
  "/api",
  billRoutes
);

app.use(
  "/api",
  whatsappRoutes
);

// =====================================================
// HOME ROUTE
// =====================================================

app.get("/", (req, res) => {

  res.send(
    "SREE AADYA DRY CLEANING Backend Running Successfully"
  );
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use(
  (err, req, res, next) => {

    console.log(
      "Server Error:",
      err
    );

    res.status(500).json({

      success: false,

      error:
        err.message ||
        "Internal Server Error",
    });
  }
);

// =====================================================
// SERVER
// =====================================================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );
});