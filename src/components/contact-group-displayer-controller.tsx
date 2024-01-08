/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Container } from '@zextras/carbonio-design-system';

import { ContactGroupDisplayer } from './contact-group-displayer';
import { EmptyDisplayer } from './EmptyDisplayer';
import { useActiveContactGroup } from '../hooks/useActiveContactGroup';

export const ContactGroupDisplayerController = (): React.JSX.Element => {
	const contactGroup = useActiveContactGroup();

	return (
		<Container
			orientation="vertical"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
			data-testid="displayer"
		>
			{contactGroup ? <ContactGroupDisplayer contactGroup={contactGroup} /> : <EmptyDisplayer />}
		</Container>
	);
};
