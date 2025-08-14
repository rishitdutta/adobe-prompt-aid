
import { useEffect, useRef, useState } from 'react';
import { Lightbulb, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PDFViewerProps {
  pdfUrl: string;
  fileName: string;
  onAnalysisRequest: (type: string, text: string) => void;
}

declare global {
  interface Window {
    AdobeDC: any;
  }
}

export function PDFViewer({ pdfUrl, fileName, onAnalysisRequest }: PDFViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState('');
  const [lightbulbPosition, setLightbulbPosition] = useState({ x: 0, y: 0, show: false });
  const adobeViewRef = useRef<any>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://acrobatservices.adobe.com/view-sdk/viewer.js';
    document.head.appendChild(script);

    const handleAdobeReady = () => {
      if (pdfUrl && viewerRef.current) {
        initializeViewer();
      }
    };

    document.addEventListener("adobe_dc_view_sdk.ready", handleAdobeReady);

    return () => {
      const existingScript = document.querySelector('script[src="https://acrobatservices.adobe.com/view-sdk/viewer.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
      document.removeEventListener("adobe_dc_view_sdk.ready", handleAdobeReady);
      if (adobeViewRef.current) {
        adobeViewRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (window.AdobeDC && pdfUrl && viewerRef.current) {
      initializeViewer();
    }
  }, [pdfUrl, fileName]);

  const initializeViewer = () => {
    if (!window.AdobeDC || !viewerRef.current || !pdfUrl) return;

    // Properly cleanup previous viewer
    if (adobeViewRef.current) {
      try {
        // Clean up any existing callbacks or resources if available
        adobeViewRef.current = null;
      } catch (error) {
        console.warn('Error cleaning up previous viewer:', error);
      }
    }

    // Clear the container
    if (viewerRef.current) {
      viewerRef.current.innerHTML = '';
    }

    // Small delay to ensure cleanup is complete
    setTimeout(() => {
      if (!viewerRef.current || !pdfUrl) return;

      const adobeDCView = new window.AdobeDC.View({
        clientId: "2714765ac12d4f3eab4711783c106709",
        divId: viewerRef.current.id
      });

      adobeDCView.previewFile({
        content: { location: { url: pdfUrl } },
        metaData: { fileName: fileName }
      }, {
        embedMode: "SIZED_CONTAINER",
        showLeftHandPanel: false,
        showDownloadPDF: false,
        showPrintPDF: false,
        showAnnotationTools: false
      });

      adobeViewRef.current = adobeDCView;

      // Register text selection callback with error handling
      try {
        if (window.AdobeDC?.View?.Enum?.CallbackType?.TEXT_SELECTION) {
          adobeDCView.registerCallback(
            window.AdobeDC.View.Enum.CallbackType.TEXT_SELECTION,
            (event: any) => {
              if (event.data && event.data.text) {
                setSelectedText(event.data.text);
                // Position lightbulb near selection
                setLightbulbPosition({
                  x: 20,
                  y: 20,
                  show: true
                });
              } else {
                setLightbulbPosition(prev => ({ ...prev, show: false }));
              }
            }
          );
        }
      } catch (error) {
        console.warn('Error registering text selection callback:', error);
      }
    }, 100);
  };

  const handleAnalysisClick = (type: string) => {
    onAnalysisRequest(type, selectedText);
    setLightbulbPosition(prev => ({ ...prev, show: false }));
  };

  return (
    <div className="relative h-full w-full bg-pdf-viewer rounded-lg">
      <div
        ref={viewerRef}
        id="adobe-dc-view"
        className="h-full w-full"
      />
      
      {lightbulbPosition.show && (
        <div
          className="absolute z-10"
          style={{
            left: lightbulbPosition.x,
            top: lightbulbPosition.y,
          }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="h-8 w-8 p-0 bg-lightbulb border-lightbulb-border hover:bg-lightbulb/80"
                variant="outline"
              >
                <Lightbulb className="h-4 w-4 text-yellow-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem 
                onClick={() => handleAnalysisClick('summary')}
                className="hover:bg-option-hover"
              >
                Generate Summary
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleAnalysisClick('insights')}
                className="hover:bg-option-hover"
              >
                Generate Key Insights
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleAnalysisClick('counterpoints')}
                className="hover:bg-option-hover"
              >
                Generate Counterpoints
              </DropdownMenuItem>
              <DropdownMenuItem 
                disabled
                className="text-muted-foreground"
              >
                Generate Podcast (Coming Soon)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {!pdfUrl && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <FileText className="mx-auto h-16 w-16 mb-4" />
            <p>Upload a PDF to start viewing</p>
          </div>
        </div>
      )}
    </div>
  );
}
