import preset from "@nx/jest/preset";
const nxPreset = preset.default;
export const snapshotFormat = { escapeString: true, printBasicPrototype: true };
export default {
    ...nxPreset,
    snapshotFormat
};
