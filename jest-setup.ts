/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import failOnConsole from 'jest-fail-on-console';
import fetchMock from 'jest-fetch-mock';

import { JEST_MOCKED_ERROR } from './src/constants/tests';
import * as downloadModule from './src/helpers/download';
import { setupServer, SetupServer } from 'msw/node';
import { getRestHandlers } from '@test-utils/network/msw/handlers';
import { noop } from 'lodash';

let server: SetupServer;

configure({
	asyncUtilTimeout: 2000
});

jest.setTimeout(10000);

failOnConsole({
	shouldFailOnError: true,
	shouldFailOnWarn: false,
	silenceMessage: (message): boolean =>
		message.includes(JEST_MOCKED_ERROR) ||
		// FIXME: move the duplicated field inside the value of the chip, instead of placing it on the chip itself
		message.includes('Received `false` for a non-boolean attribute `duplicated`') ||
		// FIXME: fix the DS ChipInput to not spread all properties to the DOM
		message.includes('React does not recognize the `isGeneric` prop on a DOM element')
});

/**
 * Default logic to execute before all the tests
 */
type DefaultBeforeAllTestsProps = {
	onUnhandledRequest: 'warn' | 'error';
};
 const defaultBeforeAllTests = (
	{ onUnhandledRequest }: DefaultBeforeAllTestsProps = { onUnhandledRequest: 'warn' }
): void => {
	// Do not useFakeTimers with `whatwg-fetch` if using mocked server
	// https://github.com/mswjs/msw/issues/448

	// mock a simplified Intersection Observer
	Object.defineProperty(window, 'IntersectionObserver', {
		writable: true,
		value: jest.fn(function intersectionObserverMock(
			callback: IntersectionObserverCallback,
			options: IntersectionObserverInit
		) {
			return {
				thresholds: options.threshold,
				root: options.root,
				rootMargin: options.rootMargin,
				observe: jest.fn(),
				unobserve: jest.fn(),
				disconnect: jest.fn()
			};
		})
	});

	server?.close();

	server = setupServer(...getRestHandlers());
	server.listen({ onUnhandledRequest });
};

beforeAll(() => {
	defaultBeforeAllTests();
	fetchMock.doMock();
	jest.spyOn(downloadModule, 'redirectToBlob').mockImplementation(() => {});
});

beforeEach(noop);

afterEach(() => {
	jest.clearAllTimers();
});

afterAll(() => {
	server.resetHandlers();
	server.close();
});

// mock a simplified crypto
Object.defineProperty(window.crypto, 'randomUUID', {
	writable: true,
	value: jest.fn(() => Math.random().toString())
});

/**
 * Mocks the Worker class
 */

type MessageHandler = (msg: string) => void;

class Worker {
	url: string;

	onmessage: MessageHandler;

	constructor(stringUrl: string) {
		this.url = stringUrl;
		this.onmessage = noop;
	}

	postMessage(msg: string): void {
		this.onmessage(msg);
	}
}

Object.defineProperty(window, 'Worker', {
	writable: true,
	value: Worker
});

export const getSetupServer = (): SetupServer => server;

window.ResizeObserver = jest.fn().mockImplementation(() => ({
	observe: jest.fn(),
	unobserve: jest.fn(),
	disconnect: jest.fn()
}));



