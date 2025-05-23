import React from 'react';
import { TAdditionalDetailsOfEachMT5Loginid } from '@deriv/stores/types';
import { useDevice } from '@deriv-com/ui';
import { Text, Icon, Money, StatusBadge, InformationBanner } from '@deriv/components';
import getMT5StatusBadgeConfig from '@deriv/account/src/Configs/get-mt5-status-badge-config';
import { getCFDAccountKey, MT5_ACCOUNT_STATUS, PRODUCT, Jurisdiction, OSDetect } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import { Localize, localize } from '@deriv/translations';
import { CFD_PLATFORMS, MARKET_TYPE } from '../Helpers/cfd-config';
import TradingPlatformIcon from '../Assets/svgs/trading-platform';
import MigrationBanner from './migration-banner';
import MT5DesktopRedirectOption from './mt5-desktop-redirect-option';
import MT5MobileRedirectOption from './mt5-mobile-redirect-option';
import PasswordBox from '../Components/passwordbox';
import SpecBox from '../Components/specbox';
import { TCFDPasswordReset } from './props.types';
import { TProducts, TTradingPlatformAccounts } from '../Components/props.types';
import { StandaloneChartAreaRegularIcon, StandaloneArrowUpRightRegularIcon } from '@deriv/quill-icons';

type TMT5TradeModalProps = {
    mt5_trade_account: TAdditionalDetailsOfEachMT5Loginid;
    show_eu_related_content: boolean;
    onPasswordManager: (
        arg1: string | undefined,
        arg2: string,
        group: TCFDPasswordReset['account_group'],
        arg4: string,
        arg5: string | undefined
    ) => void;
    toggleModal: () => void;
    product?: TProducts;
    is_demo: string;
};

const getTitle = (market_type: string, show_eu_related_content: boolean) => {
    if (show_eu_related_content) localize('MT5 CFDs');
    return market_type;
};

