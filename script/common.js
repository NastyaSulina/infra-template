const exec = require("@actions/exec");
const core = require("@actions/core");


exports.executeCommand = async function executeCommand(command, options) {
    let myOutput = '';
    let myError = '';

    await exec.exec(command, options, {
        listeners: {
            stdout: (result) => {
                myOutput += result.toString();
            },
            stderr: (error) => {
                myError += error.toString();
            }
        }
    })

    if (myError) {
        throw new Error();
    }

    return myOutput
}
exports.getReleaseTag = function getReleaseTag(RELEASE_TAG) {
    let regex = /[0-9]+.[0-9]+.[0-9]+/ig
    core.info(`Release tag: ${RELEASE_TAG.match(regex)[0]}`)
    return RELEASE_TAG.match(regex)[0]
}
