import detectIndent from 'detect-indent';
import { readFile, writeFile } from 'fs/promises';
import { SemVer } from 'semver';
import { set as shvlSet } from 'shvl';

import { getFileWithOptions } from '@/args';
import { commitChanges } from '@/git';
import { checkFileAccessible, parseJsonOrNull } from '@/helpers';
import { bumpVersion, getVersion } from '@/shared';
import { AppArguments } from '@/types';
import { getShaFromVersion } from '@/version';

export async function commandPatch(args: AppArguments) {
    const semver = await getVersion(args);
    const hash = getShaFromVersion(semver);
    const newVersion = await bumpVersion(semver, hash);
    const outputfiles = args.files.map((outputFile) =>
        getFileWithOptions(outputFile, 'version')
    );

    let patchedCount = 0;

    for (const { filePath, objectPath } of outputfiles) {
        const fileAccessible = await checkFileAccessible(filePath);

        if (!fileAccessible) continue;

        const patchResult = await patchVersion(filePath, objectPath, semver, newVersion);

        patchedCount += patchResult ? 1 : 0;
    }

    process.stdout.write(`${patchedCount} file(s) pathed to version ${newVersion}\n`);

    if (args.commit) {
        await commitChanges(
            outputfiles.map((file) => file.filePath),
            args.commit,
            newVersion.raw
        );
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
