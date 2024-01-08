/*
 * SPDX-FileCopyrightText: 2023 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React from 'react';

import { Container } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const ScrollableContainer = styled(Container)`
	overflow-y: auto;
`;

export const ContactGroupDetails = (): React.JSX.Element => {
	const [t] = useTranslation();

	return (
		<ScrollableContainer mainAlignment={'flex-start'}>
			<Container
				background={'gray6'}
				padding={'1rem'}
				gap={'1rem'}
				height={'auto'}
				mainAlignment={'flex-start'}
				crossAlignment={'flex-start'}
			>
				{'details'}
			</Container>
		</ScrollableContainer>
	);
};
