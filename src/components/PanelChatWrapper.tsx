import { Chat } from "./Chat";

export function PanelChatWrapper() {
    return (
        <div className="h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
            <Chat />
        </div>
    );
}