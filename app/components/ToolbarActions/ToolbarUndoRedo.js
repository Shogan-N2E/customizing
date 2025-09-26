// Simple wrappers for undo/redo toolbar actions
export function handleToolbarUndo({ undo }) {
  if (typeof undo === 'function') {
    try {
      undo();
    } catch (e) {
      console.error('Undo failed', e);
    }
  }
}

export function handleToolbarRedo({ redo }) {
  if (typeof redo === 'function') {
    try {
      redo();
    } catch (e) {
      console.error('Redo failed', e);
    }
  }
}
