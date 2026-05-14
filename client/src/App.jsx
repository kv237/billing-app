import React from "react";

export default function App() {

  // =====================================================
  // STATES
  // =====================================================

  const [customerName, setCustomerName] =
    React.useState("");

  const [mobile, setMobile] =
    React.useState("");

  const [email, setEmail] =
    React.useState("");

  const [billDate, setBillDate] =
    React.useState("");

  const [advanceAmount, setAdvanceAmount] =
    React.useState(0);

  // =====================================================
  // VOICE STATUS
  // =====================================================

  const [listening, setListening] =
    React.useState(false);

  // =====================================================
  // SERVICES
  // =====================================================

  const serviceOptions = {

    Shirt: [
      "Dry Cleaning",
      "Ironing",
      "Wash & Iron",
      "Stain Removal",
    ],

    Pant: [
      "Ironing",
      "Dry Cleaning",
      "Steam Press",
    ],

    Saree: [
      "Rolling",
      "Dry Cleaning",
      "Stain Removal",
      "Polishing",
    ],

    Blazer: [
      "Premium Dry Cleaning",
      "Steam Press",
    ],

    Jacket: [
      "Dry Cleaning",
      "Winter Wash",
    ],
  };

  // =====================================================
  // ITEMS
  // =====================================================

  const [items, setItems] =
    React.useState([
      {
        item: "Shirt",
        service: "Dry Cleaning",
        quantity: 1,
        price: 0,
        total: 0,
      },
    ]);

  // =====================================================
  // ADD ROW
  // =====================================================

  const addRow = () => {

    setItems([
      ...items,
      {
        item: "Shirt",
        service: "Dry Cleaning",
        quantity: 1,
        price: 0,
        total: 0,
      },
    ]);
  };

  // =====================================================
  // DELETE ROW
  // =====================================================

  const deleteRow = (index) => {

    const updated =
      items.filter(
        (_, i) => i !== index
      );

    setItems(updated);
  };

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (
    index,
    field,
    value
  ) => {

    const updatedItems =
      [...items];

    updatedItems[index][field] =
      value;

    // CHANGE SERVICES AUTOMATICALLY

    if (field === "item") {

      updatedItems[index].service =
        serviceOptions[value][0];
    }

    updatedItems[index].total =
      updatedItems[index].quantity *
      updatedItems[index].price;

    setItems(updatedItems);
  };

  // =====================================================
  // VOICE INPUT
  // =====================================================

  const startVoiceInput = () => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

      alert(
        "Voice Recognition Not Supported In This Browser"
      );

      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang = "en-IN";

    recognition.continuous = false;

    recognition.interimResults = false;

    setListening(true);

    recognition.start();

    recognition.onresult = (event) => {

      const text =
        event.results[0][0]
          .transcript;

      console.log(
        "Voice Text:",
        text
      );

      const lowerText =
        text.toLowerCase();

      // ==========================================
      // CUSTOMER NAME
      // ==========================================

      if (
        lowerText.includes(
          "customer"
        ) ||
        lowerText.includes(
          "name"
        )
      ) {

        const extractedName =
          text
            .replace(
              /customer name|customer|name/gi,
              ""
            )
            .trim();

        setCustomerName(
          extractedName
        );
      }

      // ==========================================
      // MOBILE NUMBER
      // ==========================================

      if (
        lowerText.includes(
          "mobile"
        ) ||
        lowerText.includes(
          "phone"
        )
      ) {

        const extractedMobile =
          text.replace(
            /\D/g,
            ""
          );

        setMobile(
          extractedMobile
        );
      }

      // ==========================================
      // EMAIL
      // ==========================================

      if (
        lowerText.includes(
          "gmail"
        ) ||
        lowerText.includes(
          "email"
        )
      ) {

        const extractedEmail =
          text
            .replace(
              /email|gmail/gi,
              ""
            )
            .replace(
              /at the rate/gi,
              "@"
            )
            .replace(
              /dot/gi,
              "."
            )
            .replace(/\s/g, "");

        setEmail(
          extractedEmail
        );
      }

      // ==========================================
      // ADVANCE AMOUNT
      // ==========================================

      if (
        lowerText.includes(
          "advance"
        )
      ) {

        const amount =
          text.match(/\d+/);

        if (amount) {

          setAdvanceAmount(
            Number(amount[0])
          );
        }
      }
    };

    recognition.onerror = (
      event
    ) => {

      console.log(
        event.error
      );

      alert(
        "Voice Recognition Error"
      );

      setListening(false);
    };

    recognition.onend = () => {

      setListening(false);
    };
  };

  // =====================================================
  // GRAND TOTAL
  // =====================================================

  const grandTotal =
    items.reduce(
      (acc, item) =>
        acc + item.total,
      0
    );

  // =====================================================
  // SEND TO MAIL
  // =====================================================

  const sendMail = async () => {

    try {

      const formattedItems =
        items.map((item) => ({
          name: item.item,
          service: item.service,
          qty: item.quantity,
          price: item.price,
        }));

      const response =
        await fetch(
          "http://localhost:5000/api/send-bill",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              customerName,

              phone: mobile,

              email,

              billDate,

              advanceAmount,

              items:
                formattedItems,
            }),
          }
        );

      const data =
        await response.json();

      alert(data.message);

    } catch (error) {

      console.log(error);

      alert(
        "Failed To Send Mail"
      );
    }
  };

  // =====================================================
  // WHATSAPP
  // =====================================================

  const sendWhatsApp =
    async () => {

      try {

        const formattedItems =
          items.map((item) => ({
            name: item.item,
            service: item.service,
            qty: item.quantity,
            price: item.price,
          }));

        const response =
          await fetch(
            "http://localhost:5000/api/send-whatsapp",
            {

              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({

                customerName,

                phone: mobile,

                advanceAmount,

                items:
                  formattedItems,
              }),
            }
          );

        const data =
          await response.json();

        alert(data.message);

      } catch (err) {

        console.log(err);

        alert(
          "WhatsApp Send Failed"
        );
      }
    };

  // =====================================================
  // PREVIEW PDF
  // =====================================================

  const previewPDF = () => {

    alert(
      "PDF Preview Feature Can Be Connected To Backend Route"
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (

    <div
      className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 p-5"
    >

      {/* MAIN CARD */}

      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-8">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex items-center gap-5 border-b pb-6">

          {/* LOGO */}

          <img
            src="/logo.png"
            alt="logo"
            className="w-80 h-50 object-contain"
          />

          {/* TITLE */}

          <div>

            <h1 className="text-4xl font-bold text-blue-700">
              SREE AADYA DRY CLEANING
            </h1>

            <p className="text-gray-600 mt-2">
              Professional Laundry Billing System
            </p>

            <p className="text-gray-500">
              Phone: 8019315716
            </p>

          </div>

        </div>

        {/* ================================================= */}
        {/* CUSTOMER DETAILS */}
        {/* ================================================= */}

        <div className="grid md:grid-cols-2 gap-5 mt-8">

          {/* CUSTOMER */}

          <div>

            <label className="font-semibold">
              Customer Name
            </label>

            <input
              type="text"
              value={customerName}
              onChange={(e) =>
                setCustomerName(
                  e.target.value
                )
              }
              className="w-full border p-3 rounded-2xl mt-2 shadow-sm"
              placeholder="Enter customer name"
            />

          </div>

          {/* MOBILE */}

          <div>

            <label className="font-semibold">
              Mobile Number
            </label>

            <input
              type="text"
              value={mobile}
              onChange={(e) =>
                setMobile(
                  e.target.value
                )
              }
              className="w-full border p-3 rounded-2xl mt-2 shadow-sm"
              placeholder="Enter mobile number"
            />

          </div>

          {/* EMAIL */}

          <div>

            <label className="font-semibold">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) =>
              setEmail(
              e.target.value
              )
              }
                className="w-full border p-3 rounded-2xl mt-2 shadow-sm"
                placeholder="Optional Email Address"
            />

          </div>

          {/* DATE */}

          <div>

            <label className="font-semibold">
              Bill Date
            </label>

            <input
              type="date"
              value={billDate}
              onChange={(e) =>
                setBillDate(
                  e.target.value
                )
              }
              className="w-full border p-3 rounded-2xl mt-2 shadow-sm"
            />

          </div>

          {/* ADVANCE */}

          <div>

            <label className="font-semibold">
              Advance Amount
            </label>

            <input
              type="number"
              value={advanceAmount}
              onChange={(e) =>
                setAdvanceAmount(
                  Number(
                    e.target.value
                  )
                )
              }
              className="w-full border p-3 rounded-2xl mt-2 shadow-sm"
              placeholder="Enter advance amount"
            />

          </div>

        </div>

        {/* ================================================= */}
        {/* TABLE */}
        {/* ================================================= */}

        <div className="mt-10 overflow-x-auto">

          <table className="w-full border-separate border-spacing-y-3">

            <thead>

              <tr className="bg-blue-600 text-white">

                <th className="p-4 rounded-l-2xl">
                  Item
                </th>

                <th className="p-4">
                  Service
                </th>

                <th className="p-4">
                  Qty
                </th>

                <th className="p-4">
                  Price
                </th>

                <th className="p-4">
                  Total
                </th>

                <th className="p-4 rounded-r-2xl">
                  Delete
                </th>

              </tr>

            </thead>

            <tbody>

              {items.map(
                (item, index) => (

                  <tr
                    key={index}
                    className="bg-white shadow-md"
                  >

                    {/* ITEM */}

                    <td className="p-3 rounded-l-2xl">

                      <select
                        value={item.item}
                        onChange={(e) =>
                          handleChange(
                            index,
                            "item",
                            e.target.value
                          )
                        }
                        className="w-full p-3 border rounded-xl"
                      >

                        <option>
                          Shirt
                        </option>

                        <option>
                          Pant
                        </option>

                        <option>
                          Saree
                        </option>

                        <option>
                          Blazer
                        </option>

                        <option>
                          Jacket
                        </option>

                      </select>

                    </td>

                    {/* SERVICE */}

                    <td className="p-3">

                      <select
                        value={
                          item.service
                        }
                        onChange={(e) =>
                          handleChange(
                            index,
                            "service",
                            e.target.value
                          )
                        }
                        className="w-full p-3 border rounded-xl"
                      >

                        {serviceOptions[
                          item.item
                        ].map(
                          (
                            service,
                            i
                          ) => (

                            <option
                              key={i}
                            >
                              {service}
                            </option>
                          )
                        )}

                      </select>

                    </td>

                    {/* QUANTITY */}

                    <td className="p-3">

                      <input
                        type="number"
                        value={
                          item.quantity
                        }
                        onChange={(e) =>
                          handleChange(
                            index,
                            "quantity",
                            Number(
                              e.target.value
                            )
                          )
                        }
                        className="w-full p-3 border rounded-xl"
                      />

                    </td>

                    {/* PRICE */}

                    <td className="p-3">

                      <input
                        type="number"
                        value={
                          item.price
                        }
                        onChange={(e) =>
                          handleChange(
                            index,
                            "price",
                            Number(
                              e.target.value
                            )
                          )
                        }
                        className="w-full p-3 border rounded-xl"
                      />

                    </td>

                    {/* TOTAL */}

                    <td className="p-3 text-center font-bold text-blue-700">
                      ₹{item.total}
                    </td>

                    {/* DELETE */}

                    <td className="p-3 rounded-r-2xl text-center">

                      <button
                        onClick={() =>
                          deleteRow(
                            index
                          )
                        }
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
                      >
                        ❌
                      </button>

                    </td>

                  </tr>
                )
              )}

            </tbody>

          </table>

        </div>

        {/* ================================================= */}
        {/* BUTTONS */}
        {/* ================================================= */}

        <div className="flex flex-wrap gap-4 mt-8">

          <button
            onClick={startVoiceInput}
            className={`${
              listening
                ? "bg-red-600"
                : "bg-orange-500"
            } hover:bg-orange-600 text-white px-6 py-3 rounded-2xl shadow-lg font-semibold`}
          >
            {listening
              ? "🎙 Listening..."
              : "🎤 Voice Input"}
          </button>

          <button
            onClick={addRow}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl shadow-lg font-semibold"
          >
            + Add Item
          </button>

          <button
            onClick={previewPDF}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-2xl shadow-lg font-semibold"
          >
            Preview PDF
          </button>

          <button
            onClick={sendMail}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl shadow-lg font-semibold"
          >
            📧 Send to Mail
          </button>

          <button
            onClick={sendWhatsApp}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl shadow-lg font-semibold"
          >
            🟢 Send to WhatsApp
          </button>

          <button
            onClick={() =>
              window.print()
            }
            className="bg-gray-800 hover:bg-black text-white px-6 py-3 rounded-2xl shadow-lg font-semibold"
          >
            🖨 Print Bill
          </button>

        </div>

        {/* ================================================= */}
        {/* TOTALS */}
        {/* ================================================= */}

        <div className="flex justify-end mt-10">

          <div className="bg-blue-50 rounded-3xl shadow-lg p-6 w-full md:w-96">

            <div className="flex justify-between text-2xl font-bold text-blue-700">

              <span>
                Grand Total
              </span>

              <span>
                ₹{grandTotal}
              </span>

            </div>

            <div className="flex justify-between mt-4 text-xl font-semibold text-green-600">

              <span>
                Advance Paid
              </span>

              <span>
                ₹{advanceAmount}
              </span>

            </div>

            <div className="flex justify-between mt-4 text-xl font-semibold text-red-600">

              <span>
                Pending Amount
              </span>

              <span>
                ₹{
                  grandTotal -
                  advanceAmount
                }
              </span>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div className="border-t mt-12 pt-6 text-center text-gray-600">

          <p>
            Thank You! Visit Again.
          </p>

          <p className="mt-2">
            © 2026 SREE AADYA DRY CLEANING
          </p>

          <p>
            Developed by Krishna Vamshi
          </p>

        </div>

      </div>

    </div>
  );
}