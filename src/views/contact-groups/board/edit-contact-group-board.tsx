/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo, useState } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { difference, xor } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useGetContactGroup } from '../../../hooks/use-get-contact-group';
import { ContactGroup } from '../../../model/contact-group';
import { apiClient } from '../../../network/api-client';
import { useContactGroupStore } from '../../../store/contact-groups';
import CommonContactGroupBoard, {
	isContactGroupNameInvalid
} from '../../board/common-contact-group-board';

const InnerEditContactGroupBoard = ({
	contactGroup
}: {
	contactGroup: ContactGroup;
}): React.JSX.Element => {
	const [t] = useTranslation();

	const createSnackbar = useSnackbar();
	const [nameValue, setNameValue] = useState(contactGroup.title);

	const [memberListEmails, setMemberListEmails] = useState<string[]>(contactGroup.members);

	const onSave = useCallback(() => {
		const addedMembers = difference(memberListEmails, contactGroup.members);
		const removedMembers = difference(contactGroup.members, memberListEmails);

		apiClient
			.modifyContactGroup({
				id: contactGroup.id,
				addedMembers: addedMembers.length > 0 ? addedMembers : undefined,
				removedMembers: removedMembers.length > 0 ? removedMembers : undefined,
				name: contactGroup.title !== nameValue ? nameValue : undefined
			})
			.then((contactGroup: ContactGroup) => {
				useContactGroupStore.getState().updateContactGroup(contactGroup);
				createSnackbar({
					key: new Date().toLocaleString(),
					type: 'success',
					label: t(
						'board.editContactGroup.snackbar.contact_group_edited',
						'Group successfully updated'
					)
				});
			})
			.catch(() => {
				createSnackbar({
					key: new Date().toLocaleString(),
					type: 'error',
					label: t(
						'board.editContactGroup.snackbar.error',
						'Something went wrong saving the edits, try again'
					)
				});
			});
	}, [
		contactGroup.id,
		contactGroup.members,
		contactGroup.title,
		createSnackbar,
		memberListEmails,
		nameValue,
		t
	]);

	const isOnSaveDisabled = useMemo(
		() =>
			isContactGroupNameInvalid(nameValue) ||
			(xor(memberListEmails, contactGroup.members).length === 0 &&
				contactGroup.title === nameValue),
		[contactGroup.members, contactGroup.title, memberListEmails, nameValue]
	);

	return (
		<CommonContactGroupBoard
			onSave={onSave}
			nameValue={nameValue}
			memberListEmails={memberListEmails}
			isOnSaveDisabled={isOnSaveDisabled}
			setMemberListEmails={setMemberListEmails}
			initialNameValue={contactGroup.title}
			initialMemberListEmails={contactGroup.members}
			setNameValue={setNameValue}
		/>
	);
};

const EditContactGroupBoard = (): React.JSX.Element | null => {
	const contactGroup = useGetContactGroup();
	return contactGroup ? <InnerEditContactGroupBoard contactGroup={contactGroup} /> : null;
};

export default EditContactGroupBoard;
