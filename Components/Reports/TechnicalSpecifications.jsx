import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, HardDrive, Zap, Shield, Code, Cloud } from "lucide-react";

export default function TechnicalSpecifications() {
  const specs = [
    {
      category: 'AI/ML Models',
      icon: Cpu,
      color: 'text-violet-600',
      items: [
        { label: 'Model Architecture', value: 'Random Forest Ensemble' },
        { label: 'Feature Engineering', value: '42 derived parameters' },
        { label: 'Training Dataset Size', value: '2.4M+ samples' },
        { label: 'Model Update Frequency', value: 'Weekly retraining' },
        { label: 'Inference Latency', value: '<50ms per prediction' },
        { label: 'Supported Fault Types', value: '12 categories' }
      ]
    },
    {
      category: 'Data Infrastructure',
      icon: HardDrive,
      color: 'text-blue-600',
      items: [
        { label: 'Time-Series Database', value: 'Optimized columnar storage' },
        { label: 'Data Retention', value: '2 years historical data' },
        { label: 'Sampling Rate', value: '3-second intervals' },
        { label: 'Data Points per Day', value: '~28.8K per site' },
        { label: 'Compression Ratio', value: '8:1 average' },
        { label: 'Query Performance', value: '<100ms for 90th percentile' }
      ]
    },
    {
      category: 'Performance Metrics',
      icon: Zap,
      color: 'text-amber-600',
      items: [
        { label: 'System Uptime', value: '99.8% (last 90 days)' },
        { label: 'Average Response Time', value: '12 minutes' },
        { label: 'False Alarm Rate', value: '5-8%' },
        { label: 'Detection Accuracy', value: '85-90% F1 score' },
        { label: 'Early Warning Lead Time', value: '28-35 minutes average' },
        { label: 'Sites Monitored', value: '14 active installations' }
      ]
    },
    {
      category: 'Security & Compliance',
      icon: Shield,
      color: 'text-red-600',
      items: [
        { label: 'Authentication', value: 'Multi-factor (MFA)' },
        { label: 'Encryption', value: 'AES-256 at rest, TLS 1.3 in transit' },
        { label: 'Access Control', value: 'Role-based (RBAC)' },
        { label: 'Audit Logging', value: 'Comprehensive event tracking' },
        { label: 'Compliance', value: 'NERC CIP alignment' },
        { label: 'Intrusion Detection', value: 'Real-time monitoring' }
      ]
    },
    {
      category: 'Integration & APIs',
      icon: Code,
      color: 'text-emerald-600',
      items: [
        { label: 'SCADA Protocols', value: 'DNP3, Modbus, IEC 61850' },
        { label: 'RESTful API', value: 'OpenAPI 3.0 specification' },
        { label: 'Webhooks', value: 'Event-driven notifications' },
        { label: 'Data Export', value: 'CSV, JSON, Parquet formats' },
        { label: 'Third-Party Integration', value: 'EMS, DMS, CMMS systems' },
        { label: 'Real-Time Streaming', value: 'WebSocket connections' }
      ]
    },
    {
      category: 'Deployment & Scalability',
      icon: Cloud,
      color: 'text-indigo-600',
      items: [
        { label: 'Deployment Model', value: 'Cloud-native (multi-region)' },
        { label: 'Containerization', value: 'Docker/Kubernetes' },
        { label: 'Auto-Scaling', value: 'Dynamic resource allocation' },
        { label: 'Load Balancing', value: 'Multi-instance distribution' },
        { label: 'Disaster Recovery', value: 'RPO <1hr, RTO <4hr' },
        { label: 'Capacity', value: 'Supports 500+ sites' }
      ]
    }
  ];

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Technical Specifications
          </CardTitle>
          <Badge className="bg-violet-100 text-violet-700">v2.4.1-production</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {specs.map((spec, idx) => (
            <div key={idx} className="space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <spec.icon className={`w-5 h-5 ${spec.color}`} />
                <h4 className="font-semibold text-slate-900">{spec.category}</h4>
              </div>
              <div className="space-y-2">
                {spec.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="flex justify-between items-start text-sm p-2 rounded bg-slate-50">
                    <span className="text-slate-600 font-medium">{item.label}</span>
                    <span className="text-slate-900 text-right ml-4">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}