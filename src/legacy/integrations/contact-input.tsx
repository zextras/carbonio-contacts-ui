/* eslint-disable @typescript-eslint/no-use-before-define */
/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
	ReactElement,
	FC,
	useMemo
} from 'react';

import styled from '@emotion/styled';
import {
	ChipInput,
	Container,
	type ChipInputProps,
	useCombinedRefs,
	ChipAction,
	ChipItem,
	Chip
} from '@zextras/carbonio-design-system';
import {
	isValidEmail,
	EDIT_ACTION_ID,
	CONTACT_TYPES,
	ContactInputItem,
	ContactInputProps,
	UserContact,
	DistributionListContact,
	UserOrDL,
	GroupContact,
	ContactInputItemInternalValue
} from '@zextras/carbonio-ui-commons';
import { legacySoapFetch } from '@zextras/carbonio-ui-soap-lib';
import { TFunction } from 'i18next';
import { filter, find, map, uniqBy, noop, reduce } from 'lodash';
import { useTranslation } from 'react-i18next';

import { DistributionListChip } from 'legacy/integrations/distribution-list-chip';
import { Loader } from 'legacy/integrations/parts/loader';
import { PasteContextMenu } from 'legacy/integrations/parts/paste-context-menu';
import { useChipsFlip } from 'legacy/integrations/parts/use-chips-flip';
import {
	type ChipBox,
	type DropTarget,
	findDropTarget,
	getContactLabel,
	insertChipAt,
	searchContacts,
	tryToParseEmail
} from 'legacy/integrations/parts/utils';
import { ContactInputOptions } from 'legacy/integrations/types';
import type { GetContactsRequest, GetContactsResponse } from 'legacy/types/soap';

const CHIP_TO_EXCLUDE = 'this-value-represent-a-chip-that-should-not-be-present';
const CHIPINPUT_DEBOUNCE_TIME = 500;

type EditChipFn = (text: string, id: string) => void;

/**
 * The chip being dragged, shared by every contact input of the page: during dragover the browser does not expose
 * the dragged data, and the input under the pointer needs the chip to show it in its new place.
 * Set only by a drag started in this page: a drop without it (e.g. from another page) is ignored.
 * The input that gets the chip removes it from the source: the dragend may never reach the source, when a
 * preview remounts the dragged chip
 */
let activeDrag:
	| { chip: ContactInputItem; source: HTMLInputElement | null; removeFromSource: () => void }
	| undefined;

/**
 * The chip being dragged in this input: shown as a placeholder where it will go, or hidden while the pointer is
 * over another input (it is shown there). Hidden, not removed: the browser sends the dragend to its element
 */
const DraggedChipContext = createContext<{ id: string; hidden: boolean } | undefined>(undefined);

const CHIP_DROP_ID_SELECTOR = '[data-chip-drop-id]';
const CONTACT_INPUT_ROOT_SELECTOR = '[data-contact-input-root]';
const CONTACT_DRAG_TYPE = 'contact';

const ChipDropZoneEl = styled.span<{ $dragged: boolean; $hidden: boolean }>`
	display: ${({ $hidden }): string => ($hidden ? 'none' : 'inline-flex')};
	min-width: 0;
	max-width: 100%;
	opacity: ${({ $dragged }): number => ($dragged ? 0.4 : 1)};
	transition: opacity 150ms ease-out;
`;

/** The part of a chip that slides to its new place: its drop zone stays where the layout puts it */
const ChipFlipEl = styled.span`
	display: inline-flex;
	min-width: 0;
	max-width: 100%;
`;

/** Wraps a chip to find its box during a drag and to show it as a placeholder while it is the dragged one */
const ChipDropZone: FC<Readonly<{ id: string; children: React.ReactNode }>> = ({
	id,
	children
}) => {
	const dragged = useContext(DraggedChipContext);
	const isDragged = dragged?.id === id;
	return (
		<ChipDropZoneEl
			data-testid={'chip-drop-zone'}
			data-chip-drop-id={id}
			$dragged={isDragged}
			$hidden={isDragged && !!dragged?.hidden}
		>
			<ChipFlipEl data-chip-flip={id}>{children}</ChipFlipEl>
		</ChipDropZoneEl>
	);
};

