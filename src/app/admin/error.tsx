"use client";
export default function Error({ reset }: { reset: () => void }) { return <main className="admin-empty"><h1>We couldn’t load this page.</h1><p>Check that your local database is running, then try again.</p><button className="admin-button" onClick={reset}>Try again</button></main>; }
