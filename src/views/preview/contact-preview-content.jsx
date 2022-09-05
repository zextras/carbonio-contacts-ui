/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useCallback, useState, useMemo } from 'react';
import {
	Container,
	IconButton,
	Row,
	Responsive,
	ButtonOld as Button,
	Text,
	Collapse,
	Dropdown,
	Padding,
	Icon,
	Tooltip
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { every, includes, isEmpty, reduce } from 'lodash';
import { FOLDERS, runSearch, useTags, ZIMBRA_STANDARD_COLORS } from '@zextras/carbonio-shell-ui';
import { CompactView } from '../../commons/contact-compact-view';
import { useTagExist } from '../../ui-actions/tag-actions';

function typeToIcon(type) {
	switch (type) {
		case 'mail':
			return 'EmailOutline';
		case 'mobile':
			return 'SmartphoneOutline';
		case 'home':
			return 'HomeOutline';
		case 'work':
			return 'BriefcaseOutline';
		case 'fax':
			return '';
		case 'other':
		default:
			return 'PersonOutline';
	}
}

function ContactPreviewRow({ children, width }) {
	return (
		<Row
			orientation="horizontal"
			mainAlignment="space-between"
			width={width || 'fill'}
			wrap="nowrap"
			padding={{ horizontal: 'small', vertical: 'small' }}
		>
			{children}
		</Row>
	);
}

function ContactField({ field, label, width, limit, items }) {
	return (
		<>
			{items ? (
				<Container>
					<Dropdown
						width="100%"
						maxWidth="100%"
						items={items}
						placement="bottom-end"
						display="block"
					>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ all: 'small' }}
						>
							<Text color="secondary">{label}</Text>
							<Row
								takeAvailableSpace
								wrap="nowrap"
								height="fit"
								width="100%"
								orientation="horizontal"
								mainAlignment="flex-start"
								padding={{ top: 'extrasmall' }}
							>
								<Row
									takeAvailableSpace
									wrap="nowrap"
									height="fit"
									orientation="horizontal"
									mainAlignment="flex-start"
									padding={{ top: 'extrasmall' }}
								>
									<Text size="medium" overflow="break-word">
										{field}
									</Text>
								</Row>
								<IconButton size="small" icon="ArrowIosDownward" />
							</Row>
						</Container>
					</Dropdown>
				</Container>
			) : (
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					padding={{ all: 'small' }}
					width={width || '48%'}
					style={{
						minHeight: '48px',
						maxWidth: limit ? 'calc(100% - 48px)' : '100%'
					}}
				>
					<Text color="secondary">{label}</Text>
					<Row
						takeAvailableSpace
						wrap="nowrap"
						height="fit"
						width="fill"
						orientation="horizontal"
						mainAlignment="flex-start"
						padding={{ top: 'extrasmall' }}
					>
						<Row takeAvailableSpace mainAlignment="flex-start">
							<Text size="medium" overflow="break-word">
								{field}
							</Text>
						</Row>
						{items && (
							<Dropdown items={items} placement="bottom-end">
								<Container>
									<Row takeAvailableSpace mainAlignment="flex-start" />
									<IconButton size="small" icon="ArrowIosDownward" />
								</Container>
							</Dropdown>
						)}
					</Row>
				</Container>
			)}
		</>
	);
}

function ContactMultiValueField({ type, values, width, defaultType, showIcon }) {
	const [t] = useTranslation();

	const [selected, setSelected] = useState(0);

	const [internalType, label] = useMemo(() => {
		switch (type) {
			case 'mail':
				return ['mail', t('section.title.mail', 'E-mail address')];
			case 'phone_number':
				return ['number', t('section.title.phone_number', 'Phone contact')];
			case 'url':
				return [
					'url',
					t('label.website', {
						count: values.length,
						defaultValue: 'website',
						defaultValue_plural: 'websites'
					})
				];
			case 'address':
				return [
					'address',
					t('section.title.address', {
						count: values.length,
						defaultValue: 'address',
						defaultValue_plural: 'addresses'
					})
				];
			default:
				return [type, type];
		}
	}, [t, type, values.length]);

	const items = useMemo(
		() =>
			reduce(
				values,
				(acc, item, id) => {
					let itemLabel = type;

					switch (type) {
						case 'mail':
							itemLabel = item.mail;
							break;
						case 'phone_number':
							itemLabel = item.number;
							break;
						case 'url':
							itemLabel = item.url;
							break;
						case 'address':
							itemLabel = item.address;
							break;
						default:
					}
					acc.push({
						id: id.toString(),
						label: itemLabel,
						icon: showIcon ? typeToIcon(item.type || defaultType || 'other') : null,
						click: () => setSelected(id)
					});
					return acc;
				},
				[]
			),
		[defaultType, values, showIcon, type]
	);
	return (
		<Container
			orientation="horizontal"
			width={width || '48%'}
			crossAlignment="center"
			mainAlignment="space-between"
		>
			<ContactField
				label={label}
				field={values && values[selected] && values[selected][internalType]}
				icon={
					values &&
					values[selected] &&
					showIcon &&
					typeToIcon(values[selected].type || defaultType || 'other')
				}
				width={width || 'fill'}
				items={values.length > 1 && items}
			/>
		</Container>
	);
}

