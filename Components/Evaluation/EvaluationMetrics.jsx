import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { TrendingUp, Target, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6366f1'];

export default function EvaluationMetrics({ evaluation }) {
  if (!evaluation) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center text-slate-500">
          <Target className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p>No evaluation data available</p>
        </CardContent>
      </Card>
    );
  }

  const confusionData = [
    { name: 'True Positive', value: evaluation.true_positives || 0, color: '#10b981' },
    { name: 'False Positive', value: evaluation.false_positives || 0, color: '#f59e0b' },
    { name: 'False Negative', value: evaluation.false_negatives || 0, color: '#ef4444' },
    { name: 'True Negative', value: evaluation.true_negatives || 0, color: '#6366f1' }
  ];

  const comparisonData = [
    { 
      name: 'Detection Time', 
      baseline: evaluation.baseline_detection_time_min || 45, 
      ai: evaluation.ai_detection_time_min || 12 
    },
    { 
      name: 'False Alarm Rate', 
      baseline: 15, 
      ai: (evaluation.false_alarm_rate || 0.05) * 100 
    }
  ];

  const metrics = [
    { 
      label: 'Precision', 
      value: ((evaluation.precision || 0) * 100).toFixed(1) + '%',
      icon: Target,
      color: 'text-blue-600 bg-blue-50'
    },
    { 
      label: 'Recall', 
      value: ((evaluation.recall || 0) * 100).toFixed(1) + '%',
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50'
    },
    { 
      label: 'F1 Score', 
      value: ((evaluation.f1_score || 0) * 100).toFixed(1) + '%',
      icon: TrendingUp,
      color: 'text-violet-600 bg-violet-50'
    },
    { 
      label: 'Avg Lead Time', 
      value: (evaluation.avg_early_warning_lead_time_min || 0) + ' min',
      icon: Clock,
      color: 'text-amber-600 bg-amber-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    {metric.label}
                  </span>
                  <div className={`p-1.5 rounded-lg ${metric.color}`}>
                    <metric.icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Confusion Matrix */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Prediction Accuracy Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={confusionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {confusionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Baseline vs AI Comparison */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Baseline vs AI Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: '#94a3b8' }} width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="baseline" fill="#94a3b8" name="Baseline" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="ai" fill="#8b5cf6" name="AI-Assisted" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Impact Summary */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-emerald-100 text-sm mb-1">Fault Isolation Improvement</p>
              <p className="text-3xl font-bold">
                {evaluation.fault_isolation_time_reduction_pct || 65}%
              </p>
              <p className="text-emerald-100 text-xs mt-1">faster than baseline</p>
            </div>
            <div>
              <p className="text-emerald-100 text-sm mb-1">Downtime Prevented</p>
              <p className="text-3xl font-bold">
                {evaluation.downtime_prevented_hr || 24}h
              </p>
              <p className="text-emerald-100 text-xs mt-1">this evaluation period</p>
            </div>
            <div>
              <p className="text-emerald-100 text-sm mb-1">Cost Savings</p>
              <p className="text-3xl font-bold">
                ${(evaluation.cost_savings_usd || 45000).toLocaleString()}
              </p>
              <p className="text-emerald-100 text-xs mt-1">estimated savings</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}