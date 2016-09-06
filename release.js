var PACKAGE_JSON_FILE = './package.json',
    RELEASES_NOTES_FILE = './RELEASES NOTES.txt';

var child = require('child_process'),
    fs = require('fs'),
    pkg = require(PACKAGE_JSON_FILE),
    semver = require('semver'),
    argv = require('yargs')
        .alias('s', 'start')
        .alias('f', 'finish')
        .alias('n', 'version')
        .alias('t', 'type')
        .alias('m', 'message')
        .alias('p', 'push')
        .alias('c', 'codenames').normalize('c')
        .default('type', 'minor')
        .argv;

function execSync(command) {
    var res = child.execSync(command);
    res = String(res).trim();
    return res;
}

function gitGetCurrentBranch() {
    return execSync('git rev-parse --abbrev-ref HEAD');
}

function gitIsRepoClean() {
    // '-uno' => do not hwo untracked files
    return execSync('git status -s -uno').length === 0;
}

function gitGetLastTag() {
    return execSync('git describe --abbrev=0 --tags');
}

function gitGetCommits(startTag, endTag) {
    return execSync('git log ' + startTag + '...' + endTag + ' --format=%f').split('\n');
}

function gitCheckout(branch) {
    return execSync('git checkout ' + branch);
}

function gitCommit(message) {
    if (!message || message.length === 0) {
        console.error('Please provide a commit message');
        return;
    }
    return execSync('git commit -am \"' + message + '\"');
}

function gitPush() {
    execSync('git push --all');
    execSync('git push --tags');
}

function gitFlowStart(version) {
    return execSync('git flow release start ' + version);
}

function gitFlowFinish(version) {
    console.log('git flow release finish -F ' + version + ' -m \"Release v' + version + '\"');
    return execSync('git flow release finish -F ' + version + ' -m \"Release v' + version + '\"');
}


function prependFile(path, data) {

    var options = {
            encoding: 'utf8',
            mode: 438 /*=0666*/
        },
        appendOptions = {
            encoding: options.encoding,
            mode: options.mode,
            flags: 'w'
        },
        currentFileData = "";

    // Open and read input file
    try {
        currentFileData = fs.readFileSync(path, options);
    } catch (err) {
        console.error('Failed to open file ' + path);
        return;
    }

    // Prepend data and write file
    fs.writeFileSync(path, data + currentFileData, appendOptions);
}

function generateReleaseNotes(version) {
    var notes= "";

    // Get current date
    var date = new Date(),
        y = date.getFullYear().toString(),
        m = (date.getMonth() + 1).toString(),
        d = date.getDate().toString(),
        MM = m[1] ? m : "0" + m[0],
        DD = d[1] ? d : "0" + d[0];

    notes = '### Release Notes v' + version + ' (' + y + '/' + MM + '/' + DD + ')\n';

    // Get last/previous tag
    var lastTag = gitGetLastTag();
    //console.log("Last tag: " + lastTag);

    // Get commits since last tag
    var commits = gitGetCommits(lastTag, 'HEAD');
    //console.log("Commits :" + commits);
    for (var i =0; i < commits.length; i++) {
        notes += '* ' + commits[i] + '\n';
    }
    notes += '\n';

    //console.log('Release notes = \n' + notes);
    return notes;
}

function startRelease() {

    //console.log(JSON.stringify(pkg, null, '\t'));

    // Check if repository is clean
    if (!gitIsRepoClean()) {
        console.error("Repository is not clean");
        return;
    }
    console.info("Repository is clean");

    // Checkout development branch
    gitCheckout('development');

    // Get current version from package.json and increment it:
    // - if version ends with '-dev' suffix, then suffix is removed
    // - else version number is incremented
    console.info("Current version: " + pkg.version);
    console.info("Release type: " + argv.type);
    var version = semver.inc(pkg.version, argv.type);
    pkg.version = version;
    console.info("=> Release version: " + pkg.version);

    //console.log(JSON.stringify(pkg, null, '\t'));

    // Start git flow release
    console.info('Start git release v' + pkg.version);
    gitFlowStart(pkg.version);

    // Write/update and commit package.jon file with the new version number
    fs.writeFileSync(PACKAGE_JSON_FILE, JSON.stringify(pkg, null, '  '), {encoding: 'utf8',mode: 438 /*=0666*/});
    gitCommit('v' + pkg.version);

    // Generate release notes, write/update and commit 'RELEASE NOTES.txt' file
    var notes = generateReleaseNotes(version);
    prependFile(RELEASES_NOTES_FILE, notes);

    console.info("Please complete and commit release notes...");
}

function finishRelease() {

    // Check if we are on release branch
    var branch = gitGetCurrentBranch();
    if (!branch.startsWith('release/')) {
        console.error('Current branch = ' + branch + '. Please checkout current release branch');
        return;
    }

    // Finish git flow release
    console.info('Finish git release v' + pkg.version);
    gitFlowFinish(pkg.version);

    // Increment version number for next release version in development
    gitCheckout('development');
    var version = semver.inc(pkg.version, 'minor');
    version += '-dev';
    pkg.version = version;
    console.info("Next release version in development: " + pkg.version);
    fs.writeFileSync(PACKAGE_JSON_FILE, JSON.stringify(pkg, null, '  '), {encoding: 'utf8',mode: 438 /*=0666*/});
    gitCommit('v' + pkg.version);

    // Push all branches and tags to remote
    gitPush();
}

///////////////////////////////////////////////////////////////////////////////////////////////////


if (argv.start) {
    startRelease();
}

if (argv.finish) {
    finishRelease();
}

