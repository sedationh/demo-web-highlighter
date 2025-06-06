import { useState, useEffect } from 'react'

// 普通网页组件 - 只是静态内容展示
function Website() {
  return (
    <div className="website-container">
      <h3>📄 普通网页内容</h3>
      <div 
        id="website-content"
        style={{ 
          padding: '20px', 
          border: '2px solid #e9ecef', 
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
          userSelect: 'text',
          lineHeight: '1.6'
        }}
      >
        <h4>关于人工智能的发展</h4>
        <p>
          人工智能（Artificial Intelligence，AI）是计算机科学的一个分支，
          它企图了解智能的实质，并生产出一种新的能以人类智能相似的方式做出反应的智能机器。
        </p>
        <p>
          <strong>机器学习</strong>是人工智能的核心技术之一，通过算法使机器能够从数据中学习并做出决策或预测。
          深度学习作为机器学习的一个子集，使用神经网络来模拟人脑的学习过程。
        </p>
        <p>
          目前，AI技术已经广泛应用于：
        </p>
        <ul>
          <li><strong>自然语言处理</strong> - 语音识别、机器翻译、文本分析</li>
          <li><strong>计算机视觉</strong> - 图像识别、人脸检测、自动驾驶</li>
          <li><strong>推荐系统</strong> - 个性化推荐、智能搜索</li>
          <li><strong>机器人技术</strong> - 工业自动化、服务机器人</li>
        </ul>
        <p>
          随着技术的不断进步，人工智能将在更多领域发挥重要作用，
          改变我们的生活和工作方式。
        </p>
        
        <blockquote style={{ 
          padding: '15px', 
          backgroundColor: '#e3f2fd', 
          borderLeft: '4px solid #2196f3',
          margin: '20px 0',
          fontStyle: 'italic'
        }}>
          "人工智能将是人类发明的最后一项发明。" - Nick Bostrom
        </blockquote>
      </div>
    </div>
  )
}

