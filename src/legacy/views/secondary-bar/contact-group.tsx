/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';

import { Accordion, AccordionSummary } from '@mui/material';
import { Container, Icon, Padding, Text } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import { theme } from '../../../carbonio-ui-commons/theme/theme-mui';
import { ROUTES_INTERNAL_PARAMS } from '../../../constants';
import { useNavigation } from '../../../hooks/useNavigation';

export const ContactGroup = (): React.JSX.Element => {
	const [t] = useTranslation();
	const { navigateTo } = useNavigation();
	const { pathname } = useLocation();
	const onContactGroupClick = (ev: KeyboardEvent | React.SyntheticEvent): void => {
		ev.stopPropagation();
		navigateTo(ROUTES_INTERNAL_PARAMS.route.contactGroups);
	};

	const StyledText = styled(Text)`
		min-width: 0;
		flex-basis: 0;
		flex-grow: 1;
	`;
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
					onClick={onContactGroupClick}
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
