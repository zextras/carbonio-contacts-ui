/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';
import { times } from 'lodash';

import { UIAction, useActionEditDL } from './edit-dl';
import { screen, setupHook } from '../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS, TIMERS } from '../constants/tests';
import { generateStore } from '../legacy/tests/generators/store';
import { registerGetDistributionListMembersHandler } from '../tests/msw-handlers';

describe('useActionEditDL', () => {
	it('should return an object with the specif data', () => {
		const { result } = setupHook(useActionEditDL);
		expect(result.current).toEqual<UIAction<unknown>>({
			icon: 'Edit2Outline',
			label: 'Edit address list',
			id: 'dl-edit-action',
			execute: expect.anything()
		});
	});

	it('should return an execute field which opens a UI with the dl info and members', async () => {
		const store = generateStore();
		const { result } = setupHook(useActionEditDL, { store });
		const action = result.current;
		const dlEmail = 'dl-mail@domain.org';
		const dlDisplayName = 'Custom distribution list';
		const members = times(10, () => faker.internet.email());
		registerGetDistributionListMembersHandler(members);
		act(() => {
			action.execute({ email: dlEmail, displayName: dlDisplayName });
		});

		act(() => {
			jest.advanceTimersByTime(TIMERS.MODAL.DELAY_OPEN);
		});

		expect(await screen.findByText(dlEmail)).toBeVisible();
		expect(screen.getByText(`Edit "${dlDisplayName}"`)).toBeVisible();
		expect(screen.getAllByTestId(TESTID_SELECTORS.MEMBERS_LIST_ITEM)).toHaveLength(members.length);
	});
});
