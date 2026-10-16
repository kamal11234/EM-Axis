
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./profile.css";

function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [userDetails, setUserDetails] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

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
    localStorage.getItem("reporterName") || ""
  );

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(name);

  // LOCATION
  const [location, setLocation] = useState(
    localStorage.getItem("reporterLocation") || ""
  );

  const [tempLocation, setTempLocation] = useState(
    localStorage.getItem("reporterLocation") || ""
  );

  const [isEditingLocation, setIsEditingLocation] = useState(false);

  // Fetch registered user details from backend
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

        setUserDetails(user);
        setName(
          localStorage.getItem("reporterName") ||
            user.full_name ||
            ""
        );
        setTempName(
          localStorage.getItem("reporterName") ||
            user.full_name ||
            ""
        );
      } catch (error) {
        console.error("Profile loading error:", error);
        alert(error.message || "Unable to load profile.");
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  // Reporter ID
  const reporterId = userDetails?.id
    ? `REP${String(userDetails.id).padStart(3, "0")}`
    : "—";

  // Format joining date as DD-MM-YYYY
  const formatJoiningDate = (date) => {
    if (!date) return "—";

    const datePart = String(date).slice(0, 10);
    const parts = datePart.split("-");

    if (parts.length !== 3) return "—";

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  const roleLabels = {
    reporter: "Reporter",
    editor: "Editor",
    channel_head: "Channel Head",
  };

  const designation = roleLabels[userDetails?.role] || "—";

  // PROFILE PHOTO
  const handleCameraClick = () => {
    setShowPhotoMenu((prev) => !prev);
  };

  const handleChangePhoto = () => {
    setShowPhotoMenu(false);
    fileInputRef.current?.click();
  };

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
    };

    reader.onerror = () => {
      alert("Unable to read this image. Please try another one.");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleRemovePhoto = () => {
    setProfileImage("");
    localStorage.removeItem("reporterProfileImage");
    setShowPhotoMenu(false);
  };

  // EDIT NAME
  const handleEditName = () => {
    setTempName(name || userDetails?.full_name || "");
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    const trimmedName = tempName.trim();

    if (!trimmedName) {
      alert("Please enter your name.");
      return;
    }

    if (!/^[A-Za-z ]+$/.test(trimmedName)) {
      alert("Name should contain only English letters and spaces.");
      return;
    }

    setName(trimmedName);
    localStorage.setItem("reporterName", trimmedName);
    setIsEditingName(false);
  };

  const handleCancelName = () => {
    setTempName(name || userDetails?.full_name || "");
    setIsEditingName(false);
  };

  // EDIT LOCATION
  const handleEditLocation = () => {
    setTempLocation(location);
    setIsEditingLocation(true);
  };

  const handleSaveLocation = () => {
    const trimmedLocation = tempLocation.trim();

    if (!trimmedLocation) {
      alert("Please enter your location.");
      return;
    }

    if (trimmedLocation.length > 150) {
      alert("Location must be 150 characters or fewer.");
      return;
    }

    setLocation(trimmedLocation);
    localStorage.setItem("reporterLocation", trimmedLocation);
    setIsEditingLocation(false);
  };

  const handleCancelLocation = () => {
    setTempLocation(location);
    setIsEditingLocation(false);
  };

  // GENDER
  const handleGenderChange = (event) => {
    const value = event.target.value;

    setGender(value);
    localStorage.setItem("reporterGender", value);
  };

  // ACCOUNT STATUS
  const handleStatusChange = (event) => {
    const value = event.target.value;

    setAccountStatus(value);
    localStorage.setItem("reporterAccountStatus", value);
  };

  // LOGOUT
  const handleLogout = () => {
    sessionStorage.removeItem("emAxisUser");
    navigate("/");
  };

  if (profileLoading) {
    return (
      <div className="profile-page">
        <h2>Loading profile...</h2>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* PROFILE HEADER */}
      <div className="profile-page-header">
        <div className="profile-heading">
          <div className="profile-user-icon">
            <span>♙</span>
          </div>

          <h1>Reporter Profile</h1>
        </div>
      </div>

      {/* PROFILE MAIN */}
      <div className="profile-main">
        {/* LEFT PROFILE CARD */}
        <div className="profile-left-card">
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

            <button
              type="button"
              className="camera-btn"
              onClick={handleCameraClick}
              title="Profile photo options"
            >
              📷
            </button>

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

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="profile-file-input"
            />
          </div>

          {/* PROFILE NAME */}
          {!isEditingName ? (
            <div className="profile-name">
              {name || userDetails?.full_name || "—"}

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
                onChange={(e) => setTempName(e.target.value)}
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

          <div className="profile-id">{reporterId}</div>

          <div
            className={`profile-active-badge ${
              accountStatus === "Inactive" ? "inactive-badge" : ""
            }`}
          >
            <span></span>
            {accountStatus}
          </div>
        </div>

        {/* RIGHT DETAILS CARD */}
        <div className="profile-details-card">
          {/* REPORTER NAME */}
          <div className="profile-detail-row">
            <div className="detail-icon">●</div>
            <div className="detail-label">Reporter Name</div>
            <div className="detail-value">
              {name || userDetails?.full_name || "—"}
            </div>
          </div>

          {/* REPORTER ID */}
          <div className="profile-detail-row">
            <div className="detail-icon">▣</div>
            <div className="detail-label">Reporter ID</div>
            <div className="detail-value">{reporterId}</div>
          </div>

          {/* EMAIL */}
          <div className="profile-detail-row">
            <div className="detail-icon">✉</div>
            <div className="detail-label">Email ID</div>
            <div className="detail-value">
              {userDetails?.email || "—"}
            </div>
          </div>

          {/* MOBILE */}
          <div className="profile-detail-row">
            <div className="detail-icon">●</div>
            <div className="detail-label">Mobile Number</div>
            <div className="detail-value">
              {userDetails?.mobile || "—"}
            </div>
          </div>

          {/* GENDER */}
          <div className="profile-detail-row">
            <div className="detail-icon">⚥</div>
            <div className="detail-label">Gender</div>
            <div className="detail-value">
              <select
                className="profile-select"
                value={gender}
                onChange={handleGenderChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* DESIGNATION */}
          <div className="profile-detail-row">
            <div className="detail-icon">▣</div>
            <div className="detail-label">Designation</div>
            <div className="detail-value">{designation}</div>
          </div>

          {/* LOCATION */}
          <div className="profile-detail-row">
            <div className="detail-icon">📍</div>
            <div className="detail-label">Location</div>

            <div className="detail-value">
              {!isEditingLocation ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <span>{location || "Not added"}</span>

                  <button
                    type="button"
                    onClick={handleEditLocation}
                    title="Add or edit location"
                    aria-label="Add or edit location"
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#1769d2",
                      cursor: "pointer",
                      fontSize: "18px",
                      padding: "2px 5px",
                    }}
                  >
                    ✎
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "8px",
                    width: "100%",
                    maxWidth: "300px",
                  }}
                >
                  <input
                    type="text"
                    value={tempLocation}
                    onChange={(e) => setTempLocation(e.target.value)}
                    placeholder="Enter city or reporting area"
                    maxLength={150}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSaveLocation();
                      }
                      if (e.key === "Escape") {
                        handleCancelLocation();
                      }
                    }}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "9px 11px",
                      border: "1px solid #b8c7d9",
                      borderRadius: "6px",
                      fontSize: "14px",
                      outlineColor: "#1769d2",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                    }}
                  >
                    <button
                      type="button"
                      onClick={handleSaveLocation}
                      style={{
                        padding: "7px 14px",
                        border: "none",
                        borderRadius: "5px",
                        background: "#1769d2",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: "600",
                      }}
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelLocation}
                      style={{
                        padding: "7px 14px",
                        border: "1px solid #bbb",
                        borderRadius: "5px",
                        background: "#fff",
                        color: "#333",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* JOINING DATE */}
          <div className="profile-detail-row">
            <div className="detail-icon">▦</div>
            <div className="detail-label">Joining Date</div>
            <div className="detail-value">
              {formatJoiningDate(userDetails?.joining_date)}
            </div>
          </div>

          {/* ACCOUNT STATUS */}
          <div className="profile-detail-row">
            <div className="detail-icon">◉</div>
            <div className="detail-label">Account Status</div>
            <div className="detail-value">
              <select
                className={`profile-select status-select ${
                  accountStatus === "Inactive" ? "inactive-select" : ""
                }`}
                value={accountStatus}
                onChange={handleStatusChange}
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
              ⇥ LOG OUT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;