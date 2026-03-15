"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import "../styles/Dashboard.css";

/**
 * Dashboard Component
 * Displays user statistics and recent resume uploads
 */
const Dashboard = () => {
  const [stats, setStats] = useState({
    totalResumes: 0,
    averageScore: 0,
    recentUploads: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch dashboard data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  /**
   * Fetch dashboard statistics and recent uploads
   */
  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/resume/history");
      const history = response.data.history;

      // Calculate statistics from resume history
      const totalResumes = history.length;

      // Calculate average ATS score (excluding null scores)
      const validScores = history
        .filter((item) => item.atsScore !== null && item.atsScore !== undefined)
        .map((item) => item.atsScore);

      const averageScore =
        validScores.length > 0
          ? (
              validScores.reduce((sum, score) => sum + score, 0) /
              validScores.length
            ).toFixed(1)
          : "N/A";

      // Get most recent uploads (limit to 3)
      const recentUploads = history.slice(0, 3);

      setStats({
        totalResumes,
        averageScore,
        recentUploads,
      });
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Render loading skeleton
   */
  const renderLoadingSkeleton = () => (
    <>
      <div className="stat-card skeleton">
        <div className="skeleton-text" role="heading" aria-level="3"></div>
        <p className="stat-value skeleton-text"></p>
      </div>
      <div className="stat-card skeleton">
        <div className="skeleton-text" role="heading" aria-level="3"></div>
        <p className="stat-value skeleton-text"></p>
      </div>
      <div className="stat-card action-card skeleton">
        <div className="skeleton-text" role="heading" aria-level="3"></div>
        <div className="skeleton-button"></div>
      </div>
    </>
  );

  /**
   * Render statistics cards
   */
  const renderStatsCards = () => (
    <>
      <div className="stat-card">
        <h3>Total Resumes</h3>
        <p className="stat-value">{stats.totalResumes}</p>
      </div>

      <div className="stat-card">
        <h3>Average ATS Score</h3>
        <p className="stat-value">{stats.averageScore}</p>
      </div>

      <div className="stat-card action-card">
        <h3>Analyze Resume</h3>
        <Link to="/upload" className="dashboard-button">
          Upload New Resume
        </Link>
      </div>
    </>
  );

  /**
   * Render recent uploads section
   */
  const renderRecentUploads = () => {
    if (loading) {
      return (
        <div className="recent-uploads">
          {[1, 2, 3].map((item) => (
            <div className="resume-card skeleton" key={item}>
              <div className="resume-info">
                <div
                  className="skeleton-text"
                  role="heading"
                  aria-level="3"
                ></div>
                <p className="skeleton-text"></p>
                <p className="skeleton-text"></p>
              </div>
              <div className="resume-score">
                <div className="score-circle skeleton"></div>
                <p className="skeleton-text"></p>
              </div>
              <div className="skeleton-button"></div>
            </div>
          ))}
        </div>
      );
    }

    if (stats.recentUploads.length === 0) {
      return (
        <div className="no-data">
          <p>
            No resume uploads yet. Get started by uploading your first resume!
          </p>
          <Link to="/upload" className="dashboard-button">
            Upload Resume
          </Link>
        </div>
      );
    }

    return (
      <div className="recent-uploads">
        {stats.recentUploads.map((resume) => (
          <div className="resume-card" key={resume._id}>
            <div className="resume-info">
              <h3>{resume.fileName}</h3>
              <p>Job Role: {resume.jobRole}</p>
              <p>Date: {new Date(resume.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="resume-score">
              <div className="score-circle">
                <span>
                  {resume.atsScore !== null && resume.atsScore !== undefined
                    ? resume.atsScore
                    : "N/A"}
                </span>
              </div>
              <p>ATS Score</p>
            </div>
            <Link to={`/resume/${resume._id}`} className="view-details-button">
              View Details
            </Link>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>

      {/* Error message */}
      {error && <div className="error-message">{error}</div>}

      {/* Statistics Cards */}
      <div className="stats-container">
        {loading ? renderLoadingSkeleton() : renderStatsCards()}
      </div>

      {/* Recent Activity Section */}
      <div className="recent-activity">
        <div className="section-header">
          <h2>Recent Activity</h2>
          <Link to="/history" className="view-all-link">
            View All
          </Link>
        </div>

        {renderRecentUploads()}
      </div>
    </div>
  );
};

export default Dashboard;
