import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import {
    AppArguments,
    optionCommit,
    optionFiles,
    optionFrom,
    optionTidy,
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
                .option('from', optionFrom)
                .option('tidy', optionTidy),
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
                .option('commit', optionCommit)
                .option('tidy', optionTidy),
        commandPatch
    )
    .usage(`Usage: ${appName} <command>`)
    .demandCommand(1)
    .parse();

export {};
