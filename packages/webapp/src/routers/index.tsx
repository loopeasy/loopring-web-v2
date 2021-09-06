import { HashRouter as Router, Route, Switch, useLocation, } from 'react-router-dom'

import Header from 'layouts/header'

import QuotePage from 'pages/QuotePage'
import { SwapPage } from 'pages/SwapPage'

import Container from '@material-ui/core/Container'
import { Layer2Page } from '../pages/Layer2Page'
import { LiquidityPage } from '../pages/LiquidityPage'
import { MiningPage } from '../pages/MiningPage'

import { LAYOUT } from '../defs/common_defs';
import { Box } from '@material-ui/core';
import { ModalGroup } from '../modal';
import Footer from '../layouts/footer';
import React from 'react';
import store from 'stores'

import { resetSwap, resetAmmPool } from 'stores/router'

const RouterView = () => {

    const location = useLocation()

    React.useEffect(() => {
        store.dispatch(resetSwap(undefined))
        store.dispatch(resetAmmPool(undefined))
    }, [location?.pathname])

    return (<>
        <Header/>

        <Container maxWidth="lg"
                   style={{minHeight: `calc(100% - ${LAYOUT.HEADER_HEIGHT}px - 32px)`, display: 'flex', flexDirection: 'column'}}>
            <Box display={'flex'} flex={1} alignItems={'stretch'} flexDirection={'row'} marginTop={3}>
                <Switch>
                    <Route exact component={SwapPage} path='/'/>
                    <Route exact component={QuotePage} path='/markets'/>
                    <Route component={SwapPage} path='/trading/lite'/>
                    <Route component={SwapPage} path='/trading/lite(/:symbol)'/>
                    <Route exact component={MiningPage} path='/mining'/>

                    <Route exact component={Layer2Page} path='/layer2'/>
                    <Route exact component={Layer2Page} path='/layer2/assets'/>
                    <Route exact component={Layer2Page} path='/layer2/my-liquidity'/>
                    <Route exact component={Layer2Page} path='/layer2/history'/>
                    <Route exact component={Layer2Page} path='/layer2/order'/>
                    <Route exact component={Layer2Page} path='/layer2/rewards'/>
                    {/* <Route exact component={Layer2Page} path='/layer2/red-packet'/>
                    <Route exact component={Layer2Page} path='/layer2/security'/>
                    <Route exact component={Layer2Page} path='/layer2/vip'/> */}
                    {/* <Route exact component={Layer2Page} path='/layer2/transactions'/>
                    <Route exact component={Layer2Page} path='/layer2/trades'/>
                    <Route exact component={Layer2Page} path='/layer2/ammRecords'/> */}
                    {/* <Route exact component={Layer2Page} path='/layer2/orders'/> */}
                    <Route exact component={Layer2Page} path='/layer2/setting'/>

                    <Route exact component={LiquidityPage} path='/liquidity'/>
                    <Route exact component={LiquidityPage} path='/liquidity/pools/*'/>
                    <Route exact component={LiquidityPage} path='/liquidity/pools'/>
                    {/*<Route exact component={LiquidityPage} path='/liquidity/pools/coinPair(/:symbol)'/>*/}
                    <Route exact component={LiquidityPage} path='/liquidity/amm-mining'/>
                    <Route exact component={LiquidityPage} path='/liquidity/my-liquidity'/>
                    {/* <Route exact component={LiquidityPage} path='/liquidity/orderBook-Mining'/>
                    <Route exact component={LiquidityPage} path='/liquidity/maker-rebates'/> */}

                </Switch>
            </Box>
        </Container>
        {/*</Box>*/}
        <ModalGroup/>
        <Footer/>
    </>)
}

export default RouterView
