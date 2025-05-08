import * as React from "react";
import { Button } from "./button";
import { Textarea } from "./textarea";
import { cn } from "@/lib/utils";
import { useApiErrorHandler } from "@/components/misc/errors";

export interface EditableTextHandle {
  startEditing: () => void;
}

interface EditableTextProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  className?: string;
  textClassName?: string;
  editRef?: React.RefObject<EditableTextHandle | null>;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onSave,
  className,
  textClassName,
  editRef,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(value);
  const [isSaving, setIsSaving] = React.useState(false);
  const onApiError = useApiErrorHandler();

  React.useEffect(() => {
    setEditValue(value);
  }, [value]);

  React.useImperativeHandle(
    editRef,
    () => ({
      startEditing: () => setIsEditing(true),
    }),
    [],
  );

  if (isEditing)
    return (
      <div className={cn("space-y-2", className)}>
        <Textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="min-h-[100px]"
          disabled={isSaving}
        />
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditValue(value);
              setIsEditing(false);
            }}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={async () => {
              if (editValue === value) {
                setIsEditing(false);
                return;
              }

              setIsSaving(true);
              try {
                await onSave(editValue);
                setIsEditing(false);
              } catch (error) {
                console.error("Failed to save");
                onApiError(error);
              } finally {
                setIsSaving(false);
              }
            }}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    );

  return (
    <div
      className={cn(
        "group cursor-pointer hover:opacity-80 transition-opacity",
        className,
      )}
      onClick={() => setIsEditing(true)}
    >
      <p className={cn("text-muted-foreground", textClassName)}>{value}</p>
    </div>
  );
};
