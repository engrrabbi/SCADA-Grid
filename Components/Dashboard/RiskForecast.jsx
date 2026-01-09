import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { format, addMinutes } from "date-fns";

const priorityColors = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-blue-500"
};

const confidenceColors = {
  very_high: "text-emerald-600 bg-emerald-50",
  high: "text-blue-600 bg-blue-50",
  medium: "text-amber-600 bg-amber-50",
  low: "text-slate-600 bg-slate-50"
};

export default function RiskForecast({ predictions, sites }) {
  const getSiteName = (siteId) => {
    const site = sites.find(s => s.site_id === siteId);
    return site?.name || siteId;
  };

  const getPriority = (probability) => {
    if (probability >= 0.8) return 'critical';
    if (probability >= 0.6) return 'high';
    if (probability >= 0.4) return 'medium';
    return 'low';
  };

  const sortedPredictions = [...predictions]
    .sort((a, b) => (b.fault_probability || 0) - (a.fault_probability || 0))
    .slice(0, 5);

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <CardTitle className="text-lg font-semibold text-slate-900">
            Risk Forecast (24-72h)
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {sortedPredictions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <TrendingUp className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p>No significant risks detected</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedPredictions.map((prediction, index) => (
              <motion.div
                key={prediction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${priorityColors[getPriority(prediction.fault_probability)]}`} />
                    <span className="font-medium text-slate-900">
                      {getSiteName(prediction.site_id)}
                    </span>
                  </div>
                  <Badge className={confidenceColors[prediction.confidence_level || 'medium']}>
                    {Math.round((prediction.fault_probability || 0) * 100)}% likely
                  </Badge>
                </div>
                <p className="text-sm text-slate-700 mb-2 capitalize">
                  {(prediction.predicted_fault_type || 'unknown').replace(/_/g, ' ')}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Est. {prediction.estimated_time_to_failure_min || 60} min to failure</span>
                  </div>
                </div>
                {prediction.contributing_factors?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {prediction.contributing_factors.slice(0, 3).map((factor, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                        {factor}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}