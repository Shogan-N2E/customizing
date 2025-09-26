
/**
  Duplicates the selected layer (text/image).
  - Uses public methods of designAreaRef to add a new item to the internal state of DesignArea,
  - Also synchronizes the state of the parent component.

  @param {object} params
  @param {string|null} params.selectedLayerId - Selected layer id (e.g., 'text-123' or 'image-456')
  @param {object} params.designAreaRef - Ref of the DesignArea
  @param {function} params.setCanvasTexts - Parent's text state setter
  @param {function} params.setCanvasImages - Parent's image state setter
  @param {function} params.setSelectedLayerId - Parent's selected layer id setter
 */
export function handleToolbarCopy({ selectedLayerId, designAreaRef, setCanvasTexts, setCanvasImages, setSelectedLayerId }) {
  if (!selectedLayerId) return;

  try {
    if (selectedLayerId.startsWith('text-')) {
  const textId = selectedLayerId.replace('text-', '');
      const existingTexts = designAreaRef.current?.texts || [];
      const original = existingTexts.find(t => t.id === textId);
      if (!original) return;

      const newId = Date.now();
      const newText = {
        ...original,
        id: newId,
        x: (original.x || 0) + 10,
        y: (original.y || 0) + 10,
        zIndex: (original.zIndex || 0) + 1,
        flipX: original.flipX || false,
        flipY: original.flipY || false,
      };

      // Add into DesignArea internal state (if supported) and capture created object
      let created = null;
      if (designAreaRef.current?.addTextWithData) {
        try {
          created = designAreaRef.current.addTextWithData(newText) || null;
        } catch (e) {
          console.warn('addTextWithData failed', e);
          created = null;
        }
      } else if (designAreaRef.current?.addText) {
        // Fallback: call addText then try to patch latest text via exposed helpers
        designAreaRef.current.addText();
        // Attempt to find the most recent text and update its values
        const afterTexts = designAreaRef.current?.texts || [];
        const latest = afterTexts.reduce((a, b) => (a.id > b.id ? a : b), afterTexts[0]);
        if (latest && designAreaRef.current?.updateTextStyle) {
          designAreaRef.current.updateTextStyle(latest.id, newText);
          if (designAreaRef.current?.updateText) {
            designAreaRef.current.updateText(latest.id, newText.text);
          }
        }
        created = latest || null;
      }

      // Determine final object to use for parent state and selection
      const finalObj = created && created.id ? { ...created } : { ...newText };

      // If the design area returned the created object, rely on its callbacks to update parent state.
      // Otherwise check whether the design area actually added the item (it may have updated state but not returned it).
      const createdInDesignArea = created && created.id;
      const existsInDesignArea = designAreaRef.current && Array.isArray(designAreaRef.current.texts)
        ? designAreaRef.current.texts.some(t => t.id === finalObj.id)
        : false;
      if (!createdInDesignArea && !existsInDesignArea && setCanvasTexts) {
        setCanvasTexts((prev) => [...prev, finalObj]);
      }

      // Select the newly created text in both parent and design area so controls appear on it
      if (setSelectedLayerId) {
        setSelectedLayerId(`text-${finalObj.id}`);
      }
      if (designAreaRef.current?.selectTextFromLayer && finalObj && finalObj.id) {
        designAreaRef.current.selectTextFromLayer(finalObj.id);
      }
    } else if (selectedLayerId.startsWith('image-')) {
  const imageId = selectedLayerId.replace('image-', '');
      const existingImages = designAreaRef.current?.images || [];
      const original = existingImages.find(img => img.id === imageId);
      if (!original) return;

      const newId = Date.now();
      const newImage = {
        ...original,
        id: newId,
        x: (original.x || 0) + 10,
        y: (original.y || 0) + 10,
        zIndex: (original.zIndex || 0) + 1,
        flipX: original.flipX || false,
        flipY: original.flipY || false,
      };

      // Add image via DesignArea and capture created object if returned
      let createdImage = null;
      if (designAreaRef.current?.addImage) {
        try {
          createdImage = designAreaRef.current.addImage(newImage) || null;
        } catch (e) {
          console.warn('addImage failed', e);
          createdImage = null;
        }
      }

      const finalImageObj = createdImage && createdImage.id ? { ...createdImage } : { ...newImage };

      // If the design area returned the created image, rely on its callbacks to update parent state.
      // Otherwise check whether the design area actually added the image and only append if missing.
      const createdImageInDesignArea = createdImage && createdImage.id;
      const imageExistsInDesignArea = designAreaRef.current && Array.isArray(designAreaRef.current.images)
        ? designAreaRef.current.images.some(img => img.id === finalImageObj.id)
        : false;
      if (!createdImageInDesignArea && !imageExistsInDesignArea && setCanvasImages) {
        setCanvasImages((prev) => [...prev, finalImageObj]);
      }

      // Select the newly created image in both parent and design area
      if (setSelectedLayerId) {
        setSelectedLayerId(`image-${finalImageObj.id}`);
      }
      if (designAreaRef.current?.selectImageFromLayer && finalImageObj && finalImageObj.id) {
        designAreaRef.current.selectImageFromLayer(finalImageObj.id);
      }
    }
  } catch (err) {
    console.error('handleToolbarCopy error:', err);
  }
}
