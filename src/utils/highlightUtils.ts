import { ConflictCheckResult } from '../types/highlight'

// 检查高亮冲突
export const checkHighlightConflicts = (range: Range): ConflictCheckResult => {
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

// 生成唯一的高亮ID
export const generateHighlightId = (): string => {
  return `highlight_${Date.now()}`
}

// 截断文本用于显示
export const truncateText = (text: string, maxLength: number = 50): string => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
} 