export function ExtensionInfo() {
  return (
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
  )
} 