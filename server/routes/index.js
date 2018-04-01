const router = require('express').Router();
const config = require('config');
const log = require('./../libs/logger')(module);
const { query: checkQuery, validationResult, oneOf } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(config.storage.sqlite.main.filename);

router.get('/', (req, res) => {
    res.status(200).json({
        version: process.env.npm_package_version,
        current_time: new Date()
    });
});

const checkCurrencyData = checkQuery('f_curr').optional().isIn(['all', 'GBYTE', 'BTC', 'ETH', 'USDT']);

router.get('/transactions', [
    checkQuery('p').optional().isInt({min:1}),
    checkQuery('l').optional().isInt({min:1, max:100}),
    checkQuery('s').optional().isIn(['currency_amount', 'creation_date']),
    checkQuery('f_bb').optional().trim(),
    checkQuery('f_ra').optional().trim(),
    checkQuery('f_ti').optional().trim(),
    checkQuery('f_s').optional().trim(),
    checkCurrencyData,
], (req, res) => {
    const objErrors = validationResult(req);
    if (!objErrors.isEmpty()) {
        return res.status(422).json({ errors: objErrors.mapped() });
    }

    const data = matchedData(req);
    // set default data values
    if (!data.p) data.p = 1;
    if (!data.l) data.l = 10;
    // prepare income data values
    data.p = Number(data.p);
    data.l = Number(data.l);

    let numOffset = (data.p - 1) * data.l;
    let strOrderByField = data.s === 'currency_amount' ? 'currency_amount' : 'creation_date';

    let arrParams = [];

    let strSqlWhere = '1=1';
    if (data.f_bb) {
        strSqlWhere += ' AND byteball_address = ?';
        arrParams.push(data.f_bb);
    }
    if (data.f_ra) {
        strSqlWhere += ' AND receiving_address = ?';
        arrParams.push(data.f_ra);
    }
    if (data.f_ti) {
        strSqlWhere += ' AND txid = ?';
        arrParams.push(data.f_ti);
    }
    if (data.f_curr && data.f_curr !== 'all') {
        strSqlWhere += ' AND currency = ?';
        arrParams.push(data.f_curr);
    }
    if (data.hasOwnProperty('f_s') && data.f_s !== 'all') {
        strSqlWhere += ' AND stable = ?';
        arrParams.push(['true','1',1].includes(data.f_s) ? 1 : 0);
    }

    const arrParamsTotal = arrParams.slice();
    const strSqlTotal = `SELECT
        COUNT(transaction_id) AS count
    FROM transactions
    WHERE ${strSqlWhere}`;

    const strSql = `SELECT
        *
    FROM transactions
    WHERE ${strSqlWhere}
    ORDER BY ${strOrderByField} DESC
    LIMIT ? OFFSET ?`;
    arrParams.push(data.l, numOffset);

    log.verbose(strSql);
    log.verbose(arrParams);

    db.get(strSqlTotal, arrParamsTotal, (err, row) => {
        if (err) {
            log.error(err);
            return res.status(500).end();
        }
        log.verbose('row %j', row);

        db.all(strSql, arrParams, (err, rows) => {
            if (err) {
                log.error(err);
                return res.status(500).end();
            }
            res.status(200).json({rows, total: row.count});
        });
    });
});

router.get('/statistic', [
    checkCurrencyData,
    checkQuery(['f_df', 'f_dt']).optional().isISO8601(),
], (req, res) => {
    const objErrors = validationResult(req);
    if (!objErrors.isEmpty()) {
        return res.status(422).json({ errors: objErrors.mapped() });
    }

    const data = matchedData(req);

    let arrParams = [];

    let strSqlWhere = '1=1';//stable = 1';
    if (data.f_curr && data.f_curr !== 'all') {
        strSqlWhere += ' AND currency = ?';
        arrParams.push(data.f_curr);
    }
    if (data.f_df && data.f_dt) {
        strSqlWhere += ' AND paid_date BETWEEN ? AND ?';
        arrParams.push(data.f_df, data.f_dt);
    }

    const strSql = `SELECT
        date(paid_date) AS date,
        COUNT(transaction_id) AS count,
        SUM(currency_amount) AS sum
    FROM transactions
    WHERE ${strSqlWhere}
    GROUP BY 1
    ORDER BY 1 ASC`;

    log.verbose(strSql);
    log.verbose(arrParams);

    db.all(strSql, arrParams, (err, rows) => {
        if (err) {
            log.error(err);
            return res.status(500).end();
        }
        res.status(200).json({rows});
    });
});

router.get('/common', (req, res) => {

    let arrParams = [];

    const strSql = `SELECT
        SUM(currency_amount) AS common_sum,
        COUNT(transaction_id) AS count_transactions,
        (SELECT COUNT(t.device_address) AS count FROM (SELECT device_address FROM transactions GROUP BY device_address) AS t) AS users_all,
        (SELECT COUNT(t.device_address) AS count FROM (SELECT device_address FROM transactions WHERE paid_out = 1 GROUP BY device_address) AS t) AS users_paid
    FROM transactions`;

    db.get(strSql, arrParams, (err, row) => {
        if (err) {
            log.error(err);
            return res.status(500).end();
        }
        res.status(200).json(row);
    });
});

module.exports = router;