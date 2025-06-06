export function Instructions() {
  return (
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
  )
} 