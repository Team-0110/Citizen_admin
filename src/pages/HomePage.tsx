import React from 'react';
import '../styles/home.css';
import civicLogo from '../assets/logo.png';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="home-page">
      <header className="home-header-top">
        <div className="logo-container">
          <img src={civicLogo} alt="Civic Portal Logo" className="civic-logo" />
          <h2>CITIZEN</h2>
        </div>
      </header>
      <div className="main-content">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome to the civic issue management portal.</p>
        </div>
        <section className="widgets-container">
          <div className="widget" onClick={() => onNavigate('dashboard')}>
            <div className="widget-icon">
              📍
            </div>
            <h3>Map View Dashboard</h3>
            <p>View all issues on a map with real-time updates.</p>
          </div>
          <div className="widget" onClick={() => onNavigate('priority')}>
            <div className="widget-icon">
              📋
            </div>
            <h3>Priority List</h3>
            <p>List of issues sorted by upvotes and filtered by location.</p>
          </div>
          <div className="widget" onClick={() => onNavigate('leaderboard')}>
            <div className="widget-icon">
              🏆
            </div>
            <h3>Department Leaderboard</h3>
            <p>See department performance on issue resolution.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;