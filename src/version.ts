import { readFile } from 'fs/promises';
import { get as shvlGet } from 'shvl';

import { parseCommit } from './commit';
import { getCommitMessages } from './git';

export declare type SemVersion = [number, number, number];

export function parseSemVersion(input: string): SemVersion {
    const [major, minor, patch] = input.split('.');

    return [Number(major), Number(minor), Number(patch)];
}

export async function getVersionFromJsonFile(filePath: string, objectPath: string) {
    const fileBody = await readFile(filePath, 'utf8');

    const object = JSON.parse(fileBody);

    const foundEntry = shvlGet(object, objectPath, '');

    return typeof foundEntry === 'string' ? foundEntry : '';
}

export async function makeVersionFromHistory(input: SemVersion, from?: string) {
    const [major, minor, patch] = input;

    const log = await getCommitMessages(from);

    let upMajor = false;
    let upMinor = false;
    let upPatch = false;

    for (const message of log) {
        try {
            const commit = parseCommit(message);

            if (commit.isBreaking) {
                upMajor = true;

                break;
            }

            if (commit.type === 'feat') {
                upMinor = true;

                break;
            }

            if (commit.type === 'fix') upPatch = true;
        } catch {}
    }

    if (upMajor) return [major + 1, 0, 0];
    if (upMinor) return [major, minor + 1, 0];
    if (upPatch) return [major, minor, patch + 1];

    return [major, minor, patch];
}
