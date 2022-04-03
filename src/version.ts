import { readFile } from 'fs/promises';
import { SemVer } from 'semver';
import parseSemver from 'semver/functions/parse';
import { get as shvlGet } from 'shvl';

import { parseCommit } from './commit';
import { getCommitMessages } from './git';

export async function getVersionFromJsonFile(filePath: string, objectPath: string) {
    const fileBody = await readFile(filePath, 'utf8');

    const object = JSON.parse(fileBody);

    const foundEntry = shvlGet(object, objectPath, '');

    return typeof foundEntry === 'string' ? foundEntry : '';
}

export async function makeVersionFromHistory(semver: SemVer, fromHash?: string) {
    semver = parseSemver(semver.version)!;

    const log = await getCommitMessages(fromHash);

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

    if (upMajor) return semver.inc('major');
    if (upMinor) return semver.inc('minor');
    if (upPatch) return semver.inc('patch');

    return semver;
}

export function getShaFromVersion(semver: SemVer) {
    const [, hash = undefined] = semver.raw.match(/sha\.(\w+)/i) || [];

    return hash;
}
