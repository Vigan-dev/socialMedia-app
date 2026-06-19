import Image from 'next/image';

type PostMediaGridProps = {
  mediaUrls?: string[];
};

export function PostMediaGrid({ mediaUrls = [] }: PostMediaGridProps) {
  if (mediaUrls.length === 0) {
    return null;
  }

  return (
    <div
      className={`my-4 grid gap-2 ${
        mediaUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
      }`}
    >
      {mediaUrls.slice(0, 4).map((url, index) => (
        <div
          key={`${url}-${index}`}
          className="relative aspect-video overflow-hidden rounded-lg border border-white/[0.08] bg-slate-900"
        >
          <Image
            src={url}
            alt="Post media"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 90vw, 640px"
            unoptimized
          />
        </div>
      ))}
    </div>
  );
}
