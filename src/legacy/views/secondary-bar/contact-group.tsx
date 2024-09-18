/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Accordion, AccordionSummary } from '@mui/material';
import { Container, Icon, Padding, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { theme } from '../../../carbonio-ui-commons/theme/theme-mui';

const StyledText = styled(Text)`
	min-width: 0;
	flex-basis: 0;
	flex-grow: 1;
`;

export const ContactGroup = ({
	onClick
}: {
	onClick: (ev: KeyboardEvent | React.SyntheticEvent) => void;
}): React.JSX.Element => {
	const [t] = useTranslation();
	const label = t('secondaryBar.contactGroups', 'Contact Groups');
	return (
		<Accordion
			disableGutters
			slotProps={{ transition: { unmountOnExit: true } }}
			expanded={false}
			key={label}
		>
			<AccordionSummary
				aria-controls="panel1a-content"
				id={label}
				sx={{
					backgroundColor: theme.palette.gray5.regular,
					'&:hover': {
						backgroundColor: theme.palette.gray5.hover
					}
				}}
			>
				<Container
					orientation="horizontal"
					mainAlignment="flex-start"
					padding={{ all: 'small' }}
					height="2.5rem"
					style={{ minWidth: 0, flexBasis: 0, flexGrow: 1 }}
					key={'contact-group-id'}
					data-testid={'contact-group-id'}
					onClick={onClick}
				>
					<Padding horizontal="small">
						<Icon size="large" icon={'PeopleOutline'} />
					</Padding>
					<StyledText size="medium">{label}</StyledText>
				</Container>
			</AccordionSummary>
		</Accordion>
	);
};
