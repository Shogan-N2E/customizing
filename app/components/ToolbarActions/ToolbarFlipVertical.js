// Toggle vertical flip (scaleY(-1)) on selected element (text or image)
export function handleToolbarFlipVertical({ selectedLayerId, designAreaRef, setCanvasTexts, setCanvasImages }) {
  if (!selectedLayerId) return;

  try {
    if (selectedLayerId.startsWith('text-')) {
  const textId = selectedLayerId.replace('text-', '');
      const texts = designAreaRef.current?.texts || [];
      const updated = texts.map(t => {
        if (t.id === textId) {
          return { ...t, flipY: !t.flipY };
        }
        return t;
      });
      if (designAreaRef.current?.replaceState) {
        designAreaRef.current.replaceState({ texts: updated, images: designAreaRef.current?.images || [] });
      }
      if (setCanvasTexts) setCanvasTexts(updated);
    } else if (selectedLayerId.startsWith('image-')) {
  const imageId = selectedLayerId.replace('image-', '');
      const images = designAreaRef.current?.images || [];
      const updated = images.map(img => {
        if (img.id === imageId) {
          return { ...img, flipY: !img.flipY };
        }
        return img;
      });
      if (designAreaRef.current?.replaceState) {
        designAreaRef.current.replaceState({ texts: designAreaRef.current?.texts || [], images: updated });
      }
      if (setCanvasImages) setCanvasImages(updated);
    }
  } catch (err) {
    console.error('handleToolbarFlipVertical error:', err);
  }
}
