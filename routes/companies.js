/* Routes for companies */

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");


router.get('/', async (req, res, next) => {
    try {
        const results = await db.query('SELECT * FROM companies');
        res.json({ companies: results.rows });
    } catch (e) {
        next(e);
    }
});


router.get('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const compResults = await db.query('SELECT * FROM companies WHERE code = $1', [code]);
        const invResults = await db.query(`SELECT id, comp_code, amt, paid, add_date, paid_date FROM invoices JOIN companies ON invoices.comp_code = companies.code WHERE comp_code = $1;`, [code]);
        if (compResults.rows.length === 0) {
            throw new ExpressError(`Can't find a company with code of ${code}`, 404)
        }
        const results = { ...compResults.rows[0], invoices: invResults.rows };
        res.json({ company: results })
    } catch (e) {
        next(e);
    }
});


router.post('/', async (req, res, next) => {
    try {
        const { code, name, description } = req.body;
        const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description]);
        res.status(201).json(results.rows[0]);
    } catch (e) {
        next(e);
    }
});


router.put('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;
        const results = await db.query('UPDATE companies SET name=$2, description=$3 WHERE code=$1 RETURNING code, name, description', [code, name, description])
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404);
        }
        res.status(204).json(results.rows[0]);
    } catch (e) {
        next(e);
    }
});


router.delete('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const company = await db.query('SELECT * FROM companies WHERE code = $1', [code]);
        if (company.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404);
        }
        await db.query('DELETE FROM companies WHERE code = $1', [code]);
        res.status(204).json({ status: "DELETED" });
    } catch (e) {
        next(e);
    }
});


module.exports = router;
