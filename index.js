const kanBoard = {
	clear: function() {
		localStorage.removeItem(this.storageID);
		const listNode = document.getElementById("list-columns");

		while (listNode.lastChild)
			listNode.removeChild(listNode.lastChild);
	},

	columnRemove: function(object) {
		const items = JSON.parse(localStorage.getItem(this.storageID));

		if (items !== null) {
			const parent = object.parentNode.parentNode.parentNode;
			const columnID = kanBoard.getColumnID(object);

			if (items[columnID]) {
				items.splice(columnID, 1);
				localStorage.setItem(kanBoard.storageID, JSON.stringify(items));
				parent.remove();
			}
		}
	},

	init: function() {
		const items = JSON.parse(localStorage.getItem(kanBoard.storageID));

		if (items !== null) {
			const columnNode = document.getElementById("list-column-hidden");
			const listNode = document.getElementById("list-columns");
			const itemNode = document.getElementById("list-card-hidden");
			let cloneColumnNode = itemsNode = cloneCardNode = undefined;
			let chilColumn = undefined;

			while (listNode.lastChild)
				listNode.removeChild(listNode.lastChild);

			for (const columnID in items) {
				const column = items[columnID];

				cloneColumnNode = columnNode.cloneNode(true);
				cloneColumnNode.removeAttribute("style");
				cloneColumnNode.removeAttribute("id");
				cloneColumnNode.children[0].children[1].children[0].remove();

				chilColumn = cloneColumnNode.children[0].children[0].children[1];

				if (column.title)
					chilColumn.innerHTML = column.title

				itemsNode = cloneColumnNode.children[0].children[1];
				const cards = column.cards;

				for (const cardID in cards) {
					const value = cards[cardID];

					cloneCardNode = itemNode.cloneNode(true);
					cloneCardNode.removeAttribute("style");
					cloneCardNode.removeAttribute("id");

					if (value.content)
						cloneCardNode.innerHTML = value.content;

					itemsNode.appendChild(cloneCardNode);
				}

				listNode.appendChild(cloneColumnNode);
				autoGrow(chilColumn);
			}
		}
	},

	addColumn: function(object) {
		const dupNode = document.getElementById("list-column-hidden");
		const cloneNode = dupNode.cloneNode(true);
		cloneNode.removeAttribute("style");
		cloneNode.removeAttribute("id");
		cloneNode.children[0].children[1].children[0].remove();

		const items = JSON.parse(localStorage.getItem(this.storageID)) || [];
		items.push({ cards: [] })

		document.getElementById("list-columns").appendChild(cloneNode);
		localStorage.setItem(this.storageID, JSON.stringify(items));
	},

	addItem: function(object) {
		const parent = object.parentNode.parentNode;
		const itemsNode = parent.children[1];
		const dupNode = document.getElementById("list-card-hidden");

		const cloneNode = dupNode.cloneNode(true);
		cloneNode.removeAttribute("style");
		cloneNode.removeAttribute("id");

		const items = JSON.parse(localStorage.getItem(this.storageID));

		if (items !== null) {
			const columnID = this.getColumnID(object);

			if (items[columnID]) {
				const cardID = items[columnID].cards.push({}) - 1;
				localStorage.setItem(this.storageID, JSON.stringify(items));
			}
		}

		itemsNode.appendChild(cloneNode);
	},

	getColumnID: function(object) {
		const listNode = document.getElementById("list-columns");
		const parent = object.parentNode.parentNode.parentNode;

		for (let i = 0; i < listNode.children.length; i++)
			if (listNode.children[i] === parent)
				return i;
	},

	getCardID: function(object) {
		const parent = object.parentNode;

		for (let i = 0; i < parent.children.length; i++)
			if (parent.children[i] === object)
				return i;
	},

	storageID: "kanboard.items",
}

function startEditing(object) {
	object.classList.add("is-hidden");

	const elem = object.parentNode.children[1];
	elem.focus();
	elem.select();
}

function autoGrow(object) {
	object.style.setProperty("min-height", "24px");
	object.style.setProperty("min-height", object.scrollHeight + "px");
}

function onLoseFocus(object) {
	const items = JSON.parse(localStorage.getItem(kanBoard.storageID));

	if (items !== null) {
		const columnID = kanBoard.getColumnID(object);

		if (items[columnID]) {
			if (object.className === "list-header-title") { // column title
				items[columnID].title = object.value;
			} else { // card
				const cardID = kanBoard.getCardID(object);

				if (object.value.length === 0) {
					items[columnID].cards.splice(cardID, 1);
					object.remove();
				} else {
					items[columnID].cards[cardID].content = object.value;
				}
			}

			localStorage.setItem(kanBoard.storageID, JSON.stringify(items));
		}
	}

	if (object.className === "list-header-title")
		object.parentNode.children[0].classList.remove("is-hidden");
}

function editCard(object) {
	customPrompt.render(object.textContent);
	customPrompt.object = object;
	customPrompt.callback = function(str) {
		const elem = customPrompt.object;

		if (!elem)
			return;

		const columnID = kanBoard.getColumnID(elem);
		const items = JSON.parse(localStorage.getItem(kanBoard.storageID));

		if (!items[columnID])
			return;

		const cardID = kanBoard.getCardID(elem);

		if (!items[columnID].cards[cardID])
			return;

		if (!str) {
			items[columnID].cards.splice(cardID, 1);
			elem.remove();
		} else {
			items[columnID].cards[cardID].content = str;
			elem.innerHTML = str;
		}

		localStorage.setItem(kanBoard.storageID, JSON.stringify(items));
	}
}

window.addEventListener("DOMContentLoaded", function() {
	kanBoard.init();
});

const customPrompt = {
	render: function(dialog) {
		const promptOverlay = document.getElementById('prompt-overlay');
	    const promptBox = document.getElementById('prompt-box');

		promptOverlay.style.display = "block";
	    promptOverlay.style.height = window.innerHeight + "px";

		promptBox.style.width = (window.innerWidth / 2) + 'px';
	    promptBox.style.display = "block";

		const textAreaElement = document.getElementById('prompt-content').children[0];
		textAreaElement.value = dialog;
		autoGrow(textAreaElement);
	},

	cancel: function() {
		document.getElementById('prompt-box').style.display = "none";
		document.getElementById('prompt-overlay').style.display = "none";
	},

	ok: function() {
		if (customPrompt.callback)
			customPrompt.callback(document.getElementById('prompt_value').value)

		document.getElementById('prompt-box').style.display = "none";
		document.getElementById('prompt-overlay').style.display = "none";
	},
}