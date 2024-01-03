/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { faker } from '@faker-js/faker';
import { waitForElementToBeRemoved, within } from '@testing-library/react';
import { rest } from 'msw';
import { Route } from 'react-router-dom';

import { ContactGroupsView } from './ContactGroupsView';
import { getSetupServer } from '../carbonio-ui-commons/test/jest-setup';
import { makeListItemsVisible, setupTest, screen } from '../carbonio-ui-commons/test/test-setup';
import { ROUTES } from '../v2/constants';
import {
	EMPTY_DISPLAYER_HINT,
	EMPTY_LIST_HINT,
	ICON_REGEXP,
	SELECTORS
} from '../v2/constants/tests';

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
		setupTest(
			<Route path={ROUTES.contactGroup}>
				<ContactGroupsView />
			</Route>
		);

		await waitForElementToBeRemoved(screen.queryByText('emptyListPlaceholder'));
		expect(await screen.findByText(contactGroupName)).toBeVisible();
		// triggerLoadMore();
	});

	it('should render the avatar, the name and the number of the members (case 1+ addresses string) of a contact group', async () => {
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
		setupTest(
			<Route path={ROUTES.contactGroup}>
				<ContactGroupsView />
			</Route>
		);

		// await waitForElementToBeRemoved(screen.queryByText('emptyListPlaceholder'));

		expect(await screen.findByText(contactGroupName)).toBeVisible();
		const listItemContent = screen.getByTestId(SELECTORS.listItemContent);
		expect(within(listItemContent).getByTestId(ICON_REGEXP.avatar)).toBeVisible();
		expect(screen.getByText('2 addresses')).toBeVisible();
	});

	it('should render the avatar, the name and the number of the members (case 0 addresses string) of a contact group', async () => {
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
		setupTest(
			<Route path={ROUTES.contactGroup}>
				<ContactGroupsView />
			</Route>
		);

		// await waitForElementToBeRemoved(screen.queryByText(EMPTY_LIST_HINT));

		expect(await screen.findByText(contactGroupName)).toBeVisible();
		expect(screen.getByText('0 addresses')).toBeVisible();
		const listItemContent = screen.getByTestId(SELECTORS.listItemContent);
		expect(within(listItemContent).getByTestId(ICON_REGEXP.avatar)).toBeVisible();
	});

	it('should render the avatar, the name and the number of the members (case 1 address string) of a contact group', async () => {
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

		setupTest(
			<Route path={ROUTES.contactGroup}>
				<ContactGroupsView />
			</Route>
		);

		// await waitForElementToBeRemoved(screen.queryByText('emptyListPlaceholder'), { timeout: 2000 });
		makeListItemsVisible();
		expect(await screen.findByText(contactGroupName, undefined, { timeout: 2000 })).toBeVisible();
		const listItemContent = screen.getByTestId(SELECTORS.listItemContent);
		expect(within(listItemContent).getByTestId(ICON_REGEXP.avatar)).toBeVisible();
		expect(screen.getByText('1 address')).toBeVisible();
	});

	describe.skip('Actions', () => {
		it('should render the mail, edit and delete actions on hover', async () => {
			const contactGroupName = faker.company.name();
			populateContactGroup(contactGroupName);

			const { user } = setupTest(
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

	describe.skip('Displayer', () => {
		it('should show the empty list and the empty displayer if there is no contact group', async () => {
			getSetupServer().use(
				rest.post('/service/soap/SearchRequest', async (req, res, ctx) =>
					res(
						ctx.json({
							Body: {
								SearchResponse: {
									sortBy: 'nameAsc',
									offset: 0,
									cn: [],
									more: false,
									_jsns: 'urn:zimbraMail'
								}
							}
						})
					)
				)
			);

			setupTest(
				<Route path={ROUTES.contactGroup}>
					<ContactGroupsView />
				</Route>
			);
			expect(await screen.findByText(EMPTY_LIST_HINT)).toBeVisible();
			expect(await screen.findByText(EMPTY_DISPLAYER_HINT)).toBeVisible();
		});

		it('should show the contact group list and the empty displayer', async () => {
			const contactGroupName = faker.company.name();
			populateContactGroup(contactGroupName);

			setupTest(
				<Route path={ROUTES.contactGroup}>
					<ContactGroupsView />
				</Route>
			);

			makeListItemsVisible();
			await screen.findByText(contactGroupName);
			await screen.findByText(EMPTY_DISPLAYER_HINT);
			expect(screen.queryByText(EMPTY_LIST_HINT)).not.toBeInTheDocument();
			expect(screen.getByText(EMPTY_DISPLAYER_HINT)).toBeVisible();
			expect(screen.getByText(contactGroupName)).toBeVisible();
		});

		test('Click on a list item open the displayer for that item', async () => {
			const contactGroupName = faker.company.name();
			populateContactGroup(contactGroupName);

			const { user } = setupTest(
				<Route path={ROUTES.contactGroup}>
					<ContactGroupsView />
				</Route>
			);
			// makeListItemsVisible();
			await screen.findByText(contactGroupName);
			await screen.findByText(EMPTY_DISPLAYER_HINT);
			await user.click(screen.getByText(contactGroupName));
			await screen.findByRoleWithIcon('button', { icon: ICON_REGEXP.closeDisplayer });
			expect(screen.getAllByText(contactGroupName)).toHaveLength(2);
			expect(screen.getByText(/addresses list/i)).toBeVisible();
		});

		test('Click on close action close the displayer', async () => {
			const contactGroupName = faker.company.name();
			const contactGroupId = faker.number.int({ min: 100, max: 999 });

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
											id: contactGroupId,
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

			const { user } = setupTest(
				<Route path={ROUTES.contactGroup}>
					<ContactGroupsView />
				</Route>,
				{
					initialEntries: [`/${contactGroupId}`]
				}
			);
			// makeListItemsVisible();
			await screen.findAllByText(contactGroupName);
			expect(screen.queryByText(EMPTY_DISPLAYER_HINT)).not.toBeInTheDocument();
			const closeButton = screen.getByRoleWithIcon('button', { icon: ICON_REGEXP.closeDisplayer });
			expect(closeButton).toBeVisible();
			expect(closeButton).toBeEnabled();
			await user.click(closeButton);
			await screen.findByText(EMPTY_DISPLAYER_HINT);
			// contact group name is shown only 1 time, inside the list
			expect(screen.getByText(contactGroupName)).toBeVisible();
			expect(
				screen.queryByRoleWithIcon('button', { icon: ICON_REGEXP.closeDisplayer })
			).not.toBeInTheDocument();
		});
	});
});
