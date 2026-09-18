import { useState } from "react";

import {
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";

import { auth } from "./firebase";

import "./LoginPopup.css";


function LoginPopup({ onLogin }) {

  const [phone, setPhone] = useState("");

  const [otp, setOtp] = useState("");

  const [confirmationResult, setConfirmationResult] =
    useState(null);

  const [showPhone, setShowPhone] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // =========================
  // GOOGLE LOGIN
  // =========================

  const handleGoogleLogin = async () => {

    setError("");

    setLoading(true);

    try {

      const provider =
        new GoogleAuthProvider();

      provider.setCustomParameters({
        prompt: "select_account"
      });

      const result =
        await signInWithPopup(
          auth,
          provider
        );

      console.log(
        "Google login successful:",
        result.user
      );

      onLogin(result.user);

    } catch (error) {

      console.error(
        "========== GOOGLE LOGIN ERROR =========="
      );

      console.error(
        "Code:",
        error.code
      );

      console.error(
        "Message:",
        error.message
      );

      console.error(
        "Full Error:",
        error
      );

      console.error(
        "========================================"
      );

      setError(
        `Firebase Error: ${
          error.code || "unknown"
        }`
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================
  // SEND OTP
  // =========================

  const sendOTP = async () => {

    if (!phone.trim()) {

      setError(
        "Please enter your mobile number."
      );

      return;
    }


    try {

      setLoading(true);

      setError("");


      console.log(
        "Sending OTP to:",
        phone
      );


      /*
        Firebase Auth Emulator does not send
        a real SMS.

        The emulator generates the OTP and
        displays it in the terminal where
        firebase emulators:start is running.
      */


      if (!window.recaptchaVerifier) {

        window.recaptchaVerifier =
          new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {
              size: "normal",

              callback: () => {

                console.log(
                  "reCAPTCHA completed"
                );

              },

              "expired-callback": () => {

                setError(
                  "reCAPTCHA expired. Please try again."
                );

              }
            }
          );
      }


      const appVerifier =
        window.recaptchaVerifier;


      const result =
        await signInWithPhoneNumber(
          auth,
          phone,
          appVerifier
        );


      console.log(
        "OTP request successful ✅"
      );


      setConfirmationResult(result);

      setError("");


    } catch (error) {

      console.error(
        "========== PHONE OTP ERROR =========="
      );

      console.error(
        "Code:",
        error.code
      );

      console.error(
        "Message:",
        error.message
      );

      console.error(
        "Full Error:",
        error
      );

      console.error(
        "====================================="
      );


      setError(
        `Firebase Error: ${
          error.code || "unknown"
        }`
      );


      if (window.recaptchaVerifier) {

        try {

          const widgetId =
            await window.recaptchaVerifier.render();

          if (window.grecaptcha) {

            window.grecaptcha.reset(
              widgetId
            );

          }

        } catch (resetError) {

          console.log(
            "reCAPTCHA reset error:",
            resetError
          );

        }

      }

    } finally {

      setLoading(false);

    }
  };


  // =========================
  // VERIFY OTP
  // =========================

  const verifyOTP = async () => {

    if (!otp.trim()) {

      setError(
        "Please enter the OTP."
      );

      return;
    }


    if (!confirmationResult) {

      setError(
        "Please request OTP first."
      );

      return;
    }


    try {

      setLoading(true);

      setError("");


      console.log(
        "Verifying OTP..."
      );


      const result =
        await confirmationResult.confirm(
          otp
        );


      console.log(
        "Phone login successful ✅"
      );

      console.log(
        "User:",
        result.user
      );


      onLogin(result.user);


    } catch (error) {

      console.error(
        "========== OTP VERIFY ERROR =========="
      );

      console.error(
        "Code:",
        error.code
      );

      console.error(
        "Message:",
        error.message
      );

      console.error(
        "Full Error:",
        error
      );

      console.error(
        "======================================"
      );


      setError(
        "Invalid OTP. Please check the code and try again."
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================
  // BACK BUTTON
  // =========================

  const handleBack = () => {

    setShowPhone(false);

    setPhone("");

    setOtp("");

    setConfirmationResult(null);

    setError("");

    if (window.recaptchaVerifier) {

      try {

        window.recaptchaVerifier.clear();

      } catch (error) {

        console.log(
          "reCAPTCHA clear error:",
          error
        );

      }

      window.recaptchaVerifier = null;
    }
  };


  // =========================
  // UI
  // =========================

  return (

    <div className="login-overlay">

      <div className="login-popup">


        <div className="login-logo">
          🎓
        </div>


        <h2>
          CampusAura AI
        </h2>


        <p className="login-subtitle">
          Welcome! Please login to continue.
        </p>


        {error && (

          <div className="login-error">

            {error}

          </div>

        )}


        {/* =========================
            MAIN LOGIN
        ========================= */}

        {!showPhone &&
          !confirmationResult && (

          <>

            <button
              className="login-button google-button"
              onClick={handleGoogleLogin}
              disabled={loading}
            >

              <span>
                G
              </span>

              {loading
                ? "Please wait..."
                : "Continue with Google"}

            </button>


            <button
              className="login-button apple-button"
              disabled
            >

              <span>
                
              </span>

              Continue with Apple

            </button>


            <div className="login-divider">

              <span>
                OR
              </span>

            </div>


            <button
              className="login-button phone-button"
              onClick={() => {

                setShowPhone(true);

                setError("");

              }}
              disabled={loading}
            >

              📱 Continue with Mobile

            </button>

          </>

        )}


        {/* =========================
            PHONE NUMBER
        ========================= */}

        {showPhone &&
          !confirmationResult && (

          <div className="phone-login">


            <button
              className="back-login"
              onClick={handleBack}
            >

              ← Back

            </button>


            <h3>
              Mobile Number
            </h3>


            <p>
              Enter your mobile number to receive an OTP.
            </p>


            <input
              type="tel"
              placeholder="+91 9876543210"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
            />


            <div
              id="recaptcha-container"
            ></div>


            <button
              className="login-button phone-button"
              onClick={sendOTP}
              disabled={loading}
            >

              {loading
                ? "Sending..."
                : "Send OTP"}

            </button>


          </div>

        )}


        {/* =========================
            OTP
        ========================= */}

        {confirmationResult && (

          <div className="phone-login">


            <h3>
              Enter OTP
            </h3>


            <p>
              Enter the verification code generated by Firebase Emulator.
            </p>


            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              maxLength="6"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value)
              }
            />


            <button
              className="login-button phone-button"
              onClick={verifyOTP}
              disabled={loading}
            >

              {loading
                ? "Verifying..."
                : "Verify OTP"}

            </button>


          </div>

        )}


        <p className="login-security">

          🔒 Secure login powered by Firebase

        </p>


      </div>

    </div>

  );

}


export default LoginPopup;