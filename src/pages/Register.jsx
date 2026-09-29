import "./register.css";
import { Link } from "react-router-dom";
import bg from "../assets/bg.jpeg";
import logo from "../assets/logo.jpeg";

function Register() {
  return (
    <div
      className="register-page"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* LEFT SECTION */}
      <div className="register-left">

        <div className="register-brand-section">
          <img
            src={logo}
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
      <div className="register-card">

        <h2>Create Your Account</h2>

        <p className="register-description">
          Fill in the details below to register for EM-AXIS
        </p>


        {/* 1. SELECT YOUR ROLE */}
        <div className="register-section-title">
          <span>1.</span>
          <span>Select Your Role</span>
          <div className="register-title-line"></div>
        </div>

        <div className="register-role-options">

          <label className="register-role-box">
            <span className="register-role-icon">♙</span>
            <span>Channel Head</span>
            <input type="radio" name="register-role" />
          </label>

          <label className="register-role-box">
            <span className="register-role-icon">📝</span>
            <span>Editor</span>
            <input type="radio" name="register-role" />
          </label>

          <label className="register-role-box">
            <span className="register-role-icon">🎙</span>
            <span>Reporter</span>
            <input type="radio" name="register-role" />
          </label>

        </div>


        {/* 2. PERSONAL INFORMATION */}
        <div className="register-section-title personal-title">
          <span>2.</span>
          <span>Personal Information</span>
        </div>


        <div className="register-input-row">

          <div className="register-input-box">
            <span>♙</span>
            <input
              type="text"
              placeholder="Full Name"
            />
          </div>

          <div className="register-input-box">
            <span>✉</span>
            <input
              type="email"
              placeholder="Email Address"
            />
          </div>

        </div>


        <div className="register-input-row">

          <div className="register-input-box">
            <span>☎</span>
            <input
              type="text"
              placeholder="Phone Number"
            />
          </div>

          <div className="register-input-box">
            <span>▦</span>
            <input
              type="text"
              placeholder="Date of Birth"
            />
          </div>

        </div>


        {/* 3. ACCOUNT CREDENTIALS */}
        <div className="register-section-title credentials-title">
          <span>3.</span>
          <span>Account Credentials</span>
        </div>


        <div className="register-input-row">

          <div className="register-input-box">
            <span>🔒</span>

            <input
              type="password"
              placeholder="Password"
            />

            <span className="register-eye">◉</span>
          </div>

          <div className="register-input-box">
            <span>🔒</span>

            <input
              type="password"
              placeholder="Confirm Password"
            />

            <span className="register-eye">◉</span>
          </div>

        </div>


        {/* TERMS */}
        <label className="terms-row">

          <input type="checkbox" />

          <span>
            I agree to the
            <a href="#"> Term and Condition </a>
            and
            <a href="#"> Private Policy</a>
          </span>

        </label>


        {/* REGISTER BUTTON */}
        <button className="register-button">
          Register →
        </button>


        {/* LOGIN */}
        <div className="login-link-section">

          <span>Already have an account ?</span>

          <Link to="/">
  Login Here
</Link>

        </div>

      </div>
    </div>
  );
}

export default Register;