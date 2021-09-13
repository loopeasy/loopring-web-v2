import React, { useCallback, useEffect, useState } from 'react'
import {  Box,
    Typography } from '@mui/material'
import styled from '@emotion/styled'
import { TFunction, withTranslation, WithTranslation } from 'react-i18next'
// import { useHistory } from 'react-router-dom'
// import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state'
import { Column, Table } from '../../basic-lib'
// import { TablePagination } from '../../basic-lib'
import { Filter } from './components/Filter'
import { TableFilterStyled, TablePaddingX } from '../../styled'
import { getValuePrecisionThousand, PriceTag } from '@loopring-web/common-resources';
import { useSettings } from '../../../stores'
import { CoinIcons } from './components/CoinIcons';
import ActionMemo from './components/ActionMemo';



const TableWrap = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    flex: 1;
    --template-columns: 200px 150px auto auto ${(props: any) => props.lan === 'en_US' ? '285px' : '240px'} !important;

    .rdg-cell:first-of-type {
      display: flex;
      align-items: center;
      margin-top: ${({theme}) => theme.unit / 8}px;
    }

    .rdg-cell.action {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .textAlignRight {
        text-align: right;
    }
  }

  

  ${({theme}) => TablePaddingX({pLeft: theme.unit * 3, pRight: theme.unit * 3})}
` as any

// const IconWrapperStyled = styled(Box)`
//     margin-top: ${({theme}) => theme.unit * 1.1}px;
//     svg {
//         width: ${({theme}) => theme.unit * 2}px;
//         height: ${({theme}) => theme.unit * 2}px;
//     }
// `



interface Row {
    token: {
        type: TokenType;
        value: string;
    };
    amount: string;
    available: string;
    locked: string;
    filterColumn?: string
    tradePairList?: {
        first: string;
        last: string;
    }[]
    cellExpend?: {
        value: string
        children: []
        isExpanded: boolean
    }
    children?: Row[]
    isExpanded?: boolean
    format?: any
}

export enum TokenType {
    single = 'single',
    lp = 'lp'
}

export type TradePairItem = {
    first: string;
    last: string;
}

export enum LpTokenAction {
    add = 'add',
    remove = 'remove'
}

export type RawDataAssetsItem = {
    token: {
        type: TokenType,
        value: string
    }
    amount: string;
    available: string;
    locked: string;
    tradePairList?: TradePairItem[];
    smallBalance: boolean;
    tokenValueDollar: number;
    tokenValueYuan: number;
}

export interface AssetsTableProps {
    rawData: RawDataAssetsItem[];
    pagination?: {
        pageSize: number
    }
    tableHeight?: number,
    onVisibleRowsChange?: (props: any) => void
    showFilter?: boolean
    onShowDeposit: (token: string) => void,
    onShowTransfer: (token: string) => void,
    onShowWithdraw: (token: string) => void,
    onLpDeposit: (token: string, type: LpTokenAction) => void,
    onLpWithdraw: (token: string, type: LpTokenAction) => void,
    getMarketArrayListCallback: (token: string) => string[],
    // hideL2Assets: boolean,
    hideLpToken: boolean,
    hideSmallBalances: boolean,
    // setHideL2Assets: (value: boolean) => void,
    setHideLpToken: (value: boolean) => void,
    setHideSmallBalances: (value: boolean) => void,
}

const RowConfig = {
    rowHeight: 44,
    headerRowHeight: 44,

}

