const fs = require('fs');
const d3 = require('d3-jetpack/build/d3v4+jetpack');

fs.readdir('data', (err, files) => {
    files.forEach((file) => {
        if (/csv$/.test(file)) {
            fs.readFile(`data/${file}`, 'utf8', (e, data) => {
                let records = d3.csvParse(data);

                records.forEach((d) => {
                    d.type = whichType(d.rights);
                });

                fs.writeFile(`json_data/${file.split('.')[0]}.json`, JSON.stringify(records, null, '\t'), function(err) {
                    console.log(err)
                });
            });
        }
    });
});

const whichType = (value) => {
    let low_val = value.toLowerCase();


    if (/(no.*?copyright|public.?domain|unrestricted|vocab\/(noc|nkc))/.test(low_val)) {
        return 'Not in Copyright';
    } else if (/unknown|copyright.?unknown/.test(low_val)) {
        return 'Unknown'
    } else if (/(rights.*?reserved|copyright|property.rights|rights.*?retained|permission|©|vocab\/inc|may.not.*?reproduced)/.test(low_val)) {
        return 'In Copyright';
    } else if (/creative.?commons/.test(low_val)) {
        return 'Creative Commons';
    } else {
        return 'In Copyright';
    }
};