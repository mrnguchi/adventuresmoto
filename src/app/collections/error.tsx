"use client";
export default function Error({ reset }: { reset: () => void }) {
  return <main className="site-container store-empty"><h1>We couldn’t load this collection</h1><p>Please try again in a moment.</p><button onClick={reset}>Try again</button></main>;
}