export const AssetsTable = withTranslation('tables')((props: WithTranslation & AssetsTableProps) => {
    const {
        t,
        // pagination,
        rawData,
        // onVisibleRowsChange,
        showFilter,
        onShowDeposit,
        onShowTransfer,
        onShowWithdraw,
        // tableHeight = 350,
        getMarketArrayListCallback,
        // onLpWithdraw,
        // hideL2Assets,
        hideLpToken,
        hideSmallBalances,
        // setHideL2Assets,
        setHideLpToken,
        setHideSmallBalances,
        ...rest
    } = props

    // const [searchValue, setSearchValue] = useState('')
    // const [hideSmallBalance, setHideSmallBalance] = useState(false)
    // const [hideLpToken, sethideLpToken] = useState(false)
    const [filter, setFilter] = useState({
        searchValue: '',
        // hideSmallBalance:false,
        // hideLpToken:false
    })
    const [totalData, setTotalData] = useState<RawDataAssetsItem[]>(rawData)
    const [viewData, setViewData] = useState<RawDataAssetsItem[]>(rawData)
    const [tableHeight, setTableHeight] = React.useState(props.tableHeight);

    const resetTableData = React.useCallback((viewData) => {
        setViewData(viewData)
        setTableHeight(RowConfig.headerRowHeight + viewData.length * RowConfig.rowHeight)
    }, [setViewData, setTableHeight])
    // const [page, setPage] = useState(1)
    // const pageSize = pagination ? pagination.pageSize : 10;

    const {language} = useSettings()
    const {coinJson, currency} = useSettings();
    // const rightState = usePopupState({variant: 'popover', popupId: `action-popover`});
    const isUSD = currency === 'USD'
    useEffect(() => {
        setTotalData(rawData);
    }, [rawData])
    useEffect(() => {
        updateData();
    }, [totalData, filter, hideLpToken, hideSmallBalances])







    const getColumnModeAssets = (t: TFunction): Column<Row, unknown>[] => [
        {
            key: 'token',
            name: t('labelToken'),
            formatter: ({row, column}) => {
                const token = row[ column.key ]
                let tokenIcon: [any,any] = [undefined,undefined]
                const [head, middle, tail] = token.value.split('-')
                if (token.type === 'lp' && middle && tail) {
                    tokenIcon = coinJson[ middle ] && coinJson[ tail ] ? [coinJson[ middle ], coinJson[ tail ]] : [undefined, undefined]
                }
                if (token.type !== 'lp' && head && head !== 'lp') {
                    tokenIcon = coinJson[ head ] ? [coinJson[ head ], undefined] : [undefined, undefined]
                }
               return <>
                   <CoinIcons tokenIcon={tokenIcon}/>
                   <Typography variant={'inherit'} display={'flex'} flexDirection={'column'} marginLeft={1}
                               component={'div'}
                               paddingRight={1}>
                       <Typography component={'h3'} color={'textPrimary'} title={'sell'}>
                           <Typography component={'span'} className={'next-coin'}>
                               {token.value}
                           </Typography>
                       </Typography>
                   </Typography>
                </>
            }
        },
        {
            key: 'amount',
            name: t('labelAmount'),
            headerCellClass: 'textAlignRight',
            formatter: ({row}) => {
                const value = row[ 'amount' ]
                return <Box className={'textAlignRight'}>
                    {getValuePrecisionThousand(value, 6, 2)}
                </Box>
            }
        },
        // {
        //     key: 'available',
        //     name: t('labelAvailable'),
        // },
        {
            key: 'locked',
            name: t('labelLocked'),
            headerCellClass: 'textAlignRight',
            formatter: ({row}) => {
                const value = row[ 'locked' ]
                return <Box className={'textAlignRight'}>
                    {getValuePrecisionThousand(value, 6, 2)}
                </Box>

            }
        },
        {
            key: 'value',
            name: t('labelAssetsTableValue'),
            headerCellClass: 'textAlignRight',
            formatter: ({row}) => {
                const tokenValueDollar = row[ 'tokenValueDollar' ]
                const tokenValueYuan = row[ 'tokenValueYuan' ]
                const renderValue = isUSD ? tokenValueDollar : tokenValueYuan
                return <Box className={'textAlignRight'}>
                    {isUSD ? PriceTag.Dollar : PriceTag.Yuan}{getValuePrecisionThousand(renderValue, 2, 2)}
                </Box>
            }
        },
        {
            key: 'actions',
            name: t('labelActions'),
            headerCellClass: 'textAlignRight',
            // minWidth: 280,
            formatter:  ({row}) => {
                const token = row[ 'token' ]
                const isLp = token.type === TokenType.lp
                const lpPairList = token.value.split('-')
                lpPairList.splice(0, 1)
                const lpPair = lpPairList.join('-')
                const tokenValue = token.value
                const renderMarket:`${string}-${string}` = (isLp ? lpPair : tokenValue) as `${string}-${string}`;
                return  <ActionMemo {...{t,tokenValue,getMarketArrayListCallback,isLp,
                        market:renderMarket,onShowDeposit,onShowTransfer,onShowWithdraw}}/>
            }
        },
    ]
    //
    //
    // const defaultArgs: any = {
    //     // rawData: [],
    //     columnMode: getColumnModeAssets(t).filter(o => !o.hidden),
    //     generateRows:generateRows
    //     generateColumns: ({columnsRaw}: any) => columnsRaw as Column<any, unknown>[],
    // }


    // const getRenderData = useCallback(() => pagination
    //     ? totalData.slice((page - 1) * pageSize, page * pageSize)
    //     : totalData
    //     , [page, pageSize, pagination, totalData])

    const updateData = useCallback(() => {
        let resultData = (totalData && !!totalData.length) ? totalData : []
        // if (filter.hideSmallBalance) {
        if (hideSmallBalances) {
            resultData = resultData.filter(o => !o.smallBalance)
        }
        // if (filter.hideLpToken) {
        if (hideLpToken) {
            resultData = resultData.filter(o => o.token.type === TokenType.single)
            // debugger
        }
        if (filter.searchValue) {
            resultData = resultData.filter(o => o.token.value.toLowerCase().includes(filter.searchValue.toLowerCase()))
        }
        resetTableData(resultData)
    }, [totalData, filter, hideSmallBalances, hideLpToken, resetTableData])

    const handleFilterChange = useCallback((filter) => {
        // setHideSmallBalance(currHideSmallBalance)
        // sethideLpToken(currhideLpToken)
        // setSearchValue(currSearchValue)
        // console.log(filter)

        setFilter(filter)
    }, [setFilter])

    // const handlePageChange = useCallback((page: number) => {
    //     // setPage(page)
    //     updateData({TableType: TableType.page})
    // }, [updateData])

    // const getScrollIndex = useCallback((e) => {
    //     const startIndex = parseInt(String(e.target.scrollTop / 44))
    //     const viewportRows = rawData && Array.isArray(rawData) ? rawData.slice(startIndex, startIndex + 10).map(o => o.token.value) : []
    //     if (onVisibleRowsChange) {
    //         onVisibleRowsChange(viewportRows)
    //     }
    // }, [onVisibleRowsChange, rawData])
    return <TableWrap lan={language}>
        {showFilter && (
            <TableFilterStyled>
                <Filter
                    {...{
                        handleFilterChange,
                        filter,
                        hideLpToken,
                        hideSmallBalances,
                        setHideLpToken,
                        setHideSmallBalances,
                    }}
                    // originalData={rawData}
                    // handleFilterChange={handleFilterChange}
                    // filter={filter}
                    // searchValue={filter.searchValue}
                    // hideSmallBalance={filter.hideSmallBalance}
                    // hideLpToken={filter.hideLpToken}
                />
            </TableFilterStyled>

        )}

        <Table
            {...{...rest, t}}
            showloading={!viewData.length}
            style={{height: tableHeight}}
            rowHeight={RowConfig.rowHeight}
            headerRowHeight={RowConfig.headerRowHeight}
            rawData={viewData}
            generateRows={(rowData: any) => rowData}
            generateColumns={({columnsRaw}: any) => columnsRaw as Column<any, unknown>[]}
            columnMode={getColumnModeAssets(t).filter(o => !o.hidden)}

        />
        {/*{pagination && (*/}
        {/*    <TablePagination page={page} pageSize={1} total={totalData.length} onPageChange={handlePageChange}/>*/}
        {/*)}*/}
    </TableWrap>
})
