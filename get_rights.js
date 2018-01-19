const fs = require('fs');

const csvWriter = require('csv-write-stream');
const writer = new csvWriter({ headers: ['hub', 'provider', 'license']});

const StreamArray = require('stream-json/utils/StreamArray');
const stream = StreamArray.make();

fs.createReadStream('/Users/lfarrell/all.json').pipe(stream.input);
writer.pipe(fs.createWriteStream('records.csv', {flags: 'a'}));

stream.output.on('data', (object) => {
    let base = object.value._source;

    let rights_base = (base.sourceResource !== undefined)
        ? base.sourceResource.rights : 'Unknown';
    let right = value(arrayCheck(rights_base));

    let record_provider = value(arrayCheck(base.dataProvider));

    let hub_base = (base.provider !== undefined)
        ? base.provider.name : 'Unknown';
    let record_hub = value(arrayCheck(hub_base));

    writer.write({
        hub: record_hub,
        provider: record_provider,
        license: right
    });

    object = null;
});

const arrayCheck = (field) => {
    return Array.isArray(field) ? value(field[0]) : value(field);
};

const value = (field) => {
    return (field !== undefined) ? field.trim().replace(/;$/, '') : 'Unknown';
};