/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable import/extensions */

import React, { FC, ReactElement, useMemo } from 'react';

import {
	Container,
	Button,
	Padding,
	Divider,
	Tooltip,
	AnyColor
} from '@zextras/carbonio-design-system';

import { ModalFooterProps } from 'legacy/types/commons';

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
	size = 'small',
	showDivider = true,
	tooltip,
	secondaryTooltip
}): ReactElement => {
	const secondaryTypeAndColor = useMemo<
		| { type: 'ghost'; color: AnyColor }
		| {
				type: 'default' | 'outlined';
				backgroundColor: AnyColor | undefined;
				labelColor: AnyColor;
		  }
	>(() => {
		if (secondaryBtnType === 'ghost') {
			return { type: secondaryBtnType, color: secondaryColor };
		}
		return {
			type: secondaryBtnType,
			backgroundColor: secondarybackground,
			labelColor: secondaryColor
		};
	}, [secondaryBtnType, secondaryColor, secondarybackground]);

	const primaryTypeAndColor = useMemo<
		| { type: 'ghost'; color: AnyColor }
		| {
				type: 'default' | 'outlined';
				backgroundColor: AnyColor;
				labelColor: AnyColor;
		  }
	>(() => {
		if (primaryBtnType === 'ghost') {
			return { type: primaryBtnType, color };
		}
		return { type: primaryBtnType, backgroundColor: background, labelColor: color };
	}, [background, color, primaryBtnType]);

	return (
		<Container
			mainAlignment={mainAlignment}
			crossAlignment={crossAlignment}
			padding={{ top: 'medium' }}
		>
			{showDivider && <Divider />}

			<Container
				orientation="horizontal"
				padding={{ top: 'medium' }}
				mainAlignment="flex-end"
				crossAlignment="flex-end"
			>
				{secondaryAction && (
					<Padding right="small" vertical="small">
						{secondaryTooltip ? (
							<Tooltip label={secondaryTooltip} placement="top" maxWidth="fit">
								<Button
									{...secondaryTypeAndColor}
									onClick={secondaryAction}
									label={secondaryLabel}
									disabled={secondaryDisabled}
									size={size}
								/>
							</Tooltip>
						) : (
							<Button
								{...secondaryTypeAndColor}
								onClick={secondaryAction}
								label={secondaryLabel}
								disabled={secondaryDisabled}
								size={size}
							/>
						)}
					</Padding>
				)}

				<Padding vertical="small">
					{tooltip ? (
						<Tooltip label={tooltip} placement="top" maxWidth="fit">
							<Button
								size={size}
								onClick={onConfirm}
								label={label}
								disabled={disabled}
								{...primaryTypeAndColor}
							/>
						</Tooltip>
					) : (
						<Button
							size={size}
							onClick={onConfirm}
							label={label}
							disabled={disabled}
							{...primaryTypeAndColor}
						/>
					)}
				</Padding>
			</Container>
		</Container>
	);
};
export default ModalFooter;
