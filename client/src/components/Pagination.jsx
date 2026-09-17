export default function Pagination({ page, totalPages, onChange }) {
  return (
    <div className="flex items-center justify-center gap-3 mt-4 text-sm">
      <button
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40"
      >
        Previous
      </button>
      <span>Page {page} of {totalPages}</span>
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
