\c test_biztime

DROP TABLE IF EXISTS invoices
CASCADE;

DROP TABLE IF EXISTS companies
CASCADE;

DROP TABLE IF EXISTS industries
CASCADE;

DROP TABLE IF EXISTS companies_industries
CASCADE;

CREATE TABLE companies (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE invoices (
  id serial PRIMARY KEY,
  comp_code TEXT NOT NULL REFERENCES companies ON DELETE CASCADE,
  amt float NOT NULL,
  paid boolean DEFAULT false NOT NULL,
  add_date date DEFAULT CURRENT_DATE NOT NULL,
  paid_date date,
  CONSTRAINT invoices_amt_check CHECK ((amt > (0) :: double precision))
);

CREATE TABLE industries (
  code TEXT PRIMARY KEY,
  industry TEXT NOT NULL UNIQUE
);

CREATE TABLE companies_industries (
  id serial PRIMARY KEY,
  company_code TEXT NOT NULL REFERENCES companies (code),
  industry_code TEXT NOT NULL REFERENCES industries (code)
);