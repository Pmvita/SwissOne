"use client";

import { useState } from "react";
import { AnimatedCard } from "@/components/ui/animated";
import { AnimatedLinkButton } from "@/components/ui/animated/AnimatedLinkButton";
import { formatCurrency } from "@/lib/utils/format";
import { ChevronRight, ChevronDown } from "lucide-react";

interface PortfolioBreakdownProps {
  holdings: any[];
  portfolios: any[];
  totalAUM: number; // Total AUM (account balances) for percentage calculation
}

// Asset type to display name mapping
const ASSET_TYPE_LABELS: Record<string, string> = {
  equity: "Equities & ETFs",
  etf: "Equities & ETFs",
  bond: "Cash & Fixed Income",
  money_market: "Cash & Fixed Income",
  cash: "Cash & Fixed Income",
};

// Map holdings to asset classes and group them
function groupHoldingsByAssetClass(holdings: any[]) {
  const groups: Record<string, any[]> = {};
  
  for (const holding of holdings) {
    const assetType = holding.asset_type || "equity";
    const groupName = ASSET_TYPE_LABELS[assetType] || "Other";
    
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(holding);
  }
  
  return groups;
}

// Calculate estimated yield based on asset type (mock - in real app, this would come from market data)
function getEstimatedYield(assetType: string): number {
  switch (assetType) {
    case "money_market":
    case "cash":
      return 5.0;
    case "bond":
      return 6.0;
    case "etf":
      return 7.0;
    case "equity":
      return 6.0;
    default:
      return 5.0;
  }
}

