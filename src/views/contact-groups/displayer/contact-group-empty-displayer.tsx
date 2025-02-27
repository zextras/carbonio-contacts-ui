/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { EmptyDisplayer } from '../../../components/empty-displayer';

export const ContactGroupEmptyDisplayer = (): React.JSX.Element => {
	const [t] = useTranslation();

	return (
		<Container
			background="gray5"
			orientation="vertical"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			data-testid="displayer"
		>
			<EmptyDisplayer
				description={t(
					'emptyDisplayer.contactGroup.hint',
					'Click the “NEW” button to create a new contacts group.'
				)}
				title={t('displayer.title3', 'Stay in touch with your colleagues.')}
			/>
		</Container>
	);
};
