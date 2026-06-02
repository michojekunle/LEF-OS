export default function Loading() {
  return (
    <div className="mx-auto max-w-content px-5 md:px-6 py-10 space-y-8">
      <div className="h-3 w-24 skeleton" />
      <div className="h-10 w-2/3 skeleton" />
      <div className="card p-1.5 flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-10 flex-1 skeleton rounded" />
        ))}
      </div>
      <div className="card p-6 h-32 skeleton" />
      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card h-12 skeleton" />
        ))}
      </div>
    </div>
  );
}
