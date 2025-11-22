import { useState } from 'react';
import { BookOpen, X, GraduationCap, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { concepts, type DifficultyLevel } from '../content/TutorialContent';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const TutorialOverlay = ({ isOpen, onClose }: TutorialOverlayProps) => {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intuitive');
  const [activeConceptId, setActiveConceptId] = useState(concepts[0].id);

  const activeConcept = concepts.find(c => c.id === activeConceptId) || concepts[0];

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl h-[80vh] bg-white dark:bg-slate-950 border border-border rounded-2xl flex overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Sidebar */}
        <div className="w-64 bg-muted/30 border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
              <BookOpen size={20} className="text-primary" />
              Causal Lab
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {concepts.map(concept => (
              <button
                key={concept.id}
                onClick={() => setActiveConceptId(concept.id)}
                className={clsx(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                  activeConceptId === concept.id
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {concept.title}
              </button>
            ))}
          </div>

          {/* Difficulty Toggle */}
          <div className="p-4 border-t bg-muted/50">
            <div className="flex bg-background p-1 rounded-lg border">
              <button
                onClick={() => setDifficulty('intuitive')}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all",
                  difficulty === 'intuitive'
                    ? "bg-card text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Sparkles size={12} />
                Intuitive
              </button>
              <button
                onClick={() => setDifficulty('phd')}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all",
                  difficulty === 'phd'
                    ? "bg-card text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <GraduationCap size={12} />
                PhD Level
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-card">
          <div className="p-6 border-b flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">{activeConcept.title}</h1>
              <div className="flex items-center gap-2">
                <Badge variant={difficulty === 'intuitive' ? 'secondary' : 'default'}>
                  {difficulty === 'intuitive' ? 'Intuitive Explanation' : 'Formal Definition'}
                </Badge>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
            >
              <X size={20} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 prose dark:prose-invert max-w-none">
            <div className="text-lg leading-relaxed text-foreground">
              <ReactMarkdown 
                remarkPlugins={[remarkMath]} 
                rehypePlugins={[rehypeKatex]}
                components={{
                  p: ({node, ...props}) => <p className="mb-4 text-foreground" {...props} />,
                  strong: ({node, ...props}) => <strong className="text-primary font-semibold" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 space-y-2 text-foreground" {...props} />,
                  li: ({node, ...props}) => <li className="text-foreground" {...props} />,
                  code: ({node, ...props}) => <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-accent-foreground" {...props} />,
                  h1: ({node, ...props}) => <h1 className="text-foreground font-bold text-2xl mb-4" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-foreground font-bold text-xl mb-3" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-foreground font-bold text-lg mb-2" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4" {...props} />,
                }}
              >
                {difficulty === 'intuitive' ? activeConcept.intuitive : activeConcept.phd}
              </ReactMarkdown>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TutorialOverlay;
