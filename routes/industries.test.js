process.env.NODE_ENV = 'test';


const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;
let testIndustry;


beforeEach(async () => {
    const compResult = await db.query(`INSERT INTO companies (code, name, description) VALUES ('acme', 'Acme Corporation', 'A fictional test company') RETURNING code, name, description`);
    testCompany = compResult.rows[0];

    const indResult = await (db.query(`INSERT INTO industries (code, industry) VALUES ('tnt', 'Acme Explosives') RETURNING code, industry`))
    testIndustry = indResult.rows[0];
});

afterEach(async () => {
    await db.query('DELETE FROM companies_industries')
    await db.query(`DELETE FROM companies`);
    await db.query(`DELETE FROM industries`);
});

afterAll(async () => {
    await db.end();
});



describe('GET /industries', () => {
    test('Get a list with one industry', async () => {
        testIndustry.companies = [];
        const res = await request(app).get('/industries');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ industries: [testIndustry] });
    });
});



describe('POST /industries', () => {
    test('Add a new industry', async () => {
        const newIndustry = {
            "industry": "dairy products",
        }
        const result = await request(app).post('/industries').send(newIndustry);
        expect(result.statusCode).toBe(201);
    });
});


describe('PUT /industries/:code', () => {
    test('Add a company to an industry', async () => {
        const result = await request(app).put('/industries/tnt').send({ "comp_code": "acme" });
        expect(result.statusCode).toBe(201);
        expect(result.body).toEqual({
            "company_code": "acme",
            "industry_code": "tnt"
        });
    });
});