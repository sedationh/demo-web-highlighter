import { COLOR_OPTIONS } from '../constants/colors'

interface ColorPickerProps {
  selectedColor: string
  onColorChange: (color: string) => void
}

export function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <p><strong>高亮颜色：</strong></p>
      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
        {COLOR_OPTIONS.map(({ color, name }) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            title={name}
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: color,
              border: selectedColor === color ? '3px solid #333' : '1px solid #ccc',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          />
        ))}
      </div>
    </div>
  )
} 