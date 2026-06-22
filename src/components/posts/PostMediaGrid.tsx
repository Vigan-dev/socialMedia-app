import Image from 'next/image';
import { resolveMediaUrl } from '@/lib/mediaUrls';

type PostMediaGridProps = {
  mediaUrls?: string[];
};

export function PostMediaGrid({ mediaUrls = [] }: PostMediaGridProps) {
  if (mediaUrls.length === 0) {
    return null;
  }

  return (
    <div
      className={`my-4 grid gap-2.5 ${
        mediaUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
      }`}
    >
      {mediaUrls.slice(0, 4).map((url, index) => {
        const resolvedUrl = resolveMediaUrl(url);
        if (!resolvedUrl) return null;

        return (
          <div
            key={`${url}-${index}`}
            className="group relative aspect-video overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-900 shadow-[0_16px_36px_rgba(0,0,0,0.18)]"
          >
            <Image
              src={resolvedUrl}
              alt="Post media"
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.025]"
              sizes="(max-width: 768px) 90vw, 640px"
              unoptimized
            />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.04]" />
          </div>
        );
      })}
    </div>
  );
}
