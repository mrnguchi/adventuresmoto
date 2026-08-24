import Image from "next/image";

export type LoaderSize = "small" | "medium" | "large";

type LoadingIndicatorProps = {
  label: string;
  showLabel?: boolean;
  size?: LoaderSize;
};

export function LoadingIndicator({
  label,
  showLabel = true,
  size = "medium",
}: LoadingIndicatorProps) {
  return (
    <div
      className={`loading-indicator loading-indicator--${size}`}
      role="status"
      aria-live="polite"
    >
      <Image
        className="loading-indicator-image"
        src="/images/loading.gif"
        alt=""
        width={200}
        height={200}
        unoptimized
      />
      <span className={showLabel ? "loading-indicator-label" : "sr-only"}>
        {label}
      </span>
    </div>
  );
}
