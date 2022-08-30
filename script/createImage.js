const exec = require('@actions/exec');
const fetch = require('node-fetch');
const core = require('@actions/core');
const github = require('@actions/github');

const OAUTH_TOKEN = process.env.OAUTH_TOKEN
const TICKET_ID = process.env.TICKET_ID
const ORG_ID = process.env.ORG_ID

const RELEASE_TAG = github.context.ref

const createImage = async () => {
    try {
        let releaseTag = `rc-${getReleaseTag()}`;
        let text = `Собрали образ с тегом ${releaseTag}`;

        core.info('Created text with docker image tag for tracker.')
        core.info('Start sending a docker image tag to tracker comment...')

        await executeCommand('docker', ['build', '-t', `infra:${releaseTag}`, '.'])

        await fetch(`https://api.tracker.yandex.net/v2/issues/${TICKET_ID}`, {
            method: "PATCH",
            headers: {
                "X-Org-ID": ORG_ID,
                "Authorization": `OAuth ${OAUTH_TOKEN}`
            },
            body: JSON.stringify({
                text
            })
        })
    } catch (error) {
        core.setFailed(error.message);
    }
}

function getReleaseTag() {
    let regex = /[0-9]+.[0-9]+.[0-9]+/ig
    core.info(`Release tag: ${RELEASE_TAG.match(regex)[0]}`)
    return RELEASE_TAG.match(regex)[0]
}

const executeCommand = async (command, options) => {
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
    return myOutput
}

createImage().then(
    _ => {
        console.log('Done!')
    })