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
	// TODO: if groups is in a mountpoint, folderId is mountpointId rather than folderId.
	// We should get the real folder id from the store.
	// We need to understand if it is correct to store the mountpointId as folderId or not

	return (contactGroup: ContactGroup) => {
		const folder = getFolderFromContactGroup(contactGroup);
		// we are forced to check that Folder is defined cause of type issues
		folder && replaceHistory(`/folder/${folder.id}/${CONTACT_GROUPS_PATH}/${contactGroup.id}`);
	};
}

export function useRedirectToContactGroupFolder(): (folderId: string) => void {
	const replaceHistory = useReplaceHistoryCallback();
	return (folderId: string) => replaceHistory(`/folder/${folderId}`);
}
