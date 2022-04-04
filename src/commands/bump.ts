import { AppArguments } from '@/arguments';
import { bumpVersion, getInputVersion, getShaFromVersion } from '@/version';

export async function commandBump(args: AppArguments) {
    const semver = await getInputVersion(args.from, args.semver);
    const hash = getShaFromVersion(semver);
    const newVersion = await bumpVersion(semver, hash);

    process.stdout.write(newVersion.raw);
}
