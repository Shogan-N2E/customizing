import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Bold, 
  Italic, 
  Strikethrough, 
  Underline,
  AlignLeft,
  AlignCenter, 
  AlignRight,
  ChevronUp,
  ChevronDown,
  Plus,
  Minus
} from 'lucide-react';
import { fontOptions } from './text-style/fontOptions';

export default function TextStyleSidebar({ selectedText, onChangeTextStyle, onGoBack }) {
  const [isCurvedTextEnabled, setIsCurvedTextEnabled] = useState(false);
  const [fontSize, setFontSize] = useState(12);
  const [rotateAngle, setRotateAngle] = useState(0);
  const [curveIntensity, setCurveIntensity] = useState(0);
  // When curved mode is enabled we want no curve-type pill selected by default
  const [selectedCurveType, setSelectedCurveType] = useState(null);
  
  // Font style states
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  
  // Update style states when selectedText changes
  useEffect(() => {
    if (selectedText) {
  // TextStyleSidebar: selectedText changed (debug logs removed)
      setIsBold(selectedText.isBold || false);
      setIsItalic(selectedText.isItalic || false);
      setIsStrikethrough(selectedText.isStrikethrough || false);
      setIsUnderline(selectedText.isUnderline || false);
      setSelectedFont(selectedText.font || 'Comic Neue');
      setFontSize(selectedText.fontSize || 18);
      setSelectedAlignment(selectedText.textAlign || 'left');
      // Normalize rotation to range [-180, 180]
      const normalizeAngle = (angle) => {
        let a = Number(angle) || 0;
        a = ((a + 180) % 360 + 360) % 360 - 180;
        return a;
      };
      setRotateAngle(normalizeAngle(selectedText.rotation || 0)); // Synchronize rotation value
      // Synchronize curved text state
      setIsCurvedTextEnabled(selectedText.isCurved || false);
      setCurveIntensity(selectedText.curveIntensity || 0);
      // Keep existing curveType if present; otherwise leave it null so no pill is selected
      setSelectedCurveType(selectedText.curveType ?? null);
      const newColor = selectedText.color || '#000000'; // Change default to black
      setSelectedColor(newColor);
      setInputValue(newColor.replace('#', '')); // Synchronize input field
      updateIndicatorPositions(newColor);
    }
  }, [selectedText, selectedText?.fontSize, selectedText?.rotation, selectedText?.isCurved, selectedText?.curveIntensity, selectedText?.curveType]);
  
  // Alignment states
  const [selectedAlignment, setSelectedAlignment] = useState('left');
  
  // Custom dropdown states
  const [selectedFont, setSelectedFont] = useState('Comic Neue');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Text color state
  const [selectedColor, setSelectedColor] = useState('#000000'); // Set default to black
  const [inputValue, setInputValue] = useState('000000'); // Separate state for hex input field
  const [isEyeDropperActive, setIsEyeDropperActive] = useState(false); // Eye dropper active state
  const [recentColors, setRecentColors] = useState(['#ffffff', '#000000', '#808080', '#0000ff', '#00ff00', '#ff0000']); // Recently used colors
  
  // Color picker indicator positions
  const [colorPickerPosition, setColorPickerPosition] = useState({ x: 50, y: 50 }); // Color/saturation indicator position (%) - centered
  const [huePosition, setHuePosition] = useState(50); // Hue bar indicator position (%) - centered
  const [currentHue, setCurrentHue] = useState(180); // Currently selected hue (0-360) - cyan color (centered)
  
  // Convert hex color to HSV
  const hexToHsv = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = currentHue; // Always maintain current hue (can only be changed via hue slider)
    const s = max === 0 ? 0 : diff / max;
    const v = max;
    
    return { h, s, v };
  };
  
  // Convert HSV to RGB
  const hsvToRgb = (h, s, v) => {
    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;
    
    let r, g, b;
    
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    return { r, g, b };
  };
  
  // Get current hue color (pure saturated color)
  const getCurrentHueColor = () => {
    const { r, g, b } = hsvToRgb(currentHue, 1, 1);
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  // Update indicator positions when color changes
  const updateIndicatorPositions = (color) => {
    const { h, s, v } = hexToHsv(color);
    // 색조는 절대 업데이트하지 않음 (오직 색조 슬라이더로만 변경)
    setColorPickerPosition({ x: s * 100, y: (1 - v) * 100 });
  };
  
  // Update only saturation/value position (for color/saturation picker)
  const updateSaturationValuePosition = (x, y) => {
    setColorPickerPosition({ x: x * 100, y: y * 100 });
  };
  
  // Initialize indicator positions on component mount
  useEffect(() => {
    updateIndicatorPositions('#000000'); // Initialize with default black color
    setInputValue('000000'); // Initialize input field
  }, []);
  
  // EyeDropper function
  const handleEyeDropper = async () => {
    if (!('EyeDropper' in window)) {
      alert('This browser does not support the eye dropper feature. Please use Chrome 95+ or Edge 95+.');
      return;
    }

    try {
      setIsEyeDropperActive(true);
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      
      if (result.sRGBHex) {
        const newColor = result.sRGBHex;
        setSelectedColor(newColor);
        setInputValue(newColor.replace('#', ''));
        updateIndicatorPositions(newColor);
        addToRecentColors(newColor);
        
        if (onChangeTextStyle) {
          onChangeTextStyle({ color: newColor });
        }
      }
    } catch (error) {
      // Never update the tint (it can only be changed with the tint slider)
      console.error('The eye dropper was canceled or an error occurred:', error);
    } finally {
      setIsEyeDropperActive(false);
    }
  };
  
// Function to add to recent colors
  const addToRecentColors = (color) => {
    setRecentColors(prev => {
      // If the color already exists, move it to the front
      const filtered = prev.filter(c => c.toLowerCase() !== color.toLowerCase());
      const newColors = [color, ...filtered];
      // Keep only the latest 8 colors
      return newColors.slice(0, 8);
    });
  };
  
  // When a color is selected, add it to recent colors
  const handleColorChange = (newColor) => {
    setSelectedColor(newColor);
    setInputValue(newColor.replace('#', ''));
    updateIndicatorPositions(newColor);
    addToRecentColors(newColor);
    
    if (onChangeTextStyle) {
      onChangeTextStyle({ color: newColor });
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.font-dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div className="text-style-sidebar w-full h-full bg-white flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-3">
        <div className="flex items-center justify-center mb-2 relative">
          <ArrowLeft 
            className="w-8 h-8 text-gray-700 cursor-pointer absolute left-0" 
            onClick={onGoBack}
          />
          <h1 className="text-4xl font-black text-gray-900 border-b-2 border-black pb-1">Text Style</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto space-y-12">
        
        {/* Font and Style Section */}
        <div className="space-y-6">
          {/* Font */}
          <div>
            <label className="block text-xl font-bold text-gray-900 mb-3">Font</label>
            <div className="flex gap-6">
              <div className="flex-1 relative">
                <div className="relative font-dropdown-container">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-4 py-2.5 border-2 border-black rounded-full focus:outline-none focus:border-gray-500 bg-white text-lg font-medium transition-all duration-200 hover:shadow-md text-left flex items-center justify-between"
                  >
                    <span style={{ fontFamily: selectedFont }}>{selectedFont}</span>
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-4 w-4 shrink-0 text-[#f87171] transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-black rounded-2xl shadow-lg z-10 overflow-hidden">
                      <div className="overflow-y-auto" style={{ maxHeight: '312px' }}>
                        {fontOptions.map((font, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedFont(font.value);
                              setIsDropdownOpen(false);
                              // Call onChangeTextStyle when the font is changed
                              if (onChangeTextStyle) {
                                onChangeTextStyle({ font: font.value });
                              }
                            }}
                            className={`w-full px-4 py-3 text-left text-lg font-medium transition-all duration-200 hover:bg-gray-100 hover:text-white border-b border-gray-100 last:border-b-0 ${
                              selectedFont === font.value ? 'text-white' : 'text-gray-900'
                            }`}
                            style={{
                              backgroundColor: selectedFont === font.value ? '#f87171' : 'transparent',
                              fontFamily: font.value
                            }}
                            onMouseEnter={(e) => {
                              if (selectedFont !== font.value) {
                                e.target.style.backgroundColor = '#f87171';
                                e.target.style.color = 'white';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedFont !== font.value) {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = '#1f2937';
                              }
                            }}
                          >
                            {font.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="relative">
                <input 
                  type="number" 
                  value={fontSize}
                  onChange={(e) => {
                    const newSize = parseInt(e.target.value) || 1;
                    setFontSize(newSize);
                    // Change the text style through onChangeTextStyle
                    if (onChangeTextStyle) {
                      onChangeTextStyle({ fontSize: newSize });
                    }
                  }}
                  className="w-20 pl-4 pr-4 py-2.5 border-2 border-black rounded-full focus:outline-none focus:border-gray-500 text-center text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={{ textAlign: 'center', paddingLeft: '16px', paddingRight: '16px' }}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
                  <button 
                    onClick={() => {
                      const newSize = fontSize + 1;
                      setFontSize(newSize);
                      // Change the text style through onChangeTextStyle
                      if (onChangeTextStyle) {
                        onChangeTextStyle({ fontSize: newSize });
                      }
                    }}
                    className="w-4 h-3 flex items-center justify-center hover:bg-gray-100 rounded-full text-xs font-bold"
                    style={{ color: '#f87171' }}
                  >
                    <ChevronUp aria-hidden="true" className="h-3 w-3" strokeWidth={3} />
                  </button>
                  <button 
                    onClick={() => {
                      const newSize = Math.max(1, fontSize - 1);
                      setFontSize(newSize);
                      // Change the text style through onChangeTextStyle
                      if (onChangeTextStyle) {
                        onChangeTextStyle({ fontSize: newSize });
                      }
                    }}
                    className="w-4 h-3 flex items-center justify-center hover:bg-gray-100 rounded-full text-xs font-bold"
                    style={{ color: '#f87171' }}
                  >
                    <ChevronDown aria-hidden="true" className="h-3 w-3" strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Style and Alignment Buttons */}
          <div className="flex gap-6">
          {/* Style Buttons */}
          <div className="flex-1 flex border-2 border-black rounded-full p-2">
            <button 
              className={`flex-1 relative py-2.5 rounded-full transition-all duration-200 flex items-center justify-center ${
                isBold 
                  ? 'text-white transform scale-110' 
                  : 'hover:bg-gray-100 hover:scale-110 hover:shadow-md'
              }`}
              style={isBold ? { backgroundColor: '#f87171' } : {}}
              onClick={() => {
                const newBoldState = !isBold;
                setIsBold(newBoldState);
                if (onChangeTextStyle) {
                  onChangeTextStyle({ isBold: newBoldState });
                }
              }}
            >
              <Bold className="w-7 h-4" />
            </button>
            <div className="w-px bg-gray-300 mx-1"></div>
            <button 
              className={`flex-1 relative py-2.5 rounded-full transition-all duration-200 flex items-center justify-center ${
                isItalic 
                  ? 'text-white transform scale-110' 
                  : 'hover:bg-gray-100 hover:scale-110 hover:shadow-md'
              }`}
              style={isItalic ? { backgroundColor: '#f87171' } : {}}
              onClick={() => {
                const newItalicState = !isItalic;
                setIsItalic(newItalicState);
                if (onChangeTextStyle) {
                  onChangeTextStyle({ isItalic: newItalicState });
                }
              }}
            >
              <Italic className="w-7 h-4" />
            </button>
            <div className="w-px bg-gray-300 mx-1"></div>
            <button 
              className={`flex-1 relative py-2.5 rounded-full transition-all duration-200 flex items-center justify-center ${
                isStrikethrough 
                  ? 'text-white transform scale-110' 
                  : 'hover:bg-gray-100 hover:scale-110 hover:shadow-md'
              }`}
              style={isStrikethrough ? { backgroundColor: '#f87171' } : {}}
              onClick={() => {
                const newStrikethroughState = !isStrikethrough;
                setIsStrikethrough(newStrikethroughState);
                if (onChangeTextStyle) {
                  onChangeTextStyle({ isStrikethrough: newStrikethroughState });
                }
              }}
            >
              <Strikethrough className="w-7 h-4" />
            </button>
            <div className="w-px bg-gray-300 mx-1"></div>
            <button 
              className={`flex-1 relative py-2.5 rounded-full transition-all duration-200 flex items-center justify-center ${
                isUnderline 
                  ? 'text-white transform scale-110' 
                  : 'hover:bg-gray-100 hover:scale-110 hover:shadow-md'
              }`}
              style={isUnderline ? { backgroundColor: '#f87171' } : {}}
              onClick={() => {
                const newUnderlineState = !isUnderline;
                setIsUnderline(newUnderlineState);
                if (onChangeTextStyle) {
                  onChangeTextStyle({ isUnderline: newUnderlineState });
                }
              }}
            >
              <Underline className="w-7 h-4" />
            </button>
          </div>

          {/* Alignment Buttons */}
          <div className="flex-1 flex border-2 border-black rounded-full p-2">
            <button 
              className={`flex-1 relative py-2.5 rounded-full transition-all duration-200 flex items-center justify-center ${
                selectedAlignment === 'left' 
                  ? 'text-white transform scale-110' 
                  : 'hover:bg-gray-100 hover:scale-110 hover:shadow-md'
              }`}
              style={selectedAlignment === 'left' ? { backgroundColor: '#f87171' } : {}}
              onClick={() => {
                setSelectedAlignment('left');
                if (onChangeTextStyle) {
                  onChangeTextStyle({ textAlign: 'left' });
                }
              }}
            >
              <AlignLeft className="w-7 h-4" />
            </button>
            <div className="w-px bg-gray-300 mx-1"></div>
            <button 
              className={`flex-1 relative py-2.5 rounded-full transition-all duration-200 flex items-center justify-center ${
                selectedAlignment === 'center' 
                  ? 'text-white transform scale-110' 
                  : 'hover:bg-gray-100 hover:scale-110 hover:shadow-md'
              }`}
              style={selectedAlignment === 'center' ? { backgroundColor: '#f87171' } : {}}
              onClick={() => {
                setSelectedAlignment('center');
                if (onChangeTextStyle) {
                  onChangeTextStyle({ textAlign: 'center' });
                }
              }}
            >
              <AlignCenter className="w-7 h-4" />
            </button>
            <div className="w-px bg-gray-300 mx-1"></div>
            <button 
              className={`flex-1 relative py-2.5 rounded-full transition-all duration-200 flex items-center justify-center ${
                selectedAlignment === 'right' 
                  ? 'text-white transform scale-110' 
                  : 'hover:bg-gray-100 hover:scale-110 hover:shadow-md'
              }`}
              style={selectedAlignment === 'right' ? { backgroundColor: '#f87171' } : {}}
              onClick={() => {
                setSelectedAlignment('right');
                if (onChangeTextStyle) {
                  onChangeTextStyle({ textAlign: 'right' });
                }
              }}
            >
              <AlignRight className="w-7 h-4" />
            </button>
          </div>
        </div>
        </div>

        {/* Text Color */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-900">TextColor</h3>
            
            {/* Recent Colors */}
            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                {recentColors.map((color, index) => (
                  <button
                    key={index}
                    className="w-8 h-8 rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors cursor-pointer"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Color Picker Area */}
          <div className="space-y-4">
            {/* Main Color/Saturation Picker */}
            <div className="relative w-full h-48 rounded-lg overflow-hidden cursor-crosshair"
                 style={{
                   background: `linear-gradient(to bottom, 
                     rgba(0,0,0,0) 0%, 
                     rgba(0,0,0,0.1) 20%, 
                     rgba(0,0,0,0.5) 60%, 
                     rgba(0,0,0,1) 100%), 
                   linear-gradient(to right, 
                     rgba(255,255,255,1) 0%, 
                     rgba(255,255,255,0) 100%), 
                   ${getCurrentHueColor()}`
                 }}
                 onClick={(e) => {
                   const rect = e.currentTarget.getBoundingClientRect();
                   const x = (e.clientX - rect.left) / rect.width;
                   const y = (e.clientY - rect.top) / rect.height;
                   
                   // Update only saturation/value indicator position (don't change hue)
                   updateSaturationValuePosition(x, y);
                   
                   // Convert position to HSV and then to RGB using current hue
                   const saturation = x;
                   const value = 1 - y;
                   
                   const { r, g, b } = hsvToRgb(currentHue, saturation, value);
                   const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                   
                   handleColorChange(hexColor);
                 }}>
              {/* Selection indicator */}
              <div className="absolute w-4 h-4 border-2 border-white rounded-full shadow-lg pointer-events-none"
                   style={{
                     left: `${colorPickerPosition.x}%`,
                     top: `${colorPickerPosition.y}%`,
                     transform: 'translate(-50%, -50%)'
                   }}>
              </div>
            </div>
            
            {/* Hue Bar */}
            <div className="relative w-full h-6 rounded-full overflow-hidden cursor-pointer"
                 style={{
                   background: 'linear-gradient(to right, #ff0000 0%, #ffff00 16.66%, #00ff00 33.33%, #00ffff 50%, #0000ff 66.66%, #ff00ff 83.33%, #ff0000 100%)'
                 }}
                 onClick={(e) => {
                   const rect = e.currentTarget.getBoundingClientRect();
                   const x = (e.clientX - rect.left) / rect.width;
                   
                   // Update hue indicator position and current hue
                   const newHue = x * 360;
                   setHuePosition(x * 100);
                   setCurrentHue(newHue);
                   
                   // Get current saturation and value from color picker position
                   const saturation = colorPickerPosition.x / 100;
                   const value = 1 - (colorPickerPosition.y / 100);
                   
                   // Create new color with new hue but same saturation and value
                   const { r, g, b } = hsvToRgb(newHue, saturation, value);
                   const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
                   
                   handleColorChange(hexColor);
                 }}>
              {/* Hue indicator */}
              <div className="absolute w-4 h-4 bg-white border-2 border-gray-300 rounded-full shadow-lg pointer-events-none"
                   style={{
                     left: `${huePosition}%`,
                     top: '50%',
                     transform: 'translate(-50%, -50%)'
                   }}>
              </div>
            </div>
            
            {/* Color Preview and Hex Input */}
            <div className="flex items-center gap-3">
              {/* Color Preview Circle */}
              <div className="w-12 h-12 rounded-full border-2 border-gray-200 flex-shrink-0"
                   style={{ backgroundColor: selectedColor }}>
              </div>

              {/* Hex Input Container - pill-shaped design */}
              <div className="flex items-center flex-1 border-2 border-black rounded-full px-4 py-2.5">
                <span className="text-gray-500 font-mono text-lg mr-2">#</span>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    // Filter input (allow only 0-9, a-f, A-F, max 6 characters)
                    let value = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
                    setInputValue(value); // Update input field only
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                     // Apply the color when the Enter key is pressed
                      if (inputValue.length === 6) {
                        const newColor = `#${inputValue}`;
                        handleColorChange(newColor);
                      } else if (inputValue.length === 3) {
                        // Expand 3-character color code to 6 characters (e.g., abc -> aabbcc)
                        const expandedValue = inputValue.split('').map(char => char + char).join('');
                        const newColor = `#${expandedValue}`;
                        setInputValue(expandedValue);
                        handleColorChange(newColor);
                      }
                      e.target.blur(); // Remove focus
                    }
                  }}
                  onBlur={(e) => {
                    // Apply the color when focus is lost
                    if (inputValue.length === 6) {
                      const newColor = `#${inputValue}`;
                      handleColorChange(newColor);
                    } else if (inputValue.length === 3) {
                      // Expand 3-character color code to 6 characters
                      const expandedValue = inputValue.split('').map(char => char + char).join('');
                      const newColor = `#${expandedValue}`;
                      setInputValue(expandedValue);
                      handleColorChange(newColor);
                    } else if (inputValue.length > 0) {
                      // If the length is invalid, restore the previous color
                      setInputValue(selectedColor.replace('#', ''));
                    }
                  }}
                  className="flex-1 text-lg font-mono bg-transparent border-none focus:outline-none"
                  placeholder="60bfbf"
                  maxLength={6}
                />
              </div>

              {/* Edit Icon - eyedropper */}
              <div 
                className={`px-4 py-3.5 border-2 rounded-full flex items-center justify-center bg-white hover:bg-gray-50 transition-colors cursor-pointer ${
                  isEyeDropperActive ? 'bg-blue-100 border-blue-500' : 'border-black'
                }`}
                onClick={handleEyeDropper}
                title="스포이드로 색상 선택"
              >
                <svg 
                  className={`w-5 h-5 transition-colors ${
                    isEyeDropperActive ? 'text-blue-600' : 'text-gray-700'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Rotate */}
        <div className="grid grid-cols-1 gap-6">
          {/* Rotate */}
          <div>
            <label className="block text-xl font-bold text-gray-900 mb-3">Rotate</label>
            <div className="flex items-center gap-3">
              {/* Rotate Slider */}
              <div className="flex-1 relative">
                <div className="w-full h-2 bg-gray-200 rounded-lg relative overflow-hidden">
                  <div 
                    className="h-full rounded-lg"
                    style={{ 
                      width: `${((rotateAngle + 180) / 360) * 100}%`,
                      backgroundColor: '#f87171'
                    }}
                  />
                </div>
                <input 
                  type="range"
                  min="-180"
                  max="180"
                  value={rotateAngle}
                  onChange={(e) => {
                    const newAngle = parseInt(e.target.value);
                    setRotateAngle(newAngle);
                    if (onChangeTextStyle) {
                      onChangeTextStyle({ rotation: newAngle });
                    }
                  }}
                  className="absolute top-0 w-full h-2 rounded-lg appearance-none cursor-pointer slider bg-transparent"
                />
                <style dangerouslySetInnerHTML={{
                  __html: `
                  .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #f87171;
                    cursor: pointer;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  }
                  .slider::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #f87171;
                    cursor: pointer;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  }
                  .slider::-moz-range-track {
                    background: transparent;
                    height: 8px;
                    border-radius: 4px;
                  }
                  `
                }} />
              </div>
              
              {/* Rotate Input - Pill Container */}
              <div className="relative">
                <input 
                  type="text" 
                  value={rotateAngle}
                  onChange={(e) => {
                    const value = e.target.value;
                    
                    // Allow if the value is an empty string or only a minus sign
                    if (value === '' || value === '-') {
                      setRotateAngle(value);
                      return;
                    }
                    
                    // Allow only valid integers (including negative)
                    if (!/^-?\d*$/.test(value)) {
                      return;
                    }
                    
                    const numValue = parseInt(value);
                    if (!isNaN(numValue)) {
                      // Restrict the range to between -180 and 180
                      const clampedValue = Math.max(-180, Math.min(180, numValue));
                      setRotateAngle(clampedValue);
                      if (onChangeTextStyle) {
                        onChangeTextStyle({ rotation: clampedValue });
                      }
                    }
                  }}
                  onBlur={(e) => {
                    // When focus is lost, set to 0 if the value is an empty string or only a minus sign
                    const value = e.target.value;
                    if (value === '' || value === '-') {
                      setRotateAngle(0);
                      if (onChangeTextStyle) {
                        onChangeTextStyle({ rotation: 0 });
                      }
                    }
                  }}
                  className="w-20 pl-4 pr-4 py-2.5 border-2 border-black rounded-full focus:outline-none focus:border-gray-500 text-center text-lg"
                  style={{ textAlign: 'center', paddingLeft: '16px', paddingRight: '16px' }}
                  placeholder="0"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex flex-col">
                  <button 
                    onClick={() => {
                      const currentValue = typeof rotateAngle === 'string' ? 0 : rotateAngle;
                      const newAngle = Math.min(180, currentValue + 1);
                      setRotateAngle(newAngle);
                      if (onChangeTextStyle) {
                        onChangeTextStyle({ rotation: newAngle });
                      }
                    }}
                    className="w-4 h-3 flex items-center justify-center hover:bg-gray-100 rounded-full text-xs font-bold"
                    style={{ color: '#f87171' }}
                  >
                    <ChevronUp aria-hidden="true" className="h-3 w-3" strokeWidth={3} />
                  </button>
                  <button 
                    onClick={() => {
                      const currentValue = typeof rotateAngle === 'string' ? 0 : rotateAngle;
                      const newAngle = Math.max(-180, currentValue - 1);
                      setRotateAngle(newAngle);
                      if (onChangeTextStyle) {
                        onChangeTextStyle({ rotation: newAngle });
                      }
                    }}
                    className="w-4 h-3 flex items-center justify-center hover:bg-gray-100 rounded-full text-xs font-bold"
                    style={{ color: '#f87171' }}
                  >
                    <ChevronDown aria-hidden="true" className="h-3 w-3" strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Curved Text */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Curved Text</h3>
            <div 
              className={isCurvedTextEnabled ? 
                "w-12 h-6 rounded-full cursor-pointer transition-colors" : 
                "w-12 h-6 rounded-full cursor-pointer transition-colors bg-gray-300"
              }
              style={isCurvedTextEnabled ? { backgroundColor: '#f87171' } : {}}
              onClick={() => {
                const newCurvedState = !isCurvedTextEnabled;
                setIsCurvedTextEnabled(newCurvedState);
                // When turning curved ON, clear the selected pill so nothing appears highlighted
                const nextCurveType = newCurvedState ? null : selectedCurveType;
                if (newCurvedState) setSelectedCurveType(null);
                if (onChangeTextStyle) {
                  onChangeTextStyle({ 
                    isCurved: newCurvedState,
                    curveType: nextCurveType,
                    curveIntensity: curveIntensity
                  });
                }
              }}
            >
              <div 
                className={
                  isCurvedTextEnabled 
                    ? "w-5 h-5 bg-white rounded-full shadow transform transition-transform translate-x-6 mt-0.5"
                    : "w-5 h-5 bg-white rounded-full shadow transform transition-transform translate-x-0.5 mt-0.5"
                }
              />
            </div>
          </div>

          {isCurvedTextEnabled && (
            <div>
              {/* Curve Type Buttons */}
              <div className="flex border-2 border-black rounded-full p-1.5 mb-6">
                <button 
                  className={`flex-1 py-2.5 px-4 text-base font-medium rounded-full transition-all duration-200 ${
                    selectedCurveType === 'Arch Up' 
                      ? 'text-white transform scale-105' 
                      : 'hover:bg-gray-100 hover:scale-105 hover:shadow-sm'
                  }`}
                  style={selectedCurveType === 'Arch Up' ? { backgroundColor: '#f87171' } : {}}
                  onClick={() => {
                    setSelectedCurveType('Arch Up');
                    setCurveIntensity(-30);
                    if (onChangeTextStyle) {
                      onChangeTextStyle({ 
                        curveType: 'Arch Up',
                        curveIntensity: -30
                      });
                    }
                  }}
                >
                  Arch Up
                </button>
                <div className="w-px bg-gray-300 mx-1"></div>
                <button 
                  className={`flex-1 py-2.5 px-4 text-base font-medium rounded-full transition-all duration-200 ${
                    selectedCurveType === 'Arch Down' 
                      ? 'text-white transform scale-105' 
                      : 'hover:bg-gray-100 hover:scale-105 hover:shadow-sm'
                  }`}
                  style={selectedCurveType === 'Arch Down' ? { backgroundColor: '#f87171' } : {}}
                  onClick={() => {
                    setSelectedCurveType('Arch Down');
                    setCurveIntensity(30);
                    if (onChangeTextStyle) {
                      onChangeTextStyle({ 
                        curveType: 'Arch Down',
                        curveIntensity: 30
                      });
                    }
                  }}
                >
                  Arch Down
                </button>
                <div className="w-px bg-gray-300 mx-1"></div>
                <button 
                  className={`flex-1 py-2.5 px-4 text-base font-medium rounded-full transition-all duration-200 ${
                    selectedCurveType === 'Circle' 
                      ? 'text-white transform scale-105' 
                      : 'hover:bg-gray-100 hover:scale-105 hover:shadow-sm'
                  }`}
                  style={selectedCurveType === 'Circle' ? { backgroundColor: '#f87171' } : {}}
                  onClick={() => {
                    setSelectedCurveType('Circle');
                    setCurveIntensity(100);
                    if (onChangeTextStyle) {
                      onChangeTextStyle({ 
                        curveType: 'Circle',
                        curveIntensity: 100
                      });
                    }
                  }}
                >
                  Circle
                </button>
              </div>

              {/* Curve Intensity Slider */}
              <div className="relative">
                <div className="w-full h-2 bg-gray-200 rounded-lg relative overflow-hidden">
                  <div 
                    className="h-full rounded-lg"
                    style={{ 
                      width: `${((curveIntensity + 100) / 200) * 100}%`,
                      backgroundColor: '#f87171'
                    }}
                  />
                </div>
                <input 
                  type="range"
                  min="-100"
                  max="100"
                  value={curveIntensity}
                  onChange={(e) => {
                    const newIntensity = parseInt(e.target.value);
                    setCurveIntensity(newIntensity);
                    if (onChangeTextStyle) {
                      onChangeTextStyle({ 
                        curveIntensity: newIntensity
                      });
                    }
                  }}
                  className="absolute top-0 w-full h-2 rounded-lg appearance-none cursor-pointer slider bg-transparent"
                />
                <style dangerouslySetInnerHTML={{
                  __html: `
                  .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #f87171;
                    cursor: pointer;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  }
                  .slider::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #f87171;
                    cursor: pointer;
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  }
                  .slider::-moz-range-track {
                    background: transparent;
                    height: 8px;
                    border-radius: 4px;
                  }
                  `
                }} />
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
