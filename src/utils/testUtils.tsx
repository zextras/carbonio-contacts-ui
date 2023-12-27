/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { type ReactElement, useMemo } from 'react';

import {
	ByRoleMatcher,
	ByRoleOptions,
	GetAllBy,
	queries,
	queryHelpers,
	render,
	RenderOptions,
	RenderResult,
	screen as rtlScreen,
	within as rtlWithin,
	type Screen
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalManager, SnackbarManager, ThemeProvider } from '@zextras/carbonio-design-system';
import { filter } from 'lodash';
import { act } from 'react-dom/test-utils';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';

import I18nTestFactory from '../carbonio-ui-commons/test/i18n/i18n-test-factory';
import { ICON_REGEXP } from '../v2/constants/tests';

export type UserEvent = ReturnType<(typeof userEvent)['setup']>;

interface WrapperProps {
	children?: React.ReactNode;
	initialRouterEntries?: string[];
}

/**
 * Matcher function to search a string in more html elements and not just in a single element.
 */
const queryAllByTextWithMarkup: GetAllBy<[string | RegExp]> = (container, text) =>
	rtlScreen.queryAllByText((_content, element) => {
		if (element && element instanceof HTMLElement) {
			const hasText = (singleNode: Element): boolean => {
				const regExp = RegExp(text);
				return singleNode.textContent != null && regExp.test(singleNode.textContent);
			};
			const childrenDontHaveText = Array.from(element.children).every((child) => !hasText(child));
			return hasText(element) && childrenDontHaveText;
		}
		return false;
	});

const getByTextWithMarkupMultipleError = (
	container: Element | null,
	text: string | RegExp
): string => `Found multiple elements with text: ${text}`;
const getByTextWithMarkupMissingError = (
	container: Element | null,
	text: string | RegExp
): string => `Unable to find an element with text: ${text}`;

type ByRoleWithIconOptions = ByRoleOptions & {
	icon: string | RegExp;
};
/**
 * Matcher function to search an icon button through the icon data-testid
 */
const queryAllByRoleWithIcon: GetAllBy<[ByRoleMatcher, ByRoleWithIconOptions]> = (
	container,
	role,
	{ icon, ...options }
) =>
	filter(
		rtlWithin(container).queryAllByRole(role, options),
		(element) => rtlWithin(element).queryByTestId(icon) !== null
	);
const getByRoleWithIconMultipleError = (
	container: Element | null,
	role: ByRoleMatcher,
	options: ByRoleWithIconOptions
): string => `Found multiple elements with role ${role} and icon ${options.icon}`;
const getByRoleWithIconMissingError = (
	container: Element | null,
	role: ByRoleMatcher,
	options: ByRoleWithIconOptions
): string => `Unable to find an element with role ${role} and icon ${options.icon}`;

const [
	queryByTextWithMarkup,
	getAllByTextWithMarkup,
	getByTextWithMarkup,
	findAllByTextWithMarkup,
	findByTextWithMarkup
] = queryHelpers.buildQueries<[string | RegExp]>(
	queryAllByTextWithMarkup,
	getByTextWithMarkupMultipleError,
	getByTextWithMarkupMissingError
);

const [
	queryByRoleWithIcon,
	getAllByRoleWithIcon,
	getByRoleWithIcon,
	findAllByRoleWithIcon,
	findByRoleWithIcon
] = queryHelpers.buildQueries<[ByRoleMatcher, ByRoleWithIconOptions]>(
	queryAllByRoleWithIcon,
	getByRoleWithIconMultipleError,
	getByRoleWithIconMissingError
);

const customQueries = {
	// byTextWithMarkup
	queryByTextWithMarkup,
	getAllByTextWithMarkup,
	getByTextWithMarkup,
	findAllByTextWithMarkup,
	findByTextWithMarkup,
	// byRoleWithIcon
	queryByRoleWithIcon,
	getAllByRoleWithIcon,
	getByRoleWithIcon,
	findAllByRoleWithIcon,
	findByRoleWithIcon
};

const queriesExtended = { ...queries, ...customQueries };

export function within(
	element: Parameters<typeof rtlWithin<typeof queriesExtended>>[0]
): ReturnType<typeof rtlWithin<typeof queriesExtended>> {
	return rtlWithin(element, queriesExtended);
}

export const screen: Screen<typeof queriesExtended> = { ...rtlScreen, ...within(document.body) };

const Wrapper = ({ initialRouterEntries, children }: WrapperProps): React.JSX.Element => {
	const i18n = useMemo(() => {
		const i18nFactory = new I18nTestFactory();
		return i18nFactory.getAppI18n();
	}, []);

	return (
		<MemoryRouter
			initialEntries={initialRouterEntries}
			initialIndex={(initialRouterEntries?.length || 1) - 1}
		>
			<ThemeProvider>
				<SnackbarManager>
					<I18nextProvider i18n={i18n}>
						<ModalManager>{children}</ModalManager>
					</I18nextProvider>
				</SnackbarManager>
			</ThemeProvider>
		</MemoryRouter>
	);
};

function customRender(
	ui: React.ReactElement,
	{
		initialRouterEntries = ['/'],
		...options
	}: WrapperProps & {
		options?: Omit<RenderOptions, 'queries' | 'wrapper'>;
	} = {}
): RenderResult<typeof queriesExtended> {
	return render(ui, {
		wrapper: ({ children }: Pick<WrapperProps, 'children'>) => (
			<Wrapper initialRouterEntries={initialRouterEntries}>{children}</Wrapper>
		),
		queries: { ...queries, ...customQueries },
		...options
	});
}

type SetupOptions = Pick<WrapperProps, 'initialRouterEntries'> & {
	renderOptions?: Omit<RenderOptions, 'queries' | 'wrapper'>;
	setupOptions?: Parameters<(typeof userEvent)['setup']>[0];
};

export const setup = (
	ui: ReactElement,
	options?: SetupOptions
): { user: UserEvent } & ReturnType<typeof customRender> => ({
	user: userEvent.setup({
		advanceTimers: jest.advanceTimersByTime,
		...options?.setupOptions
	}),
	...customRender(ui, {
		initialRouterEntries: options?.initialRouterEntries,
		...options?.renderOptions
	})
});

export function triggerLoadMore(): void {
	const { calls, instances } = (window.IntersectionObserver as jest.Mock<IntersectionObserver>)
		.mock;
	const [onChange] = calls[calls.length - 1];
	const instance = instances[instances.length - 1];

	act(() => {
		onChange(
			[
				{
					target: screen.getByTestId(ICON_REGEXP.queryLoading),
					intersectionRatio: 0,
					isIntersecting: true
				} as unknown as IntersectionObserverEntry
			],
			instance
		);
	});
}
