/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactElement, useState } from 'react';

import { createEvent, fireEvent, waitFor, within } from '@testing-library/react';
import { ContactInputItem, EDIT_ACTION_ID } from '@zextras/carbonio-ui-commons';

import { screen, setupTest } from '@test-setup';
import { ContactInput } from 'legacy/integrations/contact-input';
import { createSimpleChip } from 'legacy/integrations/tests/mocks';

const chipA = createSimpleChip({ id: 'a', label: 'Alice', email: 'a@test.io' });
const chipB = createSimpleChip({ id: 'b', label: 'Bob', email: 'b@test.io' });
const chipC = createSimpleChip({ id: 'c', label: 'Carol', email: 'c@test.io' });
const chipD = createSimpleChip({ id: 'd', label: 'Dave', email: 'd@test.io' });

const CHIP_WIDTH = 100;
const CHIP_DROP_ZONE_TEST_ID = 'chip-drop-zone';

/** A DataTransfer shared by the events of one drag, as the browser does */
const createDataTransfer = (): Pick<
	DataTransfer,
	'setData' | 'getData' | 'dropEffect' | 'types'
> => {
	const data: Record<string, string> = {};
	return {
		dropEffect: 'move',
		setData: (format: string, value: string): void => {
			data[format] = value;
		},
		getData: (format: string): string => data[format] ?? '',
		get types(): ReadonlyArray<string> {
			return Object.keys(data);
		}
	};
};

const SPOOFED_ID = 'ceo@test.io';

/** Drag data set by another page: a chip whose label hides the real address, with props for the chip element */
const createSpoofedDataTransfer = (id: string): ReturnType<typeof createDataTransfer> => {
	const dataTransfer = createDataTransfer();
	dataTransfer.setData(
		'contact',
		JSON.stringify({
			id,
			label: SPOOFED_ID,
			value: { id, email: 'attacker@test.io', type: 'contact' },
			style: { outline: '3px solid red' }
		})
	);
	return dataTransfer;
};

const getElementWithLabel = (testId: string, label: string): HTMLElement => {
	const element = screen
		.getAllByTestId(testId)
		.find((candidate) => within(candidate).queryByText(label) !== null);
	if (!element) {
		throw new Error(`${testId} of ${label} not found`);
	}
	return element;
};

const getChipElement = (label: string): HTMLElement => getElementWithLabel('default-chip', label);

const CHIP_GAP = 20;
const INPUT_IDS = ['to', 'cc'];

/** jsdom has no layout: put the chips of each input on one row, in the order they are rendered */
const layoutChips = (): void => {
	INPUT_IDS.forEach((inputId) => {
		const input = screen.queryByTestId(inputId);
		if (!input) return;
		within(input)
			.queryAllByTestId(CHIP_DROP_ZONE_TEST_ID)
			.forEach((zone, index) => {
				const left = index * (CHIP_WIDTH + CHIP_GAP);
				vi.spyOn(zone, 'getBoundingClientRect').mockReturnValue({
					left,
					right: left + CHIP_WIDTH,
					width: CHIP_WIDTH,
					top: 0,
					bottom: 20,
					height: 20
				} as DOMRect);
			});
	});
};

const getDropZone = (label: string): HTMLElement =>
	getElementWithLabel(CHIP_DROP_ZONE_TEST_ID, label);

/** jsdom has no DragEvent, so the coordinates passed to fireEvent are dropped */
const fireDragEventAt = (
	type: 'dragOver' | 'dragLeave',
	element: HTMLElement,
	dataTransfer: unknown,
	clientX: number
): void => {
	const event = createEvent[type](element, { dataTransfer });
	Object.defineProperty(event, 'clientX', { value: clientX });
	Object.defineProperty(event, 'clientY', { value: 10 });
	fireEvent(element, event);
};

