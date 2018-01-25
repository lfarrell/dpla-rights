const fs = require('fs');
const d3 = require('d3');

fs.readdir('json_data', (err, files) => {
    files.forEach((file) => {
        if (/json$/.test(file)) {
            fs.readFile(`json_data/${file}`, 'utf8', (e, data) => {
                let records = JSON.parse(data);

                let rollup = d3.nest()
                    .key(function (d) {
                        return d.type;
                    })
                    .entries(records);

                fs.writeFile(`json_data/final/${file}`, JSON.stringify(rollup, null, '\t'), function(err) {
                    console.log(err)
                });
            });
        }
    });
});