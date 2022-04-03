import { readFile, writeFile } from 'fs/promises';
import validSemver from 'semver/functions/valid';
import yargs, { Options, PositionalOptions } from 'yargs';
import { hideBin } from 'yargs/helpers';

import { commitChanges, getLastCommitHash } from './git';
import {
    SemVersion,
    getVersionFromJsonFile,
    makeVersionFromHistory,
    parseSemVersion,
} from './version';

const appName = 'semverity';

const positionalSemver: PositionalOptions = {
    type: 'string',
    describe: 'initial version',
};

const optionFrom: Options = {
    type: 'string',
    alias: 'f',
    describe: 'file to grab version from',
    default: 'package.json',
};
const optionFromPath: Options = {
    type: 'string',
    describe: 'dot-notated path to version in json object',
    default: 'version',
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
    fromPath: string;
    files: string[];
    commit: string;
};

async function getVersion(args: AppArguments) {
    let inputVersion;

    if (args.semver) {
        inputVersion = validSemver(args.semver);
    } else {
        const readVersion = await getVersionFromJsonFile(args.from, args.fromPath);

        inputVersion = validSemver(readVersion);
    }

    if (inputVersion === null) {
        throw new Error('invalid semver passed');
    }

    return {
        version: inputVersion,
        semver: parseSemVersion(inputVersion),
    };
}

async function bumpVersion(semver: SemVersion) {
    const lastCommitHash = await getLastCommitHash().catch(() => {
        throw new Error('not enough commits to build version');
    });
    const lastSemver = await makeVersionFromHistory(semver);
    const shaPart = `sha.${lastCommitHash.substring(0, 8)}`;

    return `${lastSemver.join('.')}+${shaPart}`;
}

async function patchVersion(filePath: string, version: string, newVersion: string) {
    const fileBody = await readFile(filePath, 'utf8');
    const patchedBody = fileBody.replaceAll(version, newVersion);

    await writeFile(filePath, patchedBody);

    return fileBody !== patchedBody;
}

yargs(hideBin(process.argv))
    .command<AppArguments>(
        'bump [semver]',
        'bump version from git history',
        (child) =>
            child
                .usage(`Usage: ${appName} bump [options]`)
                .positional('semver', positionalSemver)
                .option('from', optionFrom)
                .option('from-path', optionFromPath),
        async (args) => {
            const { semver } = await getVersion(args);
            const version = await bumpVersion(semver);

            process.stdout.write(version);
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
                .option('from-path', optionFromPath)
                .option('files', optionFiles)
                .option('commit', optionCommit),
        async (args) => {
            const { semver, version } = await getVersion(args);
            const newVersion = await bumpVersion(semver);

            let patchedCount = 0;

            for (const filePath of args.files) {
                const patchResult = await patchVersion(filePath, version, newVersion);

                patchedCount += patchResult ? 1 : 0;
            }

            process.stdout.write(
                `${patchedCount} file(s) pathed to version ${newVersion}\n`
            );

            if (args.commit) {
                await commitChanges(args.files, args.commit, newVersion);
            }
        }
    )
    .usage(`Usage: ${appName} <command>`)
    .demandCommand(1)
    .parse();

export {};
