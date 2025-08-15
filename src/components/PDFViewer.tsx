
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

      // Register text selection callback using EVENT_LISTENER
      try {
        const previewFilePromise = Promise.resolve(adobeDCView);
        
        adobeDCView.registerCallback(
          window.AdobeDC.View.Enum.CallbackType.EVENT_LISTENER,
          function(event: any) {
            console.log('Adobe event:', event);
            if (event.type === "PREVIEW_SELECTION_END") {
              previewFilePromise.then(adobeViewer => {
                adobeViewer.getAPIs().then((apis: any) => {
                  apis.getSelectedContent()
                    .then((result: any) => {
                      console.log('Selected content:', result);
                      if (result && result.data && result.data.length > 0) {
                        const selectedText = result.data.map((item: any) => item.text || '').join(' ').trim();
                        if (selectedText) {
                          setSelectedText(selectedText);
                          // Position lightbulb near the center of the viewer
                          setLightbulbPosition({
                            x: 50,
                            y: 100,
                            show: true
                          });
                        }
                      }
                    })
                    .catch((error: any) => {
                      console.warn('Error getting selected content:', error);
                    });
                }).catch((error: any) => {
                  console.warn('Error getting APIs:', error);
                });
              });
            } else if (event.type === "PREVIEW_SELECTION_START") {
              // Hide lightbulb when starting new selection
              setLightbulbPosition(prev => ({ ...prev, show: false }));
            }
          },
          { enableFilePreviewEvents: true }
        );
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
          className="absolute z-50 animate-in fade-in-0 zoom-in-95 duration-200"
          style={{
            left: lightbulbPosition.x,
            top: lightbulbPosition.y,
          }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="h-10 w-10 p-0 bg-amber-50 border-amber-200 hover:bg-amber-100 shadow-lg dark:bg-amber-900/20 dark:border-amber-700 dark:hover:bg-amber-900/30"
                variant="outline"
              >
                <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <DropdownMenuItem 
                onClick={() => handleAnalysisClick('summary')}
                className="cursor-pointer hover:bg-accent"
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate Summary
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleAnalysisClick('insights')}
                className="cursor-pointer hover:bg-accent"
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                Key Insights
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleAnalysisClick('counterpoints')}
                className="cursor-pointer hover:bg-accent"
              >
                <div className="mr-2 h-4 w-4 flex items-center justify-center text-xs font-bold">⚡</div>
                Counterpoints
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleAnalysisClick('facts')}
                className="cursor-pointer hover:bg-accent"
              >
                <div className="mr-2 h-4 w-4 flex items-center justify-center text-xs font-bold">💡</div>
                Did You Know?
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
