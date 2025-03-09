import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Chat } from "@/components/Chat";
import { SidebarApp } from "@/components/ChatSidebar";
import { MessageSquare, PanelLeft } from "lucide-react";

// MainContent wrapper to handle responsive layout
const MainContent = () => {
  const { state: leftState } = useSidebar();
  
  return (
    <div 
      className={`
        flex-1 h-[calc(100vh-3.5rem)] 
        transition-[margin] duration-300 ease-in-out
        ${leftState === 'expanded' ? 'md:ml-64' : 'ml-0'}
      `}
    >
      <div className="h-full p-4">
        <div className="h-full rounded-lg border bg-card p-4">
          Main content goes here
        </div>
      </div>
    </div>
  );
};

// Right sidebar content wrapper
const RightSidebar = () => {
  const { state } = useSidebar();
  return (
    <>
      <div className="fixed right-4 top-[13px] z-50">
        <SidebarTrigger className="h-8 w-8 bg-background hover:bg-accent hover:text-accent-foreground">
          <MessageSquare className="h-4 w-4" />
          <span className="sr-only">Toggle Chat</span>
        </SidebarTrigger>
      </div>
      <Sidebar
        side="right"
        collapsible="offcanvas"
        className={`
          fixed top-0 h-screen w-[400px] border-l bg-background shadow-lg
          transition-[right] duration-300 ease-in-out
          ${state === 'expanded' ? 'right-0' : '-right-[400px]'}
        `}
      >
        <div className="pt-14">
          <Chat />
        </div>
      </Sidebar>
    </>
  );
};

export default function DualChatPage() {
  return (
    <div className="flex min-h-screen overflow-hidden bg-background">
      {/* Left navigation */}
      <SidebarProvider defaultOpen={false}>
        <SidebarApp />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="sticky top-0 z-20 flex h-14 items-center gap-4 border-b bg-background px-4">
            <SidebarTrigger>
              <PanelLeft className="h-4 w-4" />
              <span className="sr-only">Toggle Navigation</span>
            </SidebarTrigger>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex-1">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>ONE</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </div>

          {/* Main content with responsive margins */}
          <MainContent />
        </div>
      </SidebarProvider>

      {/* Right chat sidebar */}
      <SidebarProvider defaultOpen={false}>
        <RightSidebar />
      </SidebarProvider>
    </div>
  );
}