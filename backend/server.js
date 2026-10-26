
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
require("dotenv").config();

const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================
// MIDDLEWARE
// =====================================
app.use(cors());
app.use(express.json({ limit: "1mb" }));

// =====================================
// HELPERS
// =====================================
const normalizeRole = (role) =>
  String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const validId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
};

const validEventDate = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

const safeMediaFiles = (value) =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};

// =====================================
// NOTIFICATION HELPER
// =====================================
async function createReporterNotification({
  reporterId,
  newsId = null,
  title,
  message,
  category,
  type = "info",
  details = message,
}) {
  await pool.query(
    `INSERT INTO public.notifications
      (reporter_id, news_id, title, message, category, type, details)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [reporterId, newsId, title, message, category, type, details]
  );
}

// =====================================
// HOME ROUTE
// =====================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "EM-AXIS Backend Server is running!",
  });
});

// =====================================
// DATABASE CONNECTION TEST
// =====================================
app.get("/api/health/db", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        current_database() AS database,
        current_schema() AS schema,
        to_regclass('public.users') AS users_table,
        to_regclass('public.news') AS news_table,
        to_regclass('public.news_drafts') AS drafts_table
    `);

    res.status(200).json({
      success: true,
      message: "PostgreSQL connected successfully!",
      ...result.rows[0],
    });
  } catch (error) {
    console.error("DATABASE ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed.",
    });
  }
});

// =====================================
// REGISTRATION API
// =====================================
app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      role,
      mobile,
      joining_date,
    } = req.body;

    if (
      typeof full_name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof role !== "string" ||
      !full_name.trim() ||
      !email.trim() ||
      !password ||
      !role.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const cleanName = full_name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanRole = normalizeRole(role);

    if (cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must be 100 characters or fewer.",
      });
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
      cleanEmail.length > 150
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 8 characters.",
      });
    }

    const cleanMobile =
      typeof mobile === "string" ? mobile.trim() : "";

    if (!/^\d{10}$/.test(cleanMobile)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number.",
      });
    }

    const allowedRoles = ["reporter", "editor", "channel_head"];

    if (!allowedRoles.includes(cleanRole)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid role.",
      });
    }

    const cleanJoiningDate =
      joining_date || new Date().toISOString().slice(0, 10);

    if (
      typeof cleanJoiningDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(cleanJoiningDate) ||
      Number.isNaN(Date.parse(cleanJoiningDate))
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid joining date.",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM public.users WHERE LOWER(email) = $1",
      [cleanEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO public.users
        (full_name, email, mobile, password_hash, role, joining_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, email, mobile, role, joining_date`,
      [
        cleanName,
        cleanEmail,
        cleanMobile,
        passwordHash,
        cleanRole,
        cleanJoiningDate,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful!",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("REGISTRATION ERROR:", error.message);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "This email is already registered.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
});

// =====================================
// LOGIN API
// =====================================
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof role !== "string" ||
      !email.trim() ||
      !password ||
      !role.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter email, password and role.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanRole = normalizeRole(role);

    const result = await pool.query(
      `SELECT id, full_name, email, mobile, password_hash, role, joining_date, account_status
       FROM public.users
       WHERE LOWER(email) = $1`,
      [cleanEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      return res.status(500).json({
        success: false,
        message: "Account configuration error.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const registeredRole = normalizeRole(user.role);

    if (registeredRole !== cleanRole) {
      return res.status(403).json({
        success: false,
        message: "Selected role does not match your registered role.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        mobile: user.mobile,
        role: registeredRole,
        joining_date: user.joining_date,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
});

// =====================================
// USER PROFILE API
// =====================================
app.get("/api/users/:id", async (req, res) => {
  try {
    const userId = validId(req.params.id);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const result = await pool.query(
      `SELECT id, full_name, email, mobile, role, joining_date
       FROM public.users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("PROFILE FETCH ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load profile.",
    });
  }
});

