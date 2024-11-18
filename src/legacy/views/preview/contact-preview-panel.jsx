/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { Divider } from '@zextras/carbonio-design-system';
import { getAction, replaceHistory } from '@zextras/carbonio-shell-ui';
import { head, includes, split } from 'lodash';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import ContactPreviewContent from './contact-preview-content';
import ContactPreviewHeader from './contact-preview-header';
import { useActionDeleteContacts } from '../../../actions/delete-contacts';
import { useActionMoveContacts } from '../../../actions/move-contacts';
import { useActionTrashContacts } from '../../../actions/trash-contacts';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { getFolderIdParts } from '../../../carbonio-ui-commons/helpers/folders';
import { useAppSelector } from '../../hooks/redux';
import { useDisplayName } from '../../hooks/use-display-name';
import { selectContact } from '../../store/selectors/contacts';

export default function ContactPreviewPanel() {
	const urlLocation = useLocation();
	const history = useHistory();
	const { pathname } = useLocation();
	const { folderId, contactId } = useParams();
	const contactInternalId = contactId;
	const contact = useAppSelector((state) => selectContact(state, folderId, contactInternalId));
	const contactsMoveAction = useActionMoveContacts();
	const deleteAction = useActionDeleteContacts();
	const trashAction = useActionTrashContacts();

	const onEdit = useCallback(
		() => replaceHistory(`/folder/${folderId}/edit/${contactInternalId}`),
		[contactInternalId, folderId]
	);

	const onClose = useCallback(() => {
		includes(urlLocation?.pathname, 'search')
			? history.push(head(split(pathname, '/folder')))
			: replaceHistory(`/folder/${folderId}`);
	}, [folderId, history, pathname, urlLocation?.pathname]);

	const onDelete = useCallback(() => {
		replaceHistory(`/folder/${folderId}/contacts/${contact.id}`);
		if (getFolderIdParts(folderId).id === FOLDERS.TRASH) {
			deleteAction.execute([contact]);
		} else trashAction.execute([contact]);
	}, [folderId, contact, trashAction, deleteAction]);

	const onPrint = useCallback(() => null, []);
	const onArchieve = useCallback(() => null, []);
	const onMail = useCallback(() => {
		const [mailTo, available] = getAction('contact-list', 'mail-to', [contact]);
		if (available) {
			mailTo.execute(contact);
		}
	}, [contact]);

	const onMove = useCallback(() => {
		contactsMoveAction.execute({ contacts: [contact] });
	}, [contact, contactsMoveAction]);

	const displayName = useDisplayName(contact);

	if (contact && displayName) {
		return (
			<>
				<ContactPreviewHeader
					displayName={displayName}
					onClose={onClose}
					onEdit={onEdit}
					onDelete={onDelete}
					onMove={onMove}
				/>
				<ContactPreviewContent
					contact={contact}
					onEdit={onEdit}
					onDelete={onDelete}
					onPrint={onPrint}
					onArchieve={onArchieve}
					onMail={onMail}
					onMove={onMove}
				/>

				<Divider />
			</>
		);
	}
	return null;
}
