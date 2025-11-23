import { useState, useEffect } from 'react';
import "./App.css";
import GraphCanvas from './components/GraphCanvas';
import TutorialOverlay from './components/TutorialOverlay';
import ExamplesMenu from './components/ExamplesMenu';
import { createSimpsonsParadox } from './content/ExampleGraphs';
import { CausalGraph } from './engine/Graph';
import { Button } from './components/ui/button';
import { Separator } from './components/ui/separator';
import { RotateCcw, Moon, Sun, BookOpen } from 'lucide-react';

function App() {
  const [graph, setGraph] = useState<CausalGraph>(() => createSimpsonsParadox());
  const [isDark, setIsDark] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className={`w-screen h-screen flex flex-col bg-background text-foreground overflow-hidden`}>
      <TutorialOverlay isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
      
      {/* Header */}
      <header className="h-14 border-b flex items-center px-6 bg-card z-10 justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Causal<span className="font-light text-muted-foreground">Lab</span>
            </h1>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <ExamplesMenu onSelectGraph={setGraph} />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowTutorial(true)} className="gap-2 hidden md:flex">
            <BookOpen size={16} />
            Concepts
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setGraph(createSimpsonsParadox())} title="Reset Graph">
            <RotateCcw size={18} />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle Theme">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </div>
      </header>
      
      {/* Main Layout */}
      <main className="flex-1 relative flex overflow-hidden">
        {/* Left Sidebar (Optional - for future tools) */}
        {/* <aside className="w-64 border-r bg-card p-4 hidden md:block">
          <div className="text-sm font-medium text-muted-foreground mb-4">Tools</div>
          <div className="space-y-2">
            <Button variant="secondary" className="w-full justify-start">Selection Tool</Button>
            <Button variant="ghost" className="w-full justify-start">Add Node</Button>
          </div>
        </aside> */}

        {/* Canvas Area */}
        <div className="flex-1 relative bg-secondary/20">
          <GraphCanvas graph={graph} />
        </div>
      </main>
    </div>
  );
}

export default App;
