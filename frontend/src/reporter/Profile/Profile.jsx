
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css";

function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [userDetails, setUserDetails] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);

  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("reporterProfileImage") || ""
  );

  const [name, setName] = useState("");
  const [tempName, setTempName] = useState("");

  const [gender, setGender] = useState(
    localStorage.getItem("reporterGender") || "Male"
  );
  const [tempGender, setTempGender] = useState(gender);

  const [location, setLocation] = useState(
    localStorage.getItem("reporterLocation") || ""
  );
  const [tempLocation, setTempLocation] = useState(location);

  const [accountStatus, setAccountStatus] = useState(
    localStorage.getItem("reporterAccountStatus") || "Active"
  );
  const [tempAccountStatus, setTempAccountStatus] =
    useState(accountStatus);

  // LOAD USER DETAILS
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedUser = JSON.parse(
          sessionStorage.getItem("emAxisUser") || "null"
        );

        if (!storedUser?.id) {
          navigate("/");
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/users/${storedUser.id}`
        );

        const data = await response.json();

        if (!response.ok || !data.success || !data.user) {
          throw new Error(
            data.message || "Unable to load profile details."
          );
        }

        const user = data.user;

        const savedName =
          localStorage.getItem("reporterName") ||
          user.full_name ||
          "";

        setUserDetails(user);
        setName(savedName);
        setTempName(savedName);
      } catch (error) {
        console.error("Profile loading error:", error);
        alert(error.message || "Unable to load profile.");
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  // AUTOMATIC ID
  const reporterId = userDetails?.id
    ? `REP${String(userDetails.id).padStart(3, "0")}`
    : "—";

  // DESIGNATION
  const roleLabels = {
    reporter: "Reporter",
    editor: "Editor",
    channel_head: "Channel Head",
  };

  const designation = roleLabels[userDetails?.role] || "—";
  const displayName = name || userDetails?.full_name || "—";

  // DATE FORMAT: DD-MM-YYYY
  const formatJoiningDate = (date) => {
    if (!date) return "—";

    const parts = String(date).slice(0, 10).split("-");

    if (parts.length !== 3) return "—";

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  // EDIT PROFILE
  const handleEditProfile = () => {
    setTempName(displayName === "—" ? "" : displayName);
    setTempGender(gender);
    setTempLocation(location);
    setTempAccountStatus(accountStatus);
    setIsEditingProfile(true);
  };

  // CANCEL EDIT
  const handleCancelEdit = () => {
    setTempName(name || userDetails?.full_name || "");
    setTempGender(gender);
    setTempLocation(location);
    setTempAccountStatus(accountStatus);
    setIsEditingProfile(false);
  };

  // SAVE EDITABLE FIELDS
  const handleSaveChanges = () => {
    const trimmedName = tempName.trim();
    const trimmedLocation = tempLocation.trim();

    if (!trimmedName) {
      alert("Please enter your name.");
      return;
    }

    if (!/^[A-Za-z ]+$/.test(trimmedName)) {
      alert("Name should contain only English letters and spaces.");
      return;
    }

    if (trimmedLocation.length > 150) {
      alert("Location must be 150 characters or fewer.");
      return;
    }

    localStorage.setItem("reporterName", trimmedName);
    localStorage.setItem("reporterGender", tempGender);
    localStorage.setItem("reporterLocation", trimmedLocation);
    localStorage.setItem("reporterAccountStatus", tempAccountStatus);

    setName(trimmedName);
    setGender(tempGender);
    setLocation(trimmedLocation);
    setAccountStatus(tempAccountStatus);

    setIsEditingProfile(false);
    alert("Profile changes saved successfully.");
  };

  // CHANGE PROFILE PHOTO
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

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
      localStorage.setItem("reporterProfileImage", imageData);
      setShowPhotoMenu(false);
    };

    reader.onerror = () => {
      alert("Unable to read this image. Please try another one.");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  // REMOVE PROFILE PHOTO
  const handleRemovePhoto = () => {
    setProfileImage("");
    localStorage.removeItem("reporterProfileImage");
    setShowPhotoMenu(false);
  };

  // LOGOUT
  const handleLogout = () => {
    sessionStorage.removeItem("emAxisUser");
    navigate("/");
  };

  if (profileLoading) {
    return (
      <div className="profile-page profile-loading">
        <div className="profile-loader"></div>
        <h2>Loading profile...</h2>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* PAGE HEADER */}
      <div className="profile-page-header">
        <div className="profile-heading">
          <div className="profile-user-icon">
            <span>♙</span>
          </div>

          <div>
            <h1>Reporter Profile</h1>
            <p>View and manage your profile information</p>
          </div>
        </div>

        <div className="profile-header-actions">
          {!isEditingProfile ? (
            <button
              type="button"
              className="profile-edit-btn"
              onClick={handleEditProfile}
            >
              <span>✎</span> Edit Profile
            </button>
          ) : (
            <>
              <button
                type="button"
                className="profile-cancel-btn"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>

              <button
                type="button"
                className="profile-save-btn"
                onClick={handleSaveChanges}
              >
                <span>✓</span> Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* PROFILE CONTENT */}
      <div className="profile-main">
        {/* LEFT PROFILE CARD */}
        <section className="profile-left-card">
          <div className="profile-image-wrapper">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Reporter profile"
                className="profile-image"
              />
            ) : (
              <div className="profile-placeholder">
                <span>♙</span>
              </div>
            )}

            <button
              type="button"
              className="camera-btn"
              onClick={() => setShowPhotoMenu((prev) => !prev)}
              title="Profile photo options"
              aria-label="Profile photo options"
            >
              📷
            </button>

            {showPhotoMenu && (
              <div className="photo-menu">
                <button
                  type="button"
                  className="photo-menu-item"
                  onClick={() => {
                    setShowPhotoMenu(false);
                    fileInputRef.current?.click();
                  }}
                >
                  <span>📷</span> Change Photo
                </button>

                {profileImage && (
                  <button
                    type="button"
                    className="photo-menu-item remove-photo"
                    onClick={handleRemovePhoto}
                  >
                    <span>🗑</span> Remove Photo
                  </button>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="profile-file-input"
            />
          </div>

          <div className="profile-name">{displayName}</div>

          <div className="profile-id">{reporterId}</div>

          <div
            className={`profile-active-badge ${
              (isEditingProfile ? tempAccountStatus : accountStatus) ===
              "Inactive"
                ? "inactive-badge"
                : ""
            }`}
          >
            <span></span>
            {isEditingProfile ? tempAccountStatus : accountStatus}
          </div>

          <div className="profile-role-chip">{designation}</div>
        </section>

        {/* RIGHT DETAILS CARD */}
        <section className="profile-details-card">
          <div className="profile-card-heading">
            <div>
              <h2>Personal Information</h2>
              <p>Your registered account details</p>
            </div>

            <span className="profile-card-heading-icon">▤</span>
          </div>

          {/* NAME - EDITABLE */}
          <div className="profile-detail-row">
            <div className="detail-icon">♙</div>
            <div className="detail-label">Reporter Name</div>

            <div className="detail-value">
              {isEditingProfile ? (
                <input
                  className="profile-text-input"
                  type="text"
                  value={tempName}
                  onChange={(event) => setTempName(event.target.value)}
                  placeholder="Enter reporter name"
                  maxLength={100}
                />
              ) : (
                <>
                  <span>{displayName}</span>

                  <button
                    type="button"
                    className="edit-icon"
                    onClick={handleEditProfile}
                    title="Edit reporter name"
                    aria-label="Edit reporter name"
                  >
                    ✎
                  </button>
                </>
              )}
            </div>
          </div>

          {/* REPORTER ID - NON-EDITABLE */}
          <div className="profile-detail-row">
            <div className="detail-icon">▣</div>
            <div className="detail-label">Reporter ID</div>
            <div className="detail-value readonly-value">{reporterId}</div>
          </div>

          {/* EMAIL - NON-EDITABLE */}
          <div className="profile-detail-row">
            <div className="detail-icon">✉</div>
            <div className="detail-label">Email ID</div>
            <div className="detail-value readonly-value">
              {userDetails?.email || "—"}
            </div>
          </div>

          {/* MOBILE - NON-EDITABLE */}
          <div className="profile-detail-row">
            <div className="detail-icon">☎</div>
            <div className="detail-label">Mobile Number</div>
            <div className="detail-value readonly-value">
              {userDetails?.mobile || "—"}
            </div>
          </div>

          {/* GENDER - EDITABLE */}
          <div className="profile-detail-row">
            <div className="detail-icon">⚥</div>
            <div className="detail-label">Gender</div>

            <div className="detail-value">
              <select
                className={`profile-select ${
                  !isEditingProfile ? "readonly-select" : ""
                }`}
                value={isEditingProfile ? tempGender : gender}
                onChange={(event) => setTempGender(event.target.value)}
                disabled={!isEditingProfile}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* DESIGNATION - NON-EDITABLE */}
          <div className="profile-detail-row">
            <div className="detail-icon">▣</div>
            <div className="detail-label">Designation</div>
            <div className="detail-value readonly-value">
              {designation}
            </div>
          </div>

          {/* LOCATION - EDITABLE */}
          <div className="profile-detail-row">
            <div className="detail-icon">⌖</div>
            <div className="detail-label">Location</div>

            <div className="detail-value">
              {isEditingProfile ? (
                <input
                  className="profile-text-input"
                  type="text"
                  value={tempLocation}
                  onChange={(event) => setTempLocation(event.target.value)}
                  placeholder="Enter city or reporting area"
                  maxLength={150}
                />
              ) : (
                <span>{location || "Not added"}</span>
              )}
            </div>
          </div>

          {/* JOINING DATE - NON-EDITABLE */}
          <div className="profile-detail-row">
            <div className="detail-icon">▦</div>
            <div className="detail-label">Joining Date</div>
            <div className="detail-value readonly-value">
              {formatJoiningDate(userDetails?.joining_date)}
            </div>
          </div>

          {/* ACCOUNT STATUS - EDITABLE */}
          <div className="profile-detail-row">
            <div className="detail-icon">◉</div>
            <div className="detail-label">Account Status</div>

            <div className="detail-value">
              <select
                className={`profile-select status-select ${
                  (isEditingProfile ? tempAccountStatus : accountStatus) ===
                  "Inactive"
                    ? "inactive-select"
                    : ""
                } ${!isEditingProfile ? "readonly-select" : ""}`}
                value={isEditingProfile ? tempAccountStatus : accountStatus}
                onChange={(event) =>
                  setTempAccountStatus(event.target.value)
                }
                disabled={!isEditingProfile}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* LOGOUT */}
          <div className="profile-action">
            <button
              type="button"
              className="logout-btn"
              onClick={handleLogout}
            >
              <span>⇥</span> LOG OUT
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Profile;
