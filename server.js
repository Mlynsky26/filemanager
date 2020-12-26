var express = require("express")
var app = express()
const PORT = process.env.PORT || 3000
var path = require("path")
var hbs = require('express-handlebars');
var formidable = require('formidable');
var mime = require('mime')
var fs = require('fs')

var context = {
    files: [],
    filesCount: 1
}

app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', hbs({
    defaultLayout: 'main.hbs',
    extname: '.hbs',
    partialsDir: "views/partials"
}));

app.set('view engine', 'hbs');

app.listen(PORT, function () {
    console.log("to jest start serwera na porcie " + PORT)
})

app.get("/", function (req, res) {
    res.render('upload.hbs', context);
})

app.post('/', function (req, res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = __dirname + '/static/upload/'
    form.keepExtensions = true
    form.multiples = true
    form.parse(req, function (err, fields, files) {
        let timestamp = Date.now()
        if (!Array.isArray(files.filestoupload))
            files.filestoupload = [files.filestoupload]

        files.filestoupload.forEach(file => {
            let iconPath = mime.getExtension(file.type)
            if (!fs.existsSync(`static/gfx/icons/${iconPath}.png`))
                iconPath = "file"

            context.files.push({
                id: context.filesCount++,
                name: file.name,
                path: file.path,
                size: file.size,
                type: file.type,
                iconPath: iconPath,
                savedate: timestamp,
                downloadPath: "upload/" + path.basename(file.path)
            })
        })
        res.redirect('/filemanager');

    });
});

app.get("/filemanager", function (req, res) {
    res.render('filemanager.hbs', context);
})

app.get("/info/:id", function (req, res) {
    let id = req.params.id
    let file = context.files.find(file => file.id == id)
    if (file)
        res.render('info.hbs', file);
    else
        res.send("file not found")
})

app.get("/delete/:id", function (req, res) {
    let id = req.params.id
    let index = context.files.findIndex(file => file.id == id)
    if (index !== -1) {
        context.files.splice(index, 1)
        res.redirect('/filemanager');
    }
    else
        res.send("file not found")
})

app.get("/delete", function (req, res) {
    context.files.length = 0
    context.filesCount = 1
    res.redirect('/filemanager');
})

app.use(express.static('static'))