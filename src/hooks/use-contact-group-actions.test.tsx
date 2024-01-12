/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { faker } from '@faker-js/faker';

import { useContactGroupActions } from './use-contact-group-actions';
import { setupHook } from '../carbonio-ui-commons/test/test-setup';
import { buildContactGroup, buildMembers } from '../tests/model-builder';

describe('useContactGroupActions', () => {
	it('should return send mail action when the contact group has at least 1 member', () => {
		const contactGroup = buildContactGroup({
			members: buildMembers(faker.number.int({ min: 1, max: 100 }))
		});
		const { result } = setupHook(useContactGroupActions, { initialProps: [contactGroup] });

		expect(result.current).toContainEqual({
			id: 'send-email',
			label: 'Send e-mail',
			icon: 'EmailOutline',
			onClick: expect.anything()
		});
	});

	it('should not return send mail action when the contact group has 0 members', () => {
		const contactGroup = buildContactGroup();
		const { result } = setupHook(useContactGroupActions, { initialProps: [contactGroup] });
		expect(result.current).not.toContainEqual({
			id: 'send-email',
			label: 'Send e-mail',
			icon: 'EmailOutline',
			onClick: expect.anything()
		});
	});

	it('should return delete action', () => {
		const contactGroup = buildContactGroup();
		const { result } = setupHook(useContactGroupActions, { initialProps: [contactGroup] });

		expect(result.current).toContainEqual({
			id: 'delete-contact-group',
			label: 'Delete',
			icon: 'People2Outline',
			onClick: expect.anything()
		});
	});
});
