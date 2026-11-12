/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { setupTest } from '@test-setup';
import { useChipsFlip } from 'legacy/integrations/parts/use-chips-flip';

const CHIP_WIDTH = 100;

/**
 * Chips laid out on one row, 100px each, in the order of the DOM. A hidden chip (data-hidden) has an empty box and
 * takes no place: the chips after it move left, as in the browser
 */
function boxOf(this: HTMLElement): DOMRect {
	const siblings = Array.from(this.parentElement?.children ?? []) as Array<HTMLElement>;
	const hidden = this.dataset.hidden === 'true';
	const index = siblings
		.slice(0, siblings.indexOf(this))
		.filter((sibling) => sibling.dataset.hidden !== 'true').length;
	const left = index * CHIP_WIDTH;
	const width = hidden ? 0 : CHIP_WIDTH - 10;
	const height = hidden ? 0 : 20;
	return {
		left,
		top: 0,
		right: left + width,
		bottom: height,
		width,
		height,
		x: left,
		y: 0,
		toJSON: () => ({})
	};
}

type ChipsProps = {
	ids: Array<string>;
	// the new order reaches the DOM in an effect, after the hook's own, as in the chip input of the design system
	late?: boolean;
	// the order never reaches the DOM
	stuck?: boolean;
	hiddenId?: string;
	enabled?: boolean;
};

/** The chips of a chip input, keyed by position as the chip input of the design system does */
const Chips = ({
	ids,
	late = false,
	stuck = false,
	hiddenId,
	enabled = true
}: ChipsProps): React.JSX.Element => {
	const rootRef = useRef<HTMLDivElement>(null);
	const [shown, setShown] = useState(ids);
	useEffect(() => {
		if (!stuck) {
			setShown(ids);
		}
	}, [ids, stuck]);
	const getRoot = useCallback(() => rootRef.current, []);
	useChipsFlip(getRoot, ids, hiddenId, enabled);
	return (
		<div ref={rootRef}>
			{(late || stuck ? shown : ids).map((id, index) => (
				// eslint-disable-next-line react/no-array-index-key
				<span key={index} data-chip-flip={id} data-hidden={id === hiddenId}>
					{id}
				</span>
			))}
		</div>
	);
};

describe('useChipsFlip', () => {
	const animate = vi.fn();

	beforeEach(() => {
		vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(boxOf);
		vi.spyOn(globalThis, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList);
		Object.defineProperty(HTMLElement.prototype, 'animate', { value: animate, configurable: true });
		Object.defineProperty(HTMLElement.prototype, 'getAnimations', {
			value: () => [],
			configurable: true
		});
	});

	afterEach(() => {
		// jsdom has no animations: remove the stubs so that the other tests see the same
		delete (HTMLElement.prototype as Partial<HTMLElement>).animate;
		delete (HTMLElement.prototype as Partial<HTMLElement>).getAnimations;
	});

	const animationOf = (id: string): Array<Keyframe> | undefined =>
		animate.mock.calls.find((_, index) => {
			const element = animate.mock.contexts[index] as HTMLElement;
			return element.dataset.chipFlip === id;
		})?.[0];

	const slide = (dx: number): Array<Keyframe> => [
		{ transform: `translate(${dx}px, 0px)` },
		{ transform: 'none' }
	];

	it('slides the chips that change place from where they were', () => {
		const { rerender } = setupTest(<Chips ids={['a', 'b', 'c']} />);

		rerender(<Chips ids={['b', 'a', 'c']} />);

		expect(animationOf('a')).toEqual(slide(-100));
		expect(animationOf('b')).toEqual(slide(100));
		expect(animationOf('c')).toBeUndefined();
	});

	it('waits for the new order to reach the DOM when the chip input shows it later', async () => {
		const { rerender } = setupTest(<Chips ids={['a', 'b']} late />);

		rerender(<Chips ids={['b', 'a']} late />);

		await vi.waitFor(() => expect(animationOf('a')).toEqual(slide(-100)));
		expect(animationOf('b')).toEqual(slide(100));
	});

	it('gives up when the new order does not reach the DOM', () => {
		vi.useFakeTimers();
		const { rerender } = setupTest(<Chips ids={['a', 'b']} stuck />);

		rerender(<Chips ids={['b', 'a']} stuck />);
		vi.advanceTimersByTime(600);

		expect(animate).not.toHaveBeenCalled();
		vi.useRealTimers();
	});

	it('fades in a chip that appears', () => {
		const { rerender } = setupTest(<Chips ids={['a']} />);

		rerender(<Chips ids={['a', 'b']} />);

		expect(animationOf('b')).toEqual([
			{ opacity: 0, transform: 'scale(0.9)' },
			{ opacity: 1, transform: 'none' }
		]);
		expect(animationOf('a')).toBeUndefined();
	});

	it('slides the chips after one that gets hidden into its place', () => {
		const { rerender } = setupTest(<Chips ids={['a', 'b']} />);

		rerender(<Chips ids={['a', 'b']} hiddenId={'a'} />);

		expect(animationOf('b')).toEqual(slide(100));
		expect(animationOf('a')).toBeUndefined();
	});

	it('does not animate the changes made while it is not enabled', () => {
		const { rerender } = setupTest(<Chips ids={['a', 'b']} enabled={false} />);

		rerender(<Chips ids={['b', 'a']} enabled={false} />);

		expect(animate).not.toHaveBeenCalled();
	});

	it('does not animate when the user prefers reduced motion', () => {
		vi.spyOn(globalThis, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList);
		const { rerender } = setupTest(<Chips ids={['a', 'b']} />);

		rerender(<Chips ids={['b', 'a']} />);

		expect(animate).not.toHaveBeenCalled();
	});
});
