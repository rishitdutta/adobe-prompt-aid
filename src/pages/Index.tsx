
import { useState, useRef } from 'react';
import { PDFUpload } from '@/components/PDFUpload';
import { PDFViewer } from '@/components/PDFViewer';
import { PDFSidebar } from '@/components/PDFSidebar';
import { AnalysisPanel } from '@/components/AnalysisPanel';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';

interface PDFFile {
  id: string;
  name: string;
  url: string;
  file: File;
}

interface AnalysisResult {
  id: string;
  type: string;
  text: string;
  result: string;
  timestamp: Date;
}

const Index = () => {
  const [uploadedFiles, setUploadedFiles] = useState<PDFFile[]>([]);
  const [currentPDF, setCurrentPDF] = useState<PDFFile | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [persona, setPersona] = useState('');
  const [task, setTask] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = (files: PDFFile[]) => {
    setUploadedFiles(files);
    if (files.length > 0 && !currentPDF) {
      setCurrentPDF(files[0]);
    }
  };

  const handleFileRemove = (fileId: string) => {
    setUploadedFiles(prev => {
      const filtered = prev.filter(f => f.id !== fileId);
      if (currentPDF?.id === fileId) {
        setCurrentPDF(filtered.length > 0 ? filtered[0] : null);
      }
      return filtered;
    });
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleAnalysisRequest = (type: string, text: string) => {
    const getDemoResponse = (analysisType: string) => {
      switch (analysisType) {
        case 'summary':
          return `📝 Summary:\n\nThe selected text discusses key concepts related to business operations and strategic planning. The main points include:\n\n• Implementation of new processes\n• Risk assessment and mitigation strategies\n• Resource allocation and optimization\n• Timeline considerations for project delivery\n\nThis summary incorporates insights from the ${persona || 'analyst'} perspective with focus on ${task || 'general analysis'}.`;
        
        case 'insights':
          return `💡 Key Insights:\n\n1. **Strategic Opportunity**: The text reveals potential for process optimization\n\n2. **Risk Factors**: Several compliance considerations need attention\n\n3. **Resource Requirements**: Significant investment in training and infrastructure\n\n4. **Timeline Impact**: Implementation could affect Q2 deliverables\n\n5. **Stakeholder Impact**: Multiple departments will require coordination\n\nFrom a ${persona || 'business analyst'} viewpoint, this aligns with the ${task || 'operational review'} objectives.`;
        
        case 'counterpoints':
          return `🔍 Counterpoints & Alternative Perspectives:\n\n**Potential Challenges:**\n• The proposed approach may overlook regulatory constraints\n• Cost-benefit analysis appears optimistic\n• Timeline assumptions may be unrealistic\n\n**Alternative Viewpoints:**\n• Consider phased implementation instead of big-bang approach\n• Risk tolerance may vary across stakeholder groups\n• Market conditions could change during implementation\n\n**Questions to Consider:**\n• What if resource allocation is limited?\n• How would this impact existing workflows?\n• Are there industry best practices being overlooked?\n\nAs a ${persona || 'critical reviewer'} focused on ${task || 'comprehensive analysis'}, these considerations warrant discussion.`;
        
        case 'facts':
          return `🔍 Did You Know?\n\n**Interesting Facts & Context:**\n• Industry studies show similar implementations have 78% success rate\n• Best practices suggest 3-6 month timeline for comparable projects\n• Research indicates stakeholder buy-in increases success by 40%\n\n**Historical Context:**\n• Similar initiatives in 2022-2023 faced budget overruns\n• Market leaders typically allocate 15-20% more resources\n• Regulatory changes in this area are expected Q3\n\n**Related Insights:**\n• 92% of companies report improved efficiency post-implementation\n• Training costs average 12% of total project budget\n• Risk mitigation saves 25% in long-term operational costs\n\nFrom a ${persona || 'research analyst'} perspective on ${task || 'fact-finding'}, these data points provide valuable context.`;
        
        default:
          return 'Analysis complete. Results processed successfully.';
      }
    };

    const newResult: AnalysisResult = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      text,
      result: getDemoResponse(type),
      timestamp: new Date()
    };

    setAnalysisResults(prev => [newResult, ...prev]);
  };

  return (
    <div className="h-screen bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Left Sidebar */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <PDFSidebar
            uploadedFiles={uploadedFiles}
            currentPDF={currentPDF}
            onFileSelect={setCurrentPDF}
            onFileRemove={handleFileRemove}
            onFileUpload={handleFileUpload}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Center - PDF Viewer */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full p-6">
            {currentPDF ? (
              <PDFViewer
                pdfUrl={currentPDF.url}
                fileName={currentPDF.name}
                onAnalysisRequest={handleAnalysisRequest}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-pdf-viewer rounded-lg border-2 border-dashed border-border">
                <div className="text-center text-muted-foreground">
                  <div className="text-6xl mb-4">📄</div>
                  <h2 className="text-xl font-semibold mb-2">No PDF Selected</h2>
                  <p>Upload a PDF file to start viewing and analyzing</p>
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Analysis */}
        <ResizablePanel defaultSize={30} minSize={25} maxSize={40}>
          <AnalysisPanel
            analysisResults={analysisResults}
            persona={persona}
            task={task}
            onPersonaChange={setPersona}
            onTaskChange={setTask}
          />
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Hidden file input */}
      <PDFUpload 
        onFilesChange={handleFilesChange}
        uploadedFiles={uploadedFiles}
        ref={fileInputRef}
      />
    </div>
  );
};

export default Index;
