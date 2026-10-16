import "./login.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import bg from "../assets/bg.jpeg";
import logo1 from "../assets/logo1.png";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [roleError, setRoleError] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError("");
    setError("");
    setForgotMessage("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError("");
    setError("");
  };

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setRoleError("");
    setError("");
  };

  const handleRememberChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setEmailError("");
    setPasswordError("");
    setRoleError("");
    setForgotMessage("");

    let isValid = true;

    if (!email.trim()) {
      setEmailError("Email is required.");
      isValid = false;
    } else if (!validateEmail(email.trim())) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required.");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError(
        "Password must contain at least 8 characters."
      );
      isValid = false;
    }

    if (!role) {
      setRoleError("Please select your role.");
      isValid = false;
    }

    if (!isValid) return;

    const roleMap = {
      reporter: "reporter",
      editor: "editor",
      channelHead: "channel_head",
    };

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
            role: roleMap[role],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message || "Login failed. Please try again."
        );
        return;
      }

      if (rememberMe) {
        localStorage.setItem("emAxisRememberMe", "true");
        localStorage.setItem("emAxisEmail", data.user.email);
        localStorage.setItem("emAxisRole", data.user.role);
      } else {
        localStorage.removeItem("emAxisRememberMe");
        localStorage.removeItem("emAxisEmail");
        localStorage.removeItem("emAxisRole");
      }

      // Save the logged-in user for the current browser tab.
      sessionStorage.setItem(
        "emAxisUser",
        JSON.stringify(data.user)
      );

      // Navigate using the verified database role.
      switch (data.user.role) {
        case "reporter":
          navigate("/dashboard");
          break;

        case "editor":
          navigate("/editor-dashboard");
          break;

        case "channel_head":
          navigate("/channel-head-dashboard");
          break;

        default:
          sessionStorage.removeItem("emAxisUser");
          setError("Your account has an unsupported role.");
      }
    } catch (err) {
      console.error("Login API error:", err);

      setError(
        "Cannot connect to the server. Please make sure the backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setForgotMessage("");
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Enter your registered email first.");
      return;
    }

    if (!validateEmail(email.trim())) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setForgotMessage(
      "Password reset is not connected yet. Please contact your administrator."
    );
  };

  return (
    <div
      className="login-page"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* LEFT SECTION */}
      <div className="login-left">
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

        <div className="tagline">
          Inform&nbsp;&nbsp;•&nbsp;&nbsp;Connect&nbsp;&nbsp;•&nbsp;&nbsp;Create Impact
        </div>

        <div className="join-text">
          Be a Part of
          <br />
          Our News Team!
        </div>
      </div>

      {/* RIGHT SECTION */}
      <form className="login-card" onSubmit={handleLogin}>
        <h2>Welcome Back !!</h2>

        <p className="login-description">
          Log in to your account and continue to EM-Axis
        </p>

        {/* ROLE SECTION */}
        <div className="role-section">
          <div className="section-title">
            <span className="user-icon">♙</span>
            <span>Select Your Role</span>
            <div className="title-line"></div>
          </div>

          <div className="role-options">
            <label className="role-box">
              <span className="role-icon">👨‍💼</span>
              <span>Channel Head</span>

              <input
                type="radio"
                name="role"
                value="channelHead"
                checked={role === "channelHead"}
                onChange={handleRoleChange}
              />
            </label>

            <label className="role-box">
              <span className="role-icon">📝</span>
              <span>Editor</span>

              <input
                type="radio"
                name="role"
                value="editor"
                checked={role === "editor"}
                onChange={handleRoleChange}
              />
            </label>

            <label className="role-box">
              <span className="role-icon">🎤</span>
              <span>Reporter</span>

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
            <p className="error-message">{roleError}</p>
          )}
        </div>

        {/* EMAIL */}
        <div className="input-box">
          <span className="input-icon email-icon">📧</span>

          <input
            type="email"
            placeholder="Email or Username"
            value={email}
            onChange={handleEmailChange}
            autoComplete="email"
          />
        </div>

        {emailError && (
          <p className="error-message">{emailError}</p>
        )}

        {/* PASSWORD */}
        <div className="input-box">
          <span className="input-icon">🔐</span>

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            autoComplete="current-password"
          />

          <span
            className="eye-icon"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide Password" : "Show Password"}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setShowPassword(!showPassword);
              }
            }}
          >
            {showPassword ? "🙈" : "👀"}
          </span>
        </div>

        {passwordError && (
          <p className="error-message">{passwordError}</p>
        )}

        {/* REMEMBER + FORGOT */}
        <div className="login-options">
          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={handleRememberChange}
            />
            <span>Remember me</span>
          </label>

          <a
            href="#"
            className="forgot-link"
            onClick={handleForgotPassword}
          >
            Forgot Password ?
          </a>
        </div>

        {forgotMessage && (
          <p className="success-message">{forgotMessage}</p>
        )}

        {/* LOGIN ERROR */}
        {error && (
          <p className="error-message login-error">{error}</p>
        )}

        {/* LOGIN BUTTON */}
        <button
          type="submit"
          className="login-button"
          disabled={isLoading}
        >
          {isLoading ? "PLEASE WAIT..." : "LOGIN →"}
        </button>

        {/* REGISTER */}
        <div className="register-section">
          <span>Don’t have an account ?</span>
          <Link to="/register">Register Here</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
