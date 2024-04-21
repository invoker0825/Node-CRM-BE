const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

const users = require("./routes/login");
const media = require("./routes/media");
const report = require("./routes/report");
const playlist = require("./routes/playlist");
const tag = require("./routes/tag");
const layout = require("./routes/layout");
const player = require("./routes/player");
const schedule = require("./routes/schedule");
const location = require("./routes/location");
const category = require("./routes/category");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

app.use("/api/login", users);
app.use("/api/media", media);
app.use("/api/report", report);
app.use("/api/playlist", playlist);
app.use("/api/tag", tag);
app.use("/api/layout", layout);
app.use("/api/player", player);
app.use("/api/schedule", schedule);
app.use("/api/location", location);
app.use("/api/category", category);

app.listen(5001, () => console.log('Server is listening on port 5001.'));