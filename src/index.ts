

import * as core from '@actions/core';
import * as github from '@actions/github';
import axios from "axios";
import * as fs from "fs";
import * as FormData from "form-data";
import * as archiver from 'archiver'

const context = github.context;

// @ts-ignore
// core.getInput = (val)=>{
//     const test = {
//         version: '',
//         name: 'test',
//         "group-name": "",
//         "environment":"Production",
//         "api-key":"",
//         tags: "test tags",
//         "distribution-location": "test.jpg"
//     }
//     return test[val]
// }
// most @actions toolkit packages have async methods
async function run() {
    try {
        let name
        if(core.getInput('name')){
            name = core.getInput('name')
        }
        else if(fs.existsSync('package.json')){
            try{
                const tmp = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
                name = tmp.name;
            }catch (e) {
                throw Error('No name provided')
            }
        }else{
            throw Error('No name provided')
        }
        axios.get(`https://api.reveldigital.com/media/groups?api_key=${core.getInput('api-key')}&tree=false`).then(async (groups)=>{
            const output = fs.createWriteStream(name+'.webapp');
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

                console.log(version, 'version')
                // @ts-ignore
                form.append('file', fs.createReadStream(name+'.webapp'));
                form.append('name', name+'.webapp')
                if(core.getInput('group-name')){
                    let tmp = groups.data[0].id
                    for(const val of groups.data){
                        if(val.name.search(core.getInput('group-name'))>-1){
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
                    console.log('failed to upload', err)
                });

            });

            archive.on('error', function(err){
                throw err;
            });
            let dl;
            if(core.getInput('distribution-location')){
                dl = core.getInput('distribution-location')
            }
            else if(fs.existsSync('package.json')){
                try{
                    const tmp = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
                    dl = `dist/${tmp.name}`;
                }catch (e) {
                    console.log(e)
                    throw Error('No location specified')
                }
            }else{
                throw Error('No location specified')
            }
            archive.pipe(output);
            archive.directory(dl, false);
            await archive.finalize();

        })


    } catch (error) {
        core.setFailed(error.message);
    }
}

run()
