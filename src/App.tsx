import { Website } from './components/Website'
import { Extension } from './components/Extension'
import { Instructions } from './components/Instructions'

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

      <Instructions />
    </div>
  )
}

export default App 