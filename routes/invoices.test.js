process.env.NODE_ENV = 'test';


const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;
let testInvoice;


beforeEach(async () => {
    const compResult = await db.query(`INSERT INTO companies (code, name, description) VALUES ('acme', 'Acme Corporation', 'A fictional test company') RETURNING code, name, description`);
    testCompany = compResult.rows[0];

    const invResult = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('acme', '1000') RETURNING id, comp_code, amt, paid, add_date, paid_date`);

    // Necessary for results to match
    // Otherwise the result add date is an int, and the tested result is a string
    const jsonString = JSON.stringify(invResult.rows[0]);
    testInvoice = JSON.parse(jsonString);
});

afterEach(async () => {
    await db.query(`DELETE FROM companies`);
    await db.query(`DELETE FROM invoices`);
});

afterAll(async () => {
    await db.end();
});


describe('GET /invoices', () => {
    test('Get a list with one invoice', async () => {
        const res = await request(app).get('/invoices');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ invoices: [testInvoice] });
    });
});


describe('GET /invoices/:id', () => {
    test('Get a single invoice', async () => {
        delete testInvoice['comp_code']; // delete, not expected for a single invoice return
        testInvoice.company = testCompany;
        const id = testInvoice.id
        const result = await request(app).get(`/invoices/${id}`);
        expect(result.statusCode).toBe(200);
        expect(result.body).toEqual({ invoice: testInvoice });
    });

    test('Get a nonexistent invoice', async () => {
        const result = await request(app).get('/invoices/999');
        expect(result.statusCode).toBe(404);
    });
});


describe('POST /invoices', () => {
    test('Add a new invoice', async () => {
        const newInvoice = {
            "comp_code": "acme",
            "amt": "2000",
        }
        const result = await request(app).post('/invoices').send(newInvoice);
        expect(result.statusCode).toBe(201);
    });
});


describe('PUT /invoices/:id', () => {
    test('Update an invoice', async () => {
        const id = testInvoice.id
        const result = await request(app).put(`/invoices/${id}`).send({ "amt": 3000, "paid": false });
        expect(result.statusCode).toBe(201);
        testInvoice.amt = 3000;
        expect(result.body).toEqual(testInvoice);
    });

    test('Update a nonexistent invoice', async () => {
        const result = await request(app).put('/invoices/999').send({ "amt": 4000, "paid": false });;
        expect(result.statusCode).toBe(404);
    });
});


describe('Delete /invoices/:id', () => {
    test('Delete an invoice', async () => {
        const id = testInvoice.id
        const result = await request(app).delete(`/invoices/${id}`)
        expect(result.statusCode).toBe(201);
        expect(result.body).toEqual({ "status": "DELETED" });
    });

    test('Delete a nonexistent invoice', async () => {
        const result = await request(app).delete('/invoices/999')
        expect(result.statusCode).toBe(404);
    });
});

