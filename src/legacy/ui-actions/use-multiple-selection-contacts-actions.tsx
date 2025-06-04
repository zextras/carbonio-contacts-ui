/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { type Action as DSAction } from '@zextras/carbonio-design-system';
import { FOLDERS, getFolderIdParts, useTags } from '@zextras/carbonio-ui-commons';
import { useTranslation } from 'react-i18next';

import { applyMultiTag } from './tag-actions';
import { useDeleteContacts } from '../../actions/common-contacts-actions/use-delete-contacts';
import { useTrashContacts } from '../../actions/common-contacts-actions/use-trash-contacts';
import { ContactOrGroup } from '../types/contact';

type SecondaryActionsProps = {
	folderId: string;
	deselectAll: () => void;
	selectedContacts: Array<ContactOrGroup>;
	ids: Array<string>;
};
export const useMultipleSelectionContactsActions = ({
	folderId,
	deselectAll,
	selectedContacts,
	ids
}: SecondaryActionsProps): Array<DSAction> => {
	const [t] = useTranslation();
	const tags = useTags();
	const deleteAction = useDeleteContacts(selectedContacts);
	const trashAction = useTrashContacts(selectedContacts);
	const tagAction = applyMultiTag({
		t,
		tags,
		ids,
		itemsToTag: selectedContacts,
		deselectAll,
		folderId
	});
	if (getFolderIdParts(folderId).id === FOLDERS.TRASH) {
		return [deleteAction, tagAction];
	}
	return [trashAction, tagAction];
};
