/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useMemo } from 'react';

import { Action } from '@zextras/carbonio-design-system';

import { useActionCreateAddressBook } from '../../../../actions/create-address-book';
import { useActionDeleteAddressBook } from '../../../../actions/delete-address-book';
import { useActionEditAddressBook } from '../../../../actions/edit-address-book';
import { useActionEmptyAddressBook } from '../../../../actions/empty-address-book';
import { useActionEmptyTrash } from '../../../../actions/empty-trash';
import { useActionExportAddressBook } from '../../../../actions/export-address-book';
import { useActionImportContacts } from '../../../../actions/import-contacts';
import { useActionMoveAddressBook } from '../../../../actions/move-address-book';
import { useActionRemoveAddressBookLink } from '../../../../actions/remove-address-book-link';
import { useActionShowShareInfo } from '../../../../actions/show-share-info';
import { useActionTrashAddressBook } from '../../../../actions/trash-address-book';
import { UIAction } from '../../../../actions/types';
import { Folder } from '../../../../carbonio-ui-commons/types/folder';

const generateMenuAction = <T extends UIAction<EP, never>, EP>(
	uiAction: T,
	executionParams: EP
): Action =>
	({
		id: uiAction.id,
		icon: uiAction.icon,
		label: uiAction.label,
		onClick: (e): void => {
			e.stopPropagation();
			uiAction.execute(executionParams);
		}
	}) satisfies Action;

export const useAddressBookContextualMenuItems = (addressBook: Folder): Array<Action> => {
	const createAction = useActionCreateAddressBook();
	const moveAction = useActionMoveAddressBook();
	const editAction = useActionEditAddressBook();
	const deleteAction = useActionDeleteAddressBook();
	const trashAction = useActionTrashAddressBook();
	const emptyAddressBookAction = useActionEmptyAddressBook();
	const emptyTrashAction = useActionEmptyTrash();
	const exportAction = useActionExportAddressBook();
	const importAction = useActionImportContacts();
	const shareInfoAction = useActionShowShareInfo();
	const removeLinkAction = useActionRemoveAddressBookLink();

	return useMemo(() => {
		const result: Array<Action> = [];

		createAction.canExecute(addressBook) &&
			result.push(generateMenuAction(createAction, addressBook));
		moveAction.canExecute({ addressBook }) &&
			result.push(generateMenuAction(moveAction, { addressBook }));
		emptyAddressBookAction.canExecute(addressBook) &&
			result.push(generateMenuAction(emptyAddressBookAction, addressBook));
		emptyTrashAction.canExecute(addressBook) &&
			result.push(generateMenuAction(emptyTrashAction, addressBook));
		editAction.canExecute(addressBook) && result.push(generateMenuAction(editAction, addressBook));
		deleteAction.canExecute(addressBook) &&
			result.push(generateMenuAction(deleteAction, addressBook));
		trashAction.canExecute(addressBook) &&
			result.push(generateMenuAction(trashAction, addressBook));
		exportAction.canExecute(addressBook) &&
			result.push(generateMenuAction(exportAction, addressBook));
		importAction.canExecute(addressBook) &&
			result.push(generateMenuAction(importAction, addressBook));
		shareInfoAction.canExecute(addressBook) &&
			result.push(generateMenuAction(shareInfoAction, addressBook));
		removeLinkAction.canExecute(addressBook) &&
			result.push(generateMenuAction(removeLinkAction, addressBook));

		return result;
	}, [
		addressBook,
		createAction,
		deleteAction,
		editAction,
		emptyAddressBookAction,
		emptyTrashAction,
		exportAction,
		importAction,
		moveAction,
		removeLinkAction,
		shareInfoAction,
		trashAction
	]);
};
