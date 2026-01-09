import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wrench, Clock, DollarSign, AlertCircle, CheckCircle2, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const priorityStyles = {
  critical: "bg-red-50 border-red-200 text-red-700",
  high: "bg-orange-50 border-orange-200 text-orange-700",
  medium: "bg-amber-50 border-amber-200 text-amber-700",
  low: "bg-blue-50 border-blue-200 text-blue-700"
};

const statusStyles = {
  pending: "bg-slate-100 text-slate-700",
  scheduled: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
  deferred: "bg-slate-100 text-slate-500"
};

export default function MaintenanceRecommendations({ actions, sites, onStatusUpdate }) {
  const getSiteName = (siteId) => {
    const site = sites.find(s => s.site_id === siteId);
    return site?.name || siteId;
  };

  const sortedActions = [...actions]
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
    });

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-slate-700" />
            <CardTitle className="text-lg font-semibold text-slate-900">
              Maintenance Recommendations
            </CardTitle>
          </div>
          <Badge variant="outline" className="bg-slate-50">
            {actions.filter(a => a.status === 'pending').length} Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
          {sortedActions.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-400" />
              <p>No pending maintenance actions</p>
            </div>
          ) : (
            sortedActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={priorityStyles[action.priority]}>
                        {action.priority}
                      </Badge>
                      <Badge className={statusStyles[action.status || 'pending']}>
                        {(action.status || 'pending').replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <p className="font-medium text-slate-900">{action.recommended_action}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{getSiteName(action.site_id)}</p>
                  </div>
                </div>

                {action.justification?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-slate-500 mb-1">Justification:</p>
                    <ul className="space-y-1">
                      {action.justification.map((reason, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <AlertCircle className="w-3 h-3 mt-1 text-amber-500 flex-shrink-0" />
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                  {action.estimated_downtime_if_ignored_hr && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{action.estimated_downtime_if_ignored_hr}h potential downtime</span>
                    </div>
                  )}
                  {action.estimated_repair_cost_usd && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      <span>${action.estimated_repair_cost_usd.toLocaleString()} est. cost</span>
                    </div>
                  )}
                </div>

                {action.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStatusUpdate?.(action.id, 'scheduled')}
                      className="text-xs"
                    >
                      <Calendar className="w-3 h-3 mr-1" />
                      Schedule
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => onStatusUpdate?.(action.id, 'in_progress')}
                      className="text-xs bg-blue-600 hover:bg-blue-700"
                    >
                      Start Work
                    </Button>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}