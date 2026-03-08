import React, { useState } from 'react';

interface RadarDataPoint {
  subject: string;
  A: number;
}

interface CustomRadarChartProps {
  data: RadarDataPoint[];
  width?: number;
  height?: number;
}

export const CustomRadarChart: React.FC<CustomRadarChartProps> = ({
  data,
  width = 400,
  height = 400
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.min(width, height) * 0.35;
  const levels = 5;
  const maxValue = 150;

  const getPolygonPoints = (values: number[]) => {
    const angleSlice = (Math.PI * 2) / data.length;
    return values.map((value, i) => {
      const radius = (value / maxValue) * maxRadius;
      const angle = angleSlice * i - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  const getLabelPosition = (index: number) => {
    const angleSlice = (Math.PI * 2) / data.length;
    const angle = angleSlice * index - Math.PI / 2;
    const labelRadius = maxRadius + 30;
    const x = centerX + labelRadius * Math.cos(angle);
    const y = centerY + labelRadius * Math.sin(angle);
    return { x, y };
  };

  const values = data.map(d => d.A);
  const polygonPoints = getPolygonPoints(values);

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      {Array.from({ length: levels }).map((_, i) => {
        const radius = ((i + 1) / levels) * maxRadius;
        return (
          <circle key={`grid-${i}`} cx={centerX} cy={centerY} r={radius} fill="none" stroke="#3f3f46" strokeOpacity={0.3} strokeWidth={1} />
        );
      })}
      {data.map((_, i) => {
        const angleSlice = (Math.PI * 2) / data.length;
        const angle = angleSlice * i - Math.PI / 2;
        const x = centerX + maxRadius * Math.cos(angle);
        const y = centerY + maxRadius * Math.sin(angle);
        return <line key={`axis-${i}`} x1={centerX} y1={centerY} x2={x} y2={y} stroke="#3f3f46" strokeOpacity={0.3} strokeWidth={1} />;
      })}
      <polygon points={polygonPoints} fill="#991b1b" fillOpacity={0.4} stroke="#991b1b" strokeWidth={3} strokeLinejoin="round" />
      {values.map((value, i) => {
        const angleSlice = (Math.PI * 2) / data.length;
        const angle = angleSlice * i - Math.PI / 2;
        const radius = (value / maxValue) * maxRadius;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        return (
          <circle key={`point-${i}`} cx={x} cy={y} r={hoveredPoint === i ? 6 : 4} fill="#991b1b" stroke="#fff" strokeWidth={2}
            onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)}
            style={{ cursor: 'pointer', transition: 'all 0.2s' }} />
        );
      })}
      {data.map((item, i) => {
        const { x, y } = getLabelPosition(i);
        return (
          <text key={`label-${i}`} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="#a1a1aa" fontSize="12" fontWeight="600" className="select-none">
            {item.subject}
          </text>
        );
      })}
      {hoveredPoint !== null && (
        <g>
          <rect x={centerX - 60} y={centerY - maxRadius - 50} width="120" height="40" rx="8" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
          <text x={centerX} y={centerY - maxRadius - 35} textAnchor="middle" fill="#fff" fontSize="12" fontWeight="600">{data[hoveredPoint].subject}</text>
          <text x={centerX} y={centerY - maxRadius - 20} textAnchor="middle" fill="#991b1b" fontSize="14" fontWeight="bold">{data[hoveredPoint].A}</text>
        </g>
      )}
    </svg>
  );
};
