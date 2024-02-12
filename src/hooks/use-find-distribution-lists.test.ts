/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { waitFor } from '@testing-library/react';

import { useFindDistributionLists } from './use-find-distribution-lists';
import { setupHook } from '../carbonio-ui-commons/test/test-setup';
import { GetAccountDistributionListsRequest } from '../network/api/get-account-distribution-lists';
import { registerGetAccountDistributionListsHandler } from '../tests/msw-handlers/get-account-distribution-lists';
import { generateDistributionList } from '../tests/utils';

const dlMemberOnly = generateDistributionList({ isMember: true, isOwner: false });
const dlOwnerOnly = generateDistributionList({ isMember: false, isOwner: true });
const dlMemberAndOwner = generateDistributionList({ isMember: true, isOwner: true });

beforeEach(() => {
	registerGetAccountDistributionListsHandler([dlMemberOnly, dlOwnerOnly, dlMemberAndOwner]);
});

describe('Use find distribution lists hook', () => {
	it('should return only distribution lists of which the user is member if memberOf is true and ownerOf is false', async () => {
		const { result } = setupHook(useFindDistributionLists, {
			initialProps: [{ memberOf: true, ownerOf: false }]
		});
		await waitFor(() => expect(result.current).toHaveLength(2));
		expect(result.current).toEqual([dlMemberOnly, dlMemberAndOwner]);
	});

	it('should return only distribution lists of which the user is owner if memberOf is false and ownerOf is true', async () => {
		const { result } = setupHook(useFindDistributionLists, {
			initialProps: [{ memberOf: false, ownerOf: true }]
		});
		await waitFor(() => expect(result.current).toHaveLength(2));
		expect(result.current).toEqual([
			{ ...dlOwnerOnly, isMember: undefined },
			{ ...dlMemberAndOwner, isMember: undefined }
		]);
	});

	it('should return all distribution lists if memberOf is true and ownerOf is true', async () => {
		const { result } = setupHook(useFindDistributionLists, {
			initialProps: [{ memberOf: true, ownerOf: true }]
		});
		await waitFor(() => expect(result.current).toHaveLength(3));
		expect(result.current).toEqual([dlMemberOnly, dlOwnerOnly, dlMemberAndOwner]);
	});

	it('should request also distribution lists of which the user is owner if memberOf is true and ownerOf is false to retrieve ownership data', async () => {
		const handler = registerGetAccountDistributionListsHandler([dlMemberOnly]);
		const { result } = setupHook(useFindDistributionLists, {
			initialProps: [{ memberOf: true, ownerOf: false }]
		});
		await waitFor(() => expect(result.current).toHaveLength(1));
		// TODO: cannot read from json right now
		//  because json is already read inside the handler and throws an error
		// 	"Failed to execute "json" on "IsomorphicRequest": body buffer already read"
		expect(handler.mock.lastCall?.[0].body.Body.GetAccountDistributionListsRequest).toEqual(
			expect.objectContaining<Partial<GetAccountDistributionListsRequest>>({
				ownerOf: true
			})
		);
	});
});
