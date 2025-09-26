import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import '../styles/issue-view.css';

// Define the Issue and prop types for this component
export interface Issue {
  id: number;
  title: string;
  description: string;
  status: string;
  department: string;
  location: { lat: number; lng: number };
  upvotes: number;
  image: string;
  icon?: L.Icon;
  reportedDate: string; // Updated
  resolvedDate?: string; // Updated
}

interface IssueViewPageProps {
  issue: Issue;
  onUpdateStatus: (id: number, newStatus: string) => void;
  onBack: () => void;
}

// Fix for Leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png`,
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png`,
  shadowUrl: `https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png`,
});

const IssueViewPage: React.FC<IssueViewPageProps> = ({ issue, onUpdateStatus, onBack }) => {
  if (!issue) {
    return null;
  }

  const { title, description, department, status, upvotes, image, location, icon, reportedDate } = issue;

  return (
    <div className="issue-view-page">
      <div className="header">
        <button onClick={onBack}>&larr; Back to Dashboard</button>
        <h2>{title}</h2>
      </div>
      <div className="content">
        <div className="details-container">
          <div className="image-wrapper">
            <img src={image} alt={title} className="issue-image" />
          </div>
          <div className="text-details">
            <p><strong>Description:</strong> {description}</p>
            <p><strong>Department:</strong> {department}</p>
            <p><strong>Current Status:</strong> <span className={`status-${status}`}>{status}</span></p>
            <p><strong>Upvotes:</strong> {upvotes}</p>
            <p><strong>Reported Date:</strong> {new Date(reportedDate).toLocaleString()}</p>
            {issue.resolvedDate && <p><strong>Resolved Date:</strong> {new Date(issue.resolvedDate).toLocaleString()}</p>}
          </div>
        </div>
        
        <div className="status-update-buttons">
          <h3>Update Status:</h3>
          <button 
            onClick={() => onUpdateStatus(issue.id, 'Acknowledged')} 
            className={status === 'Acknowledged' ? 'status-active' : ''}
          >
            Acknowledged
          </button>
          <button 
            onClick={() => onUpdateStatus(issue.id, 'Work in Progress')} 
            className={status === 'Work in Progress' ? 'status-active' : ''}
          >
            Work in Progress
          </button>
          <button 
            onClick={() => onUpdateStatus(issue.id, 'Completed')} // Corrected value
            className={status === 'Completed' ? 'status-active' : ''} // Corrected value
          >
            Resolved
          </button>
        </div>
      </div>

      <div className="map-wrapper">
        <MapContainer center={[location.lat, location.lng]} zoom={16} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={[location.lat, location.lng]} icon={icon} />
        </MapContainer>
      </div>
    </div>
  );
};

export default IssueViewPage;