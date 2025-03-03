/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { setupHook } from '../../../../carbonio-ui-commons/test/test-setup';
import { buildContact } from '../../../../tests/model-builder';
import { useContactActions } from '../contact-preview-actions';

describe('Contact Preview Actions', () => {
	it('should return [send, tag, edit, move, delete] actions in this order', () => {
		const contact = buildContact();

		const { result } = setupHook(useContactActions, {
			initialProps: [contact]
		});

		const actions = result.current;
		expect(actions[0].id).toBe('send');
		expect(actions[1].id).toBe('tag');
		expect(actions[2].id).toBe('edit');
		expect(actions[3].id).toBe('move');
		expect(actions[4].id).toBe('delete');
	});
});
