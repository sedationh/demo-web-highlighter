import { HighlightData } from '../types/highlight'
import { STORAGE_KEY } from '../constants/colors'

// 从 localStorage 加载高亮数据
export const loadHighlightsFromStorage = (): HighlightData[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    console.log('localStorage 中的数据:', stored)
    if (stored) {
      const highlightDataList: HighlightData[] = JSON.parse(stored)
      console.log('解析后的高亮数据:', highlightDataList)
      return highlightDataList
    } else {
      console.log('没有找到缓存的高亮数据')
      return []
    }
  } catch (error) {
    console.error('加载高亮数据失败:', error)
    return []
  }
}

// 保存高亮数据到 localStorage
export const saveHighlightsToStorage = (highlightDataList: HighlightData[]) => {
  try {
    const dataString = JSON.stringify(highlightDataList)
    localStorage.setItem(STORAGE_KEY, dataString)
    console.log(`成功保存 ${highlightDataList.length} 个高亮到 localStorage`)
    console.log('保存的数据:', dataString)
  } catch (error) {
    console.error('保存高亮数据失败:', error)
  }
}

// 清空缓存
export const clearHighlightsFromStorage = () => {
  localStorage.removeItem(STORAGE_KEY)
} 