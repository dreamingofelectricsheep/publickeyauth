var jwcrypto = require('jwcrypto'),
	fs = require('fs'),
	http = require('http'),
	crypto = require('crypto')


var page_path =
{
	'/css': 'style.css',
	'/': 'index.html',
	'/tags/module.js': 'tags/module.js',
	'/tags/tags.js': 'tags/tags.js'
}

var pages = {}

var publicKeys = {}
var cookies = {}


function fail(res)
{
	res.writeHead(500, {'Content-Type': 'text/html'})
	res.end('Something went horribly wrong!')
}

http.createServer(function (req, res)
	{
		switch(req.url)
		{
			case '/challenge':
				res.writeHead(200, {'Content-Type': 'text/html'})
				res.end('A securely generated string.')
				break
			case '/login':
				var token = ''
				req.addListener('data', function(chunk) { token += chunk })

				req.addListener('end', function()
					{
						var public = token.split('.')
						console.log('Received token: ' + token)
					
						public = new Buffer(public[1], 'base64').toString('utf8')
						public = JSON.parse(public)
						console.log('Public key: ' + public.publicKey)

						public = jwcrypto.loadPublicKey(public.publicKey)
						console.log(public.serialize())

						jwcrypto.verify(token, public, 
							function(err, payload)
							{
								if(!err) console.log('Verified token!')

								crypto.randomBytes(10, 
									function(e, buf)
									{
										var cookie = buf.toString('base64')
										cookies[cookie] = payload.publicKey
										publicKeys[payload.publicKey] = ''

										res.writeHead(200, 
											{
												'Set-Cookie': 'auth=' + cookie
											})
										res.end()
									})
							})
					})
			
			default:
			{
				for(var i in page_path)
				{
					(function(k, v) {
						fs.readFile(v, function(err, data)
							{
								pages[k] = data
							})
						})(i, page_path[i])
				}		

				var body = pages[req.url]
				var code = body == undefined ?
					404 : 200

				res.writeHead(code, {'Content-Type': 'text/html'})
				res.end(body)
			}
		}
	}).listen(1337)


