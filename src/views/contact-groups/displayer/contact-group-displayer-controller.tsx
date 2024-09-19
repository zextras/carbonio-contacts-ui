/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { useParams } from 'react-router-dom';

import { ContactGroupDisplayer } from './contact-group-displayer';
import { ContactGroupDisplayerShared } from './contact-group-displayer-shared';
import { getFolderIdParts } from '../../../carbonio-ui-commons/helpers/folders';

export const ContactGroupDisplayerController = (): React.JSX.Element => {
	const { id: contactGroupId } = useParams<{ id: string }>();
	const { zid: accountId } = getFolderIdParts(contactGroupId);

	return (
		<Container
			orientation="vertical"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			data-testid="displayer"
		>
			{accountId ? (
				<ContactGroupDisplayerShared accountId={accountId} />
			) : (
				<ContactGroupDisplayer />
			)}
		</Container>
	);
};
