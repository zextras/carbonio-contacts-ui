/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { ErrorSoapBodyResponse } from '@zextras/carbonio-shell-ui';
import { map } from 'lodash';

import { getShareInfo, GetShareInfoResponse } from './get-share-info';
import { FOLDER_VIEW } from '../../carbonio-ui-commons/constants';
import { createAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { NAMESPACES } from '../../constants/api';

describe('GetShareInfo', () => {
	it('should raise an exception if the response contains a Fault', () => {
		const response: ErrorSoapBodyResponse = {
			Fault: {
				Detail: { Error: { Code: faker.string.uuid(), Detail: faker.word.preposition() } },
				Reason: { Text: faker.word.sample() }
			}
		};
		createAPIInterceptor('GetShareInfo', response);
		expect(async () => {
			await getShareInfo();
		}).rejects.toThrow();
	});

	it('should call the API passing the correct static params', async () => {
		const interceptor = createAPIInterceptor('GetShareInfo');
		getShareInfo();
		const request = await interceptor;
		expect(request).toEqual({
			includeSelf: 0,
			_jsns: NAMESPACES.account
		});
	});

	it("should return ownerEmail in the ownerName field if the API doesn't return the ownerName", async () => {
		const response: GetShareInfoResponse = {
			share: [
				{
					folderId: faker.string.uuid(),
					folderPath: `/${faker.word.noun()}`,
					folderUuid: faker.string.uuid(),
					granteeType: 'pub',
					ownerEmail: faker.internet.email(),
					ownerId: faker.string.uuid(),
					rights: 'r',
					view: FOLDER_VIEW.contact
				}
			],
			_jsns: NAMESPACES.account
		};
		createAPIInterceptor('GetShareInfo', response);
		const shares = await getShareInfo();
		expect(shares).toEqual([
			expect.objectContaining({
				ownerName: response.share[0].ownerEmail
			})
		]);
	});

	it('should return only shares of Contacts', async () => {
		const views = [
			FOLDER_VIEW.message,
			FOLDER_VIEW.document,
			FOLDER_VIEW.appointment,
			FOLDER_VIEW.message,
			FOLDER_VIEW.appointment,
			FOLDER_VIEW.appointment
		];

		const contactShare = {
			folderId: faker.string.uuid(),
			folderPath: `/${faker.word.noun()}`,
			folderUuid: faker.string.uuid(),
			granteeType: 'pub',
			ownerEmail: faker.internet.email(),
			ownerName: faker.person.fullName(),
			ownerId: faker.string.uuid(),
			rights: 'r',
			view: FOLDER_VIEW.contact
		};

		const otherShares = map(
			views,
			(view) =>
				({
					folderId: faker.string.uuid(),
					folderPath: `/${faker.word.noun()}`,
					folderUuid: faker.string.uuid(),
					granteeType: 'pub',
					ownerEmail: faker.internet.email(),
					ownerName: faker.person.fullName(),
					ownerId: faker.string.uuid(),
					rights: 'r',
					view
				}) satisfies GetShareInfoResponse['share'][number]
		);

		const response: GetShareInfoResponse = {
			share: [contactShare, ...otherShares],
			_jsns: NAMESPACES.account
		};
		createAPIInterceptor('GetShareInfo', response);
		const shares = await getShareInfo();
		expect(shares).toHaveLength(1);
		expect(shares?.[0]).toEqual(
			expect.objectContaining({
				folderId: contactShare.folderId
			})
		);
	});
});
