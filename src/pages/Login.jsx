import "./login.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import bg from "../assets/bg.jpeg";
import logo1 from "../assets/logo1.png";

function Login() {
  const navigate = useNavigate();

  // Password show / hide
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Error messages
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [roleError, setRoleError] = useState("");
  const [rememberError, setRememberError] = useState("");

  // Forgot password message
  const [forgotMessage, setForgotMessage] = useState("");

  // Email handling
  const handleEmailChange = (e) => {
    let value = e.target.value;

    // Starting character must be A-Z or a-z
    if (value.length > 0 && !/^[a-zA-Z]/.test(value)) {
      value = value.replace(/^[^a-zA-Z]+/, "");
    }

    setEmail(value);
    setEmailError("");
    setError("");
    setForgotMessage("");
  };

  // Password handling
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError("");
    setError("");
  };

  // Role handling
  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setRoleError("");
    setError("");
  };

  // Remember Me handling
  const handleRememberChange = (e) => {
    setRememberMe(e.target.checked);
    setRememberError("");
  };

  // Email format validation
  const validateEmail = (emailValue) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
  };

  // Login
  const handleLogin = (e) => {
    e.preventDefault();

    // Clear previous errors
    setError("");
    setEmailError("");
    setPasswordError("");
    setRoleError("");
    setRememberError("");
    setForgotMessage("");

    let isValid = true;

    // Email required
    if (!email.trim()) {
      setEmailError("Email is required.");
      isValid = false;
    }
    // Email format
    else if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }

    // Password required + minimum 6 characters
    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must contain at least 6 characters.");
      isValid = false;
    }

    // Role required
    if (!role) {
      setRoleError("Please select your role.");
      isValid = false;
    }

    // Remember Me compulsory
    if (!rememberMe) {
      setRememberError("Please select Remember Me to continue.");
      isValid = false;
    }

    // Stop login if validation fails
    if (!isValid) {
      return;
    }

    /*
      TEMPORARY LOGIN CHECK

      Backend/Supabase connect karne ke baad
      yaha actual authentication API call hogi.
    */

    // Demo credentials
    const demoEmail = "admin@emaxis.com";
    const demoPassword = "123456";

    if (email !== demoEmail || password !== demoPassword) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    // Remember login
    if (rememberMe) {
      localStorage.setItem("emAxisRememberMe", "true");
      localStorage.setItem("emAxisEmail", email);
      localStorage.setItem("emAxisRole", role);
    }

    // Role based dashboard redirect
    if (role === "reporter") {
      navigate("/reporter-dashboard");
    } else if (role === "editor") {
      navigate("/editor-dashboard");
    } else if (role === "channelHead") {
      navigate("/channel-head-dashboard");
    }
  };

  // Forgot Password
  const handleForgotPassword = (e) => {
    e.preventDefault();

    setForgotMessage("");
    setEmailError("");

    // Email required
    if (!email.trim()) {
      setEmailError("Enter your registered email first.");
      return;
    }

    // Email format
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    /*
      TEMPORARY RESET PASSWORD LOGIC

      Supabase connect karne ke baad:
      supabase.auth.resetPasswordForEmail(email)
      use karenge.
    */

    setForgotMessage(
      "Password reset link has been sent to your registered email."
    );
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

      <form
        className="login-card"
        onSubmit={handleLogin}
      >

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
                checked={role === "channelHead"}
                onChange={handleRoleChange}
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
                checked={role === "editor"}
                onChange={handleRoleChange}
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
                checked={role === "reporter"}
                onChange={handleRoleChange}
              />

            </label>

          </div>

          {roleError && (
            <p className="error-message">
              {roleError}
            </p>
          )}

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
          />

        </div>

        {emailError && (
          <p className="error-message">
            {emailError}
          </p>
        )}

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
            value={password}
            onChange={handlePasswordChange}
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

        {passwordError && (
          <p className="error-message">
            {passwordError}
          </p>
        )}

        {/* =========================================
            REMEMBER + FORGOT
        ========================================= */}

        <div className="login-options">

          <label className="remember-me">

            <input
              type="checkbox"
              checked={rememberMe}
              onChange={handleRememberChange}
            />

            <span>
              Remember me
            </span>

          </label>

          <a
            href="#"
            className="forgot-link"
            onClick={handleForgotPassword}
          >
            Forgot Password ?
          </a>

        </div>

        {rememberError && (
          <p className="error-message">
            {rememberError}
          </p>
        )}

        {/* Forgot password success */}
        {forgotMessage && (
          <p className="success-message">
            {forgotMessage}
          </p>
        )}

        {/* Login error */}
        {error && (
          <p className="error-message login-error">
            {error}
          </p>
        )}

        {/* =========================================
            LOGIN BUTTON
        ========================================= */}

        <button
          type="submit"
          className="login-button"
        >
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

      </form>

    </div>
  );
}

export default Login;