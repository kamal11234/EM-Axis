import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./EditorProfile.css";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "") + "/api";

const PHOTO_KEY = "editorProfileImage";

function getLoggedInUser() {
  try {
    return JSON.parse(sessionStorage.getItem("emAxisUser") || "{}");
  } catch {
    return {};
  }
}

function formatDate(value) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getNewsArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.news)) return data.news;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.data?.news)) return data.data.news;

  return [];
}

function normalizeStatus(status) {
  return String(status || "Pending")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function getActivityDetails(news) {
  const status = normalizeStatus(news.status);
  const title = news.title || news.news_slug || "Untitled news";
  const location = news.location ? ` • ${news.location}` : "";
  const date = formatDate(news.updated_at || news.created_at);

  if (status === "approved") {
    return {
      type: "approved",
      icon: "✓",
      title: "News Approved",
      description: `${title}${location} • ${date}`,
    };
  }

  if (status === "published") {
    return {
      type: "approved",
      icon: "✓",
      title: "News Published",
      description: `${title}${location} • ${date}`,
    };
  }

  if (status === "rejected") {
    return {
      type: "rejected",
      icon: "×",
      title: "News Rejected",
      description: `${title}${location} • ${date}`,
    };
  }

  if (status === "correction required") {
    return {
      type: "correction",
      icon: "↻",
      title: "Correction Required",
      description: `${title}${location} • ${date}`,
    };
  }

  if (status === "pending") {
    return {
      type: "sent",
      icon: "◷",
      title: "Pending Review",
      description: `${title}${location} • ${date}`,
    };
  }

  return {
    type: "updated",
    icon: "•",
    title: `News Status: ${news.status || "Unknown"}`,
    description: `${title}${location} • ${date}`,
  };
}

function EditorProfile() {
  const navigate = useNavigate();
  const photoInputRef = useRef(null);

  const [loggedInUser] = useState(getLoggedInUser);
  const [profile, setProfile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    gender: "",
    accountStatus: "Active",
  });

  const [photo, setPhoto] = useState(
    () => localStorage.getItem(PHOTO_KEY) || ""
  );

  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState("");

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================
  // LOAD EDITOR PROFILE FROM DATABASE
  // =====================================
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!loggedInUser.id) {
        const errorMessage = "Please log in to view your profile.";

        setError(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
        return;
      }

      if (loggedInUser.role !== "editor") {
        const errorMessage =
          "This profile is available for Editor accounts only.";

        setError(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/editor/profile/${loggedInUser.id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load your profile.");
        }

        const user = data.user || data;

        if (cancelled) return;

        const loadedProfile = {
          id: user.id,
          name: user.full_name || user.fullName || user.name || "",
          email: user.email || "",
          mobile: user.mobile || user.phone || "",
          gender: user.gender || "",
          role: user.role || loggedInUser.role || "editor",
          joiningDate: user.joining_date || user.joiningDate || "",
          accountStatus:
            user.account_status || user.accountStatus || "Active",
        };

        if (loadedProfile.role !== "editor") {
          throw new Error("This account is not an Editor account.");
        }

        setProfile(loadedProfile);

        setForm({
          name: loadedProfile.name,
          mobile: loadedProfile.mobile,
          gender: loadedProfile.gender,
          accountStatus: loadedProfile.accountStatus,
        });
      } catch (err) {
        if (!cancelled) {
          const errorMessage =
            err.message || "Unable to load profile.";

          setError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [loggedInUser.id, loggedInUser.role]);

  // =====================================
  // LOAD REAL NEWS DATA FROM DATABASE
  // =====================================
  useEffect(() => {
    let cancelled = false;

    async function loadNews() {
      if (!loggedInUser.id || loggedInUser.role !== "editor") {
        setNewsLoading(false);
        return;
      }

      try {
        setNewsLoading(true);
        setNewsError("");

        const response = await fetch(`${API_URL}/news`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load news statistics.");
        }

        if (cancelled) return;

        setNews(getNewsArray(data));
      } catch (err) {
        if (!cancelled) {
          const errorMessage =
            err.message || "Unable to load editorial activity.";

          setNewsError(errorMessage);
          toast.error(errorMessage);
        }
      } finally {
        if (!cancelled) {
          setNewsLoading(false);
        }
      }
    }

    loadNews();

    return () => {
      cancelled = true;
    };
  }, [loggedInUser.id, loggedInUser.role]);

  // =====================================
  // CALCULATE STATISTICS FROM REAL NEWS
  // =====================================
  const statistics = news.reduce(
    (result, item) => {
      const status = normalizeStatus(item.status);

      if (status !== "pending") {
        result.reviewed += 1;
      }

      if (status === "approved" || status === "published") {
        result.approved += 1;
      }

      if (status === "rejected") {
        result.rejected += 1;
      }

      if (status === "correction required") {
        result.correction += 1;
      }

      if (status === "pending") {
        result.pending += 1;
      }

      return result;
    },
    {
      reviewed: 0,
      approved: 0,
      rejected: 0,
      correction: 0,
      pending: 0,
    }
  );

  const recentNews = [...news]
    .sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at || 0).getTime();
      const dateB = new Date(b.updated_at || b.created_at || 0).getTime();

      return dateB - dateA;
    })
    .slice(0, 5);

  // =====================================
  // UPDATE FORM FIELDS
  // =====================================
  const updateForm = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================
  // CHANGE PROFILE PHOTO
  // =====================================
  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setMessage("");
    setError("");

    if (!file.type.startsWith("image/")) {
      const errorMessage = "Please select a valid image.";

      setError(errorMessage);
      toast.error(errorMessage);
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      const errorMessage = "Image size must be 2 MB or less.";

      setError(errorMessage);
      toast.error(errorMessage);
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const imageData = reader.result;

        localStorage.setItem(PHOTO_KEY, imageData);
        setPhoto(imageData);

        const successMessage =
          "Profile picture updated in this browser. It is not saved in the database.";

        setMessage(successMessage);
        setError("");
        toast.success("Profile picture updated successfully.");
      } catch {
        const errorMessage =
          "Unable to save this photo. Please choose a smaller image.";

        setError(errorMessage);
        toast.error(errorMessage);
      }
    };

    reader.onerror = () => {
      const errorMessage = "Could not read the selected image.";

      setError(errorMessage);
      toast.error(errorMessage);
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  // =====================================
  // REMOVE PROFILE PHOTO
  // =====================================
  const removePhoto = () => {
    try {
      localStorage.removeItem(PHOTO_KEY);
      setPhoto("");
      setMessage("");
      setError("");

      toast.success("Profile picture removed successfully.");
    } catch {
      toast.error("Unable to remove the profile picture.");
    }
  };

  // =====================================
  // SAVE EDITOR PROFILE CHANGES
  // =====================================
  const saveChanges = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!profile?.id) {
      const errorMessage = "Profile is not loaded.";

      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    const trimmedName = form.name.trim();
    const trimmedMobile = form.mobile.trim();

    if (!trimmedName) {
      const errorMessage = "Name is required.";

      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    if (trimmedName.length > 100) {
      const errorMessage = "Name must be 100 characters or fewer.";

      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    if (!/^\d{10}$/.test(trimmedMobile)) {
      const errorMessage =
        "Please enter a valid 10-digit mobile number.";

      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    if (!["", "Male", "Female", "Other"].includes(form.gender)) {
      const errorMessage = "Please select a valid gender.";

      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    if (!["Active", "Inactive"].includes(form.accountStatus)) {
      const errorMessage = "Please select a valid account status.";

      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `${API_URL}/editor/profile/${profile.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: trimmedName,
            mobile: trimmedMobile,
            gender: form.gender || null,
            account_status: form.accountStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save profile.");
      }

      const updatedUser = data.user || data;

      const updatedProfile = {
        ...profile,
        id: updatedUser.id ?? profile.id,
        name:
          updatedUser.full_name ||
          updatedUser.fullName ||
          updatedUser.name ||
          trimmedName,
        email: updatedUser.email ?? profile.email,
        mobile: updatedUser.mobile ?? trimmedMobile,
        gender: updatedUser.gender ?? form.gender,
        accountStatus:
          updatedUser.account_status ??
          updatedUser.accountStatus ??
          form.accountStatus,
        role: updatedUser.role || profile.role,
        joiningDate:
          updatedUser.joining_date ||
          updatedUser.joiningDate ||
          profile.joiningDate,
      };

      setProfile(updatedProfile);

      setForm({
        name: updatedProfile.name,
        mobile: updatedProfile.mobile,
        gender: updatedProfile.gender || "",
        accountStatus: updatedProfile.accountStatus,
      });

      const updatedSessionUser = {
        ...loggedInUser,
        id: updatedProfile.id,
        full_name: updatedProfile.name,
        email: updatedProfile.email,
        mobile: updatedProfile.mobile,
        gender: updatedProfile.gender,
        account_status: updatedProfile.accountStatus,
        role: updatedProfile.role,
        joining_date: updatedProfile.joiningDate,
      };

      sessionStorage.setItem(
        "emAxisUser",
        JSON.stringify(updatedSessionUser)
      );

      setEditing(false);
      setMessage("");
      setError("");

      toast.success("Profile updated successfully.");
    } catch (err) {
      const errorMessage =
        err.message || "Unable to save profile.";

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // =====================================
  // CANCEL EDITING
  // =====================================
  const cancelEditing = () => {
    setForm({
      name: profile.name,
      mobile: profile.mobile,
      gender: profile.gender || "",
      accountStatus: profile.accountStatus || "Active",
    });

    setEditing(false);
    setMessage("");
    setError("");
  };

  // =====================================
  // LOGOUT
  // =====================================
  const logout = () => {
    sessionStorage.removeItem("emAxisUser");
    navigate("/", { replace: true });
  };

  if (loading) {
    return (
      <div className="ep-page">
        <p>Loading editor profile...</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="ep-page">
        <h1>My Profile</h1>

        <div className="ep-message ep-error" role="alert">
          {error}
        </div>

        <button
          className="ep-primary"
          type="button"
          onClick={() => navigate("/")}
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (!profile) return null;

  const editorId = `EDT${String(profile.id).padStart(3, "0")}`;

  const isInactive =
    String(profile.accountStatus).toLowerCase() === "inactive";

  return (
    <div className="ep-page">
      {/* PAGE HEADER */}
      <div className="ep-page-heading">
        <div>
          <h1>My Profile</h1>
          <p>View and manage your profile information.</p>
        </div>

        <button
          className="ep-logout"
          type="button"
          onClick={logout}
        >
          ↪ Logout
        </button>
      </div>

      {/* SUCCESS MESSAGE */}
      {message && (
        <div className="ep-message" role="status">
          {message}

          <button
            type="button"
            onClick={() => setMessage("")}
            aria-label="Close message"
          >
            ×
          </button>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="ep-message ep-error" role="alert">
          {error}
        </div>
      )}

      {/* TOP SECTION */}
      <div className="ep-top-grid">
        {/* PROFILE SUMMARY */}
        <section className="ep-card ep-summary">
          <div className="ep-avatar">
            {photo ? (
              <img src={photo} alt="Editor profile" />
            ) : (
              <span className="ep-avatar-initial">
                {(profile.name || "E").charAt(0).toUpperCase()}
              </span>
            )}

            <button
              type="button"
              className="ep-camera-btn"
              title="Change profile picture"
              aria-label="Change profile picture"
              onClick={() => photoInputRef.current?.click()}
            >
              <svg
                viewBox="0 0 24 24"
                width="17"
                height="17"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 4h-4L8 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4z" />
                <circle cx="12" cy="13" r="3.5" />
              </svg>
            </button>

            <input
              ref={photoInputRef}
              className="ep-photo-input"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              hidden
              onChange={handlePhotoChange}
            />
          </div>

          <div className="ep-summary-info">
            <h2>{profile.name || "Editor"}</h2>

            <p className="ep-email">✉ {profile.email}</p>

            <div className="ep-badges">
              <span className="ep-role-badge">♟ Editor</span>

              <span
                className={`ep-active-badge ${
                  isInactive ? "ep-inactive" : "ep-active"
                }`}
              >
                <i />
                {profile.accountStatus}
              </span>
            </div>

            <div className="ep-summary-meta">
              <p>
                <span>▣</span>
                Employee ID <b>:</b> {editorId}
              </p>

              <p>
                <span>▦</span>
                Account Created <b>:</b>{" "}
                {formatDate(profile.joiningDate)}
              </p>
            </div>

            {photo && (
              <button
                type="button"
                className="ep-remove-photo"
                onClick={removePhoto}
              >
                Remove photo
              </button>
            )}
          </div>

          {!editing && (
            <button
              className="ep-primary ep-summary-edit"
              type="button"
              onClick={() => {
                setForm({
                  name: profile.name,
                  mobile: profile.mobile,
                  gender: profile.gender || "",
                  accountStatus: profile.accountStatus || "Active",
                });

                setEditing(true);
                setMessage("");
                setError("");
              }}
            >
              ✎ Edit Profile
            </button>
          )}
        </section>

        {/* EDITORIAL ACTIVITY - DATABASE STATISTICS */}
        <section className="ep-card ep-editorial">
          <h3>Editorial Activity</h3>

          {newsError && (
            <div className="ep-message ep-error" role="alert">
              {newsError}
            </div>
          )}

          <div className="ep-stat-grid">
            <div className="ep-stat ep-stat-wide">
              <span className="ep-stat-icon blue">▤</span>
              <div>
                <p>Total News Reviewed</p>
                <strong>
                  {newsLoading ? "..." : statistics.reviewed}
                </strong>
              </div>
            </div>

            <div className="ep-stat ep-stat-wide">
              <span className="ep-stat-icon green">✓</span>
              <div>
                <p>Approved / Published</p>
                <strong className="green-text">
                  {newsLoading ? "..." : statistics.approved}
                </strong>
              </div>
            </div>

            <div className="ep-stat">
              <span className="ep-stat-icon red">×</span>
              <div>
                <p>Rejected</p>
                <strong className="red-text">
                  {newsLoading ? "..." : statistics.rejected}
                </strong>
              </div>
            </div>

            <div className="ep-stat">
              <span className="ep-stat-icon orange">↻</span>
              <div>
                <p>Correction Required</p>
                <strong className="orange-text">
                  {newsLoading ? "..." : statistics.correction}
                </strong>
              </div>
            </div>

            <div className="ep-stat">
              <span className="ep-stat-icon purple">◷</span>
              <div>
                <p>Pending Review</p>
                <strong className="purple-text">
                  {newsLoading ? "..." : statistics.pending}
                </strong>
              </div>
            </div>
          </div>

          {!newsLoading && !newsError && news.length === 0 && (
            <p>No news records are available in the database yet.</p>
          )}
        </section>
      </div>

      {/* MIDDLE SECTION */}
      <div className="ep-middle-grid">
        {/* PERSONAL INFORMATION */}
        <section className="ep-card ep-personal-card">
          <div className="ep-section-heading">
            <h3>Personal Information</h3>
            <p>
              Manage your name, mobile number, gender and account status.
            </p>
          </div>

          <form onSubmit={saveChanges}>
            <div className="ep-form-grid">
              <div className="ep-field">
                <label htmlFor="ep-name">Full Name</label>

                <div className="ep-input-wrap">
                  <span>♙</span>
                  <input
                    id="ep-name"
                    name="name"
                    value={form.name}
                    onChange={updateForm}
                    disabled={!editing}
                    required
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="ep-field">
                <label htmlFor="ep-email">Email Address</label>

                <div className="ep-input-wrap ep-readonly">
                  <span>✉</span>
                  <input
                    id="ep-email"
                    value={profile.email}
                    disabled
                    readOnly
                  />
                </div>
              </div>

              <div className="ep-field">
                <label htmlFor="ep-mobile">Mobile Number</label>

                <div className="ep-input-wrap">
                  <span>☎</span>
                  <input
                    id="ep-mobile"
                    name="mobile"
                    type="tel"
                    value={form.mobile}
                    onChange={updateForm}
                    disabled={!editing}
                    maxLength={10}
                    pattern="[0-9]{10}"
                    placeholder="Enter 10-digit mobile number"
                    required
                  />
                </div>
              </div>

              <div className="ep-field">
                <label htmlFor="ep-gender">Gender</label>

                <div className="ep-input-wrap">
                  <span>⚥</span>
                  <select
                    id="ep-gender"
                    name="gender"
                    value={form.gender}
                    onChange={updateForm}
                    disabled={!editing}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="ep-field">
                <label htmlFor="ep-role">Role / Designation</label>

                <div className="ep-input-wrap ep-readonly">
                  <span>♙</span>
                  <input
                    id="ep-role"
                    value="Editor"
                    disabled
                    readOnly
                  />
                </div>
              </div>

              <div className="ep-field">
                <label htmlFor="ep-id">Employee ID</label>

                <div className="ep-input-wrap ep-readonly">
                  <span>▣</span>
                  <input
                    id="ep-id"
                    value={editorId}
                    disabled
                    readOnly
                  />
                </div>
              </div>

              <div className="ep-field">
                <label htmlFor="ep-joining-date">Joining Date</label>

                <div className="ep-input-wrap ep-readonly">
                  <span>▦</span>
                  <input
                    id="ep-joining-date"
                    value={formatDate(profile.joiningDate)}
                    disabled
                    readOnly
                  />
                </div>
              </div>

              <div className="ep-field">
                <label htmlFor="ep-status">Account Status</label>

                <div className="ep-input-wrap">
                  <span>●</span>
                  <select
                    id="ep-status"
                    name="accountStatus"
                    value={form.accountStatus}
                    onChange={updateForm}
                    disabled={!editing}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {editing && (
              <div className="ep-form-actions">
                <button
                  className="ep-primary"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "▣ Save Changes"}
                </button>

                <button
                  className="ep-secondary"
                  type="button"
                  onClick={cancelEditing}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </section>

        {/* RECENT ACTIVITY - ACTUAL DATABASE NEWS */}
        <section className="ep-card ep-activity-card">
          <h3>Recent News Updates</h3>

          {newsLoading ? (
            <p>Loading recent news updates...</p>
          ) : newsError ? (
            <p>Recent news updates could not be loaded.</p>
          ) : recentNews.length === 0 ? (
            <p>No news updates available yet.</p>
          ) : (
            <div className="ep-timeline">
              {recentNews.map((item) => {
                const activity = getActivityDetails(item);

                return (
                  <div
                    className="ep-timeline-item"
                    key={item.id}
                  >
                    <div
                      className={`ep-timeline-icon ${activity.type}`}
                    >
                      {activity.icon}
                    </div>

                    <div className="ep-timeline-content">
                      <div className="ep-activity-title-row">
                        <h4>{activity.title}</h4>
                      </div>

                      <p>{activity.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ACCOUNT INFORMATION */}
      <section className="ep-card ep-account-card">
        <h3>♢ &nbsp;Account Information</h3>

        <div className="ep-account-grid">
          <div className="ep-account-item">
            <span
              className={`ep-account-icon ${
                isInactive ? "red" : "green"
              }`}
            >
              {isInactive ? "×" : "✓"}
            </span>

            <div>
              <strong
                className={`ep-account-status ${
                  isInactive
                    ? "ep-account-inactive"
                    : "ep-account-active"
                }`}
              >
                {profile.accountStatus}
              </strong>

              <p>Account Status</p>
            </div>
          </div>

          <div className="ep-account-item">
            <span className="ep-account-icon blue">♙</span>

            <div>
              <strong>Editor</strong>
              <p>Role</p>
            </div>
          </div>

          <div className="ep-account-item">
            <span className="ep-account-icon blue">▦</span>

            <div>
              <strong>Joining Date</strong>
              <p>{formatDate(profile.joiningDate)}</p>
            </div>
          </div>

          <button
            className="ep-password-link"
            type="button"
            onClick={() => navigate("/editor/settings")}
          >
            <span>♙</span>

            <div>
              <strong>Change Password</strong>
              <p>Go to Settings.</p>
            </div>

            <span className="ep-arrow">›</span>
          </button>
        </div>
      </section>

      <p className="ep-footer">
        EM-AXIS News Management System
      </p>
    </div>
  );
}

export default EditorProfile;