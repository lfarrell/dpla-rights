const fs = require('fs');
const mysql = require('mysql');
const db_connection = require('./db.connection');

const connection = mysql.createConnection(db_connection.connect);
connection.connect();

const StreamArray = require('stream-json/utils/StreamArray');
const stream = StreamArray.make();

fs.createReadStream('/Users/lfarrell/all.json').pipe(stream.input);

let providers = [];
let hubs = [];
let licenses = [];

stream.output.on('data', (object) => {
    let base = object.value._source;

    let record_rights = () => {
        return new Promise((resolve, reject) => {
            let rights_query = 'INSERT INTO licenses SET ?';
            let right = value(arrayCheck(base.sourceResource.rights));

            if (!licenses.includes(right)) {
                insertQuery(rights_query, {license: right});
                licenses.push(right);
            }

            resolve(right);
        });
    };

    let provider = (keys) => {
       return new Promise((resolve, reject) => {
            let record_provider = value(arrayCheck(base.dataProvider));
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
            let record_hub = value(arrayCheck(base.provider.name));
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

const arrayCheck = (field) => {
    return Array.isArray(field) ? value(field[0]) : value(field) ;
};

const value = (field) => {
    return (field !== undefined) ? field.trim().replace(/;$/, '') : 'Unknown';
};

const insertQuery = (query, parameters) => {
    return connection.query(query, parameters, (error, results, fields) => {
        console.log(results)
        if (error) throw error;
    });
};