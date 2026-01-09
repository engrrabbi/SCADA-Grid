import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";

const severityColors = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-blue-50 text-blue-700 border-blue-200"
};

const statusIcons = {
  active: AlertCircle,
  resolved: CheckCircle2,
  acknowledged: Clock
};

export default function RecentFaults({ faults, sites }) {
  const getSiteName = (siteId) => {
    const site = sites.find(s => s.site_id === siteId);
    return site?.name || siteId;
  };

  const recentFaults = [...faults]
    .sort((a, b) => new Date(b.start_timestamp || b.created_date) - new Date(a.start_timestamp || a.created_date))
    .slice(0, 8);

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">Recent Faults</CardTitle>
          <Badge variant="outline" className="bg-slate-50">
            {faults.filter(f => f.status === 'active').length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto">
          {recentFaults.map((fault, index) => {
            const StatusIcon = statusIcons[fault.status] || AlertCircle;
            return (
              <motion.div
                key={fault.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`w-4 h-4 ${
                      fault.status === 'active' ? 'text-red-500' : 
                      fault.status === 'resolved' ? 'text-emerald-500' : 'text-amber-500'
                    }`} />
                    <span className="font-medium text-slate-900 capitalize">
                      {(fault.fault_type || 'unknown').replace(/_/g, ' ')}
                    </span>
                  </div>
                  <Badge variant="outline" className={severityColors[fault.severity || 'medium']}>
                    {fault.severity || 'medium'}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-2">{getSiteName(fault.site_id)}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {fault.start_timestamp 
                      ? formatDistanceToNow(new Date(fault.start_timestamp), { addSuffix: true })
                      : 'Recently'}
                  </span>
                  {fault.detected_by_ai && (
                    <Badge className="bg-violet-50 text-violet-700 border-violet-200 text-xs">
                      AI Detected
                    </Badge>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}