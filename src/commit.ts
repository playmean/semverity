declare type ParsedCommit = {
    readonly commit: string;

    type: string;
    scope: string;
    message: string;
    footer: string;

    isMerge: boolean;
    isBreaking: boolean;
    issueID: string;
};

export const CommitRegexp =
    /^([a-z]+!?)(?:\(([\w-/]+)\))?: ([a-zA-Zа-яА-Я\d][^\n]+)(?:\n{2}(.+))?$/s;

export function getIssueID(text: string) {
    const [_, issueID = ''] = text.match(/#(\d+)/) || [];

    return issueID;
}

export function removeCommitComments(input: string) {
    return input.replace(/^#.*$/gm, '');
}

export function parseCommit(commit: string): ParsedCommit {
    commit = removeCommitComments(commit);

    const [, mergeType = ''] =
        commit.match(/Merge (branch|remote\-tracking branch|pull request) /i) || [];

    if (mergeType.length > 0) {
        const [, remoteBranch = ''] = commit.match(/([^\s\/]+\/[^:]+:[^\s]+)/i) || [];

        return {
            commit,

            type: 'merge',
            scope: '',
            message: `${mergeType} from ${remoteBranch}`,
            footer: '',

            isMerge: true,
            isBreaking: false,
            issueID: getIssueID(commit),
        };
    }

    const [_, fullType = '', scope = '', message = '', footer = ''] =
        commit.match(CommitRegexp) || [];

    if (fullType.length === 0) {
        throw new Error('commit is not a valid conventional commit');
    }

    const isBreaking = fullType.endsWith('!') || footer.startsWith('BREAKING CHANGE');

    const messageIssueID = getIssueID(message);
    const footerIssueID = getIssueID(footer);

    const issueID = messageIssueID || footerIssueID;

    return {
        commit,

        type: fullType,
        scope,
        message,
        footer,

        isMerge: false,
        isBreaking,
        issueID,
    };
}
