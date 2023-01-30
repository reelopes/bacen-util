const csv = require('csvtojson')
const fs = require('fs');
const axios = require('axios');

const url = `http://www.bcb.gov.br/pom/spb/estatistica/port/ParticipantesSTRport.csv`

axios.get(url).then(response => {
    csv({ delimiter: "auto" })
        .fromString(response.data)
        .then(jsonObj => {
            // Filtro para remover instituicoes que nao possuem COMPE (Codigo do Sistema de Operacoes Monetarias e Compensacao de Outros Papeis)
            console.log('Antes do filtro por COMPE: ' + jsonObj.length);
            var filteredJson = jsonObj.filter((item) => item.Número_Código !== 'n/a');
            console.log('Após o filtro por COMPE sem n/a: ' + filteredJson.length);

            const data = JSON.stringify(filteredJson);
            fs.writeFile('./files/strParticipants.json', `{\"items\":${data}}`, (err) => {
                console.log(`JSON data (${filteredJson.length} entries) it was updated: ${Date()}\n-----`);
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