function ContactPreviewContent({ contact, onEdit, onDelete, onMail, onMove }) {
	const [open, setOpen] = useState(true);
	const toggleOpen = useCallback(() => {
		setOpen(!open);
	}, [setOpen, open]);
	const [t] = useTranslation();
	// const addressRowData = useMemo(
	// 	() =>
	// 		map(contact.address, (addr) => ({
	// 			type: addr.type,
	// 			address: `${addr.street} - ${addr.city} (${addr.postalCode}), ${addr.country}, ${addr.state}`,
	// 		})),
	// 	[contact]
	// );
	const mailData = useMemo(() => Object.values(contact.email), [contact]);
	// const urlData = useMemo(() => Object.values(contact.URL), [contact]);
	const phoneData = useMemo(() => Object.values(contact.phone), [contact]);

	const tagsFromStore = useTags();
	const triggerSearch = useCallback(
		(tagToSearch) =>
			runSearch(
				[
					{
						avatarBackground: ZIMBRA_STANDARD_COLORS[tagToSearch?.color ?? 0].hex,
						avatarIcon: 'Tag',
						background: 'gray2',
						hasAvatar: true,
						isGeneric: false,
						isQueryFilter: true,
						label: `tag:${tagToSearch?.name}`,
						value: `tag:"${tagToSearch?.name}"`
					}
				],
				'contacts'
			),
		[]
	);
	const tags = useMemo(
		() =>
			reduce(
				tagsFromStore,
				(acc, v) => {
					if (includes(contact.tags, v.id))
						acc.push({
							...v,
							color: ZIMBRA_STANDARD_COLORS[v.color ?? 0].hex,
							label: v.name,
							click: () => triggerSearch(v),
							customComponent: (
								<Row takeAvailableSpace mainAlignment="flex-start">
									<Row takeAvailableSpace mainAlignment="space-between">
										<Row mainAlignment="flex-end">
											<Padding right="small">
												<Icon icon="Tag" color={ZIMBRA_STANDARD_COLORS[v.color ?? 0].hex} />
											</Padding>
										</Row>
										<Row takeAvailableSpace mainAlignment="flex-start">
											<Text>{v.name}</Text>
										</Row>
									</Row>
								</Row>
							)
						});
					return acc;
				},
				[]
			),
		[contact.tags, tagsFromStore, triggerSearch]
	);

	const tagIcon = useMemo(() => (tags.length > 1 ? 'TagsMoreOutline' : 'Tag'), [tags]);
	const tagIconColor = useMemo(() => (tags.length === 1 ? tags[0].color : undefined), [tags]);

	const isTagInStore = useTagExist(tags);

	const onTagClick = useCallback(() => {
		triggerSearch(tagsFromStore?.[contact?.tags[0]]);
	}, [contact.tags, triggerSearch, tagsFromStore]);

	const showMultiTagIcon = useMemo(
		() => contact.tags?.length > 1 && isTagInStore,
		[contact.tags?.length, isTagInStore]
	);
	const showTagIcon = useMemo(
		() =>
			contact.tags &&
			contact.tags?.length !== 0 &&
			!showMultiTagIcon &&
			isTagInStore &&
			every(contact.tags, (tn) => tn !== ''),
		[isTagInStore, contact.tags, showMultiTagIcon]
	);

	const [showDropdown, setShowDropdown] = useState(false);
	const onIconClick = useCallback((ev) => {
		ev.stopPropagation();
		setShowDropdown((o) => !o);
	}, []);

	const onDropdownClose = useCallback(() => {
		setShowDropdown(false);
	}, []);

	const singleTagLabel = useMemo(
		() => tagsFromStore[contact?.tags?.[0]]?.name,
		[contact?.tags, tagsFromStore]
	);
	return (
		<Row
			data-testid="PreviewPanel"
			padding={{ all: 'extrasmall' }}
			width="100%"
			mainAlignment="baseline"
		>
			<Responsive mode="desktop" target={window.top}>
				<Container
					data-testid="contact-preview-content-desktop"
					background="gray6"
					height="fit"
					padding={{ all: 'medium' }}
				>
					<Row
						width="fill"
						height="fit"
						takeAvailableSpace
						mainAlignment="flex-end"
						padding={{ horizontal: 'extrasmall' }}
					>
						{contact.parent !== FOLDERS.TRASH && (
							<IconButton
								icon="MailModOutline"
								onClick={onMail}
								disabled={isEmpty(contact?.email)}
							/>
						)}

						{showTagIcon && (
							<Padding left="small">
								<Tooltip label={singleTagLabel} disabled={showMultiTagIcon}>
									<IconButton
										data-testid="TagIcon"
										size="large"
										onClick={onTagClick}
										icon={tagIcon}
										color={tagIconColor}
									/>
								</Tooltip>
							</Padding>
						)}
						{showMultiTagIcon && (
							<Dropdown items={tags} forceOpen={showDropdown} onClose={onDropdownClose}>
								<Padding left="small">
									<IconButton
										size="large"
										data-testid="TagIcon"
										icon={tagIcon}
										onClick={onIconClick}
										color={tagIconColor}
									/>
								</Padding>
							</Dropdown>
						)}
						<IconButton icon="Trash2Outline" onClick={onDelete} />
						<IconButton
							icon={contact.parent === FOLDERS.TRASH ? 'RestoreOutline' : 'MoveOutline'}
							onClick={onMove}
						/>
						<Padding right="small" />
						{contact.parent !== FOLDERS.TRASH && (
							<Button icon="EditOutline" label={t('label.edit')} onClick={onEdit} />
						)}
					</Row>
					<Container padding={{ all: 'small', top: 'extrasmall' }}>
						<CompactView contact={contact} open={open} toggleOpen={toggleOpen} />
					</Container>
				</Container>
				<Collapse orientation="vertical" open={open} crossSize="100%" disableTransition>
					<Container
						background="gray6"
						width="fill"
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						padding={{ vertical: 'large', horizontal: 'extralarge' }}
						style={{ overflowY: 'auto' }}
					>
						<ContactPreviewRow>
							<ContactField field={contact.namePrefix} label={t('name.prefix', 'Prefix')} />
							<ContactField field={contact.firstName} label={t('name.first_name', 'First Name')} />
							<ContactField
								field={contact.middleName}
								label={t('name.middle_name', 'Middle Name')}
							/>
							<ContactField field={contact.lastName} label={t('name.last_name', 'Last Name')} />
							<ContactField field={contact.nameSuffix} label={t('name.suffix', 'Suffix')} />
						</ContactPreviewRow>

						<ContactPreviewRow>
							<ContactMultiValueField type="phone_number" values={phoneData} showIcon />
							<ContactMultiValueField
								type="mail"
								values={mailData}
								defaultType="email"
								showIcon={false}
							/>
						</ContactPreviewRow>

						<ContactPreviewRow>
							<ContactField field={contact.jobTitle} label={t('job.title', 'Job Role')} />
							<ContactField field={contact.department} label={t('job.department', 'Department')} />
							<ContactField field={contact.company} label={t('job.company', 'Company')} />
						</ContactPreviewRow>
						<ContactPreviewRow></ContactPreviewRow>

						<ContactPreviewRow>
							<ContactField field={contact.notes} label={t('label.notes', 'Notes')} width="fill" />
						</ContactPreviewRow>
					</Container>
				</Collapse>
			</Responsive>
			<Responsive mode="mobile" target={window.top}>
				<Container
					data-testid="contact-preview-content-mobile"
					background="gray6"
					height="fit"
					padding={{ all: 'medium' }}
					// data-testid='PreviewPanel'
				>
					<Container>
						<CompactView contact={contact} open={open} toggleOpen={toggleOpen} />
					</Container>
				</Container>
				<Collapse orientation="vertical" open={open} crossSize="100%" disableTransition>
					<Container
						background="gray6"
						width="fill"
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						padding={{ vertical: 'large', horizontal: 'extralarge' }}
						style={{ overflowY: 'auto' }}
					>
						<ContactPreviewRow>
							<ContactField field={contact.namePrefix} label={t('name.prefix', 'Prefix')} />
							<ContactField field={contact.firstName} label={t('name.first_name', 'First Name')} />
						</ContactPreviewRow>

						<ContactPreviewRow>
							<ContactField field={contact.lastName} label={t('name.last_name', 'Last Name')} />

							<ContactMultiValueField type="phone_number" values={phoneData} showIcon />
						</ContactPreviewRow>

						<ContactPreviewRow>
							<ContactMultiValueField
								type="mail"
								values={mailData}
								defaultType="email"
								showIcon={false}
							/>

							<ContactField field={contact.jobTitle} label={t('job.title', 'Job Role')} />
						</ContactPreviewRow>

						<ContactPreviewRow>
							<ContactField field={contact.company} label={t('job.company', 'Company')} />
						</ContactPreviewRow>
					</Container>
				</Collapse>
			</Responsive>
		</Row>
	);
}

export default ContactPreviewContent;
