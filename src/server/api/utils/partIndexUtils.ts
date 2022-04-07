export function calcNewPartIndex(oldPartIndex: number, partIndexesRemoved: number[]): number {
    const smallerRemovedIndexes = partIndexesRemoved.filter((index) => oldPartIndex > index);
    return oldPartIndex - smallerRemovedIndexes.length;
}
