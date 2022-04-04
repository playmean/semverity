import yargs, { Options, PositionalOptions } from 'yargs';
import { hideBin } from 'yargs/helpers';

import { commandBump } from './commands/bump';
import { commandPatch } from './commands/patch';
import { appName } from './constants';
import { AppArguments } from './types';

const positionalSemver: PositionalOptions = {
    type: 'string',
    describe: 'initial version',
};

const optionFrom: Options = {
    type: 'string',
    alias: 'f',
    describe:
        'file to grab version from (optionally dot-notated path to version in json object: file.json:meta.version)',
    default: 'package.json:version',
};
const optionFiles: Options = {
    type: 'array',
    alias: 'o',
    describe: 'files to patch version',
    default: ['package.json:version', 'package-lock.json:version,packages..version'],
};
const optionCommit: Options = {
    type: 'string',
    describe: 'commmit type to save',
};

yargs(hideBin(process.argv))
    .command<AppArguments>(
        'bump [semver]',
        'bump version from git history',
        (child) =>
            child
                .usage(`Usage: ${appName} bump [options]`)
                .positional('semver', positionalSemver)
                .option('from', optionFrom),
        commandBump
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
        commandPatch
    )
    .usage(`Usage: ${appName} <command>`)
    .demandCommand(1)
    .parse();

export {};
