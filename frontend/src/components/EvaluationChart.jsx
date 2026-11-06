import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const PIE_COLORS = ['#4f46e5', '#3f3f46', '#6366f1', '#71717a', '#818cf8', '#a1a1aa'];

export const EvaluationChart = ({ scores, rubricCriteria = [] }) => {
  const [viewMode, setViewMode] = useState('bar'); // 'bar' | 'pie'

  if (!scores || scores.length === 0) return null;

  // Merge scores with rubric max points for comparison
  const chartData = scores.map((scoreItem) => {
    const criterionDef = rubricCriteria.find(
      (c) => c.name.toLowerCase() === scoreItem.criterionName.toLowerCase()
    );
    const max = criterionDef ? criterionDef.maxPoints : scoreItem.pointsAwarded;
    return {
      name: scoreItem.criterionName,
      awarded: scoreItem.pointsAwarded,
      max: max,
      missed: Math.max(0, max - scoreItem.pointsAwarded),
    };
  });

  const pieData = scores.map((item) => ({
    name: item.criterionName,
    value: item.pointsAwarded,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-zinc-200 rounded-md p-2.5 shadow-sm text-xs">
          <p className="font-semibold text-zinc-900 mb-1">{label || payload[0]?.name}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center gap-2 text-zinc-600 my-0.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span>{entry.name}:</span>
              <span className="font-semibold text-zinc-900">{entry.value} pts</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Toggle View Header */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">Performance Analytics</h3>
          <p className="text-xs text-zinc-500">Visual comparison across all rubric criteria</p>
        </div>
        <div className="flex items-center bg-zinc-100 p-0.5 rounded-md border border-zinc-200 text-xs font-medium">
          <button
            type="button"
            onClick={() => setViewMode('bar')}
            className={`px-2.5 py-1 rounded transition-colors ${
              viewMode === 'bar'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Comparative Bar
          </button>
          <button
            type="button"
            onClick={() => setViewMode('pie')}
            className={`px-2.5 py-1 rounded transition-colors ${
              viewMode === 'pie'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Point Distribution
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'bar' ? (
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              barGap={4}
            >
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#71717a' }}
                interval={0}
                tickFormatter={(val) => (val.length > 14 ? `${val.substring(0, 12)}…` : val)}
              />
              <YAxis tick={{ fontSize: 11, fill: '#71717a' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                name="Points Awarded"
                dataKey="awarded"
                fill="#4f46e5"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
              <Bar
                name="Max Points"
                dataKey="max"
                fill="#e4e4e7"
                radius={[4, 4, 0, 0]}
                maxBarSize={36}
              />
            </BarChart>
          ) : (
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={3}
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                  />
                ))}
              </Pie>
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EvaluationChart;

