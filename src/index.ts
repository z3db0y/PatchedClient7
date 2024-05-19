import 'colors';
import { createPackage, extractAll } from '@electron/asar';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import path from 'path';

const asarPath = process.argv[2] || './app.asar';
const extractPath = './tmp';

if (!existsSync(asarPath)) {
    console.log('ERROR'.red + ': ASAR file not found.');
    process.exit(1);
}

console.log('INFO'.green + ': Extracting original ASAR file...');

if (!existsSync(extractPath)) mkdirSync(extractPath, { recursive: true });
extractAll(asarPath, extractPath);

console.log();
console.log('INFO'.green + ': ASAR file extracted successfully.');
console.log('INFO'.green + ': Patching...');

let entry = 'index.js';
let packageJSON: any = {};

try {
    packageJSON = JSON.parse(
        readFileSync(path.join(extractPath, 'package.json'), 'utf8')
    );

    entry = packageJSON.main;
} catch (_) {}

console.debug('VERBOSE'.cyan + ': Entry point found;', entry.green);
packageJSON.main = 'main.patched.js';

writeFileSync(
    path.join(extractPath, 'package.json'),
    JSON.stringify(packageJSON, null, 4)
);

console.debug('VERBOSE'.cyan + ': Patched package.json');
console.log('INFO'.green + ': Copying patch files...');

const patchFiles = ['main.patched.js', 'preload.patched.js'];

for (const file of patchFiles) {
    writeFileSync(
        path.join(extractPath, file),
        readFileSync(path.join(__dirname, '../inject', file), 'utf8')
    );
}

console.log('INFO'.green + ': Patch files copied.');
console.log('INFO'.green + ': Repacking...');

createPackage(extractPath, asarPath.replace('.asar', '.patched.asar'))
    .then(() => {
        console.log('INFO'.green + ': Repacked successfully.');
        console.log('INFO'.green + ': Cleaning up...');

        rmSync(extractPath, { recursive: true });
        console.log('INFO'.green + ': Done!');
    })
    .catch((err) => {
        console.log('ERROR'.red + ': Failed to repackage ASAR file.');
        console.error(err);
        process.exit(1);
    });
