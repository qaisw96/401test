DROP TABLE IF EXISTS test_table;

CREATE TABLE test_table (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    house VARCHAR(255),
    patronus VARCHAR(255),
    alive VARCHAR(255),
    add_by VARCHAR(255)
);