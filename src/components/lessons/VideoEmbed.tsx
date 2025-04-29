import { YouTube } from '@astro-community/astro-embed-youtube';
import { cn } from '@/lib/utils';

interface VideoEmbedProps {
  id: string;
  title?: string;
  description?: string;
  timestamp?: string;
  className?: string;
  posterQuality?: 'max' | 'high' | 'default' | 'low';
  params?: string;
}

export function VideoEmbed({
  id,
  title,
  description,
  timestamp,
  className,
  posterQuality = 'high',
  params
}: VideoEmbedProps) {
  return (
    <div className={cn("rounded-lg border bg-card text-card-foreground shadow", className)}>
      <div className="relative">
        <YouTube 
          id={id}
          title={title}
          posterQuality={posterQuality}
          params={params}
          playlabel="Play video"
        />
      </div>
      {(title || description) && (
        <div className="p-4">
          {title && <h3 className="font-semibold mb-2">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          {timestamp && (
            <div className="mt-2 text-xs text-muted-foreground">
              <span className="font-medium">Timestamp:</span> {timestamp}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 