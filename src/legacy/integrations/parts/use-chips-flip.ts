/*
 * SPDX-FileCopyrightText: 2026 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { useLayoutEffect, useRef } from 'react';

const FLIP_DURATION_MS = 180;
const FLIP_EASING = 'cubic-bezier(0.2, 0, 0, 1)';
export const CHIP_FLIP_SELECTOR = '[data-chip-flip]';

type Positions = Map<string, { left: number; top: number }>;

const getFlipElements = (root: Element | null | undefined): Array<HTMLElement> =>
	root ? Array.from(root.querySelectorAll<HTMLElement>(CHIP_FLIP_SELECTOR)) : [];

const isVisible = (rect: DOMRect): boolean => rect.width > 0 || rect.height > 0;

/** Where each chip is shown now, animations in progress included */
const readPositions = (root: Element | null | undefined): Positions => {
	const positions: Positions = new Map();
	getFlipElements(root).forEach((el) => {
		const rect = el.getBoundingClientRect();
		if (el.dataset.chipFlip && isVisible(rect)) {
			positions.set(el.dataset.chipFlip, { left: rect.left, top: rect.top });
		}
	});
	return positions;
};

const prefersReducedMotion = (): boolean =>
	typeof globalThis.matchMedia === 'function' &&
	globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Cancels the animation in progress of a chip and starts the one from its previous position to the current one */
const animateChip = (el: HTMLElement, previous: Positions): void => {
	if (typeof el.animate !== 'function' || !el.dataset.chipFlip) {
		return;
	}
	el.getAnimations().forEach((animation) => animation.cancel());
	const rect = el.getBoundingClientRect();
	if (!isVisible(rect)) {
		return;
	}
	const from = previous.get(el.dataset.chipFlip);
	const options = { duration: FLIP_DURATION_MS, easing: FLIP_EASING };
	if (!from) {
		el.animate(
			[
				{ opacity: 0, transform: 'scale(0.9)' },
				{ opacity: 1, transform: 'none' }
			],
			options
		);
		return;
	}
	const dx = from.left - rect.left;
	const dy = from.top - rect.top;
	if (Math.abs(dx) >= 1 || Math.abs(dy) >= 1) {
		el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], options);
	}
};

const shownOrder = (root: Element | null | undefined): string =>
	getFlipElements(root)
		.map((el) => el.dataset.chipFlip)
		.join(',');

// the longest a chip input takes to show a new order: past it, the order is not coming
const ORDER_WAIT_MS = 500;

/**
 * Slides the chips of an input from where they were to where they are after a change of their order (FLIP), and fades
 * in a chip that appears. The positions are read during the render that changes the order, while the DOM still shows
 * the previous one. The chip input shows the new order in an effect of its own, after this one: the animation starts
 * when the DOM shows it (a mutation observer runs before the browser paints). The elements that move are the inner
 * wrappers, so the boxes used to find the drop target never move with the animation.
 */
export const useChipsFlip = (
	getRoot: () => Element | null | undefined,
	ids: Array<string | undefined>,
	hiddenId: string | undefined
): void => {
	const order = ids.join(',');
	const orderKey = `${order}|${hiddenId ?? ''}`;
	const previousKey = useRef(orderKey);
	const before = useRef<Positions>(new Map());
	if (previousKey.current !== orderKey) {
		previousKey.current = orderKey;
		before.current = readPositions(getRoot());
	}

	useLayoutEffect(() => {
		const previous = before.current;
		before.current = new Map();
		const root = getRoot();
		if (!root || previous.size === 0 || prefersReducedMotion()) {
			return undefined;
		}
		const animate = (): void => getFlipElements(root).forEach((el) => animateChip(el, previous));
		if (shownOrder(root) === order || typeof MutationObserver === 'undefined') {
			animate();
			return undefined;
		}
		const observer = new MutationObserver(() => {
			if (shownOrder(root) === order) {
				observer.disconnect();
				animate();
			}
		});
		observer.observe(root, {
			subtree: true,
			childList: true,
			attributes: true,
			attributeFilter: ['data-chip-flip']
		});
		const timeout = setTimeout(() => observer.disconnect(), ORDER_WAIT_MS);
		return (): void => {
			clearTimeout(timeout);
			observer.disconnect();
		};
	}, [getRoot, order, orderKey]);
};
