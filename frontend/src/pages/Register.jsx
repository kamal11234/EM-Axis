import "./register.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
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
      setError("");
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;

    if (/^\d{0,10}$/.test(value)) {
      setPhone(value);
      setError("");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim() || !email.trim() || !phone || !joiningDate) {
      const message = "Please fill in all personal information fields.";
      setError(message);
      toast.warning(message);
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      const message = "Please enter a valid 10-digit phone number.";
      setError(message);
      toast.warning(message);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      const message = "Please enter a valid email address.";
      setError(message);
      toast.warning(message);
      return;
    }

    if (password !== confirmPassword) {
      const message = "Password and Confirm Password do not match.";
      setError(message);
      toast.error(message);
      return;
    }

    if (password.length < 8) {
      const message = "Password must contain at least 8 characters.";
      setError(message);
      toast.warning(message);
      return;
    }

    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&]).{8,}$/.test(
        password
      )
    ) {
      const message =
        "Password must include uppercase, lowercase, number and special character.";
      setError(message);
      toast.warning(message);
      return;
    }

    if (!role) {
      const message = "Please select your role.";
      setError(message);
      toast.warning(message);
      return;
    }

    const roleMap = {
      channelHead: "channel_head",
      editor: "editor",
      reporter: "reporter",
    };

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
        const message =
          data.message || "Registration failed. Please try again.";

        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Registration successful! Please login.");

      navigate("/");
    } catch (err) {
      console.error("Registration request failed:", err);

      const message =
        "Cannot connect to the server. Make sure the backend is running.";

      setError(message);
      toast.error(message);
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
              onChange={(e) => {
                setRole(e.target.value);
                setError("");
              }}
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
              onChange={(e) => {
                setRole(e.target.value);
                setError("");
              }}
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
              onChange={(e) => {
                setRole(e.target.value);
                setError("");
              }}
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
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
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
              onChange={(e) => {
                setJoiningDate(e.target.value);
                setError("");
              }}
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
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              minLength={8}
              pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&]).{8,}"
              title="Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character."
              required
            />

            <span
              className="register-eye"
              onClick={() => setShowPassword(!showPassword)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowPassword((previous) => !previous);
                }
              }}
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
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              required
            />

            <span
              className="register-eye"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowConfirmPassword((previous) => !previous);
                }
              }}
            >
              {showConfirmPassword ? "🙈" : "👀"}
            </span>
          </div>
        </div>

        <label className="terms-row">
          <input type="checkbox" required />
          <span>
            I agree to <a href="#">Term and Condition</a> and{" "}
            <a href="#">Private Policy</a>
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
