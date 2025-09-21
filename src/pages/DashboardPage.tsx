import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import '../styles/dashboard.css';
import pothole from "../assets/pothole.jpg";
import drain from "../assets/drain.webp";
import streetlight from "../assets/streetlight.jpeg";
import waterleak from "../assets/waterleak.jpg";
import brokentile from "../assets/brokentile.webp";
import IssueViewPage from "./IssueViewPage";

// Define an interface for the Issue data
interface Issue {
  id: number;
  title: string;
  description: string;
  status: string;
  department: string;
  location: { lat: number; lng: number };
  upvotes: number;
  image: string;
  icon?: L.Icon;
}

// Dummy data with images
const issuesData: Issue[] = [
  {
    id: 1,
    title: "Pothole on Main Street",
    description: "Very deep pothole, causing traffic issues.",
    status: "pending",
    department: "Roads",
    location: { lat: 12.9716, lng: 77.5946 },
    upvotes: 5,
    image: pothole,
  },
  {
    id: 2,
    title: "Streetlight not working",
    description: "No streetlight near park area.",
    status: "pending",
    department: "Electricity",
    location: { lat: 12.9726, lng: 77.5956 },
    upvotes: 8,
    image: streetlight,
  },
  {
    id: 3,
    title: "Water pipe leakage",
    description: "Water leaking near town hall.",
    status: "pending",
    department: "Water",
    location: { lat: 12.9730, lng: 77.5850 },
    upvotes: 15,
    image: waterleak,
  },
  {
    id: 4,
    title: "Blocked storm drain",
    description: "Drain is clogged, causing flooding.",
    status: "pending",
    department: "Water",
    location: { lat: 12.9680, lng: 77.6010 },
    upvotes: 7,
    image: drain,
  },
  {
    id: 5,
    title: "Broken sidewalk tile",
    description: "Trip hazard on the sidewalk.",
    status: "pending",
    department: "Roads",
    location: { lat: 12.9700, lng: 77.5980 },
    upvotes: 3,
    image: brokentile,
  }
];

// Fix for Leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png`,
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png`,
  shadowUrl: `https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png`,
});

// Helper function to create colored icons
const createColoredIcon = (department: string): L.Icon => {
  let color = 'blue';
  switch (department) {
    case 'Roads':
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
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: `https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

const MapUpdater: React.FC<{ location: [number, number] | null }> = ({ location }) => {
    const map = useMap();
    useEffect(() => {
        if (location) {
            map.flyTo(location, 16);
        }
    }, [map, location]);
    return null;
};

const DashboardPage: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>(issuesData);
  const [departmentStats, setDepartmentStats] = useState<Record<string, number>>({});
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [mapLocation, setMapLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    const unresolvedIssues = issues.filter(issue => issue.status !== "solved");
    const stats = unresolvedIssues.reduce((acc, issue) => {
      acc[issue.department] = (acc[issue.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    setDepartmentStats(stats);
  }, [issues]);

  const handleStatusUpdate = (id: number, newStatus: string) => {
    const updatedIssues = issues.map((issue) =>
      issue.id === id ? { ...issue, status: newStatus } : issue
    );
    setIssues(updatedIssues);
  };

  const handleIssueClick = (issue: Issue) => {
    const icon = createColoredIcon(issue.department);
    setSelectedIssue({ ...issue, icon });
  };

  const totalIssuesReported = issues.length;
  const pendingIssues = issues.filter((i) => i.status === "pending").length;
  const acknowledgedIssues = issues.filter((i) => i.status === "acknowledged").length;
  const inProgressIssues = issues.filter((i) => i.status === "in-progress").length;
  const solvedIssues = issues.filter((i) => i.status === "solved").length;

  const filteredIssues = activeFilter === "All"
    ? issues.filter(issue => issue.status !== "solved")
    : issues.filter(issue => issue.department === activeFilter && issue.status !== "solved");

  const handleLocationSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const locationName = event.target.value;
    const locations: Record<string, [number, number]> = {
        "bangalore": [12.9716, 77.5946],
        "chennai": [13.0827, 80.2707],
        "mumbai": [19.0760, 72.8777]
    };
    if (locations[locationName.toLowerCase()]) {
      setMapLocation(locations[locationName.toLowerCase()]);
    }
  };

  if (selectedIssue) {
    return <IssueViewPage issue={selectedIssue} onUpdateStatus={handleStatusUpdate} onBack={() => setSelectedIssue(null)} />;
  }

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>Issues Dashboard</h2>
        <div className="stats-container">
          <div className="stat-item">Total Issues Reported: <span>{totalIssuesReported}</span></div>
          <div className="stat-item">Pending: <span>{pendingIssues}</span></div>
          <div className="stat-item">Acknowledged: <span>{acknowledgedIssues}</span></div>
          <div className="stat-item">In Progress: <span>{inProgressIssues}</span></div>
          <div className="stat-item">Solved: <span>{solvedIssues}</span></div>
        </div>
        <div className="department-stats-container">
          <h3>Filter by Department</h3>
          <div
            className={`stat-item filter-btn ${activeFilter === 'All' ? 'active' : ''}`}
            onClick={() => setActiveFilter("All")}
          >
            All: <span>{totalIssuesReported - solvedIssues}</span>
          </div>
          {Object.entries(departmentStats).map(([department, count]) => (
            <div
              key={department}
              className={`stat-item filter-btn ${activeFilter === department ? 'active' : ''}`}
              onClick={() => setActiveFilter(department)}
            >
              {department}: <span>{count}</span>
            </div>
          ))}
        </div>
        <div className="location-filter">
          <h3>Filter by Location</h3>
          <input type="text" placeholder="Search city (e.g., Bangalore)" onChange={handleLocationSearch} />
        </div>
      </div>
      <div className="map-container">
        <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height: "100%", width: "100%" }}>
          <MapUpdater location={mapLocation} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredIssues.map((issue) => (
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
          ))}
        </MapContainer>
      </div>
    </div>
  );
};
export default DashboardPage;