// =====================================
// EDITOR PROFILE - GET API
// =====================================
app.get("/api/editor/profile/:id", async (req, res) => {
  try {
    const userId = validId(req.params.id);

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid editor ID.",
      });
    }

    const result = await pool.query(
      `SELECT id, full_name, email, mobile, role, joining_date,
              gender, account_status
       FROM public.users
       WHERE id = $1 AND role = 'editor'`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Editor profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("EDITOR PROFILE FETCH ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to load profile.",
    });
  }
});

// =====================================
// EDITOR PROFILE - UPDATE API
// =====================================
app.patch("/api/editor/profile/:id", async (req, res) => {
  try {
    const userId = validId(req.params.id);
    const { full_name, mobile, gender, account_status } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Invalid editor ID.",
      });
    }

    if (
      typeof full_name !== "string" ||
      !full_name.trim() ||
      full_name.trim().length > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid name.",
      });
    }

    if (
      typeof mobile !== "string" ||
      !/^\d{10}$/.test(mobile.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit mobile number.",
      });
    }

    const allowedGenders = ["Male", "Female", "Other"];

    if (
      gender != null &&
      gender !== "" &&
      !allowedGenders.includes(gender)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid gender.",
      });
    }

    if (!["Active", "Inactive"].includes(account_status)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid account status.",
      });
    }

    const result = await pool.query(
      `UPDATE public.users
       SET full_name = $1,
           mobile = $2,
           gender = $3,
           account_status = $4
       WHERE id = $5 AND role = 'editor'
       RETURNING id, full_name, email, mobile, role, joining_date,
                 gender, account_status`,
      [
        full_name.trim(),
        mobile.trim(),
        gender || null,
        account_status,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Editor profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Editor profile updated successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("EDITOR PROFILE UPDATE ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update profile.",
    });
  }
});

// =====================================
// CREATE NEWS / SEND TO EDITOR
// =====================================
app.post("/api/news", async (req, res) => {
  try {
    const {
      reporterId,
      newsFormat,
      newsSlug,
      location,
      eventDate,
      script,
      breakingNews,
      mediaFiles,
    } = req.body;

    const reporterID = validId(reporterId);

    if (
      !reporterID ||
      typeof newsFormat !== "string" ||
      !newsFormat.trim() ||
      typeof newsSlug !== "string" ||
      !newsSlug.trim() ||
      typeof location !== "string" ||
      !location.trim() ||
      typeof eventDate !== "string" ||
      !eventDate.trim() ||
      typeof script !== "string" ||
      !script.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required news details.",
      });
    }

    const parsedDate = validEventDate(eventDate);

    if (parsedDate === undefined || parsedDate === null) {
      return res.status(400).json({
        success: false,
        message: "Invalid event date.",
      });
    }

    const reporter = await pool.query(
      `SELECT id
       FROM public.users
       WHERE id = $1 AND role = 'reporter'`,
      [reporterID]
    );

    if (reporter.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Reporter account not found.",
      });
    }

    const result = await pool.query(
      `INSERT INTO public.news (
         reporter_id,
         news_format,
         news_slug,
         location,
         event_date,
         script,
         breaking_news,
         media_files,
         status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, 'Pending')
       RETURNING *`,
      [
        reporterID,
        newsFormat.trim(),
        newsSlug.trim(),
        location.trim(),
        parsedDate,
        script.trim(),
        breakingNews === true,
        JSON.stringify(safeMediaFiles(mediaFiles)),
      ]
    );

    const news = result.rows[0];
    
await createEditorNotificationsForNews({
  newsId: news.id,
  title: "New News Submitted",
  message: `A new news report "${news.news_slug}" has been submitted for editorial review.`,
  category: "New Submission",
  type: "info",
  details: `News: ${news.news_slug}\nStatus: ${news.status}`,
});


    await createReporterNotification({
      reporterId: reporterID,
      newsId: news.id,
      title: "News Submitted",
      message: `Your news "${news.news_slug}" was submitted successfully and is pending editorial review.`,
      category: "Under Review",
      type: "warning",
      details:
        "Your news report was submitted successfully. The editorial team can now review it.",
    });

    return res.status(201).json({
      success: true,
      message: "News submitted successfully.",
      news,
    });
  } catch (error) {
    console.error("CREATE NEWS ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to submit news.",
    });
  }
});



