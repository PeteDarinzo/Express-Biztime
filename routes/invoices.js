/* Routes for invoices */

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");


router.get('/', async (req, res, next) => {
    try {
        const results = await db.query('SELECT * FROM invoices');
        res.json({ invoices: results.rows });
    } catch (e) {
        next(e);
    }
});


router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const invResults = await db.query(`
        SELECT id, amt, paid, add_date, paid_date FROM invoices WHERE id = $1;`, [id]);
        const compResults = await db.query(`SELECT code, name, description FROM invoices JOIN companies ON invoices.comp_code = companies.code WHERE id = $1;`, [id]);
        if (invResults.rows.length === 0) {
            throw new ExpressError(`Can't find an invoice with id of ${id}`, 404);
        }
        const results = { ...invResults.rows[0], company: compResults.rows[0] };
        res.json({ invoice: results });
    } catch (e) {
        next(e);
    }
});


router.post('/', async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const results = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date', [comp_code, amt]);
        res.status(201).json(results.rows[0]);
    } catch (e) {
        next(e);
    }
});


router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amt } = req.body;
        const results = await db.query('UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date', [amt, id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find an invoice with id of ${id}`, 404);
        }
        res.status(204).json(results.rows[0]);
    } catch (e) {
        next(e);
    }
});


router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const invoice = await db.query('SELECT * FROM invoices WHERE id = $1', [id]);
        if (invoice.rows.length === 0) {
            throw new ExpressError(`Can't find an invoice with id of ${id}`, 404);
        }
        await db.query('DELETE FROM invoices WHERE id = $1', [id]);
        res.status(204).json({ status: "DELETED" });
    } catch (e) {
        next(e);
    }
});


module.exports = router;