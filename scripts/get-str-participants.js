const csv = require('csvtojson')
const fs = require('fs');
const axios = require('axios');
const jsonDiff = require('json-diff');

const url = `https://www.bcb.gov.br/content/estabilidadefinanceira/str1/ParticipantesSTR.csv`

axios.get(url).then(response => {
    csv({ delimiter: "auto" })
        .fromString(response.data)
        .then(jsonObj => {
            
            // Filtro para remover instituicoes que nao possuem COMPE (Codigo do Sistema de Operacoes Monetarias e Compensacao de Outros Papeis)
            console.log('Antes do filtro por COMPE: ' + jsonObj.length);
            var filteredJson = jsonObj.filter((item) => item.Número_Código !== 'n/a');
            console.log('Após o filtro por COMPE sem n/a: ' + filteredJson.length);
            
            let originalData = JSON.parse(fs.readFileSync('./files/strParticipants.json', 'utf8'));
            let changeLog = compareJsonData(originalData, filteredJson);
            
            fs.writeFile('./files/strParticipants.json', `{\"items\":${JSON.stringify(filteredJson)}}`, (err) => {
                if (changeLog != "") {
                    console.log(`JSON data (${filteredJson.length} entries) it was updated: ${Date()}\n`);
                    console.log("Changelog:\n" + changeLog + "\n-----");
                } else {
                    console.log(`JSON data (${filteredJson.length} entries) it was updated: ${Date()}\n-----`);
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