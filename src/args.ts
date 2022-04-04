export declare type FileWithOptions = {
    filePath: string;
    objectPaths: string[];
};

export function getFileWithOptions(input: string, defObjectPath = ''): FileWithOptions {
    const [filePath, objectPaths = defObjectPath] = input.split(':');

    return {
        filePath,
        objectPaths: objectPaths.split(','),
    };
}
