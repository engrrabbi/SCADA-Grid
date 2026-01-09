import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const confidenceColors = {
  very_high: "bg-emerald-50 text-emerald-700 border-emerald-200",
  high: "bg-blue-50 text-blue-700 border-blue-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-50 text-slate-700 border-slate-200"
};

export default function PredictionsList({ predictions, sites, onCreateMaintenance }) {
  const getSiteName = (siteId) => {
    const site = sites.find(s => s.site_id === siteId);
    return site?.name || siteId;
  };

  const highRisk = predictions.filter(p => (p.fault_probability || 0) >= 0.7);
  const mediumRisk = predictions.filter(p => (p.fault_probability || 0) >= 0.5 && (p.fault_probability || 0) < 0.7);
  const lowRisk = predictions.filter(p => (p.fault_probability || 0) < 0.5);

  const renderPredictionGroup = (title, items, icon, color) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          {icon}
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <Badge className={color}>{items.length}</Badge>
        </div>
        <div className="space-y-3">
          {items.map((prediction, index) => (
            <motion.div
              key={prediction.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-lg border border-slate-200 bg-white hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-900">{getSiteName(prediction.site_id)}</span>
                    <Badge className={confidenceColors[prediction.confidence_level || 'medium']}>
                      {Math.round((prediction.fault_probability || 0) * 100)}% likely
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-700 capitalize mb-2">
                    {(prediction.predicted_fault_type || 'unknown').replace(/_/g, ' ')}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Est. {prediction.estimated_time_to_failure_min || 60} min to failure</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      <span>{prediction.confidence_level} confidence</span>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCreateMaintenance?.(prediction)}
                  className="ml-3"
                >
                  Create Task
                </Button>
              </div>
              {prediction.contributing_factors?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-slate-100">
                  {prediction.contributing_factors.map((factor, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">
                      {factor}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">
            All Predictions
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <Badge className="bg-red-50 text-red-700">
              {highRisk.length} Critical
            </Badge>
            <Badge className="bg-amber-50 text-amber-700">
              {mediumRisk.length} Medium
            </Badge>
            <Badge className="bg-slate-50 text-slate-700">
              {lowRisk.length} Low
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 max-h-[700px] overflow-y-auto">
        {predictions.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No predictions generated yet</p>
          </div>
        ) : (
          <>
            {renderPredictionGroup(
              "Critical Risk (≥70%)",
              highRisk,
              <AlertTriangle className="w-4 h-4 text-red-500" />,
              "bg-red-50 text-red-700"
            )}
            {renderPredictionGroup(
              "Medium Risk (50-69%)",
              mediumRisk,
              <AlertTriangle className="w-4 h-4 text-amber-500" />,
              "bg-amber-50 text-amber-700"
            )}
            {renderPredictionGroup(
              "Low Risk (<50%)",
              lowRisk,
              <TrendingUp className="w-4 h-4 text-blue-500" />,
              "bg-slate-50 text-slate-700"
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}