async function createEditorNotificationsForNews({
  newsId,
  title,
  message,
  category = "News Update",
  type = "info",
  details = message,
}) {
  const editors = await pool.query(
    `SELECT id
     FROM public.users
     WHERE LOWER(role) = 'editor'
       AND COALESCE(account_status, 'Active') = 'Active'`
  );

  for (const editor of editors.rows) {
    await pool.query(
      `INSERT INTO public.editor_notifications
        (editor_id, news_id, title, message, category, type, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        editor.id,
        newsId,
        title,
        message,
        category,
        type,
        details,
      ]
    );
  }
}


// =====================================
// FETCH REPORTER NEWS
// =====================================
app.get("/api/news/reporter/:reporterId", async (req, res) => {
  try {
    const reporterID = validId(req.params.reporterId);

    if (!reporterID) {
      return res.status(400).json({
        success: false,
        message: "Invalid reporter ID.",
      });
    }

    const result = await pool.query(
      `SELECT
         id,
         reporter_id,
         news_format AS format,
         news_slug AS title,
         news_slug,
         location,
         event_date,
         script,
         breaking_news,
         media_files,
         status,
         editor_feedback,
         created_at,
         updated_at
       FROM public.news
       WHERE reporter_id = $1
       ORDER BY created_at DESC`,
      [reporterID]
    );

    return res.status(200).json({
      success: true,
      news: result.rows,
    });
  } catch (error) {
    console.error("FETCH REPORTER NEWS ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch reporter news.",
    });
  }
});

// =====================================
// FETCH ALL NEWS FOR EDITOR
// =====================================
app.get("/api/news", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         n.id,
         n.reporter_id,
         u.full_name AS reporter_name,
         n.news_format AS format,
         n.news_slug AS title,
         n.news_slug,
         n.location,
         n.event_date,
         n.script,
         n.breaking_news,
         n.media_files,
         n.status,
         n.editor_feedback,
         n.created_at,
         n.updated_at
       FROM public.news n
       JOIN public.users u ON u.id = n.reporter_id
       ORDER BY n.created_at DESC`
    );

    return res.status(200).json({
      success: true,
      news: result.rows,
    });
  } catch (error) {
    console.error("FETCH ALL NEWS ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch news.",
    });
  }
});

