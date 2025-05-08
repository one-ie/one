import * as React from "react";

interface BaseMentionProps {
  display: string;
  isInUserMessage?: boolean;
  onClick?: () => void;
  avatar: React.ReactNode;
}

export const BaseMention: React.FC<BaseMentionProps> = ({
  display,
  isInUserMessage,
  onClick,
  avatar,
}) => {
  return (
    <span
      onClick={onClick}
      className={`
        inline-flex items-center gap-1 px-1 py-0.5 rounded text-sm 
        transition-colors duration-200
        ${onClick ? "cursor-pointer" : ""}
        align-baseline
        ${
          isInUserMessage
            ? "bg-primary-foreground/20 hover:bg-primary-foreground/30"
            : "bg-accent/50 hover:bg-accent/60"
        }
      `}
    >
      {avatar}
      <span className="leading-none">{display}</span>
    </span>
  );
};
