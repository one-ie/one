import * as React from "react";
import { Card } from "./card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

export interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
}

interface TabsContainerProps {
  items: TabItem[];
  defaultValue?: string;
  className?: string;
  gridCols?: number;
}

export function TabsContainer({ 
  items, 
  defaultValue, 
  className = '',
  gridCols = 4 
}: TabsContainerProps) {
  const [mounted, setMounted] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(defaultValue || items[0]?.value);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className={`grid w-full grid-cols-${gridCols}`}>
          {items.map((item) => (
            <TabsTrigger 
              key={item.value} 
              value={item.value}
              className="data-[state=active]:bg-background data-[state=active]:text-foreground"
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {items.map((item) => (
          <TabsContent 
            key={item.value} 
            value={item.value}
            className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Card className="p-6">
              {item.content}
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 