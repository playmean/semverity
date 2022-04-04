export declare type FileWithOptions = {
    filePath: string;
    objectPath: string;
};

export function getFileWithOptions(input: string, defObjectPath = ''): FileWithOptions {
    const [filePath, objectPath = defObjectPath] = input.split(':');

    return {
        filePath,
        objectPath,
    };
}
