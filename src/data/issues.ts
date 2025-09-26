import L from "leaflet";
import pothole from "../assets/pothole.jpg";
import drain from "../assets/drain.webp";
import streetlight from "../assets/streetlight.jpeg";
import waterleak from "../assets/waterleak.jpg";
import brokentile from "../assets/brokentile.webp";

// Define an interface for the Issue data
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
  reportedDate: string; // New property for the report date
  resolvedDate?: string; // New optional property for the resolution date
}

// Dummy data with images
export const issuesData: Issue[] = [
  {
    id: 1,
    title: "Pothole on Main Street",
    description: "Very deep pothole, causing traffic issues.",
    status: "pending",
    department: "Roads",
    location: { lat: 12.9716, lng: 77.5946 },
    upvotes: 100,
    image: pothole,
    reportedDate: "2025-09-22T08:00:00Z", // Example reported date
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
    reportedDate: "2025-09-21T10:30:00Z", // Example reported date
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
    reportedDate: "2025-09-20T12:00:00Z", // Example reported date
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
    reportedDate: "2025-09-19T14:00:00Z", // Example reported date
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
    reportedDate: "2025-09-18T16:00:00Z", // Example reported date
  },
];

// Helper function to create colored icons
export const createColoredIcon = (department: string): L.Icon => {
  let color = 'blue';
  switch (department) {
    case 'Road':
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