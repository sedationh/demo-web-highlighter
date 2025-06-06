import { useEffect } from 'react'
import { useHighlighter } from '../hooks/useHighlighter'
import { ColorPicker } from './ColorPicker'
import { HighlightList } from './HighlightList'
import { ExtensionInfo } from './ExtensionInfo'

// 浏览器扩展组件 - 包含所有高亮功能
export function Extension() {
  const {
    isActive,
    highlights,
    highlightColor,
    conflictMessage,
    createHighlight,
    removeHighlight,
    removeAllHighlights,
    changeHighlightColor,
    toggleExtension
  } = useHighlighter()

  // 监听网页内容的文本选择
  useEffect(() => {
    if (!isActive) return

    const handleMouseUp = (e: MouseEvent) => {
      // 只处理网站内容区域的选择
      const target = e.target as HTMLElement
      const websiteContent = document.getElementById('website-content')
      if (!websiteContent?.contains(target)) return

      const selection = window.getSelection()
      if (!selection || selection.isCollapsed) return

      const range = selection.getRangeAt(0)
      const selectedText = range.toString().trim()
      if (selectedText) {
        createHighlight(range, selectedText)
        selection.removeAllRanges()
      }
    }

    // 扩展向页面注入事件监听
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isActive, createHighlight])

  return (
    <div className="extension-panel">
      <h3>🔧 Web Highlighter 扩展</h3>
      <div style={{ 
        padding: '20px', 
        border: '2px solid #17a2b8', 
        borderRadius: '8px',
        backgroundColor: isActive ? '#e1f7fa' : '#f8f9fa'
      }}>
        
        {/* 扩展开关 */}
        <div style={{ marginBottom: '20px' }}>
          <button 
            onClick={toggleExtension}
            style={{
              padding: '12px 24px',
              backgroundColor: isActive ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            {isActive ? '🟢 扩展已启用' : '⚪ 扩展已禁用'}
          </button>
          <p style={{ fontSize: '12px', color: '#666', margin: '8px 0' }}>
            模拟浏览器扩展的启用/禁用状态
          </p>
        </div>

        {isActive && (
          <>
            {/* 冲突提示 */}
            {conflictMessage && (
              <div style={{ 
                marginBottom: '15px',
                padding: '10px',
                backgroundColor: '#f8d7da',
                border: '1px solid #f5c6cb',
                borderRadius: '4px',
                color: '#721c24',
                fontSize: '14px'
              }}>
                ⚠️ {conflictMessage}
              </div>
            )}

            {/* 高亮颜色选择 */}
            <ColorPicker 
              selectedColor={highlightColor} 
              onColorChange={changeHighlightColor} 
            />

            {/* 高亮列表管理 */}
            <HighlightList 
              highlights={highlights} 
              onRemoveHighlight={removeHighlight} 
            />

            {/* 批量操作 */}
            {highlights.length > 0 && (
              <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                  onClick={removeAllHighlights}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  清除所有高亮
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  🔄 测试刷新恢复
                </button>
              </div>
            )}
          </>
        )}

        {/* 扩展信息 */}
        <ExtensionInfo />
      </div>
    </div>
  )
} 