const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const archiver = require('archiver');
const context = github.context;
const FormData = require('form-data');
const axios = require('axios');
process.env['version'] = 'my-value';

// core.getInput = (val)=>{
//     const test = {
//         version: '',
//         name: 'test',
//         "group-name": "",
//         "environment":"Production",
//         "api-key":"",
//         tags: "test tags",
//         "distribution-location": "dist/ng-test-client-sdk"
//     }
//     return test[val]
// }
// most @actions toolkit packages have async methods
async function run() {
    try {
        axios.get(`https://api.reveldigital.com/media/groups?api_key=${core.getInput('api-key')}&tree=false`).then((groups)=>{
            const output = fs.createWriteStream(core.getInput('name')+'.webapp');
            const archive = archiver('zip');

            output.on('close',  ()=> {
                let version;
                console.log(archive.pointer() + ' total bytes');
                console.log('archiver has been finalized and the output file descriptor has closed.');
                const form = new FormData();
                if(core.getInput('version')){
                    version = `\nversion=${core.getInput('version')}`
                }
                else if(fs.existsSync('package.json')){
                    version = ''
                    try{
                        const tmp = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
                        version = `\nversion=${tmp.version}`;
                    }catch (e) {
                        console.log(e)
                    }
                }else{
                    version = ''
                }
                console.log(version)
                form.append('file', fs.createReadStream(core.getInput('name')+'.webapp'));
                form.append('name', core.getInput('name')+'.webapp')
                if(core.getInput('group-name')){
                    let tmp = groups.data[0].id
                    for(const val of groups.data){
                        if(val.name.search(core.getInput('group-name'))>-1){
                            console.log(val.name, 'match')
                            tmp = val.id
                            break;
                        }
                    }
                    form.append('group_id', tmp)
                }
                else{
                    form.append('group_id', groups.data[0].id)
                }
                form.append('tags', core.getInput('tags')+`${version}\nenv=${core.getInput('environment')}`)
                form.append('is_shared', 'false')

                const request_config = {
                    headers: {
                        ...form.getHeaders(),
                        "X-Reveldigital-Apikey": core.getInput('api-key')
                    }
                };

                axios.post(`https://api.reveldigital.com/media?api_key=${core.getInput('api-key')}`, form, request_config).then(val=>{
                    console.log(val.status)
                }).catch(err=>{
                    console.log('failed to upload')
                });

            });

            archive.on('error', function(err){
                throw err;
            });

            archive.pipe(output);
            archive.directory(core.getInput('distribution-location'), false);
            archive.finalize();
        })


    } catch (error) {
        core.setFailed(error.message);
    }
}

run()