const getChipBoxes = (container: Element): Array<ChipBox> =>
	Array.from(container.querySelectorAll<HTMLElement>(CHIP_DROP_ID_SELECTOR)).map((el) => {
		const { left, right, top, bottom } = el.getBoundingClientRect();
		return { id: el.dataset.chipDropId ?? '', left, right, top, bottom };
	});

/** The id of the chip named by the drag data, if the data is a chip at all (a file, some text, a malformed one) */
const getDraggedChipId = (dataTransfer: DataTransfer): string | undefined => {
	try {
		const chip: unknown = JSON.parse(dataTransfer.getData(CONTACT_DRAG_TYPE));
		return chip && typeof chip === 'object' && 'id' in chip && typeof chip.id === 'string'
			? chip.id
			: undefined;
	} catch {
		// empty or non-JSON drag data (a file, some text) is expected: it is not a chip
		return undefined;
	}
};

/** A chip moved from another input, whose edit action edits in the input that gets it */
const withEditActionOf = (
	chip: ContactInputItem,
	chipId: string,
	editChip: EditChipFn
): ContactInputItem => ({
	...chip,
	actions: chip.actions?.map((action) =>
		action.id === EDIT_ACTION_ID
			? { ...action, onClick: (): void => editChip(chip.value.email ?? '', chipId) }
			: action
	)
});

