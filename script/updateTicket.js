const fetch = require('node-fetch');
const core = require('@actions/core');
const github = require('@actions/github');

const OAUTH_TOKEN = process.env.OAUTH_TOKEN
const TICKET_ID = process.env.TICKET_ID
const ORG_ID = process.env.ORG_ID
const AUTHOR = process.env.AUTHOR

const RELEASE_TAG = github.context.ref

function getReleaseCommits() {
    return ''
}

function getReleaseTag() {
    let regex = /[0-9]+.[0-9]+.[0-9]+/ig
    console.log(`Release tag: ${RELEASE_TAG.match(regex)[0]}`)
    return RELEASE_TAG.match(regex)[0]
}

function getReleaseDate() {
    const time = new Date();
    return `${time.getDate()}/${time.getMonth() + 1}/${time.getFullYear()}`
}

const ticketSend = async () => {
    try {
        let summary = `Релиз №${getReleaseTag()} от ${getReleaseDate()}`
        let description = `Ответственный за релиз: ${AUTHOR}\n` + `Коммиты, попавшие в релиз:\n${getReleaseCommits()}\n`

        console.log('Created summary and description for tracker.')

        console.log('Start filling release ticket...')

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
        console.log('Release ticket completed successfully!')
    }, _ => {
        console.log('Send error')
    })