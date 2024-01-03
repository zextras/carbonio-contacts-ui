/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import '@testing-library/jest-dom';
import failOnConsole from 'jest-fail-on-console';
import { rest } from 'msw';

import {
	defaultAfterAllTests,
	defaultAfterEachTest,
	defaultBeforeAllTests,
	defaultBeforeEachTest,
	getFailOnConsoleDefaultConfig
} from './src/carbonio-ui-commons/test/jest-setup';
import { registerRestHandler } from './src/carbonio-ui-commons/test/mocks/network/msw/handlers';
import { JEST_MOCKED_ERROR } from './src/constants/tests';
import { handleGetDistributionListMembersRequest } from './src/legacy/tests/msw/handle-get-distribution-list-members-request';

failOnConsole({
	...getFailOnConsoleDefaultConfig(),
	silenceMessage: (message): boolean => message.includes(JEST_MOCKED_ERROR)
});

beforeAll(() => {
	const handlers = [
		rest.post(
			'/service/soap/GetDistributionListMembersRequest',
			handleGetDistributionListMembersRequest
		)
	];
	registerRestHandler(...handlers);
	defaultBeforeAllTests();
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
