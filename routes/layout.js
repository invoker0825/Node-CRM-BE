const express = require("express");
const moment = require('moment');
const router = express.Router();
const sql = require("msnodesqlv8");
var config = require('../dbConfig');

router.get("/", (req, res) => {
    const masterQuery = "SELECT * FROM dbo.tbl_layout_master WHERE isDeleted=0";
    
    sql.query(config, masterQuery, async (err, layoutMasters) => {
        if (err) {
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving Playlists."
            });
        } else {
            let layout = [];
            for (const layoutMaster of layoutMasters) {
                let temp = { ...layoutMaster };
                try {
                  const layoutChilds = await new Promise((resolve, reject) => {
                    const childQuery = `SELECT * FROM dbo.tbl_layout_child WHERE LayoutMasterID='${layoutMaster.ID}'`;
                    sql.query(config, childQuery, (err, result) => {
                      if (err) {
                        reject(err);
                      } else {
                        resolve(result);
                      }
                    });
                  });
                  
                  temp = { ...temp, child: layoutChilds[0] };
                  
                  const resolutions = await new Promise((resolve, reject) => {
                    const resolutionQuery = `SELECT * FROM dbo.tbl_resolution WHERE ID='${layoutChilds[0].ResolutionID}'`;
                    sql.query(config, resolutionQuery, (err, result) => {
                      if (err) {
                        reject(err);
                      } else {
                        resolve(result);
                      }
                    });
                  });
                  
                  temp = { ...temp, resolution: resolutions[0] };
                  
                  const details = await new Promise((resolve, reject) => {
                    const detailQuery = `SELECT * FROM dbo.tbl_layout_detail WHERE LayoutChildID='${layoutChilds[0].ID}' AND IsDeleted=0`;
                    sql.query(config, detailQuery, (err, result) => {
                      if (err) {
                        reject(err);
                      } else {
                        resolve(result);
                      }
                    });
                  });
                  
                  temp = { ...temp, details: details };
                  layout.push(temp);
                  
                } catch (error) {
                  res.status(500).send({
                    message: error.message || "Some error occurred while retrieving Playlists."
                  });
                }
            }
            res.status(200).send(layout);
        }
    });
});

