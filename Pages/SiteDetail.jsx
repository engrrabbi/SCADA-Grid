import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TelemetryChart from '@/components/telemetry/TelemetryChart';
import RecentFaults from '@/components/dashboard/RecentFaults';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Zap, Activity, Thermometer, Clock, RefreshCw, TrendingUp, AlertTriangle, Gauge, Sun, Wind, Battery } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

export default function SiteDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const siteIdFromUrl = urlParams.get('siteId');
  const queryClient = useQueryClient();
  const [selectedSiteId, setSelectedSiteId] = useState(siteIdFromUrl || '');

  const { data: sites = [] } = useQuery({
    queryKey: ['sites'],
    queryFn: () => base44.entities.Site.list('-created_date', 50)
  });

  const { data: allTelemetry = [] } = useQuery({
    queryKey: ['telemetry', selectedSiteId],
    queryFn: () => selectedSiteId 
      ? base44.entities.TelemetryReading.filter({ site_id: selectedSiteId }, '-created_date', 100)
      : base44.entities.TelemetryReading.list('-created_date', 100),
    refetchInterval: 5000
  });

  const { data: allFaults = [] } = useQuery({
    queryKey: ['faults', selectedSiteId],
    queryFn: () => selectedSiteId
      ? base44.entities.Fault.filter({ site_id: selectedSiteId }, '-created_date', 50)
      : base44.entities.Fault.list('-created_date', 50)
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['predictions', selectedSiteId],
    queryFn: () => selectedSiteId
      ? base44.entities.Prediction.filter({ site_id: selectedSiteId }, '-created_date', 20)
      : base44.entities.Prediction.list('-created_date', 20)
  });

  const { data: maintenanceActions = [] } = useQuery({
    queryKey: ['maintenance', selectedSiteId],
    queryFn: () => selectedSiteId
      ? base44.entities.MaintenanceAction.filter({ site_id: selectedSiteId }, '-created_date', 10)
      : base44.entities.MaintenanceAction.list('-created_date', 10)
  });

  const selectedSite = sites.find(s => s.site_id === selectedSiteId);
  const telemetry = allTelemetry.slice(0, 50);
  const faults = allFaults;

  const statusColors = {
    operational: "bg-emerald-50 text-emerald-700 border-emerald-200",
    degraded: "bg-amber-50 text-amber-700 border-amber-200",
    critical: "bg-red-50 text-red-700 border-red-200",
    offline: "bg-slate-50 text-slate-700 border-slate-200"
  };

  // Get latest reading
  const latestReading = telemetry[0] || {};

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
                  Site Monitoring
                </h1>
                <p className="text-slate-500 mt-1">
                  Real-time telemetry and fault analysis
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map(site => (
                    <SelectItem key={site.site_id} value={site.site_id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => queryClient.invalidateQueries()}
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {selectedSite ? (
          <>
            {/* Site Info Card - Enhanced */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
                <CardContent className="p-8 relative">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        {selectedSite.site_type === 'solar' && <Sun className="w-8 h-8" />}
                        {selectedSite.site_type === 'wind' && <Wind className="w-8 h-8" />}
                        {selectedSite.site_type === 'hybrid' && <Battery className="w-8 h-8" />}
                        <h2 className="text-3xl font-bold">{selectedSite.name}</h2>
                      </div>
                      <div className="flex items-center gap-4 text-white/80">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{selectedSite.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Activity className="w-4 h-4" />
                          <span>ID: {selectedSite.site_id}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="inline-block p-4 rounded-2xl bg-white/20 backdrop-blur-sm mb-2">
                        <p className="text-5xl font-bold">{selectedSite.health_score || 100}%</p>
                      </div>
                      <Badge className="bg-white/20 text-white border-white/30">
                        {selectedSite.status || 'operational'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                      <p className="text-xs text-white/70 uppercase tracking-wide mb-1">Capacity</p>
                      <p className="text-2xl font-bold">{selectedSite.capacity_mw || '-'} MW</p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                      <p className="text-xs text-white/70 uppercase tracking-wide mb-1">Type</p>
                      <p className="text-2xl font-bold capitalize">{selectedSite.site_type || 'solar'}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                      <p className="text-xs text-white/70 uppercase tracking-wide mb-1">Inverters</p>
                      <p className="text-2xl font-bold">{selectedSite.inverter_count || '-'}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                      <p className="text-xs text-white/70 uppercase tracking-wide mb-1">Commissioned</p>
                      <p className="text-lg font-bold">
                        {selectedSite.commissioned_date 
                          ? format(new Date(selectedSite.commissioned_date), 'MMM yyyy')
                          : '-'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                      <p className="text-xs text-white/70 uppercase tracking-wide mb-1">Last Service</p>
                      <p className="text-lg font-bold">
                        {selectedSite.last_maintenance_date 
                          ? format(new Date(selectedSite.last_maintenance_date), 'MMM d')
                          : '-'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Statistics Overview */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Gauge className="w-8 h-8 text-blue-500" />
                      <Badge className="bg-blue-50 text-blue-700">Live</Badge>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{(latestReading.power_kw || 0).toFixed(1)}</p>
                    <p className="text-sm text-slate-500 mt-1">Current Output (kW)</p>
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-xs text-emerald-600">
                        <TrendingUp className="w-3 h-3" />
                        <span>Normal operation</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <AlertTriangle className="w-8 h-8 text-amber-500" />
                      <Badge className="bg-amber-50 text-amber-700">Active</Badge>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{faults.filter(f => f.status === 'active').length}</p>
                    <p className="text-sm text-slate-500 mt-1">Active Faults</p>
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Clock className="w-3 h-3" />
                        <span>{faults.filter(f => f.status === 'resolved').length} resolved</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Activity className="w-8 h-8 text-violet-500" />
                      <Badge className="bg-violet-50 text-violet-700">AI</Badge>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{predictions.length}</p>
                    <p className="text-sm text-slate-500 mt-1">Predictions (24h)</p>
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{predictions.filter(p => p.fault_probability >= 0.7).length} high risk</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Clock className="w-8 h-8 text-emerald-500" />
                      <Badge className="bg-emerald-50 text-emerald-700">Tasks</Badge>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{maintenanceActions.length}</p>
                    <p className="text-sm text-slate-500 mt-1">Maintenance Items</p>
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <Activity className="w-3 h-3" />
                        <span>{maintenanceActions.filter(m => m.status === 'pending').length} pending</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Live Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Real-Time Telemetry</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Card className="border-0 shadow-md bg-white/80">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Zap className="w-4 h-4 text-blue-500" />
                      <span className="text-xs text-slate-500">kV</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{(latestReading.voltage_kv || 0).toFixed(1)}</p>
                    <p className="text-xs text-slate-500">Voltage</p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-md bg-white/80">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs text-slate-500">A</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{(latestReading.current_a || 0).toFixed(1)}</p>
                    <p className="text-xs text-slate-500">Current</p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-md bg-white/80">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Clock className="w-4 h-4 text-violet-500" />
                      <span className="text-xs text-slate-500">Hz</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{(latestReading.frequency_hz || 60).toFixed(2)}</p>
                    <p className="text-xs text-slate-500">Frequency</p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-md bg-white/80">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-xs text-slate-500">kW</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{(latestReading.power_kw || 0).toFixed(0)}</p>
                    <p className="text-xs text-slate-500">Power</p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-md bg-white/80">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Thermometer className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-slate-500">°C</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{(latestReading.inverter_temp_c || 0).toFixed(1)}</p>
                    <p className="text-xs text-slate-500">Inv. Temp</p>
                  </CardContent>
                </Card>
                
                <Card className="border-0 shadow-md bg-white/80">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Activity className="w-4 h-4 text-pink-500" />
                      <span className="text-xs text-slate-500">ms</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{(latestReading.latency_ms || 0).toFixed(0)}</p>
                    <p className="text-xs text-slate-500">Latency</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-3 gap-8 mb-8">
              {/* Left - Charts */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance Trends</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <TelemetryChart data={telemetry} metric="voltage_kv" />
                    <TelemetryChart data={telemetry} metric="frequency_hz" />
                    <TelemetryChart data={telemetry} metric="power_kw" />
                    <TelemetryChart data={telemetry} metric="inverter_temp_c" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Site Faults & Events</h3>
                  <RecentFaults faults={faults} sites={sites} />
                </div>
              </div>

              {/* Right - Predictions & Maintenance */}
              <div className="space-y-6">
                {/* Predictions */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-lg font-semibold text-slate-900">AI Predictions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                      {predictions.length > 0 ? predictions.map((pred, idx) => (
                        <div key={pred.id} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-medium text-slate-900 capitalize text-sm">
                              {(pred.predicted_fault_type || '').replace(/_/g, ' ')}
                            </span>
                            <Badge className={
                              pred.fault_probability >= 0.7 ? "bg-red-50 text-red-700" :
                              pred.fault_probability >= 0.5 ? "bg-amber-50 text-amber-700" :
                              "bg-blue-50 text-blue-700"
                            }>
                              {Math.round(pred.fault_probability * 100)}%
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {pred.estimated_time_to_failure_min || 0} min
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {pred.confidence_level}
                            </Badge>
                          </div>
                        </div>
                      )) : (
                        <div className="p-8 text-center text-slate-500">
                          <Activity className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="text-sm">No predictions for this site</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Maintenance Actions */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-lg font-semibold text-slate-900">Maintenance Queue</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                      {maintenanceActions.length > 0 ? maintenanceActions.map((action, idx) => (
                        <div key={action.id} className="p-4 hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-medium text-slate-900 text-sm line-clamp-2">
                              {action.recommended_action}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={
                              action.priority === 'critical' ? "bg-red-50 text-red-700" :
                              action.priority === 'high' ? "bg-orange-50 text-orange-700" :
                              action.priority === 'medium' ? "bg-amber-50 text-amber-700" :
                              "bg-blue-50 text-blue-700"
                            }>
                              {action.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {action.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span>Cost: ${(action.estimated_repair_cost_usd || 0).toLocaleString()}</span>
                            <span>Time: {action.estimated_completion_time_hr || 0}h</span>
                          </div>
                        </div>
                      )) : (
                        <div className="p-8 text-center text-slate-500">
                          <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          <p className="text-sm">No maintenance scheduled</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Metrics */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-lg font-semibold text-slate-900">Network & Quality</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 text-sm">SCADA Latency</span>
                      <span className="font-semibold">{(latestReading.latency_ms || 0).toFixed(0)} ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 text-sm">Packet Loss</span>
                      <span className="font-semibold">{(latestReading.packet_loss_pct || 0).toFixed(2)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 text-sm">THD</span>
                      <span className="font-semibold">{(latestReading.thd_pct || 0).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 text-sm">Power Factor</span>
                      <span className="font-semibold">{(latestReading.power_factor || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 text-sm">DC Link Voltage</span>
                      <span className="font-semibold">{(latestReading.dc_link_voltage_v || 0).toFixed(0)} V</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 text-sm">Breaker Status</span>
                      <Badge className={latestReading.breaker_status === 'CLOSED' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}>
                        {latestReading.breaker_status || 'CLOSED'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Activity className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Select a Site</h3>
            <p className="text-slate-500">Choose a site from the dropdown to view detailed telemetry</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}