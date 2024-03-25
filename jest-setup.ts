/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import failOnConsole from 'jest-fail-on-console';
import fetchMock from 'jest-fetch-mock';

import {
	defaultAfterAllTests,
	defaultAfterEachTest,
	defaultBeforeAllTests,
	defaultBeforeEachTest,
	getFailOnConsoleDefaultConfig
} from './src/carbonio-ui-commons/test/jest-setup';
import { JEST_MOCKED_ERROR } from './src/constants/tests';

configure({
	asyncUtilTimeout: 2000
});

jest.setTimeout(10000);

failOnConsole({
	...getFailOnConsoleDefaultConfig(),
	shouldFailOnWarn: false,
	silenceMessage: (message): boolean => message.includes(JEST_MOCKED_ERROR)
});

beforeAll(() => {
	defaultBeforeAllTests();
	fetchMock.doMock();
});

beforeEach(() => {
	defaultBeforeEachTest();
});

afterEach(() => {
	defaultAfterEachTest();
});

afterAll(() => {
	defaultAfterAllTests();
});
