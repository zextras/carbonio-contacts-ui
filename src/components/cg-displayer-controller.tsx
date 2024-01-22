/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import { CGDisplayer } from './cg-displayer';
import { EmptyDisplayer } from './empty-displayer';
import { useActiveContactGroup } from '../hooks/useActiveContactGroup';

export const CGDisplayerController = (): React.JSX.Element => {
	const contactGroup = useActiveContactGroup();
	const [t] = useTranslation();

	return (
		<Container
			orientation="vertical"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			data-testid="displayer"
		>
			{(contactGroup && <CGDisplayer contactGroup={contactGroup} />) || (
				<EmptyDisplayer
					description={t(
						'emptyDisplayer.contactGroup.hint',
						'Click the “NEW” button to create a new contacts group.'
					)}
					title={t('displayer.title3', 'Stay in touch with your colleagues.')}
					icon={'PeopleOutline'}
				/>
			)}
		</Container>
	);
};
