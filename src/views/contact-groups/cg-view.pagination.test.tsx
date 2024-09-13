/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { waitFor } from '@testing-library/react';

import { CGView } from './cg-view';
import { screen, setupTest, triggerLoadMore } from '../../carbonio-ui-commons/test/test-setup';
import { FIND_CONTACT_GROUP_LIMIT } from '../../constants';
import {
	createFindContactGroupsResponse,
	registerFindContactGroupsHandler
} from '../../tests/msw-handlers/find-contact-groups';
import { createCnItem } from '../../tests/utils';

describe('Contact Group View pagination', () => {
	it('should load the second page only when bottom element becomes visible', async () => {
		const cnItem1 = createCnItem();
		const cnItem101 = createCnItem('cgName101');
		const findHandler = registerFindContactGroupsHandler(
			{
				findContactGroupsResponse: createFindContactGroupsResponse(
					[
						cnItem1,
						...[...Array(FIND_CONTACT_GROUP_LIMIT - 1)].map((value, index) =>
							createCnItem(undefined, undefined, index.toString())
						)
					],
					true
				),
				offset: 0
			},
			{
				findContactGroupsResponse: createFindContactGroupsResponse([cnItem101], true),
				offset: 100
			}
		);

		setupTest(<CGView />);

		expect(await screen.findByText(cnItem1.fileAsStr)).toBeVisible();
		expect(screen.queryByText(cnItem101.fileAsStr)).not.toBeInTheDocument();
		triggerLoadMore();
		await waitFor(() => expect(findHandler).toHaveBeenCalledTimes(2));
		expect(await screen.findByText(cnItem101.fileAsStr)).toBeVisible();
	});
});
