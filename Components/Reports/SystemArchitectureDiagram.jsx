import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Brain, Wifi, Shield, Activity, Zap, ArrowRight } from "lucide-react";

export default function SystemArchitectureDiagram() {
  const layers = [
    {
      name: 'Data Collection Layer',
      color: 'from-blue-500 to-blue-600',
      icon: Wifi,
      components: [
        'SCADA RTUs',
        'Telemetry Sensors',
        'Network Monitors',
        'Equipment Controllers'
      ]
    },
    {
      name: 'Data Processing Layer',
      color: 'from-emerald-500 to-emerald-600',
      icon: Database,
      components: [
        'Time-Series Database',
        'Real-Time Ingestion',
        'Data Validation',
        'Historical Storage'
      ]
    },
    {
      name: 'AI/ML Layer',
      color: 'from-violet-500 to-violet-600',
      icon: Brain,
      components: [
        'Anomaly Detection',
        'Fault Classification',
        'Prediction Models',
        'Pattern Recognition'
      ]
    },
    {
      name: 'Decision Support Layer',
      color: 'from-amber-500 to-amber-600',
      icon: Activity,
      components: [
        'Risk Assessment',
        'Maintenance Planning',
        'Alert Prioritization',
        'Cost Optimization'
      ]
    },
    {
      name: 'Security & Monitoring',
      color: 'from-red-500 to-red-600',
      icon: Shield,
      components: [
        'Access Control',
        'Intrusion Detection',
        'Audit Logging',
        'Compliance Tracking'
      ]
    }
  ];

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <Zap className="w-5 h-5 text-violet-600" />
          System Architecture Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {layers.map((layer, index) => (
            <div key={index}>
              <div className={`p-4 rounded-lg bg-gradient-to-r ${layer.color} text-white`}>
                <div className="flex items-center gap-3 mb-3">
                  <layer.icon className="w-5 h-5" />
                  <h4 className="font-semibold">{layer.name}</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {layer.components.map((comp, idx) => (
                    <div key={idx} className="px-3 py-1.5 bg-white/20 rounded text-sm backdrop-blur-sm">
                      {comp}
                    </div>
                  ))}
                </div>
              </div>
              {index < layers.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowRight className="w-5 h-5 text-slate-400 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <h4 className="font-semibold text-slate-900 mb-3">Key Capabilities</h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-blue-50">
              <p className="font-medium text-blue-900 mb-1">Real-Time Processing</p>
              <p className="text-blue-700">3-second telemetry intervals with sub-second anomaly detection</p>
            </div>
            <div className="p-3 rounded-lg bg-violet-50">
              <p className="font-medium text-violet-900 mb-1">Multi-Model Ensemble</p>
              <p className="text-violet-700">6 specialized detectors for comprehensive coverage</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50">
              <p className="font-medium text-emerald-900 mb-1">Predictive Analytics</p>
              <p className="text-emerald-700">30+ minute average early warning lead time</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}