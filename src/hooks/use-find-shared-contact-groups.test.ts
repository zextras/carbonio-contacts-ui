/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';

import { useFindSharedContactGroups } from './use-find-shared-contact-groups';
import { SharedContactGroup } from '../model/contact-group';
import {
	createFindContactGroupsResponse,
	registerFindContactGroupsHandler
} from '../tests/msw-handlers/find-contact-groups';
import { createCnItem } from '../tests/utils';

describe('Find contact groups', () => {
	it('should return contact groups when call succeeds', async () => {
		const contactGroup = createCnItem('My Group', [], '100');
		registerFindContactGroupsHandler({
			findContactGroupsResponse: createFindContactGroupsResponse([contactGroup]),
			offset: 0
		});

		const { result } = renderHook(() => useFindSharedContactGroups('123'));

		const expectedSharedContactGroup: SharedContactGroup = {
			id: '100',
			accountId: '123',
			members: [],
			title: 'My Group'
		};
		await waitFor(() => {
			expect(result.current).toEqual({
				sharedContactGroups: [expectedSharedContactGroup],
				findMore: expect.any(Function)
			});
		});
	});
});
