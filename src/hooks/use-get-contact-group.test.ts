/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import * as shell from '@zextras/carbonio-shell-ui';
import { first, times } from 'lodash';

import { useGetContactGroupFromBoardId } from './use-get-contact-group-from-board-id';
import { setupHook } from '../carbonio-ui-commons/test/test-setup';
import { compareContactGroupName, useContactGroupStore } from '../store/contact-groups';
import { buildContactGroup } from '../tests/model-builder';

function spyUseBoard(contactGroupId?: string): void {
	jest.spyOn(shell, 'useBoard').mockReturnValue({
		context: { contactGroupId },
		id: '',
		boardViewId: '',
		app: '',
		icon: '',
		title: ''
	});
}

describe('Use get contact group hook', () => {
	it('should return the contact group if is in the ordered', () => {
		const list = times(20, () => buildContactGroup());
		list.sort((a, b) => compareContactGroupName(a.title, b.title));
		useContactGroupStore.getState().addContactGroups(list);

		const firstCg = first(list);
		spyUseBoard(firstCg?.id);
		const { result } = setupHook(useGetContactGroupFromBoardId);

		expect(result.current).toEqual(firstCg);
	});

	it('should return the contact group if it is in the unordered', () => {
		const list = times(20, () => buildContactGroup());
		list.sort((a, b) => compareContactGroupName(a.title, b.title));

		const last = list.splice(list.length - 1, 1)[0];
		useContactGroupStore.getState().addContactGroups(list);
		useContactGroupStore.getState().addContactGroupInSortedPosition(last);
		spyUseBoard(last.id);
		const { result } = setupHook(useGetContactGroupFromBoardId);

		expect(result.current).toEqual(last);
	});

	it('should return undefined if the contact group is not stored', () => {
		const contactGroup = buildContactGroup();

		spyUseBoard(contactGroup.id);
		const { result } = setupHook(useGetContactGroupFromBoardId);

		expect(result.current).toBeUndefined();
	});
});
