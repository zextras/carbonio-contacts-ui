/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import { act } from '@testing-library/react';

import {
	DELETE_PERMANENTLY_ACTION_DESCRIPTOR,
	VITEST_MOCKED_ERROR,
	TESTID_SELECTORS,
	TIMERS
} from '../../../../constants/tests';
import { addContactsToStore } from '../../../../legacy/store/contacts';
import { ContactOrGroup } from '../../../../legacy/types/contact';
import { buildContactGroup, buildMembers } from '../../../../tests/model-builder';
import { registerDeleteContactHandler } from '../../../../tests/msw-handlers/delete-contact';
import { useContactGroupDeleteAction } from '../use-contact-group-delete-action';
import { screen, setupHook } from '@test-setup';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createStoreInitialData(data: Record<string, ContactOrGroup[]>) {
	return {
		contacts: {
			contacts: data,
			status: {},
			searchedInFolder: {}
		}
	};
}

async function findDeletePermanentlyButton(): Promise<any> {
	return screen.findByRole('button', {
		name: /delete permanently/i
	});
}

describe('useContactGroupDeleteAction', () => {
	const membersCount = faker.number.int({ min: 1, max: 42 });
	const contactGroupWithMembers = buildContactGroup({ members: buildMembers(membersCount) });
	const contactGroupNoMembers = { ...contactGroupWithMembers, members: [] };

	it('should return an action with the specific data', () => {
		const { result } = setupHook(useContactGroupDeleteAction, {
			initialProps: [contactGroupWithMembers]
		});
		expect(result.current).toEqual(
			expect.objectContaining({
				icon: DELETE_PERMANENTLY_ACTION_DESCRIPTOR.icon,
				label: DELETE_PERMANENTLY_ACTION_DESCRIPTOR.label,
				id: DELETE_PERMANENTLY_ACTION_DESCRIPTOR.id,
				onClick: expect.anything(),
				color: 'error'
			})
		);
	});

	it('should return an execute field which opens a modal with the CG name', async () => {
		const { result } = setupHook(useContactGroupDeleteAction, {
			initialProps: [contactGroupWithMembers]
		});
		const action = result.current;
		act(() => {
			action.onClick();
		});

		act(() => {
			vi.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		const title = `Delete "${contactGroupWithMembers.title}"`;
		expect(await screen.findByText(title)).toBeVisible();
	});

	it('should return an execute field which opens a modal with an instruction text', async () => {
		const { result } = setupHook(useContactGroupDeleteAction, {
			initialProps: [contactGroupWithMembers]
		});
		const action = result.current;
		act(() => {
			action.onClick();
		});

		act(() => {
			vi.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		expect(
			await screen.findByText('Are you sure to delete the selected contact group?')
		).toBeVisible();
	});

	it('should return an execute field which opens a modal with a close icon', async () => {
		const { result } = setupHook(useContactGroupDeleteAction, {
			initialProps: [contactGroupWithMembers]
		});
		const action = result.current;
		act(() => {
			action.onClick();
		});

		act(() => {
			vi.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		const closeIcon = await screen.findByRoleWithIcon('button', {
			icon: TESTID_SELECTORS.icons.close
		});
		expect(closeIcon).toBeVisible();
		expect(closeIcon).toBeEnabled();
	});

	it('should return an execute field which opens a modal with a delete action button', async () => {
		const { result } = setupHook(useContactGroupDeleteAction, {
			initialProps: [contactGroupWithMembers]
		});
		const action = result.current;
		act(() => {
			action.onClick();
		});

		act(() => {
			vi.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		const button = await findDeletePermanentlyButton();
		expect(button).toBeVisible();
		expect(button).toBeEnabled();
	});

	it('should close the UI if the user clicks on the close icon on the header', async () => {
		const { result, user } = setupHook(useContactGroupDeleteAction, {
			initialProps: [contactGroupWithMembers]
		});
		const action = result.current;
		act(() => {
			action.onClick();
		});

		act(() => {
			vi.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		const button = await screen.findByRoleWithIcon('button', {
			icon: TESTID_SELECTORS.icons.close
		});
		await user.click(button);
		const title = `Delete "${contactGroupWithMembers.title}"`;
		expect(screen.queryByText(title)).not.toBeInTheDocument();
	});

	it('should show a success snackbar if the user clicks on the delete action button and the process completes successfully', async () => {
		addContactsToStore([contactGroupWithMembers]);
		registerDeleteContactHandler(contactGroupWithMembers.id);

		const { result, user } = setupHook(useContactGroupDeleteAction, {
			initialProps: [contactGroupWithMembers]
		});

		const action = result.current;
		act(() => {
			action.onClick();
		});

		act(() => {
			vi.advanceTimersByTime(TIMERS.modal.delayOpen);
		});
		await screen.findByTestId('modal');

		await user.click(await findDeletePermanentlyButton());
		expect(await screen.findByText('Contact group successfully deleted')).toBeVisible();
	});

	it('should show an error snackbar if the user clicks on the delete action button and the API call return an error', async () => {
		registerDeleteContactHandler(contactGroupNoMembers.id, VITEST_MOCKED_ERROR);
		const { result, user } = setupHook(useContactGroupDeleteAction, {
			initialProps: [contactGroupWithMembers]
		});
		const action = result.current;
		act(() => {
			action.onClick();
		});

		act(() => {
			vi.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		await user.click(await findDeletePermanentlyButton());
		expect(await screen.findByText('Something went wrong, please try again')).toBeVisible();
	});

	it('should call the API if the user clicks on the delete action button', async () => {
		addContactsToStore([contactGroupWithMembers]);
		const handler = registerDeleteContactHandler(contactGroupWithMembers.id);

		const { result, user } = setupHook(useContactGroupDeleteAction, {
			initialProps: [contactGroupWithMembers]
		});
		const action = result.current;
		act(() => {
			action.onClick();
		});

		act(() => {
			vi.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		const titleElement = screen.getByText(`Delete "${contactGroupWithMembers.title}"`);
		expect(titleElement).toBeVisible();

		await user.click(await findDeletePermanentlyButton());
		await screen.findByText('Contact group successfully deleted');
		expect(handler).toHaveBeenCalled();
	});

	it('should close the modal if the user clicks on the delete action button', async () => {
		addContactsToStore([contactGroupWithMembers]);
		registerDeleteContactHandler(contactGroupWithMembers.id);

		const { result, user } = setupHook(useContactGroupDeleteAction, {
			initialProps: [contactGroupWithMembers]
		});

		const action = result.current;
		act(() => {
			action.onClick();
			vi.advanceTimersByTime(TIMERS.modal.delayOpen);
		});

		const titleElement = screen.getByText(`Delete "${contactGroupWithMembers.title}"`);

		await user.click(await findDeletePermanentlyButton());
		await screen.findByText('Contact group successfully deleted');
		expect(titleElement).not.toBeInTheDocument();
	});
});
