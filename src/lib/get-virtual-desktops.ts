import { promisified as regedit } from 'regedit';

export class Desktops {
    current: string;
    desktops: {
        id: string;
        name: string;
    }[];

    constructor(current: string, desktops: { id: string; name: string; }[])
    {
        this.current = current;
        this.desktops = desktops;
    }
}

export const getVirtualDesktops = async (): Promise<Desktops | null> =>
{
    const baseKey = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\VirtualDesktops';
    const vdsReg = (await regedit.list([baseKey]))[baseKey];
    if (!vdsReg.exists) return null;
    if (!vdsReg.values.VirtualDesktopIDs) return null;
    const flatIds = vdsReg.values.VirtualDesktopIDs.value as number[];
    const ids = arrayChunk(flatIds, 16);
    const guids = ids.map(arrayToGuid);
    const desktops = [];
    for (const guid of guids)
    {
        const vdKey = `${baseKey}\\Desktops\\{${guid}}`;
        const vdReg = (await regedit.list([vdKey]))[vdKey];
        if (!vdReg.exists) continue;
        if (!vdReg.values.Name) continue;
        const name = vdReg.values.Name.value as string;
        desktops.push({ id: guid, name });
    }
    const current = vdsReg.values.CurrentVirtualDesktop.value as number[];
    return new Desktops(arrayToGuid(current), desktops);
};

function arrayToGuid(array: number[]): string
{
    // バイト配列の順序を調整して16進数の文字列に変換
    const hexParts = array.map(b => b.toString(16).padStart(2, '0'));

    // C#のGuidバイト順序に合わせる
    // 最初の3グループ（8-4-4桁）でバイトを逆転
    const reordered = [
        ...hexParts.slice(0, 4).reverse(),
        ...hexParts.slice(4, 6).reverse(),
        ...hexParts.slice(6, 8).reverse(),
        ...hexParts.slice(8, 10),
        ...hexParts.slice(10)
    ];

    const hexString = reordered.join('');

    // GUID形式に合わせてハイフンを挿入
    return `${hexString.substring(0, 8)}-${hexString.substring(8, 12)}-${hexString.substring(12, 16)}-${hexString.substring(16, 20)}-${hexString.substring(20)}`;
}

// 分割関数
function arrayChunk<T>(array: T[], size: number): T[][]
{
    if (size <= 0) return [[]];
    const result = [];
    for (let i = 0, j = array.length; i < j; i += size)
    {
        result.push(array.slice(i, i + size));
    }
    return result;
}