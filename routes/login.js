const express = require("express");
const moment = require('moment');
const router = express.Router();
const sql = require("msnodesqlv8");
var config = require('../dbConfig');
const crypto = require('crypto');

const sha1Hash = (message) => {
    const hash = crypto.createHash('sha1');
    hash.update(message);
    return hash.digest('hex');
}

router.get("/users", (req, res) => {
    const query = "SELECT dbo.tbl_login.*, dbo.tbl_login_group.Name as GroupName FROM dbo.tbl_login LEFT JOIN dbo.tbl_login_group ON dbo.tbl_login.GroupID=dbo.tbl_login_group.ID WHERE dbo.tbl_login.IsDeleted=0";
    
    sql.query(config, query, (err, users) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving Users."
            });
        } else {
            res.status(200).send(users);
        }
    });
});



router.post("/", (req, res) => {
    const query = `SELECT * FROM dbo.tbl_login WHERE Email='${req.body.username}'`;
    
    sql.query(config, query, (err, users) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving Users."
            });
        } else {
            if (users.length > 0) {
                if (users[0].Password === sha1Hash(req.body.password)) {
                    res.status(200).send(users[0]);
                } else {
                    res.status(200).send({
                        message: "Incorrect password!"
                    });
                }
            } else {
                res.status(200).send({
                    message: "User does not exist."
                });
            }
        }
    });
});

router.post("/users/add", (req, res) => {
    const query = `INSERT INTO dbo.tbl_login (Email, GroupID, Status, Password, Login, Role, IsDeleted, CreatedOn, CreatedBy, ModifiedBy, ModifiedOn) VALUES ('${req.body.Email}', '${req.body.GroupID}', ${req.body.Status}, '${sha1Hash(req.body.Password)}', '${req.body.Email}', 1, 0, '${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}', 'Admin', 'Admin', '${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}')`;
    
    sql.query(config, query, (err, users) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving Users."
            });
        } else {
            const getQuery = "SELECT dbo.tbl_login.*, dbo.tbl_login_group.Name as GroupName FROM dbo.tbl_login LEFT JOIN dbo.tbl_login_group ON dbo.tbl_login.GroupID=dbo.tbl_login_group.ID";
            
            sql.query(config, getQuery, (err, users) => {
                if (err) {
                    res.status(500).send({
                        message: err.message || "Some error occurred while retrieving Users."
                    });
                } else {
                    res.status(200).send(users);
                }
            });
        }
    });
});

router.get("/groups", (req, res) => {
    const query = "SELECT * FROM dbo.tbl_login_group";
    
    sql.query(config, query, (err, groups) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving groups."
            });
        } else {
            res.status(200).send(groups);
        }
    });
});

module.exports = router;