/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as shell from '@zextras/carbonio-shell-ui';

import { useGetContactGroupFromBoardId } from './use-get-contact-group-from-board-id';
import { setupHook } from '@test-setup';
import { addContactsToStore } from '../legacy/store/contacts';
import { buildContactGroup } from '../tests/model-builder';

function spyMockUseBoard(contactGroupId: string, folderId: string): void {
	jest.spyOn(shell, 'useBoard').mockReturnValue({
		context: { contactGroupId, folderId },
		id: '',
		boardViewId: '',
		app: '',
		icon: '',
		title: ''
	});
}

describe('Use get contact group from board id', () => {
	const folderId = '1';
	const contactGroup = buildContactGroup();
	beforeEach(() => {
		addContactsToStore([contactGroup]);
	});

	it('should return the contact group if is in the store', () => {
		spyMockUseBoard(contactGroup.id, folderId);

		const { result } = setupHook(useGetContactGroupFromBoardId);

		expect(result.current).toEqual(contactGroup);
	});

	it('should return undefined when requesting a contact that is not stored in an existing folder', () => {
		spyMockUseBoard('non-existing-contact-group-id', folderId);

		const { result } = setupHook(useGetContactGroupFromBoardId);

		expect(result.current).toBeUndefined();
	});
});
