const express = require("express");
const moment = require('moment');
const router = express.Router();
const sql = require("msnodesqlv8");
var config = require('../dbConfig');

router.get("/", (req, res) => {
    const query = "SELECT * FROM dbo.tbl_playlist_master WHERE IsDeleted=0";
    const tagQuery = "SELECT * FROM dbo.tbl_tag WHERE IsDeleted=0";

    let allTags = [];

    sql.query(config, tagQuery, (err, tags) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving Playlists."
            });
        } else {
            allTags = tags;
        }
    });
    
    sql.query(config, query, (err, playlists) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving Playlists."
            });
        } else {
            const tagObjectQuery = "SELECT * FROM dbo.tbl_tag_object";
            sql.query(config, tagObjectQuery, (err, tagObjects) => {
                if (err) {
                    res.status(500).send({
                        message: err.message || "Some error occurred while retrieving Playlists."
                    });
                } else {
                    let temp = [];
                    playlists.forEach(pl => {
                        let tempTags = tagObjects.filter(t => t.ObjectType === 'playlist' && t.ObjectID === pl.ID);
                        let tempTagNames = [];
                        tempTags.forEach(t => {
                            tempTagNames.push(allTags.filter(tag => tag.ID === t.TagID)[0].ID)
                        })
                        temp.push({...pl, Tag: tempTagNames});
                    })
                    res.status(200).send(temp);
                }
            });
        }
    });
});

router.post("/add", (req, res) => {
    let newData = req.body;
    const query = `INSERT INTO dbo.tbl_playlist_master (Name, Duration, Status, LayoutMasterID, Priority, IsDeleted, CreatedOn, CreatedBy, ModifiedBy, ModifiedOn, GroupID) OUTPUT INSERTED.ID AS InsertedId VALUES ('${req.body.Name}', '${req.body.Duration}', 0, '${req.body.layout.ID}', 0, 0, '${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}', '${req.body.CreatedBy}', '${req.body.ModifiedBy}', '${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}', '28ADF1D8-BB8C-40A1-A151-7FBF143B876F')`;
    
    sql.query(config, query, async (err, playlist) => {
        if (err) {
            console.log('-------------------', err)
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving Users."
            });
        } else {
            if(newData.Tag.length > 0) { 
                for (const t of newData.Tag) {
                    
                    try {
                        await new Promise((resolve, reject) => {
                            const getTagQuery = `SELECT * FROM dbo.tbl_tag WHERE ID='${t}'`;
                            sql.query(config, getTagQuery, (err, tags) => {
                                if (err) {
                                    const insertTagQuery = `INSERT INTO dbo.tbl_tag (Name, IsDeleted, CreatedOn, CreatedBy, ModifiedBy, ModifiedOn) OUTPUT INSERTED.ID AS InsertedId VALUES ('${t}', 0, '${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}', '${req.body.CreatedBy}', '${req.body.CreatedBy}', '${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}')`;
                                    sql.query(config, insertTagQuery, (err, newTag) => {
                                        if (err) {
                                            console.log('-------------------', err)
                                            res.status(500).send({
                                                message: err.message || "Some error occurred while retrieving Users."
                                            });
                                        } else {
                                            const insertTagObjectQuery = `INSERT INTO dbo.tbl_tag_object (ObjectID, ObjectType, TagID) VALUES ('${playlist[0].InsertedId}', 'playlist', '${newTag[0].InsertedId}')`;
                                            sql.query(config, insertTagObjectQuery, (err, playlist) => {
                                                if (err) {
                                                    console.log('-------------------', err)
                                                    res.status(500).send({
                                                        message: err.message || "Some error occurred while retrieving Users."
                                                    });
                                                } else {
                                                    resolve(tags);
                                                }
                                            })
                                        }
                                    })
                                } else {
                                    const insertTagObjectQuery = `INSERT INTO dbo.tbl_tag_object (ObjectID, ObjectType, TagID) VALUES ('${playlist[0].InsertedId}', 'playlist', '${t}')`;
                                    sql.query(config, insertTagObjectQuery, (err, playlist) => {
                                        if (err) {
                                            console.log('-------------------', err)
                                            res.status(500).send({
                                                message: err.message || "Some error occurred while retrieving Users."
                                            });
                                        } else {
                                            resolve(tags);
                                        }
                                    })
                                }
                            });
                        });
                    } catch (error) {
                        res.status(500).send({
                        message: error.message || "Some error occurred while retrieving Playlists."
                        });
                    }
                }
                res.status(200).send({
                    message: "Success"
                });
            } else {
                res.status(200).send({
                    message: "Success"
                });
            }
        }
    });
});

router.post("/delete", (req, res) => {
    const query = `DELETE FROM dbo.tbl_playlist_master WHERE ID='${req.body.ID}'`;
    
    sql.query(config, query, (err, playlist) => {
        if (err) {
            console.log('-------------------', err)
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving Users."
            });
        } else {
            const tagQuery = `DELETE FROM dbo.tbl_tag_object WHERE ObjectID='${req.body.ID}'`;
            
            sql.query(config, tagQuery, (err, playlist) => {
                if (err) {
                    res.status(500).send({
                        message: err.message || "Some error occurred while retrieving Users."
                    });
                } else {
                    res.status(200).send({
                        message: "Success"
                    });
                }
            });
        }
    });
});

module.exports = router;