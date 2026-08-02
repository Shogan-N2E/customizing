// Toggle horizontal flip (scaleX(-1)) on selected element (text or image)
export function handleToolbarFlipHorizontal({ selectedLayerId, designAreaRef, setCanvasTexts, setCanvasImages }) {
  if (!selectedLayerId) return;

  try {
    if (selectedLayerId.startsWith('text-')) {
      const textId = selectedLayerId.replace('text-', '');
      const texts = designAreaRef.current?.texts || [];
      const groupId = texts.find(t => t.id === textId)?.groupId;
      const updated = texts.map(t => {
        if (t.id === textId || (groupId && t.groupId === groupId)) {
          return { ...t, flipX: !t.flipX };
        }
        return t;
      });
      // Update DesignArea internal state if exposed
      if (designAreaRef.current?.replaceState) {
        designAreaRef.current.replaceState({ texts: updated, images: designAreaRef.current?.images || [] });
      }
      if (setCanvasTexts) setCanvasTexts(updated);
    } else if (selectedLayerId.startsWith('image-')) {
      const imageId = selectedLayerId.replace('image-', '');
      const images = designAreaRef.current?.images || [];
      const groupId = images.find(img => img.id === imageId)?.groupId;
      const updated = images.map(img => {
        if (img.id === imageId || (groupId && img.groupId === groupId)) {
          return { ...img, flipX: !img.flipX };
        }
        return img;
      });
      if (designAreaRef.current?.replaceState) {
        designAreaRef.current.replaceState({ texts: designAreaRef.current?.texts || [], images: updated });
      }
      if (setCanvasImages) setCanvasImages(updated);
    }
  } catch (err) {
    console.error('handleToolbarFlipHorizontal error:', err);
  }
}
