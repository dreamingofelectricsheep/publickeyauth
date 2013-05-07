var jwcrypto = require('jwcrypto'),
	fs = require('fs'),
	http = require('http'),
	crypto = require('crypto')


var page_path =
{
	'/css': 'style.css',
	'/': 'index.html',
	'/authed': 'authed.html',
	'/tags/module.js': 'tags/module.js',
	'/tags/tags.js': 'tags/tags.js'
}

function getPage(p)
{
	p = page_path[p]
	if(p != undefined)
		return fs.readFileSync(p)
}

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
								console.log(payload)

								crypto.randomBytes(30, 
									function(e, buf)
									{
										console.log('Got random.')
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
				break;
			
			case '/':
				console.log(req.headers.cookie)

				res.writeHead(200, {'Content-Type': 'text/html'})

				var cookie = req.headers.cookie
				if(cookie != undefined)
				{
					cookie = cookie.split(';')
					cookie = cookie.map(function(v) { return v.trim().split('=') })
					var c = {}
					cookie.map(function(v) { c[v[0]] = v[1] })
					cookie = c['auth']
				}

				console.log('Auth: ' + cookie)

				if(cookies[cookie] != undefined)
					res.end(getPage('/authed'))
				else
					res.end(getPage('/'))
				break;

			default:
			{
				var body = getPage(req.url)
				var code = body == undefined ?
					404 : 200

				res.writeHead(code, {'Content-Type': 'text/html'})
				res.end(body)
			}
		}
	}).listen(1337)


