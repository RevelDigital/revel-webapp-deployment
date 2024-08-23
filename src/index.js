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
            const form = new FormData();

            form.append('file', fs.createReadStream('target.webapp'));
            form.append('name', 'target.webapp')
            form.append('group_id', 'F463rfkTL46J2BDsk46GmA')
            form.append('tags', '')
            form.append('is_shared', 'false')

            const request_config = {
                headers: {
                    ...form.getHeaders(),
                    "X-Reveldigital-Apikey": "rDJquU_3VaJ9GCu0Dj9K"
                }
            };

            console.log(request_config.headers)

            axios.post(`https://api.reveldigital.com/media?api_key=${"rDJquU_3VaJ9GCu0Dj9K8w"}`, form, request_config).then(val=>{
                console.log(val.status)
            }).catch(err=>{
                console.log(err)
            });

        });

        archive.on('error', function(err){
            throw err;
        });

        archive.pipe(output);
        archive.directory('dist/ng-test-client-sdk', false);
        await archive.finalize();

    } catch (error) {
        core.setFailed(error.message);
    }
}

run()
