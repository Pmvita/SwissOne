"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { AnimatedCard } from "@/components/ui/animated";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils/format";

interface PortfolioOverviewProps {
  totalValue: number;
  assetClassBreakdown: Record<string, number>;
  holdings: any[];
  portfolios: any[];
}

// Asset type to display name mapping
const ASSET_TYPE_LABELS: Record<string, string> = {
  equity: "Equities & ETFs",
  etf: "Equities & ETFs",
  bond: "Cash & Fixed Income",
  money_market: "Cash & Fixed Income",
  cash: "Cash & Fixed Income",
};

// Alpine palette chart segments (no purple)
const COLORS = {
  "Cash & Fixed Income": "#A67C52", // brass
  "Equities & ETFs": "#9B1B2E", // alpine
  "Private Equity": "#3A4658", // slate
  "Other": "#C5CED6", // line
};

export function PortfolioOverview({ totalValue, assetClassBreakdown, holdings, portfolios }: PortfolioOverviewProps) {
  // Group holdings by asset class for pie chart
  const assetClassMap: Record<string, number> = {};
  
  for (const [assetType, value] of Object.entries(assetClassBreakdown)) {
    const label = ASSET_TYPE_LABELS[assetType] || "Other";
    assetClassMap[label] = (assetClassMap[label] || 0) + value;
  }

  // Prepare pie chart data
  const pieData = Object.entries(assetClassMap).map(([name, value]) => ({
    name,
    value: Math.round(value),
    percentage: totalValue > 0 ? Math.round((value / totalValue) * 100) : 0,
  }));

  // Calculate total for pie chart legend
  const cashFixedIncome = assetClassMap["Cash & Fixed Income"] || 0;
  const equitiesETFs = assetClassMap["Equities & ETFs"] || 0;

  // Illustrative path derived from current AUM (not live valuation_snapshots).
  // Prefer /api/portfolio/valuation when snapshot history is available.
  const performanceData = [
    { month: "Jan", value: totalValue * 0.92, benchmark: totalValue * 0.94 },
    { month: "Feb", value: totalValue * 0.94, benchmark: totalValue * 0.96 },
    { month: "Mar", value: totalValue * 0.96, benchmark: totalValue * 0.98 },
    { month: "Apr", value: totalValue * 0.98, benchmark: totalValue * 1.00 },
    { month: "May", value: totalValue * 1.00, benchmark: totalValue * 1.02 },
    { month: "Jun", value: totalValue * 1.02, benchmark: totalValue * 1.04 },
    { month: "Jul", value: totalValue * 1.04, benchmark: totalValue * 1.06 },
    { month: "Aug", value: totalValue * 1.06, benchmark: totalValue * 1.08 },
    { month: "Sep", value: totalValue * 1.08, benchmark: totalValue * 1.10 },
    { month: "Oct", value: totalValue * 1.10, benchmark: totalValue * 1.12 },
    { month: "Nov", value: totalValue * 1.12, benchmark: totalValue * 1.14 },
    { month: "Dec", value: totalValue, benchmark: totalValue * 1.16 },
  ];

  return (
    <div className="space-y-6">
      {/* Pie Chart and Performance Graph */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {/* Pie Chart */}
        <AnimatedCard className="p-4 md:p-6">
          <div className="mb-6">
            <h3 className="font-display text-xl md:text-2xl text-ink mb-1">Asset Allocation</h3>
            <p className="text-sm text-slate">Portfolio distribution by asset class</p>
          </div>
          
          <div className="flex flex-col items-center gap-6 md:gap-8">
            {/* Pie Chart */}
            <div className="w-full flex-shrink-0 flex flex-col items-center gap-4">
              <div className="w-full max-w-[280px]">
                <ResponsiveContainer width="100%" aspect={1}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={95}
                      innerRadius={35}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Other} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number | undefined) => formatCurrency(value ?? 0, "USD")}
                      contentStyle={{
                        backgroundColor: "#F7FAFC",
                        border: "1px solid #C5CED6",
                        borderRadius: "6px",
                        padding: "8px 12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Percentage Summary below chart */}
              <div className="flex flex-wrap justify-center gap-4">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded flex-shrink-0"
                      style={{ backgroundColor: COLORS[item.name as keyof typeof COLORS] || COLORS.Other }}
                    />
                    <span className="text-sm font-semibold text-ink">{item.percentage}%</span>
                    <span className="text-sm text-slate">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Legend with enhanced styling */}
            <div className="w-full space-y-3">
              {pieData.map((item) => {
                const color = COLORS[item.name as keyof typeof COLORS] || COLORS.Other;
                return (
                  <div 
                    key={item.name} 
                    className="flex items-center justify-between p-3 bg-glacier/60 rounded-md hover:bg-glacier transition-colors group gap-3"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-5 h-5 rounded flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-base font-semibold text-ink truncate">{item.name}</p>
                        <p className="text-xs text-slate mt-0.5">{item.percentage}% of portfolio</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 min-w-[100px]">
                      <p className="text-xs md:text-sm font-bold text-ink">
                        {formatCurrencyCompact(item.value, "USD")}
                      </p>
                    </div>
                  </div>
                );
              })}
              
              {/* Total Summary */}
              <div className="mt-4 pt-4 border-t border-line">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate">Total Portfolio Value</span>
                  <span className="text-sm md:text-base font-bold text-ink">{formatCurrencyCompact(totalValue, "USD")}</span>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Performance Graph */}
        <AnimatedCard className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg md:text-xl text-ink">Portfolio Performance (illustrative)</h3>
            <span className="text-xs text-slate">Past Year</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#C5CED6" />
              <XAxis 
                dataKey="month" 
                stroke="#3A4658"
                style={{ fontSize: "12px" }}
              />
              <YAxis 
                stroke="#3A4658"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip 
                formatter={(value: number | undefined) => formatCurrency(value ?? 0, "USD")}
                labelStyle={{ color: "#0B1220" }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#9B1B2E" 
                strokeWidth={2}
                name="Portfolio"
                dot={{ r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="benchmark" 
                stroke="#A67C52" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Benchmark"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-between text-sm">
            <div>
              <p className="text-slate">Past Year Return</p>
              <p className="text-xl font-display text-ink">+12.3%</p>
            </div>
            <div className="text-right">
              <p className="text-slate">Past Year Value</p>
              <p className="text-xl font-display text-alpine">+$185M</p>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
}

