type Props = {
  ErrorCode?: number;
  ErrorMessage?: string;
};

export default function MyError({ ErrorCode, ErrorMessage }: Props) {
  const code = ErrorCode ?? 500;
  const msg = ErrorMessage ?? "Something went wrong.";

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-(--color-bg)">
      <div className="max-w-md w-full mx-4 p-8 rounded-2xl bg-white border-4 border-(--local-green-dark) shadow-2xl flex flex-col items-center gap-4 transition-all duration-300">
        {/* Big error code */}
        <h1 className="text-6xl font-extrabold text-(--local-green) tracking-tight">
          {code}
        </h1>

        {/* Title */}
        <h2 className="text-xl font-semibold">Oops, something went wrong</h2>

        {/* Message */}
        <p className="text-sm text-center max-w-sm">{msg}</p>

        {/* Divider */}
        <div className="w-full h-px bg-black rounded-full my-2" />

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg font-medium transition hover:scale-105 cursor-pointer"
          >
            Refresh
          </button>

          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 rounded-lg border-2 border-(--local-green-dark) font-medium transition hover:scale-105 cursor-pointer"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
