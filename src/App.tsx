import { useState } from 'react'
import type { View } from './types'
import { ToastProvider } from './context/ToastContext'
import { HomeView } from './views/HomeView'
import { GridView } from './views/GridView'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [jsonText, setJsonText] = useState('')

  return (
    <ToastProvider>
      {view === 'home' ? (
        <HomeView
          initialText={jsonText}
          onSubmit={(text) => {
            setJsonText(text)
            setView('grid')
          }}
        />
      ) : (
        <GridView
          jsonText={jsonText}
          onChangeJson={setJsonText}
          onHome={() => setView('home')}
        />
      )}
    </ToastProvider>
  )
}
