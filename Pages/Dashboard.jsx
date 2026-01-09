import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import FleetHealthCard from '@/components/dashboard/FleetHealthCard';
import SiteHealthMap from '@/components/dashboard/SiteHealthMap';
import RiskForecast from '@/components/dashboard/RiskForecast';
import RecentFaults from '@/components/dashboard/RecentFaults';
import FaultTimeline from '@/components/dashboard/FaultTimeline';
import PerformanceMetrics from '@/components/dashboard/PerformanceMetrics';
import TelemetrySimulator from '@/components/telemetry/TelemetrySimulator';
import PredictionEngine from '@/components/predictions/PredictionEngine';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Zap, Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [recentTelemetry, setRecentTelemetry] = useState([]);

  const { data: sites = [] } = useQuery({
    queryKey: ['sites'],
    queryFn: () => base44.entities.Site.list('-created_date', 50),
    refetchInterval: 10000
  });

  const { data: faults = [] } = useQuery({
    queryKey: ['faults'],
    queryFn: () => base44.entities.Fault.list('-created_date', 50),
    refetchInterval: 5000
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => base44.entities.Prediction.list('-created_date', 50),
    refetchInterval: 5000
  });

  const { data: telemetry = [] } = useQuery({
    queryKey: ['telemetry'],
    queryFn: () => base44.entities.TelemetryReading.list('-created_date', 100),
    refetchInterval: 3000
  });

  const { data: evaluations = [] } = useQuery({
    queryKey: ['evaluations'],
    queryFn: () => base44.entities.EvaluationResult.list('-created_date', 10)
  });

  useEffect(() => {
    setRecentTelemetry(telemetry);
  }, [telemetry]);

  const handleNewReading = (reading) => {
    setRecentTelemetry(prev => [reading, ...prev].slice(0, 100));
    queryClient.invalidateQueries({ queryKey: ['telemetry'] });
  };

  const handlePredictionGenerated = () => {
    queryClient.invalidateQueries({ queryKey: ['predictions'] });
  };

  const handleFaultInjected = () => {
    queryClient.invalidateQueries({ queryKey: ['faults'] });
  };

  // Calculate metrics
  const activeFaults = faults.filter(f => f.status === 'active').length;
  const criticalSites = sites.filter(s => s.status === 'critical').length;
  const avgHealth = sites.length > 0 
    ? Math.round(sites.reduce((sum, s) => sum + (s.health_score || 100), 0) / sites.length)
    : 100;
  const highRiskPredictions = predictions.filter(p => (p.fault_probability || 0) >= 0.7).length;

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
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                SCADA Grid Intelligence
              </h1>
              <p className="text-slate-500 mt-1">
                AI-Powered Fault Prediction & Reliability Platform
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => queryClient.invalidateQueries()}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Link to={createPageUrl('SiteDetail')}>
                <Button className="bg-slate-900 hover:bg-slate-800 gap-2">
                  <Activity className="w-4 h-4" />
                  View Sites
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <FleetHealthCard
            title="Fleet Health"
            value={`${avgHealth}%`}
            subtitle={`${sites.length} sites monitored`}
            type="health"
            trend={2.3}
          />
          <FleetHealthCard
            title="Active Faults"
            value={activeFaults}
            subtitle={`${criticalSites} critical sites`}
            type="alerts"
            trend={activeFaults > 0 ? -5 : 0}
          />
          <FleetHealthCard
            title="Power Output"
            value="47.2 MW"
            subtitle="Current generation"
            type="power"
            trend={4.8}
          />
          <FleetHealthCard
            title="Risk Predictions"
            value={highRiskPredictions}
            subtitle="High probability (24h)"
            type="security"
          />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <SiteHealthMap 
              sites={sites} 
              onSiteSelect={(site) => {
                window.location.href = createPageUrl('SiteDetail') + `?siteId=${site.site_id}`;
              }}
            />
          </div>
          <div>
            <RiskForecast predictions={predictions} sites={sites} />
          </div>
        </div>

        {/* Simulation & Prediction Controls */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <TelemetrySimulator
            sites={sites}
            onNewReading={handleNewReading}
            onFaultInjected={handleFaultInjected}
          />
          <PredictionEngine
            telemetryData={recentTelemetry}
            sites={sites}
            onPredictionGenerated={handlePredictionGenerated}
          />
        </div>

        {/* Performance & Timeline */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <PerformanceMetrics evaluations={evaluations} />
          <FaultTimeline faults={faults} sites={sites} />
        </div>

        {/* Recent Faults & Additional Info */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentFaults faults={faults} sites={sites} />
          </div>
          <div className="space-y-6">
            {/* System Status */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg font-semibold text-slate-900">System Status</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Data Collection Rate</span>
                  <span className="font-semibold text-emerald-600">3s intervals</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Model Version</span>
                  <span className="font-semibold">v2.4.1</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Active Detectors</span>
                  <span className="font-semibold">6/6</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Last Model Update</span>
                  <span className="font-semibold">Jan 10, 2025</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Network Status</span>
                  <Badge className="bg-emerald-50 text-emerald-700">Optimal</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">SCADA Connectivity</span>
                  <Badge className="bg-emerald-50 text-emerald-700">All Sites Online</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to={createPageUrl('Predictions')}>
                  <Button variant="outline" className="w-full justify-start bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    View All Predictions
                  </Button>
                </Link>
                <Link to={createPageUrl('Evaluation')}>
                  <Button variant="outline" className="w-full justify-start bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Activity className="w-4 h-4 mr-2" />
                    Run Evaluation
                  </Button>
                </Link>
                <Link to={createPageUrl('CyberHealth')}>
                  <Button variant="outline" className="w-full justify-start bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Shield className="w-4 h-4 mr-2" />
                    Cyber Security
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}