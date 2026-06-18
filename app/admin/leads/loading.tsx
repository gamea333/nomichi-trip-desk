export default function LeadsLoading() {
  return (
    <div className="p-6 md:p-8">
      <div className="skeleton-shimmer mb-6 h-8 w-32 rounded" />
      <div className="admin-card space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-10 w-full rounded" />
        ))}
      </div>
    </div>
  );
}
