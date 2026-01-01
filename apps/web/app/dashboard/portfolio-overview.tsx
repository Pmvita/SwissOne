"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { AnimatedCard } from "@/components/ui/animated";
import { formatCurrency } from "@/lib/utils/format";

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

// Colors for pie chart segments
const COLORS = {
  "Cash & Fixed Income": "#3B82F6", // Primary blue
  "Equities & ETFs": "#10B981", // Green
  "Private Equity": "#8B5CF6", // Purple
  "Other": "#6B7280", // Gray
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

  // Mock performance data (in real app, this would come from valuation_snapshots)
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
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1">Asset Allocation</h3>
            <p className="text-sm text-gray-600">Portfolio distribution by asset class</p>
          </div>
          
          <div className="flex flex-col xl:flex-row items-center gap-6 md:gap-8">
            {/* Pie Chart */}
            <div className="w-full xl:w-1/2 flex-shrink-0 flex justify-center">
              <div className="w-full max-w-[280px]">
                <ResponsiveContainer width="100%" aspect={1}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percentage }) => `${percentage}%`}
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
                      formatter={(value: number) => formatCurrency(value, "USD")}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #E5E7EB",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Legend with enhanced styling */}
            <div className="w-full xl:w-1/2 space-y-3">
              {pieData.map((item) => {
                const color = COLORS[item.name as keyof typeof COLORS] || COLORS.Other;
                return (
                  <div 
                    key={item.name} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group gap-3"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-5 h-5 rounded flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-base font-semibold text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{item.percentage}% of portfolio</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm md:text-base font-bold text-gray-900 break-words">
                        {formatCurrency(item.value, "USD")}
                      </p>
                    </div>
                  </div>
                );
              })}
              
              {/* Total Summary */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-sm font-semibold text-gray-700">Total Portfolio Value</span>
                  <span className="text-base md:text-lg font-bold text-gray-900 break-words">{formatCurrency(totalValue, "USD")}</span>
                </div>
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Performance Graph */}
        <AnimatedCard className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Portfolio Performance</h3>
            <span className="text-xs text-gray-600">Past Year</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="month" 
                stroke="#6B7280"
                style={{ fontSize: "12px" }}
              />
              <YAxis 
                stroke="#6B7280"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => `$${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value, "USD")}
                labelStyle={{ color: "#374151" }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Portfolio"
                dot={{ r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="benchmark" 
                stroke="#9CA3AF" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Benchmark"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-between text-sm">
            <div>
              <p className="text-gray-600">Past Year Return</p>
              <p className="text-xl font-bold text-gray-900">+12.3%</p>
            </div>
            <div className="text-right">
              <p className="text-gray-600">Past Year Value</p>
              <p className="text-xl font-bold text-green-600">+$185M</p>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
}

