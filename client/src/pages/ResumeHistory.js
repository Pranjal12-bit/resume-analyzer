"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "../styles/ResumeHistory.css";

/**
 * Resume History Component
 * Displays list of all uploaded resumes with search and sort functionality
 */
const ResumeHistory = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState("");

  // Fetch resume history on component mount
  useEffect(() => {
    fetchResumeHistory();
  }, []);

  /**
   * Fetch all resume history from API
   */
  const fetchResumeHistory = async () => {
    try {
      const response = await api.get("/resume/history");
      setResumes(response.data.history);
    } catch (err) {
      setError("Failed to load resume history");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle search input change
   * @param {Event} e - Input change event
   */
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  /**
   * Handle sort criteria change
   * @param {Event} e - Select change event
   */
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  /**
   * Toggle sort order between ascending and descending
   */
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  /**
   * Handle PDF download for a specific resume
   * @param {string} resumeId - Resume ID
   * @param {string} fileName - Original file name
   */
  const handleDownloadPDF = async (resumeId, fileName) => {
    if (downloadingId) return;

    setDownloadingId(resumeId);
    setDownloadError("");

    try {
      const response = await api.get(`/resume/download/${resumeId}`, {
        responseType: "blob",
      });

      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${fileName}-feedback.pdf`);
      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      setDownloadError("Failed to download PDF. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  // Filter resumes based on search term
  const filteredResumes = resumes.filter((resume) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      resume.fileName.toLowerCase().includes(searchLower) ||
      resume.jobRole.toLowerCase().includes(searchLower)
    );
  });

  // Sort filtered resumes
  const sortedResumes = [...filteredResumes].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "date":
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
        break;
      case "score":
        const scoreA = a.atsScore !== null ? a.atsScore : -1;
        const scoreB = b.atsScore !== null ? b.atsScore : -1;
        comparison = scoreA - scoreB;
        break;
      case "name":
        comparison = a.fileName.localeCompare(b.fileName);
        break;
      default:
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  /**
   * Render loading skeleton
   */
  const renderLoadingSkeleton = () => (
    <div className="resume-list">
      {[1, 2, 3, 4].map((item) => (
        <div className="resume-history-card skeleton" key={item}>
          <div className="resume-history-info">
            <div className="skeleton-text" role="heading" aria-level="3"></div>
            <p className="skeleton-text"></p>
            <p className="skeleton-text"></p>
          </div>
          <div className="resume-history-score">
            <div className="score-circle skeleton"></div>
            <p className="skeleton-text"></p>
          </div>
          <div className="resume-history-actions">
            <div className="skeleton-button"></div>
            <div className="skeleton-button"></div>
          </div>
        </div>
      ))}
    </div>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <div className="no-data">
      <p>
        No resume uploads found. Get started by uploading your first resume!
      </p>
      <Link to="/upload" className="history-button">
        Upload Resume
      </Link>
    </div>
  );

  /**
   * Render resume list
   */
  const renderResumeList = () => (
    <div className="resume-list">
      {sortedResumes.map((resume) => (
        <div className="resume-history-card" key={resume._id}>
          <div className="resume-history-info">
            <h3>{resume.fileName}</h3>
            <p>Job Role: {resume.jobRole}</p>
            <p>Date: {new Date(resume.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="resume-history-score">
            <div
              className={`score-circle ${
                resume.atsScore !== null && resume.atsScore !== undefined
                  ? resume.atsScore >= 7
                    ? "high-score"
                    : resume.atsScore >= 5
                    ? "medium-score"
                    : "low-score"
                  : ""
              }`}
            >
              <span>
                {resume.atsScore !== null && resume.atsScore !== undefined
                  ? resume.atsScore
                  : "N/A"}
              </span>
            </div>
            <p>ATS Score</p>
          </div>

          <div className="resume-history-actions">
            <Link to={`/resume/${resume._id}`} className="view-details-button">
              View Details
            </Link>
            <button
              onClick={() => handleDownloadPDF(resume._id, resume.fileName)}
              className="download-button"
              disabled={downloadingId === resume._id}
            >
              {downloadingId === resume._id ? (
                <>
                  <div className="button-spinner"></div> Downloading...
                </>
              ) : (
                "Download PDF"
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="history-container">
      <h1>Resume History</h1>

      {/* Error messages */}
      {error && <div className="error-message">{error}</div>}
      {downloadError && <div className="error-message">{downloadError}</div>}

      {/* Search and Sort Controls */}
      <div className="history-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by filename or job role..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <i className="fas fa-search search-icon"></i>
        </div>

        <div className="sort-container">
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="sort-select"
          >
            <option value="date">Date</option>
            <option value="score">ATS Score</option>
            <option value="name">Filename</option>
          </select>

          <button
            className="sort-order-btn"
            onClick={toggleSortOrder}
            aria-label={`Sort ${
              sortOrder === "asc" ? "ascending" : "descending"
            }`}
          >
            <i
              className={`fas fa-sort-${sortOrder === "asc" ? "up" : "down"}`}
            ></i>
          </button>
        </div>
      </div>

      {/* Resume List */}
      {loading
        ? renderLoadingSkeleton()
        : sortedResumes.length > 0
        ? renderResumeList()
        : renderEmptyState()}
    </div>
  );
};

export default ResumeHistory;
