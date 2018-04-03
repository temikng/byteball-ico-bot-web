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

const checkCurrencyData = checkQuery('f_currency').optional().isIn(['all', 'GBYTE', 'BTC', 'ETH', 'USDT']);

router.get('/transactions', [
    checkQuery('page').optional().isInt({min:1}),
    checkQuery('limit').optional().isInt({min:1, max:100}),
    checkQuery('sort').optional().isIn(['currency_amount', 'creation_date']),
    checkQuery('f_bb_address').optional().trim(),
    checkQuery('f_receiving_address').optional().trim(),
    checkQuery('f_txid').optional().trim(),
    checkQuery('f_stable').optional().trim(),
    checkCurrencyData,
], (req, res) => {
    const objErrors = validationResult(req);
    if (!objErrors.isEmpty()) {
        return res.status(422).json({ errors: objErrors.mapped() });
    }

    const data = matchedData(req);
    // set default data values
    if (!data.page) data.page = 1;
    if (!data.limit) data.limit = 10;
    // prepare income data values
    data.page = Number(data.page);
    data.limit = Number(data.limit);

    let numOffset = (data.page - 1) * data.limit;
    let strOrderByField = data.sort === 'currency_amount' ? 'currency_amount' : 'creation_date';

    let arrParams = [];

    let strSqlWhere = '1=1';
    if (data.f_bb_address) {
        strSqlWhere += ' AND byteball_address = ?';
        arrParams.push(data.f_bb_address);
    }
    if (data.f_receiving_address) {
        strSqlWhere += ' AND receiving_address = ?';
        arrParams.push(data.f_receiving_address);
    }
    if (data.f_txid) {
        strSqlWhere += ' AND txid = ?';
        arrParams.push(data.f_txid);
    }
    if (data.f_currency && data.f_currency !== 'all') {
        strSqlWhere += ' AND currency = ?';
        arrParams.push(data.f_currency);
    }
    if (data.hasOwnProperty('f_stable') && data.f_stable !== 'all') {
        strSqlWhere += ' AND stable = ?';
        arrParams.push(['true','1',1].includes(data.f_stable) ? 1 : 0);
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
    arrParams.push(data.limit, numOffset);

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
    checkQuery(['f_date_from', 'f_date_to']).optional().isISO8601(),
], (req, res) => {
    const objErrors = validationResult(req);
    if (!objErrors.isEmpty()) {
        return res.status(422).json({ errors: objErrors.mapped() });
    }

    const data = matchedData(req);

    let arrParams = [];

    let strSqlWhere = 'stable = 1';
    if (data.f_currency && data.f_currency !== 'all') {
        strSqlWhere += ' AND currency = ?';
        arrParams.push(data.f_currency);
    }
    if (data.f_date_from && data.f_date_to) {
        strSqlWhere += ' AND paid_date BETWEEN ? AND ?';
        arrParams.push(data.f_date_from, data.f_date_to);
    }

    const strSql = `SELECT
        date(paid_date) AS date,
        COUNT(transaction_id) AS count,
        SUM(currency_amount) AS sum
    FROM transactions
    WHERE ${strSqlWhere}
    GROUP BY date
    ORDER BY date ASC`;

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