// =====================================
// UPDATE NEWS STATUS / EDITOR FEEDBACK
// FIX: Accept editor_feedback AND editorFeedback
// =====================================
app.patch("/api/news/:id/status", async (req, res) => {
  try {
    const newsID = validId(req.params.id);
    const { status } = req.body;

    // The frontend may send either naming convention.
    const editorFeedback =
      req.body.editor_feedback ?? req.body.editorFeedback ?? "";

    const allowedStatuses = [
      "Pending",
      "Approved",
      "Published",
      "Correction Required",
      "Rejected",
    ];

    if (!newsID) {
      return res.status(400).json({
        success: false,
        message: "Invalid news ID.",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid news status.",
      });
    }

    if (typeof editorFeedback !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid editor feedback.",
      });
    }

    const cleanFeedback = editorFeedback.trim();

    if (
      ["Rejected", "Correction Required"].includes(status) &&
      !cleanFeedback
    ) {
      return res.status(400).json({
        success: false,
        message:
          status === "Rejected"
            ? "Please provide the rejection reason."
            : "Please provide the correction remarks.",
      });
    }

    const result = await pool.query(
      `UPDATE public.news
       SET status = $1,
           editor_feedback = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING
         id,
         reporter_id,
         news_slug,
         status,
         editor_feedback,
         updated_at`,
      [
        status,
        cleanFeedback || null,
        newsID,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "News not found.",
      });
    }

    const updatedNews = result.rows[0];
    const reason = updatedNews.editor_feedback;

    let notification;

    switch (status) {
      case "Pending":
        notification = {
          title: "News Under Review",
          message: `Your news "${updatedNews.news_slug}" is pending editorial review.`,
          category: "Under Review",
          type: "warning",
        };
        break;

      case "Approved":
        notification = {
          title: "News Approved",
          message: `Your news "${updatedNews.news_slug}" has been approved by the editor.`,
          category: "Approved",
          type: "success",
        };
        break;

      case "Published":
        notification = {
          title: "News Published",
          message: `Your news "${updatedNews.news_slug}" has been published successfully.`,
          category: "Published",
          type: "success",
        };
        break;

      case "Correction Required":
        notification = {
          title: "Correction Required",
          message: `Your news "${updatedNews.news_slug}" requires corrections. Editor's remarks: ${reason}`,
          category: "Correction Required",
          type: "warning",
        };
        break;

      case "Rejected":
        notification = {
          title: "News Rejected",
          message: `Your news "${updatedNews.news_slug}" was rejected. Reason: ${reason}`,
          category: "Rejected",
          type: "error",
        };
        break;
    }

    await createReporterNotification({
      reporterId: updatedNews.reporter_id,
      newsId: updatedNews.id,
      title: notification.title,
      message: notification.message,
      category: notification.category,
      type: notification.type,
      details: notification.message,
    });

    return res.status(200).json({
      success: true,
      message: "News status and editor feedback updated successfully.",
      news: updatedNews,
    });
  } catch (error) {
    console.error("UPDATE NEWS STATUS ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update news status.",
    });
  }
});

// =====================================
// DRAFTS - FETCH REPORTER DRAFTS
// =====================================
app.get("/api/news/drafts/:reporterId", async (req, res) => {
  try {
    const reporterID = validId(req.params.reporterId);

    if (!reporterID) {
      return res.status(400).json({
        success: false,
        message: "Invalid reporter ID.",
      });
    }

    const result = await pool.query(
      `SELECT *
       FROM public.news_drafts
       WHERE reporter_id = $1
       ORDER BY created_at DESC`,
      [reporterID]
    );

    return res.status(200).json({
      success: true,
      drafts: result.rows,
    });
  } catch (error) {
    console.error("FETCH DRAFTS ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch drafts.",
    });
  }
});

