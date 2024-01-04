/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { ButtonOldProps, ContainerProps } from '@zextras/carbonio-design-system';
import { SyntheticEvent } from 'react';

export type ModalFooterProps = {
	mainAlignment?: ContainerProps['mainAlignment'];
	crossAlignment?: ContainerProps['crossAlignment'];
	padding?: Record<string, string> | undefined;
	onConfirm: (e?: SyntheticEvent<Element, Event> | KeyboardEvent) => void;
	secondaryAction?: () => void | undefined;
	label: string;
	secondaryLabel?: string | undefined;
	disabled?: boolean | undefined;
	secondaryDisabled?: boolean | undefined;
	background?: ContainerProps['background'];
	secondarybackground?: ContainerProps['background'];
	color?: string | undefined;
	secondaryColor?: string | undefined;
	size?: ButtonOldProps['size'];
	primaryBtnType?: ButtonOldProps['type'];
	secondaryBtnType?: ButtonOldProps['type'];
	divider?: boolean;
	verticalPadding?: string;
	secondaryVerticalPadding?: string;
	showDivider?: boolean;
	tooltip?: string;
	secondaryTooltip?: string;
	paddingTop?: string;
};
