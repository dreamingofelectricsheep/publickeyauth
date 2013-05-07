
window.addEventListener('message', 
	function(event) 
		{
			if(event.data.type != 'publicKeyAuthClient') return

			chrome.runtime.sendMessage(event.data.challenge,
				function(resp)
				{
					window.postMessage(
						{
							type: 'publicKeyAuthRelay',
							token: resp
						}, '*')
				})
		})