router.post("/add", (req, res) => {
    let newData = req.body;
    const masterQuery = `INSERT INTO dbo.tbl_layout_master (Name, IsDeleted, CreatedOn, CreatedBy, ModifiedBy, ModifiedOn) OUTPUT INSERTED.ID AS InsertedId VALUES ('${req.body.Name}', 0, '${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}', '${req.body.CreatedBy}', '${req.body.ModifiedBy}', '${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}')`;
    
    sql.query(config, masterQuery, (err, layoutMaster) => {
        if (err) {
            console.log('-------------------', err)
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving Users."
            });
        } else {
            const resolutionQuery = `INSERT INTO dbo.tbl_resolution (Name, Width, Height, IsDeleted, CreatedOn, CreatedBy, ModifiedBy, ModifiedOn) OUTPUT INSERTED.ID AS InsertedId VALUES ('${req.body.resolution.Width + 'x' + req.body.resolution.Height}', '${req.body.resolution.Width}', '${req.body.resolution.Height}', 0, '${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}', '${req.body.CreatedBy}', '${req.body.ModifiedBy}', '${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}')`;

            sql.query(config, resolutionQuery, (err, resolution) => {
                if (err) {
                    console.log('-------------------', err)
                    res.status(500).send({
                        message: err.message || "Some error occurred while retrieving Users."
                    });
                } else {
                    const childQuery = `INSERT INTO dbo.tbl_layout_child (LayoutMasterID, ResolutionID, IsDeleted, CreatedOn, CreatedBy, ModifiedBy, ModifiedOn) OUTPUT INSERTED.ID AS InsertedId VALUES ('${layoutMaster[0].InsertedId}', '${resolution[0].InsertedId}', 0, '${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}', '${req.body.CreatedBy}', '${req.body.ModifiedBy}', '${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}')`;
        
                    sql.query(config, childQuery, (err, child) => {
                        if (err) {
                            console.log('-------------------', err)
                            res.status(500).send({
                                message: err.message || "Some error occurred while retrieving Users."
                            });
                        } else {
                            newData.details.forEach(detail => {
                                const detailQuery = `INSERT INTO dbo.tbl_layout_detail (LayoutChildID, X, Y, Width, Height, Panel, PanelName, Layer, IsDeleted, CreatedOn, CreatedBy, ModifiedBy, ModifiedOn) VALUES ('${child[0].InsertedId}', '${detail.X}', '${detail.Y}', '${detail.Width}', '${detail.Height}', '${parseInt(detail.PanelName) + 1}', '${detail.PanelName}', '${parseInt(detail.PanelName) + 1}', 0, '${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}', '${req.body.CreatedBy}', '${req.body.ModifiedBy}', '${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}')`;
                    
                                sql.query(config, detailQuery, (err, details) => {
                                    if (err) {
                                        console.log('-------------------', err)
                                        res.status(500).send({
                                            message: err.message || "Some error occurred while retrieving Users."
                                        });
                                    } else {
                                        const masterQuery = "SELECT * FROM dbo.tbl_layout_master WHERE isDeleted=0";
    
                                        sql.query(config, masterQuery, async (err, layoutMasters) => {
                                            if (err) {
                                                res.status(500).send({
                                                    message: err.message || "Some error occurred while retrieving Playlists."
                                                });
                                            } else {
                                                let layout = [];
                                                for (const layoutMaster of layoutMasters) {
                                                    let temp = { ...layoutMaster };
                                                    try {
                                                    const layoutChilds = await new Promise((resolve, reject) => {
                                                        const childQuery = `SELECT * FROM dbo.tbl_layout_child WHERE LayoutMasterID='${layoutMaster.ID}'`;
                                                        sql.query(config, childQuery, (err, result) => {
                                                        if (err) {
                                                            reject(err);
                                                        } else {
                                                            resolve(result);
                                                        }
                                                        });
                                                    });
                                                    
                                                    temp = { ...temp, child: layoutChilds[0] };
                                                    
                                                    const resolutions = await new Promise((resolve, reject) => {
                                                        const resolutionQuery = `SELECT * FROM dbo.tbl_resolution WHERE ID='${layoutChilds[0].ResolutionID}'`;
                                                        sql.query(config, resolutionQuery, (err, result) => {
                                                        if (err) {
                                                            reject(err);
                                                        } else {
                                                            resolve(result);
                                                        }
                                                        });
                                                    });
                                                    
                                                    temp = { ...temp, resolution: resolutions[0] };
                                                    
                                                    const details = await new Promise((resolve, reject) => {
                                                        const detailQuery = `SELECT * FROM dbo.tbl_layout_detail WHERE LayoutChildID='${layoutChilds[0].ID}' AND IsDeleted=0`;
                                                        sql.query(config, detailQuery, (err, result) => {
                                                        if (err) {
                                                            reject(err);
                                                        } else {
                                                            resolve(result);
                                                        }
                                                        });
                                                    });
                                                    
                                                    temp = { ...temp, details: details };
                                                    layout.push(temp);
                                                    
                                                    } catch (error) {
                                                    res.status(500).send({
                                                        message: error.message || "Some error occurred while retrieving Playlists."
                                                    });
                                                    }
                                                }
                                                res.status(200).send(layout);
                                            }
                                        });
                                    }
                                });                                
                            });                
                        }
                    });           
                }
            });   
        }
    });
});

