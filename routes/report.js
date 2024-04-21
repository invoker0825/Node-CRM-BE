const express = require("express");
const moment = require('moment');
const router = express.Router();
const sql = require("msnodesqlv8");
var config = require('../dbConfig');

router.get("/", (req, res) => {
    const query = "SELECT * FROM dbo.tbl_report WHERE IsDeleted=0";
    
    sql.query(config, query, (err, media) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving Users."
            });
        } else {
            res.status(200).send(media);
        }
    });
});

router.post("/add", (req, res) => {
    const query = `INSERT INTO dbo.tbl_report (Name, Type, StartDate, EndDate, CreatedOn, CreatedBy, ModifiedBy, ModifiedOn, Filter, IsDeleted) VALUES ('${req.body.Name}', '${req.body.Type}', '${moment(req.body.StartDate).format('YYYY-MM-DD HH:mm:ss.SSS')}', '${moment(req.body.EndDate).format('YYYY-MM-DD HH:mm:ss.SSS')}', '${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}', '${req.body.CreatedBy}', '${req.body.ModifiedBy}', '${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}', '', 0)`;
    
    sql.query(config, query, (err, users) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving Users."
            });
        } else {
            const getQuery = "SELECT * FROM dbo.tbl_report";
            
            sql.query(config, getQuery, (err, reports) => {
                if (err) {
                    res.status(500).send({
                        message: err.message || "Some error occurred while retrieving Users."
                    });
                } else {
                    res.status(200).send(reports);
                }
            });
        }
    });
});

module.exports = router;