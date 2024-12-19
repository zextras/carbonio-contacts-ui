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
import * as downloadModule from './src/helpers/download';

configure({
	asyncUtilTimeout: 2000
});

jest.setTimeout(10000);

failOnConsole({
	...getFailOnConsoleDefaultConfig(),
	shouldFailOnWarn: false,
	silenceMessage: (message): boolean =>
		message.includes(JEST_MOCKED_ERROR) ||
		// FIXME: these are caused by the wrong usage of the ChipInput, where all the data should
		// 	go in the value of the chip, not the chip itself.
		message.includes('Received `false` for a non-boolean attribute `duplicated`') ||
		message.includes('React does not recognize the `firstName` prop on a DOM element') ||
		message.includes('React does not recognize the `lastName` prop on a DOM element') ||
		message.includes('React does not recognize the `fullName` prop on a DOM element') ||
		message.includes('React does not recognize the `isGroup` prop on a DOM element')
});

beforeAll(() => {
	defaultBeforeAllTests();
	fetchMock.doMock();
	jest.spyOn(downloadModule, 'redirectToBlob').mockImplementation(() => {});
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
