/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { renderHook, waitFor } from '@testing-library/react';

import { useFindSharedContactGroups } from './use-find-shared-contact-groups';
import { SharedContactGroup } from '../model/contact-group';
import { useContactGroupStore } from '../store/contact-groups';
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
			expect(result.current.sharedContactGroups).toEqual([expectedSharedContactGroup]);
		});
	});

	it('should return truthy has more if more results', async () => {
		const contactGroup = createCnItem('My Group', [], '100');
		registerFindContactGroupsHandler({
			findContactGroupsResponse: createFindContactGroupsResponse([contactGroup], true),
			offset: 0
		});

		const { result } = renderHook(() => useFindSharedContactGroups('123'));
		await waitFor(() => {
			expect(result.current.hasMore).toBe(true);
		});
	});

	it('should not call API if data for account initialized with empty contact groups', async () => {
		const contactGroup = createCnItem('My Group', [], '100');
		useContactGroupStore.getState().populateSharedContactGroupsByAccountId('123', [], 0, false);
		const findHandler = registerFindContactGroupsHandler({
			findContactGroupsResponse: createFindContactGroupsResponse([contactGroup], true),
			offset: 0
		});

		const { result } = renderHook(() => useFindSharedContactGroups('123'));
		await waitFor(() => {
			expect(result.current.sharedContactGroups).toEqual([]);
		});
		await waitFor(() => expect(findHandler).not.toHaveBeenCalled());
	});
});
