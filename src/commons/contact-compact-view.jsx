/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import {
	Avatar,
	ButtonOld as Button,
	Drag,
	IconButton,
	Responsive,
	Row,
	Text
} from '@zextras/carbonio-design-system';
import { trim } from 'lodash';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useDisplayName } from '../hooks/use-display-name';

const AvatarMobile = styled(Avatar)`
	position: relative;
	top: 15px;
`;

const AvatarHeader = styled(Row)`
	background: linear-gradient(
		to right,
		${({ theme, bg }) => theme.avatarColors[bg]},
		${({ theme, bg2 }) => theme.avatarColors[bg2]}
	);
`;
function calcColor(label) {
	let sum = 0;
	// eslint-disable-next-line no-plusplus
	for (let i = 0; i < label.length; i++) {
		sum += label.charCodeAt(i);
	}
	return `avatar_${(sum % 50) + 1}`;
}
export const CompactView = ({ contact, toggleOpen, open }) => {
	const displayName = useDisplayName(contact);
	const displayMailAndPhone = useMemo(
		() =>
			trim(
				`${Object.values(contact.email).length > 0 ? Object.values(contact.email)[0].mail : ''}, ${
					Object.values(contact.phone).length > 0 ? Object.values(contact.phone)[0].number : ''
				}`,
				', '
			),
		[contact.email, contact.phone]
	);
	return (
		<>
			<Responsive mode="desktop" target={window.top}>
				<Drag style={{ width: '100%' }}>
					<Row width="fill" height="fit" mainAlignment="flex-start">
						<Avatar
							label={`${contact.firstName} ${contact.lastName}`}
							picture={contact.image}
							size="large"
							fallbackIcon="PeopleOutline"
						/>
						<Row
							orientation="vertical"
							takeAvailableSpace
							mainAlignment="center"
							crossAlignment="flex-start"
							padding={{ horizontal: 'large', vertical: 'small' }}
							height="fill"
						>
							<Text size="medium" weight="bold">
								{displayName}
							</Text>
							<Text size="small" weight="bold" color="secondary">
								{trim(
									`${contact.jobTitle && `${contact.jobTitle}, `} ${
										contact.department && `${contact.department}, `
									} ${contact.company && `${contact.company}, `}`,
									', '
								)}
							</Text>
							<Text size="small" color="secondary">
								{displayMailAndPhone}
							</Text>
						</Row>

						{toggleOpen && (
							<IconButton
								size="medium"
								onClick={toggleOpen}
								icon={open ? 'ArrowIosUpward' : 'ArrowIosDownward'}
							/>
						)}
					</Row>
				</Drag>
			</Responsive>
			<Responsive mode="mobile" target={window.top}>
				<Row padding={{ vertical: 'large' }} width="90vw" height="fit" mainAlignment="flex-start">
					<AvatarHeader
						takeAvailableSpace
						height="fit"
						bg={calcColor(`${contact.firstName} ${contact.lastName}`)}
						bg2={calcColor(`${contact.firstName}${contact.lastName}`)}
						// mainAlignment='center'
					>
						<AvatarMobile
							label={`${contact.firstName} ${contact.lastName}`}
							picture={contact.image}
							size="large"
							fallbackIcon="EmailOutline"
						/>
					</AvatarHeader>
				</Row>
				<Row
					padding={{ vertical: 'extralarge' }}
					width="fill"
					height="fit"
					mainAlignment="flex-start"
				>
					<Row
						orientation="vertical"
						takeAvailableSpace
						mainAlignment="center"
						crossAlignment="flex-start"
						padding={{ horizontal: 'large', vertical: 'small' }}
						height="fill"
					>
						<Text size="large" weight="bold">
							{displayName}
						</Text>
						<Text weight="bold" color="secondary">
							{trim(
								`${contact.jobTitle && `${contact.jobTitle}, `} ${
									contact.department && `${contact.department}, `
								} ${contact.company && `${contact.company}, `}`,
								', '
							)}
						</Text>
						<Text color="secondary">{displayMailAndPhone}</Text>
					</Row>
				</Row>

				{toggleOpen && (
					<Button
						label={open ? 'Show Less Information' : 'Show More Information'}
						backgroundColor={open ? 'secondary' : 'primary'}
						onClick={toggleOpen}
						size="fill"
					/>
				)}
			</Responsive>
		</>
	);
};
