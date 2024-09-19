/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { useTranslation } from 'react-i18next';

import { EmptyDisplayer } from '../../../components/empty-displayer';

export const ContactGroupEmptyDisplayer = (): React.JSX.Element => {
	const [t] = useTranslation();

	return (
		<EmptyDisplayer
			description={t(
				'emptyDisplayer.contactGroup.hint',
				'Click the “NEW” button to create a new contacts group.'
			)}
			title={t('displayer.title3', 'Stay in touch with your colleagues.')}
		/>
	);
};
