import { useState } from 'react';
import { PDFUpload } from '@/components/PDFUpload';
import { PDFViewer } from '@/components/PDFViewer';
import { AnalysisPanel } from '@/components/AnalysisPanel';

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

  const handleFilesChange = (files: PDFFile[]) => {
    setUploadedFiles(files);
    // Automatically select the first PDF
    if (files.length > 0 && !currentPDF) {
      setCurrentPDF(files[0]);
    }
  };

  const handleAnalysisRequest = (type: string, text: string) => {
    // Generate demo responses based on type
    const getDemoResponse = (analysisType: string) => {
      switch (analysisType) {
        case 'summary':
          return `📝 Summary:\n\nThe selected text discusses key concepts related to business operations and strategic planning. The main points include:\n\n• Implementation of new processes\n• Risk assessment and mitigation strategies\n• Resource allocation and optimization\n• Timeline considerations for project delivery\n\nThis summary incorporates insights from the ${persona || 'analyst'} perspective with focus on ${task || 'general analysis'}.`;
        
        case 'insights':
          return `💡 Key Insights:\n\n1. **Strategic Opportunity**: The text reveals potential for process optimization\n\n2. **Risk Factors**: Several compliance considerations need attention\n\n3. **Resource Requirements**: Significant investment in training and infrastructure\n\n4. **Timeline Impact**: Implementation could affect Q2 deliverables\n\n5. **Stakeholder Impact**: Multiple departments will require coordination\n\nFrom a ${persona || 'business analyst'} viewpoint, this aligns with the ${task || 'operational review'} objectives.`;
        
        case 'counterpoints':
          return `🔍 Counterpoints & Alternative Perspectives:\n\n**Potential Challenges:**\n• The proposed approach may overlook regulatory constraints\n• Cost-benefit analysis appears optimistic\n• Timeline assumptions may be unrealistic\n\n**Alternative Viewpoints:**\n• Consider phased implementation instead of big-bang approach\n• Risk tolerance may vary across stakeholder groups\n• Market conditions could change during implementation\n\n**Questions to Consider:**\n• What if resource allocation is limited?\n• How would this impact existing workflows?\n• Are there industry best practices being overlooked?\n\nAs a ${persona || 'critical reviewer'} focused on ${task || 'comprehensive analysis'}, these considerations warrant discussion.`;
        
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
    <div className="h-screen flex bg-background">
      {/* Left Sidebar - PDF List */}
      <div className="w-80 bg-sidebar-bg border-r border-sidebar-border flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="text-xl font-bold">PDF Analysis Tool</h1>
          <p className="text-sm text-muted-foreground">Upload and analyze PDF documents</p>
        </div>
        
        <PDFUpload 
          onFilesChange={handleFilesChange}
          uploadedFiles={uploadedFiles}
        />
        
        {uploadedFiles.length > 0 && (
          <div className="flex-1 p-4">
            <h3 className="text-sm font-medium mb-2">Select PDF to view:</h3>
            <div className="space-y-1">
              {uploadedFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setCurrentPDF(file)}
                  className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                    currentPDF?.id === file.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-secondary'
                  }`}
                >
                  {file.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Center - PDF Viewer */}
      <div className="flex-1 p-6">
        {currentPDF ? (
          <PDFViewer
            pdfUrl={currentPDF.url}
            fileName={currentPDF.name}
            onAnalysisRequest={handleAnalysisRequest}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-pdf-viewer rounded-lg">
            <div className="text-center text-muted-foreground">
              <div className="text-6xl mb-4">📄</div>
              <h2 className="text-xl font-semibold mb-2">No PDF Selected</h2>
              <p>Upload a PDF file to start viewing and analyzing</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Analysis */}
      <div className="w-96">
        <AnalysisPanel
          analysisResults={analysisResults}
          persona={persona}
          task={task}
          onPersonaChange={setPersona}
          onTaskChange={setTask}
        />
      </div>
    </div>
  );
};

export default Index;
