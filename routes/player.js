const express = require("express");
const moment = require('moment');
const router = express.Router();
const sql = require("msnodesqlv8");
var config = require('../dbConfig');

router.get("/", (req, res) => {
    const query = "SELECT * FROM dbo.tbl_client WHERE IsDeleted=0";
    
    sql.query(config, query, (err, player) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving Users."
            });
        } else {
            res.status(200).send(player);
        }
    });
});

module.exports = router;