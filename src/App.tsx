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

// 高亮数据接口定义
interface HighlightData {
  id: string
  text: string
  color: string
  timestamp: number
  // 存储位置信息用于重建
  selector: string // 目标容器的选择器
  startPath: number[] // 起始文本节点的路径
  startOffset: number
  endPath: number[] // 结束文本节点的路径
  endOffset: number
  isSegmented: boolean // 是否为分段高亮
}

// 浏览器扩展组件 - 包含所有高亮功能
function Extension() {
  const [isActive, setIsActive] = useState(true)
  const [highlights, setHighlights] = useState<Array<{ id: string; text: string; element: HTMLElement; segments?: HTMLElement[] }>>([])
  const [highlightColor, setHighlightColor] = useState('#fff3cd')
  const [conflictMessage, setConflictMessage] = useState('')

  // 从 localStorage 加载高亮数据
  const loadHighlightsFromStorage = () => {
    try {
      const stored = localStorage.getItem('web-highlighter-data')
      console.log('localStorage 中的数据:', stored)
      if (stored) {
        const highlightDataList: HighlightData[] = JSON.parse(stored)
        console.log('解析后的高亮数据:', highlightDataList)
        restoreHighlights(highlightDataList)
      } else {
        console.log('没有找到缓存的高亮数据')
      }
    } catch (error) {
      console.error('加载高亮数据失败:', error)
    }
  }

  // 保存高亮数据到 localStorage
  const saveHighlightsToStorage = (highlightDataList: HighlightData[]) => {
    try {
      const dataString = JSON.stringify(highlightDataList)
      localStorage.setItem('web-highlighter-data', dataString)
      console.log(`成功保存 ${highlightDataList.length} 个高亮到 localStorage`)
      console.log('保存的数据:', dataString)
    } catch (error) {
      console.error('保存高亮数据失败:', error)
    }
  }

  // 获取文本节点在父容器中的路径
  const getTextNodePath = (textNode: Node, container: Element): number[] => {
    const path: number[] = []
    let currentNode: Node | null = textNode
    
    console.log('开始计算路径，文本节点:', textNode, '容器:', container)
    
    while (currentNode && currentNode !== container) {
      const parent = currentNode.parentNode
      if (parent) {
        const childNodes = Array.from(parent.childNodes)
        const index = childNodes.indexOf(currentNode as ChildNode)
        console.log('当前节点:', currentNode, '父节点:', parent, '在父节点中的索引:', index)
        path.unshift(index)
        currentNode = parent
      } else {
        console.error('找不到父节点，路径计算失败')
        break
      }
    }
    
    console.log('计算得到的路径:', path)
    return path
  }

  // 根据路径获取文本节点
  const getTextNodeByPath = (path: number[], container: Element): Node | null => {
    let currentNode: Node = container
    console.log('开始路径查找，起始容器:', container, '路径:', path)
    
    for (let i = 0; i < path.length; i++) {
      const index = path[i]
      console.log(`路径步骤 ${i}: 查找索引 ${index}`)
      console.log('当前节点:', currentNode)
      console.log('当前节点的子节点数量:', currentNode.childNodes.length)
      console.log('所有子节点:', Array.from(currentNode.childNodes))
      
      if (currentNode.childNodes[index]) {
        currentNode = currentNode.childNodes[index]
        console.log(`找到子节点 ${index}:`, currentNode)
      } else {
        console.error(`路径查找失败：索引 ${index} 超出范围（共 ${currentNode.childNodes.length} 个子节点）`)
        return null
      }
    }
    
    console.log('路径查找完成，最终节点:', currentNode)
    console.log('节点类型:', currentNode.nodeType, '是否为文本节点:', currentNode.nodeType === Node.TEXT_NODE)
    
    return currentNode.nodeType === Node.TEXT_NODE ? currentNode : null
  }

  // 从存储的数据恢复高亮
  const restoreHighlights = (highlightDataList: HighlightData[]) => {
    const websiteContent = document.getElementById('website-content')
    console.log('网站内容元素:', websiteContent)
    if (!websiteContent) {
      console.error('找不到 website-content 元素')
      return
    }

    console.log(`开始恢复 ${highlightDataList.length} 个高亮`)
    setIsRestoring(true) // 开始恢复，阻止自动保存
    const restoredHighlights: Array<{ id: string; text: string; element: HTMLElement; segments?: HTMLElement[] }> = []

    highlightDataList.forEach((data, index) => {
      try {
        console.log(`恢复第 ${index + 1} 个高亮:`, data)
        const startNode = getTextNodeByPath(data.startPath, websiteContent)
        const endNode = getTextNodeByPath(data.endPath, websiteContent)
        
        console.log('起始节点:', startNode, '结束节点:', endNode)
        
        if (startNode && endNode) {
          const range = document.createRange()
          range.setStart(startNode, data.startOffset)
          range.setEnd(endNode, data.endOffset)
          
          console.log('创建的 range:', range.toString())
          
          // 重建高亮，使用存储的颜色，标记为恢复模式
          createHighlightFromRange(range, data.text, data.color, data.id, true)
          
          // 手动收集恢复的高亮元素信息
          if (data.isSegmented) {
            const segments = Array.from(websiteContent.querySelectorAll(`[data-highlight-group="${data.id}"]`)) as HTMLElement[]
            if (segments.length > 0) {
              restoredHighlights.push({
                id: data.id,
                text: data.text,
                element: segments[0],
                segments: segments
              })
            }
          } else {
            const element = websiteContent.querySelector(`[data-highlight-id="${data.id}"]`) as HTMLElement
            if (element) {
              restoredHighlights.push({
                id: data.id,
                text: data.text,
                element: element
              })
            }
          }
          
          console.log(`高亮 ${data.id} 恢复成功`)
        } else {
          console.warn(`高亮 ${data.id} 恢复失败: 找不到文本节点`)
        }
      } catch (error) {
        console.error(`恢复高亮 ${data.id} 失败:`, error)
      }
    })

    // 一次性更新所有恢复的高亮到状态
    if (restoredHighlights.length > 0) {
      console.log('更新恢复的高亮到状态:', restoredHighlights)
      setHighlights(restoredHighlights)
    }
    
    // 恢复完成，允许自动保存
    setTimeout(() => {
      setIsRestoring(false)
    }, 100)
  }

  // 页面加载时恢复高亮数据
  useEffect(() => {
    if (isActive) {
      // 延迟执行确保DOM完全加载
      setTimeout(() => {
        console.log('尝试恢复高亮数据...')
        loadHighlightsFromStorage()
      }, 500) // 增加延迟时间
    }
  }, [isActive])

  // 用于防止恢复时触发自动保存
  const [isRestoring, setIsRestoring] = useState(false)

  // 监听 highlights 状态变化，自动保存到缓存 (暂时禁用，改为手动保存原始位置)
  useEffect(() => {
    if (isActive && highlights.length > 0 && !isRestoring) {
      console.log('检测到 highlights 状态变化，但目前使用手动保存原始位置')
      // saveCurrentHighlightsToStorage() // 暂时禁用
    }
  }, [highlights, isActive, isRestoring])

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

  // 创建新的高亮（用户选择时调用）
  const createHighlight = (range: Range, text: string) => {
    // 检查是否与现有高亮冲突
    const conflictCheck = checkHighlightConflicts(range)
    if (conflictCheck.hasConflict) {
      setConflictMessage(conflictCheck.reason)
      setTimeout(() => setConflictMessage(''), 3000) // 3秒后清除提示
      return
    }

    const highlightId = `highlight_${Date.now()}`
    
    // 在创建高亮之前保存原始位置信息
    const websiteContent = document.getElementById('website-content')
    if (websiteContent) {
      const originalData: HighlightData = {
        id: highlightId,
        text: text,
        color: highlightColor,
        timestamp: Date.now(),
        selector: '#website-content',
        startPath: getTextNodePath(range.startContainer, websiteContent),
        startOffset: range.startOffset,
        endPath: getTextNodePath(range.endContainer, websiteContent),
        endOffset: range.endOffset,
        isSegmented: range.startContainer !== range.endContainer
      }
      
      console.log('保存原始选择位置:', originalData)
      
      // 临时保存这个数据，稍后添加到状态中
      createHighlightFromRange(range, text, highlightColor, highlightId)
      
      // 手动保存这个高亮数据
      setTimeout(() => {
        const stored = localStorage.getItem('web-highlighter-data')
        const existingData: HighlightData[] = stored ? JSON.parse(stored) : []
        existingData.push(originalData)
        saveHighlightsToStorage(existingData)
      }, 100)
    }
    // 保存逻辑已通过 useEffect 自动处理
  }

  // 从 Range 创建高亮（支持持久化恢复）
  const createHighlightFromRange = (range: Range, text: string, color: string, id: string, isRestoring: boolean = false) => {
    // 检查是否跨元素选择
    if (range.startContainer === range.endContainer) {
      // 单元素选择，直接处理
      createSingleElementHighlight(range, text, color, id, isRestoring)
    } else {
      // 跨元素选择，分段处理
      createSegmentedHighlight(range, text, color, id, isRestoring)
    }
  }

  // 保存当前所有高亮数据到存储
  const saveCurrentHighlightsToStorage = () => {
    const websiteContent = document.getElementById('website-content')
    if (!websiteContent) return

    const highlightDataList: HighlightData[] = []
    
    // 直接基于当前的 highlights 状态来保存，这样更准确
    highlights.forEach(highlight => {
      try {
        // 获取实际的DOM元素
        let actualRange: Range | null = null
        
        if (highlight.segments && highlight.segments.length > 0) {
          // 分段高亮
          const firstSegment = highlight.segments[0]
          const lastSegment = highlight.segments[highlight.segments.length - 1]
          
          actualRange = document.createRange()
          const firstTextNode = firstSegment.firstChild
          const lastTextNode = lastSegment.lastChild
          
          if (firstTextNode && lastTextNode) {
            actualRange.setStart(firstTextNode, 0)
            actualRange.setEnd(lastTextNode, lastTextNode.textContent?.length || 0)
          }
        } else {
          // 单个高亮
          const element = highlight.element
          actualRange = document.createRange()
          const textNode = element.firstChild
          
          if (textNode) {
            actualRange.setStart(textNode, 0)
            actualRange.setEnd(textNode, textNode.textContent?.length || 0)
          }
        }
        
        if (actualRange) {
          const highlightData: HighlightData = {
            id: highlight.id,
            text: highlight.text,
            color: highlight.element.style.backgroundColor,
            timestamp: Date.now(),
            selector: '#website-content',
            startPath: getTextNodePath(actualRange.startContainer, websiteContent),
            startOffset: actualRange.startOffset,
            endPath: getTextNodePath(actualRange.endContainer, websiteContent),
            endOffset: actualRange.endOffset,
            isSegmented: !!(highlight.segments && highlight.segments.length > 0)
          }
          
          console.log('保存高亮数据:', highlightData)
          highlightDataList.push(highlightData)
        }
      } catch (error) {
        console.error('保存高亮数据失败:', error)
      }
    })
    
    console.log('准备保存到 localStorage:', highlightDataList)
    saveHighlightsToStorage(highlightDataList)
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

  const createSingleElementHighlight = (range: Range, text: string, color: string = highlightColor, id: string = `highlight_${Date.now()}`, isRestoring: boolean = false) => {
    const span = document.createElement('span')
    span.style.backgroundColor = color
    span.style.border = '1px solid #ffeaa7'
    span.style.borderRadius = '2px'
    span.className = 'web-highlighter-mark'
    span.setAttribute('data-highlighter', 'true')
    
    range.surroundContents(span)
    
    span.setAttribute('data-highlight-id', id)
    
    if (!isRestoring) {
      setHighlights(prev => [...prev, {
        id: id,
        text: text,
        element: span
      }])
    }
  }

  const createSegmentedHighlight = (range: Range, text: string, color: string = highlightColor, id: string = `highlight_${Date.now()}`, isRestoring: boolean = false) => {
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
        span.style.backgroundColor = color
        span.style.border = '1px solid #ffeaa7'
        span.style.borderRadius = '2px'
        span.className = 'web-highlighter-mark'
        span.setAttribute('data-highlighter', 'true')
        span.setAttribute('data-highlight-id', `${id}_${index}`)
        span.setAttribute('data-highlight-group', id)
        
        segmentRange.surroundContents(span)
        segments.push(span)
      }
    })
    
    // 将分段高亮作为一个组来管理
    if (!isRestoring) {
      setHighlights(prev => [...prev, {
        id: id,
        text: text,
        element: segments[0], // 主要元素用于兼容现有逻辑
        segments: segments    // 所有片段
      }])
    }
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
    
    // 从缓存中删除对应的高亮数据
    setTimeout(() => {
      const stored = localStorage.getItem('web-highlighter-data')
      if (stored) {
        const existingData: HighlightData[] = JSON.parse(stored)
        const filteredData = existingData.filter(data => data.id !== id)
        saveHighlightsToStorage(filteredData)
      }
    }, 100)
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
    
    // 清空缓存
    localStorage.removeItem('web-highlighter-data')
  }

  const changeHighlightColor = (color: string) => {
    setHighlightColor(color)
    // 更新已存在的高亮颜色
    const existingHighlights = document.querySelectorAll('[data-highlighter="true"]') as NodeListOf<HTMLElement>
    existingHighlights.forEach(element => {
      element.style.backgroundColor = color
    })
    
    // 颜色更新后，缓存会通过 useEffect 自动处理
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
          <li>文本会自动被高亮标记并<strong>保存到本地缓存</strong></li>
          <li>在扩展面板中管理你的高亮笔记</li>
          <li>可以更改高亮颜色或删除特定高亮</li>
          <li><strong>🔄 刷新页面</strong>后高亮数据会自动恢复</li>
          <li>点击 <strong>"测试刷新恢复"</strong> 按钮验证缓存功能</li>
        </ol>
      </div>
    </div>
  )
}

export default App