/** Starts a drag of a chip and moves it over another one (before or after it) */
const startDrag = ({
	from,
	over,
	side
}: {
	from: string;
	over?: string;
	side?: 'before' | 'after';
}): { dataTransfer: ReturnType<typeof createDataTransfer>; source: HTMLElement } => {
	const dataTransfer = createDataTransfer();
	const source = getChipElement(from);
	fireEvent.dragStart(source, { dataTransfer });
	if (over) {
		layoutChips();
		const zone = getDropZone(over);
		const { left } = zone.getBoundingClientRect();
		fireDragEventAt(
			'dragOver',
			zone,
			dataTransfer,
			side === 'before' ? left + 10 : left + CHIP_WIDTH - 10
		);
	}
	return { dataTransfer, source };
};

const dragChip = ({
	from,
	over,
	side,
	dropOn
}: {
	from: string;
	over?: string;
	side?: 'before' | 'after';
	dropOn: () => HTMLElement;
}): void => {
	const { dataTransfer, source } = startDrag({ from, over, side });
	fireEvent.drop(dropOn(), { dataTransfer });
	fireEvent.dragEnd(source, { dataTransfer });
};

const shownLabels = (inputId: string): Array<string | undefined> =>
	// the text of a chip starts with the two initials of its avatar
	within(screen.getByTestId(inputId))
		.getAllByTestId('default-chip')
		.map((chip) => chip.textContent?.slice(2));

const ControlledInput = ({
	initial,
	onChange,
	testId
}: Readonly<{
	initial: Array<ContactInputItem>;
	onChange: (items: Array<ContactInputItem>) => void;
	testId: string;
}>): ReactElement => {
	const [value, setValue] = useState(initial);
	return (
		<div data-testid={testId}>
			<ContactInput
				defaultValue={value}
				orderedAccountIds={[]}
				dragAndDropEnabled
				onChange={(items): void => {
					setValue(items);
					onChange(items);
				}}
			/>
		</div>
	);
};

const ids = (items: Array<{ id?: string }>): Array<string | undefined> => items.map((i) => i.id);

