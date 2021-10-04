const ytdl = require('ytdl-core')
const yts = require('youtube-search-api');
const fs = require('fs');

global.URL = require('url').URL;

class Youtube {
    constructor(query) {
        this.query = query.name
        this.trackId = query.trackId
    }

    async search() {
        let data = await yts.GetListByKeyword(this.query, [false]);
        data['items'].forEach(function (item, index) {
            if (item.isLive) {
                data['items'].splice(index, 1)
            }
        })

        return await data['items']
    }

    async play() {
        let filePath = `./musics/${this.trackId}.mp3`
        if (fs.existsSync(filePath)) {
            return this.trackId
        }
        else {
            return new Promise((resolve, reject) => {
                let download = ytdl(`https://www.youtube.com/watch?v=${this.trackId}`, { filter: 'audioonly' })
                let stream = fs.createWriteStream(filePath)
                
                download.pipe(stream)

                console.log('Downloading ' + this.trackId)
                
                stream.on('finish', () => {
                    setTimeout(() => {
                        console.log('Downloaded! Track: ' + this.trackId)

                        resolve(this.trackId)
                    }, 1000)
                });
                stream.on('error', reject);

                setTimeout((path) => {
                    fs.unlinkSync(path)
                }, 60000 * 30, filePath)
            });
        }
    }
}

module.exports = Youtube;