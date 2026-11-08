import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  style?: ViewStyle;
}

const sizeMap = {
  sm: { width: 120, height: 120 },
  md: { width: 180, height: 180 },
  lg: { width: 240, height: 240 },
  xl: { width: 320, height: 320 },
};

// Swiss red color
const SWISS_RED = "#FF0000";
// Light beige background
const LIGHT_BEIGE = "#F5F5DC";
// Dark blue for the building
const DARK_BLUE = "#1E3A8A";

export function Logo({ size = "md", style }: LogoProps) {
  const dimensions = sizeMap[size];
  const { width, height } = dimensions;

  // Calculate proportions (2/3 for red section, 1/3 for beige section)
  const redSectionHeight = (height * 2) / 3;
  const beigeSectionHeight = height / 3;

  // Cross dimensions (Swiss flag proportions)
  const crossWidth = width * 0.3;
  const crossArmWidth = crossWidth * 0.2;
  const crossArmLength = crossWidth * 0.6;

  // Building dimensions
  const buildingWidth = width * 0.3;
  const buildingHeight = beigeSectionHeight * 0.3;
  const columnWidth = width * 0.02;
  const pedimentHeight = beigeSectionHeight * 0.15;

  return (
    <View style={[{ width, height }, style]}>
      {/* Red section with Swiss cross (top 2/3) */}
      <View
        style={[
          styles.redSection,
          {
            width,
            height: redSectionHeight,
          },
        ]}
      >
        {/* Swiss cross - vertical bar */}
        <View
          style={[
            styles.crossVertical,
            {
              width: crossArmWidth,
              height: crossArmLength,
              left: (width - crossArmWidth) / 2,
              top: (redSectionHeight - crossArmLength) / 2,
            },
          ]}
        />

        {/* Swiss cross - horizontal bar */}
        <View
          style={[
            styles.crossHorizontal,
            {
              width: crossArmLength,
              height: crossArmWidth,
              left: (width - crossArmLength) / 2,
              top: (redSectionHeight - crossArmWidth) / 2,
            },
          ]}
        />
      </View>

      {/* Beige section (bottom 1/3) */}
      <View
        style={[
          styles.beigeSection,
          {
            width,
            height: beigeSectionHeight,
          },
        ]}
      >
        {/* Bank building - centered */}
        <View
          style={[
            styles.buildingContainer,
            {
              width: buildingWidth,
              height: buildingHeight + pedimentHeight,
            },
          ]}
        >
          {/* Triangular pediment (roof) - using border trick for triangle */}
          <View
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: buildingWidth / 2,
              borderRightWidth: buildingWidth / 2,
              borderBottomWidth: pedimentHeight,
              borderLeftColor: "transparent",
              borderRightColor: "transparent",
              borderBottomColor: DARK_BLUE,
              marginBottom: -1, // Overlap with building base
            }}
          />

          {/* Building base */}
          <View
            style={[
              styles.buildingBase,
              {
                width: buildingWidth,
                height: buildingHeight,
              },
            ]}
          >
            {/* Left column */}
            <View
              style={[
                styles.column,
                {
                  width: columnWidth,
                  height: buildingHeight * 0.83,
                  left: 0,
                },
              ]}
            />

            {/* Center column (shorter) */}
            <View
              style={[
                styles.column,
                {
                  width: columnWidth,
                  height: buildingHeight * 0.67,
                  left: (buildingWidth - columnWidth) / 2,
                },
              ]}
            />

            {/* Right column */}
            <View
              style={[
                styles.column,
                {
                  width: columnWidth,
                  height: buildingHeight * 0.83,
                  right: 0,
                },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  redSection: {
    backgroundColor: SWISS_RED,
    position: "relative",
  },
  crossVertical: {
    backgroundColor: "#FFFFFF",
    position: "absolute",
  },
  crossHorizontal: {
    backgroundColor: "#FFFFFF",
    position: "absolute",
  },
  beigeSection: {
    backgroundColor: LIGHT_BEIGE,
    alignItems: "center",
    justifyContent: "center",
  },
  buildingContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  pediment: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
  },
  buildingBase: {
    backgroundColor: DARK_BLUE,
    position: "relative",
  },
  column: {
    backgroundColor: DARK_BLUE,
    position: "absolute",
    bottom: 0,
  },
});

