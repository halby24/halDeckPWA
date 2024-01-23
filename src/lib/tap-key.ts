import { exec } from 'child_process';

export function tapKey(keyStr: string): Promise<[string, Error | null]> {
    return new Promise<[string, Error | null]>((resolve, reject) => {
        exec(`dotnet script ./src-cs/SendKeyScript.csx ${keyStr}`, (error, stdout, stderr) => {
            if (error) {
                reject([stderr, error]);
            } else {
                resolve([stdout, null]);
            }
        });
    });
}