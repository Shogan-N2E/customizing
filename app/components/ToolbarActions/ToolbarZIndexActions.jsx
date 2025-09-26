import React from 'react';

const ToolbarZIndexActions = ({ selectedElement, onBringToFront, onSendToBack }) => {
  // Handlers for bringing to front and sending to back
  const bringToFront = () => {
  // Bring to Front button clicked (debug log removed)
    if (selectedElement) {
      onBringToFront(selectedElement.id, selectedElement.type);
    }
  };

  const sendToBack = () => {
    // Send to Back button clicked (debug log removed)
    if (selectedElement) {
      onSendToBack(selectedElement.id, selectedElement.type);
    }
  };

  return (
    <div className="toolbar-zindex-actions">
      <button onClick={bringToFront} disabled={!selectedElement}>
        Bring to Front
      </button>
      <button onClick={sendToBack} disabled={!selectedElement}>
        Send to Back
      </button>
    </div>
  );
};

export default ToolbarZIndexActions;