import React from 'react';
import kanBoard from './components/kanboard.js';
import customPrompt from './components/prompt';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

export default function App() {
	const [items, setItems] = React.useState(() => {
		const localItems = localStorage.getItem(kanBoard.storageID);
		return localItems ? JSON.parse(localItems) : [];
	});

	React.useEffect(() => {
		localStorage.setItem(kanBoard.storageID, JSON.stringify(items));
	}, [items]);

	function addColumn() {
		// new Date().getTime().toString(36) + new Date().getUTCMilliseconds()
		setItems([...items, { cards: [], id: Date.now().toString() }]);
	}

	function deleteColumn(columnID) {
		if (!items[columnID]) return;

		items.splice(columnID, 1);
		setItems([...items]);
	}

	function addCard(columnID) {
		if (!items[columnID]) return;

		items[columnID].cards.push({ id: Date.now().toString() });
		setItems([...items]);
	}

	function editCard(columnID, cardID, target) {
		customPrompt.init(target.textContent);
		customPrompt.callback = (str) => {
			if (!items[columnID]) return;
			if (!items[columnID].cards[cardID]) return;

			if (!str) {
				items[columnID].cards.splice(cardID, 1);
			} else {
				items[columnID].cards[cardID].content = str;
			}

			setItems([...items]);
		};
	}

	function onLoseFocus(target, columnID) {
		target.parentNode.children[0].classList.remove('is-hidden');

		if (!items[columnID]) return;

		items[columnID].title = target.value;
		setItems([...items]);
	}

	function onDragEnd(result) {
		console.log(result);
		if (!result.destination) return;

		const sourceIdx = result.source.index;
		const destIdx = result.destination.index;

		const sourceDropId = result.source.droppableId;
		const destDropId = result.destination.droppableId;

		if (result.type === 'COLUMN') {
			if ((sourceDropId !== destDropId || sourceIdx) === destIdx) return;
			items.splice(destIdx, 0, items.splice(sourceIdx, 1)[0]);
			setItems([...items]);
		} else {
			const current = items.find((item) => item.id === sourceDropId);
			if (current === undefined) return;

			if (sourceDropId === destDropId)
				current.cards.splice(destIdx, 0, current.cards.splice(sourceIdx, 1)[0]);
			else {
				const next = items.find((item) => item.id === destDropId);
				if (next === undefined) return;

				next.cards.splice(destIdx, 0, current.cards.splice(sourceIdx, 1)[0]);
			}

			setItems([...items]);
		}
	}

	return (
		<div>
			<div className="container">
				<header className="header">
					<div className="header-content">
						<button className="button-header" type="button" onClick={() => addColumn()}>
							+ Добавить колонку
						</button>

						<button
							className="button-header"
							type="button"
							onClick={() => {
								setItems([]);
							}}
						>
							&times; Очистить доску
						</button>
					</div>
				</header>
				{/* 
					Droppable: unsupported nested scroll container detected.A Droppable can only have one scroll parent (which can be itself)
					Nested scroll containers are currently not supported.
					We hope to support nested scroll containers soon: https://github.com/atlassian/react-beautiful-dnd/issues/131
				*/}
				<DragDropContext onDragEnd={(result) => onDragEnd(result)}>
					<Droppable droppableId="board" type="COLUMN" direction="horizontal">
						{(provided) => (
							<div
								className="board"
								ref={provided.innerRef}
								{...provided.droppableProps}
							>
								{items.map((column, columnID) => (
									<Draggable
										draggableId={column.id}
										index={columnID}
										key={column.id}
									>
										{(providedColumn) => (
											<div
												className="list-column"
												key={column.id}
												ref={providedColumn.innerRef}
												{...providedColumn.draggableProps}
											>
												<div className="list-content">
													<div className="list-header">
														<div
															className="list-header-drag"
															role="button"
															tabIndex="0"
															onKeyPress={() => {}}
															{...providedColumn.dragHandleProps}
															onClick={(event) => {
																event.target.classList.add(
																	'is-hidden'
																);
																const elem =
																	event.target.parentNode
																		.children[1];
																elem.focus();
																elem.select();
															}}
															aria-label="Drag"
														/>
														<textarea
															className="list-header-title"
															spellCheck="false"
															dir="auto"
															maxLength="512"
															onInput={(event) =>
																kanBoard.autoGrow(event.target)
															}
															onBlur={(event) =>
																onLoseFocus(event.target, columnID)
															}
															defaultValue={column.title || 'Title'}
														/>
														<button
															className="list-header-close"
															type="button"
															onClick={() => deleteColumn(columnID)}
														>
															&times;
														</button>
													</div>

													<Droppable
														droppableId={column.id}
														type="CARD"
														direction="vertical"
													>
														{(providedCardColumn) => (
															<div
																className="list-cards"
																ref={providedCardColumn.innerRef}
																{...providedCardColumn.droppableProps}
															>
																{column.cards.map(
																	(card, cardID) => (
																		<Draggable
																			draggableId={card.id}
																			index={cardID}
																			key={card.id}
																		>
																			{(providedCard) => (
																				<div
																					key={card.id}
																					index={cardID}
																					className="list-card"
																					onKeyPress={() => {}}
																					ref={
																						providedCard.innerRef
																					}
																					{...providedCard.draggableProps}
																					{...providedCard.dragHandleProps}
																					onClick={
																						(event) =>
																							editCard(
																								columnID,
																								cardID,
																								event.target
																							)
																						// eslint-disable-next-line react/jsx-curly-newline
																					}
																					role="button"
																					tabIndex="0"
																				>
																					{card.content ||
																						'Item'}
																				</div>
																			)}
																		</Draggable>
																	)
																)}
																{providedCardColumn.placeholder}
															</div>
														)}
													</Droppable>

													<div className="list-footer">
														<button
															className="list-btnAdd-card"
															type="button"
															onClick={() => addCard(columnID)}
														>
															+ Добавить карточку
														</button>
													</div>
												</div>
											</div>
										)}
									</Draggable>
								))}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>
			</div>

			<div id="prompt-overlay" />
			<div id="prompt-box">
				<div id="prompt-content">
					<textarea
						id="prompt_value"
						defaultValue=""
						onInput={(event) => kanBoard.autoGrow(event.target)}
					/>
					<button
						onClick={() => customPrompt.ok()}
						type="button"
						className="button-header"
					>
						Сохранить
					</button>
				</div>
			</div>
		</div>
	);
}
