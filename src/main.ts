import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import {
    AppArguments,
    optionCommit,
    optionFiles,
    optionFrom,
    positionalSemver,
} from './arguments';
import { commandBump } from './commands/bump';
import { commandPatch } from './commands/patch';
import { appName } from './constants';

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
