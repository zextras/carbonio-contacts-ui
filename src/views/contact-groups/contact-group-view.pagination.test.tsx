/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { waitFor } from '@testing-library/react';

import { CGView } from './contact-groups-view';
import { screen, setupTest, triggerLoadMore } from '../../carbonio-ui-commons/test/test-setup';
import { FIND_CONTACT_GROUP_LIMIT } from '../../constants';
import { CnItem } from '../../network/api/types';
import {
	createFindContactGroupsResponse,
	registerFindContactGroupsHandler
} from '../../tests/msw-handlers/find-contact-groups';
import { createCnItem } from '../../tests/utils';

function generateNContactGroups(n: number): Array<CnItem> {
	return [...Array(n)].map((value, index) => createCnItem(`name-${index}`, [], index.toString()));
}

describe('Contact Group View pagination', () => {
	it('should load the second page only when bottom element becomes visible', async () => {
		const cnItem1 = createCnItem();
		const cnItems99 = generateNContactGroups(FIND_CONTACT_GROUP_LIMIT - 1);
		const first100Items = [cnItem1].concat(...cnItems99);
		const cnItem101 = createCnItem('cgName101');
		const findHandler = registerFindContactGroupsHandler(
			{
				findContactGroupsResponse: createFindContactGroupsResponse(first100Items, true),
				offset: 0
			},
			{
				findContactGroupsResponse: createFindContactGroupsResponse([cnItem101], true),
				offset: 100
			}
		);

		setupTest(
			<CGView />,

			{ initialEntries: [`/contact-groups`] }
		);

		expect(await screen.findByText(cnItem1.fileAsStr)).toBeVisible();
		expect(screen.queryByText(cnItem101.fileAsStr)).not.toBeInTheDocument();
		triggerLoadMore();
		await waitFor(() => expect(findHandler).toHaveBeenCalledTimes(2));
		expect(await screen.findByText(cnItem101.fileAsStr)).toBeVisible();
	});
});
