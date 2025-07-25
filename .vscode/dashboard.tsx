              <button
                className="flex flex-col items-center justify-center rounded-full border-2 border-black bg-white px-4 py-1 text-xs font-normal w-32 h-10"
                type="button"
              >
                <span>Bulk Order</span>
                <span>Price Policy</span>
              </button>
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Star, 
  Share, 
  Heart, 
  ArrowLeft, 
  Undo, 
  Redo, 
  Search, 
  ZoomOut, 
  Trash, 
  Copy, 
  Clipboard, 
  Layers, 
  Move, 
  Play,
  Check,
  ChevronDown,
  Download,
  ArrowRightLeft,
  Image,
  Type,
  PenTool,
  Shirt,
  Maximize,
  Folder,
  ShoppingCart,
  CreditCard,
  ArrowUp
} from "lucide-react";
import type { Product } from "@shared/schema";

const categories = [
  "All Products", "Apparel", "Accessories", "Fabric", "Goods", 
  "Living", "Pet", "Phone ACC", "Stationary", "Sticker", 
  "Sports", "Kids", "Tech& Digital"
];

const views = ["Front", "Back", "Right", "Left"];


const designTools = [
  { icon: ArrowRightLeft, label: "Change" },
  { icon: Image, label: "Image" },
  { icon: Type, label: "Text" },
  { icon: PenTool, label: "Design" },
  { icon: Maximize, label: "Layout Request" },
  { icon: Folder, label: "Library" }
];

