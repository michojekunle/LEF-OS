export default function Loading() {
  return (
    <div className="mx-auto max-w-content space-y-8 px-5 py-10 md:px-6">
      <div className="skeleton h-3 w-24" />
      <div className="skeleton h-10 w-2/3" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card p-4">
            <div className="skeleton mb-3 h-3 w-16" />
            <div className="skeleton h-7 w-12" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card p-5">
            <div className="skeleton mb-3 h-3 w-32" />
            <div className="skeleton mb-2 h-5 w-3/4" />
            <div className="skeleton h-5 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
