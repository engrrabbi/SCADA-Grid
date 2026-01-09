import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export default function DetailedMetricsTable({ evaluation }) {
  if (!evaluation) return null;

  const metrics = [
    {
      category: 'Detection Accuracy',
      items: [
        { name: 'Precision', value: `${((evaluation.precision || 0) * 100).toFixed(1)}%`, description: 'Of predicted faults, how many were real', icon: CheckCircle2, iconColor: 'text-blue-600' },
        { name: 'Recall', value: `${((evaluation.recall || 0) * 100).toFixed(1)}%`, description: 'Of actual faults, how many were detected', icon: CheckCircle2, iconColor: 'text-emerald-600' },
        { name: 'F1 Score', value: `${((evaluation.f1_score || 0) * 100).toFixed(1)}%`, description: 'Harmonic mean of precision and recall', icon: CheckCircle2, iconColor: 'text-violet-600' },
      ]
    },
    {
      category: 'Operational Impact',
      items: [
        { name: 'False Alarm Rate', value: `${((evaluation.false_alarm_rate || 0) * 100).toFixed(2)}%`, description: 'Rate of incorrect warnings', icon: AlertTriangle, iconColor: 'text-amber-600' },
        { name: 'Early Warning Lead Time', value: `${evaluation.avg_early_warning_lead_time_min || 0} min`, description: 'Average advance notice before failure', icon: CheckCircle2, iconColor: 'text-emerald-600' },
        { name: 'Detection Time Reduction', value: `${evaluation.fault_isolation_time_reduction_pct || 0}%`, description: 'Improvement vs baseline system', icon: CheckCircle2, iconColor: 'text-blue-600' },
      ]
    },
    {
      category: 'Business Value',
      items: [
        { name: 'Downtime Prevented', value: `${evaluation.downtime_prevented_hr || 0} hours`, description: 'Operational hours saved', icon: CheckCircle2, iconColor: 'text-emerald-600' },
        { name: 'Cost Savings', value: `$${(evaluation.cost_savings_usd || 0).toLocaleString()}`, description: 'Estimated financial impact', icon: CheckCircle2, iconColor: 'text-emerald-600' },
        { name: 'Baseline Detection Time', value: `${evaluation.baseline_detection_time_min || 0} min`, description: 'Traditional system response', icon: XCircle, iconColor: 'text-slate-600' },
        { name: 'AI Detection Time', value: `${evaluation.ai_detection_time_min || 0} min`, description: 'AI-assisted response time', icon: CheckCircle2, iconColor: 'text-violet-600' },
      ]
    }
  ];

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          Detailed Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {metrics.map((category, idx) => (
            <div key={idx}>
              <h4 className="font-semibold text-slate-900 mb-3">{category.category}</h4>
              <div className="space-y-3">
                {category.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                    <item.icon className={`w-5 h-5 mt-0.5 ${item.iconColor}`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-slate-900">{item.name}</span>
                        <span className="text-lg font-bold text-slate-900">{item.value}</span>
                      </div>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}