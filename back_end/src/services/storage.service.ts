import { storage } from '../config/firebase.js';
import * as crypto from 'crypto';

/**
 * Uploads a file buffer to Firebase Storage and returns the public file URL.
 */
export const uploadFile = async (
    fileBuffer: Buffer,
    originalName: string,
    mimetype: string,
    folder: string = 'uploads'
): Promise<string> => {
    try {
        const bucket = storage.bucket();
        const exts = originalName.split('.');
        const ext = exts.length > 1 ? `.${exts[exts.length - 1]}` : '';
        const uniqueName = crypto.randomUUID() + ext;
        const destFileName = `${folder}/${uniqueName}`;
        const file = bucket.file(destFileName);

        await file.save(fileBuffer, {
            metadata: { contentType: mimetype },
            public: true, // or use signed URLs based on security needs
        });

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
        return publicUrl;
    } catch (error) {
        console.error('Error uploading file to storage:', error);
        throw new Error('Failed to upload file.');
    }
};

/**
 * Returns a time-limited signed URL for reading a private file.
 */
export const getSignedUrl = async (fileName: string, expiresInMinutes = 60): Promise<string> => {
    try {
        const bucket = storage.bucket();
        const file = bucket.file(fileName);
        const expireDate = new Date();
        expireDate.setMinutes(expireDate.getMinutes() + expiresInMinutes);

        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: expireDate,
        });
        return url;
    } catch (error) {
        console.error('Error getting signed URL:', error);
        throw new Error('Failed to generate signed URL.');
    }
};
