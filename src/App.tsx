import { useState } from 'react'

function App() {
  const [clickCount, setClickCount] = useState(0)

  return (
    <div className="card">
      <div className="card-content">
        <div className="badge">
          <span className="glow-dot"></span>
          React &bull; TS &bull; Vite
        </div>
        <h1 className="title">Hello World</h1>
        <p className="subtitle">
          Welcome to your new premium single-page application. Built with absolute design excellence, smooth motion, and extreme performance.
        </p>
        <button className="btn" onClick={() => setClickCount(prev => prev + 1)}>
          ✨ Interacted {clickCount} {clickCount === 1 ? 'time' : 'times'}
        </button>
        <div className="footer">
          Localhost Running &bull; Port 3000
        </div>
      </div>
    </div>
  )
}

export default App