router.post("/update", (req, res) => {
    let newData = req.body;
    const masterQuery = `UPDATE dbo.tbl_layout_master SET Name = '${req.body.Name}' WHERE ID='${req.body.ID}'`;
    
    sql.query(config, masterQuery, (err, layoutMaster) => {
        if (err) {
            console.log('-------------------', err)
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving Users."
            });
        } else {
            const resolutionQuery = `UPDATE dbo.tbl_resolution SET Name = '${req.body.resolution.Width + 'x' + req.body.resolution.Height}', Width = '${req.body.resolution.Width}', Height = '${req.body.resolution.Height}' WHERE ID='${req.body.resolution.ID}'`;

            sql.query(config, resolutionQuery, async (err, resolution) => {
                if (err) {
                    console.log('-------------------', err)
                    res.status(500).send({
                        message: err.message || "Some error occurred while retrieving Users."
                    });
                } else {
                    for (const detail of newData.details) {
                        let detailQuery = '';
                        if (detail.ID) {
                            detailQuery = `UPDATE dbo.tbl_layout_detail SET LayoutChildID = '${req.body.child.ID}', X = '${detail.X}', Y = '${detail.Y}', Width = '${detail.Width}', Height = '${detail.Height}', Panel = '${parseInt(detail.PanelName) + 1}', PanelName = '${detail.PanelName}', Layer = '${parseInt(detail.PanelName) + 1}' WHERE ID='${detail.ID}'`;
                        } else {
                            detailQuery = `INSERT INTO dbo.tbl_layout_detail (LayoutChildID, X, Y, Width, Height, Panel, PanelName, Layer, IsDeleted, CreatedOn, CreatedBy, ModifiedBy, ModifiedOn) VALUES ('${req.body.child.ID}', '${detail.X}', '${detail.Y}', '${detail.Width}', '${detail.Height}', '${parseInt(detail.PanelName) + 1}', '${detail.PanelName}', '${parseInt(detail.PanelName) + 1}', 0, '${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}', '${req.body.CreatedBy}', '${req.body.ModifiedBy}', '${moment().format('YYYY-MM-DD HH:mm:ss.SSS')}')`;
                        }
                        try {
                            await new Promise((resolve, reject) => {
                                const childQuery = `SELECT * FROM dbo.tbl_layout_child WHERE LayoutMasterID='${layoutMaster.ID}'`;
                                sql.query(config, detailQuery, (err, result) => {
                                  if (err) {
                                    reject(err);
                                    res.status(500).send({
                                        message: err.message || "Some error occurred while retrieving Users."
                                    });
                                  } else {
                                    resolve(result);
                                  }
                                });
                            });
                        } catch (error) {
                            res.status(500).send({
                            message: error.message || "Some error occurred while retrieving Playlists."
                            });
                        }                            
                    };
                    
                    const masterQuery = "SELECT * FROM dbo.tbl_layout_master WHERE isDeleted=0";

                    sql.query(config, masterQuery, async (err, layoutMasters) => {
                        if (err) {
                            res.status(500).send({
                                message: err.message || "Some error occurred while retrieving Playlists."
                            });
                        } else {
                            let layout = [];
                            for (const layoutMaster of layoutMasters) {
                                let temp = { ...layoutMaster };
                                try {
                                const layoutChilds = await new Promise((resolve, reject) => {
                                    const childQuery = `SELECT * FROM dbo.tbl_layout_child WHERE LayoutMasterID='${layoutMaster.ID}'`;
                                    sql.query(config, childQuery, (err, result) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(result);
                                    }
                                    });
                                });
                                
                                temp = { ...temp, child: layoutChilds[0] };
                                
                                const resolutions = await new Promise((resolve, reject) => {
                                    const resolutionQuery = `SELECT * FROM dbo.tbl_resolution WHERE ID='${layoutChilds[0].ResolutionID}'`;
                                    sql.query(config, resolutionQuery, (err, result) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(result);
                                    }
                                    });
                                });
                                
                                temp = { ...temp, resolution: resolutions[0] };
                                
                                const details = await new Promise((resolve, reject) => {
                                    const detailQuery = `SELECT * FROM dbo.tbl_layout_detail WHERE LayoutChildID='${layoutChilds[0].ID}' AND IsDeleted=0`;
                                    sql.query(config, detailQuery, (err, result) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        resolve(result);
                                    }
                                    });
                                });
                                
                                temp = { ...temp, details: details };
                                layout.push(temp);
                                
                                } catch (error) {
                                res.status(500).send({
                                    message: error.message || "Some error occurred while retrieving Playlists."
                                });
                                }
                            }
                            res.status(200).send(layout);
                        }
                    });   
                }
            });   
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