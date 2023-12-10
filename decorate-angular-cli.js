import fs from "fs";
import os from "os";
import cp from "child_process";
import { decorateCli } from "nx/src/adapter/decorate-cli.js";
const isWindows = os.platform() === 'win32';
let output;
try {
    output = require('@nx/workspace').output;
}
catch (e) {
    console.warn('Angular CLI could not be decorated to enable computation caching. Please ensure @nx/workspace is installed.');
    process.exit(0);
}
/**
 * Symlink of ng to nx, so you can keep using `ng build/test/lint` and still
 * invoke the Nx CLI and get the benefits of computation caching.
 */
function symlinkNgCLItoNxCLI() {
    try {
        const ngPath = './node_modules/.bin/ng';
        const nxPath = './node_modules/.bin/nx';
        if (isWindows) {
            /**
             * This is the most reliable way to create symlink-like behavior on Windows.
             * Such that it works in all shells and works with npx.
             */
            ['', '.cmd', '.ps1'].forEach((ext) => {
                if (fs.existsSync(nxPath + ext))
                    fs.writeFileSync(ngPath + ext, fs.readFileSync(nxPath + ext));
            });
        }
        else {
            // If unix-based, symlink
            cp.execSync(`ln -sf ./nx ${ngPath}`);
        }
    }
    catch (e) {
        output.error({
            title: 'Unable to create a symlink from the Angular CLI to the Nx CLI:' +
                e.message,
        });
        throw e;
    }
}
try {
    symlinkNgCLItoNxCLI();
    ({ decorateCli }.decorateCli());
    output.log({
        title: 'Angular CLI has been decorated to enable computation caching.',
    });
}
catch (e) {
    output.error({
        title: 'Decoration of the Angular CLI did not complete successfully',
    });
}
