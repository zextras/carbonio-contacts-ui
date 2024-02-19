/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { faker } from '@faker-js/faker';
import * as shell from '@zextras/carbonio-shell-ui';
import { times } from 'lodash';

import { useActionSendEmail } from './send-email';
import { UIAction } from './types';
import { setupHook } from '../carbonio-ui-commons/test/test-setup';

describe('useActionSendEmail', () => {
	it('should return an action with the specific data', () => {
		const { result } = setupHook(useActionSendEmail);
		expect(result.current).toEqual<UIAction<unknown, unknown>>(
			expect.objectContaining({
				icon: 'EmailOutline',
				label: 'Send e-mail',
				id: 'send-email-action',
				canExecute: expect.anything(),
				execute: expect.anything()
			})
		);
	});

	it('should return an action which is executable if the integrated function is available', () => {
		jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([jest.fn(), true]);
		const { result } = setupHook(useActionSendEmail);
		expect(result.current.canExecute()).toBeTruthy();
	});

	it('should return an action which is not executable if the integrated function is not available', () => {
		jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([jest.fn(), false]);
		const { result } = setupHook(useActionSendEmail);
		expect(result.current.canExecute()).toBeFalsy();
	});

	it('should call the integrated function with the fields properly set for one single email address', () => {
		const email = faker.internet.email();
		const openComposer = jest.fn();
		jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openComposer, true]);
		const { result } = setupHook(useActionSendEmail);
		result.current.execute([email]);
		expect(openComposer).toBeCalledWith({
			recipients: [
				{
					type: 't',
					email,
					address: email,
					isGroup: false
				}
			]
		});
	});

	it('should call the integrated function with the fields properly set for one single recipient', () => {
		const recipient = {
			email: faker.internet.email(),
			isGroup: false
		};
		const openComposer = jest.fn();
		jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openComposer, true]);
		const { result } = setupHook(useActionSendEmail);
		result.current.execute([recipient]);
		expect(openComposer).toBeCalledWith({
			recipients: [
				{
					type: 't',
					email: recipient.email,
					address: recipient.email,
					isGroup: recipient.isGroup
				}
			]
		});
	});

	it('should call the integrated function with the fields properly set for multiple single email addresses', () => {
		const emails = times(12, () => faker.internet.email());
		const openComposer = jest.fn();
		jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openComposer, true]);
		const { result } = setupHook(useActionSendEmail);
		result.current.execute(emails);
		expect(openComposer).toBeCalledWith({
			recipients: emails.map((email) => ({
				type: 't',
				email,
				address: email,
				isGroup: false
			}))
		});
	});

	it('should call the integrated function with the fields properly set for multiple recipient', () => {
		const recipients = times(42, (index) => ({
			email: faker.internet.email(),
			isGroup: index % 2 === 0
		}));
		const openComposer = jest.fn();
		jest.spyOn(shell, 'useIntegratedFunction').mockReturnValue([openComposer, true]);
		const { result } = setupHook(useActionSendEmail);
		result.current.execute(recipients);
		expect(openComposer).toBeCalledWith({
			recipients: recipients.map((recipient) => ({
				type: 't',
				email: recipient.email,
				address: recipient.email,
				isGroup: recipient.isGroup
			}))
		});
	});
});
