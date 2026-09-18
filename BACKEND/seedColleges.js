require("dotenv").config();

const mongoose = require("mongoose");
const College = require("./models/college");

const colleges = [
  {
    name: "Manav Rachna International Institute of Research & Studies",
    shortName: "MRIIRS",
    location: "Faridabad, Haryana",
    image: "/college-images/mriirs.jpg",
    website: "https://www.manavrachna.edu.in/",
    courses: [
      { name: "B.Tech CSE", fee: "₹3,05,800/year" },
      { name: "B.Tech CSE + Industry Specialization", fee: "₹3,33,800/year" },
      { name: "B.Tech Civil/ECE/Biotech", fee: "₹2,12,400/year" },
      { name: "BCA", fee: "₹2,01,500/year" },
      { name: "BCA + Industry Specialization", fee: "₹2,41,800/year" },
      { name: "MCA", fee: "₹2,18,100/year" },
      { name: "BBA", fee: "₹2,34,400/year" },
      { name: "B.Com (Hons.)", fee: "₹1,78,300/year" },
      { name: "B.Com (Hons.) + ACCA", fee: "₹2,30,000/year" },
      { name: "B.Design + Industry Partner", fee: "₹3,13,400/year" },
      { name: "BPT", fee: "₹2,95,000/year" },
      { name: "B.Sc. Microbiology", fee: "₹1,67,100/year" },
      { name: "B.A. English", fee: "₹1,55,800/year" },
      { name: "MBA", fee: "₹3,93,800/year" }
    ]
  },

  {
    name: "Manav Rachna University",
    shortName: "MRU",
    location: "Faridabad, Haryana",
    image: "/college-images/mru.jpg",
    website: "https://manavrachna.edu.in/",
    courses: [
      { name: "B.Tech CSE", fee: "₹3,05,800/year" },
      { name: "B.Tech CSE AI & ML", fee: "₹3,33,800/year" },
      { name: "B.Tech CSE Cyber Security", fee: "₹3,33,800/year" },
      { name: "B.Tech CSE Gen AI", fee: "₹3,33,800/year" },
      { name: "BCA FinTech", fee: "₹2,41,800/year" },
      { name: "BCA Cloud Computing", fee: "₹2,41,800/year" },
      { name: "B.Tech ECE Specializations", fee: "₹2,56,500/year" },
      { name: "B.Tech Mechanical Specializations", fee: "₹2,56,500/year" },
      { name: "B.Tech Robotics & AI", fee: "₹2,56,500/year" },
      { name: "BBA", fee: "₹2,34,400/year" },
      { name: "BBA Business Analytics", fee: "₹2,51,400/year" },
      { name: "BBA Data Analytics & AI", fee: "₹2,51,400/year" },
      { name: "MBA Business Analytics", fee: "₹3,93,800/year" },
      { name: "M.Tech Computer Engineering", fee: "₹1,45,200/year" },
      { name: "M.Sc Chemistry", fee: "₹1,10,000/year" },
      { name: "M.Sc Physics + Quantum Computing", fee: "₹1,40,000/year" }
    ]
  },

  {
    name: "Lovely Professional University",
    shortName: "LPU",
    location: "Phagwara, Punjab",
    image: "/college-images/lpu.jpg",
    website: "https://www.lpu.in/",
    courses: [
      { name: "B.Tech CSE", fee: "₹1,60,000/semester" },
      { name: "B.Tech CSE – AI & Data Engineering", fee: "₹1,60,000/semester" },
      { name: "B.Tech – Other Branches", fee: "Programme-specific" },
      { name: "BCA", fee: "Programme-specific" },
      { name: "BCA – Data Science", fee: "Programme-specific" },
      { name: "BCA – AI & Robotics", fee: "Programme-specific" },
      { name: "BCA – Cyber Security", fee: "Programme-specific" },
      { name: "BBA", fee: "Programme-specific" },
      { name: "BBA – Business Analytics", fee: "Programme-specific" },
      { name: "MCA", fee: "Programme-specific" },
      { name: "MCA – Data Science", fee: "Programme-specific" },
      { name: "MCA – AI & ML", fee: "Programme-specific" },
      { name: "MCA – Cyber Security", fee: "Programme-specific" },
      { name: "MBA", fee: "Programme-specific" },
      { name: "MBA – Business Analytics", fee: "Programme-specific" },
      { name: "MBA – FinTech & AI", fee: "Programme-specific" },
      { name: "MBA – Data Science & AI", fee: "Programme-specific" }
    ]
  },

  {
    name: "BITS Pilani",
    shortName: "BITS Pilani",
    location: "Pilani, Rajasthan",
    image: "/college-images/bits-pilani.jpg",
    website: "https://www.bits-pilani.ac.in/",
    courses: [
      { name: "B.E.", fee: "₹2,91,500/semester" },
      { name: "M.E.", fee: "₹2,91,500/semester" },
      { name: "MBA", fee: "Programme-specific" },
      { name: "PhD", fee: "Programme-specific" }
    ]
  },

  {
    name: "Amity University Noida",
    shortName: "Amity Noida",
    location: "Noida, Uttar Pradesh",
    image: "/college-images/amity.jpg",
    website: "https://www.amity.edu/",
    courses: [
      { name: "B.Tech CSE", fee: "₹2.19 lakh/semester" },
      { name: "B.Tech AI", fee: "₹2.19 lakh/semester" },
      { name: "BCA", fee: "₹1.26 lakh/semester" },
      { name: "BBA", fee: "₹2.19 lakh/semester" },
      { name: "BBA International", fee: "₹2.40 lakh/semester" },
      { name: "B.A. LL.B.", fee: "₹1.99 lakh/semester" },
      { name: "MBA Marketing & Sales", fee: "₹3.62 lakh/semester" }
    ]
  },

  {
    name: "Sharda University",
    shortName: "Sharda",
    location: "Greater Noida, Uttar Pradesh",
    image: "/college-images/sharda.jpg",
    website: "https://www.sharda.ac.in/",
    courses: [
      { name: "B.Tech CSE", fee: "Year 1 ₹2,95,000; Year 2 ₹3,03,850; Year 3 ₹3,12,966; Year 4 ₹3,22,354" },
      { name: "BCA", fee: "Programme-specific" },
      { name: "BBA", fee: "Programme-specific" },
      { name: "MCA", fee: "Programme-specific" },
      { name: "MBA", fee: "Programme-specific" }
    ]
  },

  {
    name: "Chandigarh University",
    shortName: "CU",
    location: "Mohali, Punjab",
    image: "/college-images/chandigarh-university.jpg",
    website: "https://www.cuchd.in/",
    courses: [
      { name: "B.E. CSE", fee: "₹1,46,000/semester" },
      { name: "B.E. CSE – Cloud Computing", fee: "₹1,56,000/semester" },
      { name: "B.E. CSE – AI & ML", fee: "₹1,75,000/semester" },
      { name: "B.E. CSE – IoT", fee: "₹1,59,000/semester" },
      { name: "B.E. CSE – Data Science", fee: "₹1,60,000/semester" },
      { name: "B.E. CSE – Cyber Security", fee: "₹1,60,000/semester" },
      { name: "B.E. CSE – Full Stack Development", fee: "₹1,59,000/semester" },
      { name: "BCA", fee: "₹78,000/semester" },
      { name: "BCA – AR/VR", fee: "₹80,000/semester" },
      { name: "BCA – UI/UX Design", fee: "₹80,000/semester" },
      { name: "BCA – Data Science", fee: "₹85,000/semester" },
      { name: "BBA", fee: "₹84,000/semester" },
      { name: "BBA – Business Analytics", fee: "₹89,000/semester" },
      { name: "BBA – Digital Marketing", fee: "₹89,000/semester" },
      { name: "BBA – FinTech", fee: "₹89,000/semester" },
      { name: "BBA – Logistics & Supply Chain", fee: "₹88,000/semester" },
      { name: "B.Com (Hons.)", fee: "₹80,000/semester" },
      { name: "B.Com (Hons.) + ACCA", fee: "₹1,02,000/semester" },
      { name: "MCA", fee: "₹86,000/semester" },
      { name: "MCA – AI & ML", fee: "₹91,000/semester" },
      { name: "MCA – Cloud Computing & DevOps", fee: "₹89,000/semester" },
      { name: "MBA", fee: "₹1,54,000/semester" },
      { name: "MBA – Business Analytics + IBM", fee: "₹1,76,000/semester" },
      { name: "MBA – Digital Marketing", fee: "₹1,60,000/semester" },
      { name: "MBA – FinTech", fee: "₹1,90,000/semester" },
      { name: "MBA – Data Science & AI", fee: "₹1,71,000/semester" },
      { name: "B.Arch", fee: "₹1,11,000/semester" },
      { name: "B.Pharm", fee: "₹1,42,000/semester" },
      { name: "B.Sc. Biotechnology", fee: "₹73,000/semester" },
      { name: "B.Sc. Microbiology", fee: "₹65,000/semester" },
      { name: "B.Sc. Forensic Science", fee: "₹73,000/semester" },
      { name: "B.Sc. Computer Science", fee: "₹60,000/semester" },
      { name: "B.Sc. Mathematics", fee: "₹48,000/semester" },
      { name: "B.Sc. Physics", fee: "₹48,000/semester" },
      { name: "B.Sc. Chemistry", fee: "₹48,000/semester" },
      { name: "BPT", fee: "₹85,000/semester" },
      { name: "B.A. Psychology", fee: "₹64,000/semester" },
      { name: "B.A. Journalism & Mass Communication", fee: "₹79,000/semester" },
      { name: "B.LLB", fee: "₹75,000/semester" },
      { name: "BBA LLB", fee: "₹1,01,000/semester" }
    ]
  }
];


async function seedDatabase() {
  try {

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected ✅");

    await College.deleteMany({});

    console.log("Old college data removed.");

    await College.insertMany(colleges);

    console.log("7 colleges inserted successfully ✅");

    await mongoose.connection.close();

    console.log("Database connection closed.");

  } catch (error) {

    console.error("Database seed error ❌");
    console.error(error.message);

    process.exit(1);
  }
}


seedDatabase();
