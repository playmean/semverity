import { SemVer } from 'semver';
import parseSemver from 'semver/functions/parse';

import { getFileWithOptions } from './args';
import { getLastCommitHash } from './git';
import { AppArguments } from './types';
import { getVersionFromJsonFile, makeVersionFromHistory } from './version';

export async function getVersion(args: AppArguments) {
    let semver: SemVer | null;

    if (args.semver) {
        semver = parseSemver(args.semver);
    } else {
        const { filePath, objectPaths } = getFileWithOptions(args.from, 'version');

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
