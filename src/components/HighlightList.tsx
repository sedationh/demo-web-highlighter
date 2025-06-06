import { HighlightState } from '../types/highlight'
import { truncateText } from '../utils/highlightUtils'

interface HighlightListProps {
  highlights: HighlightState[]
  onRemoveHighlight: (id: string) => void
}

export function HighlightList({ highlights, onRemoveHighlight }: HighlightListProps) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h4>📝 高亮笔记 ({highlights.length})</h4>
      <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>
        💾 高亮数据已自动保存到本地缓存，刷新页面后会自动恢复
      </p>
      {highlights.length > 0 ? (
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {highlights.map(highlight => (
            <div key={highlight.id} style={{ 
              padding: '10px', 
              margin: '8px 0',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ flex: 1, fontSize: '14px' }}>
                "{truncateText(highlight.text)}"
              </div>
              <button
                onClick={() => onRemoveHighlight(highlight.id)}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '4px 8px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                删除
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: '#666', fontStyle: 'italic' }}>
          在左侧网页中选择文本即可创建高亮
        </p>
      )}
    </div>
  )
} 