/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { useTranslation } from 'react-i18next';

import { CgDisplayerWithActions } from './cg-displayer-with-actions';
import { EmptyDisplayer } from './empty-displayer';
import { ContactGroup } from '../model/contact-group';

interface ContactGroupDisplayerProps {
	onCloseDisplayer: () => void;
	contactGroup: ContactGroup | undefined;
}

export const CGDisplayerComponent = ({
	onCloseDisplayer,
	contactGroup
}: ContactGroupDisplayerProps): React.JSX.Element => {
	const [t] = useTranslation();
	return (
		<>
			{contactGroup ? (
				<CgDisplayerWithActions
					contactGroup={contactGroup}
					onCloseDisplayer={onCloseDisplayer}
				></CgDisplayerWithActions>
			) : (
				<EmptyDisplayer
					description={t(
						'emptyDisplayer.contactGroup.hint',
						'Click the “NEW” button to create a new contacts group.'
					)}
					title={t('displayer.title3', 'Stay in touch with your colleagues.')}
				/>
			)}
		</>
	);
};
