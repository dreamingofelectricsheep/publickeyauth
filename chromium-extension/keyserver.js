var jwcrypto = require('./lib/jwcrypto')

var keypair;

jwcrypto.generateKeypair({ algorithm: 'RS', keysize: 64 },
	function(err, generated)
	{
		keypair = generated
	})

chrome.runtime.onMessage.addListener(
	function(req, sender, sendResponse)
	{
		var data =
		{
			url: sender.tab.url,
			challenge: req,
			publicKey: keypair.publicKey.serialize()
		}

		jwcrypto.sign(data, keypair.secretKey,
			function(err, token)
			{
				sendResponse(token)
			})

		return true
	})