export function PortfolioBreakdown({ holdings, portfolios, totalAUM }: PortfolioBreakdownProps) {
  const groupedHoldings = groupHoldingsByAssetClass(holdings);
  
  // Get all group names for state initialization
  const groupNames = Object.keys(groupedHoldings);
  const initialExpandedState = Object.fromEntries(
    groupNames.map(name => [name, false]) // Start collapsed on mobile
  );
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(initialExpandedState);
  const [showAllHoldings, setShowAllHoldings] = useState<Record<string, boolean>>({});
  const [expandedHoldings, setExpandedHoldings] = useState<Record<string, boolean>>({});
  
  // Calculate total holdings value for normalization
  let totalHoldingsValue = 0;
  for (const holding of holdings) {
    const value = Number(holding.quantity || 0) * Number(holding.current_price || 0);
    totalHoldingsValue += value;
  }
  
  // Calculate normalization factor to map holdings to AUM allocation
  const normalizationFactor = totalHoldingsValue > 0 && totalAUM > 0
    ? totalAUM / totalHoldingsValue
    : 1;
  
  // Calculate totals for each asset class (normalized to AUM allocation)
  const assetClassTotals: Record<string, number> = {};
  const assetClassPercentages: Record<string, number> = {};
  
  for (const [groupName, groupHoldings] of Object.entries(groupedHoldings)) {
    // Calculate normalized group total (allocation of AUM)
    const groupTotal = groupHoldings.reduce((sum, h) => {
      const rawValue = Number(h.quantity || 0) * Number(h.current_price || 0);
      return sum + (rawValue * normalizationFactor);
    }, 0);
    
    assetClassTotals[groupName] = groupTotal;
    assetClassPercentages[groupName] = totalAUM > 0 ? (groupTotal / totalAUM) * 100 : 0;
  }

  // Sort asset classes by value (largest first)
  const sortedGroups = Object.entries(groupedHoldings).sort((a, b) => {
    return (assetClassTotals[b[0]] || 0) - (assetClassTotals[a[0]] || 0);
  });

  const toggleSection = (groupName: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const toggleShowAllHoldings = (groupName: string) => {
    setShowAllHoldings(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const toggleHoldingDetails = (holdingId: string) => {
    setExpandedHoldings(prev => ({
      ...prev,
      [holdingId]: !prev[holdingId]
    }));
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900">Portfolio Breakdown</h2>
      {sortedGroups.map(([groupName, groupHoldings]) => {
        const total = assetClassTotals[groupName] || 0;
        const percentage = assetClassPercentages[groupName] || 0;
        
        // Get unique holdings by name (in real app, might want to group similar holdings)
        const uniqueHoldings = groupHoldings.reduce((acc, holding) => {
          const key = holding.name || holding.symbol;
          if (!acc[key]) {
            acc[key] = holding;
          } else {
            // If duplicate name, merge quantities
            acc[key] = {
              ...acc[key],
              quantity: Number(acc[key].quantity || 0) + Number(holding.quantity || 0),
            };
          }
          return acc;
        }, {} as Record<string, any>);

        const holdingsList: any[] = Object.values(uniqueHoldings);
        
        const isExpanded = expandedSections[groupName] ?? true; // Default to expanded on desktop (lg+ screens)
        
        return (
          <AnimatedCard key={groupName} className="p-4 md:p-6">
            {/* Mobile collapsible header */}
            <button
              onClick={() => toggleSection(groupName)}
              className="w-full flex items-center justify-between mb-4 lg:hidden"
            >
              <div className="text-left">
                <h3 className="text-base font-semibold text-gray-900">
                  {groupName} ({Math.round(percentage)}%) {formatCurrency(total, "USD")}
                </h3>
              </div>
              <div>
                {expandedSections[groupName] ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </button>
            
            {/* Desktop heading (always visible) */}
            <div className="hidden lg:block mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {groupName} ({Math.round(percentage)}%) {formatCurrency(total, "USD")}
              </h3>
            </div>
            
            <div className={`space-y-3 md:space-y-4 ${!isExpanded ? 'hidden lg:block' : ''}`}>
              {(showAllHoldings[groupName] ? holdingsList : holdingsList.slice(0, 3)).map((holding: any, index: number) => {
                // Calculate raw holding value
                const rawValue = Number(holding.quantity || 0) * Number(holding.current_price || 0);
                
                // Normalize to show allocation of AUM, not raw holdings value
                // normalizationFactor is calculated once at component level
                const normalizedValue = rawValue * normalizationFactor;
                
                const yieldPercent = getEstimatedYield(holding.asset_type || "equity");
                const holdingId = holding.id || `${holding.symbol}-${index}`;
                const isExpanded = expandedHoldings[holdingId] || false;
                const purchaseValue = Number(holding.quantity || 0) * Number(holding.purchase_price || 0);
                const gainLoss = rawValue - purchaseValue;
                const gainLossPercent = purchaseValue > 0 ? ((gainLoss / purchaseValue) * 100) : 0;
                
                return (
                  <div key={holdingId}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between p-3 md:p-4 bg-gray-50 rounded-lg gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm md:text-base text-gray-900 truncate">{holding.name || holding.symbol}</p>
                        <p className="text-xs md:text-sm text-gray-600 mt-0.5">Est. {yieldPercent.toFixed(2)}% Yield</p>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-sm md:text-base text-gray-900">{formatCurrency(normalizedValue, holding.currency || "USD")}</p>
                        </div>
                        <button 
                          onClick={() => toggleHoldingDetails(holdingId)}
                          className="px-3 py-1.5 text-xs md:text-sm font-medium text-primary-700 hover:text-primary-900 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors whitespace-nowrap"
                        >
                          {isExpanded ? "Hide Details" : "Details"}
                        </button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="mt-2 p-4 bg-white border border-gray-200 rounded-lg space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Symbol</p>
                            <p className="font-medium text-gray-900">{holding.symbol || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Quantity</p>
                            <p className="font-medium text-gray-900">{Number(holding.quantity || 0).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Current Price</p>
                            <p className="font-medium text-gray-900">{formatCurrency(Number(holding.current_price || 0), holding.currency || "USD")}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Purchase Price</p>
                            <p className="font-medium text-gray-900">{formatCurrency(Number(holding.purchase_price || 0), holding.currency || "USD")}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Current Value (Raw)</p>
                            <p className="font-medium text-gray-900">{formatCurrency(rawValue, holding.currency || "USD")}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Purchase Value</p>
                            <p className="font-medium text-gray-900">{formatCurrency(purchaseValue, holding.currency || "USD")}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Gain/Loss</p>
                            <p className={`font-medium ${gainLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {gainLoss >= 0 ? "+" : ""}{formatCurrency(gainLoss, holding.currency || "USD")} ({gainLossPercent >= 0 ? "+" : ""}{gainLossPercent.toFixed(2)}%)
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Estimated Yield</p>
                            <p className="font-medium text-gray-900">{yieldPercent.toFixed(2)}%</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 md:mt-6 pt-4 border-t border-gray-200">
              <button 
                onClick={() => toggleShowAllHoldings(groupName)}
                className="w-full px-4 py-2 text-sm font-medium text-primary-700 hover:text-primary-900 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors"
              >
                {showAllHoldings[groupName] 
                  ? "Show Less Holdings"
                  : `View ${groupName === "Equities & ETFs" ? "Holdings & Performance" : "Growth & Performance"}`
                }
              </button>
            </div>
          </AnimatedCard>
        );
      })}
    </div>
  );
}

