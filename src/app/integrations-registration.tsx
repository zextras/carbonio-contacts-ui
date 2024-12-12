/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { FC, useEffect, useMemo } from 'react';

import { useSnackbar } from '@zextras/carbonio-design-system';
import {
	ACTION_TYPES,
	addBoard,
	NewAction,
	registerActions,
	registerComponents,
	registerFunctions
} from '@zextras/carbonio-shell-ui';
import { useTranslation } from 'react-i18next';

import { CONTACT_BOARD_ID, CONTACTS_APP_ID, NEW_CONTACT_GROUP_BOARD_ID } from '../constants';
import { ContactInputIntegrationWrapper } from '../legacy/integrations/contact-input-integration-wrapper';
import createContactIntegration from '../legacy/integrations/create-contact';

export const IntegrationsRegistration: FC = () => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();

	const newContactAction = useMemo(
		(): NewAction => ({
			id: 'new-contact',
			label: t('label.new_contact', 'New Contact'),
			icon: 'ContactsModOutline',
			execute: (ev): void => {
				ev?.preventDefault?.();
				addBoard({
					boardViewId: CONTACT_BOARD_ID,
					title: t('label.new_contact', 'New Contact')
				});
			},
			disabled: false,
			group: CONTACTS_APP_ID,
			primary: true
		}),
		[t]
	);

	const newContactGroupAction = useMemo(
		(): NewAction => ({
			id: 'new-contact-group',
			label: t('label.newContactGroup', 'New contact group'),
			icon: 'PeopleOutline',
			execute: (): void => {
				addBoard({
					boardViewId: NEW_CONTACT_GROUP_BOARD_ID,
					title: t('board.newContactGroup.title', 'New Group')
				});
			},
			disabled: false,
			primary: false,
			group: CONTACTS_APP_ID
		}),
		[t]
	);

	useEffect(() => {
		registerComponents({
			id: 'contact-input',
			component: ContactInputIntegrationWrapper
		});

		registerActions<NewAction>(
			{
				action: () => newContactAction,
				id: 'new-contact',
				type: ACTION_TYPES.NEW
			},
			{
				id: 'new-contact-group',
				type: ACTION_TYPES.NEW,
				action: () => newContactGroupAction
			}
		);
		registerFunctions({
			id: 'create_contact_from_vcard',
			fn: createContactIntegration(createSnackbar, t)
		});
	}, [createSnackbar, newContactAction, newContactGroupAction, t]);

	return null;
};
