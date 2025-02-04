/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';

import { getFolderFromContactGroup } from './utils';
import { ContactGroup } from '../../model/contact-group';

export const CONTACT_GROUPS_PATH = 'contact-groups';
export function useRedirectToContactGroup(): (contactGroup: ContactGroup) => void {
	const replaceHistory = useReplaceHistoryCallback();
	return (contactGroup: ContactGroup) => {
		const folder = getFolderFromContactGroup(contactGroup);
		folder && replaceHistory(`/folder/${folder.id}/${CONTACT_GROUPS_PATH}/${contactGroup.id}`);
	};
}

export function useRedirectToContactGroupFolder(): (contactGroup: ContactGroup) => void {
	const replaceHistory = useReplaceHistoryCallback();
	return (contactGroup: ContactGroup) => {
		const folder = getFolderFromContactGroup(contactGroup);
		folder && replaceHistory(`/folder/${folder.id}`);
	};
}
