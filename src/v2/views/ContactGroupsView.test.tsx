/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { waitForElementToBeRemoved } from '@testing-library/react';
import { rest } from 'msw';
import { Route } from 'react-router-dom';

import { ContactGroupsView } from './ContactGroupsView';
import { getSetupServer } from '../../carbonio-ui-commons/test/jest-setup';
import { makeListItemsVisible } from '../../carbonio-ui-commons/test/test-setup';
import { setup, screen } from '../../utils/testUtils';
import { ROUTES } from '../constants';

describe('Contact Group View', () => {
	it('should render the avatar, the name and the member number of a contact group', async () => {
		const contactGroupName = faker.company.name();

		getSetupServer().use(
			rest.post('/service/soap/SearchRequest', async (req, res, ctx) =>
				res(
					ctx.json({
						Body: {
							SearchResponse: {
								sortBy: 'nameAsc',
								offset: 0,
								cn: [
									{
										id: faker.number.int({ min: 100, max: 999 }),
										l: '7',
										d: faker.date.recent().valueOf(),
										rev: 12974,
										fileAsStr: contactGroupName,
										_attrs: {
											nickname: contactGroupName,
											fullName: contactGroupName,
											type: 'group',
											fileAs: `8:${contactGroupName}`
										},
										m: [
											{
												type: 'I',
												value: faker.internet.email()
											}
										],
										sf: 'bo0000000276'
									}
								],
								more: false,
								_jsns: 'urn:zimbraMail'
							}
						}
					})
				)
			)
		);
		setup(
			<Route path={ROUTES.contactGroup}>
				<ContactGroupsView />
			</Route>
		);

		await waitForElementToBeRemoved(screen.queryByText('emptyListPlaceholder'));

		makeListItemsVisible();

		expect(await screen.findByText(contactGroupName)).toBeVisible();
		expect(screen.getByTestId('icon: PeopleOutline')).toBeVisible();
		expect(screen.getByText('1 address')).toBeVisible();
	});

	test.todo('should render the mail, edit and delete actions on hover');
});
