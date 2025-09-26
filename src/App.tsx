import React, { useState } from "react";
import HomePage from "./pages/HomePage";
import MapViewDashboard from "./pages/MapViewDashboard";
import PriorityListingPage from "./pages/PriorityListingPage";
import LeaderboardPage from "./pages/LeaderboardPage"; // Import the new page
import 'leaflet/dist/leaflet.css';
import './index.css';
import './styles/variables.css';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const navigateTo = (page: string) => {
    setCurrentPage(page);
  };

  let content;
  if (currentPage === 'home') {
    content = <HomePage onNavigate={navigateTo} />;
  } else if (currentPage === 'dashboard') {
    content = <MapViewDashboard onNavigate={navigateTo} />;
  } else if (currentPage === 'priority') {
    content = <PriorityListingPage onNavigate={navigateTo} />;
  } else if (currentPage === 'leaderboard') {
    // Add the new page to your routing logic
    content = <LeaderboardPage onNavigate={navigateTo} />;
  }

  return <>{content}</>;
};

export default App;