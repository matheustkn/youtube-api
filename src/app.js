const Youtube = require('./youtube')
const express = require('express')
const shortid = require('shortid')
const fs = require('fs')
const path = require('path')

const app = express()
const port = 3000
const ip = 'localhost'

app.set('json spaces', 40)
app.use(express.json())

app.listen(port, () => {
    console.log(`api listening at http://${ip}:${port}`)

    fs.readdir('./musics', (err, files) => {
        if (err) throw err;
      
        for (const file of files) {
          fs.unlink(path.join('./musics', file), err => {
            if (err) throw err;
          });
        }
    });
})

app.get('/success', (req, res) => {
    if (req.query.sessionId && req.query.name) {
        let ytb = new Youtube({ name: req.query.name })

        ytb.search().then(function (tracks) {
            let list = []
            tracks.forEach(track => {
                list.push({id: track.id, title: track.title})
            })

            res.status(200).send(JSON.stringify(list))
        }).catch(function (e) {
            return res.redirect(`/success?name=${req.query.name}&sessionId=${req.query.sessionId}`)
        })
    }
})

app.get('/search', (req, res) => {
    if (req.query.name != '' && req.query.name != undefined) {
        let sessionId = shortid.generate()
        res.redirect(`/success?name=${req.query.name}&sessionId=${sessionId}`)
    }
})

app.get('/play', (req, res) => {
    
    if (req.query.trackId && req.query.sessionId) {
        let ytb = new Youtube({ trackId: req.query.trackId })
        
        ytb.play().then(function(trackId) {
            res.send(`/stream?sessionId=${req.query.sessionId}&trackId=${trackId}`)
        }).catch(function (e) {
            res.send(e.message)
        })
    }
})

app.get('/stream', (req, res) => {
    let path = `./musics/${req.query.trackId}.mp3`
    if (fs.existsSync(path)) {
        res.writeHead(200, {'Content-Type': 'audio/mp3'});
        let stream = fs.createReadStream(path);
        stream.pipe(res);
    }
})