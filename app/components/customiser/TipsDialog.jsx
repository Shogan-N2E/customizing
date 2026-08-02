import { Image, PenTool, Star, Type, X } from "lucide-react";

const tips = [
  { title: "Upload Image", description: "Start designing your own fashion by uploading your artwork, calligraphy and photographs.", label: "Image", icon: Image, kind: "image" },
  { title: "Insert Text", description: "Insert your own slogans, initials or special dates on the t-shirts with our free fonts.", label: "Text", icon: Type, kind: "text" },
  { title: "Design Sticker", description: "Try our free stickers to create easy custom t-shirts.", label: "Design", icon: PenTool, kind: "design" },
];

export default function TipsDialog({ onClose, onUpload, onInsertText, onOpenDesign }) {
  const runAction = (kind) => {
    if (kind === "image") onUpload();
    else if (kind === "text") onInsertText();
    else onOpenDesign();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/25 p-5 backdrop-blur-[1px]" role="dialog" aria-modal="true" aria-label="Customising tips" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="relative flex h-[min(800px,calc(100vh-40px))] w-[min(1120px,calc(100vw-40px))] flex-col overflow-y-auto rounded-[22px] bg-white px-10 py-12 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-5 top-4 rounded-full p-2 text-black transition hover:bg-gray-100" aria-label="Close tips"><X className="h-7 w-7" strokeWidth={3} /></button>
        <h2 className="text-3xl font-black tracking-tight text-black">Check your <span className="text-[#ff747a]">Tips</span></h2>
        <div className="mt-11 grid grid-cols-1 gap-10 md:grid-cols-3">
          {tips.map((tip) => {
            const TipIcon = tip.icon;
            return (
              <article key={tip.kind} className="flex flex-col items-center text-center">
                <button type="button" onClick={() => runAction(tip.kind)} className="rounded-full bg-[#ff686f] px-7 py-2 text-base font-black text-black transition hover:bg-[#f2555d]">{tip.title}</button>
                <p className="mt-4 min-h-[44px] max-w-[280px] text-sm leading-5 text-black">{tip.description}</p>
                <div className="relative mt-5 flex h-48 w-48 items-center justify-center overflow-hidden">
                  <img src="/assets/tshirt-mockup.png" alt="T-shirt design example" className="h-full w-full object-contain" />
                  <div className="absolute left-1/2 top-[52%] flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-dashed border-gray-400 bg-white/70">
                    {tip.kind === "image" && <div className="h-9 w-9 rounded-full border-4 border-purple-500 border-t-amber-400" />}
                    {tip.kind === "text" && <span className="text-lg font-black">Text</span>}
                    {tip.kind === "design" && <Star className="h-9 w-9 text-orange-400" />}
                  </div>
                </div>
                <button type="button" onClick={() => runAction(tip.kind)} className="mt-3 flex flex-col items-center gap-1 text-xs text-black">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ead7f8] shadow-md transition hover:scale-105"><TipIcon className="h-7 w-7" /></span>{tip.label}
                </button>
              </article>
            );
          })}
        </div>
        <ul className="mt-auto list-disc space-y-1 px-5 pt-10 text-sm leading-5 text-black">
          <li>High-definition PNG or JPG images with RGB colour mode are recommended; 300 dpi gives the best result.</li>
          <li>Enlarging a small original image can reduce print quality.</li>
          <li>Actual print colours can differ slightly depending on the monitor or phone.</li>
          <li>Check the guide to confirm the required image size for the product.</li>
          <li>Neon, gold, silver, glow-in-the-dark and reflective colours cannot overlap in print.</li>
        </ul>
      </section>
    </div>
  );
}
