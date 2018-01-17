const fs = require('fs');
const mysql = require('mysql');
const db_connection = require('./db.connection');

const connection = mysql.createConnection(db_connection.connect);
connection.connect();

const StreamArray = require('stream-json/utils/StreamArray');
const stream = StreamArray.make();

fs.createReadStream('/Users/lfarrell/Downloads/digitalnc.json').pipe(stream.input);

let providers = [];
let hubs = [];
let licenses = [];

stream.output.on('data', (object) => {
    let base = object.value._source;

    let record_rights = () => {
        return new Promise((resolve, reject) => {
            let rights = base.sourceResource.rights;
            let rights_query = 'INSERT INTO licenses SET ?';
            let right = (Array.isArray(rights)) ? value(rights[0]) : value(rights);

            if (!licenses.includes(right)) {
                insertQuery(rights_query, {license: right});
                licenses.push(right);
            }

            resolve(right);
        });
    };

    let provider = (keys) => {
       return new Promise((resolve, reject) => {
            let record_provider = (base.dataProvider);
            if (!providers.includes(record_provider)) {
                insertQuery('INSERT INTO providers SET ?', {provider: record_provider});
                providers.push(record_provider);
            }

            resolve([keys, record_provider]);
        });
    };

    // Hubs
    let hub = (keys) => {
        return new Promise((resolve, reject) => {
            let record_hub = value(base.provider.name);
            if (!hubs.includes(record_hub)) {
                insertQuery('INSERT INTO hubs SET ?', {hub: record_hub});
                hubs.push(record_hub);
            }

            keys[2] = record_hub;
            resolve(keys);
        });
    };

    let record = (keys) => {
        return new Promise((resolve, reject) => {
            insertQuery("INSERT INTO records SET " +
                "license_id = (SELECT id FROM licenses WHERE license = ?), " +
                "provider_id = (SELECT id FROM providers WHERE provider = ?), " +
                "hub_id = (SELECT id FROM hubs WHERE hub = ?)", keys);

            console.log(object.index);
            resolve();
        });
    };

    record_rights()
        .then(provider)
        .then(hub)
        .then(record);
});

const value = (field) => {
    return (field !== undefined) ? field.trim().replace(/;$/, '') : 'Unknown';
};

const insertQuery = (query, parameters) => {
    return connection.query(query, parameters, (error, results, fields) => {
        if (error) throw error;
    });
};