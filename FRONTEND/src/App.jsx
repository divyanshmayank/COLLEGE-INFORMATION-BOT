import { useState, useEffect } from "react";
import LoginPopup from "./LoginPopup";
import colleges from "./data/colleges";

import { auth } from "./firebase";
import "./App.css";
import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
function App() {
  // ================= AUTH STATE =================

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);


  // ================= APP STATE =================

  const [search, setSearch] = useState("");
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [favoriteColleges, setFavoriteColleges] = useState([]);
  const [compareColleges, setCompareColleges] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [chatHistory, setChatHistory] = useState([]);
  // ================= COMPARISON =================

const toggleCompare = (college) => {
  setCompareColleges((prev) => {
    const alreadyAdded = prev.some(
      (item) => item.id === college.id
    );

    if (alreadyAdded) {
      return prev.filter(
        (item) => item.id !== college.id
      );
    }

    if (prev.length >= 3) {
      return prev;
    }

    return [...prev, college];
  });
};

const isInCompare = (college) => {
  return compareColleges.some(
    (item) => item.id === college.id
  );
};

  // ================= CHAT STATE =================

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistoryLoaded, setChatHistoryLoaded] = useState(false);

  // ================= FIREBASE AUTH LISTENER =================

 useEffect(() => {
  const unsubscribe = onAuthStateChanged(
    auth,
    async (currentUser) => {
      setUser(currentUser);

      // Login check complete
      setAuthLoading(false);

      // Save user in MongoDB in background
      if (currentUser) {
        try {
          const response = await fetch(
            `${API_URL}/api/users`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                firebaseUid: currentUser.uid,
                name: currentUser.displayName || "",
                email: currentUser.email || "",
                phone: currentUser.phoneNumber || "",
                photoURL: currentUser.photoURL || "",
              }),
            }
          );

          const data = await response.json();

          if (data.success) {
            console.log(
              "User saved to MongoDB successfully ✅"
            );
          } else {
            console.log(
              "User was not saved ❌",
              data.message
            );
          }
        } catch (error) {
          console.error(
            "MongoDB user save error:",
            error
          );
        }
      }
    }
  );

  return () => unsubscribe();
}, []);
useEffect(() => {
  const fetchColleges = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/colleges`,
      );

      const data = await response.json();

      if (data.success) {
        setColleges(data.colleges);
      } else {
        console.error("College data fetch failed");
      }
    } catch (error) {
      console.error("College fetch error:", error);
    } finally {
      setCollegeLoading(false);
    }
  };

  fetchColleges();
}, []);

  // ================= LOGOUT =================

  const handleLogout = async () => {
    try {
      await signOut(auth);

      setUser(null);
      setSelectedCollege(null);
      setChatMessages([]);
      setChatInput("");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
// ================= FAVORITES =================

useEffect(() => {
  if (!user) return;

  const savedFavorites = localStorage.getItem(
    `collegeFavorites_${user.uid}`
  );

  if (savedFavorites) {
    setFavoriteColleges(
      JSON.parse(savedFavorites)
    );
  } else {
    setFavoriteColleges([]);
  }
}, [user]);

const toggleFavorite = (college) => {
  if (!user) return;

  const collegeId =
    college.shortName || college.id;

  setFavoriteColleges((prev) => {
    const alreadyFavorite =
      prev.includes(collegeId);

    const updatedFavorites =
      alreadyFavorite
        ? prev.filter(
            (id) => id !== collegeId
          )
        : [...prev, collegeId];

    localStorage.setItem(
      `collegeFavorites_${user.uid}`,
      JSON.stringify(updatedFavorites)
    );

    return updatedFavorites;
  });
};

const isFavorite = (college) => {
  const collegeId =
    college.shortName || college.id;

  return favoriteColleges.includes(collegeId);
};
  // ================= CHECKING LOGIN =================

  if (authLoading) {
    return (
      <div className="auth-loading">
        Checking login...
      </div>
    );
  }

  // ================= LOGIN REQUIRED =================

  if (!user) {
    return (
      <LoginPopup
        onLogin={setUser}
      />
    );
  }

  // ================= SEARCH COLLEGES =================

  const filteredColleges = colleges.filter(
    (college) =>
      college.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||

      college.location
        .toLowerCase()
        .includes(search.toLowerCase()) ||

      college.courses.some((course) =>
        course.name
          .toLowerCase()
          .includes(search.toLowerCase())
      )
  );

  // ================= OPEN COLLEGE =================

  const openCollege = (college) => {
  setSelectedCollege(college);

  const historyKey =
    `chatHistory_${user.uid}_${college.id}`;

  const savedHistory =
    localStorage.getItem(historyKey);

  if (savedHistory) {
    setChatMessages(JSON.parse(savedHistory));
  } else {
    setChatMessages([
      {
        role: "assistant",
        text: `Hi! 👋 I am the AI Assistant for ${college.shortName}. Ask me about fees, courses, admission, placements, hostel or eligibility.`,
      },
    ]);
  }

  setChatHistoryLoaded(true);
  setChatInput("");

  setTimeout(() => {
    document
      .getElementById("college-details")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }, 100);
};
// ================= CHAT HISTORY =================

const loadChatHistory = () => {
  if (!user) return;

  const historyList = [];

  colleges.forEach((college) => {
    const historyKey =
      `chatHistory_${user.uid}_${college.id}`;

    const savedHistory =
      localStorage.getItem(historyKey);

    if (savedHistory) {
      try {
        const messages =
          JSON.parse(savedHistory);

        if (messages.length > 0) {
          historyList.push({
            college: college,
            messages: messages
          });
        }
      } catch (error) {
        console.error(
          "Chat history error:",
          error
        );
      }
    }
  });

  setChatHistory(historyList);
};

  // ================= CLOSE COLLEGE =================

  const closeCollege = () => {
    setSelectedCollege(null);
    setChatMessages([]);
    setChatInput("");
  };

  // ================= CLEAR CHAT =================

  const clearChat = () => {
    if (!selectedCollege) return;

    setChatMessages([
      {
        role: "assistant",
        text: `Chat cleared! 👋 Ask me anything about ${selectedCollege.shortName}.`,
      },
    ]);

    setChatInput("");
  };

  // ================= SEND MESSAGE =================

  const sendMessage = async (
    question = chatInput
  ) => {
    if (
      !question.trim() ||
      !selectedCollege ||
      chatLoading
    ) {
      return;
    }

    const userMessage = question.trim();

    // Clear input
    setChatInput("");

    // Show user's message
    setChatMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: userMessage,
      },
    ]);

    setChatLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/chat`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            message: userMessage,
            college: selectedCollege,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status}`
        );
      }

      const data = await response.json();
      const updatedMessages = [
  ...chatMessages,
  {
    role: "user",
    text: userMessage,
  },
  {
    role: "assistant",
    text:
      data.reply ||
      "Sorry, I could not find an answer right now.",
  },
];

localStorage.setItem(
  `chatHistory_${user.uid}_${selectedCollege.id}`,
  JSON.stringify(updatedMessages)
);

      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            data.reply ||
            "Sorry, I could not find an answer right now.",
        },
      ]);
    } catch (error) {
      console.error(
        "Chatbot connection error:",
        error
      );

      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            "⚠️ I couldn't connect to the chatbot server. Please make sure your backend is running on port 5000.",
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // ================= QUICK QUESTION =================

  const askQuickQuestion = (question) => {
    sendMessage(question);
  };

  // ================= FORMAT AI MESSAGE =================

  const formatMessage = (text) => {
    if (!text) return null;

    const lines = text.split("\n");

    return lines.map((line, index) => {
      // ================= MARKDOWN LINK =================

      const markdownLink = line.match(
        /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/
      );

      if (markdownLink) {
        const linkText = markdownLink[1];
        const linkUrl = markdownLink[2];

        const beforeLink = line.split(
          markdownLink[0]
        )[0];

        const afterLink = line.split(
          markdownLink[0]
        )[1];

        return (
          <div key={index}>
            {beforeLink}

            <a
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="chat-link"
            >
              🌐 {linkText}
            </a>

            {afterLink}
          </div>
        );
      }

      // ================= NORMAL URL =================

      const urlRegex =
        /(https?:\/\/[^\s]+)/g;

      const parts = line.split(urlRegex);

      return (
        <div key={index}>
          {parts.map((part, i) => {
            if (
              part.match(/^https?:\/\//)
            ) {
              return (
                <a
                  key={i}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chat-link"
                >
                  🌐 Visit Website
                </a>
              );
            }

            return (
              <span key={i}>
                {part}
              </span>
            );
          })}
        </div>
      );
    });
  };

  // =====================================================
  // ================= MAIN UI ===========================
  // =====================================================

  return (
    <div className="app">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">

        <div className="logo">
          🎓  CampusAura AI
        <button
  style={{
    display: "block",
    position: "relative",
    zIndex: 99999,
    fontSize: "30px",
    background: "red",
    color: "white",
    border: "2px solid black",
    padding: "5px 12px",
    cursor: "pointer"
  }}
  onClick={() => setShowMobileMenu(!showMobileMenu)}
>
  ☰
</button>

        <div className="nav-links">

          <a href="#home">
            Home
          </a>

          <a href="#colleges">
            Colleges
          </a>

          <a href="#about">
            About
          </a>

 <button
  onClick={() => {
    document
      .getElementById("colleges")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }}
>
  Colleges
</button>

<button
  onClick={() => {
    loadChatHistory();
    setShowChatHistory(!showChatHistory);
  }}
>
  💬 Chat History
</button>

<button
  onClick={() => {
    document
      .getElementById("ai-assistant")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }}
>
  🤖 AI Assistant
</button>



          {/* ================= USER PROFILE ================= */}

          <div className="user-profile">

            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="profile-image"
              />
            ) : (
              <div className="profile-placeholder">
                👤
              </div>
            )}

            <div className="profile-info">

              <strong>
                {user.displayName ||
                  "User"}
              </strong>

              <span>
                {user.email ||
                  user.phoneNumber ||
                  "Mobile User"}
              </span>

            </div>

            <button
              className="logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </div>
{showMobileMenu && (
  <div className="mobile-menu">

    <a
      href="#home"
      onClick={() => setShowMobileMenu(false)}
    >
      Home
    </a>

    <a
      href="#colleges"
      onClick={() => setShowMobileMenu(false)}
    >
      Colleges
    </a>

    <a
      href="#about"
      onClick={() => setShowMobileMenu(false)}
    >
      About
    </a>

    <button
      onClick={() => {
        loadChatHistory();
        setShowChatHistory(!showChatHistory);
        setShowMobileMenu(false);
      }}
    >
      💬 Chat History
    </button>

    <button
      onClick={() => {
        document
          .getElementById("ai-assistant")
          ?.scrollIntoView({
            behavior: "smooth",
          });

        setShowMobileMenu(false);
      }}
    >
      🤖 AI Assistant
    </button>

    <div className="mobile-user">
      <strong>
        {user.displayName || "User"}
      </strong>

      <span>
        {user.email ||
          user.phoneNumber ||
          "Mobile User"}
      </span>
    </div>

    <button
      className="mobile-logout-button"
      onClick={() => {
        handleLogout();
        setShowMobileMenu(false);
      }}
    >
      🚪 Logout
    </button>

  </div>
)}
      </nav>

      {/* ================= HERO ================= */}

      <section
        className="hero-section"
        id="home"
      >

        <div className="hero-content">

          <p className="welcome">
            WELCOME TO CampusAura AI
          </p>

          <h1>
            Find the Right
            <span>
              College for You
            </span>
          </h1>

          <p className="hero-text">
            Search colleges, explore courses
            and get answers about fees,
            admission and more using AI.
          </p>

          {/* ================= SEARCH ================= */}

          <div className="search-box">

            <input
              type="text"
              placeholder="Search college, location or course..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            <button>
              🔍 Search
            </button>

          </div>

          {/* ================= QUICK BUTTONS ================= */}

          <div className="quick-buttons">

            <button
              onClick={() =>
                document
                  .getElementById("colleges")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              🏫 Find Colleges
            </button>

            <button
              onClick={() =>
                document
                  .getElementById("colleges")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              🤖 Ask AI
            </button>

          </div>

        </div>

      </section>

      {/* ================= COLLEGES ================= */}

      <section
        className="college-results"
        id="colleges"
      >

        <h2>
          Explore Private Colleges
        </h2>

        <p className="results-text">
          Explore colleges, courses and
          campus information.
        </p>

        <p className="result-count">
          {filteredColleges.length} college
          {filteredColleges.length !== 1
            ? "s"
            : ""}{" "}
          found
        </p>

        <div className="college-container">

          {filteredColleges.length > 0 ? (

            filteredColleges.map(
              (college) => (

                <div
                  className="college-card"
                  key={college.id}
                >
                  <button
  type="button"
  onClick={() => toggleFavorite(college)}
  style={{
    position: "absolute",
    top: "15px",
    right: "15px",
    zIndex: 5,
    border: "none",
    borderRadius: "50%",
    width: "42px",
    height: "42px",
    fontSize: "22px",
    cursor: "pointer",
    background: "white",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
  }}
>
  {isFavorite(college) ? "❤️" : "🤍"}
</button>
<button
  type="button"
  onClick={() => toggleCompare(college)}
  style={{
    position: "absolute",
    top: "65px",
    right: "15px",
    zIndex: 5,
    border: "none",
    borderRadius: "20px",
    padding: "7px 12px",
    fontSize: "13px",
    cursor: "pointer",
    background: isInCompare(college)
     ? "#172033"
      : "white",
    color: isInCompare(college)
      ? "white"
      : "#172033",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
  }}
>
  {isInCompare(college)
    ? "✓ Added"
    : "⚖️ Compare"}
</button>
                  {/* COLLEGE IMAGE */}

                  <div className="college-image-container">

                    <img
                      src={college.image}
                      alt={college.name}
                      className="college-image"
                    />

                  </div>

                  {/* CARD CONTENT */}

                  <div className="college-card-content">

                    <span className="college-type">
                      {college.type}
                    </span>

                    <h3>
                      {college.name}
                    </h3>

                    <p className="college-location">
                      📍 {college.location}
                    </p>

                    <p className="course-count">
                      📚{" "}
                      {college.courses.length}{" "}
                      courses available
                    </p>

                    <button
                      className="explore-button"
                      onClick={() =>
                        openCollege(college)
                      }
                    >
                      Explore College →
                    </button>

                  </div>

                </div>

              )
            )

          ) : (

            <div className="no-results">

              <div className="no-results-icon">
                🔍
              </div>

              <h3>
                No colleges found
              </h3>

              <p>
                Try searching for another
                college, city or course.
              </p>

            </div>

          )}

        </div>

      </section>
{/* ================= COMPARISON PANEL ================= */}

{compareColleges.length > 0 && (
  <section className="comparison-panel">

    <h2>⚖️ Compare Colleges</h2>

    <p>
      {compareColleges.length} of 3 colleges selected
    </p>

    <div className="comparison-selected">

      {compareColleges.map((college) => (
        <div
          className="comparison-item"
          key={college.id}
        >

          <img
            src={college.image}
            alt={college.name}
          />

          <div>
            <h3>{college.name}</h3>
            <p>📍 {college.location}</p>
          </div>

          <button
            type="button"
            onClick={() => toggleCompare(college)}
          >
            ✕
          </button>

        </div>
      ))}

    </div>

    <button
      type="button"
      className="compare-now-button"
      disabled={compareColleges.length < 2}
      onClick={() => setShowComparison(true)}
    >
      ⚖️ Compare Now
    </button>

  </section>
)}
{/* ================= ACTUAL COMPARISON ================= */}

{showComparison && compareColleges.length >= 2 && (
  <section className="comparison-table-section">

    <div className="comparison-header">

      <div>
        <h2>⚖️ College Comparison</h2>
        <p>Compare your selected colleges side by side.</p>
      </div>

      <button
        type="button"
        onClick={() => setShowComparison(false)}
      >
        ✕ Close
      </button>

    </div>

    <div className="comparison-table-wrapper">

      <table className="comparison-table">

        <thead>
          <tr>
            <th>Details</th>

            {compareColleges.map((college) => (
              <th key={college.id}>
                <img
                  src={college.image}
                  alt={college.name}
                />

                <h3>{college.name}</h3>
              </th>
            ))}

          </tr>
        </thead>

        <tbody>

          <tr>
            <td>📍 Location</td>

            {compareColleges.map((college) => (
              <td key={college.id}>
                {college.location}
              </td>
            ))}

          </tr>

          <tr>
            <td>🏫 Type</td>

            {compareColleges.map((college) => (
              <td key={college.id}>
                {college.type}
              </td>
            ))}

          </tr>

          <tr>
            <td>📚 Total Courses</td>

            {compareColleges.map((college) => (
              <td key={college.id}>
                {college.courses.length}
              </td>
            ))}

          </tr>

          <tr>
            <td>📖 Courses</td>

            {compareColleges.map((college) => (
              <td key={college.id}>
                <ul className="comparison-course-list">

                  {college.courses.map(
                    (course, index) => (
                      <li key={index}>
                        {course.name}
                      </li>
                    )
                  )}

                </ul>
              </td>
            ))}

          </tr>

          <tr>
            <td>💰 Fee Information</td>

            {compareColleges.map((college) => (
              <td key={college.id}>
                <ul className="comparison-fee-list">

                  {college.courses.map(
                    (course, index) => (
                      <li key={index}>
                        <strong>
                          {course.name}
                        </strong>

                        <br />

                        {course.fee}
                      </li>
                    )
                  )}

                </ul>
              </td>
            ))}

          </tr>

        </tbody>

      </table>

    </div>

  </section>
)}
      {/* ================= COLLEGE DETAILS ================= */}

      {selectedCollege && (

        <section
          className="college-details"
          id="college-details"
        >

          <button
            className="back-button"
            onClick={closeCollege}
          >
            ← Back to Colleges
          </button>

          <div className="details-card">

            {/* ================= COLLEGE IMAGE ================= */}

            <img
              src={selectedCollege.image}
              alt={selectedCollege.name}
              className="details-image"
            />

            {/* ================= COLLEGE HEADING ================= */}

            <div className="details-heading">

              <span className="college-type">
                {selectedCollege.type}
              </span>

              <h2>
                {selectedCollege.name}
              </h2>

              <p>
                📍 {selectedCollege.location}
              </p>

            </div>

            {/* ================= COURSES ================= */}

            <div className="courses-section">

              <h3>
                📚 Available Courses
              </h3>

              <p className="course-note">
                Course names are shown below.
                Ask the college chatbot for
                fee and other course details.
              </p>

              <div className="course-list">

                {selectedCollege.courses.map(
                  (course, index) => (

                    <div
                      className="course-item"
                      key={index}
                    >
                      <span>
                        🎓
                      </span>

                      {course.name}
                    </div>

                  )
                )}

              </div>

            </div>

            {/* ================= OTHER INFORMATION ================= */}

            <div className="college-info-grid">

              {/* ADMISSION */}

              <div className="info-box">

                <h3>
                  🎯 Admission
                </h3>

                <p>
                  {selectedCollege.admission}
                </p>

              </div>

              {/* PLACEMENT */}

              <div className="info-box">

                <h3>
                  💼 Placement
                </h3>

                <p>
                  {selectedCollege.placement}
                </p>

              </div>

              {/* FACILITIES */}

              <div className="info-box">

                <h3>
                  🏫 Facilities
                </h3>

                <div className="facility-list">

                  {selectedCollege.facilities.map(
                    (facility, index) => (

                      <span
                        key={index}
                      >
                        {facility}
                      </span>

                    )
                  )}

                </div>

              </div>

            </div>

            {/* =================================================
                ================= CHATBOT =======================
               ================================================= */}

            <div className="college-chatbot">

              {/* ================= CHATBOT HEADER ================= */}

              <div className="chatbot-header">

                <div className="chatbot-title">

                  <span className="bot-icon">
                    🤖
                  </span>

                  <div>

                    <h3>
                      {
                        selectedCollege.shortName
                      }{" "}
                      AI Assistant
                    </h3>

                    <p>
                      Ask anything about
                      this college
                    </p>

                  </div>

                </div>

                <div className="chat-actions">

                  <span className="online-status">
                    ● Online
                  </span>

                  <button
                    className="clear-chat-button"
                    onClick={clearChat}
                  >
                    🧹 Clear
                  </button>

                </div>

              </div>

              {/* ================= CHAT MESSAGES ================= */}

              <div className="chat-messages">

                {chatMessages.map(
                  (message, index) => (

                    <div
                      key={index}
                      className={`chat-row ${
                        message.role ===
                        "user"
                          ? "chat-row-user"
                          : "chat-row-bot"
                      }`}
                    >

                      {/* BOT AVATAR */}

                      {message.role ===
                        "assistant" && (

                        <div className="message-avatar">
                          🤖
                        </div>

                      )}

                      {/* MESSAGE */}

                      <div
                        className={`chat-message ${
                          message.role ===
                          "user"
                            ? "user-message"
                            : "bot-message"
                        }`}
                      >

                        {formatMessage(
                          message.text
                        )}

                      </div>

                    </div>

                  )
                )}

                {/* ================= THINKING ================= */}

                {chatLoading && (

                  <div className="chat-row chat-row-bot">

                    <div className="message-avatar">
                      🤖
                    </div>

                    <div className="chat-message bot-message thinking-message">

                      <span>
                        AI is thinking
                      </span>

                      <span className="thinking-dots">

                        <span>
                          .
                        </span>

                        <span>
                          .
                        </span>

                        <span>
                          .
                        </span>

                      </span>

                    </div>

                  </div>

                )}

              </div>

              {/* ================= QUICK QUESTIONS ================= */}

              <div className="quick-questions">

                <button
                  onClick={() =>
                    askQuickQuestion(
                      "What is the fee for B.Tech CSE?"
                    )
                  }
                  disabled={chatLoading}
                >
                  💰 Ask Fee
                </button>

                <button
                  onClick={() =>
                    askQuickQuestion(
                      "What courses are available?"
                    )
                  }
                  disabled={chatLoading}
                >
                  📚 Courses
                </button>

                <button
                  onClick={() =>
                    askQuickQuestion(
                      "What is the admission process?"
                    )
                  }
                  disabled={chatLoading}
                >
                  🎯 Admission
                </button>

              </div>

              {/* ================= CHAT INPUT ================= */}

              <div className="chat-input-area">

                <input
                  type="text"
                  placeholder="Ask about fees, courses, admission..."
                  value={chatInput}
                  onChange={(e) =>
                    setChatInput(
                      e.target.value
                    )
                  }
                  onKeyDown={(e) => {

                    if (
                      e.key === "Enter" &&
                      !e.shiftKey
                    ) {
                      e.preventDefault();
                      sendMessage();
                    }

                  }}
                  disabled={chatLoading}
                />

                <button
                  onClick={() =>
                    sendMessage()
                  }
                  disabled={
                    chatLoading ||
                    !chatInput.trim()
                  }
                >
                  {chatLoading
                    ? "..."
                    : "Send ➤"}
                </button>

              </div>

              {/* ================= DISCLAIMER ================= */}

              <p className="chat-disclaimer">
                🤖 AI answers are based on the
                selected college information.
              </p>

            </div>

            {/* ================= OFFICIAL WEBSITE ================= */}

            <a
              className="website-button"
              href={selectedCollege.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              🌐 Visit Official Website
            </a>

          </div>

        </section>

      )}

      {/* ================= FEATURES ================= */}

      <section className="features">

        <h2>
          Everything You Need
        </h2>

        <p className="section-text">
          Explore important information
          before choosing your college.
        </p>

        <div className="feature-container">

          <div className="feature-card">

            <div className="icon">
              🏫
            </div>

            <h3>
              College Information
            </h3>

            <p>
              Find detailed information
              about colleges and universities.
            </p>

          </div>

          <div className="feature-card">

            <div className="icon">
              📚
            </div>

            <h3>
              Courses
            </h3>

            <p>
              Explore courses and programmes
              offered by colleges.
            </p>

          </div>

          <div className="feature-card">

            <div className="icon">
              💰
            </div>

            <h3>
              Fees Through AI
            </h3>

            <p>
              Ask the college-specific AI
              assistant about fees.
            </p>

          </div>

          <div className="feature-card">

            <div className="icon">
              🎯
            </div>

            <h3>
              Admissions
            </h3>

            <p>
              Get admission information
              through the college assistant.
            </p>

          </div>

        </div>

      </section>

      {/* ================= AI SECTION ================= */}

      <section className="ai-section">

        <p className="ai-label">
          POWERED BY AI
        </p>

        <h2>
          Have a Question?
        </h2>

        <p>
          Explore a college and ask its AI
          Assistant about fees, courses,
          admission and more.
        </p>

        <button
          className="ai-button"
          onClick={() =>
            document
              .getElementById("colleges")
              ?.scrollIntoView({
                behavior: "smooth",
              })
          }
        >
          🤖 Explore AI Assistant
        </button>

      </section>

      {/* ================= FOOTER ================= */}

      <footer id="about">

        <h3>
          🎓 CampusAura AI
        </h3>

        <p>
          Your smart platform for college
          information.
        </p>

        <p className="copyright">
          © 2026 CampusAura AI
        </p>

      </footer>

    </div>
  );
}

export default App;