const DMT5TradeModal = observer(
    ({
        mt5_trade_account,
        show_eu_related_content,
        onPasswordManager,
        toggleModal,
        product,
        is_demo,
    }: TMT5TradeModalProps) => {
        const { isDesktop } = useDevice();
        const { client } = useStore();
        const { account_status: { authentication } = {} } = client;
        const is_eligible_to_migrate = mt5_trade_account.eligible_to_migrate;

        const getAccountTitle = () => {
            switch (mt5_trade_account.product) {
                case PRODUCT.STANDARD:
                    return 'Standard';
                case PRODUCT.SWAPFREE:
                    return 'Swap-Free';
                case PRODUCT.ZEROSPREAD:
                    return 'Zero Spread';
                case PRODUCT.STP:
                    return 'Financial STP';
                case PRODUCT.GOLD:
                    return 'Gold';
                default:
                    return show_eu_related_content ? 'CFDs' : 'Financial';
            }
        };

        const getAccountIcons = () => {
            if (show_eu_related_content && product === PRODUCT.FINANCIAL) return 'CFDs';
            else if (mt5_trade_account.market_type === MARKET_TYPE.SYNTHETIC) return 'Standard';
            else if (mt5_trade_account.market_type === MARKET_TYPE.ALL && product === PRODUCT.SWAPFREE)
                return 'SwapFree';
            else if (mt5_trade_account.market_type === MARKET_TYPE.ALL && product === PRODUCT.ZEROSPREAD)
                return 'ZeroSpread';
            else if (mt5_trade_account.market_type === MARKET_TYPE.FINANCIAL && product === PRODUCT.GOLD) return 'Gold';
            return 'Financial';
        };

        const { text: badge_text, icon: badge_icon } = getMT5StatusBadgeConfig(mt5_trade_account?.status);
        const has_migration_status = [
            MT5_ACCOUNT_STATUS.MIGRATED_WITH_POSITION,
            MT5_ACCOUNT_STATUS.MIGRATED_WITHOUT_POSITION,
        ].includes(mt5_trade_account?.status);
        const getShortcode = () => {
            switch (mt5_trade_account.landing_company_short) {
                case Jurisdiction.SVG:
                    return 'SVG';
                case Jurisdiction.BVI:
                    return 'BVI';
                case Jurisdiction.VANUATU:
                    return 'Vanuatu';
                case Jurisdiction.MAURITIUS:
                    return 'DML';
                default:
                    return null;
            }
        };
        const is_window = OSDetect() === 'windows';
        return (
            <div className='cfd-trade-modal-container'>
                <div className='cfd-trade-modal'>
                    <TradingPlatformIcon icon={getAccountIcons()} size={24} />
                    <div className='cfd-trade-modal__desc'>
                        <div className='cfd-trade-modal__desc-heading'>
                            <Text size='xs' line_height='l'>
                                {getAccountTitle()}
                            </Text>
                            {!is_demo ? (
                                getShortcode() && (
                                    <Text size='xxs' line_height='l' className='cfd-trade-modal__desc-heading--real'>
                                        {getShortcode()}
                                    </Text>
                                )
                            ) : (
                                <Text
                                    size='xxs'
                                    line_height='l'
                                    weight='bold'
                                    className='cfd-trade-modal__desc-heading--demo'
                                >
                                    {localize('Demo')}
                                </Text>
                            )}
                        </div>
                        {(mt5_trade_account as TTradingPlatformAccounts)?.display_login && (
                            <Text color='less-prominent' size='xxxs' line_height='xxxs'>
                                {(mt5_trade_account as TTradingPlatformAccounts)?.display_login}
                            </Text>
                        )}
                    </div>
                    <div className='cfd-trade-modal__acc_status'>
                        {mt5_trade_account?.display_balance && (
                            <Text
                                size='xs'
                                color='profit-success'
                                className='cfd-trade-modal__desc-balance'
                                weight='bold'
                            >
                                <Money
                                    amount={mt5_trade_account.display_balance}
                                    currency={mt5_trade_account.currency}
                                    has_sign={!!mt5_trade_account.balance && mt5_trade_account.balance < 0}
                                    show_currency
                                />
                            </Text>
                        )}
                        {has_migration_status && (
                            <StatusBadge
                                className='trading-app-card__acc_status_badge'
                                account_status={mt5_trade_account.status}
                                icon={badge_icon}
                                text={badge_text}
                            />
                        )}
                    </div>
                </div>
                <div className='cfd-trade-modal__login-specs'>
                    <div className='cfd-trade-modal__login-specs-item'>
                        <Text className='cfd-trade-modal--paragraph'>{localize('Broker')}</Text>
                        <SpecBox is_bold is_broker value={mt5_trade_account?.landing_company} />
                    </div>
                    <div className='cfd-trade-modal__login-specs-item'>
                        <Text className='cfd-trade-modal--paragraph'>{localize('Server')}</Text>
                        <SpecBox
                            is_bold
                            value={(mt5_trade_account as TAdditionalDetailsOfEachMT5Loginid)?.server_info?.environment}
                        />
                    </div>
                    <div className='cfd-trade-modal__login-specs-item'>
                        <Text className='cfd-trade-modal--paragraph'>{localize('Login ID')}</Text>
                        <SpecBox is_bold value={(mt5_trade_account as TTradingPlatformAccounts)?.display_login} />
                    </div>
                    <div className='cfd-trade-modal__login-specs-item'>
                        <Text className='cfd-trade-modal--paragraph'>{localize('Password')}</Text>
                        <div className='cfd-trade-modal--paragraph'>
                            <PasswordBox
                                platform='mt5'
                                onClick={() => {
                                    const account_type = getCFDAccountKey({
                                        market_type: mt5_trade_account.market_type,
                                        sub_account_type: mt5_trade_account.sub_account_type,
                                        platform: CFD_PLATFORMS.MT5,
                                        shortcode: mt5_trade_account.landing_company_short,
                                        product,
                                    });
                                    onPasswordManager(
                                        mt5_trade_account?.login,
                                        getTitle(mt5_trade_account.market_type ?? '', show_eu_related_content),
                                        mt5_trade_account.account_type ?? '',
                                        account_type,
                                        (mt5_trade_account as TAdditionalDetailsOfEachMT5Loginid)?.server
                                    );
                                    toggleModal();
                                }}
                            />
                        </div>
                    </div>
                    <div className='cfd-trade-modal__maintenance'>
                        <Icon
                            icon='IcAlertWarning'
                            size={!isDesktop ? 28 : 20}
                            className='cfd-trade-modal__maintenance-icon'
                        />
                        <div className='cfd-trade-modal__maintenance-text'>
                            <Localize i18n_default_text='Server maintenance starts at 01:00 GMT every Sunday, and this process may take up to 2 hours to complete. Service may be disrupted during this time.' />
                        </div>
                    </div>
                    {isDesktop && is_window && mt5_trade_account.product !== PRODUCT.GOLD && (
                        <InformationBanner
                            information_icon={<StandaloneChartAreaRegularIcon fill='#095A66' iconSize='sm' />}
                            title={<Localize i18n_default_text='Alpha Generation guide' />}
                            description={
                                <Localize i18n_default_text='Tailor your indicators with expert-driven trend analysis.' />
                            }
                            redirect_icon={<StandaloneArrowUpRightRegularIcon fill='#000000' iconSize='sm' />}
                            link='https://docs.deriv.com/misc/alpha_generation_guide.pdf'
                        />
                    )}
                </div>
                {is_eligible_to_migrate && <MigrationBanner is_trade_modal />}

                {!isDesktop ? (
                    <MT5MobileRedirectOption mt5_trade_account={mt5_trade_account} />
                ) : (
                    <MT5DesktopRedirectOption account_title={getAccountTitle()} mt5_trade_account={mt5_trade_account} />
                )}
            </div>
        );
    }
);

export default DMT5TradeModal;
