import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const sizeMap = {
  sm: { width: 40, height: 40 },
  md: { width: 64, height: 64 },
  lg: { width: 96, height: 96 },
  xl: { width: 128, height: 128 },
  "2xl": { width: 160, height: 160 },
};

export function Logo({ className = "", size = "md" }: LogoProps) {
  const dimensions = sizeMap[size];
  const { width, height } = dimensions;

  // Alpine Swiss red (design system)
  const swissRed = "#9B1B2E";
  // Glacier / snow field
  const lightBeige = "#E8EEF2";
  // Ink for the building
  const darkBlue = "#0B1220";

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

