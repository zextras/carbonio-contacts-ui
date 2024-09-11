/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { IconButton, Tooltip } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { ROUTES_INTERNAL_PARAMS } from '../../../constants';
import { useNavigation } from '../../../hooks/useNavigation';

export const CollapsedContactGroup = (): React.JSX.Element => {
	const [t] = useTranslation();
	const { navigateTo } = useNavigation();
	const { pathname } = useLocation();
	const onContactGroupClick = (ev: KeyboardEvent | React.SyntheticEvent): void => {
		ev.stopPropagation();
		navigateTo(ROUTES_INTERNAL_PARAMS.route.contactGroups);
	};

	return (
		<Tooltip
			label={t('secondaryBar.myContactGroups', 'My Contact Groups')}
			key={'contact-group-id'}
		>
			<IconButton
				customSize={{ iconSize: 'large', paddingSize: 'small' }}
				icon={'PeopleOutline'}
				onClick={onContactGroupClick}
				backgroundColor={
					pathname.includes(ROUTES_INTERNAL_PARAMS.route.contactGroups) ? 'highlight' : undefined
				}
			/>
		</Tooltip>
	);
};
