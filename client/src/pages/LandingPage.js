"use client";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/LandingPage.css";

/**
 * Landing Page Component
 * Main marketing page that introduces the AI Resume Analyzer
 * Shows different CTAs based on authentication status
 */
const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Optimize Your Resume with AI</h1>
          <p className="hero-subtitle">
            Get instant feedback, ATS compatibility scores, and suggestions to
            improve your resume
          </p>

          {/* Dynamic CTA buttons based on auth status */}
          {isAuthenticated ? (
            <div className="hero-buttons">
              <Link to="/upload" className="primary-button">
                Upload Resume
              </Link>
              <Link to="/dashboard" className="secondary-button">
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="hero-buttons">
              <Link to="/register" className="primary-button">
                Get Started
              </Link>
              <Link to="/login" className="secondary-button">
                Login
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="features-section">
        <h2>How It Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-upload"></i>
            </div>
            <h3>Upload Your Resume</h3>
            <p>Upload your resume in PDF or DOCX format</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-robot"></i>
            </div>
            <h3>AI Analysis</h3>
            <p>Our AI analyzes your resume against job requirements</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3>Get Your Score</h3>
            <p>Receive an ATS compatibility score and detailed feedback</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-edit"></i>
            </div>
            <h3>Improve Your Resume</h3>
            <p>Apply the suggestions to enhance your resume</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="benefits-content">
          <h2>Why Use AI Resume Analyzer?</h2>
          <ul className="benefits-list">
            <li>
              <i className="fas fa-check-circle"></i>
              <span>Beat the ATS systems used by 90% of employers</span>
            </li>
            <li>
              <i className="fas fa-check-circle"></i>
              <span>Get personalized feedback for your target job role</span>
            </li>
            <li>
              <i className="fas fa-check-circle"></i>
              <span>Identify missing keywords and skills</span>
            </li>
            <li>
              <i className="fas fa-check-circle"></i>
              <span>Improve formatting and readability</span>
            </li>
            <li>
              <i className="fas fa-check-circle"></i>
              <span>Track your resume improvements over time</span>
            </li>
          </ul>

          {!isAuthenticated && (
            <Link to="/register" className="cta-button">
              Create Free Account
            </Link>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <h2>What Our Users Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>
                "The AI feedback helped me identify key missing skills in my
                resume. After making the suggested changes, I got three
                interview calls in a week!"
              </p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              <div className="author-info">
                <h4>Sarah Johnson</h4>
                <p>Software Developer</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>
                "I was struggling to get past ATS systems. This tool gave me
                specific suggestions that improved my resume's ATS score from 4
                to 8.5!"
              </p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              <div className="author-info">
                <h4>Michael Chen</h4>
                <p>Marketing Specialist</p>
              </div>
            </div>
          </div>

          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>
                "As a career coach, I recommend this tool to all my clients. It
                provides actionable feedback that aligns with what recruiters
                are looking for."
              </p>
            </div>
            <div className="testimonial-author">
              <div className="author-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              <div className="author-info">
                <h4>Lisa Rodriguez</h4>
                <p>Career Coach</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="cta-section">
        <h2>Ready to Optimize Your Resume?</h2>
        <p>
          Join thousands of job seekers who have improved their chances of
          landing interviews
        </p>

        {isAuthenticated ? (
          <Link to="/upload" className="cta-button">
            Upload Your Resume Now
          </Link>
        ) : (
          <Link to="/register" className="cta-button">
            Get Started for Free
          </Link>
        )}
      </section>
    </div>
  );
};

export default LandingPage;
