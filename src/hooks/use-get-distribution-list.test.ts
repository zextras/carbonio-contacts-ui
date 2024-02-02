/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { waitFor } from '@testing-library/react';

import { useGetDistributionList } from './use-get-distribution-list';
import { setupHook } from '../carbonio-ui-commons/test/test-setup';
import { DistributionList } from '../model/distribution-list';
import { useDistributionListsStore } from '../store/distribution-lists';
import { registerGetDistributionListHandler } from '../tests/msw-handlers/get-distribution-list';

const dlDetails: Required<Omit<DistributionList, 'members'>> = {
	id: faker.string.uuid(),
	email: faker.internet.email(),
	isMember: faker.datatype.boolean(),
	isOwner: faker.datatype.boolean(),
	canRequireMembers: true,
	description: faker.word.words(),
	displayName: faker.word.words(),
	owners: [{ id: faker.string.uuid(), name: faker.internet.email() }]
};

describe('Use get distribution list hook', () => {
	it('should not request data to the network if all fields are defined', async () => {
		const handler = registerGetDistributionListHandler(dlDetails);
		useDistributionListsStore.getState().setDistributionLists([dlDetails]);
		const { result } = setupHook(useGetDistributionList, {
			initialProps: [{ id: dlDetails.id }]
		});
		await waitFor(() => expect(result.current).toEqual(dlDetails));
		expect(handler).not.toHaveBeenCalled();
	});

	it('should request data to the network if item is not in the store', async () => {
		const handler = registerGetDistributionListHandler(dlDetails);
		const { result } = setupHook(useGetDistributionList, {
			initialProps: [{ id: dlDetails.id }]
		});
		await waitFor(() => expect(result.current).toEqual(dlDetails));
		expect(handler).toHaveBeenCalled();
	});

	it.each<keyof DistributionList>(['owners', 'displayName', 'description', 'isMember'])(
		'should request data to the network if %s field is missing inside the store',
		async (field) => {
			useDistributionListsStore
				.getState()
				.setDistributionLists([{ ...dlDetails, [field]: undefined }]);
			const handler = registerGetDistributionListHandler(dlDetails);
			const { result } = setupHook(useGetDistributionList, {
				initialProps: [{ id: dlDetails.id }]
			});
			await waitFor(() => expect(result.current).toEqual(dlDetails));
			expect(handler).toHaveBeenCalled();
		}
	);

	it('should request data only once', async () => {
		const handler = registerGetDistributionListHandler(dlDetails);
		const { result, rerender } = setupHook(useGetDistributionList, {
			initialProps: [{ id: dlDetails.id }]
		});
		await waitFor(() => expect(result.current).toEqual(dlDetails));
		expect(handler).toHaveBeenCalledTimes(1);
		rerender();
		expect(handler).toHaveBeenCalledTimes(1);
	});
});
