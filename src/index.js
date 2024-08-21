const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const archiver = require('archiver');
const context = github.context;
const FormData = require('form-data');
const axios = require('axios');
// most @actions toolkit packages have async methods
async function run() {
    try {
        core.getInput('api-key')
        const output = fs.createWriteStream('target.webapp');
        const archive = archiver('zip');

        output.on('close', function () {
            console.log(archive.pointer() + ' total bytes');
            console.log('archiver has been finalized and the output file descriptor has closed.');
        });

        archive.on('error', function(err){
            throw err;
        });

        archive.pipe(output);
        archive.directory('dist/ng-test-client-sdk', false);
        archive.finalize();
        const form = new FormData();
        form.append('file', fs.createReadStream('target.webapp'));
        form.append('name', 'target.webapp')
        form.append('group_id', 'F463rfkTL46J2BDsk46GmA')

        const request_config = {
            headers: {
                ...form.getHeaders()
            }
        };

        return axios.post(`https://api.reveldigital.com/media?api_key=${"rDJquU_3VaJ9GCu0Dj9K8w"}`, form, request_config)
    } catch (error) {
        core.setFailed(error.message);
    }
}

run().then(val=>{
    console.log(val)
}).catch(err=>{
    console.log(err)
});
