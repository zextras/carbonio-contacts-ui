/* eslint-disable @typescript-eslint/no-use-before-define */
/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactNode, useCallback, useMemo } from 'react';

import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { head, includes, split } from 'lodash';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import ContactPreviewContent from './contact-preview-content';
import { ActionTagButton } from '../../../components/action-tag-button';
import { Displayer } from '../../../components/displayer/displayer';
import { DisplayerActionIconButton } from '../../../components/displayer/displayer-action-icon-button';
import { DisplayerActionsHeader } from '../../../components/displayer/displayer-actions-header';
import { useContactPreviewActions } from '../../../views/contacts/actions/contact-preview-actions';
import { useDisplayName } from '../../hooks/use-display-name';
import { Contact } from '../../types/contact';

export const ContactPreviewPanel = ({ contact }: { contact: Contact }): React.JSX.Element => {
	const urlLocation = useLocation();
	const history = useHistory();
	const { pathname } = useLocation();
	const { folderId } = useParams<{ folderId: string }>();
	const onClose = useCallback(() => {
		includes(urlLocation?.pathname, 'search')
			? history.push(head(split(pathname, '/folder')))
			: replaceHistory(`/folder/${folderId}`);
	}, [folderId, history, pathname, urlLocation?.pathname]);
	const displayName = useDisplayName(contact);
	const actions = useContactPreviewActions(contact);

	const actionButtons = useMemo<ReactNode[]>(
		() =>
			actions.map((action) => {
				if (action.id === 'tag') {
					return <ActionTagButton key={action.id} contact={contact} />;
				}
				return <DisplayerActionIconButton action={action} key={action.id} />;
			}),
		[actions, contact]
	);
	return (
		<Displayer title={displayName} icon={'PersonOutline'} onClose={onClose}>
			<DisplayerActionsHeader>{actionButtons}</DisplayerActionsHeader>
			<ContactPreviewContent contact={contact} />
		</Displayer>
	);
};