function createChipFromEmail(
	t: TFunction,
	editChipFn: EditChipFn,
	valueToAdd: string
): ContactInputItem {
	const id = valueToAdd;
	const parsedEmail = tryToParseEmail(valueToAdd);
	const isAValidEmail = isValidEmail(parsedEmail);
	const chip: ContactInputItem = {
		id,
		label: parsedEmail,
		value: {
			id,
			email: parsedEmail,
			type: CONTACT_TYPES.CONTACT
		},
		error: !isAValidEmail,
		actions: [
			{
				id: EDIT_ACTION_ID,
				label: isAValidEmail
					? t('label.edit_email', 'Edit E-mail')
					: t('label.edit_invalid_email', 'E-mail is invalid, click to edit it'),
				icon: 'EditOutline',
				type: 'button',
				onClick: () => editChipFn(valueToAdd, id)
			}
		]
	};
	if (!isAValidEmail) {
		chip.avatarIcon = 'AlertCircleOutline';
	}
	return chip;
}
const ContactInputCore: FC<ContactInputProps> = ({
	onChange,
	defaultValue,
	placeholder,
	background = 'gray5',
	dragAndDropEnabled = false,
	orderedAccountIds = [],
	chipLabelFactory,
	inputRef: propsInputRef = null,
	...rest
}) => {
	const [defaults, setDefaults] = useState<Array<ContactInputItem>>([]);
	const [options, setOptions] = useState<Array<ContactInputOptions>>([]);
	const [idToRemove, setIdToRemove] = useState('');
	const [t] = useTranslation();
	const inputRef = useCombinedRefs(propsInputRef);
	// while a chip is dragged over this input: where it would be dropped (undefined target = last)
	const [dragOver, setDragOver] = useState<{ target: DropTarget | undefined } | undefined>(
		undefined
	);
	// id of the chip dragged out of this input, shown as a placeholder until the drag ends
	const [sourceDragId, setSourceDragId] = useState<string | undefined>(undefined);
	// true while the pointer is over another input: the chip is shown there, not here
	const [sourceHidden, setSourceHidden] = useState(false);
	// the drop position also in a ref: the drop must not depend on React having rendered the last dragover
	const dropTargetRef = useRef<DropTarget | undefined>(undefined);
	// the chips and onChange of the last render, for the input that removes a chip moved out of this one
	const defaultsRef = useRef<Array<ContactInputItem>>([]);
	const onChangeRef = useRef(onChange);
	useEffect(() => {
		defaultsRef.current = defaults;
	}, [defaults]);
	useEffect(() => {
		onChangeRef.current = onChange;
	}, [onChange]);

	const removeChip = useCallback((id: string | undefined) => {
		const newDefaults = filter(defaultsRef.current, (contact) => contact.id !== id);
		setDefaults(newDefaults);
		onChangeRef.current?.(newDefaults);
	}, []);

	const buildDragStartHandler = useCallback(
		(chip: ContactInputItem) => (ev: React.DragEvent) => {
			ev.dataTransfer.setData(CONTACT_DRAG_TYPE, JSON.stringify(chip));
			ev.dataTransfer.dropEffect = 'move';
			activeDrag = {
				chip,
				source: inputRef.current,
				removeFromSource: (): void => removeChip(chip.id)
			};
			// changing the dragged element during dragstart can cancel the drag in Chrome
			// (and only if the drag is still going on: it may have been cancelled in the meantime)
			setTimeout(() => {
				if (activeDrag?.chip.id === chip.id) {
					setSourceDragId(chip.id);
				}
			}, 0);
		},
		[inputRef, removeChip]
	);
	useEffect(() => {
		setDefaults(
			map(filter(defaultValue, (c) => c.id !== idToRemove) ?? [], (obj) => ({
				...obj,
				draggable: dragAndDropEnabled,
				onDragStart: dragAndDropEnabled ? buildDragStartHandler(obj) : noop
			}))
		);
	}, [buildDragStartHandler, defaultValue, dragAndDropEnabled, idToRemove]);

	const buildDraggableChip = useCallback(
		(chip: ContactInputItem): ContactInputItem => ({
			...chip,
			draggable: true,
			onDragStart: buildDragStartHandler(chip)
		}),
		[buildDragStartHandler]
	);

	const editChip = useCallback<EditChipFn>(
		(text: string, id: string) => {
			setIdToRemove(id);
			if (inputRef?.current) {
				inputRef.current.value = text;
				inputRef.current.style.width = inputRef.current.value
					? `${inputRef.current.scrollWidth}px`
					: '';
			}
		},
		[inputRef]
	);

	const handleChipOnChange = useCallback(
		(items: ChipItem<UserOrDL>[]) => {
			const contactsWithoutGroups = reduce(
				items,
				(acc, item) => {
					const { value: itemValue, label } = item;
					if (label && itemValue) {
						acc.push({ ...item, label, value: itemValue });
					}
					return acc;
				},
				[] as ContactInputItem[]
			).filter((x) => x.id !== CHIP_TO_EXCLUDE);

			if (contactsWithoutGroups === defaultValue) {
				return;
			}
			const uniqueContacts = uniqBy(contactsWithoutGroups, 'value.email');
			onChange?.(uniqueContacts);
		},
		[onChange, defaultValue]
	);

	const onInputEnter = useCallback((): void => {
		if (inputRef?.current) {
			// FIXME: innerText does not contain new line chars at this point
			inputRef.current.innerText = inputRef.current.innerText?.replaceAll('\n', '');
		}
		const valueToAdd = inputRef.current?.innerText.replaceAll('\n', '');
		const chip = createChipFromEmail(t, editChip, valueToAdd ?? '');
		if (valueToAdd !== '') {
			handleChipOnChange([...defaults, { ...chip }]);
		}
		if (inputRef?.current) {
			inputRef.current.innerText = '';
		}
	}, [inputRef, t, editChip, handleChipOnChange, defaults]);

	const onInputType = useCallback<NonNullable<ChipInputProps['onInputType']>>(
		({ key, textContent }) => {
			if (key === 'Enter') {
				onInputEnter();
				return;
			}
			if (textContent && textContent !== '') {
				setOptions([
					{
						id: 'loading',
						label: 'loading',
						customComponent: <Loader />
					}
				]);
				searchContacts(textContent, orderedAccountIds)
					.then((contactinputItems) => {
						setOptions(contactinputItems);
					})
					.catch(() => {
						setOptions([]);
					});
			} else {
				setOptions([]);
			}
		},
		[onInputEnter, orderedAccountIds]
	);

	const getGroupMembers = useCallback(
		(contactGroup: GroupContact): Promise<UserContact[]> =>
			legacySoapFetch<GetContactsRequest, GetContactsResponse>('GetContacts', {
				_jsns: 'urn:zimbraMail',
				cn: {
					id: contactGroup.groupId
				},
				derefGroupMember: true
			}).then((result) => {
				const members = result?.cn?.[0].m;
				return map(members, (member) => {
					const email = member.cn?.[0]._attrs.email ?? member.value;
					return {
						email,
						id: email,
						type: CONTACT_TYPES.CONTACT
					};
				});
			}),
		[]
	);

	// during a drag over this input the chips are shown as if the drop had already happened
	const contactInputValue = useMemo(() => {
		const chips = uniqBy(defaults, 'id');
		return dragOver && activeDrag ? insertChipAt(chips, activeDrag.chip, dragOver.target) : chips;
	}, [defaults, dragOver]);
	const draggedChipState = useMemo(() => {
		if (dragOver && activeDrag?.chip.id) {
			return { id: activeDrag.chip.id, hidden: false };
		}
		return sourceDragId ? { id: sourceDragId, hidden: sourceHidden } : undefined;
	}, [dragOver, sourceDragId, sourceHidden]);
	const getChipsRoot = useCallback(
		() => inputRef.current?.closest(CONTACT_INPUT_ROOT_SELECTOR),
		[inputRef]
	);
	useChipsFlip(
		getChipsRoot,
		`${map(contactInputValue, 'id').join(',')}|${draggedChipState?.hidden ? draggedChipState.id : ''}`
	);

	const onAdd = useCallback(
		(valueToAdd: unknown): ContactInputItem => {
			setIdToRemove('');
			if (typeof valueToAdd === 'string') {
				return createChipFromEmail(t, editChip, valueToAdd);
			}
			const selectedOption = valueToAdd as ContactInputItemInternalValue;
			if (!selectedOption) {
				throw new Error('no value in provided contact');
			}

			if (selectedOption.type === CONTACT_TYPES.GROUP) {
				getGroupMembers(selectedOption)
					.then((userContacts) => userContacts.map((userContact) => onAdd(userContact)))
					.then((chipItems) => {
						handleChipOnChange([...defaults, ...chipItems]);
					});
				return {
					id: CHIP_TO_EXCLUDE,
					label: '',
					value: {
						email: '',
						id: '',
						type: CONTACT_TYPES.CONTACT
					}
				};
			}

			const isEmailValid = isValidEmail(selectedOption.email);
			const editAction: ChipAction = {
				id: EDIT_ACTION_ID,
				label: isEmailValid
					? t('label.edit_email', 'Edit E-mail')
					: t('label.edit_invalid_email', 'E-mail is invalid, click to edit it'),
				icon: 'EditOutline',
				type: 'button',
				onClick: (): void => editChip(selectedOption.email, selectedOption.id)
			};

			return {
				id: selectedOption.id,
				label: chipLabelFactory
					? chipLabelFactory(selectedOption, getContactLabel(selectedOption))
					: getContactLabel(selectedOption),
				value: selectedOption,
				error: !isEmailValid,
				actions: [editAction]
			};
		},
		[defaults, editChip, getGroupMembers, handleChipOnChange, chipLabelFactory, t]
	);

	const onExpandDistributionList = useCallback(
		(expandedDl: DistributionListContact, members: Array<string>) => {
			const chipsWithoutDl = defaultValue.filter((val) => val.value.email !== expandedDl.email);
			const membersChips = members.map((member) => onAdd(member));
			const updatedChips = [...chipsWithoutDl, ...membersChips];
			handleChipOnChange(updatedChips);
		},
		[defaultValue, onAdd, handleChipOnChange]
	);

	const ChipComponent = useCallback(
		(props: ChipItem<UserOrDL>): React.JSX.Element => {
			const val = props.value;
			const chip = (
				<>
					{val && val.type === CONTACT_TYPES.CONTACT && (
						<Chip {...props} data-testid={'default-chip'} />
					)}
					{val && props.label && val.type === CONTACT_TYPES.DISTRIBUTION_LIST && (
						<DistributionListChip
							{...props}
							value={val}
							label={props.label}
							onExpandDL={onExpandDistributionList}
						/>
					)}
				</>
			);
			return dragAndDropEnabled && props.id ? (
				<ChipDropZone id={props.id}>{chip}</ChipDropZone>
			) : (
				chip
			);
		},
		[dragAndDropEnabled, onExpandDistributionList]
	);

	const onDragEnter = useCallback<React.DragEventHandler>(
		(ev) => {
			ev.preventDefault();
			// eslint-disable-next-line no-param-reassign
			ev.dataTransfer.dropEffect = 'move';
			// a drag of something else (a file, some text) never shows a chip, even if a stale activeDrag is left
			if (!activeDrag || !Array.from(ev.dataTransfer.types).includes(CONTACT_DRAG_TYPE)) {
				return;
			}
			const draggedId = activeDrag.chip.id;
			// a chip from another input that this one already has is not added on drop: no preview either
			const fromThisInput = activeDrag.source === inputRef.current;
			if (!fromThisInput && find(defaults, { id: draggedId })) {
				dropTargetRef.current = undefined;
				setDragOver(undefined);
				return;
			}
			// the dragged chip is left out: it is shown at the target, and measuring it would make the target flicker
			const boxes = getChipBoxes(ev.currentTarget).filter((box) => box.id !== draggedId);
			const target = findDropTarget(boxes, ev.clientX, ev.clientY);
			dropTargetRef.current = target;
			setDragOver((prev) =>
				prev && prev.target?.id === target?.id && prev.target?.side === target?.side
					? prev
					: { target }
			);
		},
		[defaults, inputRef]
	);

	// leaving the input cancels the preview: the chips go back to their order
	const onDragLeave = useCallback<React.DragEventHandler>((ev) => {
		const { left, right, top, bottom } = ev.currentTarget.getBoundingClientRect();
		const { clientX: x, clientY: y } = ev;
		if (x <= left || x >= right || y <= top || y >= bottom) {
			setDragOver(undefined);
		}
	}, []);

	// a drag that ends anywhere (drop elsewhere, ESC) clears the preview of this input;
	// while it goes on, the dragover events of the page tell which input the pointer is over, so that the chip is
	// shown only there (dragleave alone is not reliable when the pointer moves fast from one input to another)
	const isDragging = !!dragOver || !!sourceDragId;
	useEffect(() => {
		if (!isDragging) {
			return undefined;
		}
		// the page listeners run after the React handlers of the drop target, which have used the drag state
		const clear = (): void => {
			activeDrag = undefined;
			dropTargetRef.current = undefined;
			setDragOver(undefined);
			setSourceDragId(undefined);
			setSourceHidden(false);
		};
		const onPageDragOver = (ev: DragEvent): void => {
			const ownRoot = inputRef.current?.closest(CONTACT_INPUT_ROOT_SELECTOR);
			const rootUnderPointer =
				ev.target instanceof Element ? ev.target.closest(CONTACT_INPUT_ROOT_SELECTOR) : null;
			if (rootUnderPointer !== ownRoot) {
				dropTargetRef.current = undefined;
				setDragOver(undefined);
			}
			setSourceHidden(rootUnderPointer !== null && rootUnderPointer !== ownRoot);
		};
		globalThis.addEventListener('dragend', clear);
		globalThis.addEventListener('drop', clear);
		globalThis.addEventListener('dragover', onPageDragOver);
		// no mouse event is sent during a drag: a mousedown means that it ended without a dragend reaching the page
		// (ESC after a preview remounted the dragged chip)
		globalThis.addEventListener('mousedown', clear);
		return (): void => {
			globalThis.removeEventListener('dragend', clear);
			globalThis.removeEventListener('drop', clear);
			globalThis.removeEventListener('dragover', onPageDragOver);
			globalThis.removeEventListener('mousedown', clear);
		};
	}, [inputRef, isDragging]);

	// the move itself is done on drop, by the input that gets the chip: here the drag state is only reset
	const onDragEnd = useCallback<React.DragEventHandler>((ev) => {
		ev.preventDefault();
		setDragOver(undefined);
		setSourceDragId(undefined);
		setSourceHidden(false);
		activeDrag = undefined;
	}, []);

	const onDrop = useCallback<React.DragEventHandler>(
		(ev) => {
			ev.preventDefault();
			const target = dropTargetRef.current;
			dropTargetRef.current = undefined;
			setDragOver(undefined);
			setSourceDragId(undefined);
			setSourceHidden(false);
			const drag = activeDrag;
			// the dragend of this drag may be lost (the chips remount), so the drag is over here
			activeDrag = undefined;
			// a drag started in another page: its data is not trusted, so it is never turned into a chip
			if (!drag) {
				return;
			}
			if (drag.source === inputRef.current) {
				// dropped on the same input: move the chip to the position of the drop
				const movedChip = find(defaults, { id: drag.chip.id });
				if (movedChip) {
					const reordered = insertChipAt(defaults, movedChip, target);
					const orderChanged = reordered.some((chip, index) => chip.id !== defaults[index]?.id);
					if (orderChanged) {
						setDefaults(reordered);
						onChange?.(reordered);
					}
				}
				return;
			}
			// dropped from another input of this page: the chip moves here, at the position of the drop.
			// The chip comes from this page, never from the drag data (another page can set the same type): the data
			// only has to name the same chip, so that a drop from elsewhere after a drag left over is ignored.
			const chipId = getDraggedChipId(ev.dataTransfer);
			if (chipId && chipId === drag.chip.id) {
				const newChip = buildDraggableChip(withEditActionOf(drag.chip, chipId, editChip));
				if (!find(defaults, { id: newChip.id })) {
					const newDefaults = insertChipAt(defaults, newChip, target);
					setDefaults(newDefaults);
					onChange?.(newDefaults);
				}
				drag.removeFromSource();
			}
		},
		[buildDraggableChip, defaults, editChip, inputRef, onChange]
	);

	return (
		<DraggedChipContext.Provider value={draggedChipState}>
			<Container
				width="100%"
				onDrop={dragAndDropEnabled ? onDrop : noop}
				onDragLeave={dragAndDropEnabled ? onDragLeave : noop}
				height="100%"
				data-contact-input-root={dragAndDropEnabled || undefined}
			>
				<PasteContextMenu elementReceivingPaste={inputRef.current}>
					<ChipInput<UserOrDL>
						data-testid={'contact-input'}
						disableOptions
						placeholder={placeholder}
						confirmChipOnBlur
						inputRef={inputRef}
						onInputType={onInputType}
						onChange={handleChipOnChange}
						options={options}
						value={contactInputValue}
						background={background}
						onAdd={onAdd}
						requireUniqueChips
						createChipOnPaste
						pasteSeparators={[',', ';', '\n']}
						separators={[
							{ code: 'Enter', ctrlKey: false },
							{ code: 'NumpadEnter', ctrlKey: false },
							{ key: ',', ctrlKey: false },
							{ key: ';', ctrlKey: false }
						]}
						onInputTypeDebounce={CHIPINPUT_DEBOUNCE_TIME}
						ChipComponent={ChipComponent}
						onDragEnter={dragAndDropEnabled ? onDragEnter : noop}
						onDragOver={dragAndDropEnabled ? onDragEnter : noop}
						onDragEnd={dragAndDropEnabled ? onDragEnd : noop}
						{...rest}
					/>
				</PasteContextMenu>
			</Container>
		</DraggedChipContext.Provider>
	);
};

export const ContactInput = (props: ContactInputProps): ReactElement => (
	<ContactInputCore {...props} />
);
