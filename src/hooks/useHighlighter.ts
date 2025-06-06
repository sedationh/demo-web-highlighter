import { useState, useEffect, useCallback } from 'react'
import { HighlightData, HighlightState } from '../types/highlight'
import { DEFAULT_HIGHLIGHT_COLOR } from '../constants/colors'
import { loadHighlightsFromStorage, saveHighlightsToStorage, clearHighlightsFromStorage } from '../utils/storage'
import { getTextNodePath, getTextNodeByPath, createHighlightElement, removeHighlightElement } from '../utils/domUtils'
import { checkHighlightConflicts, generateHighlightId } from '../utils/highlightUtils'

export const useHighlighter = () => {
  const [isActive, setIsActive] = useState(true)
  const [highlights, setHighlights] = useState<HighlightState[]>([])
  const [highlightColor, setHighlightColor] = useState(DEFAULT_HIGHLIGHT_COLOR)
  const [conflictMessage, setConflictMessage] = useState('')

  // 从存储的数据恢复高亮
  const restoreHighlights = useCallback((highlightDataList: HighlightData[]) => {
    const websiteContent = document.getElementById('website-content')
    console.log('网站内容元素:', websiteContent)
    if (!websiteContent) {
      console.error('找不到 website-content 元素')
      return
    }

    console.log(`开始恢复 ${highlightDataList.length} 个高亮`)
    const restoredHighlights: HighlightState[] = []

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

          // 重建高亮
          createHighlightFromRange(range, data.text, data.color, data.id, true, restoredHighlights)

          console.log(`高亮 ${data.id} 恢复成功`)
        } else {
          console.warn(`高亮 ${data.id} 恢复失败: 找不到文本节点`)
        }
      } catch (error) {
        console.error(`恢复高亮 ${data.id} 失败:`, error)
      }
    })

    if (restoredHighlights.length > 0) {
      console.log('更新恢复的高亮到状态:', restoredHighlights)
      setHighlights(restoredHighlights)
    }
  }, [])

  // 创建高亮（用户选择时调用）
  const createHighlight = useCallback((range: Range, text: string) => {
    const conflictCheck = checkHighlightConflicts(range)
    if (conflictCheck.hasConflict) {
      setConflictMessage(conflictCheck.reason || '选择范围存在冲突')
      setTimeout(() => setConflictMessage(''), 3000)
      return
    }

    const highlightId = generateHighlightId()

    const containerSelector = '#website-content'
    const containerDom = document.querySelector(containerSelector)
    if (!containerDom) {
      console.error('containerDom is not found', containerSelector)
      return
    }

    const originalData: HighlightData = {
      id: highlightId,
      text: text,
      color: highlightColor,
      timestamp: Date.now(),
      selector: containerSelector,
      startPath: getTextNodePath(range.startContainer, containerDom),
      startOffset: range.startOffset,
      endPath: getTextNodePath(range.endContainer, containerDom),
      endOffset: range.endOffset,
      isSegmented: range.startContainer !== range.endContainer
    }

    console.log('保存原始选择位置:', originalData)

    createHighlightFromRange(range, text, highlightColor, highlightId)

    const stored = loadHighlightsFromStorage()
    const updatedData = [...stored, originalData]
    saveHighlightsToStorage(updatedData)

  }, [highlightColor])

  // 从 Range 创建高亮（支持持久化恢复）
  const createHighlightFromRange = useCallback((
    range: Range,
    text: string,
    color: string,
    id: string,
    isRestoringMode: boolean = false,
    restoredHighlights?: HighlightState[]
  ) => {
    if (range.startContainer === range.endContainer) {
      createSingleElementHighlight(range, text, color, id, isRestoringMode, restoredHighlights)
    } else {
      createSegmentedHighlight(range, text, color, id, isRestoringMode, restoredHighlights)
    }
  }, [])

  // 创建单元素高亮
  const createSingleElementHighlight = useCallback((
    range: Range,
    text: string,
    color: string,
    id: string,
    isRestoringMode: boolean = false,
    restoredHighlights?: HighlightState[]
  ) => {
    const span = createHighlightElement(color, id)
    range.surroundContents(span)

    const newHighlight: HighlightState = {
      id: id,
      text: text,
      element: span
    }

    if (isRestoringMode && restoredHighlights) {
      restoredHighlights.push(newHighlight)
    } else if (!isRestoringMode) {
      setHighlights(prev => [...prev, newHighlight])
    }
  }, [])

  // 创建分段高亮
  const createSegmentedHighlight = useCallback((
    range: Range,
    text: string,
    color: string,
    id: string,
    isRestoringMode: boolean = false,
    restoredHighlights?: HighlightState[]
  ) => {
    const segments: HTMLElement[] = []

    const walker = document.createTreeWalker(
      range.commonAncestorContainer,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
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

    textNodes.forEach((textNode, index) => {
      let startOffset = 0
      let endOffset = textNode.textContent?.length || 0

      if (textNode === range.startContainer) {
        startOffset = range.startOffset
      }
      if (textNode === range.endContainer) {
        endOffset = range.endOffset
      }

      if (startOffset < endOffset) {
        const segmentRange = document.createRange()
        segmentRange.setStart(textNode, startOffset)
        segmentRange.setEnd(textNode, endOffset)

        const span = createHighlightElement(color, id, true, index)
        segmentRange.surroundContents(span)
        segments.push(span)
      }
    })

    const newHighlight: HighlightState = {
      id: id,
      text: text,
      element: segments[0],
      segments: segments
    }

    if (isRestoringMode && restoredHighlights) {
      restoredHighlights.push(newHighlight)
    } else if (!isRestoringMode) {
      setHighlights(prev => [...prev, newHighlight])
    }
  }, [])

  // 移除高亮
  const removeHighlight = useCallback((id: string) => {
    const highlight = highlights.find(h => h.id === id)
    if (!highlight) return

    if (highlight.segments && highlight.segments.length > 0) {
      highlight.segments.forEach(segment => {
        removeHighlightElement(segment)
      })
    } else {
      removeHighlightElement(highlight.element)
    }

    setHighlights(prev => prev.filter(h => h.id !== id))

    setTimeout(() => {
      const stored = loadHighlightsFromStorage()
      const filteredData = stored.filter(data => data.id !== id)
      saveHighlightsToStorage(filteredData)
    }, 100)
  }, [highlights])

  // 移除所有高亮
  const removeAllHighlights = useCallback(() => {
    const highlightElements = document.querySelectorAll('[data-highlighter="true"]')
    highlightElements.forEach(element => {
      removeHighlightElement(element as HTMLElement)
    })
    setHighlights([])
    clearHighlightsFromStorage()
  }, [])

  // 更改高亮颜色
  const changeHighlightColor = useCallback((color: string) => {
    setHighlightColor(color)
  }, [])

  // 切换扩展状态
  const toggleExtension = useCallback(() => {
    setIsActive(!isActive)
    if (isActive) {
      removeAllHighlights()
    }
  }, [isActive, removeAllHighlights])

  // 页面加载时恢复高亮数据
  useEffect(() => {
    if (isActive) {
      setTimeout(() => {
        console.log('尝试恢复高亮数据...')
        const stored = loadHighlightsFromStorage()
        if (stored.length > 0) {
          restoreHighlights(stored)
        }
      }, 500)
    }
  }, [isActive, restoreHighlights])

  return {
    isActive,
    highlights,
    highlightColor,
    conflictMessage,
    createHighlight,
    removeHighlight,
    removeAllHighlights,
    changeHighlightColor,
    toggleExtension
  }
} 