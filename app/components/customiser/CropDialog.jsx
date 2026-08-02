import { X } from "lucide-react";

export default function CropDialog({ image, bounds, onBoundsChange, onApply, onClose }) {
  if (!image) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-5" role="dialog" aria-modal="true" aria-label="Crop image">
      <section className="w-[min(760px,calc(100vw-40px))] rounded-3xl bg-white p-7 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-black">Crop image</h2>
            <p className="mt-1 text-sm text-gray-500">Adjust the edges, then apply the crop to the selected image.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-gray-100" aria-label="Close crop editor">
            <X className="h-6 w-6" strokeWidth={3} />
          </button>
        </div>

        <div className="mt-6 grid gap-7 md:grid-cols-[1.1fr_0.9fr]">
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gray-900">
            <img
              src={image.src}
              alt="Crop preview"
              className="h-full w-full object-contain"
              style={{ clipPath: `inset(${bounds.top}% ${bounds.right}% ${bounds.bottom}% ${bounds.left}%)` }}
            />
            <div
              className="pointer-events-none absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.42)]"
              style={{ left: `${bounds.left}%`, right: `${bounds.right}%`, top: `${bounds.top}%`, bottom: `${bounds.bottom}%` }}
            />
          </div>
          <div className="space-y-5">
            {[["left", "Left"], ["right", "Right"], ["top", "Top"], ["bottom", "Bottom"]].map(([side, label]) => (
              <label key={side} className="block text-sm font-bold text-black">
                <span className="mb-2 flex justify-between"><span>{label}</span><span>{bounds[side]}%</span></span>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={bounds[side]}
                  onChange={(event) => onBoundsChange(side, Number(event.target.value))}
                  className="h-2 w-full cursor-pointer accent-[#ff686f]"
                />
              </label>
            ))}
            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
              Final size: {Math.round(100 - bounds.left - bounds.right)}% × {Math.round(100 - bounds.top - bounds.bottom)}%
            </div>
          </div>
        </div>
        <div className="mt-7 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full border-2 border-black px-6 py-2.5 font-black text-black hover:bg-gray-100">Cancel</button>
          <button type="button" onClick={onApply} className="rounded-full bg-[#ff686f] px-7 py-2.5 font-black text-black hover:bg-[#f2555d]">Apply crop</button>
        </div>
      </section>
    </div>
  );
}
