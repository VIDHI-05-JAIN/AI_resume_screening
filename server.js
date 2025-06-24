const express = require("express");
const multer = require("multer");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// MySQL DB connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Vidhi@2005",
  database: "job_recruitment",
});

db.connect((err) => {
  if (err) throw err;
  console.log("✅ Connected to MySQL Database");
});

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// POST resume and save to DB
app.post("/upload", upload.single("resume"), (req, res) => {
  const { candidateId, jobId } = req.body;
  const filename = req.file.filename;

  // Step 1: Insert into RESUME table
  const resumeQuery = `INSERT INTO RESUME (CandidateID, JobID, FileName) VALUES (?, ?, ?)`;
  db.query(resumeQuery, [candidateId, jobId, filename], (err, result) => {
    if (err) return res.status(500).send(err);

    const resumeId = result.insertId;

    // Step 2: Insert mock AI result
    const aiQuery = `
      INSERT INTO AI_SCREENING_RESULT 
      (ResumeID, SkillsMatched, RelevancePercent, Score, Status, Remark) 
      VALUES (?, 'Java, SQL', 85, 8.5, 'Shortlisted', 'Strong match')`;
    db.query(aiQuery, [resumeId], (err2) => {
      if (err2) return res.status(500).send(err2);
      res.send({ message: "Resume uploaded and screened successfully." });
    });
  });
});

// Serve index.html for the root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
