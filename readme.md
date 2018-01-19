## DPLA Rights Statements

1. Download and unzip DPLA records [https://dp.la/info/developers/download](https://dp.la/info/developers/download)
2. Generate CSV file `node get_rights.js`

#### Load Generated CSV File into MySQL

From the MySQL command line run:

~~~~sql
LOAD DATA LOCAL INFILE 'records.csv' INTO TABLE records 
FIELDS TERMINATED BY ',' 
ENCLOSED BY '' 
IGNORE 1 LINES
(hub,provider,license);
~~~~
