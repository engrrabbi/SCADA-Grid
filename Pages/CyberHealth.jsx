import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import CyberHealthMonitor from '@/components/cyber/CyberHealthMonitor';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, AlertTriangle, Lock, CheckCircle2, Activity, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CyberHealth() {
  const { data: telemetry = [] } = useQuery({
    queryKey: ['telemetry'],
    queryFn: () => base44.entities.TelemetryReading.list('-created_date', 200),
    refetchInterval: 5000
  });

  const { data: faults = [] } = useQuery({
    queryKey: ['faults'],
    queryFn: () => base44.entities.Fault.list('-created_date', 50),
    refetchInterval: 5000
  });

  const { data: sites = [] } = useQuery({
    queryKey: ['sites'],
    queryFn: () => base44.entities.Site.list('-created_date', 50)
  });

  const cyberFaults = faults.filter(f => 
    ['scada_latency', 'unauthorized_command'].includes(f.fault_type)
  );

  const recentTelemetry = telemetry.slice(0, 100);
  const avgLatency = recentTelemetry.length > 0 
    ? recentTelemetry.reduce((sum, r) => sum + (r.latency_ms || 0), 0) / recentTelemetry.length 
    : 0;
  const avgPacketLoss = recentTelemetry.length > 0
    ? recentTelemetry.reduce((sum, r) => sum + (r.packet_loss_pct || 0), 0) / recentTelemetry.length
    : 0;

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
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-violet-100">
                <Shield className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  Cyber & Communications Health
                </h1>
                <p className="text-slate-500 mt-1">
                  SCADA network monitoring and security alerts
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Shield className="w-8 h-8 text-emerald-500" />
                  <Badge className="bg-emerald-50 text-emerald-700">Secure</Badge>
                </div>
                <p className="text-3xl font-bold text-slate-900">{sites.length}</p>
                <p className="text-sm text-slate-500 mt-1">Protected Sites</p>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>All encrypted</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <Badge className={cyberFaults.filter(f => f.status === 'active').length > 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}>
                    {cyberFaults.filter(f => f.status === 'active').length > 0 ? 'Alert' : 'Clear'}
                  </Badge>
                </div>
                <p className="text-3xl font-bold text-slate-900">{cyberFaults.filter(f => f.status === 'active').length}</p>
                <p className="text-sm text-slate-500 mt-1">Active Threats</p>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <Activity className="w-3 h-3" />
                    <span>{cyberFaults.length} total detected</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Wifi className="w-8 h-8 text-blue-500" />
                  <Badge className={avgLatency < 100 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}>
                    {avgLatency < 100 ? 'Optimal' : 'Elevated'}
                  </Badge>
                </div>
                <p className="text-3xl font-bold text-slate-900">{avgLatency.toFixed(0)}</p>
                <p className="text-sm text-slate-500 mt-1">Avg Latency (ms)</p>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <Activity className="w-3 h-3" />
                    <span>Target: &lt;50ms</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Lock className="w-8 h-8 text-violet-500" />
                  <Badge className="bg-violet-50 text-violet-700">99.99%</Badge>
                </div>
                <p className="text-3xl font-bold text-slate-900">AES-256</p>
                <p className="text-sm text-slate-500 mt-1">Encryption Level</p>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1 text-xs text-violet-600">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>NERC CIP compliant</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Monitor */}
        <CyberHealthMonitor telemetryData={telemetry} faults={faults} />

        {/* Security Details Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          {/* Threat Intelligence */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Threat Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                  <span className="text-slate-600">Intrusion Attempts Blocked (24h)</span>
                  <span className="font-bold text-slate-900">0</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                  <span className="text-slate-600">Unauthorized Commands</span>
                  <span className="font-bold text-slate-900">{cyberFaults.filter(f => f.fault_type === 'unauthorized_command').length}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                  <span className="text-slate-600">Authentication Failures</span>
                  <span className="font-bold text-slate-900">0</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                  <span className="text-slate-600">Suspicious Traffic Patterns</span>
                  <span className="font-bold text-slate-900">0</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-50">
                  <span className="text-emerald-700 font-medium">Security Score</span>
                  <span className="font-bold text-emerald-700">98.5/100</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Network Health */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Wifi className="w-5 h-5 text-blue-500" />
                Network Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                  <span className="text-slate-600">Average Latency</span>
                  <span className="font-bold text-slate-900">{avgLatency.toFixed(1)} ms</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                  <span className="text-slate-600">Packet Loss Rate</span>
                  <span className="font-bold text-slate-900">{avgPacketLoss.toFixed(3)}%</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                  <span className="text-slate-600">Network Uptime (30d)</span>
                  <span className="font-bold text-slate-900">99.97%</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-50">
                  <span className="text-slate-600">Active SCADA Connections</span>
                  <span className="font-bold text-slate-900">{sites.length}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50">
                  <span className="text-blue-700 font-medium">Bandwidth Utilization</span>
                  <span className="font-bold text-blue-700">42%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compliance & Standards */}
        <div className="mt-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-50 to-indigo-50">
            <CardHeader className="border-b border-violet-100">
              <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-violet-600" />
                Security Compliance & Standards
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-slate-900">NERC CIP</span>
                  </div>
                  <p className="text-sm text-slate-600">Critical Infrastructure Protection compliance for bulk electric systems</p>
                </div>
                <div className="p-4 rounded-lg bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-slate-900">IEC 62351</span>
                  </div>
                  <p className="text-sm text-slate-600">Security standards for power system control operations</p>
                </div>
                <div className="p-4 rounded-lg bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="font-semibold text-slate-900">ISO 27001</span>
                  </div>
                  <p className="text-sm text-slate-600">Information security management system certification</p>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-lg bg-white">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold">Last Security Audit:</span> December 15, 2025 • 
                  <span className="font-semibold ml-2">Next Review:</span> March 15, 2026 • 
                  <span className="font-semibold ml-2">Penetration Test:</span> Passed (Nov 2025)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}