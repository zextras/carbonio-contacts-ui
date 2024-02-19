/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { times } from 'lodash';

import {
	BatchDistributionListActionRequest,
	distributionListAction
} from './distribution-list-action';
import { NAMESPACES } from '../../constants/api';
import { registerDistributionListActionHandler } from '../../tests/msw-handlers/distribution-list-action';

describe('Distribution list action', () => {
	it('should not call API if there is no data to update set in the argument', async () => {
		const handler = registerDistributionListActionHandler({});
		const dlEmail = 'dl-mail@domain.net';
		await distributionListAction({ email: dlEmail });
		expect(handler).not.toHaveBeenCalled();
	});

	it('should call API with only removed members data', async () => {
		const membersToRemove = times(10, () => faker.internet.email());
		const handler = registerDistributionListActionHandler({});
		const dlEmail = 'dl-mail@domain.net';
		await distributionListAction({ email: dlEmail, membersToRemove });
		expect(await handler.mock.lastCall?.[0].json()).toEqual(
			expect.objectContaining<{
				Body: { BatchRequest: BatchDistributionListActionRequest };
			}>({
				Body: {
					BatchRequest: {
						_jsns: NAMESPACES.generic,
						DistributionListActionRequest: [
							{
								action: {
									op: 'removeMembers',
									dlm: membersToRemove.map((member) => ({ _content: member }))
								},
								dl: {
									by: 'name',
									_content: dlEmail
								},
								_jsns: NAMESPACES.account,
								requestId: 'removeMembers'
							}
						]
					}
				}
			})
		);
	});

	it('should call API with only added members data', async () => {
		const membersToAdd = times(10, () => faker.internet.email());
		const handler = registerDistributionListActionHandler({ membersToAdd });
		const dlEmail = 'dl-mail@domain.net';
		await distributionListAction({ email: dlEmail, membersToAdd });
		expect(await handler.mock.lastCall?.[0].json()).toEqual(
			expect.objectContaining<{
				Body: { BatchRequest: BatchDistributionListActionRequest };
			}>({
				Body: {
					BatchRequest: {
						_jsns: NAMESPACES.generic,
						DistributionListActionRequest: [
							{
								action: {
									op: 'addMembers',
									dlm: membersToAdd.map((member) => ({ _content: member }))
								},
								dl: {
									by: 'name',
									_content: dlEmail
								},
								_jsns: NAMESPACES.account,
								requestId: 'addMembers'
							}
						]
					}
				}
			})
		);
	});

	it('should call API with only display name', async () => {
		const dlData = { description: undefined, displayName: 'new display name' };
		const handler = registerDistributionListActionHandler(dlData);
		const dlEmail = 'dl-mail@domain.net';
		await distributionListAction({ email: dlEmail, ...dlData });
		expect(await handler.mock.lastCall?.[0].json()).toEqual(
			expect.objectContaining<{
				Body: { BatchRequest: BatchDistributionListActionRequest };
			}>({
				Body: {
					BatchRequest: {
						_jsns: NAMESPACES.generic,
						DistributionListActionRequest: [
							{
								action: {
									op: 'modify',
									a: [{ n: 'displayName', _content: dlData.displayName }]
								},
								dl: {
									by: 'name',
									_content: dlEmail
								},
								_jsns: NAMESPACES.account,
								requestId: 'modify'
							}
						]
					}
				}
			})
		);
	});

	it('should call API with only description', async () => {
		const dlData = { description: 'new description', displayName: undefined };
		const handler = registerDistributionListActionHandler(dlData);
		const dlEmail = 'dl-mail@domain.net';
		await distributionListAction({ email: dlEmail, ...dlData });
		expect(await handler.mock.lastCall?.[0].json()).toEqual(
			expect.objectContaining<{
				Body: { BatchRequest: BatchDistributionListActionRequest };
			}>({
				Body: {
					BatchRequest: {
						_jsns: NAMESPACES.generic,
						DistributionListActionRequest: [
							{
								action: {
									op: 'modify',
									a: [{ n: 'description', _content: dlData.description }]
								},
								dl: {
									by: 'name',
									_content: dlEmail
								},
								_jsns: NAMESPACES.account,
								requestId: 'modify'
							}
						]
					}
				}
			})
		);
	});

	it('should call API with both display name and description data', async () => {
		const dlData = { description: 'new description', displayName: 'new display name' };
		const handler = registerDistributionListActionHandler(dlData);
		const dlEmail = 'dl-mail@domain.net';
		await distributionListAction({ email: dlEmail, ...dlData });
		expect(await handler.mock.lastCall?.[0].json()).toEqual(
			expect.objectContaining<{
				Body: { BatchRequest: BatchDistributionListActionRequest };
			}>({
				Body: {
					BatchRequest: {
						_jsns: NAMESPACES.generic,
						DistributionListActionRequest: [
							{
								action: {
									op: 'modify',
									a: [
										{ n: 'displayName', _content: dlData.displayName },
										{ n: 'description', _content: dlData.description }
									]
								},
								dl: {
									by: 'name',
									_content: dlEmail
								},
								_jsns: NAMESPACES.account,
								requestId: 'modify'
							}
						]
					}
				}
			})
		);
	});

	it('should call API with all data to update', async () => {
		const membersToRemove = times(10, () => faker.internet.email());
		const membersToAdd = times(10, () => faker.internet.email());
		const dlData = {
			membersToAdd,
			membersToRemove,
			displayName: faker.word.words(),
			description: faker.word.words()
		};
		const handler = registerDistributionListActionHandler(dlData);
		const dlEmail = 'dl-mail@domain.net';
		await distributionListAction({ email: dlEmail, ...dlData });
		expect(await handler.mock.lastCall?.[0].json()).toEqual(
			expect.objectContaining<{
				Body: { BatchRequest: BatchDistributionListActionRequest };
			}>({
				Body: {
					BatchRequest: {
						_jsns: NAMESPACES.generic,
						DistributionListActionRequest: [
							{
								action: {
									op: 'modify',
									a: [
										{ n: 'displayName', _content: dlData.displayName },
										{ n: 'description', _content: dlData.description }
									]
								},
								dl: {
									by: 'name',
									_content: dlEmail
								},
								_jsns: NAMESPACES.account,
								requestId: 'modify'
							},
							{
								action: {
									op: 'addMembers',
									dlm: membersToAdd.map((member) => ({ _content: member }))
								},
								dl: {
									by: 'name',
									_content: dlEmail
								},
								_jsns: NAMESPACES.account,
								requestId: 'addMembers'
							},
							{
								action: {
									op: 'removeMembers',
									dlm: membersToRemove.map((member) => ({ _content: member }))
								},
								dl: {
									by: 'name',
									_content: dlEmail
								},
								_jsns: NAMESPACES.account,
								requestId: 'removeMembers'
							}
						]
					}
				}
			})
		);
	});
});
