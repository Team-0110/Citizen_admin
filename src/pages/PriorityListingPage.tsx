import React, { useState, useEffect } from 'react';
import { fetchIssues } from '../data/supabase_data';
import type { Issue } from '../data/issues.ts';
import '../styles/priority-listing.css';

interface PriorityListingPageProps {
  onNavigate: (page: string) => void;
}

// Function to calculate the distance between two geographical points (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres
  return d / 1000; // in kilometers
};

const PriorityListingPage: React.FC<PriorityListingPageProps> = ({ onNavigate }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('');
  const [loading, setLoading] = useState(true);
  // New state to store coordinates for geographical filtering
  const [filterCoords, setFilterCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const getIssues = async () => {
      setLoading(true);
      const fetchedIssues = await fetchIssues();
      setIssues(fetchedIssues);
      setLoading(false);
    };
    getIssues();
  }, []);

  // Effect to handle the geographical search using LocationIQ API
  useEffect(() => {
    const fetchLocation = async () => {
      if (!locationFilter) {
        setFilterCoords(null);
        return;
      }
      const apiKey = 'pk.df85a0b6ad67fab1e8535cd30fc409fc'; // Replace with your actual API key
      try {
        const response = await fetch(`https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${locationFilter}&format=json`);
        const data = await response.json();
        
        if (data && data.length > 0) {
          setFilterCoords({
            lat: parseFloat(data[0].lat),
            lng: parseFloat(data[0].lon)
          });
        } else {
          setFilterCoords(null);
        }
      } catch (error) {
        console.error("Error fetching location for filter:", error);
        setFilterCoords(null);
      }
    };

    const debounceFetch = setTimeout(() => {
      fetchLocation();
    }, 500); // Debounce the API call to avoid hitting rate limits

    return () => clearTimeout(debounceFetch);
  }, [locationFilter]);

  // Main effect to handle sorting and all filtering
  useEffect(() => {
    let sortedIssues = [...issues].sort((a, b) => b.upvotes - a.upvotes);

    if (departmentFilter !== 'All') {
      sortedIssues = sortedIssues.filter(issue => issue.department === departmentFilter);
    }

    if (filterCoords) {
      // Filter issues by proximity to the filter coordinates
      const maxDistanceKm = 10; // You can adjust this value (e.g., 10 km)
      sortedIssues = sortedIssues.filter(issue => {
        if (issue.location && issue.location.lat !== null && issue.location.lng !== null) {
          const distance = calculateDistance(
            filterCoords.lat,
            filterCoords.lng,
            issue.location.lat,
            issue.location.lng
          );
          return distance <= maxDistanceKm;
        }
        return false;
      });
    }
    
    setFilteredIssues(sortedIssues);
  }, [issues, departmentFilter, filterCoords]);

  const departments = Array.from(new Set(issues.map(issue => issue.department)));

  if (loading) {
    return (
      <div className="priority-listing-page">
        <div className="header">
          <button onClick={() => onNavigate('home')}>&larr; Back</button>
          <h1>Priority Issues</h1>
        </div>
        <p>Loading issues...</p>
      </div>
    );
  }

  return (
    <div className="priority-listing-page">
      <div className="header">
        <button onClick={() => onNavigate('home')}>&larr; Back</button>
        <h1>Priority Issues</h1>
      </div>
      <div className="filters">
        <label>Filter by Department:</label>
        <select onChange={(e) => setDepartmentFilter(e.target.value)} value={departmentFilter}>
          <option value="All">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        
        <label>Filter by Location:</label>
        <input 
          type="text" 
          placeholder="e.g., Bangalore" 
          onChange={(e) => setLocationFilter(e.target.value)} 
          value={locationFilter} 
        />
      </div>
      <ul className="issues-list">
        {filteredIssues.map(issue => (
          <li key={issue.id} className="issue-item">
            <div className="issue-details">
              <h3>{issue.title}</h3>
              <p><strong>Department:</strong> {issue.department}</p>
              <p><strong>Upvotes:</strong> {issue.upvotes}</p>
              <p>{issue.description}</p>
            </div>
            {issue.image && <img src={issue.image} alt={issue.title} className="issue-card-image" />}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PriorityListingPage;