export default function Dashboard() {
  const [selectedCategory, setSelectedCategory] = useState("Apparel");
  const [selectedColor, setSelectedColor] = useState("White");
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [selectedView, setSelectedView] = useState("Front");
  const [showPopup, setShowPopup] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  // 예시 레이어 데이터 (4개로 확장)
  const [layers, setLayers] = useState([
    {
      id: 1,
      type: "image",
      name: "Logo",
      visible: true,
      locked: false,
    },
    {
      id: 2,
      type: "text",
      name: "Text",
      visible: true,
      locked: false
    },
    {
      id: 3,
      type: "image",
      name: "Decoration",
      visible: true,
      locked: false
    },
    {
      id: 4,
      type: "text",
      name: "Slogan",
      visible: true,
      locked: false
    }
  ]);

  // 레이어의 visible 상태 토글 함수 (프론트엔드 전용)
  const toggleLayerVisible = (id: number) => {
    setLayers((prev) => prev.map(layer =>
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    ));
  };
  const [selectedLayerId, setSelectedLayerId] = useState<number|null>(null);
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const product = products?.[0]; // Using first product as main product

  const addToCartMutation = useMutation({
    mutationFn: async (cartData: any) => {
      const response = await apiRequest("POST", "/api/cart", cartData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      // No error toast
    },
  });

  const handleAddToCart = () => {
    if (!product) return;
    addToCartMutation.mutate({
      productId: product.id,
      selectedColor,
      selectedSize,
      quantity,
      customizations: {}
    });
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 1000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCartMutation.mutate({
      productId: product.id,
      selectedColor,
      selectedSize,
      quantity,
      customizations: {}
    });
    // No popup or toast
  };


  const calculatePrice = () => {
    if (!product) return "0.00";
    const basePrice = parseFloat(product.basePrice);
    return (basePrice * quantity).toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }



  return (
    <div className="h-screen flex flex-col bg-white font-inter overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
        <div className="flex items-center py-0.5 pr-4" style={{ minHeight: 48 }}>
          <div className="w-40 flex flex-col items-center justify-center h-14">
            <div className="flex-1 flex items-center justify-center">
              <div className="bg-purple-500 rounded-2xl px-4 py-1.5 shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer">
                <div className="flex items-center justify-center space-x-2">
                  <div className="text-white font-black text-xl tracking-wide">
                    FLAIR
                  </div>
                  <div className="text-white text-lg">✨</div>
                </div>
              </div>
            </div>
          </div>
          <nav className="flex-1 flex justify-between">
            {categories.map((category) => (
              <div
                key={category}
                className={`w-28 h-10 flex items-center justify-center rounded-full bg-white transition-all duration-150 ${
                  selectedCategory === category
                    ? "border-4 border-pink-400 shadow-pink-active" 
                    : "border-2 border-pink-300 shadow-pink-default"
                }`}
                style={{}}
              >
                <button
                  className={`w-full h-full flex items-center justify-center text-sm md:text-base font-semibold transition-colors rounded-full focus:outline-none truncate ${
                    selectedCategory === category
                      ? "bg-pink-400 text-white"
                      : "text-black bg-white hover:bg-pink-50"
                  }`}
                  onClick={() => setSelectedCategory(category)}
                  title={category}
                >
                  {category}
                </button>
              </div>
            ))}
          </nav>
        </div>
        {/* Toolbar */}
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-1 flex items-center min-h-0">
          <div className="flex items-center space-x-2">
            <Redo className="w-4 h-4 text-gray-600 cursor-pointer hover:text-purple-600 transition-colors" />
            <Search className="w-4 h-4 text-gray-600 cursor-pointer hover:text-purple-600 transition-colors" />
            <ZoomOut className="w-4 h-4 text-gray-600 cursor-pointer hover:text-purple-600 transition-colors" />
            <Trash className="w-4 h-4 text-gray-600 cursor-pointer hover:text-purple-600 transition-colors" />
            <Copy className="w-4 h-4 text-gray-600 cursor-pointer hover:text-purple-600 transition-colors" />
            <Clipboard className="w-4 h-4 text-gray-600 cursor-pointer hover:text-purple-600 transition-colors" />
          </div>
          <div className="border-l border-gray-300 h-5 mx-3"></div>
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-gray-600 cursor-pointer hover:text-purple-600 transition-colors" />
            <Move className="w-4 h-4 text-gray-600 cursor-pointer hover:text-purple-600 transition-colors" />
            <ArrowUp className="w-4 h-4 text-gray-600 cursor-pointer hover:text-purple-600 transition-colors" />
            <Play className="w-4 h-4 text-gray-600 cursor-pointer hover:text-purple-600 transition-colors" />
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="w-full flex gap-0 overflow-hidden flex-1 h-0">
        {/* Left Side Panel */}
        <div className="w-48 bg-[#ECDBEF] flex flex-col items-center justify-start relative h-full min-h-0">
          {/* Left Tools - Check and Layer */}
          <div className="flex flex-col space-y-3 mt-8 w-full items-center">
            <Button
              variant="outline"
              className="w-36 h-12 bg-white border-2 border-black hover:border-purple-600 flex flex-row items-center justify-start rounded-full shadow-none px-4 text-lg font-extrabold gap-2"
            >
              <Check className="w-6 h-6 mr-2" />
              <span className="font-extrabold text-black text-lg">Check</span>
            </Button>
            <Button
              variant="outline"
              className={`w-36 h-12 bg-white border-2 ${showLayerPanel ? 'border-purple-600' : 'border-black'} hover:border-purple-600 flex flex-row items-center justify-start rounded-full shadow-none px-4 text-lg font-extrabold gap-2`}
              onClick={() => setShowLayerPanel((prev) => !prev)}
            >
              <Layers className={`w-6 h-6 mr-2 ${showLayerPanel ? 'text-purple-600' : 'text-black'}`} />
              <span className={`font-extrabold text-lg ${showLayerPanel ? 'text-purple-600' : 'text-black'}`}>Layer</span>
              <span className={`text-base ml-2 ${showLayerPanel ? 'text-purple-600' : 'text-black'}`}>{showLayerPanel ? '▲' : '▼'}</span>
            </Button>
            {/* Layer Panel */}
            {showLayerPanel && (
              <div className="w-44 min-h-[110px] bg-transparent rounded-2xl mt-3 flex flex-col gap-2 p-2 border-2 border-purple-600 shadow-lg">
                {/* Layer List */}
                {layers.map((layer) => {
                  const isSelected = selectedLayerId === layer.id;
                  return (
                    <div
                      key={layer.id}
                      className={`flex items-center pr-3 py-1 rounded-full border-2 bg-white cursor-pointer transition-all min-h-[44px] h-[52px] relative
                        ${isSelected ? 'border-pink-400 bg-pink-50' : 'border-black'}`}
                      onClick={() => setSelectedLayerId(layer.id)}
                      style={{ boxShadow: '0 1px 2px 0 rgba(0,0,0,0.04)' }}
                    >
                      <span className="h-10 flex items-center bg-gray-100 rounded-full border border-gray-300 flex-1 ml-2"></span>
                      <span className="flex items-center ml-1">
                        {/* Eye icon toggleable */}
                        <button
                          type="button"
                          className="focus:outline-none"
                          onClick={e => {
                            e.stopPropagation();
                            toggleLayerVisible(layer.id);
                          }}
                        >
                          {layer.visible ? (
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block align-middle text-black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                          ) : (
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="inline-block align-middle text-black">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.94 17.94A10.05 10.05 0 0 1 12 19c-4.477 0-8.268-2.943-9.542-7a9.956 9.956 0 0 1 4.422-5.568M6.1 6.1A9.956 9.956 0 0 1 12 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 0 1-4.293 5.428" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.53 9.53A3 3 0 0 0 12 15a3 3 0 0 0 2.47-5.47" />
                              <line x1="3" y1="3" x2="21" y2="21" strokeWidth="2" stroke="#000" />
                            </svg>
                          )}
                        </button>
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Center Canvas */}
        <div className="flex-1 bg-white flex items-center justify-center relative h-full min-h-0">
          {/* Design Area */}
          <div className="relative w-[400px] h-[400px] bg-gray-50 rounded-lg shadow-lg border-2 border-gray-200 flex items-center justify-center">
            {/* Design Area fills the entire canvas */}
            <div className="w-full h-full border-2 border-dashed border-gray-400 bg-white rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-lg">Design Area</span>
            </div>
          </div>
          {/* Download arrow */}
        </div>

        {/* Right Side Panel */}
        <div className="w-48 bg-[#ECDBEF] flex flex-col items-center justify-start relative h-full min-h-0">
          {/* (상단 pill 컨테이너 제거됨) */}
          {/* View Controls - empty square and pill labels */}
          <div className="flex flex-col items-center w-full pt-2 gap-4">
            {/* Use fixed height for each image container and a slightly larger gap for more comfortable spacing */}
            <div className="flex flex-col items-center w-full gap-3">
              {views.map((view) => {
                // Pill color by view
                let pillClass = 'border-2 border-black text-black bg-white';
                if (selectedView === view) {
                  pillClass = 'border-2 border-[#f87171] text-[#f87171] bg-white';
                }

                // Border color for square
                let borderColor = '#000';
                if (selectedView === view) {
                  borderColor = '#f87171';
                }

                // Overlap only the border (2.5px), so borders touch but do not cover each other
                const borderWidth = 2.5;
                const overlap = borderWidth; // Only overlap the border

                return (
                  <div key={view} className="flex flex-col items-center gap-0 relative" style={{ width: 140 }}>
                    <div
                      className="w-[140px] h-[180px]"
                      style={{
                        background: 'white',
                        borderRadius: '1.5rem',
                        border: `${borderWidth}px solid ${borderColor}`,
                        cursor: 'pointer',
                        zIndex: 2,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                      onClick={() => setSelectedView(view)}
                    ></div>
                    <button
                      className={`min-w-[90px] px-3 py-0.5 rounded-full font-bold text-base transition-colors duration-150 ${pillClass}`}
                      style={{
                        marginTop: `-${overlap}px`,
                        zIndex: 3,
                        position: 'relative',
                        lineHeight: 1.05,
                      }}
                      onClick={() => setSelectedView(view)}
                    >
                      {view}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-[30rem] bg-white border-l border-gray-200 p-6 overflow-y-auto h-full min-h-0 flex flex-col justify-between">
          {/* Brand Name header */}
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm text-gray-600 font-semibold">Brand Name</div>
            <div className="flex items-center space-x-3">
              <Share className="w-5 h-5 text-gray-600" />
              <Heart className="w-5 h-5 text-gray-600" />
            </div>
          </div>

          {/* Product Info */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{product?.name || "No product"}</h2>
            <div className="text-sm text-gray-600 mb-1">1EA or more ${product?.basePrice || "-"}</div>
            <div className="flex items-center">
              <div className="flex text-yellow-400">
                {[...Array(4)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <defs>
                    <linearGradient id="halfStar" x1="0" y1="0" x2="24" y2="0" gradientUnits="userSpaceOnUse">
                      <stop offset="50%" stopColor="#facc15" />
                      <stop offset="50%" stopColor="white" />
                    </linearGradient>
                  </defs>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="url(#halfStar)" stroke="#facc15" />
                </svg>
              </div>
              <span className="text-sm text-gray-600 ml-2 underline cursor-pointer">Reviews {product?.reviewCount ? product.reviewCount.toLocaleString() : "-"}</span>
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Color • {selectedColor}</h3>
            <div className="grid grid-cols-10 gap-1 mb-3">
              {(product?.availableColors as any[])?.slice(0, 10)?.map?.((color: any, index: number) => (
                <button
                  key={index}
                  className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                    selectedColor === color.name ? "border-gray-800" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => setSelectedColor(color.name)}
                />
              )) || <span className="col-span-10 text-xs text-gray-400">No colors</span>}
            </div>
            <div className="grid grid-cols-10 gap-1 mb-4">
              {(product?.availableColors as any[])?.slice(10, 20)?.map?.((color: any, index: number) => (
                <button
                  key={index}
                  className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                    selectedColor === color.name ? "border-gray-800" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => setSelectedColor(color.name)}
                />
              )) || <span className="col-span-10 text-xs text-gray-400">No colors</span>}
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Size</h3>
            <div className="flex justify-between gap-4">
              {(product?.availableSizes as string[])?.map?.((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  className={`w-24 h-8 rounded-full text-base font-normal px-0 text-center border-2 transition-colors duration-150 ${selectedSize === size ? "border-red-400 text-red-500 bg-white" : "border-black text-black bg-white hover:border-red-400"}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </Button>
              )) || <span className="text-xs text-gray-400">No sizes</span>}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
            <div className="flex items-center gap-x-2 mb-2">
              <div className="flex items-center rounded-full border-2 border-black px-6 py-1 bg-white w-80 justify-between h-10">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full text-lg hover:bg-gray-100 h-10"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <Input
                  type="number"
                  value={quantity}
                  min="1"
                  className="w-16 text-center border-none focus:ring-0 focus:outline-none bg-transparent text-base appearance-none remove-number-spin"
                  style={{ MozAppearance: 'textfield', appearance: 'textfield' }}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
                <style>{`
                  /* Chrome, Safari, Edge, Opera */
                  input[type=number]::-webkit-inner-spin-button, 
                  input[type=number]::-webkit-outer-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                  }
                  /* Firefox */
                  input[type=number] {
                    -moz-appearance: textfield;
                  }
                `}</style>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-full text-lg hover:bg-gray-100 h-10"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
              <button
                className="flex flex-col items-center justify-center rounded-full border-2 border-black bg-white px-4 py-1 text-xs font-normal w-32 h-10"
                type="button"
              >
                <span>Bulk Order</span>
                <span>Price Policy</span>
              </button>
            </div>
            <p className="text-xs text-gray-600">{product?.minOrderQuantity ? `${product.minOrderQuantity} set minimum order` : "No minimum order info"}</p>
          </div>

          {/* Design Tools */}
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-3">
              {designTools.map((tool, index) => (
                <button
                  key={index}
                  className="flex flex-col items-center p-3 bg-purple-100 rounded-lg transition-colors group hover:bg-purple-200 hover:shadow-md hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  tabIndex={0}
                >
                  <tool.icon className="w-5 h-5 text-purple-600 mb-1 group-hover:text-purple-800 transition-colors" />
                  <span className="text-xs font-medium text-gray-700 group-hover:text-purple-800 transition-colors">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search Input */}
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Please enter your request for the designer!"
              className="w-full focus:ring-purple-600 focus:border-purple-600 h-8 placeholder:text-gray-400/70"
            />
          </div>

          {/* Price and Actions */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">1EA</span>
              <span className="text-xl font-bold text-gray-900">${calculatePrice()}</span>
              {/* Custom filled, rounded triangle icon (upward, smooth corners, Add to Cart color) */}
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="#f87171" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 7 Q13 8, 18 17 Q12 15.5, 6 17 Q11 8, 12 7 Z" />
              </svg>
            </div>
            <div className="flex gap-4">
              <Button 
                className="flex-1 flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-4 bg-red-400 text-black hover:bg-red-500 font-semibold shadow-sm"
                onClick={handleAddToCart}
                disabled={addToCartMutation.isPending}
              >
                <ShoppingCart className="w-5 h-5" />
                {addToCartMutation.isPending ? "Adding..." : "Add To Cart"}
              </Button>
              <Button 
                className="flex-1 flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-4 bg-red-400 text-black hover:bg-red-500 font-semibold shadow-sm"
                onClick={handleBuyNow}
                disabled={addToCartMutation.isPending}
              >
                <CreditCard className="w-5 h-5" />
                Buy
              </Button>
            </div>
          </div>
        </div>
      </div>
      {showPopup && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-pink-100 border-2 border-pink-300 text-pink-700 px-8 py-4 rounded-2xl shadow-2xl z-50 text-xl font-semibold flex items-center gap-2 animate-fadein drop-shadow-lg" style={{fontFamily: 'inherit'}}>
          <span role="img" aria-label="cart">🛒</span>
          Added to cart!
        </div>
      )}
    </div>
  );
}
