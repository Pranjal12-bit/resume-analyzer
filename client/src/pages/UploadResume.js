"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "../styles/UploadResume.css";

/**
 * Upload Resume Component
 * Handles resume file upload with drag-and-drop functionality
 */
const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const navigate = useNavigate();

  // Common job roles for autocomplete suggestions
  const commonJobRoles = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "UI/UX Designer",
    "Data Scientist",
    "Product Manager",
    "Project Manager",
    "Software Engineer",
    "DevOps Engineer",
    "QA Engineer",
    "Marketing Specialist",
    "Sales Representative",
    "Customer Support",
    "Human Resources",
    "Financial Analyst",
  ];

  /**
   * Handle file input change
   * @param {Event} e - File input change event
   */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  /**
   * Validate file type and set file state
   * @param {File} selectedFile - Selected file object
   */
  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    const fileType = selectedFile.type;
    const fileExtension = selectedFile.name.split(".").pop().toLowerCase();

    // Check if file is PDF or DOCX
    const isValidFile =
      fileType === "application/pdf" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileExtension === "pdf" ||
      fileExtension === "docx";

    if (isValidFile) {
      setFile(selectedFile);
      setError("");
    } else {
      setFile(null);
      setError("Please upload a PDF or DOCX file");
    }
  };

  /**
   * Handle drag events for drag-and-drop functionality
   * @param {Event} e - Drag event
   */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  /**
   * Handle file drop
   * @param {Event} e - Drop event
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!file) {
      setError("Please select a resume file");
      return;
    }

    if (!jobRole) {
      setError("Please select or enter a job role");
      return;
    }

    setLoading(true);
    setError("");

    // Create form data for file upload
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobRole", jobRole);

    try {
      const response = await api.post("/resume/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.success) {
        // Get the latest resume and navigate to its details
        const historyResponse = await api.get("/resume/history");
        if (historyResponse.data?.history?.length > 0) {
          const latestResumeId = historyResponse.data.history[0]._id;
          navigate(`/resume/${latestResumeId}`);
        } else {
          navigate("/history");
        }
      } else {
        navigate("/history");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h1>Upload Your Resume</h1>
      <p className="upload-subtitle">
        Upload your resume to get AI-powered feedback and ATS compatibility
        score
      </p>

      {/* Error message */}
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* File Drop Area */}
        <div
          className={`file-drop-area ${dragActive ? "drag-active" : ""} ${
            file ? "has-file" : ""
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="resume"
            className="file-input"
            onChange={handleFileChange}
            accept=".pdf,.docx"
          />

          {file ? (
            // File selected display
            <div className="file-info">
              <i className="fas fa-file-alt file-icon"></i>
              <span className="file-name">{file.name}</span>
              <button
                type="button"
                className="remove-file-btn"
                onClick={() => setFile(null)}
              >
                Remove
              </button>
            </div>
          ) : (
            // Drop zone display
            <div className="drop-message">
              <i className="fas fa-cloud-upload-alt upload-icon"></i>
              <p>Drag & drop your resume here or</p>
              <label htmlFor="resume" className="select-file-btn">
                Browse Files
              </label>
              <p className="file-format-hint">Supported formats: PDF, DOCX</p>
            </div>
          )}
        </div>

        {/* Job Role Input */}
        <div className="form-group">
          <label htmlFor="jobRole">Target Job Role</label>
          <div className="job-role-input-container">
            <input
              type="text"
              id="jobRole"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="Enter the job role you're applying for"
              list="jobRolesList"
              required
            />
            <datalist id="jobRolesList">
              {commonJobRoles.map((role, index) => (
                <option key={index} value={role} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="upload-button"
          disabled={loading || !file || !jobRole}
        >
          {loading ? (
            <>
              <div className="button-spinner"></div>
              Analyzing Resume...
            </>
          ) : (
            "Analyze Resume"
          )}
        </button>
      </form>
    </div>
  );
};

export default UploadResume;
