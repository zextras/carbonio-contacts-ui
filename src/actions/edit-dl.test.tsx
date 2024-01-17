/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { act, waitForElementToBeRemoved } from '@testing-library/react';
import { times } from 'lodash';

import { useActionEditDL } from './edit-dl';
import { UIAction } from './types';
import { screen, setupHook } from '../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS, TIMERS } from '../constants/tests';
import {
	registerDistributionListActionHandler,
	registerGetDistributionListMembersHandler
} from '../tests/msw-handlers';
import { getDLContactInput } from '../tests/utils';

describe('useActionEditDL', () => {
	it('should return an object with the specific data', () => {
		const { result } = setupHook(useActionEditDL);
		expect(result.current).toEqual<UIAction<unknown, unknown>>(
			expect.objectContaining({
				icon: 'Settings2Outline',
				label: 'Edit distribution list',
				id: 'dl-edit-action'
			})
		);
	});

	it('should return an execute field which opens a UI with the dl info and members', async () => {
		const { result } = setupHook(useActionEditDL);
		const action = result.current;
		const dlEmail = 'dl-mail@domain.org';
		const dlDisplayName = 'Custom distribution list';
		const members = times(10, () => faker.internet.email());
		registerGetDistributionListMembersHandler(members);
		act(() => {
			action.execute({ email: dlEmail, displayName: dlDisplayName });
		});

		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		expect(await screen.findByText(dlEmail)).toBeVisible();
		expect(screen.getByText(`Edit "${dlDisplayName}"`)).toBeVisible();
		expect(screen.getAllByTestId(TESTID_SELECTORS.membersListItem)).toHaveLength(members.length);
	});

	it('should show the email in the title if the dl has no display name', async () => {
		const { result } = setupHook(useActionEditDL);
		const action = result.current;
		const dlEmail = 'dl-mail@domain.org';
		const members = times(10, () => faker.internet.email());
		registerGetDistributionListMembersHandler(members);
		act(() => {
			action.execute({ email: dlEmail });
		});

		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		expect(await screen.findByText(dlEmail)).toBeVisible();
		expect(screen.getByText(`Edit "${dlEmail}"`)).toBeVisible();
	});

	it('should close the edit view on save', async () => {
		const { result, user } = setupHook(useActionEditDL);
		const action = result.current;
		const dlEmail = 'dl-mail@domain.org';
		const dlDisplayName = 'Custom distribution list';
		const newMember = faker.internet.email();
		registerGetDistributionListMembersHandler([]);
		registerDistributionListActionHandler([newMember], []);
		act(() => {
			action.execute({ email: dlEmail, displayName: dlDisplayName });
		});

		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		expect(await screen.findByText(dlEmail)).toBeVisible();
		const contactInput = getDLContactInput();
		await act(async () => {
			await user.type(contactInput.textbox, `${newMember},`);
		});
		await user.click(contactInput.addMembersIcon);
		await screen.findByTestId(TESTID_SELECTORS.membersListItem);
		await user.click(screen.getByRole('button', { name: /save/i }));
		await waitForElementToBeRemoved(screen.queryByText(dlEmail));
		expect(screen.queryByText(dlDisplayName)).not.toBeInTheDocument();
	});

	it('should close the edit view on cancel', async () => {
		const { result, user } = setupHook(useActionEditDL);
		const action = result.current;
		const dlEmail = 'dl-mail@domain.org';
		const dlDisplayName = 'Custom distribution list';
		registerGetDistributionListMembersHandler([]);
		act(() => {
			action.execute({ email: dlEmail, displayName: dlDisplayName });
		});

		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		expect(await screen.findByText(dlEmail)).toBeVisible();
		await user.click(screen.getByRole('button', { name: /cancel/i }));
		expect(screen.queryByText(dlDisplayName)).not.toBeInTheDocument();
	});
});
