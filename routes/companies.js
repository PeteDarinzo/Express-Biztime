/* Routes for companies */

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const slugify = require('slugify');



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

        const results = await db.query(`
        SELECT c.code, c.name, c.description, ind.code, ind.industry
        FROM companies AS c 
        LEFT JOIN companies_industries AS ci
        ON ci.company_code = c.code
        LEFT JOIN industries as ind
        ON ci.industry_code = ind.code
        WHERE c.code = $1;
        `, [code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find a company with code of ${code}`, 404);
        }
        const invoiceResults = await db.query(`
        SELECT * FROM invoices WHERE comp_code=$1`, [code]);
        const invoices = invoiceResults.rows;
        const { name, description } = results.rows[0];
        let industries = results.rows.map(r => {
            return r.industry;
        });

        // change null array to an empty one
        if (industries[0] === null) {
            industries = [];
        }

        res.json({ company: { code, name, description, invoices, industries } });
    } catch (e) {
        next(e);
    }
});


router.post('/', async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const code = slugify(name, {
            replacement: '-',  // replace spaces with replacement character, defaults to `-`
            lower: true,      // convert to lower case, defaults to `false`
            strict: true,     // strip special characters except replacement, defaults to `false`
            trim: true         // trim leading and trailing replacement chars, defaults to `true`);
        });
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
        const results = await db.query('UPDATE companies SET name=$2, description=$3 WHERE code=$1 RETURNING code, name, description', [code, name, description]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Can't find company with code of ${code}`, 404);
        }
        res.status(201).json(results.rows[0]);
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
        res.status(201).json({ status: "DELETED" });
    } catch (e) {
        next(e);
    }
});


module.exports = router;
