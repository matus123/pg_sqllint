const cheerio = require('cheerio');
const axios = require('axios');

axios.get('http://dicomlookup.com/dicom-tables.asp')
	.then(response => {
		console.log(response);
	});
