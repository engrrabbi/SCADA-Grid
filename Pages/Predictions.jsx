import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import MaintenanceRecommendations from '@/components/maintenance/MaintenanceRecommendations';
import PredictionsList from '@/components/predictions/PredictionsList';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, Clock, Target, TrendingUp, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, formatDistanceToNow } from 'date-fns';

const confidenceColors = {
  very_high: "bg-emerald-50 text-emerald-700 border-emerald-200",
  high: "bg-blue-50 text-blue-700 border-blue-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-50 text-slate-700 border-slate-200"
};

export default function Predictions() {
  const queryClient = useQueryClient();

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => base44.entities.Prediction.list('-created_date', 100)
  });

  const { data: maintenanceActions = [] } = useQuery({
    queryKey: ['maintenance'],
    queryFn: () => base44.entities.MaintenanceAction.list('-created_date', 50)
  });

  const { data: sites = [] } = useQuery({
    queryKey: ['sites'],
    queryFn: () => base44.entities.Site.list('-created_date', 50)
  });

  const updateMaintenanceMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.MaintenanceAction.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance'] })
  });

  const generateMaintenanceMutation = useMutation({
    mutationFn: async (prediction) => {
      const actionMap = {
        overvoltage: {
          action: "Inspect voltage regulator and transformer tap settings",
          cost: 2500,
          downtime: 4
        },
        undervoltage: {
          action: "Check load balancing and grid connection points",
          cost: 1800,
          downtime: 3
        },
        frequency_drift: {
          action: "Verify governor settings and grid synchronization",
          cost: 3200,
          downtime: 6
        },
        inverter_overheat: {
          action: "Inspect inverter cooling fan and airflow systems",
          cost: 1500,
          downtime: 2
        },
        scada_latency: {
          action: "Check RTU connections and network infrastructure",
          cost: 800,
          downtime: 1
        },
        harmonic_spike: {
          action: "Inspect harmonic filters and capacitor banks",
          cost: 2200,
          downtime: 3
        },
        dc_instability: {
          action: "Check MPPT settings and string connections",
          cost: 1200,
          downtime: 2
        }
      };

      const details = actionMap[prediction.predicted_fault_type] || {
        action: "General inspection recommended",
        cost: 1000,
        downtime: 2
      };

      return base44.entities.MaintenanceAction.create({
        site_id: prediction.site_id,
        recommended_action: details.action,
        priority: prediction.fault_probability >= 0.8 ? 'critical' : 
                 prediction.fault_probability >= 0.6 ? 'high' : 'medium',
        justification: prediction.contributing_factors || ['AI prediction triggered'],
        estimated_downtime_if_ignored_hr: details.downtime * 2,
        estimated_repair_cost_usd: details.cost,
        estimated_completion_time_hr: details.downtime,
        triggered_by_prediction_id: prediction.id,
        status: 'pending'
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['maintenance'] })
  });

  const getSiteName = (siteId) => {
    const site = sites.find(s => s.site_id === siteId);
    return site?.name || siteId;
  };

  const sortedPredictions = [...predictions].sort((a, b) => 
    (b.fault_probability || 0) - (a.fault_probability || 0)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                AI Predictions & Maintenance
              </h1>
              <p className="text-slate-500 mt-1">
                Fault predictions and recommended maintenance actions
              </p>
            </div>
          </div>
        </motion.div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-lg bg-white/80">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Brain className="w-5 h-5 text-violet-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{predictions.length}</p>
              <p className="text-sm text-slate-500">Total Predictions</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/80">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {predictions.filter(p => (p.fault_probability || 0) >= 0.7).length}
              </p>
              <p className="text-sm text-slate-500">High Risk</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/80">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {predictions.filter(p => p.was_accurate === true).length}
              </p>
              <p className="text-sm text-slate-500">Validated</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg bg-white/80">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {Math.round(predictions.reduce((sum, p) => sum + (p.estimated_time_to_failure_min || 0), 0) / (predictions.length || 1))} min
              </p>
              <p className="text-sm text-slate-500">Avg Lead Time</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Predictions List */}
          <div className="lg:col-span-3">
            <PredictionsList
              predictions={sortedPredictions}
              sites={sites}
              onCreateMaintenance={(prediction) => generateMaintenanceMutation.mutate(prediction)}
            />
          </div>

          {/* Predictions Table */}
          <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mb-8">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-violet-600" />
                <CardTitle className="text-lg font-semibold text-slate-900">
                  Recent Predictions
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Site</TableHead>
                      <TableHead>Fault Type</TableHead>
                      <TableHead>Probability</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPredictions.slice(0, 20).map((prediction) => (
                      <TableRow key={prediction.id}>
                        <TableCell className="font-medium">
                          {getSiteName(prediction.site_id)}
                        </TableCell>
                        <TableCell className="capitalize">
                          {(prediction.predicted_fault_type || 'unknown').replace(/_/g, ' ')}
                        </TableCell>
                        <TableCell>
                          <Badge className={confidenceColors[prediction.confidence_level || 'medium']}>
                            {Math.round((prediction.fault_probability || 0) * 100)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {prediction.estimated_time_to_failure_min || '-'} min
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateMaintenanceMutation.mutate(prediction)}
                            disabled={generateMaintenanceMutation.isPending}
                            className="text-xs"
                          >
                            Create Task
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance Recommendations */}
            <MaintenanceRecommendations
              actions={maintenanceActions}
              sites={sites}
              onStatusUpdate={(id, status) => updateMaintenanceMutation.mutate({ id, status })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}