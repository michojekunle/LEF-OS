export default function Loading() {
  return (
    <div className="mx-auto max-w-content px-5 md:px-6 py-10 space-y-8">
      <div className="h-3 w-24 skeleton" />
      <div className="h-10 w-2/3 skeleton" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card p-4">
            <div className="h-3 w-16 skeleton mb-3" />
            <div className="h-7 w-12 skeleton" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card p-5">
            <div className="h-3 w-32 skeleton mb-3" />
            <div className="h-5 w-3/4 skeleton mb-2" />
            <div className="h-5 w-1/2 skeleton" />
          </div>
        ))}
      </div>
    </div>
  );
}
