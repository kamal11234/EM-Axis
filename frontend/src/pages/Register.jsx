import "./register.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import bg from "../assets/bg.jpeg";
import logo1 from "../assets/logo1.png";

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [joiningDate, setJoiningDate] = useState("");

  const [role, setRole] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* =========================================
     FULL NAME - ONLY CHARACTERS + SPACE
  ========================================= */

  const handleNameChange = (e) => {
    const value = e.target.value;

    if (/^[a-zA-Z\s]*$/.test(value)) {
      setFullName(value);
    }
  };

  /* =========================================
     EMAIL
  ========================================= */

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  /* =========================================
     PHONE - ONLY NUMBERS
  ========================================= */

  const handlePhoneChange = (e) => {
    const value = e.target.value;

    if (/^\d{0,10}$/.test(value)) {
      setPhone(value);
    }
  };

  /* =========================================
     REGISTER
  ========================================= */

  const handleRegister = (e) => {
    e.preventDefault();

    // Password check
    if (password !== confirmPassword) {
      alert("Password and Confirm Password do not match.");
      return;
    }

    // Role check
    if (!role) {
      alert("Please select your role.");
      return;
    }

    // Temporary user data
    // Backend connect karne ke baad ye data database me save hoga.
    const userData = {
      fullName,
      email,
      phone,
      joiningDate,
      role,
      password,
    };

    console.log("Registered User:", userData);

    alert("Registration successful! Please login.");

    // Registration ke baad Login page par
    navigate("/");
  };

  return (
    <div
      className="register-page"
      style={{ backgroundImage: `url(${bg})` }}
    >

      {/* LEFT SECTION */}

      <div className="register-left">

        <div className="register-brand-section">

          <img
            src={logo1}
            alt="EM-Axis Logo"
            className="register-brand-logo"
          />

          <div className="register-brand-text">

            <h1>EM-AXIS</h1>

            <p>News Management System</p>

          </div>

        </div>

        <div className="register-tagline">
          Inform&nbsp;&nbsp;•&nbsp;&nbsp;Connect&nbsp;&nbsp;•&nbsp;&nbsp;Create Impact
        </div>

        <div className="register-join-text">
          Be a Part of
          <br />
          Our News Team!
        </div>

      </div>


      {/* RIGHT REGISTER CARD */}

      <form
        className="register-card"
        onSubmit={handleRegister}
      >

        <h2>Create Your Account</h2>

        <p className="register-description">
          Fill in the details below to register for EM-AXIS
        </p>


        {/* =========================================
            1. SELECT YOUR ROLE
        ========================================= */}

        <div className="register-section-title">

          <span>1.</span>

          <span>Select Your Role</span>

          <div className="register-title-line"></div>

        </div>


        <div className="register-role-options">

          {/* CHANNEL HEAD */}

          <label className="register-role-box">

            <span className="register-role-icon">👨‍💼</span>

            <span>Channel Head</span>

            <input
              type="radio"
              name="register-role"
              value="channelHead"
              checked={role === "channelHead"}
              onChange={(e) => setRole(e.target.value)}
              required
            />

          </label>


          {/* EDITOR */}

          <label className="register-role-box">

            <span className="register-role-icon">📝</span>

            <span>Editor</span>

            <input
              type="radio"
              name="register-role"
              value="editor"
              checked={role === "editor"}
              onChange={(e) => setRole(e.target.value)}
            />

          </label>


          {/* REPORTER */}

          <label className="register-role-box">

            <span className="register-role-icon">🎤</span>

            <span>Reporter</span>

            <input
              type="radio"
              name="register-role"
              value="reporter"
              checked={role === "reporter"}
              onChange={(e) => setRole(e.target.value)}
            />

          </label>

        </div>


        {/* =========================================
            2. PERSONAL INFORMATION
        ========================================= */}

        <div className="register-section-title personal-title">

          <span>2.</span>

          <span>Personal Information</span>

          <div className="register-title-line"></div>

        </div>


        {/* FULL NAME + EMAIL */}

        <div className="register-input-row">

          <div className="register-input-box">

            <span>✍️</span>

            <input
              type="text"
              placeholder="Enter Your Full Name"
              value={fullName}
              onChange={handleNameChange}
              required
            />

          </div>


          <div className="register-input-box">

            <span>📧</span>

            <input
              type="email"
              placeholder="Enter Email Address"
              value={email}
              onChange={handleEmailChange}
              required
            />

          </div>

        </div>


        {/* PHONE + JOINING DATE */}

        <div className="register-input-row">

          <div className="register-input-box">

            <span>☎</span>

            <input
              type="tel"
              placeholder="Enter Phone Number"
              value={phone}
              onChange={handlePhoneChange}
              maxLength="10"
              inputMode="numeric"
              pattern="[0-9]{10}"
              title="Enter a valid 10-digit phone number"
              required
            />

          </div>


          <div className="register-input-box">

            <input
              type="date"
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
              required
            />

          </div>

        </div>


        {/* =========================================
            3. ACCOUNT CREDENTIALS
        ========================================= */}

        <div className="register-section-title credentials-title">

          <span>3.</span>

          <span>Account Credentials</span>

          <div className="register-title-line"></div>

        </div>


        <div className="register-input-row">

          {/* PASSWORD */}

          <div className="register-input-box">

            <span>🔐</span>

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="8"
              pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&]).{8,}"
              title="Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character."
              required
            />

            <span
              className="register-eye"
              onClick={() =>
                setShowPassword(!showPassword)
              }
            >
              {showPassword ? "🙈" : "👀"}
            </span>

          </div>


          {/* CONFIRM PASSWORD */}

          <div className="register-input-box">

            <span>🔐</span>

            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              required
            />

            <span
              className="register-eye"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              {showConfirmPassword ? "🙈" : "👀"}
            </span>

          </div>

        </div>


        {/* =========================================
            TERMS
        ========================================= */}

        <label className="terms-row">

          <input
            type="checkbox"
            required
          />

          <span>

            I agree to

            <a href="#">
              {" "}Term and Condition{" "}
            </a>

            and

            <a href="#">
              {" "}Private Policy
            </a>

          </span>

        </label>


        {/* =========================================
            REGISTER BUTTON
        ========================================= */}

        <button
          type="submit"
          className="register-button"
        >
          Register →
        </button>


        {/* =========================================
            LOGIN
        ========================================= */}

        <div className="login-link-section">

          <span>
            Already have an account ?
          </span>

          <Link to="/">
            Login Here
          </Link>

        </div>

      </form>

    </div>
  );
}

export default Register;