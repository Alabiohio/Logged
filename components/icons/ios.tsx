import React from "react";

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
}

function createMaterialIcon(symbolCode: string) {
  return function MaterialIcon({ className = "", style, ...props }: IconProps) {
    return (
      <span
        className={`material-symbols-outlined select-none inline-block ${className}`}
        style={{
          fontSize: "1.25em",
          width: "1em",
          height: "1em",
          lineHeight: 1,
          fontWeight: 700,
          fontVariationSettings: "'wght' 700",
          ...style,
        }}
        {...props}
      >
        {symbolCode}
      </span>
    );
  };
}

export const ChevronLeft = createMaterialIcon("\uE2EA");
export const RefreshCw = createMaterialIcon("\uE5D5");
export const Clock = createMaterialIcon("\uE8B5");
export const TerminalSquare = createMaterialIcon("\uEB8E");
export const Loader2 = function Loader2Icon({ className = "", style, ...props }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined select-none inline-block animate-spin ${className}`}
      style={{
        fontSize: "1.25em",
        width: "1em",
        height: "1em",
        lineHeight: 1,
        fontWeight: 700,
        fontVariationSettings: "'wght' 700",
        ...style,
      }}
      {...props}
    >
      {"\uE9D0"}
    </span>
  );
};
export const SearchX = createMaterialIcon("\uEA76");
export const ChevronRight = createMaterialIcon("\uE5CC");
export const ChevronDown = createMaterialIcon("\uE313");
export const Maximize2 = createMaterialIcon("\uF1CE");
export const ShieldX = createMaterialIcon("\uE2C5");
export const Search = createMaterialIcon("\uE8B6");
export const X = createMaterialIcon("\uE5CD");
export const SlidersHorizontal = createMaterialIcon("\uE429");
