/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback } from 'react';

import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';

import { ContactGroupDisplayerComponent } from './contact-group-displayer-component';
import { FOLDERS } from '../../../carbonio-ui-commons/constants/folders';
import { ROUTES_INTERNAL_PARAMS } from '../../../constants';
import { useGetMainAccountContactGroup } from '../../../hooks/useGetContactGroup';

type Props = {
	contactGroupId: string;
};
export const ContactGroupDisplayer = ({ contactGroupId }: Props): React.JSX.Element => {
	const contactGroup = useGetMainAccountContactGroup(contactGroupId);
	const replaceHistory = useReplaceHistoryCallback();
	const closeDisplayer = useCallback((): void => {
		replaceHistory(`${ROUTES_INTERNAL_PARAMS.route.contactGroups}/${FOLDERS.CONTACTS}`);
	}, [replaceHistory]);

	return (
		<ContactGroupDisplayerComponent
			onCloseDisplayer={closeDisplayer}
			contactGroup={contactGroup}
		></ContactGroupDisplayerComponent>
	);
};
