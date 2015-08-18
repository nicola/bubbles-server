var ldnode = require('ldnode')
var express = require('express')
var https = require('https')
var fs = require('fs')
var path = require('path')

module.exports = createServer
function createApp (opts) {

  // Forcing some default settings
  opts.webid = true
  opts.skin = false

  // Star an express app
  var app = express()

  // Mount ldnode
  app.use('/', ldnode(opts))

  return app
}

function createServer (opts) {
  console.log('SSL Private Key path: ' + argv.key)
  console.log('SSL Certificate path: ' + argv.cert)

  if (!argv.cert && !argv.key) {
    throw new Error('Missing SSL cert and SSL key to enable WebID')
  }

  if (!argv.key && argv.cert) {
    throw new Error('Missing path for SSL key')
  }

  if (!argv.cert && argv.key) {
    throw new Error('Missing path for SSL cert')
  }

  var key
  try {
    key = fs.readFileSync(argv.key)
  } catch(e) {
    throw new Error('Can\'t find SSL key in ' + argv.key)
  }

  var cert
  try {
    cert = fs.readFileSync(argv.cert)
  } catch(e) {
    throw new Error('Can\'t find SSL cert in ' + argv.cert)
  }

  var credentials = {
    key: key,
    cert: cert,
    requestCert: true
  }

  var app = createApp(argv)
  return https.createServer(credentials, app)
}

function bin () {
  return require('nomnom')
    .script('bubbles-server')
    .option('version', {
      flag: true,
      help: 'Print current ldnode version',
      callback: function () {
        fs.readFile(path.resolve(__dirname, '../package.json'), 'utf-8',
          function (err, file) {
            if (err) {
              return 1
            }
            console.log(JSON.parse(file).version)
          })
      }
    })
    .option('root', {
      abbr: 'r',
      help: 'Root location on the filesystem to serve resources'
    })
    .option('port', {
      abbr: 'p',
      help: 'Port to use'
    })
    .option('key', {
      help: 'Path to the ssl key',
      abbr: 'K',
      full: 'key'
    })
    .option('cert', {
      full: 'cert',
      help: 'Path to the ssl cert',
      abbr: 'C'
    })
    .option('secret', {
      help: 'HTTP Session secret key (e.g. \'your secret phrase\')',
      abbr: 's'
    }).parse()
}

if (require.main === module) {
  var argv = bin()
  var server = createServer(argv)
  server.listen(argv.port, function () {
    console.log('Bubbles server started on port ' + argv.port)
  })
}
