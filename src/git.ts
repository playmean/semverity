import simpleGit from 'simple-git';

export const git = simpleGit();

export async function getCurrentBranch() {
    return await git.raw('rev-parse', '--abbrev-ref', 'HEAD');
}

export async function getLastCommitHash() {
    return await git.raw('rev-parse', 'HEAD');
}

export async function getCommitsCount() {
    const revListRaw = await git.raw('rev-list', '--count', 'HEAD');

    return Number(revListRaw);
}

export async function getCommitMessages(from?: string) {
    const log = await git.raw([
        'log',
        '--no-merges',
        '--pretty=format:%B܀',
        from ? `${from}..HEAD` : 'HEAD',
    ]);

    return log
        .split('܀')
        .map((v) => v.trim())
        .filter((v) => v.length > 0);
}

export async function commitChanges(
    filePaths: string[],
    commitType: string,
    message: string
) {
    await git.commit(`${commitType}: ${message}`, filePaths);
}
