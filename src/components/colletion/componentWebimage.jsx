import React, { useRef } from 'react';
import { iconDelete, iconImage } from '../icons/icons';

export default function ImagePickerWeb({ image, setImage }) {
  const inputRef = useRef(null);

  const handlePick = (e) => {
    const file = e.target.files[0];
    if (file) {
      const uri = URL.createObjectURL(file);
      setImage({ file, uri });
    }
  };

  return (
    <div 
        style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 16,
        width: 300,
        gap: 16,
        }}>
      <button onClick={() => inputRef.current.click()}
        style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'center',
        padding: 16,
        border: '1px solid #ccc',
        borderRadius: 12,
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: 300,
        backgroundColor: '#fff',
        gap: 16,
        }}
        >
        {iconImage({ size: 20, color: 'black' })}Seleccionar Imagen
      </button>
      <input type="file" accept="image/*" style={{ display: 'none' }} ref={inputRef} onChange={handlePick} />
      {image?.uri && (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img src={image.uri} alt="preview" style={{ width: 50, height: 75, borderRadius: 8, objectFit: 'cover' }} />
          <button onClick={() => setImage(null)} style={{
            position: 'absolute',
            border: '1px solid #ccc',
            top: -10,
            right: -10,
            backgroundColor: '#fff',
            borderRadius: '50%',
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}>
            {iconDelete('red', 15)}
          </button>
        </div>
      )}
    </div>
  );
}
