const csv = require('csvtojson')
const fs = require('fs');
const axios = require('axios');
const jsonDiff = require('json-diff');

const formattedDate = new Date().toISOString().split('T')[0].replace(/-/g, '')
const url = `https://www.bcb.gov.br/content/estabilidadefinanceira/spi/participantes-spi-${formattedDate}.csv`

axios.get(url).then(response => {
    csv({ delimiter: "auto" })
        .fromString(response.data)
        .then(jsonObj => {
            
            let originalData = JSON.parse(fs.readFileSync('./files/spiParticipants.json', 'utf8'));
            let changeLog = compareJsonData(originalData, jsonObj);

            fs.writeFile('./files/spiParticipants.json', `{\"items\":${JSON.stringify(jsonObj)}}`, (err) => {
                if (changeLog != "") {
                    console.log(`JSON data (${jsonObj.length} entries) it was updated: ${Date()}\n`);
                    console.log("Changelog:\n" + changeLog + "\n-----");
                } else {
                    console.log(`JSON data (${jsonObj.length} entries) it was updated: ${Date()}\n-----`);
                };
            });
        })
}).catch(error => {
    console.log(`
    ERROR\n
    STATUS CODE: ${error.response.status}\n
    REQUEST PATH: ${error.request.path}\n
    TIMESTAMP: ${Date()}\n
    -----`);
});

function compareJsonData(originalData, newData){
    return jsonDiff.diffString(originalData.items, newData, { color: false }).replaceAll('   ...\n', '');
}