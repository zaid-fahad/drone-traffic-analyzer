export default function VideoPlayer({ src }) {
  return (
    <div className="glass-card overflow-hidden">
      {src ? (
        <video
          className="w-full max-h-[420px] bg-black object-contain"
          controls
          controlsList="nodownload"
          preload="metadata"
          src={src}
        />
      ) : (
        <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 p-10 text-slate-400">
          <span className="text-lg font-semibold text-slate-100">Processed video will appear here</span>
          <p className="max-w-prose text-center text-slate-400">Wait until the analyzer finishes processing your file.</p>
        </div>
      )}
    </div>
  );
}
