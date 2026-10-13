export default function InfoPanel({ answer, status, error, onPlaceSelect, placeLookupStatus, placeLookupMessage }) {
  return (
    <div className="h-full min-h-0 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 bg-white dark:bg-zinc-800 shadow-sm overflow-auto overscroll-contain p-4">
      <h2 className="text-base font-semibold mb-3">Nearby kebab places</h2>
      {status === "idle" ? <p className="text-sm text-zinc-500">Click a point on the map to search nearby.</p> : null}
      {status === "loading" ? <p className="text-sm text-zinc-500">Searching nearby places...</p> : null}
      {status === "error" ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      {status === "ready" ? (
        <div className="text-sm leading-relaxed">
          {answer.split("\n").map((line, index) => {
            const match = line.match(/^(\s*)(\d+)\.\s+\*\*(.+?)\*\*(.*)$/);
            if (!match) {
              return <div key={index} className={line ? "" : "h-3"}>{line}</div>;
            }

            const [, indentation, number, placeName, details] = match;
            return (
              <div key={index}>
                {indentation}
                <button
                  type="button"
                  disabled={placeLookupStatus === "loading"}
                  onClick={() => onPlaceSelect(placeName)}
                  aria-label={`Find ${placeName} on the map`}
                  className="font-semibold text-sky-700 underline underline-offset-2 hover:text-sky-900 disabled:cursor-wait disabled:opacity-50 dark:text-sky-300 dark:hover:text-sky-100"
                >
                  {number}.
                </button>{" "}
                <strong>{placeName}</strong>{details}
              </div>
            );
          })}
          {placeLookupStatus === "loading" ? (
            <p className="mt-3 text-zinc-500" role="status">Finding place address...</p>
          ) : null}
          {placeLookupMessage ? (
            <p
              className={`mt-3 ${placeLookupStatus === "error" ? "text-red-600 dark:text-red-400" : "text-zinc-500"}`}
              role="status"
            >
              {placeLookupMessage}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
