
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
  const [joiningDate, setJoiningDate] = useState(
    new Date().toLocaleDateString("en-CA")
  );
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNameChange = (e) => {
    const value = e.target.value;

    if (/^[a-zA-Z\s]*$/.test(value)) {
      setFullName(value);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;

    if (/^\d{0,10}$/.test(value)) {
      setPhone(value);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !email.trim() || !phone || !joiningDate) {
      setError("Please fill in all personal information fields.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (!role) {
      setError("Please select your role.");
      return;
    }

    const roleMap = {
      channelHead: "channel_head",
      editor: "editor",
      reporter: "reporter",
    };

    // All registration details are sent to the backend.
    const userData = {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      mobile: phone.trim(),
      joining_date: joiningDate,
      password,
      role: roleMap[role],
    };

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        setError(data.message || "Registration failed. Please try again.");
        return;
      }

      alert("Registration successful! Please login.");
      navigate("/");
    } catch (err) {
      console.error("Registration request failed:", err);
      setError(
        "Cannot connect to the server. Make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="register-page"
      style={{ backgroundImage: `url(${bg})` }}
    >
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

      <form className="register-card" onSubmit={handleRegister}>
        <h2>Create Your Account</h2>

        <p className="register-description">
          Fill in the details below to register for EM-AXIS
        </p>

        <div className="register-section-title">
          <span>1.</span>
          <span>Select Your Role</span>
          <div className="register-title-line"></div>
        </div>

        <div className="register-role-options">
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

          <label className="register-role-box">
            <span className="register-role-icon">📝</span>
            <span>Editor</span>
            <input
              type="radio"
              name="register-role"
              value="editor"
              checked={role === "editor"}
              onChange={(e) => setRole(e.target.value)}
              required
            />
          </label>

          <label className="register-role-box">
            <span className="register-role-icon">🎤</span>
            <span>Reporter</span>
            <input
              type="radio"
              name="register-role"
              value="reporter"
              checked={role === "reporter"}
              onChange={(e) => setRole(e.target.value)}
              required
            />
          </label>
        </div>

        <div className="register-section-title personal-title">
          <span>2.</span>
          <span>Personal Information</span>
          <div className="register-title-line"></div>
        </div>

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
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="register-input-row">
          <div className="register-input-box">
            <span>☎</span>
            <input
              type="tel"
              placeholder="Enter Phone Number"
              value={phone}
              onChange={handlePhoneChange}
              maxLength={10}
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

        <div className="register-section-title credentials-title">
          <span>3.</span>
          <span>Account Credentials</span>
          <div className="register-title-line"></div>
        </div>

        <div className="register-input-row">
          <div className="register-input-box">
            <span>🔐</span>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&]).{8,}"
              title="Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character."
              required
            />

            <span
              className="register-eye"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👀"}
            </span>
          </div>

          <div className="register-input-box">
            <span>🔐</span>
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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

        <label className="terms-row">
          <input type="checkbox" required />
          <span>
            I agree to <a href="#">Term and Condition</a> and
            <a href="#"> Private Policy</a>
          </span>
        </label>

        {error && (
          <p
            role="alert"
            style={{
              color: "#c62828",
              fontSize: "14px",
              marginTop: "10px",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          className="register-button"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register →"}
        </button>

        <div className="login-link-section">
          <span>Already have an account?</span>
          <Link to="/">Login Here</Link>
        </div>
      </form>
    </div>
  );
}

export default Register;
