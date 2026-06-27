interface SkeletonProps {
  width?: string;
  height?: string;
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  className?: string;
}

export function Skeleton({
  width,
  height,
  rounded = "md",
  className = "",
}: SkeletonProps) {
  const roundedMap = {
    none: "rounded-none",
    sm: "rounded-sm",
    md: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
  };

  return (
    <div
      className={[
        "animate-pulse bg-gray-200",
        roundedMap[rounded],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        width: width ?? undefined,
        height: height ?? undefined,
      }}
      aria-hidden="true"
    />
  );
}
