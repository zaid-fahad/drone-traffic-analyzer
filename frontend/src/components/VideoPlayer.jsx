import Card from "./Card";

export default function VideoPlayer({ src }) {
  return (
    <Card>
      {src ? (
        <video
          className="w-full rounded-lg bg-black"
          controls
          controlsList="nodownload"
          preload="metadata"
          src={src}
          style={{ maxHeight: "400px" }}
        />
      ) : (
        <div className="flex items-center justify-center py-16 text-center">
          <div className="space-y-3">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l.707.707A1 1 0 0012.414 11H15m-3 7.5A9.5 9.5 0 1121.5 12 9.5 9.5 0 0112 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-medium">Video will appear here</p>
              <p className="text-slate-400 text-sm">Wait until processing is complete</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
