import detectIndent from 'detect-indent';
import { readFile, writeFile } from 'fs/promises';
import { SemVer } from 'semver';
import parseSemver from 'semver/functions/parse';
import { set as shvlSet } from 'shvl';
import yargs, { Options, PositionalOptions } from 'yargs';
import { hideBin } from 'yargs/helpers';

import { commitChanges, getLastCommitHash } from './git';
import {
    getShaFromVersion,
    getVersionFromJsonFile,
    makeVersionFromHistory,
} from './version';

const appName = 'semverity';

const positionalSemver: PositionalOptions = {
    type: 'string',
    describe: 'initial version',
};

const optionFrom: Options = {
    type: 'string',
    alias: 'f',
    describe:
        'file to grab version from (optionally dot-notated path to version in json object can be specified as filename.json:meta.version)',
    default: 'package.json',
};
const optionFiles: Options = {
    type: 'array',
    alias: 'o',
    describe: 'files to patch version',
    default: ['package.json', 'package-lock.json'],
};
const optionCommit: Options = {
    type: 'string',
    describe: 'commmit type to save',
};

declare type AppArguments = {
    semver?: string;
    from: string;
    files: string[];
    commit: string;
};

async function getVersion(args: AppArguments) {
    let semver: SemVer | null;

    if (args.semver) {
        semver = parseSemver(args.semver);
    } else {
        const { filePath, option } = getFilePathWithOption(args.from, 'version');

        const version = await getVersionFromJsonFile(filePath, option);

        semver = parseSemver(version);
    }

    if (semver === null) {
        throw new Error('invalid semver passed');
    }

    return semver;
}

async function bumpVersion(semver: SemVer, fromHash?: string) {
    const lastCommitHash = await getLastCommitHash().catch(() => {
        throw new Error('not enough commits to build version');
    });
    const lastSemver = await makeVersionFromHistory(semver, fromHash);
    const shaPart = `sha.${lastCommitHash.substring(0, 8)}`;

    return parseSemver(`${lastSemver.version}+${shaPart}`)!;
}

function parseJsonOrNull<T = any>(input: string) {
    try {
        return JSON.parse(input) as T;
    } catch {
        return null;
    }
}

async function patchVersion(
    filePath: string,
    objectPath: string,
    version: SemVer,
    newVersion: SemVer
) {
    const fileBody = await readFile(filePath, 'utf8');
    const parsedBody = parseJsonOrNull(fileBody);

    let patchedBody = fileBody;

    if (objectPath === '' || parsedBody === null) {
        patchedBody = fileBody.replaceAll(version.raw, newVersion.raw);
    } else {
        const indent = detectIndent(fileBody).indent;
        const modifiedBody = shvlSet(parsedBody, objectPath, newVersion.raw);

        patchedBody = JSON.stringify(modifiedBody, null, indent) + '\n';
    }

    await writeFile(filePath, patchedBody);

    return fileBody !== patchedBody;
}

function getFilePathWithOption(input: string, defOption = '') {
    const [filePath, option = defOption] = input.split(':');

    return {
        filePath,
        option,
    };
}

yargs(hideBin(process.argv))
    .command<AppArguments>(
        'bump [semver]',
        'bump version from git history',
        (child) =>
            child
                .usage(`Usage: ${appName} bump [options]`)
                .positional('semver', positionalSemver)
                .option('from', optionFrom),
        async (args) => {
            const semver = await getVersion(args);
            const hash = getShaFromVersion(semver);
            const newVersion = await bumpVersion(semver, hash);

            process.stdout.write(newVersion.raw);
        }
    )
    .command<AppArguments>(
        'patch [semver]',
        'bump and patch files',
        (child) =>
            child
                .usage(`Usage: ${appName} patch [options]`)
                .positional('semver', positionalSemver)
                .option('from', optionFrom)
                .option('files', optionFiles)
                .option('commit', optionCommit),
        async (args) => {
            const semver = await getVersion(args);
            const hash = getShaFromVersion(semver);
            const newVersion = await bumpVersion(semver, hash);

            let patchedCount = 0;

            for (const outputFile of args.files) {
                const { filePath, option } = getFilePathWithOption(outputFile, 'version');
                const patchResult = await patchVersion(
                    filePath,
                    option,
                    semver,
                    newVersion
                );

                patchedCount += patchResult ? 1 : 0;
            }

            process.stdout.write(
                `${patchedCount} file(s) pathed to version ${newVersion}\n`
            );

            if (args.commit) {
                await commitChanges(args.files, args.commit, newVersion.raw);
            }
        }
    )
    .usage(`Usage: ${appName} <command>`)
    .demandCommand(1)
    .parse();

export {};
