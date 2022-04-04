import { readFile } from 'fs/promises';
import { SemVer } from 'semver';
import parseSemver from 'semver/functions/parse';
import { get as shvlGet } from 'shvl';

import { getFileWithOptions } from './arguments';
import { parseCommit } from './commit';
import { getCommitMessages, getLastCommitHash } from './git';

export async function getVersionFromJsonFile(filePath: string, objectPaths: string[]) {
    const fileBody = await readFile(filePath, 'utf8');

    const object = JSON.parse(fileBody);

    const foundPath = objectPaths.find(
        (objectPath) => typeof shvlGet(object, objectPath) === 'string'
    );

    if (!foundPath) return '';

    return shvlGet(object, foundPath) as string;
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

export async function getInputVersion(fromPath: string, inputVersion?: string) {
    let semver: SemVer | null;

    if (inputVersion) {
        semver = parseSemver(inputVersion);
    } else {
        const { filePath, objectPaths } = getFileWithOptions(fromPath, 'version');

        const version = await getVersionFromJsonFile(filePath, objectPaths);

        semver = parseSemver(version);
    }

    if (semver === null) {
        throw new Error('invalid semver passed');
    }

    return semver;
}

export async function bumpVersion(semver: SemVer, fromHash?: string) {
    const lastCommitHash = await getLastCommitHash().catch(() => {
        throw new Error('not enough commits to build version');
    });
    const lastSemver = await makeVersionFromHistory(semver, fromHash);
    const shaPart = `sha.${lastCommitHash.substring(0, 8)}`;

    return parseSemver(`${lastSemver.version}+${shaPart}`)!;
}
