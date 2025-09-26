import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import '../styles/dashboard.css';
import type { Issue } from '../data/issues.ts';
import IssueViewPage from "./IssueViewPage";
import { supabase } from '../supabaseClient';
import { fetchIssues } from '../data/supabase_data';

// Helper function to create colored icons
export const createColoredIcon = (department: string): L.Icon => {
  let color;
  switch (department) {
    case 'Roads': // Typo fixed from 'Road' for consistency
      color = 'red';
      break;
    case 'Electricity':
      color = 'green';
      break;
    case 'Water':
      color = 'blue';
      break;
    default:
      color = 'black';
      break;
  }
  return L.icon({
    iconRetinaUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: `https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

delete (L.Icon.Default.prototype as any)._getIconUrl;

const HeatmapLayerComponent: React.FC<{ points: [number, number, number][] }> = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!(L as any).heatLayer) {
      console.error('Leaflet.heat plugin is not loaded.');
      return;
    }
    const heat = (L as any).heatLayer(points, { radius: 25 }).addTo(map);
    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
};

const MapUpdater: React.FC<{ center: [number, number] | null }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 16);
    }
  }, [map, center]);
  return null;
};

interface MapViewDashboardProps {
  onNavigate: (page: string, params?: any) => void;
}

const MapViewDashboard: React.FC<MapViewDashboardProps> = ({ onNavigate }) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [departmentStats, setDepartmentStats] = useState<Record<string, number>>({});
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  // Initial coordinates set for Thiruporur
  const [mapCenter, setMapCenter] = useState<[number, number]>([12.7562, 80.1983]);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getIssues = async () => {
      setLoading(true);
      const fetchedIssues = await fetchIssues();
      setIssues(fetchedIssues);
      setLoading(false);
    };
    getIssues();
  }, []);

  useEffect(() => {
    const unresolvedIssues = issues.filter(issue => issue.status !== "Completed");
    const stats = unresolvedIssues.reduce((acc, issue) => {
      acc[issue.department] = (acc[issue.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    setDepartmentStats(stats);
  }, [issues]);

  const handleStatusUpdate = async (id: number, newStatus: string) => {
    const now = new Date().toISOString();
    let updateObject: { status: string; acknowledged_at?: string; in_progress_at?: string; completed_at?: string } = {
      status: newStatus
    };

    switch (newStatus) {
      case 'Acknowledged':
        updateObject.acknowledged_at = now;
        break;
      case 'Work in Progress':
        updateObject.in_progress_at = now;
        break;
      case 'Completed':
        updateObject.completed_at = now;
        break;
      default:
        break;
    }

    try {
      // Renamed 'data' to '_data' to suppress ts(6133) error
      const { data: _data, error } = await supabase
        .from('posts')
        .update(updateObject)
        .eq('id', id);

      if (error) {
        console.error('Error updating status:', error);
        return;
      }

      const updatedIssues = issues.map((issue) => {
        if (issue.id === id) {
          const updatedIssue = { ...issue, status: newStatus };
          if (newStatus === 'Completed') {
            updatedIssue.resolvedDate = now;
          }
          return updatedIssue;
        }
        return issue;
      });
      setIssues(updatedIssues);
      
      if (selectedIssue && selectedIssue.id === id) {
        const updatedSelectedIssue = { ...selectedIssue, status: newStatus };
        if (newStatus === 'Completed') {
          updatedSelectedIssue.resolvedDate = now;
        }
        setSelectedIssue(updatedSelectedIssue);
      }
    } catch (e) {
      console.error('An unexpected error occurred:', e);
    }
  };

  const handleIssueClick = (issue: Issue) => {
    setMapCenter([issue.location.lat, issue.location.lng]);
    const icon = createColoredIcon(issue.department);
    setSelectedIssue({ ...issue, icon });
  };

  const totalIssuesReported = issues.length;
  const pendingIssues = issues.filter((i) => i.status === "Submitted").length;
  const acknowledgedIssues = issues.filter((i) => i.status === "Acknowledged").length;
  const inProgressIssues = issues.filter((i) => i.status === "Work in Progress").length;
  const solvedIssues = issues.filter((i) => i.status === "Completed").length;

  const filteredIssues = activeFilter === "All"
    ? issues.filter(issue => issue.status !== "Completed")
    : issues.filter(issue => issue.department === activeFilter && issue.status !== "Completed");

  const fetchCityCoordinates = async (cityName: string) => {
    const apiKey = 'pk.df85a0b6ad67fab1e8535cd30fc409fc';
    
    try {
      const response = await fetch(`https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${cityName}&format=json`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setMapCenter([parseFloat(lat), parseFloat(lon)]);
      } else {
        console.error("No location found for:", cityName);
        setMapCenter([12.7562, 80.1983]);
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      setMapCenter([12.7562, 80.1983]);
    }
  };
  
  const handleLocationSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const locationName = event.target.value.trim();
    if (locationName) {
      fetchCityCoordinates(locationName);
    }
  };
  
  const heatmapData = filteredIssues
    .filter(issue => issue.location?.lat !== null && issue.location?.lng !== null)
    .map(issue => [
        issue.location.lat,
        issue.location.lng,
        issue.upvotes + 1,
    ]);

  if (selectedIssue) {
    return (
      <IssueViewPage
        issue={selectedIssue}
        onUpdateStatus={handleStatusUpdate}
        onBack={() => setSelectedIssue(null)}
      />
    );
  }
  
  if (loading) {
    return <div>Loading issues...</div>;
  }

  return (
    <div className="dashboard">
      <div className="sidebar">
        <button onClick={() => onNavigate('home')}>&larr; Back to Home</button>
        <h2>Issues Dashboard</h2>
        <button 
          className="toggle-button" 
          onClick={() => setShowHeatmap(!showHeatmap)}
        >
          {showHeatmap ? 'Show Markers' : 'Show Heatmap'}
        </button>
        <div className="stats-container">
          <div className="stat-item">Total Issues Reported: <span>{totalIssuesReported}</span></div>
          <div className="stat-item">Pending: <span>{pendingIssues}</span></div>
          <div className="stat-item">Acknowledged: <span>{acknowledgedIssues}</span></div>
          <div className="stat-item">In Progress: <span>{inProgressIssues}</span></div>
          <div className="stat-item">Solved: <span>{solvedIssues}</span></div>
        </div>
        <div className="department-stats-container">
          <h3>Filter by Department</h3>
          {/* Changed div to button for accessibility and linting compliance */}
          <button
            className={`stat-item filter-btn ${activeFilter === 'All' ? 'active' : ''}`}
            onClick={() => setActiveFilter("All")}
          >
            All: <span>{totalIssuesReported - solvedIssues}</span>
          </button>
          {Object.entries(departmentStats).map(([department, count]) => (
            // Changed div to button for accessibility and linting compliance
            <button
              key={department}
              className={`stat-item filter-btn ${activeFilter === department ? 'active' : ''}`}
              onClick={() => setActiveFilter(department)}
            >
              {department}: <span>{count}</span>
            </button>
          ))}
        </div>
        <div className="location-filter">
          <h3>Filter by Location</h3>
          <input type="text" placeholder="Search city (e.g., Bangalore)" onChange={handleLocationSearch} />
        </div>
      </div>
      <div className="map-container">
        <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
          <MapUpdater center={mapCenter} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {showHeatmap ? (
            <HeatmapLayerComponent points={heatmapData as [number, number, number][]} />
          ) : (
            filteredIssues.map((issue) => (
              <Marker
                key={issue.id}
                position={[issue.location.lat, issue.location.lng]}
                icon={createColoredIcon(issue.department)}
                eventHandlers={{ click: () => handleIssueClick(issue) }}
              >
                <Popup>
                  <div className="custom-popup">
                    <img src={issue.image} alt={issue.title} className="issue-image" />
                    <h4>{issue.title}</h4>
                    <p><strong>Department:</strong> {issue.department}</p>
                    <p><strong>Status:</strong> {issue.status}</p>
                  </div>
                </Popup>
              </Marker>
            ))
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapViewDashboard;