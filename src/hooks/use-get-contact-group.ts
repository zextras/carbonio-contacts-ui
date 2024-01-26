/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useBoard } from '@zextras/carbonio-shell-ui';

import { ContactGroup } from '../model/contact-group';
import { useContactGroupStore } from '../store/contact-groups';

export const useGetContactGroup = (): ContactGroup | undefined => {
	const { context } = useBoard<{ contactGroupId: string }>();
	return useContactGroupStore.getState().getStoredContactGroup(context?.contactGroupId ?? '');
};
