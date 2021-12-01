process.env.NODE_ENV = 'test';
// import '@types/jest';


const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;


beforeEach(async () => {
    const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('acme', 'Acme Corporation', 'A fictional test company') RETURNING code, name, description`);
    testCompany = result.rows[0];
});

afterEach(async () => {
    await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
    await db.end();
});


describe('GET /companies', () => {
    test('Get a list with one company', async () => {
        const res = await request(app).get('/companies');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ companies: [testCompany] });
    });
});


describe('GET /companies/:code', () => {
    test('Get a single company', async () => {
        testCompany.invoices = []; // no invoices added
        testCompany.industries = [];
        const result = await request(app).get('/companies/acme');
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({ company: testCompany });
    });

    test('Get a nonexistent company', async () => {
        const result = await request(app).get('/companies/nasa');
        expect(result.statusCode).toBe(404);
    });
});


describe('POST /companies', () => {
    test('Add a new company', async () => {
        const newCompany = {
            "code": "nasa",
            "name": "nasa",
            "description": "the space place"
        }
        const result = await request(app).post('/companies').send(newCompany);
        expect(result.statusCode).toBe(201);
        expect(result.body).toEqual(newCompany);
    });
});


describe('PUT /companies/:code', () => {
    test('Update a company', async () => {
        const result = await request(app).put('/companies/acme').send({ "name": "Dunder Mifflin", "description": "the paper company" });
        expect(result.statusCode).toBe(201);
        expect(result.body).toEqual({ "code": "acme", "name": "Dunder Mifflin", "description": "the paper company" });
    });

    test('Update a nonexistent company', async () => {
        const result = await request(app).put('/companies/nasa').send({ "name": "Dunder Mifflin", "description": "the paper company" });;
        expect(result.statusCode).toBe(404);
    });
});


describe('Delete /companies/:code', () => {
    test('Delete a company', async () => {
        const result = await request(app).delete('/companies/acme')
        expect(result.statusCode).toBe(201);
        expect(result.body).toEqual({ "status": "DELETED" });
    });

    test('Delete a nonexistent company', async () => {
        const result = await request(app).delete('/companies/nasa')
        expect(result.statusCode).toBe(404);
    });
});

