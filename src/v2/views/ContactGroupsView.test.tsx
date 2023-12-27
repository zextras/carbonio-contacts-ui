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
import { setup, screen, triggerLoadMore } from '../../utils/testUtils';
import { ROUTES } from '../constants';

describe('Contact Group View', () => {
	function populateContactGroup(contactGroupName = faker.company.name()): void {
		return getSetupServer().use(
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
	}

	it.skip('pagination', async () => {
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
											},
											{
												type: 'I',
												value: faker.internet.email()
											}
										],
										sf: 'bo0000000276'
									}
								],
								more: true,
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
		expect(await screen.findByText(contactGroupName)).toBeVisible();
		triggerLoadMore();
	});

	it('should render the avatar, the name and the member number (case 1+ addresses string) of a contact group', async () => {
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
											},
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

		expect(await screen.findByText(contactGroupName)).toBeVisible();
		expect(screen.getByTestId('icon: PeopleOutline')).toBeVisible();
		expect(screen.getByText('2 addresses')).toBeVisible();
	});

	it('should render the avatar, the name and the member number (case 0 addresses string) of a contact group', async () => {
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
										m: [],
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

		expect(await screen.findByText(contactGroupName)).toBeVisible();
		expect(screen.getByTestId('icon: PeopleOutline')).toBeVisible();
		expect(screen.getByText('0 addresses')).toBeVisible();
	});

	it('should render the avatar, the name and the member number (case 1 address string) of a contact group', async () => {
		const contactGroupName = faker.company.name();
		populateContactGroup(contactGroupName);

		setup(
			<Route path={ROUTES.contactGroup}>
				<ContactGroupsView />
			</Route>
		);

		await waitForElementToBeRemoved(screen.queryByText('emptyListPlaceholder'), { timeout: 2000 });

		expect(await screen.findByText(contactGroupName)).toBeVisible();
		expect(screen.getByTestId('icon: PeopleOutline')).toBeVisible();
		expect(screen.getByText('1 address')).toBeVisible();
	});

	describe('Actions', () => {
		it('should render the mail, edit and delete actions on hover', async () => {
			const contactGroupName = faker.company.name();
			populateContactGroup(contactGroupName);

			const { user } = setup(
				<Route path={ROUTES.contactGroup}>
					<ContactGroupsView />
				</Route>
			);

			await waitForElementToBeRemoved(screen.queryByText('emptyListPlaceholder'), {
				timeout: 2000
			});

			await user.hover(await screen.findByText(contactGroupName));
			expect(screen.getByTestId('icon: Edit2Outline')).toBeVisible();
			expect(screen.getByTestId('icon: Trash2Outline')).toBeVisible();
			expect(screen.getByTestId('icon: EmailOutline')).toBeVisible();
		});

		it.todo('should render the dropdown with the actions when right click');

		it.todo('should open the mail board if the user clicks on the mail icon');
	});
	test.todo('Click on a list item open the displayer for that item');

	test.todo('Click on close action close the displayer');
});
