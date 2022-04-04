import { constants } from 'fs';
import { access } from 'fs/promises';

export function parseJsonOrNull<T = any>(input: string) {
    try {
        return JSON.parse(input) as T;
    } catch {
        return null;
    }
}

export async function checkFileAccessible(filePath: string) {
    return await access(filePath, constants.F_OK)
        .then(() => true)
        .catch(() => false);
}
