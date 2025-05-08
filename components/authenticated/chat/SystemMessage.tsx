import * as React from "react";
import { Doc } from "convex/_generated/dataModel";
import { useTimeAgo } from "@/components/misc/hooks";
import { InfoIcon, MoreHorizontalIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  message: Doc<"conversationMessages">;
}

export const SystemMessage: React.FC<Props> = ({ message }) => {
  if (message.kind != "system")
    throw new Error("Message is not a system message");

  const timeAgo = useTimeAgo(message._creationTime);
  const hasMeta = message.meta !== undefined;

  return (
    <div className="flex items-center justify-center my-4">
      {hasMeta ? (
        <Dialog>
          <DialogTrigger asChild>
            <div className="flex items-center gap-2 max-w-[80%] rounded-lg bg-secondary/50 px-4 py-2 text-sm text-secondary-foreground cursor-pointer group relative">
              <InfoIcon className="h-4 w-4" />
              <div className="flex-1">{message.content}</div>
              <div className="text-xs text-secondary-foreground/70">
                {timeAgo}
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                <MoreHorizontalIcon className="h-4 w-4" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Message Details</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="text-sm">{message.content}</div>
              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Additional Information</h3>
                <pre className="bg-secondary/30 p-4 rounded-md whitespace-pre-wrap text-xs overflow-auto max-h-[400px]">
                  {JSON.stringify(message.meta, null, 2)}
                </pre>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        <div className="flex items-center gap-2 max-w-[80%] rounded-lg bg-secondary/50 px-4 py-2 text-sm text-secondary-foreground">
          <InfoIcon className="h-4 w-4" />
          <div className="flex-1">{message.content}</div>
          <div className="text-xs text-secondary-foreground/70">{timeAgo}</div>
        </div>
      )}
    </div>
  );
};
