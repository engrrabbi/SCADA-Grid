import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Activity, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const statusColors = {
  operational: "bg-emerald-500",
  degraded: "bg-amber-500",
  critical: "bg-red-500",
  offline: "bg-slate-400"
};

const statusBadgeColors = {
  operational: "bg-emerald-50 text-emerald-700 border-emerald-200",
  degraded: "bg-amber-50 text-amber-700 border-amber-200",
  critical: "bg-red-50 text-red-700 border-red-200",
  offline: "bg-slate-50 text-slate-700 border-slate-200"
};

export default function SiteHealthMap({ sites, onSiteSelect }) {
  const sortedSites = [...sites].sort((a, b) => (a.health_score || 100) - (b.health_score || 100));
  
  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">Fleet Overview</CardTitle>
          <div className="flex items-center gap-3 text-xs">
            {Object.entries(statusColors).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className="capitalize text-slate-600">{status}</span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
          {sortedSites.map((site, index) => (
            <motion.div
              key={site.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSiteSelect?.(site)}
              className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${statusColors[site.status || 'operational']}`} />
                <div>
                  <p className="font-medium text-slate-900">{site.name}</p>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin className="w-3 h-3" />
                    <span>{site.location}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{site.health_score || 100}%</p>
                  <p className="text-xs text-slate-500">Health Score</p>
                </div>
                <Badge variant="outline" className={statusBadgeColors[site.status || 'operational']}>
                  {site.status || 'operational'}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}