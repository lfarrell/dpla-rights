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

License Grouping Query (All)

~~~~sql
SELECT license, COUNT(*) AS total 
FROM records 
GROUP BY license 
HAVING total >= 1000 
ORDER BY total DESC
INTO OUTFILE '~/all_counts.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';
~~~~

License Grouping Query (NC)

~~~~sql
SELECT provider, license, COUNT(*) AS total  
FROM records 
WHERE hub="North Carolina Digital Heritage Center" 
GROUP BY license  
HAVING total >= 250  
ORDER BY total DESC 
INTO OUTFILE '~/nc_counts.csv' 
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"' 
LINES TERMINATED BY '\n';