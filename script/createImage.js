import {exec} from '@actions/exec';
const core = require('@actions/core');
const github = require('@actions/github');

const OAUTH_TOKEN = process.env.OAUTH_TOKEN
const TICKET_ID = process.env.TICKET_ID
const ORG_ID = process.env.ORG_ID

const RELEASE_TAG = github.context.ref

const build = async () => {
    try {
        let text = `Собрали образ в тегом ${RELEASE_TAG}`;

        console.log('Created text with docker image tag for tracker.')

        console.log('Start sending a docker image tag to tracker comment...')

        await exec('docker', ['build', '-t', RELEASE_TAG, '.'])

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

build().then(
    _ => {
        console.log('Comment sent successfully!')
    }, _ => {
        console.log('Send error')
    })