// ==========================================
// COLLEGE INFORMATION BOT - BACKEND
// ==========================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { GoogleGenAI } = require("@google/genai");

const User = require("./models/User");
const College = require("./models/college");

const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());


// ==========================================
// MONGODB ATLAS CONNECTION
// ==========================================

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB Atlas Connected Successfully ✅");
  })
  .catch((error) => {
    console.log("MongoDB Connection Failed ❌");
    console.log(error.message);
  });


// ==========================================
// GEMINI AI SETUP
// ==========================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

console.log(
  "Gemini API Key:",
  process.env.GEMINI_API_KEY ? "Loaded ✅" : "Not Found ❌"
);


// ==========================================
// HOME ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message: "College Information Bot Backend is running! 🚀"
  });
});

// =============================
// COLLEGE ROUTE
// =============================

app.get("/api/colleges", async (req, res) => {
  try {
    const colleges = await College.find({});

    res.json({
      success: true,
      colleges
    });
  } catch (error) {
    console.error("COLLEGE FETCH ERROR:");
    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Could not fetch colleges from MongoDB."
    });
  }
});
// ==========================================
// MONGODB TEST ROUTE
// ==========================================

app.get("/api/test-mongodb", (req, res) => {

  if (mongoose.connection.readyState === 1) {

    res.json({
      success: true,
      message: "MongoDB Atlas is connected successfully ✅"
    });

  } else {

    res.status(500).json({
      success: false,
      message: "MongoDB Atlas is not connected ❌"
    });

  }

});


// ==========================================
// GET ALL COLLEGES
// ==========================================

app.get("/api/colleges", async (req, res) => {

  try {

    const colleges = await College.find({});

    res.json({
      success: true,
      colleges
    });

  } catch (error) {

    console.error("--------------------------------");
    console.error("COLLEGE FETCH ERROR:");
    console.error(error.message);
    console.error("--------------------------------");

    res.status(500).json({
      success: false,
      message: "Could not fetch colleges from MongoDB."
    });

  }

});


// ==========================================
// SAVE USER TO MONGODB
// ==========================================

app.post("/api/users", async (req, res) => {

  try {

    const {
      firebaseUid,
      name,
      email,
      phone,
      photoURL
    } = req.body;


    // Check Firebase UID

    if (!firebaseUid) {

      return res.status(400).json({
        success: false,
        message: "Firebase UID is required."
      });

    }


    // Find existing user or create new user

    const user = await User.findOneAndUpdate(

      { firebaseUid },

      {
        firebaseUid,
        name: name || "",
        email: email || "",
        phone: phone || "",
        photoURL: photoURL || ""
      },

      {
        new: true,
        upsert: true
      }

    );


    console.log("User saved to MongoDB ✅");
    console.log(
      "User:",
      user.name || user.email || user.phone
    );


    res.json({

      success: true,

      message: "User saved successfully ✅",

      user

    });


  } catch (error) {

    console.error("--------------------------------");
    console.error("USER SAVE ERROR:");
    console.error(error.message);
    console.error("--------------------------------");


    res.status(500).json({

      success: false,

      message: "Could not save user to MongoDB."

    });

  }

});


// ==========================================
// TEST GEMINI
// ==========================================

app.get("/api/test-gemini", async (req, res) => {

  try {

    const response = await ai.models.generateContent({

      model: "gemini-3.6-flash",

      contents: "Say hello in one short sentence."

    });


    res.json({

      success: true,

      reply: response.text

    });


  } catch (error) {

    console.error("Gemini Test Error:", error.message);


    res.status(500).json({

      success: false,

      error: error.message

    });

  }

});


// ==========================================
// COLLEGE CHATBOT
// ==========================================

app.post("/api/chat", async (req, res) => {

  try {

    const {
      message,
      college
    } = req.body;


    console.log("--------------------------------");
    console.log("Question:", message);
    console.log("College:", college?.name);


    // ==========================================
    // CHECK QUESTION
    // ==========================================

    if (!message || !message.trim()) {

      return res.status(400).json({

        reply: "Please enter a question."

      });

    }


    // ==========================================
    // CHECK COLLEGE
    // ==========================================

    if (!college) {

      return res.status(400).json({

        reply: "Please select a college first."

      });

    }


    // ==========================================
    // COLLEGE DATA
    // ==========================================

    const collegeData = JSON.stringify(

      college,

      null,

      2

    );


    // ==========================================
    // GEMINI PROMPT
    // ==========================================

    const prompt = `

You are the AI Assistant for the selected college.

SELECTED COLLEGE:
${college.name}

COLLEGE INFORMATION:
${collegeData}

STUDENT QUESTION:
${message}

RULES:

1. Answer only about the selected college.

2. Use the college information provided above.

3. Do not invent any information.

4. Do not invent fees.

5. Do not invent courses.

6. Do not invent admission requirements.

7. Do not invent placement information.

8. If the exact requested information is available
   in the college data, answer clearly.

9. If the requested information is not available,
   say:
   "Sorry, this information is not available in my college data."

10. If the user asks about a course fee, find the
    matching course inside the courses array and
    give its fee.

11. If the fee says "Programme-specific", do not
    create an exact amount. Tell the student that
    the fee is programme-specific.

12. Keep the answer simple and student-friendly.

13. Answer in the same language as the student.

`;


    // ==========================================
    // SEND REQUEST TO GEMINI
    // ==========================================

    console.log("Sending request to Gemini...");


    const response = await ai.models.generateContent({

      model: "gemini-3.6-flash",

      contents: prompt

    });


    console.log("Gemini response received ✅");


    // ==========================================
    // SEND RESPONSE TO FRONTEND
    // ==========================================

    res.json({

      reply: response.text

    });


  } catch (error) {

    console.error("--------------------------------");
    console.error("GEMINI ERROR:");
    console.error(error.message);
    console.error("--------------------------------");


    res.status(500).json({

      reply: "Sorry, chatbot is temporarily unavailable."

    });

  }

});


// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {

  console.log("--------------------------------");
  console.log("College Information Bot Backend");
  console.log("--------------------------------");

  console.log(
    `Server running on http://localhost:${PORT}`
  );

  console.log("--------------------------------");

});