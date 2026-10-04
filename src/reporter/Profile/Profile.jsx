import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css";

function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("reporterProfileImage") || ""
  );

  const [showPhotoMenu, setShowPhotoMenu] = useState(false);

  const [gender, setGender] = useState(
    localStorage.getItem("reporterGender") || "Male"
  );

  const [accountStatus, setAccountStatus] = useState(
    localStorage.getItem("reporterAccountStatus") || "Active"
  );

  const [name, setName] = useState(
    localStorage.getItem("reporterName") || "Kamal Vadar"
  );

  const [isEditingName, setIsEditingName] = useState(false);

  const [tempName, setTempName] = useState(name);


  /* =====================================================
     CAMERA BUTTON
  ===================================================== */

  const handleCameraClick = () => {
    setShowPhotoMenu((prev) => !prev);
  };


  /* =====================================================
     CHANGE PHOTO
  ===================================================== */

  const handleChangePhoto = () => {
    setShowPhotoMenu(false);

    fileInputRef.current.click();
  };


  /* =====================================================
     IMAGE CHANGE
  ===================================================== */

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Please select an image smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = reader.result;

      setProfileImage(imageData);

      localStorage.setItem(
        "reporterProfileImage",
        imageData
      );
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };


  /* =====================================================
     REMOVE PHOTO
  ===================================================== */

  const handleRemovePhoto = () => {
    setProfileImage("");

    localStorage.removeItem("reporterProfileImage");

    setShowPhotoMenu(false);
  };


  /* =====================================================
     EDIT NAME
  ===================================================== */

  const handleEditName = () => {
    setTempName(name);

    setIsEditingName(true);
  };


  /* =====================================================
     SAVE NAME
  ===================================================== */

  const handleSaveName = () => {
    const trimmedName = tempName.trim();

    if (!trimmedName) {
      alert("Please enter your name.");
      return;
    }

    if (!/^[A-Za-z ]+$/.test(trimmedName)) {
      alert("Name should contain only letters and spaces.");
      return;
    }

    setName(trimmedName);

    localStorage.setItem(
      "reporterName",
      trimmedName
    );

    setIsEditingName(false);
  };


  /* =====================================================
     CANCEL NAME EDIT
  ===================================================== */

  const handleCancelName = () => {
    setTempName(name);

    setIsEditingName(false);
  };


  /* =====================================================
     GENDER
  ===================================================== */

  const handleGenderChange = (event) => {
    const value = event.target.value;

    setGender(value);

    localStorage.setItem(
      "reporterGender",
      value
    );
  };


  /* =====================================================
     ACCOUNT STATUS
  ===================================================== */

  const handleStatusChange = (event) => {
    const value = event.target.value;

    setAccountStatus(value);

    localStorage.setItem(
      "reporterAccountStatus",
      value
    );
  };


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    navigate("/");
  };


  return (
    <div className="profile-page">

      {/* =================================================
          PROFILE HEADER
      ================================================= */}

      <div className="profile-page-header">

        <div className="profile-heading">

          <div className="profile-user-icon">
            <span>♙</span>
          </div>

          <h1>Reporter Profile</h1>

        </div>

      </div>


      {/* =================================================
          PROFILE MAIN
      ================================================= */}

      <div className="profile-main">


        {/* =================================================
            LEFT PROFILE CARD
        ================================================= */}

        <div className="profile-left-card">


          {/* =================================================
              PROFILE IMAGE
          ================================================= */}

          <div className="profile-image-wrapper">

            {profileImage ? (

              <img
                src={profileImage}
                alt="Reporter Profile"
                className="profile-image"
              />

            ) : (

              <div className="profile-placeholder">
                <span>♙</span>
              </div>

            )}


            {/* CAMERA BUTTON */}

            <button
              type="button"
              className="camera-btn"
              onClick={handleCameraClick}
              title="Profile photo options"
            >
              📷
            </button>


            {/* =================================================
                PHOTO OPTIONS
            ================================================= */}

            {showPhotoMenu && (

              <div className="photo-menu">

                <button
                  type="button"
                  className="photo-menu-item change-photo"
                  onClick={handleChangePhoto}
                >
                  <span>📷</span>
                  Change Photo
                </button>


                {profileImage && (

                  <button
                    type="button"
                    className="photo-menu-item remove-photo"
                    onClick={handleRemovePhoto}
                  >
                    <span>🗑️</span>
                    Remove Photo
                  </button>

                )}

              </div>

            )}


            {/* HIDDEN FILE INPUT */}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="profile-file-input"
            />

          </div>


          {/* =================================================
              PROFILE NAME
          ================================================= */}

          {!isEditingName ? (

            <div className="profile-name">

              {name}

              <button
                type="button"
                className="edit-icon"
                onClick={handleEditName}
                title="Edit Name"
              >
                ✎
              </button>

            </div>

          ) : (

            <div className="name-edit-box">

              <input
                type="text"
                value={tempName}
                onChange={(e) =>
                  setTempName(e.target.value)
                }
                className="name-input"
                autoFocus
              />


              <div className="name-edit-buttons">

                <button
                  type="button"
                  className="name-save-btn"
                  onClick={handleSaveName}
                  title="Save Name"
                >
                  ✓
                </button>

                <button
                  type="button"
                  className="name-cancel-btn"
                  onClick={handleCancelName}
                  title="Cancel"
                >
                  ✕
                </button>

              </div>

            </div>

          )}


          {/* =================================================
              REPORTER ID
          ================================================= */}

          <div className="profile-id">
            REP001
          </div>


          {/* =================================================
              ACCOUNT STATUS BADGE
          ================================================= */}

          <div
            className={`profile-active-badge ${
              accountStatus === "Inactive"
                ? "inactive-badge"
                : ""
            }`}
          >

            <span></span>

            {accountStatus}

          </div>

        </div>


        {/* =================================================
            RIGHT DETAILS CARD
        ================================================= */}

        <div className="profile-details-card">


          {/* REPORTER NAME */}

          <div className="profile-detail-row">

            <div className="detail-icon">
              ●
            </div>

            <div className="detail-label">
              Reporter Name
            </div>

            <div className="detail-value">
              {name}
            </div>

          </div>


          {/* REPORTER ID */}

          <div className="profile-detail-row">

            <div className="detail-icon">
              ▣
            </div>

            <div className="detail-label">
              Reporter ID
            </div>

            <div className="detail-value">
              REP001
            </div>

          </div>


          {/* EMAIL */}

          <div className="profile-detail-row">

            <div className="detail-icon">
              ✉
            </div>

            <div className="detail-label">
              Email ID
            </div>

            <div className="detail-value">
              kamalvadar@gmail.com
            </div>

          </div>


          {/* MOBILE NUMBER */}

          <div className="profile-detail-row">

            <div className="detail-icon">
              ●
            </div>

            <div className="detail-label">
              Mobile Number
            </div>

            <div className="detail-value">
              9844567895
            </div>

          </div>


          {/* GENDER */}

          <div className="profile-detail-row">

            <div className="detail-icon">
              ⚥
            </div>

            <div className="detail-label">
              Gender
            </div>

            <div className="detail-value">

              <select
                className="profile-select"
                value={gender}
                onChange={handleGenderChange}
              >

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>

                <option value="Other">
                  Other
                </option>

              </select>

            </div>

          </div>


          {/* DESIGNATION */}

          <div className="profile-detail-row">

            <div className="detail-icon">
              ▣
            </div>

            <div className="detail-label">
              Designation
            </div>

            <div className="detail-value">
              Reporter
            </div>

          </div>


          {/* LOCATION */}

          <div className="profile-detail-row">

            <div className="detail-icon">
              ●
            </div>

            <div className="detail-label">
              Location
            </div>

            <div className="detail-value">
              Pune
            </div>

          </div>


          {/* JOINING DATE */}

          <div className="profile-detail-row">

            <div className="detail-icon">
              ▦
            </div>

            <div className="detail-label">
              Joining Date
            </div>

            <div className="detail-value">
              19-04-2023
            </div>

          </div>


          {/* ACCOUNT STATUS */}

          <div className="profile-detail-row">

            <div className="detail-icon">
              ◉
            </div>

            <div className="detail-label">
              Account Status
            </div>

            <div className="detail-value">

              <select
                className={`profile-select status-select ${
                  accountStatus === "Inactive"
                    ? "inactive-select"
                    : ""
                }`}
                value={accountStatus}
                onChange={handleStatusChange}
              >

                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>

              </select>

            </div>

          </div>


          {/* =================================================
              LOGOUT BUTTON
          ================================================= */}

          <div className="profile-action">

            <button
              type="button"
              className="logout-btn"
              onClick={handleLogout}
            >
              ⇥ LOG OUT
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;
