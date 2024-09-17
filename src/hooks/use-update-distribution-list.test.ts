/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';

import { useUpdateDistributionList } from './use-update-distribution-list';
import { screen, setupHook } from '../carbonio-ui-commons/test/test-setup';
import { JEST_MOCKED_ERROR } from '../constants/tests';
import { DistributionList } from '../model/distribution-list';
import { registerDistributionListActionHandler } from '../tests/msw-handlers/distribution-list-action';
import { generateDistributionList } from '../tests/utils';

describe('Use update distribution list hook', () => {
	it('should show success snackbar when there are no errors', async () => {
		const dl = generateDistributionList();
		registerDistributionListActionHandler({});
		const { result } = setupHook(useUpdateDistributionList, { initialProps: [dl] });
		result.current({ email: dl.email, displayName: 'different name' });
		expect(await screen.findByText(/distribution list edits saved successfully/i)).toBeVisible();
	});

	it('should show an error snackbar if there is an error', async () => {
		jest.spyOn(console, 'error').mockImplementation(jest.fn());
		const dl = generateDistributionList();
		registerDistributionListActionHandler({}, [JEST_MOCKED_ERROR]);
		const { result } = setupHook(useUpdateDistributionList, { initialProps: [dl] });
		result.current({
			email: dl.email,
			displayName: 'different name',
			members: { members: [faker.internet.email()], total: 1 }
		});
		expect(await screen.findByText(/something went wrong/i)).toBeVisible();
	});

	describe('Success snackbar', () => {
		it('should show updated display name trimmed to 50 chars', async () => {
			const dl = generateDistributionList();
			const newDisplayName = faker.string.alpha(51);
			registerDistributionListActionHandler({});
			const { result } = setupHook(useUpdateDistributionList, { initialProps: [dl] });
			result.current({ email: dl.email, displayName: newDisplayName });
			expect(
				await screen.findByText(
					`"${newDisplayName.substring(0, 50)}..." distribution list edits saved successfully`
				)
			).toBeVisible();
		});

		it.each([49, 50])(
			'should show updated display name entirely if shorter or equal to 50 chars (%d)',
			async (length) => {
				const dl = generateDistributionList();
				const newDisplayName = faker.string.alpha(length);
				registerDistributionListActionHandler({});
				const { result } = setupHook(useUpdateDistributionList, { initialProps: [dl] });
				result.current({ email: dl.email, displayName: newDisplayName });
				expect(
					await screen.findByText(`"${newDisplayName}" distribution list edits saved successfully`)
				).toBeVisible();
			}
		);

		it.each(['', undefined])('should show email if display name is %s', async (displayName) => {
			const dl: DistributionList = generateDistributionList();
			dl.displayName = displayName;
			registerDistributionListActionHandler({});
			const { result } = setupHook(useUpdateDistributionList, { initialProps: [dl] });
			result.current({ email: dl.email, members: { members: [faker.internet.email()], total: 1 } });
			expect(
				await screen.findByText(`"${dl.email}" distribution list edits saved successfully`)
			).toBeVisible();
		});
	});
});
