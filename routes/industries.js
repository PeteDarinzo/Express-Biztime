/* Routes for industries */

const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db")
const slugify = require('slugify');


/** List all industries, including associated companies */
router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`
        SELECT c.code AS comp_code, i.code AS ind_code, i.industry 
        FROM industries AS i
        LEFT join companies_industries AS ci 
        ON ci.industry_code = i.code
        LEFT JOIN companies AS c 
        ON ci.company_code = c.code; 
        `);

        let industries = results.rows.map(r => { // extract all industires
            return r.industry;
        });

        // put industries in a set to get unique values
        industries = [... new Set(industries)];

        // set up array of objects containing industry, and a list to be populated with company codes
        let indResult = industries.map(i => {
            return { "industry": i, "companies": [] }
        })

        // iterate through all industries and rows, add a company code if it belongs to that industry
        // also add industry code (repetitive but it works)
        for (let ind of indResult) {
            for (let row of results.rows) {
                if (ind.industry === row.industry) {
                    ind["code"] = row.ind_code;
                    (ind.companies).push(row.comp_code);
                }
            }
        }

        // turn null arrays into empty ones
        for (let ind of indResult) {
            if ((ind.companies)[0] === null) {
                ind.companies = [];
            }
        }

        res.json({ industries: indResult });
    } catch (e) {
        next(e);
    }
});


/** Add an industry  */
router.post('/', async (req, res, next) => {
    try {
        const { industry } = req.body;
        const code = slugify(industry, {
            replacement: '-',  // replace spaces with replacement character, defaults to `-`
            lower: true,      // convert to lower case, defaults to `false`
            strict: true,     // strip special characters except replacement, defaults to `false`
            trim: true         // trim leading and trailing replacement chars, defaults to `true`);
        });
        const results = await db.query('INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry', [code, industry]);
        res.status(201).json(results.rows[0]);
    } catch (e) {
        next(e);
    }
});


/** Associate a company to an industry */
router.put('/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { comp_code } = req.body;
        const results = await db.query('INSERT INTO companies_industries (company_code, industry_code) VALUES ($1, $2) RETURNING company_code, industry_code', [comp_code, code]);
        res.status(201).json(results.rows[0]);
    } catch (e) {
        next(e);
    }
})



module.exports = router;