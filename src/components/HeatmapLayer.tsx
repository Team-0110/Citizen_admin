// src/components/HeatmapLayer.tsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import type { HeatLatLngTuple } from 'leaflet';
import 'leaflet.heat';

interface HeatmapLayerProps {
  points: HeatLatLngTuple[];
}

const HeatmapLayer: React.FC<HeatmapLayerProps> = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    // Cast the points array to the correct type to satisfy TypeScript
    const heat = (L.heatLayer as any)(points, { radius: 25 }).addTo(map);

    // Clean up the layer when the component unmounts
    return () => {
      map.removeLayer(heat);
    };
  }, [map, points]);

  return null;
};

export default HeatmapLayer;