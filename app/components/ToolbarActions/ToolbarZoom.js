// ToolbarZoom.js
// Function for Zoom In/Out from the toolbar

/**
 * Provides canvas zoom in/out functionality.
 * @param {object} params
 * @param {object} designAreaRef - Ref of the DesignArea component
 * @param {number} zoom - Current zoom value
 * @param {function} setZoom - Function to update zoom state
 * @param {number} delta - +1 (zoom in), -1 (zoom out)
 * @param {number} [minZoom=0.5] - Minimum zoom scale
 * @param {number} [maxZoom=2] - Maximum zoom scale
 */
export function handleToolbarZoom({ designAreaRef, zoom, setZoom, delta, minZoom = 0.5, maxZoom = 2 }) {
  let newZoom = zoom + delta * 0.1;
  newZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
  setZoom(newZoom);
  if (designAreaRef.current && designAreaRef.current.setZoom) {
    designAreaRef.current.setZoom(newZoom);
  }
}
