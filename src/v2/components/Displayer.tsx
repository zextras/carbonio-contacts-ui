/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Container } from '@zextras/carbonio-design-system';

import { ContactGroupDisplayer } from './ContactGroupDisplayer';
import { EmptyDisplayer } from './EmptyDisplayer';
import { useActiveItem } from '../hooks/useActiveItem';

export const Displayer = (): React.JSX.Element => {
	const { activeItem } = useActiveItem();

	const contactGroup = '';

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