// 浏览器扩展组件 - 包含所有高亮功能
function Extension() {
  const [isActive, setIsActive] = useState(true)
  const [highlights, setHighlights] = useState<Array<{ id: string; text: string; element: HTMLElement; segments?: HTMLElement[] }>>([])
  const [highlightColor, setHighlightColor] = useState('#fff3cd')
  const [conflictMessage, setConflictMessage] = useState('')

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
  }, [isActive, highlightColor])

  const createHighlight = (range: Range, text: string) => {
    // 检查是否与现有高亮冲突
    const conflictCheck = checkHighlightConflicts(range)
    if (conflictCheck.hasConflict) {
      setConflictMessage(conflictCheck.reason)
      setTimeout(() => setConflictMessage(''), 3000) // 3秒后清除提示
      return
    }

    // 检查是否跨元素选择
    if (range.startContainer === range.endContainer) {
      // 单元素选择，直接处理
      createSingleElementHighlight(range, text)
    } else {
      // 跨元素选择，分段处理
      createSegmentedHighlight(range, text)
    }
  }

  const checkHighlightConflicts = (range: Range) => {
    // 检查选择范围内是否已包含高亮元素
    const container = range.commonAncestorContainer instanceof Element 
      ? range.commonAncestorContainer 
      : range.commonAncestorContainer.parentElement || document
    
    const existingHighlights = container.querySelectorAll('[data-highlighter="true"]')
    
    for (const highlight of existingHighlights) {
      // 检查是否在选择范围内
      if (range.intersectsNode(highlight)) {
        return {
          hasConflict: true,
          reason: '选择范围与现有高亮重叠',
          conflictElement: highlight
        }
      }
    }

    // 检查选择范围是否完全在某个高亮内部
    let currentNode = range.startContainer
    while (currentNode && currentNode !== document.body) {
      if (currentNode instanceof Element && currentNode.hasAttribute('data-highlighter')) {
        return {
          hasConflict: true,
          reason: '选择范围在现有高亮内部',
          conflictElement: currentNode
        }
      }
      currentNode = currentNode.parentNode
    }

    return { hasConflict: false }
  }

  const createSingleElementHighlight = (range: Range, text: string) => {
    const span = document.createElement('span')
    span.style.backgroundColor = highlightColor
    span.style.border = '1px solid #ffeaa7'
    span.style.borderRadius = '2px'
    span.className = 'web-highlighter-mark'
    span.setAttribute('data-highlighter', 'true')
    
    range.surroundContents(span)
    
    const highlightId = `highlight_${Date.now()}`
    span.setAttribute('data-highlight-id', highlightId)
    
    setHighlights(prev => [...prev, {
      id: highlightId,
      text: text,
      element: span
    }])
  }

  const createSegmentedHighlight = (range: Range, text: string) => {
    const highlightId = `highlight_${Date.now()}`
    const segments: HTMLElement[] = []
    
    // 收集范围内的所有文本节点
    const walker = document.createTreeWalker(
      range.commonAncestorContainer,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
        }
      }
    )
    
    const textNodes: Text[] = []
    let currentNode = walker.nextNode() as Text
    while (currentNode) {
      textNodes.push(currentNode)
      currentNode = walker.nextNode() as Text
    }
    
    // 为每个文本节点片段创建高亮
    textNodes.forEach((textNode, index) => {
      let startOffset = 0
      let endOffset = textNode.textContent?.length || 0
      
      // 调整起始和结束偏移
      if (textNode === range.startContainer) {
        startOffset = range.startOffset
      }
      if (textNode === range.endContainer) {
        endOffset = range.endOffset
      }
      
      // 创建当前片段的范围
      if (startOffset < endOffset) {
        const segmentRange = document.createRange()
        segmentRange.setStart(textNode, startOffset)
        segmentRange.setEnd(textNode, endOffset)
        
        const span = document.createElement('span')
        span.style.backgroundColor = highlightColor
        span.style.border = '1px solid #ffeaa7'
        span.style.borderRadius = '2px'
        span.className = 'web-highlighter-mark'
        span.setAttribute('data-highlighter', 'true')
        span.setAttribute('data-highlight-id', `${highlightId}_${index}`)
        span.setAttribute('data-highlight-group', highlightId)
        
        segmentRange.surroundContents(span)
        segments.push(span)
      }
    })
    
    // 将分段高亮作为一个组来管理
    setHighlights(prev => [...prev, {
      id: highlightId,
      text: text,
      element: segments[0], // 主要元素用于兼容现有逻辑
      segments: segments    // 所有片段
    }])
  }

  const removeHighlight = (id: string) => {
    const highlight = highlights.find(h => h.id === id)
    if (!highlight) return

    // 处理分段高亮
    if (highlight.segments && highlight.segments.length > 0) {
      highlight.segments.forEach(segment => {
        const parent = segment.parentNode
        if (parent) {
          parent.insertBefore(document.createTextNode(segment.textContent || ''), segment)
          parent.removeChild(segment)
        }
      })
    } else {
      // 处理单个高亮
      const element = highlight.element
      const parent = element.parentNode
      if (parent) {
        parent.insertBefore(document.createTextNode(element.textContent || ''), element)
        parent.removeChild(element)
      }
    }
    
    setHighlights(prev => prev.filter(h => h.id !== id))
  }

  const removeAllHighlights = () => {
    // 移除页面中所有扩展创建的高亮
    const highlightElements = document.querySelectorAll('[data-highlighter="true"]')
    highlightElements.forEach(element => {
      const parent = element.parentNode
      if (parent) {
        parent.insertBefore(document.createTextNode(element.textContent || ''), element)
        parent.removeChild(element)
      }
    })
    setHighlights([])
  }

  const changeHighlightColor = (color: string) => {
    setHighlightColor(color)
    // 更新已存在的高亮颜色
    const existingHighlights = document.querySelectorAll('[data-highlighter="true"]') as NodeListOf<HTMLElement>
    existingHighlights.forEach(element => {
      element.style.backgroundColor = color
    })
  }

  const toggleExtension = () => {
    setIsActive(!isActive)
    if (isActive) {
      // 关闭时清除所有高亮
      removeAllHighlights()
    }
  }

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
            <div style={{ marginBottom: '20px' }}>
              <p><strong>高亮颜色：</strong></p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                {[
                  { color: '#fff3cd', name: '黄色' },
                  { color: '#f8d7da', name: '红色' },
                  { color: '#d1ecf1', name: '蓝色' },
                  { color: '#d4edda', name: '绿色' }
                ].map(({ color, name }) => (
                  <button
                    key={color}
                    onClick={() => changeHighlightColor(color)}
                    title={name}
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: color,
                      border: highlightColor === color ? '3px solid #333' : '1px solid #ccc',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 高亮列表管理 */}
            <div style={{ marginBottom: '20px' }}>
              <h4>📝 高亮笔记 ({highlights.length})</h4>
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
                        "{highlight.text.length > 50 ? highlight.text.substring(0, 50) + '...' : highlight.text}"
                      </div>
                      <button
                        onClick={() => removeHighlight(highlight.id)}
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

            {/* 批量操作 */}
            {highlights.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
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
              </div>
            )}
          </>
        )}

        {/* 扩展信息 */}
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f1f3f4', 
          borderRadius: '6px',
          border: '1px solid #dee2e6'
        }}>
          <h4>🔍 扩展工作原理：</h4>
          <ul style={{ fontSize: '13px', lineHeight: '1.6', margin: '10px 0' }}>
            <li><strong>内容脚本注入</strong>：向网页注入事件监听器</li>
            <li><strong>DOM 操作</strong>：通过 Range API 包裹选中文本</li>
            <li><strong>分段高亮</strong>：跨元素选择时保持DOM结构</li>
            <li><strong>冲突检测</strong>：防止嵌套高亮导致DOM破坏</li>
            <li><strong>状态管理</strong>：扩展内部维护高亮状态</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
        🎨 Web Highlighter 扩展模拟演示
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr',
        gap: '30px',
        alignItems: 'start'
      }}>
        <Website />
        <Extension />
      </div>

      <div style={{ 
        marginTop: '30px', 
        padding: '20px',
        backgroundColor: '#fff3cd', 
        borderRadius: '8px',
        borderLeft: '4px solid #ffc107'
      }}>
        <h3>💡 使用说明：</h3>
        <ol style={{ lineHeight: '1.8' }}>
          <li>点击右侧扩展面板的 <strong>"扩展已禁用"</strong> 按钮启用扩展</li>
          <li>在左侧网页内容中<strong>选择任意文本</strong></li>
          <li>文本会自动被高亮标记</li>
          <li>在扩展面板中管理你的高亮笔记</li>
          <li>可以更改高亮颜色或删除特定高亮</li>
        </ol>
      </div>
    </div>
  )
}

export default App
