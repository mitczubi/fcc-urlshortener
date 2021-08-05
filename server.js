const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

var app = express();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;

const shortURLSchema = new Schema({
    original_url: String,
    short_url: Number
})

const ShortUrl = mongoose.model("ShortURL", shortURLSchema);

const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());
app.use(function(req, res, next) {
    console.log(req.method + " " + req.path + " " + req.ip)
    next();
})

app.get('/', function(req, res) {
    res.send("URL Shortener");
})

app.post('/api/shorturl', async function(req, res) {
    var url_expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
    var regex = new RegExp(url_expression);
    let num_of_records;
    
    if ((req.body.original_url).match(regex)) {
        num_of_records = await ShortUrl.countDocuments({})

        short_url_id = num_of_records + 1;
        const shortUrl = new ShortUrl({
            original_url: req.body.original_url,
            short_url: short_url_id
        })

        shortUrl.save(function(err, data) {
            if (err) return console.error(err);
        });

        res.json({
            original_url: req.body.original_url,
            short_url: shortUrl.short_url
        })
    } else {
        res.json({
            error: "invalid url"
        })
    }
  }.catch(err => {
    console.log(err);
  })
)

app.get('/api/shorturl/:short_url', function(req, res) {
    ShortUrl.findOne({short_url: req.params.short_url}, function(err, data) {
        if (err) return console.error(err);
        res.redirect(data.original_url);
    })
})

app.listen(port, () => {
    console.log("Server running. Listening on port %d", port)
})