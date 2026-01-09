import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function PerformanceMetrics({ evaluations }) {
  if (!evaluations || evaluations.length === 0) return null;

  const chartData = evaluations.slice(0, 5).reverse().map(eval_ => ({
    date: new Date(eval_.evaluation_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    precision: Math.round((eval_.precision || 0) * 100),
    recall: Math.round((eval_.recall || 0) * 100),
    f1: Math.round((eval_.f1_score || 0) * 100)
  }));

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-lg font-semibold text-slate-900">
          Model Performance Trend
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: '#64748b' }}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{ value: 'Score (%)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#64748b' } }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="precision" fill="#3b82f6" name="Precision" radius={[4, 4, 0, 0]} />
              <Bar dataKey="recall" fill="#10b981" name="Recall" radius={[4, 4, 0, 0]} />
              <Bar dataKey="f1" fill="#8b5cf6" name="F1 Score" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {Math.round((evaluations[0]?.precision || 0) * 100)}%
            </p>
            <p className="text-xs text-slate-500">Precision</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {Math.round((evaluations[0]?.recall || 0) * 100)}%
            </p>
            <p className="text-xs text-slate-500">Recall</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-violet-600">
              {Math.round((evaluations[0]?.f1_score || 0) * 100)}%
            </p>
            <p className="text-xs text-slate-500">F1 Score</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}