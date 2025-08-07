import React, { useRef } from 'react';
import { iconDelete, iconImage } from '../icons/icons';
import { isWeb } from '../token/localstorage';
import { Alert } from 'react-native';

export default function ImagePickerWeb({ images, setImages }) {
  const inputRef = useRef(null);

const handlePick = (e) => {
  const files = Array.from(e.target.files);

  if (images.length + files.length > 5) {
    if (isWeb) {
      alert("Solo puedes subir un máximo de 5 imágenes.");
    } else {
      Alert.alert("Límite alcanzado", "Solo puedes subir un máximo de 5 imágenes.");
    }
    return;
  }

  const newImages = files.map((file) => ({
    file,
    uri: URL.createObjectURL(file),
  }));

  setImages([...images, ...newImages]);
};

  const removeImage = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <button
        onClick={() => inputRef.current.click()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: 12,
          border: '1px solid #ccc',
          borderRadius: 12,
          backgroundColor: '#fff',
        }}
      >
        {iconImage({ size: 20, color: 'black' })} Seleccionar Imágenes
      </button>
      <input
        type="file"
        accept="image/*"
        multiple
        ref={inputRef}
        style={{ display: 'none' }}
        onChange={handlePick}
      />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
        {images?.map((img, idx) => (
          <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={img.uri}
              alt="preview"
              style={{ width: 50, height: 75, borderRadius: 8, objectFit: 'cover' }}
            />
            <button
              onClick={() => removeImage(idx)}
              style={{
                position: 'absolute',
                top: -10,
                right: -10,
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {iconDelete('red', 12)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
