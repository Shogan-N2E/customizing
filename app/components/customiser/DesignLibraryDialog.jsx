import { CakeSlice, Disc3, ImageIcon, Map, MessageCircle, PawPrint, Smile, Star, TreePine, Type, X, Hash } from "lucide-react";

const designFolders = [
  { name: "Basic Shapes", icon: MessageCircle, color: "text-gray-800" }, { name: "Hot", icon: Star, color: "text-red-500" },
  { name: "Emojis", icon: Smile, color: "text-yellow-400" }, { name: "Alphabet", icon: Type, color: "text-green-600" },
  { name: "Flags & Country", icon: Map, color: "text-sky-500" }, { name: "Numbers", icon: Hash, color: "text-amber-600" },
  { name: "Celebration", icon: CakeSlice, color: "text-pink-400" }, { name: "Animals", icon: PawPrint, color: "text-gray-800" },
  { name: "Music", icon: Disc3, color: "text-black" }, { name: "Illustration", icon: ImageIcon, color: "text-indigo-500" },
  { name: "Masterpiece", icon: ImageIcon, color: "text-amber-800" }, { name: "Organic", icon: TreePine, color: "text-green-500" },
];

export default function DesignLibraryDialog({ onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/25 p-5 backdrop-blur-[1px]" role="dialog" aria-modal="true" aria-label="Provided designs and graphics" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="relative flex h-[min(900px,calc(100vh-40px))] w-[min(1320px,calc(100vw-40px))] flex-col overflow-hidden rounded-[24px] bg-white px-9 py-12 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-5 top-4 rounded-full p-2 text-black transition hover:bg-gray-100" aria-label="Close design library"><X className="h-8 w-8" strokeWidth={3} /></button>
        <h2 className="pr-12 text-3xl font-black tracking-tight text-black md:text-4xl">Try using the provided <span className="text-[#ff747a]">designs</span> and <span className="text-[#ff747a]">graphics</span></h2>
        <div className="mt-14 grid flex-1 grid-cols-2 content-start gap-x-12 gap-y-10 overflow-y-auto px-2 pb-2 sm:grid-cols-3 lg:grid-cols-4">
          {designFolders.map((folder, index) => {
            const FolderIcon = folder.icon;
            return (
              <button key={folder.name} type="button" className="group rounded-xl text-center focus:outline-none focus:ring-4 focus:ring-purple-200">
                <div className="relative mx-auto aspect-[1.35] w-full max-w-[220px] transition-transform duration-200 group-hover:-translate-y-1 group-hover:drop-shadow-lg">
                  <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 220 163" aria-hidden="true">
                    <path d="M2 2H84L110 28H218V161H2Z" transform="translate(10 1)" fill="#ead7f1" stroke="#c28fd1" strokeWidth="1.5" />
                    <path d="M2 2H84L110 28H218V161H2Z" transform="translate(5 7)" fill="#ff7a7f" stroke="#111827" strokeWidth="2" />
                  </svg>
                  <svg className="absolute inset-0 z-10 h-full w-full" viewBox="0 0 220 163" aria-hidden="true"><path d="M2 2H84L110 28H218V161H2Z" fill="white" stroke="#111827" strokeWidth="2.5" strokeLinejoin="round" /></svg>
                  <div className="relative z-20 flex h-full w-full items-center justify-center pt-3"><FolderIcon className={`h-16 w-16 ${folder.color}`} strokeWidth={index === 3 ? 3 : 2.4} /></div>
                </div>
                <p className={`mt-5 text-base font-black ${index === 0 ? "text-[#ff747a]" : "text-black"}`}>{folder.name}</p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
