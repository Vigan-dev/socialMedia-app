import { apiPostData } from '@/lib/apiClient';
import { decodeUploadResponse } from '@/lib/apiSchemas';

type UploadPurpose = 'avatar' | 'post-media';

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Could not read image file.'));
    };

    reader.onerror = () => reject(new Error('Could not read image file.'));
    reader.readAsDataURL(file);
  });
}

async function uploadImageDataUrl(dataUrl: string, purpose: UploadPurpose) {
  const result = await apiPostData(
    '/uploads/images',
    {
      dataUrl,
      purpose,
    },
    'Image upload failed',
    decodeUploadResponse,
  );

  return result.url;
}

export async function uploadAvatarImage(dataUrl: string) {
  return uploadImageDataUrl(dataUrl, 'avatar');
}

export async function uploadPostImage(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Choose an image file.');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Post image must be 5 MB or smaller.');
  }

  return uploadImageDataUrl(await readFileAsDataUrl(file), 'post-media');
}
