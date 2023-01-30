const csv = require('csvtojson')
const fs = require('fs');
const axios = require('axios');

const formattedDate = new Date().toISOString().split('T')[0].replace(/-/g, '')
const url = `https://www.bcb.gov.br/content/estabilidadefinanceira/spi/participantes-spi-${formattedDate}.csv`

axios.get(url).then(response => {
    csv({ delimiter: "auto" })
        .fromString(response.data)
        .then(jsonObj => {
            const data = JSON.stringify(jsonObj);
            fs.writeFile('./files/spiParticipants.json', `{\"items\":${data}}`, (err) => {
                console.log(`JSON data (${jsonObj.length} entries) it was updated: ${Date()}\n-----`);
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