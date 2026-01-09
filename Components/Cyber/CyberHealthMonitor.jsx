import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Wifi, AlertTriangle, Clock, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function CyberHealthMonitor({ telemetryData, faults }) {
  // Calculate aggregated metrics
  const recentData = telemetryData.slice(-50);
  
  const avgLatency = recentData.length > 0 
    ? recentData.reduce((sum, r) => sum + (r.latency_ms || 0), 0) / recentData.length 
    : 0;
  
  const avgPacketLoss = recentData.length > 0
    ? recentData.reduce((sum, r) => sum + (r.packet_loss_pct || 0), 0) / recentData.length
    : 0;

  const cyberFaults = faults.filter(f => 
    ['scada_latency', 'unauthorized_command'].includes(f.fault_type) && f.status === 'active'
  );

  const latencyStatus = avgLatency < 50 ? 'healthy' : avgLatency < 150 ? 'warning' : 'critical';
  const packetStatus = avgPacketLoss < 0.5 ? 'healthy' : avgPacketLoss < 2 ? 'warning' : 'critical';

  const statusColors = {
    healthy: 'text-emerald-600 bg-emerald-50',
    warning: 'text-amber-600 bg-amber-50',
    critical: 'text-red-600 bg-red-50'
  };

  const chartData = recentData.map(r => ({
    time: format(new Date(r.timestamp), 'HH:mm'),
    latency: r.latency_ms || 0,
    packetLoss: (r.packet_loss_pct || 0) * 10 // Scale for visibility
  }));

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase">Latency</span>
                <Badge className={statusColors[latencyStatus]}>{latencyStatus}</Badge>
              </div>
              <p className="text-2xl font-bold text-slate-900">{avgLatency.toFixed(1)} ms</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase">Packet Loss</span>
                <Badge className={statusColors[packetStatus]}>{packetStatus}</Badge>
              </div>
              <p className="text-2xl font-bold text-slate-900">{avgPacketLoss.toFixed(2)}%</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase">Active Alerts</span>
                <Shield className="w-4 h-4 text-violet-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{cyberFaults.length}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 uppercase">Readings</span>
                <Activity className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{recentData.length}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Latency Chart */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg font-semibold text-slate-900">
              SCADA Communication Metrics
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="latency" 
                  stroke="#3b82f6" 
                  fill="url(#latencyGradient)"
                  name="Latency (ms)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Active Cyber Alerts */}
      {cyberFaults.length > 0 && (
        <Card className="border-0 shadow-lg bg-red-50 border-l-4 border-red-500">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <CardTitle className="text-lg font-semibold text-red-900">
                Active Cyber/Communication Alerts
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {cyberFaults.map(fault => (
                <div key={fault.id} className="p-3 bg-white rounded-lg border border-red-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-red-900 capitalize">
                      {fault.fault_type.replace(/_/g, ' ')}
                    </span>
                    <Badge className="bg-red-100 text-red-700">{fault.severity}</Badge>
                  </div>
                  <p className="text-sm text-red-700">{fault.trigger_condition}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}