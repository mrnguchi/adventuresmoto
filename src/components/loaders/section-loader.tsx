import {
  LoadingIndicator,
  type LoaderSize,
} from "@/components/loaders/loading-indicator";

type SectionLoaderProps = {
  compact?: boolean;
  label?: string;
  showLabel?: boolean;
  size?: LoaderSize;
};

export function SectionLoader({
  compact = false,
  label = "Loading content",
  showLabel = true,
  size = "medium",
}: SectionLoaderProps) {
  return (
    <div
      className={`section-loader ${compact ? "section-loader--compact" : ""}`}
      aria-busy="true"
    >
      <LoadingIndicator
        label={label}
        showLabel={showLabel}
        size={size}
      />
    </div>
  );
}
