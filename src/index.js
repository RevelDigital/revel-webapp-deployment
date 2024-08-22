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
        await archive.finalize();
        const form = new FormData();

        form.append('file', fs.createReadStream('test.jpg'));
        form.append('name', 'test.jpg')
        form.append('group_id', 'F463rfkTL46J2BDsk46GmA')
        form.append('tags', '')
        form.append('advertiser_id', '')
        // form.append('is_shared', false)
        form.append('start_date', '2024-08-21T22:03:39.493Z')
        form.append('end_date', '2024-08-21T22:03:39.493Z')

        const request_config = {
            headers: {
                ...form.getHeaders(),
                "X-Reveldigital-Apikey": "rDJquU_3VaJ9GCu0Dj9K"
            }
        };

        console.log(request_config.headers)

        return axios.post(`https://api.reveldigital.com/media?api_key=${"rDJquU_3VaJ9GCu0Dj9K8w"}`, form, request_config)
    } catch (error) {
        core.setFailed(error.message);
    }
}

run().then(val=>{
    console.log(val.headers)
    setInterval(()=>{},50000)
}).catch(err=>{
    console.log(err)
});
