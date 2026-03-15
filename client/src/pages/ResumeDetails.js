"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../utils/api";
import "../styles/ResumeDetails.css";

/**
 * Resume Details Component
 * Displays detailed analysis of a specific resume with tabbed interface
 */
const ResumeDetails = () => {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  /**
   * Fetch resume details from API
   */
  const fetchResumeDetails = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/resume/history");
      const allResumes = response.data.history;
      const selectedResume = allResumes.find((r) => r._id === id);

      if (!selectedResume) {
        setError("Resume not found");
        setResume(null);
      } else {
        setResume(selectedResume);
      }
    } catch (err) {
      setError("Failed to load resume details. Please try again later.");
      setResume(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Fetch resume details on component mount
  useEffect(() => {
    if (id) {
      fetchResumeDetails();
    } else {
      setError("No resume ID provided.");
      setLoading(false);
    }
  }, [id, fetchResumeDetails]);

  /**
   * Handle PDF download
   */
  const handleDownloadPDF = async () => {
    if (!resume || downloadLoading) return;

    setDownloadLoading(true);
    setDownloadError("");

    try {
      const response = await api.get(`/resume/download/${id}`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const safeFileName = resume.fileName
        ? resume.fileName.replace(/[^a-z0-9_.-]/gi, "_")
        : "resume";
      link.setAttribute("download", `${safeFileName}-feedback.pdf`);

      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      setDownloadError(
        err.response?.data?.error || "Failed to download PDF. Please try again."
      );
    } finally {
      setDownloadLoading(false);
    }
  };

  /**
   * Extract list items from text using various formats
   * @param {string} text - Text to parse
   * @returns {Array} Array of extracted items
   */
  const extractListItems = (text) => {
    const trimmedText = text.trim();
    if (!trimmedText) return [];

    // Try numbered list format (1. item)
    if (/\d+\.\s+/.test(trimmedText)) {
      const items = trimmedText
        .split(/\d+\.\s+/)
        .filter((item) => item.trim() !== "");
      if (items.length > 0) {
        return items.map((item) => item.trim().replace(/\n$/, ""));
      }
    }

    // Try bullet point format (• - * item)
    if (/[•\-*]\s+/.test(trimmedText)) {
      const items = trimmedText
        .split(/[•\-*]\s+/)
        .filter((item) => item.trim() !== "");
      if (items.length > 0) {
        return items.map((item) => item.trim().replace(/\n$/, ""));
      }
    }

    // Try line-separated format
    const lineItems = trimmedText
      .split(/\n+/)
      .filter((line) => line.trim().length > 5);
    if (lineItems.length > 0) {
      return lineItems.map((item) => item.trim());
    }

    // Single item if text is short enough
    if (trimmedText.length < 150 && trimmedText.length > 5) {
      return [trimmedText];
    }

    return [];
  };

  /**
   * Parse AI feedback text into structured sections
   * @param {string} feedbackText - Raw AI feedback text
   * @returns {Object} Parsed feedback sections
   */
  const parseFeedback = (feedbackText) => {
    if (!feedbackText || typeof feedbackText !== "string") {
      return {
        overview: "Feedback not available or in an unexpected format.",
        suggestions: [],
        missingKeywords: [],
        formattingIssues: [],
      };
    }

    let suggestions = [];
    let missingKeywords = [];
    let formattingIssues = [];
    let overview = "";

    // Define section terminators for regex
    const terminators = `(?=Suggestions for improvement:|Missing keywords:|Formatting or grammar issues:|Formatting and Grammar Issues:|Formatting & Grammar Issues:|Formatting Issues:|Grammar Issues:|ATS Compatibility Score:|ATS Compatibility Rating:|$)`;

    // Extract suggestions section
    const suggestionRegex = new RegExp(
      `Suggestions for improvement:?([\\s\\S]*?)${terminators}`,
      "i"
    );
    const suggestionMatch = feedbackText.match(suggestionRegex);
    if (suggestionMatch && suggestionMatch[1]) {
      suggestions = extractListItems(suggestionMatch[1].trim());
    }

    // Extract missing keywords section
    const keywordsRegex = new RegExp(
      `Missing keywords:?([\\s\\S]*?)${terminators}`,
      "i"
    );
    const keywordsMatch = feedbackText.match(keywordsRegex);
    if (keywordsMatch && keywordsMatch[1]) {
      missingKeywords = extractListItems(keywordsMatch[1].trim());
    }

    // Extract formatting issues section
    const primaryFormattingRegex = new RegExp(
      `Formatting or grammar issues:([\\s\\S]*?)${terminators}`,
      "i"
    );
    const primaryFormattingMatch = feedbackText.match(primaryFormattingRegex);

    if (primaryFormattingMatch && primaryFormattingMatch[1]) {
      formattingIssues = extractListItems(primaryFormattingMatch[1].trim());
    } else {
      // Try alternative formatting section headers
      const altFormattingRegex = new RegExp(
        `(?:Formatting and Grammar Issues|Formatting & Grammar Issues|Formatting Issues|Grammar Issues):([\\s\\S]*?)${terminators}`,
        "i"
      );
      const altFormattingMatch = feedbackText.match(altFormattingRegex);
      if (altFormattingMatch && altFormattingMatch[1]) {
        formattingIssues = extractListItems(altFormattingMatch[1].trim());
      }
    }

    // Generate overview text
    if (suggestions.length > 0) {
      overview =
        suggestions.slice(0, 2).join(". ") +
        (suggestions.length > 2 ? "..." : suggestions.length > 0 ? "." : "");
      if (overview.length < 20 && suggestions.length > 0) {
        overview = suggestions[0];
      }
    } else if (missingKeywords.length > 0 || formattingIssues.length > 0) {
      overview =
        "Key areas for improvement identified. Please review other tabs for details.";
    } else {
      overview = "AI analysis complete. Review tabs for detailed insights.";
    }

    return {
      overview,
      suggestions,
      missingKeywords,
      formattingIssues,
    };
  };

  /**
   * Get ATS score styling class
   * @param {number} score - ATS score
   * @returns {string} CSS class name
   */
  const getScoreClass = (score) => {
    if (score === null || score === undefined) return "no-score";
    if (score >= 7) return "high-score";
    if (score >= 5) return "medium-score";
    return "low-score";
  };

  /**
   * Get ATS score description
   * @param {number} score - ATS score
   * @returns {string} Score description
   */
  const getScoreDescription = (score) => {
    if (score === null || score === undefined) {
      return "ATS score not available. Feedback below may still be helpful.";
    }
    if (score >= 7) {
      return "Your resume appears well-optimized for ATS systems.";
    }
    if (score >= 5) {
      return "Your resume has moderate ATS compatibility. Consider the suggestions.";
    }
    return "Your resume may need significant improvements for optimal ATS compatibility.";
  };

  // Show loading state
  if (loading) {
    return (
      <div className="details-container">
        <div className="details-header">
          <Link to="/history" className="back-button">
            <i className="fas fa-arrow-left"></i> Back to History
          </Link>
          <div className="details-actions">
            <button className="download-button skeleton" disabled>
              <i className="fas fa-download"></i> Download PDF
            </button>
          </div>
        </div>

        <div className="resume-details-card skeleton">
          <div className="resume-details-header">
            <div className="resume-details-info">
              <div
                className="skeleton-text"
                role="heading"
                aria-level="1"
              ></div>
              <p className="job-role skeleton-text"></p>
              <p className="upload-date skeleton-text"></p>
            </div>
            <div className="resume-details-score">
              <div className="score-circle large skeleton"></div>
              <p className="skeleton-text"></p>
            </div>
          </div>

          <div className="feedback-container">
            <div className="skeleton-text" role="heading" aria-level="2"></div>
            <div className="feedback-tabs skeleton-tabs">
              {[1, 2, 3, 4].map((item) => (
                <div className="tab-button skeleton" key={item}></div>
              ))}
            </div>
            <div className="feedback-content">
              <div className="feedback-overview">
                {[1, 2, 3].map((item) => (
                  <div className="feedback-summary-card skeleton" key={item}>
                    <div
                      className="skeleton-text"
                      role="heading"
                      aria-level="3"
                    ></div>
                    <div className="skeleton-text"></div>
                    <div className="skeleton-text"></div>
                    <div className="skeleton-text"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !resume) {
    return (
      <div className="details-container">
        <div className="error-message">
          {error || "Resume not found or an error occurred."}
        </div>
        <Link to="/history" className="back-button">
          <i className="fas fa-arrow-left"></i> Back to History
        </Link>
      </div>
    );
  }

  // Parse feedback and get ATS score
  const { overview, suggestions, missingKeywords, formattingIssues } =
    parseFeedback(resume.aiFeedback || "");
  const atsScore =
    resume.atsScore !== null && resume.atsScore !== undefined
      ? resume.atsScore
      : null;

  return (
    <div className="details-container">
      {/* Header with navigation and actions */}
      <div className="details-header">
        <Link to="/history" className="back-button">
          <i className="fas fa-arrow-left"></i> Back to History
        </Link>

        <div className="details-actions">
          <button
            onClick={handleDownloadPDF}
            className="download-button"
            disabled={downloadLoading}
          >
            {downloadLoading ? (
              <>
                <div className="button-spinner"></div>
                Downloading...
              </>
            ) : (
              <>
                <i className="fas fa-download"></i> Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Download error message */}
      {downloadError && (
        <div className="error-message" style={{ marginTop: "1rem" }}>
          {downloadError}
        </div>
      )}

      {/* Main content card */}
      <div className="resume-details-card">
        {/* Resume header with basic info and score */}
        <div className="resume-details-header">
          <div className="resume-details-info">
            <h1>{resume.fileName || "Resume"}</h1>
            <p className="job-role">Job Role: {resume.jobRole || "N/A"}</p>
            <p className="upload-date">
              Uploaded on: {new Date(resume.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="resume-details-score">
            <div className={`score-circle large ${getScoreClass(atsScore)}`}>
              <span>{atsScore !== null ? atsScore : "N/A"}</span>
            </div>
            <p>ATS Score</p>
          </div>
        </div>

        {/* Feedback section with tabs */}
        <div className="feedback-container">
          <h2>AI Feedback</h2>

          {/* Tab navigation */}
          <div className="feedback-tabs">
            <button
              className={`tab-button ${
                activeTab === "overview" ? "active" : ""
              }`}
              onClick={() => setActiveTab("overview")}
            >
              <i className="fas fa-clipboard-check"></i> Overview
            </button>
            <button
              className={`tab-button ${
                activeTab === "suggestions" ? "active" : ""
              }`}
              onClick={() => setActiveTab("suggestions")}
            >
              <i className="fas fa-lightbulb"></i> Suggestions
            </button>
            <button
              className={`tab-button ${
                activeTab === "keywords" ? "active" : ""
              }`}
              onClick={() => setActiveTab("keywords")}
            >
              <i className="fas fa-key"></i> Keywords
            </button>
            <button
              className={`tab-button ${
                activeTab === "formatting" ? "active" : ""
              }`}
              onClick={() => setActiveTab("formatting")}
            >
              <i className="fas fa-align-left"></i> Formatting
            </button>
          </div>

          {/* Tab content */}
          <div className="feedback-content">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="feedback-overview">
                <div className="feedback-summary-card">
                  <h3>
                    <i className="fas fa-chart-line"></i> ATS Compatibility
                  </h3>
                  <div className="ats-meter-container">
                    <div className="ats-meter">
                      <div
                        className={`ats-meter-fill ${getScoreClass(atsScore)}`}
                        style={{
                          width: `${
                            atsScore !== null ? (atsScore / 10) * 100 : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div className="ats-meter-labels">
                      <span>0</span>
                      <span>5</span>
                      <span>10</span>
                    </div>
                  </div>
                  <p className="ats-description">
                    {getScoreDescription(atsScore)}
                  </p>
                </div>

                <div className="feedback-summary-card">
                  <h3>
                    <i className="fas fa-star"></i> Key Insights
                  </h3>
                  <p>{overview}</p>
                </div>

                <div className="feedback-summary-card">
                  <h3>
                    <i className="fas fa-exclamation-triangle"></i> Areas to
                    Improve
                  </h3>
                  <ul className="improvements-list">
                    {missingKeywords.length > 0 && (
                      <li>
                        <strong>Missing Keywords:</strong>{" "}
                        {missingKeywords.length} key terms identified.
                      </li>
                    )}
                    {formattingIssues.length > 0 && (
                      <li>
                        <strong>Formatting/Grammar:</strong>{" "}
                        {formattingIssues.length} issues noted.
                      </li>
                    )}
                    {suggestions.length > 0 && (
                      <li>
                        <strong>Content Suggestions:</strong>{" "}
                        {suggestions.length} general suggestions provided.
                      </li>
                    )}
                    {missingKeywords.length === 0 &&
                      formattingIssues.length === 0 &&
                      suggestions.length === 0 && (
                        <li>
                          No specific areas for improvement clearly parsed from
                          feedback. Check other tabs.
                        </li>
                      )}
                  </ul>
                </div>
              </div>
            )}

            {/* Suggestions Tab */}
            {activeTab === "suggestions" && (
              <div className="feedback-suggestions">
                <h3>Suggestions for Improvement</h3>
                {suggestions.length > 0 ? (
                  <ul className="suggestions-list">
                    {suggestions.map((suggestion, index) => (
                      <li key={`suggestion-${index}`}>
                        <div className="suggestion-item">
                          <i className="fas fa-lightbulb suggestion-icon"></i>
                          <span>{suggestion}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-data-message">
                    No specific suggestions for improvement identified from the
                    AI feedback.
                  </p>
                )}
              </div>
            )}

            {/* Keywords Tab */}
            {activeTab === "keywords" && (
              <div className="feedback-keywords">
                <h3>Missing Keywords</h3>
                {missingKeywords.length > 0 ? (
                  <div className="keywords-container">
                    {missingKeywords.map((keyword, index) => (
                      <div className="keyword-tag" key={`keyword-${index}`}>
                        <i className="fas fa-key"></i> {keyword}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data-message">
                    No specific missing keywords identified in the AI feedback.
                  </p>
                )}
                <div className="keywords-tip">
                  <i className="fas fa-info-circle"></i>
                  <p>
                    Including industry-specific keywords helps your resume pass
                    through Applicant Tracking Systems (ATS).
                  </p>
                </div>
              </div>
            )}

            {/* Formatting Tab */}
            {activeTab === "formatting" && (
              <div className="feedback-formatting">
                <h3>Formatting & Grammar Issues</h3>
                {formattingIssues.length > 0 ? (
                  <ul className="formatting-list">
                    {formattingIssues.map((issue, index) => (
                      <li key={`formatting-${index}`}>
                        <div className="formatting-item">
                          <i className="fas fa-exclamation-circle formatting-icon"></i>
                          <span>{issue}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-data-message">
                    No specific formatting or grammar issues identified in the
                    AI feedback.
                  </p>
                )}
                <div className="formatting-tip">
                  <i className="fas fa-info-circle"></i>
                  <p>
                    Clean, consistent formatting makes your resume more readable
                    for both humans and ATS systems.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeDetails;
