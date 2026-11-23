export function Spinner({ className = 'h-6 w-6' }) {
  return <span className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent ${className}`} />;
}

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-primary">
      <Spinner className="h-10 w-10" />
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`} />;
}

export function CardSkeletons({ count = 3, className = 'h-80' }) {
  return Array.from({ length: count }).map((_, i) => <Skeleton key={i} className={className} />);
}
