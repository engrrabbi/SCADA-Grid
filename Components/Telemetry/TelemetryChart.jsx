import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

const metricConfig = {
  voltage_kv: { label: 'Voltage (kV)', color: '#3b82f6', normalRange: [110, 125] },
  current_a: { label: 'Current (A)', color: '#10b981', normalRange: [0, 400] },
  frequency_hz: { label: 'Frequency (Hz)', color: '#8b5cf6', normalRange: [59.5, 60.5] },
  power_kw: { label: 'Power (kW)', color: '#f59e0b', normalRange: [0, 5000] },
  inverter_temp_c: { label: 'Inverter Temp (°C)', color: '#ef4444', normalRange: [20, 75] },
  latency_ms: { label: 'SCADA Latency (ms)', color: '#ec4899', normalRange: [0, 100] }
};

export default function TelemetryChart({ data, metric = 'voltage_kv', title }) {
  const config = metricConfig[metric] || metricConfig.voltage_kv;
  
  const chartData = data.map(reading => ({
    time: reading.timestamp,
    value: reading[metric],
    label: format(new Date(reading.timestamp), 'HH:mm:ss')
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg p-3">
        <p className="text-xs text-slate-500 mb-1">{label}</p>
        <p className="font-semibold text-slate-900">
          {payload[0].value?.toFixed(2)} {config.label.split('(')[1]?.replace(')', '') || ''}
        </p>
      </div>
    );
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-700">
          {title || config.label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={{ stroke: '#e2e8f0' }}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              {config.normalRange && (
                <>
                  <ReferenceLine y={config.normalRange[0]} stroke="#22c55e" strokeDasharray="5 5" strokeOpacity={0.5} />
                  <ReferenceLine y={config.normalRange[1]} stroke="#ef4444" strokeDasharray="5 5" strokeOpacity={0.5} />
                </>
              )}
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={config.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: config.color }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}