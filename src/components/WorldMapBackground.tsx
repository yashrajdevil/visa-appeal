import React, { memo, useEffect, useState, useMemo } from 'react';
import { geoMercator, geoPath } from 'd3-geo';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const connectionLines = [
  { start: [-74.006, 40.7128], end: [-0.1276, 51.5072] }, // NY to London
  { start: [-0.1276, 51.5072], end: [55.2708, 25.2048] }, // London to Dubai
  { start: [55.2708, 25.2048], end: [103.8198, 1.3521] }, // Dubai to Singapore
  { start: [103.8198, 1.3521], end: [151.2093, -33.8688] }, // Singapore to Sydney
  { start: [-122.4194, 37.7749], end: [-74.006, 40.7128] }, // SF to NY
  { start: [-122.4194, 37.7749], end: [139.6917, 35.6895] }, // SF to Tokyo
  { start: [139.6917, 35.6895], end: [103.8198, 1.3521] }, // Tokyo to Singapore
];

const nodes = [
  [-74.006, 40.7128], // NY
  [-0.1276, 51.5072], // London
  [55.2708, 25.2048], // Dubai
  [103.8198, 1.3521], // Singapore
  [151.2093, -33.8688], // Sydney
  [-122.4194, 37.7749], // SF
  [139.6917, 35.6895], // Tokyo
  [2.3522, 48.8566], // Paris
  [13.4050, 52.5200], // Berlin
  [77.2090, 28.6139], // New Delhi
  [-46.6333, -23.5505], // Sao Paulo
];

const WorldMapBackground = () => {
  const [geographies, setGeographies] = useState<any[]>([]);

  useEffect(() => {
    fetch(geoUrl)
      .then(res => res.json())
      .then(data => {
        // Simple TopoJSON to GeoJSON conversion workaround
        // Since we removed topojson-client, we just treat basic objects or use a direct geojson if possible.
        // Actually world-atlas countries-110m is Topojson. We will try fetching a GeoJSON directly to keep it simple.
      });
  }, []);

  useEffect(() => {
    // Instead of using TopoJSON, let's fetch a ready-to-use GeoJSON
    fetch("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
      .then(res => res.json())
      .then(data => {
        if (data && data.features) {
          setGeographies(data.features);
        }
      });
  }, []);

  const width = 800;
  const height = 450;

  const projection = useMemo(() => {
    return geoMercator()
      .scale(120)
      .center([0, 30])
      .translate([width / 2, height / 2]);
  }, [width, height]);

  const pathGenerator = useMemo(() => geoPath().projection(projection), [projection]);

  return (
    <div 
        className="absolute inset-x-0 inset-y-0 flex flex-col items-center justify-center opacity-[0.2] mix-blend-screen pointer-events-none overflow-hidden"
        style={{
            maskImage: 'radial-gradient(ellipse at center, transparent 35%, black 85%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 35%, black 85%)'
        }}
    >
      <div className="w-[120%] md:w-[100%] lg:w-[90%] max-w-7xl pt-10 flex items-center justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          <defs>
            <pattern id="dots" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="currentColor" className="text-indigo-200 opacity-80" />
            </pattern>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <g className="outline-none pointer-events-none">
            {geographies.map((d, i) => (
              <path
                key={`path-${i}`}
                d={pathGenerator(d) || undefined}
                fill="url(#dots)"
                stroke="transparent"
                strokeWidth={0}
              />
            ))}
          </g>

          {/* Network Lines */}
          <g>
            {connectionLines.map((line, i) => {
              const startPos = projection(line.start as [number, number]);
              const endPos = projection(line.end as [number, number]);
              if (!startPos || !endPos) return null;
              
              return (
                <line
                  key={`line-${i}`}
                  x1={startPos[0]}
                  y1={startPos[1]}
                  x2={endPos[0]}
                  y2={endPos[1]}
                  stroke="#818cf8"
                  strokeWidth={0.5}
                  strokeLinecap="round"
                  className="opacity-40"
                />
              );
            })}
          </g>

          {/* Tiny Nodes */}
          <g>
            {nodes.map((coord, i) => {
              const pos = projection(coord as [number, number]);
              if (!pos) return null;
              return (
                <g key={`marker-${i}`} transform={`translate(${pos[0]}, ${pos[1]})`}>
                  <circle r={1.5} fill="#a5b4fc" className="opacity-80" style={{ filter: "url(#glow)" }} />
                  <circle r={3} fill="#818cf8" className="opacity-20" />
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};

export default memo(WorldMapBackground);
