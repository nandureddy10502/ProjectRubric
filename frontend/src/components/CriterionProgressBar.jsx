import React, { useState } from 'react';

// Subtle, sophisticated monochromatic and muted accent palette
const SEGMENT_COLORS = [
  'bg-indigo-600',
  'bg-zinc-700',
  'bg-indigo-400',
  'bg-zinc-500',
  'bg-indigo-300',
  'bg-zinc-400',
];

export const CriterionProgressBar = ({ scores, totalScore, totalMaxPoints = 100 }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!scores || scores.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Visual Header */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-zinc-600">Contribution Breakdown (Proportional flex width)</span>
        <span className="font-semibold text-zinc-900">
          {totalScore} / {totalMaxPoints} pts ({Math.round((totalScore / (totalMaxPoints || 100)) * 100)}%)
        </span>
      </div>

      {/* Stacked Horizontal Bar */}
      <div className="h-4 w-full flex rounded-md overflow-hidden bg-zinc-100 p-0.5 border border-zinc-200">
        {scores.map((item, idx) => {
          const percentageOfTotal = totalMaxPoints > 0 
            ? (item.pointsAwarded / totalMaxPoints) * 100 
            : 0;

          if (percentageOfTotal <= 0) return null;

          const colorClass = SEGMENT_COLORS[idx % SEGMENT_COLORS.length];
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={item.criterionName || idx}
              style={{ width: `${percentageOfTotal}%` }}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`h-full transition-all duration-150 cursor-pointer ${colorClass} ${
                isHovered ? 'brightness-110 scale-y-105 shadow-sm' : 'opacity-95'
              } first:rounded-l-[3px] last:rounded-r-[3px]`}
              title={`${item.criterionName}: ${item.pointsAwarded} pts (${percentageOfTotal.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Criterion Legend Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
        {scores.map((item, idx) => {
          const colorClass = SEGMENT_COLORS[idx % SEGMENT_COLORS.length];
          const isHovered = hoveredIdx === idx;
          const percentage = totalMaxPoints > 0
            ? ((item.pointsAwarded / totalMaxPoints) * 100).toFixed(1)
            : '0';

          return (
            <div
              key={item.criterionName || idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-start gap-2.5 p-2 rounded-md border text-xs transition-colors duration-150 ${
                isHovered
                  ? 'bg-zinc-100/70 border-zinc-300'
                  : 'bg-white border-zinc-200/80 hover:border-zinc-300'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-sm mt-0.5 shrink-0 ${colorClass}`} />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-zinc-900 truncate">
                  {item.criterionName}
                </div>
                <div className="text-zinc-500 flex items-center justify-between mt-0.5">
                  <span>{item.pointsAwarded} pts</span>
                  <span className="font-mono text-[11px] text-zinc-400">{percentage}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CriterionProgressBar;

