
import "./Profile.css";
import { useState } from "react";

function Profile() {
  const [profileImage, setProfileImage] = useState(null);
  const [showOptions, setShowOptions] = useState(false);

  const [gender, setGender] = useState("");
  const [location, setLocation] = useState("");

  // Profile image upload
  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const imageURL = URL.createObjectURL(file);
      setProfileImage(imageURL);
      setShowOptions(false);
    }
  };

  // Delete profile image
  const handleDeleteImage = () => {
    setProfileImage(null);
    setShowOptions(false);
  };

  return (
    <div className="profile-page">

      {/* PAGE HEADING */}
      <div className="profile-title">
        <h1>Your Profile</h1>
      </div>

      {/* PROFILE CONTAINER */}
      <div className="profile-container">

        {/* ================= LEFT SECTION ================= */}

        <div className="profile-left">

          {/* PROFILE IMAGE */}
          <div className="profile-photo-wrapper">

            <div className="profile-image">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="profile-image-preview"
                />
              ) : (
                <span className="default-profile-icon">
                  👤
                </span>
              )}
            </div>

            {/* CAMERA BUTTON */}
            <button
              type="button"
              className="camera-button"
              onClick={() => setShowOptions(!showOptions)}
            >
              📷
            </button>

            {/* IMAGE OPTIONS */}
            {showOptions && (
              <div className="profile-image-options">

                {/* CHANGE PHOTO */}
                <label
                  htmlFor="profile-upload"
                  className="image-option"
                >
                  📷 Change Photo
                </label>

                <input
                  id="profile-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />

                {/* DELETE PHOTO */}
                {profileImage && (
                  <button
                    type="button"
                    className="image-option delete-option"
                    onClick={handleDeleteImage}
                  >
                    🗑 Delete Photo
                  </button>
                )}

              </div>
            )}

          </div>

          {/* REPORTER NAME */}
          <h2 className="profile-user-name">
            {/* Registration se automatically aayega */}
          </h2>

          {/* REPORTER ID */}
          <p className="profile-user-id">
            {/* System automatically generate karega */}
          </p>

          {/* ACCOUNT STATUS */}
          <div className="account-status">

            <span className="status-title">
              Account Status
            </span>

            <span className="status-active">
              ● Active
            </span>

          </div>

        </div>


        {/* ================= RIGHT SECTION ================= */}

        <div className="profile-right">

          {/* REPORTER NAME */}
          <div className="profile-info-row">
            <span>Reporter Name</span>

            <strong>
              {/* Registration ka name */}
            </strong>
          </div>


          {/* REPORTER ID */}
          <div className="profile-info-row">
            <span>Reporter ID</span>

            <strong>
              {/* Automatically generated ID */}
            </strong>
          </div>


          {/* EMAIL */}
          <div className="profile-info-row">
            <span>Email ID</span>

            <strong>
              {/* Registration ka email */}
            </strong>
          </div>


          {/* DESIGNATION */}
          <div className="profile-info-row">
            <span>Designation</span>

            <strong>
              {/* Reporter / Editor / Channel Head */}
            </strong>
          </div>


          {/* MOBILE */}
          <div className="profile-info-row">
            <span>Mobile No.</span>

            <strong>
              {/* Registration ka mobile number */}
            </strong>
          </div>


          {/* GENDER */}
          <div className="profile-info-row">
            <span>Gender</span>

            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="profile-select"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">
                Prefer not to say
              </option>
            </select>
          </div>


          {/* LOCATION */}
          <div className="profile-info-row">
            <span>Location</span>

            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="profile-select"
            >
              <option value="">Select Location</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Delhi">Delhi</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Madhya Pradesh">
                Madhya Pradesh
              </option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Uttar Pradesh">
                Uttar Pradesh
              </option>
              <option value="Other">Other</option>
            </select>
          </div>


          {/* JOINING DATE */}
          <div className="profile-info-row">
            <span>Joining Date</span>

            <strong>
              {/* Registration ke time automatically save hogi */}
            </strong>
          </div>


          {/* LOGOUT */}
          <div className="logout-section">

            <button
              type="button"
              className="logout-btn"
            >
              Logout
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;
