import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

const severityColors = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-blue-500"
};

export default function FaultTimeline({ faults, sites }) {
  const getSiteName = (siteId) => {
    const site = sites.find(s => s.site_id === siteId);
    return site?.name || siteId;
  };

  const sortedFaults = [...faults]
    .sort((a, b) => new Date(b.start_timestamp || b.created_date) - new Date(a.start_timestamp || a.created_date))
    .slice(0, 15);

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-lg font-semibold text-slate-900">
          Fault Timeline (Last 7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative max-h-[500px] overflow-y-auto">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200" />
          <div className="p-4 space-y-4">
            {sortedFaults.map((fault, index) => (
              <div key={fault.id} className="relative pl-8">
                <div className={`absolute left-[26px] w-4 h-4 rounded-full border-2 border-white ${severityColors[fault.severity || 'medium']}`} />
                <div className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {fault.status === 'resolved' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="font-medium text-slate-900 capitalize">
                        {(fault.fault_type || 'unknown').replace(/_/g, ' ')}
                      </span>
                    </div>
                    <Badge className="text-xs" variant="outline">
                      {fault.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">{getSiteName(fault.site_id)}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(fault.start_timestamp || fault.created_date), 'MMM d, HH:mm')}
                    </div>
                    {fault.detected_by_ai && (
                      <Badge className="bg-violet-50 text-violet-700 text-xs">AI</Badge>
                    )}
                    {fault.detection_lead_time_min && (
                      <span className="text-emerald-600 font-medium">
                        +{fault.detection_lead_time_min}min lead
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}