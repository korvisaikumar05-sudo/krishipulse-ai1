import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import type { WeatherSummary } from "@/types";

interface RainfallChartProps {
  weather: WeatherSummary;
}

export default function RainfallChart({ weather }: RainfallChartProps) {
  const data = weather.dates.map((date, i) => ({
    date: date.slice(5),
    rainfall: weather.daily_precipitation[i] ?? 0,
    temp: weather.daily_temp_max[i] ?? 0,
  }));

  return (
    <div className="card-lg p-5">
      <h3 className="font-display font-bold text-charcoal text-lg mb-4">7-Day Forecast Breakdown</h3>
      <div className="space-y-6">
        <div>
          <div className="text-xs font-medium text-water mb-2 flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-water inline-block" />
            Daily Rainfall (mm)
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DCFCE7" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#1F2937" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#1F2937" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid #DCFCE7",
                  fontSize: "0.8rem",
                }}
              />
              <Bar dataKey="rainfall" fill="#2563EB" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <div className="text-xs font-medium text-amber-dark mb-2 flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber inline-block" />
            Daily Max Temperature (°C)
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#DCFCE7" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#1F2937" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#1F2937" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid #DCFCE7",
                  fontSize: "0.8rem",
                }}
              />
              <Area
                type="monotone"
                dataKey="temp"
                stroke="#F59E0B"
                strokeWidth={2}
                fill="url(#tempGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
