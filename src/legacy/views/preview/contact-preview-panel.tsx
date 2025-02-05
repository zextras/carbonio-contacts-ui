/*
 * SPDX-FileCopyrightText: 2025 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useMemo } from 'react';

import { Button, Tooltip } from '@zextras/carbonio-design-system';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { head, includes, split } from 'lodash';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import { useContactActions } from './contact-preview-actions';
import ContactPreviewContent from './contact-preview-content';
import { Displayer } from '../../../components/displayer/displayer';
import { DisplayerActionsHeader } from '../../../components/displayer-actions-header';
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
	const actions = useContactActions(contact);

	const actionButtons = useMemo<React.JSX.Element[]>(
		() =>
			actions.map((action) => (
				<Tooltip key={action.id} label={action.label}>
					<Button
						type="ghost"
						icon={action.icon}
						color="currentColor"
						size="medium"
						onClick={(ev): void => {
							ev.stopPropagation();
							action.onClick(ev);
						}}
						disabled={action.disabled}
					/>
				</Tooltip>
			)),
		[actions]
	);
	return (
		<Displayer title={displayName} icon={'PersonOutline'} onClose={onClose}>
			<DisplayerActionsHeader>{actionButtons}</DisplayerActionsHeader>
			<ContactPreviewContent contact={contact} />
		</Displayer>
	);
};
