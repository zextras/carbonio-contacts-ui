/*
 * SPDX-FileCopyrightText: 2024 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement } from 'react';

import { Container } from '@zextras/carbonio-design-system';
import styled from 'styled-components';

interface SkeletonTileProps {
	$width?: string;
	$height?: string;
	$radius?: string;
}

const SkeletonTile = styled.div<SkeletonTileProps>`
	width: ${({ $width }): string => $width ?? '1rem'};
	max-width: ${({ $width }): string => $width ?? '1rem'};
	min-width: ${({ $width }): string => $width ?? '1rem'};
	height: ${({ $height }): string => $height ?? '1rem'};
	max-height: ${({ $height }): string => $height ?? '1rem'};
	min-height: ${({ $height }): string => $height ?? '1rem'};
	border-radius: ${({ $radius }): string => $radius ?? '0.125rem'};
	background: ${({ theme }): string => theme.palette.gray2.regular};
`;

export const Loader = (): ReactElement => (
	<Container
		orientation="horizontal"
		mainAlignment="flex-start"
		crossAlignment="center"
		minWidth="16rem"
		minHeight="2rem"
	>
		<SkeletonTile $radius="50%" $width="2rem" $height="2rem" />
		<Container orientation="vertical" crossAlignment="flex-start" padding={{ left: 'small' }}>
			<SkeletonTile
				$radius="0.25rem"
				$width={`${Math.random() * 9.375 + 4}rem`}
				$height="0.875rem"
				style={{ marginBottom: '0.25rem' }}
			/>
			<SkeletonTile
				$radius="0.25rem"
				$width={`${Math.random() * 9.375 + 4}rem`}
				$height="0.75rem"
			/>
		</Container>
	</Container>
);