// =====================================
// DRAFTS - CREATE DRAFT
// =====================================
app.post("/api/news/drafts", async (req, res) => {
  try {
    const {
      reporterId,
      newsFormat,
      newsSlug,
      location,
      eventDate,
      script,
      breakingNews,
      mediaFiles,
    } = req.body;

    const reporterID = validId(reporterId);

    if (!reporterID) {
      return res.status(400).json({
        success: false,
        message: "Invalid reporter ID.",
      });
    }

    const reporter = await pool.query(
      `SELECT id FROM public.users
       WHERE id = $1 AND role = 'reporter'`,
      [reporterID]
    );

    if (reporter.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Reporter account not found.",
      });
    }

    const cleanFormat =
      typeof newsFormat === "string" ? newsFormat.trim() : "";
    const cleanSlug =
      typeof newsSlug === "string" ? newsSlug.trim() : "";
    const cleanLocation =
      typeof location === "string" ? location.trim() : "";
    const cleanScript =
      typeof script === "string" ? script.trim() : "";

    let parsedDate = null;

    if (eventDate) {
      parsedDate = validEventDate(eventDate);

      if (parsedDate === undefined) {
        return res.status(400).json({
          success: false,
          message: "Invalid event date.",
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO public.news_drafts (
         reporter_id,
         news_format,
         news_slug,
         location,
         event_date,
         script,
         breaking_news,
         media_files
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)
       RETURNING *`,
      [
        reporterID,
        cleanFormat,
        cleanSlug,
        cleanLocation,
        parsedDate,
        cleanScript,
        breakingNews === true,
        JSON.stringify(safeMediaFiles(mediaFiles)),
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Draft saved successfully.",
      draft: result.rows[0],
    });
  } catch (error) {
    console.error("CREATE DRAFT ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to save draft.",
    });
  }
});

// =====================================
// DRAFTS - UPDATE DRAFT
// =====================================
app.patch("/api/news/drafts/:id", async (req, res) => {
  try {
    const draftID = validId(req.params.id);
    const reporterID = validId(req.body.reporterId);

    if (!draftID || !reporterID) {
      return res.status(400).json({
        success: false,
        message: "Invalid draft or reporter ID.",
      });
    }

    const {
      newsFormat,
      newsSlug,
      location,
      eventDate,
      script,
      breakingNews,
      mediaFiles,
    } = req.body;

    const parsedDate = eventDate
      ? validEventDate(eventDate)
      : null;

    if (parsedDate === undefined) {
      return res.status(400).json({
        success: false,
        message: "Invalid event date.",
      });
    }

    const result = await pool.query(
      `UPDATE public.news_drafts
       SET news_format = $1,
           news_slug = $2,
           location = $3,
           event_date = $4,
           script = $5,
           breaking_news = $6,
           media_files = $7::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND reporter_id = $9
       RETURNING *`,
      [
        typeof newsFormat === "string" ? newsFormat.trim() : "",
        typeof newsSlug === "string" ? newsSlug.trim() : "",
        typeof location === "string" ? location.trim() : "",
        parsedDate,
        typeof script === "string" ? script.trim() : "",
        breakingNews === true,
        JSON.stringify(safeMediaFiles(mediaFiles)),
        draftID,
        reporterID,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Draft not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Draft updated successfully.",
      draft: result.rows[0],
    });
  } catch (error) {
    console.error("UPDATE DRAFT ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update draft.",
    });
  }
});

// =====================================
// DRAFTS - DELETE DRAFT
// =====================================
app.delete("/api/news/drafts/:id", async (req, res) => {
  try {
    const draftID = validId(req.params.id);
    const reporterID = validId(req.query.reporterId);

    if (!draftID || !reporterID) {
      return res.status(400).json({
        success: false,
        message: "Invalid draft or reporter ID.",
      });
    }

    const result = await pool.query(
      `DELETE FROM public.news_drafts
       WHERE id = $1 AND reporter_id = $2
       RETURNING id`,
      [draftID, reporterID]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Draft not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Draft deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE DRAFT ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to delete draft.",
    });
  }
});

/* =====================================
   EDITOR NOTIFICATIONS - FETCH ALL
===================================== */
app.get("/api/notifications/editor/:editorId", async (req, res) => {
  try {
    const editorId = validId(req.params.editorId);

    if (!editorId) {
      return res.status(400).json({
        success: false,
        message: "Invalid editor ID.",
      });
    }

    const editor = await pool.query(
      `SELECT id
       FROM public.users
       WHERE id = $1 AND LOWER(role) = 'editor'`,
      [editorId]
    );

    if (editor.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Editor not found.",
      });
    }

    const result = await pool.query(
      `SELECT
         id,
         editor_id,
         news_id,
         title,
         message,
         category,
         type,
         details,
         is_read AS "read",
         created_at
       FROM public.editor_notifications
       WHERE editor_id = $1
       ORDER BY created_at DESC`,
      [editorId]
    );

    return res.status(200).json({
      success: true,
      notifications: result.rows,
    });
  } catch (error) {
    console.error("FETCH EDITOR NOTIFICATIONS ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch editor notifications.",
    });
  }
});


/* =====================================
   EDITOR - MARK ONE NOTIFICATION READ
===================================== */
app.patch(
  "/api/notifications/editor/:editorId/:notificationId/read",
  async (req, res) => {
    try {
      const editorId = validId(req.params.editorId);
      const notificationId = validId(req.params.notificationId);

      if (!editorId || !notificationId) {
        return res.status(400).json({
          success: false,
          message: "Invalid editor or notification ID.",
        });
      }

      const result = await pool.query(
        `UPDATE public.editor_notifications
         SET is_read = TRUE
         WHERE id = $1 AND editor_id = $2
         RETURNING id, is_read AS "read"`,
        [notificationId, editorId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Notification not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Notification marked as read.",
        notification: result.rows[0],
      });
    } catch (error) {
      console.error("MARK EDITOR NOTIFICATION READ ERROR:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to update notification.",
      });
    }
  }
);


/* =====================================
   EDITOR - MARK ALL NOTIFICATIONS READ
===================================== */
app.patch(
  "/api/notifications/editor/:editorId/read-all",
  async (req, res) => {
    try {
      const editorId = validId(req.params.editorId);

      if (!editorId) {
        return res.status(400).json({
          success: false,
          message: "Invalid editor ID.",
        });
      }

      const editor = await pool.query(
        `SELECT id
         FROM public.users
         WHERE id = $1 AND LOWER(role) = 'editor'`,
        [editorId]
      );

      if (editor.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Editor not found.",
        });
      }

      const result = await pool.query(
        `UPDATE public.editor_notifications
         SET is_read = TRUE
         WHERE editor_id = $1 AND is_read = FALSE`,
        [editorId]
      );

      return res.status(200).json({
        success: true,
        message: "All notifications marked as read.",
        updatedCount: result.rowCount,
      });
    } catch (error) {
      console.error("MARK ALL EDITOR NOTIFICATIONS ERROR:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to update notifications.",
      });
    }
  }
);


// =====================================
// REPORTER NOTIFICATIONS - GET ALL
// =====================================
app.get("/api/notifications/reporter/:reporterId", async (req, res) => {
  try {
    const reporterID = validId(req.params.reporterId);

    if (!reporterID) {
      return res.status(400).json({
        success: false,
        message: "Invalid reporter ID.",
      });
    }

    const reporter = await pool.query(
      `SELECT id FROM public.users
       WHERE id = $1 AND role = 'reporter'`,
      [reporterID]
    );

    if (reporter.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Reporter not found.",
      });
    }

    const result = await pool.query(
      `SELECT
         id,
         reporter_id,
         news_id,
         title,
         message,
         category,
         type,
         details,
         is_read AS "read",
         created_at
       FROM public.notifications
       WHERE reporter_id = $1
       ORDER BY created_at DESC`,
      [reporterID]
    );

    return res.status(200).json({
      success: true,
      notifications: result.rows,
    });
  } catch (error) {
    console.error("FETCH NOTIFICATIONS ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
    });
  }
});

// =====================================
// MARK SINGLE NOTIFICATION AS READ
// =====================================
app.patch("/api/notifications/:id/read", async (req, res) => {
  try {
    const notificationID = validId(req.params.id);
    const reporterID = validId(req.body.reporterId);

    if (!notificationID || !reporterID) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification or reporter ID.",
      });
    }

    const result = await pool.query(
      `UPDATE public.notifications
       SET is_read = TRUE
       WHERE id = $1 AND reporter_id = $2
       RETURNING id, is_read AS "read"`,
      [notificationID, reporterID]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification: result.rows[0],
    });
  } catch (error) {
    console.error("MARK NOTIFICATION READ ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update notification.",
    });
  }
});

// =====================================
// MARK ALL REPORTER NOTIFICATIONS READ
// =====================================
app.patch(
  "/api/notifications/reporter/:reporterId/read-all",
  async (req, res) => {
    try {
      const reporterID = validId(req.params.reporterId);

      if (!reporterID) {
        return res.status(400).json({
          success: false,
          message: "Invalid reporter ID.",
        });
      }

      const result = await pool.query(
        `UPDATE public.notifications
         SET is_read = TRUE
         WHERE reporter_id = $1 AND is_read = FALSE
         RETURNING id`,
        [reporterID]
      );

      return res.status(200).json({
        success: true,
        message: "All notifications marked as read.",
        updatedCount: result.rowCount,
      });
    } catch (error) {
      console.error("MARK ALL NOTIFICATIONS READ ERROR:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to update notifications.",
      });
    }
  }
);

// =====================================
// DELETE SINGLE REPORTER NOTIFICATION
// =====================================
app.delete("/api/notifications/:id", async (req, res) => {
  try {
    const notificationID = validId(req.params.id);
    const reporterID = validId(req.query.reporterId);

    if (!notificationID || !reporterID) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification or reporter ID.",
      });
    }

    const result = await pool.query(
      `DELETE FROM public.notifications
       WHERE id = $1 AND reporter_id = $2
       RETURNING id`,
      [notificationID, reporterID]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE NOTIFICATION ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete notification.",
    });
  }
});

// =====================================
// DELETE ALL READ NOTIFICATIONS
// =====================================
app.delete(
  "/api/notifications/reporter/:reporterId/read",
  async (req, res) => {
    try {
      const reporterID = validId(req.params.reporterId);

      if (!reporterID) {
        return res.status(400).json({
          success: false,
          message: "Invalid reporter ID.",
        });
      }

      const result = await pool.query(
        `DELETE FROM public.notifications
         WHERE reporter_id = $1 AND is_read = TRUE
         RETURNING id`,
        [reporterID]
      );

      return res.status(200).json({
        success: true,
        message: "Read notifications deleted successfully.",
        deletedCount: result.rowCount,
      });
    } catch (error) {
      console.error("DELETE READ NOTIFICATIONS ERROR:", error.message);

      return res.status(500).json({
        success: false,
        message: "Failed to delete read notifications.",
      });
    }
  }
);

/* =====================================
   GET ALL REPORTERS FROM DATABASE
===================================== */
app.get("/api/reporters", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        u.id,
        u.full_name AS name,
        u.email,
        u.mobile,
        u.joining_date,
        COALESCE(u.account_status, 'Active') AS status,

        COUNT(n.id)::int AS total,

        COUNT(n.id) FILTER (
          WHERE LOWER(COALESCE(n.status, '')) = 'pending'
        )::int AS pending,

        COUNT(n.id) FILTER (
          WHERE LOWER(COALESCE(n.status, '')) = 'approved'
        )::int AS approved,

        COUNT(n.id) FILTER (
          WHERE LOWER(COALESCE(n.status, '')) = 'rejected'
        )::int AS rejected,

        COUNT(n.id) FILTER (
          WHERE LOWER(COALESCE(n.status, '')) = 'published'
        )::int AS published

      FROM public.users u

      LEFT JOIN public.news n
        ON n.reporter_id = u.id

      WHERE LOWER(u.role) = 'reporter'

      GROUP BY
        u.id,
        u.full_name,
        u.email,
        u.mobile,
        u.joining_date,
        u.account_status

      ORDER BY u.id ASC
    `);

    const reporters = result.rows.map((reporter) => ({
      ...reporter,
      id: Number(reporter.id),
      reporterCode: `REP-${String(reporter.id).padStart(3, "0")}`,
      total: Number(reporter.total),
      pending: Number(reporter.pending),
      approved: Number(reporter.approved),
      rejected: Number(reporter.rejected),
      published: Number(reporter.published),
    }));

    return res.status(200).json({
      success: true,
      count: reporters.length,
      reporters,
    });
  } catch (error) {
    console.error("FETCH ALL REPORTERS ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch reporters from the database.",
    });
  }
});


// =====================================
// START EM-AXIS SERVER
// =====================================
app.listen(PORT, () => {
  console.log(`EM-AXIS server running on port ${PORT}`);
});
