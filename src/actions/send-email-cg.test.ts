/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import * as shell from '@zextras/carbonio-shell-ui';

import { useActionSendEmailCG } from './send-email-cg';
import { UIAction } from './types';
import { setupHook } from '../carbonio-ui-commons/test/test-setup';
import { buildContactGroup, buildMembers } from '../tests/model-builder';

describe('useActionSendEmailCG', () => {
	const membersCount = faker.number.int({ min: 1, max: 42 });
	const contactGroupWithMembers = buildContactGroup({ members: buildMembers(membersCount) });
	const contactGroupNoMembers = { ...contactGroupWithMembers, members: [] };

	it('should return an action with the specific data', () => {
		const { result } = setupHook(useActionSendEmailCG);
		expect(result.current).toEqual<UIAction<unknown, unknown>>(
			expect.objectContaining({
				icon: 'EmailOutline',
				label: 'Send e-mail',
				id: 'cg-send-email-action',
				canExecute: expect.anything(),
				execute: expect.anything()
			})
		);
	});

	it('should return an action which is executable if the given CG has members', () => {
		jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([jest.fn(), true]);
		const { result } = setupHook(useActionSendEmailCG);
		expect(result.current.canExecute(contactGroupWithMembers)).toBeTruthy();
	});

	it('should return an action which is not executable if the given CG has no members', () => {
		jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([jest.fn(), true]);
		const { result } = setupHook(useActionSendEmailCG);
		expect(result.current.canExecute(contactGroupNoMembers)).toBeFalsy();
	});

	it('should not call the Mails integrated function if execute function is invoked passing a CG without members', () => {
		const openComposer = jest.fn();
		jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openComposer, true]);
		const { result } = setupHook(useActionSendEmailCG);
		result.current.execute(contactGroupNoMembers);
		expect(openComposer).not.toHaveBeenCalled();
	});

	it('should call the Mails integrated function if execute function is invoked passing a CG with members', () => {
		const openComposer = jest.fn();
		jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openComposer, true]);
		const { result } = setupHook(useActionSendEmailCG);
		result.current.execute(contactGroupWithMembers);
		expect(openComposer).toBeCalledWith({
			recipients: contactGroupWithMembers.members.map((member) =>
				expect.objectContaining({ email: member })
			)
		});
	});
});
