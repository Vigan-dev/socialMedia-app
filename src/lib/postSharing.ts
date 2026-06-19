export type SharePostInput = {
  content: string;
  postId: string;
  user: string;
};

export type SharePostResult = 'copied' | 'shared' | 'cancelled' | 'failed';

export function buildPostShareUrl(postId: string) {
  const url = new URL(
    `/posts/${encodeURIComponent(postId)}`,
    window.location.origin,
  );

  return url.toString();
}

async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.left = '-9999px';
  textarea.style.position = 'fixed';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

export async function sharePost({
  content,
  postId,
  user,
}: SharePostInput): Promise<SharePostResult> {
  const url = buildPostShareUrl(postId);
  const title = `${user}'s post`;
  const text = content.length > 140 ? `${content.slice(0, 137)}...` : content;

  if (navigator.share) {
    try {
      await navigator.share({
        text,
        title,
        url,
      });

      return 'shared';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'cancelled';
      }
    }
  }

  try {
    await copyText(url);
    return 'copied';
  } catch {
    return 'failed';
  }
}
