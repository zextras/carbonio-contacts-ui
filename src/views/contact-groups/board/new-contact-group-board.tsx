/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useState } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import { replaceHistory, useBoardHooks } from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { ROUTES_INTERNAL_PARAMS } from '../../../constants';
import { apiClient } from '../../../network/api-client';
import { useContactGroupStore } from '../../../store/contact-groups';
import CommonContactGroupBoard, {
	isContactGroupNameInvalid
} from '../../board/common-contact-group-board';

const NewContactGroupBoard = (): React.JSX.Element => {
	const [t] = useTranslation();
	const { pathname } = useLocation();
	const { closeBoard } = useBoardHooks();
	const createSnackbar = useSnackbar();

	const initialName = t('board.newContactGroup.name', 'New Group');
	const [nameValue, setNameValue] = useState(initialName);

	const [memberListEmails, setMemberListEmails] = useState<string[]>([]);

	const onSave = useCallback(() => {
		apiClient
			.createContactGroup(nameValue, memberListEmails)
			.then((contactGroup) => {
				if (pathname.includes(ROUTES_INTERNAL_PARAMS.route.contactGroups)) {
					useContactGroupStore.getState().addContactGroupInSortedPosition(contactGroup);
					const element = window.document.getElementById(contactGroup.id);
					if (element) {
						element.scrollIntoView({ block: 'end' });
					}
					replaceHistory(
						`${ROUTES_INTERNAL_PARAMS.route.contactGroups}/${FOLDERS.CONTACTS}/${contactGroup.id}`
					);
				} else {
					useContactGroupStore.getState().reset();
				}

				createSnackbar({
					key: new Date().toLocaleString(),
					severity: 'success',
					label: t(
						'board.newContactGroup.snackbar.contact_group_created',
						'Contact group successfully created'
					)
				});
				closeBoard();
			})
			.catch(() => {
				createSnackbar({
					key: new Date().toLocaleString(),
					severity: 'error',
					label: t('label.error_try_again', 'Something went wrong, please try again')
				});
			});
	}, [nameValue, memberListEmails, pathname, createSnackbar, t, closeBoard]);

	return (
		<CommonContactGroupBoard
			onSave={onSave}
			nameValue={nameValue}
			memberListEmails={memberListEmails}
			isOnSaveDisabled={isContactGroupNameInvalid(nameValue)}
			setMemberListEmails={setMemberListEmails}
			initialNameValue={initialName}
			initialMemberListEmails={[]}
			setNameValue={setNameValue}
		/>
	);
};

export default NewContactGroupBoard;
