const vCardsJS = require('vcards-js');
const fetch = require('node-fetch');
const request = require('request');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

async function getSlackInfo() {
	const SLACK_URL = `https://slack.com/api/users.list?token=${ process.env.SLACK }`;
	return await fetch(SLACK_URL)
		.then(res => res.json());
}

function download(uri, filename) {
	return new Promise( resolve => {
		request.head(uri, (err, res, body) => {
			request(uri).pipe(fs.createWriteStream(filename)).on('close', resolve);
		});
	});
};

function findImage( db, name ) {
	const user = db.members.filter( member => member.name === name.trim());

	return user[0]
		? user[0].profile.image_192
		: '';
}

function mapData( data ) {
	const cell = data.split('\t');

	return {
		squad: cell[0],
		nick: cell[1],
		slack: cell[2].replace('@',''),
		pronouns: cell[3],
		first: cell[4],
		middle: cell[5],
		last: cell[6],
		street: cell[7],
		suburb: cell[8],
		state: cell[9],
		country: cell[10],
		zip: cell[11],
		dob: cell[12],
		persoanlEmail: cell[14],
		mobile: cell[15],
		platform: cell[16],
		emergencyName: cell[17],
		emergencyRelationship: cell[18],
		emergencyNumber: cell[19],
		food: cell[20],
		allergies: cell[21],
		workEmail: cell[22],
		band: cell[23],
		startDate: cell[26],
		endDate: cell[27],
	};
}

async function writeFiles( pathToCSV = 'people.tsv') {
	let lines;

	try {
		lines = fs
			.readFileSync(path.normalize( pathToCSV ))
			.toString()
			.split('\n');
	}
	catch( error ) {
		console.error(`\nERROR: Wasn't able to locate file "${pathToCSV}"\n`);
		process.exit( 1 );
	}

	const slackDB = await getSlackInfo();
	const allDownloads = [];
	let former = false;

	lines
		.slice(1)
		.map( line => {
			const { squad, first, slack } = mapData( line );
			if( squad === 'Former employees' ) {
				former = true;
			}

			const image = findImage( slackDB, slack );
			if( image ) {
				const extension = image.endsWith('jpg') ? 'jpg' : 'png';
				if( !former ) allDownloads.push(download(image, `./output/img/${ first.trim() }.${extension}`));
			}
	});

	await Promise.all(allDownloads);

	former = false;

	lines
		.slice(1)
		.map( line => {
			const {
				squad,
				nick,
				first,
				middle,
				last,
				dob,
				slack,
				mobile,
				street,
				suburb,
				zip,
				state,
				country,
				workEmail,
				persoanlEmail,
				allergies,
			} = mapData( line );

			if( squad === 'Former employees' ) {
				former = true;
			}

			if( !former ) {
				const image = findImage( slackDB, slack );
				const extension = image.endsWith('jpg') ? 'jpg' : 'png';
				const bday = dob.split('/');
				const birthday = `${bday[2]}-${bday[1]}-${bday[0]}`;

				const vCard = vCardsJS();
				vCard.firstName = first;
				vCard.nickname = nick;
				vCard.middleName = middle === '-' ? '' : middle;
				vCard.lastName = last;
				vCard.organization = 'Thinkmill';
				vCard.cellPhone = mobile;
				if( image ) {
					vCard.photo.embedFromFile(`./output/img/${ first.trim() }.${extension}`);
				}

				vCard.homeAddress.label = 'Home Address';
				vCard.homeAddress.street = street;
				vCard.homeAddress.city = suburb;
				vCard.homeAddress.postalCode = zip;
				vCard.homeAddress.stateProvince = state;
				vCard.homeAddress.countryRegion = country;

				vCard.birthday = new Date(birthday);

				vCard.workEmail = workEmail;
				vCard.email = persoanlEmail;

				vCard.note = allergies === 'none'
					? null
					: `Allergies: ${allergies}`;

				vCard.saveToFile(`./output/${ first.trim() }.vcf`);
			}
	});

	console.log('\nFiles successfully written into ./output/ folder\n');
}

if (process.argv.includes('write')) {
	const pathToCSV = process.argv[ 3 ]
		? process.argv[ 3 ].trim()
		: undefined;

	writeFiles( pathToCSV );
}
