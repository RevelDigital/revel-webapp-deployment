const core = require('@actions/core');
const github = require('@actions/github');
const context = github.context;


// most @actions toolkit packages have async methods
async function run() {
    try {
        core.getInput('api-key')
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
