/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';

import { useActionDeleteCG } from './delete-cg';
import { UIAction } from './types';
import { screen, setupHook } from '../carbonio-ui-commons/test/test-setup';
import { TESTID_SELECTORS, TIMERS } from '../constants/tests';
import { buildContactGroup, buildMembers } from '../tests/model-builder';

describe('useActionDeleteCG', () => {
	const membersCount = faker.number.int({ min: 1, max: 42 });
	const contactGroupWithMembers = buildContactGroup({ members: buildMembers(membersCount) });
	const contactGroupNoMembers = { ...contactGroupWithMembers, members: [] };

	it('should return an action with the specific data', () => {
		const { result } = setupHook(useActionDeleteCG);
		expect(result.current).toEqual<UIAction<unknown, unknown>>(
			expect.objectContaining({
				icon: 'Trash2Outline',
				label: 'Delete',
				id: 'cg-delete-action',
				canExecute: expect.anything(),
				execute: expect.anything()
			})
		);
	});

	it('should return an action which is always executable', () => {
		const { result } = setupHook(useActionDeleteCG);
		expect(result.current.canExecute()).toBeTruthy();
	});

	it('should return an execute field which opens a modal with the CG name', async () => {
		const { result } = setupHook(useActionDeleteCG);
		const action = result.current;
		act(() => {
			action.execute(contactGroupWithMembers);
		});

		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		const title = `Delete "${contactGroupWithMembers.title}"`;
		expect(await screen.findByText(title)).toBeVisible();
	});

	it('should return an execute field which opens a modal with an instruction text', async () => {
		const { result } = setupHook(useActionDeleteCG);
		const action = result.current;
		act(() => {
			action.execute(contactGroupWithMembers);
		});

		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		expect(
			await screen.findByText('Are you sure to delete the selected contact group?')
		).toBeVisible();
		expect(screen.getByText('If you delete it will be lost forever.')).toBeVisible();
	});

	it('should return an execute field which opens a modal with a close icon', async () => {
		const { result } = setupHook(useActionDeleteCG);
		const action = result.current;
		act(() => {
			action.execute(contactGroupWithMembers);
		});

		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		const closeIcon = await screen.findByRoleWithIcon('button', {
			icon: TESTID_SELECTORS.icons.close
		});
		expect(closeIcon).toBeVisible();
		expect(closeIcon).toBeEnabled();
	});

	it('should return an execute field which opens a modal with a cancel action button', async () => {
		const { result } = setupHook(useActionDeleteCG);
		const action = result.current;
		act(() => {
			action.execute(contactGroupWithMembers);
		});

		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		const button = await screen.findByRole('button', { name: 'cancel' });
		expect(button).toBeVisible();
		expect(button).toBeEnabled();
	});

	it('should return an execute field which opens a modal with a delete action button', async () => {
		const { result } = setupHook(useActionDeleteCG);
		const action = result.current;
		act(() => {
			action.execute(contactGroupWithMembers);
		});

		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		const button = await screen.findByRole('button', { name: 'delete' });
		expect(button).toBeVisible();
		expect(button).toBeEnabled();
	});

	it('should close the UI if the user clicks on the close icon on the header', async () => {
		const { result, user } = setupHook(useActionDeleteCG);
		const action = result.current;
		act(() => {
			action.execute(contactGroupWithMembers);
		});

		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		const button = await screen.findByRoleWithIcon('button', {
			icon: TESTID_SELECTORS.icons.close
		});
		await user.click(button);
		const title = `Delete "${contactGroupWithMembers.title}"`;
		expect(screen.queryByText(title)).not.toBeInTheDocument();
	});

	it('should close the UI if the user clicks on the cancel action button', async () => {
		const { result, user } = setupHook(useActionDeleteCG);
		const action = result.current;
		act(() => {
			action.execute(contactGroupWithMembers);
		});

		act(() => {
			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		const button = await screen.findByRole('button', {
			name: 'cancel'
		});
		await user.click(button);
		const title = `Delete "${contactGroupWithMembers.title}"`;
		expect(screen.queryByText(title)).not.toBeInTheDocument();
	});

	it.todo(
		'should call the API if the user clicks on the delete action button'
		// 	, async () => {
		// 	{
		// 		const { result, user } = setupHook(useActionDeleteCG);
		// 		const action = result.current;
		// 		act(() => {
		// 			action.execute(contactGroupWithMembers);
		// 		});
		//
		// 		act(() => {
		// 			jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		// 		});
		//
		// 		const button = await screen.findByRole('button', {
		// 			name: 'delete'
		// 		});
		// 		await user.click(button);
		// 		// const title = `Delete "${contactGroupWithMembers.title}"`;
		// 		// expect(screen.queryByText(title)).not.toBeInTheDocument();
		// 	}
		// }
	);

	it(
		'should close the modal if the user clicks on the delete action button'
		// , async () => {
		// const { result, user } = setupHook(useActionDeleteCG);
		// const action = result.current;
		// act(() => {
		// 	action.execute(contactGroupWithMembers);
		// });
		//
		// act(() => {
		// 	jest.advanceTimersByTime(TIMERS.modal.delayOpen);
		// });
		//
		// const button = await screen.findByRole('button', {
		// 	name: 'cancel'
		// });
		// await user.click(button);
		// const title = `Delete "${contactGroupWithMembers.title}"`;
		// expect(screen.queryByText(title)).not.toBeInTheDocument();
		// }
	);

	it.todo(
		'should show a success snackbar if the user clicks on the delete action button and the process completes successfully'
	);

	it.todo(
		'should show an error snackbar if the user clicks on the delete action button and the process completes successfully'
	);
});
