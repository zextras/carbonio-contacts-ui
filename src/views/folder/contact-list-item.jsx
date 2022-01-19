/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link, useRouteMatch } from 'react-router-dom';
import { Avatar, Container, Text, Row, Padding } from '@zextras/carbonio-design-system';
import { trim, includes } from 'lodash';
import { useReplaceHistoryCallback } from '@zextras/carbonio-shell-ui';
import { useDisplayName } from '../../commons/use-display-name';
import ListItemActionWrapper from './list-item-action-wrapper';
import useQueryParam from '../../hooks/getQueryParam';

const InvisibleLink = styled(Link)`
	text-decoration: none; /* no underline */
	width: 100%;
	height: 100%;
`;
const MainWrapper = styled(Container)`
	&:hover {
		background: ${({ theme }) => theme.palette.gray6.hover};
		background: 'red' !important;
	}
	border-bottom: ${({ theme }) => `1px solid ${theme.palette.gray4.regular}`};
`;

const ContentWrapper = styled(Container)`
	&:hover {
		& ${MainWrapper} {
			background: ${({ theme }) => theme.palette.gray6.hover};
			background: 'red' !important;
		}
	}
`;
const BlankAvatar = styled(Container)`
	cursor: pointer;
	width: 31px;
	height: 31px;
	border: 2px solid #2b73d2;
	box-sizing: border-box;
	border-radius: 50%;
`;

export default function ContactListItem({
	contact,
	style,
	selectedIds,
	selectContacts,
	avatarOnClick,
	selectMode
}) {
	const { url } = useRouteMatch();
	const displayName = useDisplayName(contact);
	const secondaryRow = useMemo(
		() =>
			trim(
				`${Object.values(contact.email).length > 0 ? Object.values(contact.email)[0].mail : ''}, ${
					Object.values(contact.phone).length > 0 ? Object.values(contact.phone)[0].number : ''
				}`,
				', '
			),
		[contact]
	);
	const calculateCheck = useMemo(
		() => includes(selectedIds, contact.id),
		[selectedIds, contact.id]
	);
	const replaceHistory = useReplaceHistoryCallback();
	const previewId = useQueryParam('preview');
	const active = useMemo(() => contact.id === previewId, [contact.id, previewId]);
	const _onClick = useCallback(
		(e) => {
			// if (!e.isDefaultPrevented()) {
			// 	replaceHistory(`/folder/${contact.parent}/preview/${contact.id}`);
			// }
			replaceHistory(`${url}/contacts/${contact.id}`);
		},
		[replaceHistory, url, contact.id]
	);
	return (
		<MainWrapper style={style}>
			<InvisibleLink to={`${url}/contacts/${contact.id}`}>
				<Container
					borderRadius="none"
					height="fill"
					background={active ? 'highlight' : 'gray6'}
					orientation="horizontal"
					data-testid={contact.id}
					width="100%"
				>
					<Padding all="medium">
						{selectMode ? (
							<>
								{calculateCheck ? (
									<Avatar
										data-testid={`checkedAvatar`}
										icon="Checkmark"
										label="NameLastname"
										background="primary"
										onClick={(ev) => {
											if (ev) ev.preventDefault();
											selectContacts(contact.id);
										}}
									/>
								) : (
									<BlankAvatar
										data-testid={`unCheckedAvatar`}
										onClick={(ev) => {
											if (ev) ev.preventDefault();
											selectContacts(contact.id);
										}}
									/>
								)}
							</>
						) : (
							<Avatar
								label={`${contact.firstName} ${contact.lastName}`}
								picture={contact.image}
								onClick={avatarOnClick(contact.id)}
								fallbackIcon="EmailOutline"
							/>
						)}
					</Padding>

					<ListItemActionWrapper contact={contact} onClick={_onClick}>
						<ContentWrapper
							padding={{ left: 'small' }}
							width="fill"
							background={active ? 'highlight' : 'gray6'}
							mainAlignment="center"
							crossAlignment="flex-start"
						>
							<Row width="fill" mainAlignment="flex-start" padding={{ vertical: 'extrasmall' }}>
								<Text size="large">{displayName}</Text>
							</Row>
							<Row width="fill" mainAlignment="flex-start">
								<Text color="secondary">{secondaryRow}</Text>
							</Row>
						</ContentWrapper>
					</ListItemActionWrapper>
				</Container>
			</InvisibleLink>
		</MainWrapper>
	);
}

ContactListItem.propTypes = {
	// eslint-disable-next-line react/forbid-prop-types,react/require-default-props
	style: PropTypes.any,
	// eslint-disable-next-line react/forbid-prop-types
	contact: PropTypes.any.isRequired /* instanceOf(Contact) */ // todo: modify this
};
