import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConfusionMatrixTable({ evaluation }) {
  if (!evaluation) return null;

  const matrix = [
    [
      { label: 'True Positive', value: evaluation.true_positives || 0, color: 'bg-emerald-100 text-emerald-800' },
      { label: 'False Positive', value: evaluation.false_positives || 0, color: 'bg-amber-100 text-amber-800' }
    ],
    [
      { label: 'False Negative', value: evaluation.false_negatives || 0, color: 'bg-red-100 text-red-800' },
      { label: 'True Negative', value: evaluation.true_negatives || 0, color: 'bg-blue-100 text-blue-800' }
    ]
  ];

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900">
          Confusion Matrix
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2 text-xs font-medium text-slate-500 text-center mb-3">
            <div></div>
            <div>Predicted Positive</div>
            <div>Predicted Negative</div>
          </div>
          
          {matrix.map((row, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-3 gap-2">
              <div className="flex items-center text-xs font-medium text-slate-500">
                {rowIdx === 0 ? 'Actual Positive' : 'Actual Negative'}
              </div>
              {row.map((cell, cellIdx) => (
                <div 
                  key={cellIdx}
                  className={`p-4 rounded-lg ${cell.color} text-center`}
                >
                  <p className="text-2xl font-bold mb-1">{cell.value}</p>
                  <p className="text-xs font-medium">{cell.label}</p>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500 mb-1">Accuracy</p>
            <p className="text-xl font-bold text-slate-900">
              {(((evaluation.true_positives + evaluation.true_negatives) / 
                (evaluation.true_positives + evaluation.true_negatives + evaluation.false_positives + evaluation.false_negatives)) * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Error Rate</p>
            <p className="text-xl font-bold text-red-600">
              {(((evaluation.false_positives + evaluation.false_negatives) / 
                (evaluation.true_positives + evaluation.true_negatives + evaluation.false_positives + evaluation.false_negatives)) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}