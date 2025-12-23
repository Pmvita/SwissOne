import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const sizeMap = {
  sm: { width: 120, height: 120 },
  md: { width: 180, height: 180 },
  lg: { width: 240, height: 240 },
  xl: { width: 320, height: 320 },
  "2xl": { width: 300, height: 300 },
};

export function Logo({ className = "", size = "md" }: LogoProps) {
  const dimensions = sizeMap[size];
  const { width, height } = dimensions;

  // Swiss red color
  const swissRed = "#FF0000";
  // Light beige background
  const lightBeige = "#F5F5DC";
  // Dark blue for the building
  const darkBlue = "#1E3A8A";

  // Calculate proportions (2/3 for red section, 1/3 for beige section)
  const redSectionHeight = (height * 2) / 3;
  const beigeSectionHeight = height / 3;

  // Cross dimensions (Swiss flag proportions)
  const crossWidth = width * 0.3;
  const crossArmWidth = crossWidth * 0.2;
  const crossArmLength = crossWidth * 0.6;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      role="img"
      aria-label="SwissOne Logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Red section with Swiss cross (top 2/3) */}
      <rect
        width={width}
        height={redSectionHeight}
        fill={swissRed}
        rx={0}
      />

      {/* Swiss cross - vertical bar */}
      <rect
        x={(width - crossArmWidth) / 2}
        y={(redSectionHeight - crossArmLength) / 2}
        width={crossArmWidth}
        height={crossArmLength}
        fill="white"
      />

      {/* Swiss cross - horizontal bar */}
      <rect
        x={(width - crossArmLength) / 2}
        y={(redSectionHeight - crossArmWidth) / 2}
        width={crossArmLength}
        height={crossArmWidth}
        fill="white"
      />

      {/* Beige section (bottom 1/3) */}
      <rect
        y={redSectionHeight}
        width={width}
        height={beigeSectionHeight}
        fill={lightBeige}
        rx={0}
      />

      {/* Bank building icon - centered in beige section */}
      <g transform={`translate(${width / 2}, ${redSectionHeight + beigeSectionHeight / 2})`}>
        {/* Building base */}
        <rect
          x={-width * 0.15}
          y={-beigeSectionHeight * 0.15}
          width={width * 0.3}
          height={beigeSectionHeight * 0.3}
          fill={darkBlue}
        />

        {/* Columns */}
        <rect
          x={-width * 0.15}
          y={-beigeSectionHeight * 0.15}
          width={width * 0.02}
          height={beigeSectionHeight * 0.25}
          fill={darkBlue}
        />
        <rect
          x={width * 0.13}
          y={-beigeSectionHeight * 0.15}
          width={width * 0.02}
          height={beigeSectionHeight * 0.25}
          fill={darkBlue}
        />

        {/* Triangular pediment (roof) */}
        <path
          d={`M ${-width * 0.15} ${-beigeSectionHeight * 0.15} L 0 ${-beigeSectionHeight * 0.3} L ${width * 0.15} ${-beigeSectionHeight * 0.15} Z`}
          fill={darkBlue}
        />

        {/* Center column (shorter) */}
        <rect
          x={-width * 0.01}
          y={-beigeSectionHeight * 0.1}
          width={width * 0.02}
          height={beigeSectionHeight * 0.2}
          fill={darkBlue}
        />
      </g>
    </svg>
  );
}

