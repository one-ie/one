import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Chat } from "@/components/Chat";

interface RightPanelProps {
    children?: React.ReactNode;
    panelContent?: React.ReactNode;
    defaultWidth?: "quarter" | "half";
    defaultOpen?: boolean;
}

export function RightPanel({ 
    children, 
    defaultWidth = "quarter",
    defaultOpen = true 
}: RightPanelProps) {
    const [isPanelOpen, setIsPanelOpen] = useState(defaultOpen);
    const [panelWidth, setPanelWidth] = useState<"quarter" | "half">(defaultWidth);

    useEffect(() => {
        setIsPanelOpen(defaultOpen);
    }, [defaultOpen]);

    return (
        <div className="flex h-screen w-full">
            {/* Main Content */}
            <div
                className={`flex-1 transition-all duration-300 ${
                    isPanelOpen 
                        ? panelWidth === "quarter" 
                            ? "w-3/4" 
                            : "w-1/2" 
                        : "w-full"
                }`}
            >
                <div className="h-full overflow-auto">
                    {children}
                </div>
            </div>

            {/* Right Panel */}
            <div
                className={`fixed right-0 top-0 h-full bg-background border-l shadow-2xl transition-all duration-300 ${
                    isPanelOpen
                        ? panelWidth === "quarter"
                            ? "w-1/4"
                            : "w-1/2"
                        : "w-0 overflow-hidden"
                }`}
            >
                <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b bg-background/95 backdrop-blur sticky top-0 z-10">
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={() => setPanelWidth("quarter")}
                                variant={panelWidth === "quarter" ? "default" : "outline"}
                            >
                                1/4
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setPanelWidth("half")}
                                variant={panelWidth === "half" ? "default" : "outline"}
                            >
                                1/2
                            </Button>
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsPanelOpen(false)}
                            className="hover:bg-destructive/10"
                        >
                            ✕
                        </Button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <Chat />
                    </div>
                </div>
            </div>
        </div>
    );
}