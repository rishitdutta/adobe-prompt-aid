import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface AnalysisResult {
  id: string;
  type: string;
  text: string;
  result: string;
  timestamp: Date;
}

interface AnalysisPanelProps {
  analysisResults: AnalysisResult[];
  persona: string;
  task: string;
  onPersonaChange: (value: string) => void;
  onTaskChange: (value: string) => void;
}

export function AnalysisPanel({ 
  analysisResults, 
  persona, 
  task, 
  onPersonaChange, 
  onTaskChange 
}: AnalysisPanelProps) {
  
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'summary':
        return 'bg-blue-100 text-blue-800';
      case 'insights':
        return 'bg-green-100 text-green-800';
      case 'counterpoints':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'summary':
        return 'Summary';
      case 'insights':
        return 'Key Insights';
      case 'counterpoints':
        return 'Counterpoints';
      default:
        return type;
    }
  };

  return (
    <div className="h-full bg-analysis-panel border-l border-sidebar-border flex flex-col">
      {/* Analysis Results Area */}
      <div className="flex-1 p-4">
        <h2 className="text-lg font-semibold mb-4">Analysis Results</h2>
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {analysisResults.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>Select text from the PDF and click the lightbulb to generate analysis</p>
              </div>
            ) : (
              analysisResults.map((result) => (
                <div key={result.id} className="space-y-2 p-3 bg-card rounded-lg border">
                  <div className="flex items-center justify-between">
                    <Badge className={getTypeColor(result.type)}>
                      {getTypeLabel(result.type)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="text-xs bg-muted p-2 rounded">
                    <strong>Selected text:</strong> "{result.text.substring(0, 100)}..."
                  </div>
                  
                  <div className="text-sm space-y-2">
                    <div className="whitespace-pre-wrap">{result.result}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      {/* Input Fields */}
      <div className="p-4 space-y-4 bg-secondary/30">
        <div className="space-y-2">
          <Label htmlFor="persona" className="text-sm font-medium">
            Persona
          </Label>
          <Input
            id="persona"
            placeholder="e.g., Legal Expert, Business Analyst..."
            value={persona}
            onChange={(e) => onPersonaChange(e.target.value)}
            className="bg-background"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="task" className="text-sm font-medium">
            Task
          </Label>
          <Input
            id="task"
            placeholder="e.g., Contract Review, Market Analysis..."
            value={task}
            onChange={(e) => onTaskChange(e.target.value)}
            className="bg-background"
          />
        </div>
      </div>
    </div>
  );
}