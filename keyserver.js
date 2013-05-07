var jwcrypto = require('./lib/jwcrypto')

var keypair;

jwcrypto.generateKeypair({ algorithm: 'RS', keysize: 64 },
	function(err, generated) {
		keypair = generated
	})



