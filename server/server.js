var jwcrypto = require('jwcrypto')


var page_path =
{
	'/': 'index.html',
	'/tags/module.js': 'tags/module.js',
	'/tags/tags.js': 'tags/tags.js'
}

var pages = {}

for(var i in page_path)
{
	(function(k, v) {
		fs.readFile(v, function(err, data)
			{
				pages[k] = data
			}
		})(i, page_path[i])
}


http.createServer(function (req, res)
	{
		var f = page[req.url]

		var code = f == undefined ?
			404 : 200

		res.writeHead(code, {'Content-Type': 'text/html'})
		res.end(f)

	}).listen(1337)


