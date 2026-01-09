import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertTriangle, Zap, Shield } from "lucide-react";
import { motion } from "framer-motion";

const iconMap = {
  health: Activity,
  alerts: AlertTriangle,
  power: Zap,
  security: Shield
};

const colorMap = {
  health: "from-emerald-500 to-teal-600",
  alerts: "from-amber-500 to-orange-600",
  power: "from-blue-500 to-indigo-600",
  security: "from-violet-500 to-purple-600"
};

export default function FleetHealthCard({ title, value, subtitle, type = "health", trend, trendLabel }) {
  const Icon = iconMap[type] || Activity;
  const gradient = colorMap[type] || colorMap.health;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="relative overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} rounded-full opacity-10 -translate-y-8 translate-x-8`} />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-500 tracking-wide uppercase">
              {title}
            </CardTitle>
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient}`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
              <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
            </div>
            {trend !== undefined && (
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                trend >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                <span>{trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}