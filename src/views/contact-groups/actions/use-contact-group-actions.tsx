/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type Action as DSAction } from '@zextras/carbonio-design-system';

import { useActionEditCG } from '../../../actions/edit-cg';
import { useActionSendEmailCG } from '../../../actions/send-email-cg';
import { UIAction } from '../../../actions/types';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { getFolderIdParts } from '../../../carbonio-ui-commons/helpers/folders';
import { getFolder } from '../../../carbonio-ui-commons/store/zustand/folder';
import { ContactGroup } from '../../../model/contact-group';
import { useActionDeleteContactGroup } from '../api/delete-contact-group';

function evaluateContactGroupActions<T extends ContactGroup>(
	contactGroup: T,
	actions: Array<UIAction<T, T>>
): DSAction[] {
	const orderedActions: DSAction[] = [];
	actions.forEach((action) => {
		if (action.canExecute(contactGroup)) {
			orderedActions.push({
				id: action.id,
				label: action.label,
				onClick: () => {
					action.execute(contactGroup);
				},
				icon: action.icon,
				color: action.color
			});
		}
	});
	return orderedActions;
}

export const useContactGroupActions = (): ((contactGroup: ContactGroup) => DSAction[]) => {
	const deleteCGAction = useActionDeleteContactGroup();
	const editCGAction = useActionEditCG();
	const sendEmailAction = useActionSendEmailCG();
	return (contactGroup: ContactGroup): DSAction[] => {
		const folder = getFolder(contactGroup.folderId);
		const folderPartsId = getFolderIdParts(contactGroup.folderId).id;

		if (folder?.perm?.includes('w')) {
			const actions: Array<UIAction<ContactGroup, ContactGroup>> = [deleteCGAction];
			if (folderPartsId !== FOLDERS.TRASH) {
				actions.push(editCGAction, sendEmailAction);
			}
			return evaluateContactGroupActions<ContactGroup>(contactGroup, actions);
		}

		return evaluateContactGroupActions<ContactGroup>(contactGroup, [sendEmailAction]);
	};
};
