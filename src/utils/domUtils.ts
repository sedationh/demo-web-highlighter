// 获取文本节点在父容器中的路径
export const getTextNodePath = (textNode: Node, container: Element): number[] => {
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
export const getTextNodeByPath = (path: number[], container: Element): Node | null => {
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

// 创建高亮元素的基础样式
export const createHighlightElement = (color: string, id: string, isSegment: boolean = false, segmentIndex?: number): HTMLSpanElement => {
  const span = document.createElement('span')
  span.style.backgroundColor = color
  span.style.border = '1px solid #ffeaa7'
  span.style.borderRadius = '2px'
  span.className = 'web-highlighter-mark'
  span.setAttribute('data-highlighter', 'true')
  
  if (isSegment && segmentIndex !== undefined) {
    span.setAttribute('data-highlight-id', `${id}_${segmentIndex}`)
    span.setAttribute('data-highlight-group', id)
  } else {
    span.setAttribute('data-highlight-id', id)
  }
  
  return span
}

// 移除高亮元素，恢复原始文本
export const removeHighlightElement = (element: HTMLElement) => {
  const parent = element.parentNode
  if (parent) {
    parent.insertBefore(document.createTextNode(element.textContent || ''), element)
    parent.removeChild(element)
  }
} 