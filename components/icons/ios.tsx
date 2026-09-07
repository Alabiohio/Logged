import React from "react";

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
}

function createMaterialIcon(symbolName: string) {
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
        {symbolName}
      </span>
    );
  };
}

export const ArrowLeft = createMaterialIcon("arrow_back_ios_new");
export const RefreshCw = createMaterialIcon("refresh");
export const Clock = createMaterialIcon("schedule");
export const TerminalSquare = createMaterialIcon("terminal");
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
      progress_activity
    </span>
  );
};
export const SearchX = createMaterialIcon("search_off");
export const ChevronRight = createMaterialIcon("chevron_right");
export const ChevronDown = createMaterialIcon("keyboard_arrow_down");
export const Maximize2 = createMaterialIcon("open_in_full");
export const ShieldX = createMaterialIcon("security_update_warning");
export const Search = createMaterialIcon("search");
export const X = createMaterialIcon("close");
export const SlidersHorizontal = createMaterialIcon("tune");
