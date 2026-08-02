import { ArrowRightLeft, Folder, Image, Maximize, PenTool, Type } from 'lucide-react';

export const categories = ['All Products', 'Apparel', 'Accessories', 'Fabric', 'Goods', 'Living', 'Pet', 'Phone ACC', 'Stationary', 'Sticker', 'Sports', 'Kids', 'Tech& Digital'];
export const views = ['Front', 'Back', 'Right', 'Left'];
export const productViewAssets = {
  Front: '/assets/tshirt-mockup.png',
  Back: '/assets/tshirt-back-mockup.png',
  Right: '/assets/tshirt-right-mockup.png',
  Left: '/assets/tshirt-right-mockup.png',
};
export const designTools = [
  { icon: ArrowRightLeft, label: 'Change' }, { icon: Image, label: 'Image' }, { icon: Type, label: 'Text' },
  { icon: PenTool, label: 'Design' }, { icon: Maximize, label: 'Layout Request' }, { icon: Folder, label: 'Library' },
];
