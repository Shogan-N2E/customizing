import { CloudUpload, X } from "lucide-react";

export default function UserLibraryDialog({ onClose, onUpload }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/25 p-5 backdrop-blur-[1px]" role="dialog" aria-modal="true" aria-label="Your library" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="relative flex h-[min(800px,calc(100vh-40px))] w-[min(1120px,calc(100vw-40px))] flex-col rounded-[22px] bg-white px-12 py-14 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-5 top-4 rounded-full p-2 text-black transition hover:bg-gray-100" aria-label="Close library"><X className="h-7 w-7" strokeWidth={3} /></button>
        <h2 className="text-3xl font-black tracking-tight text-black">Take a look at your <span className="text-[#ff747a]">Library</span></h2>
        <div className="flex flex-1 flex-col items-center justify-center pb-12">
          <div className="flex h-48 w-48 items-center justify-center rounded-full border-4 border-gray-300 text-black"><CloudUpload className="h-24 w-24" strokeWidth={1.6} /></div>
          <p className="mt-5 text-2xl font-black text-black">Your Library is Empty</p>
          <button type="button" onClick={onUpload} className="mt-48 min-w-[365px] rounded-full bg-[#ff686f] px-8 py-3 text-2xl font-black text-black shadow-sm transition hover:bg-[#f2555d] focus:outline-none focus:ring-4 focus:ring-red-200">Upload Your Design</button>
        </div>
      </section>
    </div>
  );
}
