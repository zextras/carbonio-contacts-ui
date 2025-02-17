/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type Action as DSAction } from '@zextras/carbonio-design-system';

import { useActionDeleteContactGroup } from './delete-contact-group';
import { useActionEditCG } from '../../../actions/edit-cg';
import { useActionSendEmailCG } from '../../../actions/send-email-cg';
import { UIAction } from '../../../actions/types';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { getFolderIdParts } from '../../../carbonio-ui-commons/helpers/folders';
import { ContactGroup } from '../../../model/contact-group';
import { getFolderFromContactGroup } from '../utils';

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
		const folder = getFolderFromContactGroup(contactGroup);
		const folderPartsId = getFolderIdParts(contactGroup.parent).id;
		const isMainAccount = !folder?.perm;
		if (isMainAccount) {
			if (folderPartsId === FOLDERS.TRASH) {
				return evaluateContactGroupActions<ContactGroup>(contactGroup, [deleteCGAction]);
			}
			return evaluateContactGroupActions<ContactGroup>(contactGroup, [
				sendEmailAction,
				editCGAction,
				deleteCGAction
			]);
		}
		if (folder?.perm?.includes('w')) {
			if (folderPartsId === FOLDERS.TRASH) {
				return evaluateContactGroupActions<ContactGroup>(contactGroup, [deleteCGAction]);
			}
			return evaluateContactGroupActions<ContactGroup>(contactGroup, [
				sendEmailAction,
				editCGAction,
				deleteCGAction
			]);
		}

		return evaluateContactGroupActions<ContactGroup>(contactGroup, [sendEmailAction]);
	};
};
