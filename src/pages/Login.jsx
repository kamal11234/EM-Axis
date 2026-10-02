import "./login.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import bg from "../assets/bg.jpeg";
import logo1 from "../assets/logo1.png";

function Login() {
  // Password show / hide
  const [showPassword, setShowPassword] = useState(false);

  // Email value
  const [email, setEmail] = useState("");

  // Email input handling
  const handleEmailChange = (e) => {
    let value = e.target.value;

    // Starting character must be A-Z or a-z
    if (value.length > 0 && !/^[a-zA-Z]/.test(value)) {
      value = value.replace(/^[^a-zA-Z]+/, "");
    }

    setEmail(value);
  };

  return (
    <div
      className="login-page"
      style={{ backgroundImage: `url(${bg})` }}
    >

      {/* =========================================
          LEFT SECTION
      ========================================= */}

      <div className="login-left">

        {/* Logo + Brand Name */}
        <div className="brand-section">

          <img
            src={logo1}
            alt="EM-Axis Logo"
            className="brand-logo"
          />

          <div className="brand-text">
            <h1>EM-AXIS</h1>
            <p>News Management System</p>
          </div>

        </div>


        {/* Tagline */}
        <div className="tagline">
          Inform&nbsp;&nbsp;•&nbsp;&nbsp;Connect&nbsp;&nbsp;•&nbsp;&nbsp;Create Impact
        </div>


        {/* Join Text */}
        <div className="join-text">
          Be a Part of
          <br />
          Our News Team!
        </div>

      </div>


      {/* =========================================
          RIGHT SECTION
      ========================================= */}

      <div className="login-card">

        {/* Heading */}
        <h2>Welcome Back !!</h2>

        <p className="login-description">
          Log in to your account and continue to EM-Axis
        </p>


        {/* =========================================
            ROLE SECTION
        ========================================= */}

        <div className="role-section">

          <div className="section-title">

            <span className="user-icon">
              ♙
            </span>

            <span>
              Select Your Role
            </span>

            <div className="title-line"></div>

          </div>


          <div className="role-options">

            {/* CHANNEL HEAD */}
            <label className="role-box">

              <span className="role-icon">
                👨‍💼
              </span>

              <span>
                Channel Head
              </span>

              <input
                type="radio"
                name="role"
                value="channelHead"
              />

            </label>


            {/* EDITOR */}
            <label className="role-box">

              <span className="role-icon">
                📝
              </span>

              <span>
                Editor
              </span>

              <input
                type="radio"
                name="role"
                value="editor"
              />

            </label>


            {/* REPORTER */}
            <label className="role-box">

              <span className="role-icon">
                🎤
              </span>

              <span>
                Reporter
              </span>

              <input
                type="radio"
                name="role"
                value="reporter"
              />

            </label>

          </div>

        </div>


        {/* =========================================
            EMAIL
        ========================================= */}

        <div className="input-box">

          <span className="input-icon email-icon">
            📧
          </span>

          <input
            type="email"
            placeholder="Email or Username"
            value={email}
            onChange={handleEmailChange}
            required
          />

        </div>


        {/* =========================================
            PASSWORD
        ========================================= */}

        <div className="input-box">

          <span className="input-icon">
            🔐
          </span>

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
          />

          {/* SHOW / HIDE PASSWORD */}
          <span
            className="eye-icon"
            onClick={() =>
              setShowPassword(!showPassword)
            }
            title={
              showPassword
                ? "Hide Password"
                : "Show Password"
            }
          >
            {showPassword ? "🙈" : "👀"}
          </span>

        </div>


        {/* =========================================
            REMEMBER + FORGOT
        ========================================= */}

        <div className="login-options">

          <label className="remember-me">

            <input
              type="checkbox"
            />

            <span>
              Remember me
            </span>

          </label>


          <a
            href="#"
            className="forgot-link"
          >
            Forgot Password ?
          </a>

        </div>


        {/* =========================================
            LOGIN BUTTON
        ========================================= */}

        <button className="login-button">
          LOGIN →
        </button>


        {/* =========================================
            REGISTER
        ========================================= */}

        <div className="register-section">

          <span>
            Don’t have an account ?
          </span>

          <Link to="/register">
            Register Here
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Login;