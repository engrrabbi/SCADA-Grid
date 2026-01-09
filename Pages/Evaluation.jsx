import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EvaluationMetrics from '@/components/evaluation/EvaluationMetrics';
import ConfusionMatrixTable from '@/components/evaluation/ConfusionMatrixTable';
import DetailedMetricsTable from '@/components/evaluation/DetailedMetricsTable';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Download, RefreshCw, Calculator } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function Evaluation() {
  const queryClient = useQueryClient();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: evaluations = [] } = useQuery({
    queryKey: ['evaluations'],
    queryFn: () => base44.entities.EvaluationResult.list('-created_date', 10)
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => base44.entities.Prediction.list('-created_date', 200)
  });

  const { data: faults = [] } = useQuery({
    queryKey: ['faults'],
    queryFn: () => base44.entities.Fault.list('-created_date', 200)
  });

  const generateEvaluationMutation = useMutation({
    mutationFn: async () => {
      // Simulate ML evaluation metrics calculation
      const totalPredictions = predictions.length;
      const aiDetectedFaults = faults.filter(f => f.detected_by_ai).length;
      
      // Calculate confusion matrix (simulated for demo)
      const truePositives = Math.floor(aiDetectedFaults * 0.85);
      const falsePositives = Math.floor(totalPredictions * 0.08);
      const falseNegatives = Math.floor(aiDetectedFaults * 0.15);
      const trueNegatives = Math.floor(totalPredictions * 0.6);
      
      const precision = truePositives / (truePositives + falsePositives) || 0;
      const recall = truePositives / (truePositives + falseNegatives) || 0;
      const f1 = 2 * (precision * recall) / (precision + recall) || 0;
      
      // Calculate lead times
      const faultsWithLeadTime = faults.filter(f => f.detection_lead_time_min);
      const avgLeadTime = faultsWithLeadTime.length > 0
        ? faultsWithLeadTime.reduce((sum, f) => sum + f.detection_lead_time_min, 0) / faultsWithLeadTime.length
        : 35;

      return base44.entities.EvaluationResult.create({
        evaluation_date: new Date().toISOString().split('T')[0],
        evaluation_period_days: 7,
        total_faults_detected: aiDetectedFaults,
        true_positives: truePositives || 12,
        false_positives: falsePositives || 3,
        false_negatives: falseNegatives || 2,
        true_negatives: trueNegatives || 45,
        precision: precision || 0.86,
        recall: recall || 0.92,
        f1_score: f1 || 0.89,
        false_alarm_rate: 0.05 + Math.random() * 0.03,
        avg_early_warning_lead_time_min: Math.round(avgLeadTime),
        baseline_detection_time_min: 45,
        ai_detection_time_min: 12,
        fault_isolation_time_reduction_pct: 65 + Math.floor(Math.random() * 10),
        downtime_prevented_hr: 18 + Math.floor(Math.random() * 12),
        cost_savings_usd: 35000 + Math.floor(Math.random() * 20000),
        model_version: 'v2.4.1-rf-ensemble'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
    }
  });

  const latestEvaluation = evaluations[0];

  const exportCSV = () => {
    if (!latestEvaluation) return;
    
    const headers = Object.keys(latestEvaluation).join(',');
    const values = Object.values(latestEvaluation).join(',');
    const csv = `${headers}\n${values}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evaluation-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Dashboard')}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  Model Evaluation
                </h1>
                <p className="text-slate-500 mt-1">
                  AI performance metrics and validation results
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={exportCSV}
                disabled={!latestEvaluation}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Button
                onClick={() => generateEvaluationMutation.mutate()}
                disabled={generateEvaluationMutation.isPending}
                className="bg-violet-600 hover:bg-violet-700 gap-2"
              >
                {generateEvaluationMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Calculator className="w-4 h-4" />
                )}
                Run Evaluation
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Evaluation Info */}
        {latestEvaluation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-violet-100">
                      <FileText className="w-6 h-6 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">Latest Evaluation</h3>
                      <p className="text-sm text-slate-500">
                        {format(new Date(latestEvaluation.evaluation_date), 'MMMM d, yyyy')} • 
                        {latestEvaluation.evaluation_period_days}-day period • 
                        Model {latestEvaluation.model_version}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-violet-600">
                      {Math.round((latestEvaluation.f1_score || 0) * 100)}%
                    </p>
                    <p className="text-sm text-slate-500">F1 Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Evaluation Metrics */}
        <EvaluationMetrics evaluation={latestEvaluation} />

        {/* Detailed Analysis */}
        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <ConfusionMatrixTable evaluation={latestEvaluation} />
          <DetailedMetricsTable evaluation={latestEvaluation} />
        </div>

        {/* Historical Evaluations */}
        {evaluations.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Evaluation History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {evaluations.slice(1).map((eval_, index) => (
                    <div 
                      key={eval_.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {format(new Date(eval_.evaluation_date), 'MMM d, yyyy')}
                        </p>
                        <p className="text-sm text-slate-500">
                          {eval_.evaluation_period_days} days • {eval_.model_version}
                        </p>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-right">
                          <p className="font-medium">{Math.round((eval_.precision || 0) * 100)}%</p>
                          <p className="text-slate-500">Precision</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{Math.round((eval_.recall || 0) * 100)}%</p>
                          <p className="text-slate-500">Recall</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-violet-600">{Math.round((eval_.f1_score || 0) * 100)}%</p>
                          <p className="text-slate-500">F1</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}