describe('Contact input reorder by drag and drop', () => {
	it('moves a chip before another chip of the same input', () => {
		const onChange = vi.fn();
		setupTest(<ControlledInput initial={[chipA, chipB, chipC]} onChange={onChange} testId="to" />);

		dragChip({ from: 'Carol', over: 'Alice', side: 'before', dropOn: () => getDropZone('Alice') });

		expect(ids(onChange.mock.lastCall?.[0] ?? [])).toEqual(['c', 'a', 'b']);
		expect(shownLabels('to')).toEqual(['Carol', 'Alice', 'Bob']);
	});

	it('moves a chip after another chip of the same input', () => {
		const onChange = vi.fn();
		setupTest(<ControlledInput initial={[chipA, chipB, chipC]} onChange={onChange} testId="to" />);

		dragChip({ from: 'Alice', over: 'Bob', side: 'after', dropOn: () => getDropZone('Bob') });

		expect(ids(onChange.mock.lastCall?.[0] ?? [])).toEqual(['b', 'a', 'c']);
	});

	it('does not change anything when the chip is dropped where it already is', () => {
		const onChange = vi.fn();
		setupTest(<ControlledInput initial={[chipA, chipB]} onChange={onChange} testId="to" />);

		dragChip({ from: 'Alice', over: 'Bob', side: 'before', dropOn: () => getDropZone('Bob') });

		expect(onChange).not.toHaveBeenCalled();
		expect(shownLabels('to')).toEqual(['Alice', 'Bob']);
	});

	it('shows the chips in the new order while the chip is dragged, before the drop', () => {
		setupTest(<ControlledInput initial={[chipA, chipB, chipC]} onChange={vi.fn()} testId="to" />);

		startDrag({ from: 'Carol', over: 'Alice', side: 'before' });

		expect(shownLabels('to')).toEqual(['Carol', 'Alice', 'Bob']);
	});

	it('shows the chip in the other input while it is dragged over it', () => {
		setupTest(
			<>
				<ControlledInput initial={[chipA, chipB]} onChange={vi.fn()} testId="to" />
				<ControlledInput initial={[chipC]} onChange={vi.fn()} testId="cc" />
			</>
		);

		startDrag({ from: 'Alice', over: 'Carol', side: 'before' });

		expect(shownLabels('cc')).toEqual(['Alice', 'Carol']);
		expect(shownLabels('to')).toEqual(['Alice', 'Bob']);
	});

	it('shows the dragged chip only in the input under the pointer', async () => {
		setupTest(
			<>
				<ControlledInput initial={[chipA, chipB]} onChange={vi.fn()} testId="to" />
				<ControlledInput initial={[chipC]} onChange={vi.fn()} testId="cc" />
			</>
		);

		const { dataTransfer } = startDrag({ from: 'Alice', over: 'Bob', side: 'after' });
		expect(shownLabels('to')).toEqual(['Bob', 'Alice']);
		// the source shows its placeholder after the dragstart
		await waitFor(() =>
			expect(
				within(screen.getByTestId('to')).getAllByTestId(CHIP_DROP_ZONE_TEST_ID)[1]
			).toHaveStyle({
				opacity: '0.4'
			})
		);

		layoutChips();
		const carol = getDropZone('Carol');
		fireDragEventAt('dragOver', carol, dataTransfer, carol.getBoundingClientRect().left + 10);

		// over Cc: the chip is there, and hidden in To (not removed: its element gets the dragend)
		expect(shownLabels('cc')).toEqual(['Alice', 'Carol']);
		const toZones = within(screen.getByTestId('to')).getAllByTestId(CHIP_DROP_ZONE_TEST_ID);
		expect(toZones.map((zone) => zone.textContent?.slice(2))).toEqual(['Alice', 'Bob']);
		expect(toZones[0]).not.toBeVisible();
		expect(toZones[1]).toBeVisible();

		layoutChips();
		const bob = within(screen.getByTestId('to')).getAllByTestId(CHIP_DROP_ZONE_TEST_ID)[1];
		fireDragEventAt('dragOver', bob, dataTransfer, bob.getBoundingClientRect().left + 10);

		// back over To: Cc goes back to its chips
		expect(shownLabels('cc')).toEqual(['Carol']);
		expect(shownLabels('to')).toEqual(['Alice', 'Bob']);
	});

	it('does not preview nor add a chip that the other input already has, and removes it from the source', () => {
		const onToChange = vi.fn();
		const onCcChange = vi.fn();
		setupTest(
			<>
				<ControlledInput initial={[chipA, chipB]} onChange={onToChange} testId="to" />
				<ControlledInput initial={[{ ...chipA }, chipC]} onChange={onCcChange} testId="cc" />
			</>
		);

		const { dataTransfer } = startDrag({ from: 'Alice', over: 'Carol', side: 'after' });

		expect(shownLabels('cc')).toEqual(['Alice', 'Carol']);
		fireEvent.drop(getDropZone('Carol'), { dataTransfer });
		expect(onCcChange).not.toHaveBeenCalled();
		expect(ids(onToChange.mock.lastCall?.[0] ?? [])).toEqual(['b']);
	});

	it('shows no chip when a file is dragged after a chip drag that ended without any event', () => {
		setupTest(<ControlledInput initial={[chipA, chipB]} onChange={vi.fn()} testId="to" />);

		// a drag of Alice whose drop and dragend never reach the page
		startDrag({ from: 'Alice' });

		const fileDrag = { dropEffect: 'copy', types: ['Files'], getData: (): string => '' };
		layoutChips();
		const bob = getDropZone('Bob');
		// a chip preview would show [Bob, Alice]
		fireDragEventAt('dragOver', bob, fileDrag, bob.getBoundingClientRect().left + CHIP_WIDTH - 10);

		expect(shownLabels('to')).toEqual(['Alice', 'Bob']);
	});

	it('ignores a chip dropped from another page', () => {
		const onCcChange = vi.fn();
		setupTest(<ControlledInput initial={[chipC]} onChange={onCcChange} testId="cc" />);
		// no drag of this page is going on (another test may have left one)
		fireEvent.drop(getDropZone('Carol'), { dataTransfer: createDataTransfer() });

		// another page can set the same drag type, with a label that hides the real address
		fireEvent.drop(getDropZone('Carol'), { dataTransfer: createSpoofedDataTransfer(SPOOFED_ID) });

		expect(onCcChange).not.toHaveBeenCalled();
		expect(shownLabels('cc')).toEqual(['Carol']);
	});

	it('takes the chip of this page, not the drag data, when another page drops a chip with its id after a drag left over', () => {
		const onCcChange = vi.fn();
		setupTest(
			<>
				<ControlledInput initial={[chipA, chipB]} onChange={vi.fn()} testId="to" />
				<ControlledInput initial={[chipC]} onChange={onCcChange} testId="cc" />
			</>
		);

		// a drag of Alice whose drop and dragend never reach the page
		startDrag({ from: 'Alice' });
		fireEvent.drop(getDropZone('Carol'), { dataTransfer: createSpoofedDataTransfer('a') });

		const dropped = onCcChange.mock.lastCall?.[0] ?? [];
		expect(ids(dropped)).toEqual(['c', 'a']);
		expect(dropped[1]).toEqual(
			expect.objectContaining({ label: 'Alice', value: chipA.value, draggable: true })
		);
		expect(dropped[1]).not.toHaveProperty('style');
		expect(shownLabels('cc')).toEqual(['Carol', 'Alice']);
	});

	it('moves a chip into an input whose dragend was lost in an earlier move', () => {
		const onToChange = vi.fn();
		const onCcChange = vi.fn();
		setupTest(
			<>
				<ControlledInput initial={[chipA, chipB]} onChange={onToChange} testId="to" />
				<ControlledInput initial={[chipC, chipD]} onChange={onCcChange} testId="cc" />
			</>
		);

		// Alice from To to Cc, with no dragend: To must not think that the next drag is still its own
		const first = startDrag({ from: 'Alice', over: 'Carol', side: 'before' });
		fireEvent.drop(getDropZone('Carol'), { dataTransfer: first.dataTransfer });
		dragChip({ from: 'Dave', over: 'Bob', side: 'after', dropOn: () => getDropZone('Bob') });

		expect(ids(onToChange.mock.lastCall?.[0] ?? [])).toEqual(['b', 'd']);
		expect(ids(onCcChange.mock.lastCall?.[0] ?? [])).toEqual(['a', 'c']);
	});

	it('binds the edit action of a moved chip to the input that gets it', async () => {
		const editAction = {
			id: EDIT_ACTION_ID,
			label: 'Edit E-mail',
			icon: 'EditOutline',
			type: 'button' as const,
			onClick: vi.fn()
		};
		const { user } = setupTest(
			<>
				<ControlledInput
					initial={[{ ...chipA, actions: [editAction] }, chipB]}
					onChange={vi.fn()}
					testId="to"
				/>
				<ControlledInput initial={[chipC]} onChange={vi.fn()} testId="cc" />
			</>
		);

		dragChip({ from: 'Alice', over: 'Carol', side: 'before', dropOn: () => getDropZone('Carol') });
		await user.click(within(screen.getByTestId('cc')).getByTestId('icon: EditOutline'));

		expect(editAction.onClick).not.toHaveBeenCalled();
		expect(within(screen.getByTestId('cc')).getByRole('textbox')).toHaveValue('a@test.io');
	});

	it('removes the chip from the source on drop, also when the dragend never reaches the source', () => {
		const onToChange = vi.fn();
		const onCcChange = vi.fn();
		setupTest(
			<>
				<ControlledInput initial={[chipA, chipB]} onChange={onToChange} testId="to" />
				<ControlledInput initial={[chipC]} onChange={onCcChange} testId="cc" />
			</>
		);

		// the dragend is lost when a preview remounts the dragged chip (e.g. a distribution list takes its place)
		const { dataTransfer } = startDrag({ from: 'Alice', over: 'Carol', side: 'before' });
		fireEvent.drop(getDropZone('Carol'), { dataTransfer });

		expect(ids(onCcChange.mock.lastCall?.[0] ?? [])).toEqual(['a', 'c']);
		expect(ids(onToChange.mock.lastCall?.[0] ?? [])).toEqual(['b']);
	});

	it('puts the chips back in their order at the next click when the drag ended without a dragend', async () => {
		const onChange = vi.fn();
		const { user } = setupTest(
			<ControlledInput initial={[chipA, chipB, chipC]} onChange={onChange} testId="to" />
		);

		startDrag({ from: 'Carol', over: 'Alice', side: 'before' });
		expect(shownLabels('to')).toEqual(['Carol', 'Alice', 'Bob']);

		await user.click(document.body);

		expect(shownLabels('to')).toEqual(['Alice', 'Bob', 'Carol']);
		expect(onChange).not.toHaveBeenCalled();
	});

	it('puts the chips back in their order when the chip is dragged out of the input', () => {
		const onChange = vi.fn();
		setupTest(<ControlledInput initial={[chipA, chipB, chipC]} onChange={onChange} testId="to" />);

		const { dataTransfer, source } = startDrag({ from: 'Carol', over: 'Alice', side: 'before' });
		fireDragEventAt('dragLeave', getDropZone('Alice'), dataTransfer, 5000);

		expect(shownLabels('to')).toEqual(['Alice', 'Bob', 'Carol']);

		dataTransfer.dropEffect = 'none';
		fireEvent.dragEnd(source, { dataTransfer });
		expect(onChange).not.toHaveBeenCalled();
		expect(shownLabels('to')).toEqual(['Alice', 'Bob', 'Carol']);
	});

	it('cancels the move when the drag ends outside of any input', () => {
		const onChange = vi.fn();
		setupTest(<ControlledInput initial={[chipA, chipB, chipC]} onChange={onChange} testId="to" />);

		const { dataTransfer, source } = startDrag({ from: 'Carol', over: 'Alice', side: 'before' });
		dataTransfer.dropEffect = 'none';
		fireEvent.dragEnd(source, { dataTransfer });

		expect(onChange).not.toHaveBeenCalled();
		expect(shownLabels('to')).toEqual(['Alice', 'Bob', 'Carol']);
	});

	it('inserts a chip dragged from another input at the drop position and removes it from the source', () => {
		const onToChange = vi.fn();
		const onCcChange = vi.fn();
		setupTest(
			<>
				<ControlledInput initial={[chipA, chipB]} onChange={onToChange} testId="to" />
				<ControlledInput initial={[chipC, chipD]} onChange={onCcChange} testId="cc" />
			</>
		);

		dragChip({ from: 'Dave', over: 'Bob', side: 'before', dropOn: () => getDropZone('Bob') });

		expect(ids(onToChange.mock.lastCall?.[0] ?? [])).toEqual(['a', 'd', 'b']);
		expect(ids(onCcChange.mock.lastCall?.[0] ?? [])).toEqual(['c']);
	});

	it('removes the chip from the source when it is moved to another input after a reorder', () => {
		const onToChange = vi.fn();
		const onCcChange = vi.fn();
		setupTest(
			<>
				<ControlledInput initial={[chipA, chipB, chipC]} onChange={onToChange} testId="to" />
				<ControlledInput initial={[chipD]} onChange={onCcChange} testId="cc" />
			</>
		);

		dragChip({ from: 'Carol', over: 'Alice', side: 'before', dropOn: () => getDropZone('Alice') });
		dragChip({ from: 'Carol', over: 'Dave', side: 'after', dropOn: () => getDropZone('Dave') });

		expect(ids(onCcChange.mock.lastCall?.[0] ?? [])).toEqual(['d', 'c']);
		expect(ids(onToChange.mock.lastCall?.[0] ?? [])).toEqual(['a', 'b']);
	});

	it('appends a chip dragged from another input when dropped on the empty part of the input', () => {
		const onToChange = vi.fn();
		setupTest(
			<>
				<ControlledInput initial={[chipA, chipB]} onChange={onToChange} testId="to" />
				<ControlledInput initial={[chipC]} onChange={vi.fn()} testId="cc" />
			</>
		);

		dragChip({ from: 'Carol', dropOn: () => screen.getAllByRole('textbox')[0] });

		expect(ids(onToChange.mock.lastCall?.[0] ?? [])).toEqual(['a', 'b', 'c']);
	});
});
