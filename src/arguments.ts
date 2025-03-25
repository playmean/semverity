import { Options, PositionalOptions } from 'yargs';

export declare type AppArguments = {
    semver?: string;
    from: string;
    files: string[];
    commit: string;
    tidy?: boolean;
};

export declare type FileWithOptions = {
    filePath: string;
    objectPaths: string[];
};

export const positionalSemver: PositionalOptions = {
    type: 'string',
    describe: 'initial version',
};

export const optionFrom: Options = {
    type: 'string',
    alias: 'f',
    describe:
        'file to grab version from (optionally dot-notated path to version in json object: file.json:meta.version)',
    default: 'package.json:version',
};
export const optionFiles: Options = {
    type: 'array',
    alias: 'o',
    describe: 'files to patch version',
    default: ['package.json:version', 'package-lock.json:version,packages..version'],
};
export const optionCommit: Options = {
    type: 'string',
    describe: 'commmit type to save',
};
export const optionTidy: Options = {
    type: 'boolean',
    describe: 'save only 1.2.3 without sha',
};

export function getFileWithOptions(input: string, defObjectPath = ''): FileWithOptions {
    const [filePath, objectPaths = defObjectPath] = input.split(':');

    return {
        filePath,
        objectPaths: objectPaths.split(','),
    };
}
