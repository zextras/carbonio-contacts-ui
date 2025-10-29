/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { noop } from 'lodash';
import { SetupServer, setupServer } from 'msw/node';
import { vi, beforeAll, beforeEach, afterEach, afterAll } from 'vitest';

import { getRestHandlers } from '@test-utils/network/msw/handlers';

vi.mock(import('@zextras/carbonio-shell-ui'));
vi.mock(import('@zextras/carbonio-ui-soap-lib'));
vi.mock(import('zustand'));

// Setup MSW mock server
let server = setupServer();

configure({
	asyncUtilTimeout: 2000
});

// TODO check if it is needed
// vi.mock('helpers/download', () => ({
// 	redirectToBlob: vi.fn()
// // }));

// TODO check if it is needed
// vi.mock('../../assets/notification.mp3', () => '');

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

	server?.close();
	server = setupServer(...getRestHandlers());
	server.listen({ onUnhandledRequest });
};

beforeAll(() => {
	defaultBeforeAllTests();
});

beforeEach(() => {
	vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
	vi.clearAllTimers();
	vi.useRealTimers();
});

afterAll(() => {
	server.resetHandlers();
	server.close();
});

// mock a simplified crypto
Object.defineProperty(window.crypto, 'randomUUID', {
	writable: true,
	value: vi.fn(() => Math.random().toString())
});

// Mock Worker
class Worker {
	url: string;

	onmessage: (msg: string) => void;

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

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn()
}));

// mock a simplified Intersection Observer
Object.defineProperty(window, 'IntersectionObserver', {
	writable: true,
	value: vi.fn(function intersectionObserverMock(
		callback: IntersectionObserverCallback,
		options: IntersectionObserverInit
	) {
		return {
			thresholds: options.threshold,
			root: options.root,
			rootMargin: options.rootMargin,
			observe: vi.fn(),
			unobserve: vi.fn(),
			disconnect: vi.fn()
		};
	})
});

export const getSetupServer = (): SetupServer => server;
