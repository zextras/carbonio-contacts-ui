/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';

import { ROUTES_INTERNAL_PARAMS } from '../../constants';
import { ContactGroup } from '../../model/contact-group';

export function useRedirectToContactGroup(): (contactGroup: ContactGroup) => void {
	const replaceHistory = useReplaceHistoryCallback();
	return (contactGroup: ContactGroup) =>
		replaceHistory(
			`/folder/${contactGroup.folderId}/${ROUTES_INTERNAL_PARAMS.route.contactGroups}/${contactGroup.id}`
		);
}

export function useRedirectToContactGroupFolder(): (folderId: string) => void {
	const replaceHistory = useReplaceHistoryCallback();
	return (folderId: string) =>
		replaceHistory(`/folder/${folderId}/${ROUTES_INTERNAL_PARAMS.route.contactGroups}`);
}
