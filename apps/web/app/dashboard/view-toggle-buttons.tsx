"use client";

import { RefreshCw, BarChart3, List } from "lucide-react";
import { useState } from "react";

type ViewMode = "list" | "chart";

interface ViewToggleButtonsProps {
  onRefresh?: () => void;
  onViewChange?: (view: ViewMode) => void;
}

export function ViewToggleButtons({ onRefresh, onViewChange }: ViewToggleButtonsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
        // Small delay for visual feedback
        setTimeout(() => setIsRefreshing(false), 500);
      } catch (error) {
        setIsRefreshing(false);
      }
    } else {
      // Default behavior: reload the page
      window.location.reload();
    }
  };

  const handleViewChange = (view: ViewMode) => {
    setViewMode(view);
    if (onViewChange) {
      onViewChange(view);
    }
  };

  return (
    <div className="hidden md:flex gap-2 ml-auto">
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Refresh data"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
      </button>
      <button
        onClick={() => handleViewChange("chart")}
        className={`px-3 py-2 border rounded-lg transition-colors ${
          viewMode === "chart"
            ? "border-primary-700 bg-primary-50 text-primary-700"
            : "border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
        title="Chart view"
      >
        <BarChart3 className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleViewChange("list")}
        className={`px-3 py-2 border rounded-lg transition-colors ${
          viewMode === "list"
            ? "border-primary-700 bg-primary-50 text-primary-700"
            : "border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
        title="List view"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  );
}

