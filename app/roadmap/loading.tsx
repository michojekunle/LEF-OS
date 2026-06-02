export default function Loading() {
  return (
    <div className="mx-auto max-w-content space-y-8 px-5 py-10 md:px-6">
      <div className="skeleton h-3 w-24" />
      <div className="skeleton h-10 w-2/3" />
      <div className="card flex gap-1 p-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-10 flex-1 rounded" />
        ))}
      </div>
      <div className="card skeleton h-32 p-6" />
      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card skeleton h-12" />
        ))}
      </div>
    </div>
  );
}
