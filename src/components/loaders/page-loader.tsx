import { LoadingIndicator } from "@/components/loaders/loading-indicator";

type PageLoaderProps = {
  label?: string;
  showLabel?: boolean;
};

export function PageLoader({
  label = "Loading page",
  showLabel = true,
}: PageLoaderProps) {
  return (
    <main className="page-loader" aria-busy="true">
      <LoadingIndicator
        label={label}
        showLabel={showLabel}
        size="large"
      />
    </main>
  );
}
