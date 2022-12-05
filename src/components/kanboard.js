const kanBoard = {
	storageID: 'kanboard.items',

	autoGrow(target) {
		target.style.setProperty('min-height', '24px');
		target.style.setProperty('min-height', `${target.scrollHeight}px`);
	},
};

export default kanBoard;
