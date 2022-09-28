/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/extensions */

import React, { FC, ReactElement } from 'react';
import { Container, ButtonOld as Button, Padding, Divider } from '@zextras/carbonio-design-system';
import { ModalFooterProps } from '../../../types/commons';

const ModalFooter: FC<ModalFooterProps> = ({
	mainAlignment = 'center',
	crossAlignment = 'center',
	onConfirm,
	label,
	secondaryAction,
	secondaryLabel = 'Cancel',
	primaryBtnType = 'default',
	secondaryBtnType = 'default',
	disabled,
	secondaryDisabled,
	background = 'primary',
	secondarybackground,
	color = 'primary',
	secondaryColor = 'secondary',
	size = 'fit',
	divider = true,
	verticalPadding = 'small',
	secondaryVerticalPadding = 'small'
}): ReactElement => (
	<Container mainAlignment={mainAlignment} crossAlignment={crossAlignment}>
		{divider && <Divider />}
		<Container orientation="horizontal" mainAlignment="flex-end" crossAlignment="flex-end">
			{secondaryAction && (
				<Padding right="small" vertical={secondaryVerticalPadding}>
					<Button
						backgroundColor={secondarybackground}
						color={secondaryColor}
						type={secondaryBtnType}
						onClick={secondaryAction}
						label={secondaryLabel}
						disabled={secondaryDisabled}
						size={size}
					/>
				</Padding>
			)}

			<Padding vertical={verticalPadding}>
				<Button
					size={size}
					color={color}
					onClick={onConfirm}
					label={label}
					type={primaryBtnType}
					disabled={disabled}
					backgroundColor={background}
				/>
			</Padding>
		</Container>
	</Container>
);
export default ModalFooter;
