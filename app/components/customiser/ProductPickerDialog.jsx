import { ChevronDown, Heart, Share, SlidersHorizontal, Star, X } from "lucide-react";

export default function ProductPickerDialog({ categories, selectedCategory, onCategoryChange, products, onSelectProduct, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/25 p-5 backdrop-blur-[1px]" role="dialog" aria-modal="true" aria-label="Choose a T-shirt" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="relative flex h-[min(800px,calc(100vh-40px))] w-[min(1120px,calc(100vw-40px))] flex-col overflow-hidden rounded-[22px] bg-white p-7 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-5 top-4 rounded-full p-2 text-black transition hover:bg-gray-100" aria-label="Close product picker"><X className="h-7 w-7" strokeWidth={3} /></button>
        <div className="pr-12">
          <div className="flex items-end gap-3"><h2 className="text-3xl font-black tracking-tight text-black">Try customizing</h2><button type="button" className="mb-0.5 flex items-center gap-1 border-b-2 border-[#f87171] pb-0.5 text-3xl font-black text-[#f87171]">T-Shirts <ChevronDown className="h-5 w-5 text-black" /></button></div>
          <p className="mt-1 text-xs font-semibold text-gray-400">Your current design will remain unchanged</p>
        </div>
        <div className="mt-5 flex items-center justify-between gap-5 border-y border-gray-100 py-3">
          <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
            {categories.slice(0, 7).map((category) => <button key={category} type="button" onClick={() => onCategoryChange(category)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${selectedCategory === category ? "border-[#c487d3] bg-[#c487d3] text-black" : "border-[#d8a9e1] bg-white text-gray-700 hover:bg-purple-50"}`}>{category}</button>)}
          </div>
          <div className="flex shrink-0 items-center gap-5 text-base font-bold text-black"><button type="button" className="flex items-center gap-2 hover:text-[#9d5aad]"><SlidersHorizontal className="h-5 w-5" /> Filter(0)</button><button type="button" className="flex items-center gap-1 hover:text-[#9d5aad]">High to Low <ChevronDown className="h-5 w-5 fill-current" /></button></div>
        </div>
        <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto py-5 md:grid-cols-3">
          {products.map((product) => (
            <button key={product.id} type="button" onClick={() => onSelectProduct(product)} className="group rounded-2xl p-2 text-left transition hover:bg-purple-50 focus:outline-none focus:ring-4 focus:ring-purple-200">
              <div className="relative flex h-[min(46vh,430px)] items-center justify-center overflow-hidden rounded-2xl bg-[#f1f1f1]"><span className="absolute right-3 top-3 rounded-full bg-[#ff7076] px-3 py-1 text-[10px] font-black text-black">Order from one</span><img src={product.image} alt={product.name} className={`h-[92%] w-[92%] object-contain transition duration-200 group-hover:scale-105 ${product.imageClass || ""}`} /></div>
              <div className="px-1 pt-2">
                <div className="flex items-center justify-between gap-2"><p className="truncate text-xl font-black text-black">{product.brand}</p><span className="flex items-center gap-2 text-black"><Share className="h-4 w-4" /><Heart className="h-4 w-4" /></span></div>
                <p className="truncate text-base font-extrabold text-black">{product.name}</p>
                <div className="mt-2 flex gap-2">{product.availableColors.slice(0, 6).map((colour) => <span key={colour.name} title={colour.name} className="h-4 w-4 rounded-full border border-black/10" style={{ backgroundColor: colour.hex }} />)}</div>
                <p className="mt-3 text-lg font-black text-black">{product.priceLabel}</p>
                <p className="mt-1 flex items-center gap-1 text-xs font-bold text-black"><Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-500" /> 4.8 ({product.reviewCount})</p>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
