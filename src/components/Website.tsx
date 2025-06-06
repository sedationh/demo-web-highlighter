// 普通网页组件 - 只是静态内容展示
export function Website() {
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