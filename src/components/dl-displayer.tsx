/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Container } from '@zextras/carbonio-design-system';

import { DisplayerHeader } from './DisplayerHeader';

interface DistributionListDisplayerProps {
	id: string;
}
export const DistributionListDisplayer = ({
	id
}: DistributionListDisplayerProps): React.JSX.Element => (
	// const actions = useDLActions();

	<Container background={'gray5'} mainAlignment={'flex-start'} padding={{ bottom: '1rem' }}>
		<DisplayerHeader title={} />
		{/* <Container */}
		{/*	padding={{ horizontal: '1rem' }} */}
		{/*	mainAlignment={'flex-start'} */}
		{/*	minHeight={0} */}
		{/*	maxHeight={'100%'} */}
		{/* > */}
		{/*	<ActionsHeader actions={actions} /> */}
		{/*	<ContactGroupDetails /> */}
		{/* </Container> */}
	</Container>
);
