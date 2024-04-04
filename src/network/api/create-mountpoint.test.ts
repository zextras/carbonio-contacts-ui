/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { ErrorSoapBodyResponse, FOLDERS } from '@zextras/carbonio-shell-ui';
import { times } from 'lodash';

import {
	createMountpoints,
	CreateMountpointsRequest,
	CreateMountpointsResponse
} from './create-mountpoints';
import { createAPIInterceptor } from '../../carbonio-ui-commons/test/mocks/network/msw/create-api-interceptor';
import { NAMESPACES } from '../../constants/api';
import { ShareInfo } from '../../model/share-info';

describe('createMountpoints', () => {
	it('should raise an exception if the response contains a Fault', () => {
		const response: ErrorSoapBodyResponse = {
			Fault: {
				Detail: { Error: { Code: faker.string.uuid(), Detail: faker.word.preposition() } },
				Reason: { Text: faker.word.sample() }
			}
		};
		createAPIInterceptor('Batch', response);
		expect(async () => {
			await createMountpoints([]);
		}).rejects.toThrow();
	});

	it('should call the API passing the correct static params', async () => {
		const shares: Array<ShareInfo & { mountpointName: string }> = times(3, () => ({
			folderId: `${faker.string.uuid()}:${faker.number.int({ min: 2 })}`,
			folderPath: `/${faker.word.noun(1)}`,
			folderUuid: faker.string.uuid(),
			granteeType: 'grp',
			ownerEmail: faker.internet.email(),
			ownerId: faker.string.uuid(),
			ownerName: faker.person.fullName(),
			rights: 'r',
			mountpointName: faker.word.noun(1)
		}));
		const interceptor = createAPIInterceptor<CreateMountpointsRequest, CreateMountpointsResponse>(
			'Batch'
		);
		await createMountpoints(shares);
		const request = await interceptor;
		expect(request.CreateMountpointRequest).toBeDefined();
		shares.forEach((share) => {
			expect(request.CreateMountpointRequest).toContainEqual(
				expect.objectContaining({
					link: expect.objectContaining({
						l: FOLDERS.USER_ROOT,
						name: share.mountpointName,
						rid: share.folderId,
						view: 'contact',
						zid: share.ownerId
					}),
					_jsns: NAMESPACES.mail
				})
			);
		});
	});
});
