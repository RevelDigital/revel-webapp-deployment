import { getInput, setOutput, setFailed, summary } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import axios from "axios";
import * as fs from "fs";
import * as FormData from "form-data";
import * as archiver from "archiver";

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

try {
	let apiKey: string = getInput("api-key", { required: true });
	let name: string = getInput("name", { required: false });
	let version = getInput("version", { required: false });
	let groupName = getInput("group-name", { required: false });
	let tags = getInput("tags", { required: false });
	let environment = getInput("environment", { required: false });
	let distributionLocation = getInput("distribution-location", {
		required: false,
	});

	(async () => {
		if (name === "" && fs.existsSync("package.json")) {
			try {
				const tmp = JSON.parse(fs.readFileSync("package.json", "utf-8"));
				name = tmp.name;
			} catch (e) {
				throw Error("No name provided");
			}
		} else {
			throw Error("No name provided");
		}

		if (version === "" && fs.existsSync("package.json")) {
			try {
				const tmp = JSON.parse(fs.readFileSync("package.json", "utf-8"));
				version = tmp.version;
			} catch (e) {
				console.log(e);
			}
		}
		console.log(version, "version");

		let groups = await axios.get(`https://api.reveldigital.com/media/groups?api_key=${apiKey}&tree=false`);
		if (groups.status !== 200) {
			throw Error("Failed to get groups");
		}
		const output = fs.createWriteStream(name + ".webapp");
		const archive = archiver("zip");

		output.on("close", () => {
			console.log(archive.pointer() + " total bytes");
			console.log("archiver has been finalized and the output file descriptor has closed.");

			// @ts-ignore
			const form = new FormData();
			form.append("file", fs.createReadStream(name + ".webapp"));
			form.append("name", name + ".webapp");
			if (groupName !== "") {
				let tmp = groups.data[0].id;
				for (const val of groups.data) {
					if (val.name.search(groupName) > -1) {
						tmp = val.id;
						break;
					}
				}
				form.append("group_id", tmp);
			} else {
				form.append("group_id", groups.data[0].id);
			}

			let formTags = [];
			if (tags !== "") {
				formTags = tags.split(",");
			}
			if (version !== "") {
				formTags.push(`version=${version}`);
			}
			if (environment !== "") {
				formTags.push(`env=${environment}`);
			}
			form.append("tags", formTags.join("\n"));
			form.append("is_shared", "false");

			const request_config = {
				headers: {
					...form.getHeaders(),
					"X-Reveldigital-Apikey": apiKey,
				},
			};

			axios
				.post(`https://api.reveldigital.com/media?api_key=${apiKey}`, form, request_config)
				.then((val) => {
					console.log(val.status);
				})
				.catch((err) => {
					console.log("failed to upload", err);
				});
		});

		archive.on("error", function (err) {
			throw err;
		});

		let dl: string;
		if (distributionLocation !== "") {
			dl = distributionLocation;
		} else if (fs.existsSync("package.json")) {
			try {
				const tmp = JSON.parse(fs.readFileSync("package.json", "utf-8"));
				dl = `dist/${tmp.name}`;
			} catch (e) {
				console.log(e);
				throw Error("No distribution location specified");
			}
		} else {
			throw Error("No distribution location specified");
		}
		
		archive.pipe(output);
		archive.directory(dl, false);
		await archive.finalize();
	})();
} catch (error) {
	setFailed(error.message);
}
