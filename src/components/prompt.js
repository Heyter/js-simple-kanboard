import kanBoard from './kanboard';

const customPrompt = {
	ok() {
		if (customPrompt.callback) {
			customPrompt.callback(document.getElementById('prompt_value').value);
		}

		document.getElementById('prompt-box').style.display = 'none';
		document.getElementById('prompt-overlay').style.display = 'none';
	},

	cancel() {
		document.getElementById('prompt-box').style.display = 'none';
		document.getElementById('prompt-overlay').style.display = 'none';
	},

	init(text) {
		const promptOverlay = document.getElementById('prompt-overlay');
		const promptBox = document.getElementById('prompt-box');

		promptOverlay.onclick = customPrompt.cancel;

		promptOverlay.style.display = 'block';
		promptOverlay.style.height = `${window.innerHeight}px`;

		promptBox.style.width = `${window.innerWidth / 2}px`;
		promptBox.style.display = 'block';

		const textAreaElement = document.getElementById('prompt-content').children[0];
		textAreaElement.value = text;
		kanBoard.autoGrow(textAreaElement);
	},
};

export default customPrompt;
