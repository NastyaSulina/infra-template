const fetch = require('node-fetch');
const core = require('@actions/core');
const github = require('@actions/github');
const {executeCommand, getReleaseTag} = require("./common");

const OAUTH_TOKEN = process.env.OAUTH_TOKEN
const TICKET_ID = process.env.TICKET_ID
const ORG_ID = process.env.ORG_ID
const AUTHOR = process.env.AUTHOR

const RELEASE_TAG = github.context.ref

async function getReleaseCommits() {
    const releaseTag = `rc-${getReleaseTag(RELEASE_TAG)}`;

    let allTags = await executeCommand('git', ['tag', '-l']).then(res => res)
    let allTagsList = allTags.split('\n').filter(tag => tag)

    let releaseTagIndex = allTagsList.indexOf(releaseTag);
    let tagsRange = releaseTagIndex !== 0 ? `${allTagsList[releaseTagIndex - 1]}...${releaseTag}` : `${releaseTag}`;

    return executeCommand('git', ['log', '--pretty=format:%H %an %s', `${tagsRange}`])
}

function getReleaseDate() {
    const time = new Date();

    let month = time.getMonth() + 1;
    return `${time.getDate()}/${month < 10 ? '0' + month : month}/${time.getFullYear()}`
}

const ticketSend = async () => {
    try {
        let summary = `Релиз №${getReleaseTag(RELEASE_TAG)} от ${getReleaseDate()}`
        let description = `Ответственный за релиз: ${AUTHOR}\n\n` + "Коммиты, попавшие в релиз:\n" + await getReleaseCommits()

        core.info('Created summary and description for tracker.')
        core.info('Start filling release ticket...')

        await fetch(`https://api.tracker.yandex.net/v2/issues/${TICKET_ID}`, {
            method: "PATCH",
            headers: {
                "X-Org-ID": ORG_ID,
                "Authorization": `OAuth ${OAUTH_TOKEN}`
            },
            body: JSON.stringify({
                summary,
                description
            })
        })
    } catch (error) {
        core.setFailed(error.message);
    }
}

ticketSend().then(
    _ => {
        core.info('Done!');
    })