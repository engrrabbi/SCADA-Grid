import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Zap, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Fault injection configurations
const FAULT_SCENARIOS = {
  overvoltage: { voltage_kv: [130, 145], duration: 30 },
  undervoltage: { voltage_kv: [95, 105], duration: 25 },
  frequency_drift: { frequency_hz: [58.5, 59.3], duration: 20 },
  harmonic_spike: { thd_pct: [10, 18], duration: 15 },
  inverter_overheat: { inverter_temp_c: [85, 105], duration: 45 },
  scada_latency: { latency_ms: [200, 500], packet_loss_pct: [2, 8], duration: 30 },
  dc_instability: { dc_link_voltage_v: [400, 550], duration: 25 }
};

const generateNormalReading = (siteId) => ({
  site_id: siteId,
  timestamp: new Date().toISOString(),
  voltage_kv: 118 + Math.random() * 6,
  current_a: 280 + Math.random() * 60,
  frequency_hz: 59.9 + Math.random() * 0.2,
  power_kw: 3500 + Math.random() * 500,
  energy_kwh: 180000 + Math.random() * 5000,
  power_factor: 0.94 + Math.random() * 0.05,
  inverter_temp_c: 55 + Math.random() * 15,
  dc_link_voltage_v: 650 + Math.random() * 50,
  breaker_status: 'CLOSED',
  relay_event: 'NONE',
  latency_ms: 15 + Math.random() * 25,
  packet_loss_pct: Math.random() * 0.3,
  thd_pct: 2 + Math.random() * 2,
  irradiance_wm2: 800 + Math.random() * 200
});

const injectFault = (reading, faultType) => {
  const scenario = FAULT_SCENARIOS[faultType];
  if (!scenario) return reading;
  
  const faultyReading = { ...reading };
  Object.entries(scenario).forEach(([key, range]) => {
    if (key !== 'duration' && Array.isArray(range)) {
      faultyReading[key] = range[0] + Math.random() * (range[1] - range[0]);
    }
  });
  return faultyReading;
};

export default function TelemetrySimulator({ sites, onNewReading, onFaultInjected }) {
  const [isRunning, setIsRunning] = useState(false);
  const [activeFault, setActiveFault] = useState(null);
  const [faultCountdown, setFaultCountdown] = useState(0);
  const [readingsCount, setReadingsCount] = useState(0);
  const [autoFaultMode, setAutoFaultMode] = useState(false);

  const generateReading = useCallback(async () => {
    if (!sites.length) return;
    
    const site = sites[Math.floor(Math.random() * sites.length)];
    let reading = generateNormalReading(site.site_id);
    
    if (activeFault && faultCountdown > 0) {
      reading = injectFault(reading, activeFault);
    }
    
    try {
      const saved = await base44.entities.TelemetryReading.create(reading);
      setReadingsCount(prev => prev + 1);
      onNewReading?.(saved);
    } catch (err) {
      console.error('Failed to save telemetry:', err);
    }
  }, [sites, activeFault, faultCountdown, onNewReading]);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(generateReading, 3000);
    }
    return () => clearInterval(interval);
  }, [isRunning, generateReading]);

  useEffect(() => {
    if (faultCountdown > 0) {
      const timer = setTimeout(() => setFaultCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (activeFault) {
      setActiveFault(null);
    }
  }, [faultCountdown, activeFault]);

  useEffect(() => {
    if (autoFaultMode && isRunning && !activeFault) {
      const randomTrigger = setTimeout(() => {
        const faultTypes = Object.keys(FAULT_SCENARIOS);
        const randomFault = faultTypes[Math.floor(Math.random() * faultTypes.length)];
        triggerFault(randomFault);
      }, 15000 + Math.random() * 30000);
      return () => clearTimeout(randomTrigger);
    }
  }, [autoFaultMode, isRunning, activeFault]);

  const triggerFault = async (faultType) => {
    const scenario = FAULT_SCENARIOS[faultType];
    setActiveFault(faultType);
    setFaultCountdown(scenario.duration);
    
    if (sites.length > 0) {
      const site = sites[Math.floor(Math.random() * sites.length)];
      try {
        await base44.entities.Fault.create({
          fault_id: `F-${Date.now()}`,
          site_id: site.site_id,
          fault_type: faultType,
          severity: ['overvoltage', 'inverter_overheat', 'scada_latency'].includes(faultType) ? 'high' : 'medium',
          start_timestamp: new Date().toISOString(),
          trigger_condition: `Simulated ${faultType} event`,
          observable_symptoms: getSymptoms(faultType),
          status: 'active',
          detected_by_ai: Math.random() > 0.3
        });
        onFaultInjected?.(faultType, site);
      } catch (err) {
        console.error('Failed to log fault:', err);
      }
    }
  };

  const getSymptoms = (faultType) => {
    const symptomsMap = {
      overvoltage: ['Voltage spike detected', 'Inverter protection triggered', 'Grid instability warning'],
      undervoltage: ['Power output drop', 'Relay chatter observed', 'Brownout conditions'],
      frequency_drift: ['Frequency deviation', 'Protection relay warning', 'Grid sync issues'],
      harmonic_spike: ['THD threshold exceeded', 'Power quality degradation', 'Capacitor stress'],
      inverter_overheat: ['Temperature alarm', 'Output derating active', 'Cooling system stress'],
      scada_latency: ['Communication delay', 'Command execution lag', 'Packet loss detected'],
      dc_instability: ['DC ripple variance', 'MPPT oscillation', 'String imbalance']
    };
    return symptomsMap[faultType] || ['Anomaly detected'];
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <CardHeader className="border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <CardTitle className="text-lg font-semibold">SCADA Telemetry Simulator</CardTitle>
          </div>
          <Badge variant="outline" className="border-slate-600 text-slate-300">
            {readingsCount} readings
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            className={isRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}
          >
            {isRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isRunning ? 'Pause' : 'Start'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setReadingsCount(0);
              setActiveFault(null);
              setFaultCountdown(0);
            }}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="auto-fault"
            checked={autoFaultMode}
            onCheckedChange={setAutoFaultMode}
          />
          <Label htmlFor="auto-fault" className="text-slate-300">Auto-inject random faults</Label>
        </div>

        {activeFault && (
          <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-red-300 font-medium capitalize">
                  {activeFault.replace(/_/g, ' ')} Active
                </span>
              </div>
              <Badge className="bg-red-500/30 text-red-300">{faultCountdown}s remaining</Badge>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {Object.keys(FAULT_SCENARIOS).slice(0, 6).map(faultType => (
            <Button
              key={faultType}
              variant="outline"
              size="sm"
              onClick={() => triggerFault(faultType)}
              disabled={!!activeFault}
              className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs capitalize"
            >
              <Zap className="w-3 h-3 mr-1" />
              {faultType.replace(/_/g, ' ')}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}