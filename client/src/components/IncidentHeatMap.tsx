import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

interface Report {
  _id: string;
  location: {
    coordinates: [number, number]; // [lng, lat]
  };
}

const HeatmapLayer: React.FC<{ points: [number, number][] }> = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    // @ts-ignore
    if (window.L && points.length) {
      // Remove existing heat layer if any
      if ((map as any)._heatLayer) {
        (map as any).removeLayer((map as any)._heatLayer);
      }
      // @ts-ignore
      const heat = window.L.heatLayer(points, { radius: 25, blur: 15, maxZoom: 17 });
      heat.addTo(map);
      (map as any)._heatLayer = heat;
    }
  }, [map, points]);
  return null;
};

const IncidentHeatMap: React.FC = () => {
  const [points, setPoints] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/reports`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.reports)) {
          // Convert [lng, lat] to [lat, lng] for Leaflet
          const pts = data.reports
            .filter((r: Report) => r.location && Array.isArray(r.location.coordinates))
            .map((r: Report) => [r.location.coordinates[1], r.location.coordinates[0]]);
          setPoints(pts);
        }
      } catch (err) {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="w-full h-[500px] rounded shadow overflow-hidden">
      {loading ? (
        <div className="flex items-center justify-center h-full">Loading heatmap...</div>
      ) : (
        <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <HeatmapLayer points={points} />
        </MapContainer>
      )}
    </div>
  );
};

export default IncidentHeatMap; 