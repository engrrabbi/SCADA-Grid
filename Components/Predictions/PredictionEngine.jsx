import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, RefreshCw, Sparkles, Target } from "lucide-react";
import { motion } from "framer-motion";

// Simplified ML simulation - in production would use actual ML models
const DETECTION_RULES = {
  overvoltage: (readings) => {
    const recent = readings.slice(-5);
    const avgVoltage = recent.reduce((sum, r) => sum + (r.voltage_kv || 0), 0) / recent.length;
    return avgVoltage > 124 ? { prob: 0.85, ttf: 25 } : null;
  },
  undervoltage: (readings) => {
    const recent = readings.slice(-5);
    const avgVoltage = recent.reduce((sum, r) => sum + (r.voltage_kv || 0), 0) / recent.length;
    return avgVoltage < 112 ? { prob: 0.78, ttf: 30 } : null;
  },
  frequency_drift: (readings) => {
    const recent = readings.slice(-5);
    const avgFreq = recent.reduce((sum, r) => sum + (r.frequency_hz || 60), 0) / recent.length;
    return (avgFreq < 59.6 || avgFreq > 60.4) ? { prob: 0.72, ttf: 20 } : null;
  },
  inverter_overheat: (readings) => {
    const recent = readings.slice(-5);
    const avgTemp = recent.reduce((sum, r) => sum + (r.inverter_temp_c || 0), 0) / recent.length;
    if (avgTemp > 80) return { prob: 0.92, ttf: 15 };
    if (avgTemp > 72) return { prob: 0.65, ttf: 45 };
    return null;
  },
  scada_latency: (readings) => {
    const recent = readings.slice(-5);
    const avgLatency = recent.reduce((sum, r) => sum + (r.latency_ms || 0), 0) / recent.length;
    return avgLatency > 150 ? { prob: 0.75, ttf: 35 } : null;
  },
  harmonic_spike: (readings) => {
    const recent = readings.slice(-5);
    const avgThd = recent.reduce((sum, r) => sum + (r.thd_pct || 0), 0) / recent.length;
    return avgThd > 7 ? { prob: 0.68, ttf: 40 } : null;
  }
};

export default function PredictionEngine({ telemetryData, sites, onPredictionGenerated }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const [predictionsGenerated, setPredictionsGenerated] = useState(0);
  const [modelVersion] = useState('v2.4.1-rf-ensemble');

  const runPredictionCycle = async () => {
    setIsAnalyzing(true);
    
    // Group telemetry by site
    const siteReadings = {};
    telemetryData.forEach(reading => {
      if (!siteReadings[reading.site_id]) {
        siteReadings[reading.site_id] = [];
      }
      siteReadings[reading.site_id].push(reading);
    });

    const predictions = [];

    for (const [siteId, readings] of Object.entries(siteReadings)) {
      if (readings.length < 3) continue;

      for (const [faultType, detector] of Object.entries(DETECTION_RULES)) {
        const result = detector(readings);
        if (result && result.prob > 0.5) {
          const confidence = result.prob >= 0.85 ? 'very_high' : 
                            result.prob >= 0.7 ? 'high' : 
                            result.prob >= 0.5 ? 'medium' : 'low';
          
          const prediction = {
            site_id: siteId,
            timestamp: new Date().toISOString(),
            predicted_fault_type: faultType,
            fault_probability: result.prob,
            estimated_time_to_failure_min: result.ttf,
            confidence_level: confidence,
            contributing_factors: getContributingFactors(faultType, readings),
            model_version: modelVersion
          };

          try {
            const saved = await base44.entities.Prediction.create(prediction);
            predictions.push(saved);
            setPredictionsGenerated(prev => prev + 1);
          } catch (err) {
            console.error('Failed to save prediction:', err);
          }
        }
      }
    }

    setLastAnalysis(new Date());
    setIsAnalyzing(false);
    onPredictionGenerated?.(predictions);
  };

  const getContributingFactors = (faultType, readings) => {
    const factors = {
      overvoltage: ['Rising voltage trend', 'Grid instability detected', 'Load imbalance'],
      undervoltage: ['Voltage drop trend', 'High load conditions', 'Transformer tap position'],
      frequency_drift: ['Generation-load mismatch', 'Interconnection stress', 'Governor response delay'],
      inverter_overheat: ['Ambient temperature rise', 'Reduced cooling efficiency', 'High power throughput'],
      scada_latency: ['Network congestion', 'RTU response delay', 'Packet queue buildup'],
      harmonic_spike: ['Non-linear load increase', 'Filter degradation', 'Resonance conditions']
    };
    return factors[faultType] || ['Anomaly pattern detected'];
  };

  useEffect(() => {
    // Auto-run prediction every 30 seconds if we have data
    if (telemetryData.length > 0) {
      const interval = setInterval(runPredictionCycle, 30000);
      return () => clearInterval(interval);
    }
  }, [telemetryData]);

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-violet-900 to-indigo-900 text-white">
      <CardHeader className="border-b border-violet-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/20">
              <Brain className="w-5 h-5 text-violet-300" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">AI Prediction Engine</CardTitle>
              <p className="text-xs text-violet-300 mt-0.5">{modelVersion}</p>
            </div>
          </div>
          <Badge className="bg-violet-500/30 text-violet-200 border-violet-500/50">
            {predictionsGenerated} predictions
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-xs text-violet-300 mb-1">Models Active</p>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold">6 Detectors</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <p className="text-xs text-violet-300 mb-1">Last Analysis</p>
            <p className="font-semibold">
              {lastAnalysis ? lastAnalysis.toLocaleTimeString() : 'Not run'}
            </p>
          </div>
        </div>

        <Button
          onClick={runPredictionCycle}
          disabled={isAnalyzing || telemetryData.length === 0}
          className="w-full bg-violet-500 hover:bg-violet-600"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Run Prediction Cycle
            </>
          )}
        </Button>

        <div className="space-y-2">
          <p className="text-xs text-violet-300 font-medium">Detection Capabilities:</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(DETECTION_RULES).map(rule => (
              <Badge 
                key={rule}
                variant="outline" 
                className="border-violet-500/50 text-violet-200 text-xs capitalize"
              >
                {rule.replace(/_/g, ' ')}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}