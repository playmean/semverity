import { bumpVersion, getVersion } from '@/shared';
import { AppArguments } from '@/types';
import { getShaFromVersion } from '@/version';

export async function commandBump(args: AppArguments) {
    const semver = await getVersion(args);
    const hash = getShaFromVersion(semver);
    const newVersion = await bumpVersion(semver, hash);

    process.stdout.write(newVersion.raw);
}
