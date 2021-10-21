import React, { useCallback, useEffect, useState } from 'react'

import { FontisVaultConstructor, RibbonVaultConstructor } from 'models/types'
import { Vault } from 'models/Vault'

import {
  FONTIS_QUERY,
  FONTIS_URL,
  RIBBON_QUERY,
  RIBBON_URL,
} from './constants'
import VaultsContext from './VaultsContext'
import { ribbonAPYCalculation } from 'utils/helpers'

const VaultsProvider: React.FC = ({ children }) => {
  const [ribbonVaults, setRibbonVaults] = useState<Vault[]>([])
  const [fontisVaults, setFontisVaults] = useState<Vault[]>([])
  const [stakeDAOVaults, setStakeDAOVaults] = useState<Vault[]>([])
  const [allVaults, setAllVaults] = useState<Vault[]>([])

  const handleFetchStakeDAOVaults = useCallback(async () => {
    const stakeDAO : Vault = {
      name: "stake",
      apy: 0,
      cap: '1000000000',
      decimals: 0,
      externalLink: '',
      id: '0xaoeoiagjioejg',
      lockedAmount: '1000000000000',
      platform: 'stakeDAO',
      symbol: 'stakeTest',
      underlyingSymbol: 'WETH'
    };
    const newVaults : Vault[] = [];
    newVaults.push(stakeDAO);
    setStakeDAOVaults(newVaults);

  },[]);

  const handleFetchFontisVaults = useCallback(async () => {
    const { data } = await fetch(FONTIS_URL, {
      body: JSON.stringify({
        query: FONTIS_QUERY,
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json())

    const newVaults: Vault[] = []
    data.mintAndSells.forEach((vault: FontisVaultConstructor) => {
      const v = Vault.fromFontisSubgraph(vault)
      newVaults.push(v)
    })
    setFontisVaults(newVaults)
  }, [])

  const handleFetchRibbonVaults = useCallback(async () => {
    const { data } = await fetch(RIBBON_URL, {
      body: JSON.stringify({
        query: RIBBON_QUERY,
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json())

    const apyData = ribbonAPYCalculation(data.vaultOptionTrades)
    const newVaults: Vault[] = []
    data.vaults.forEach((vault: RibbonVaultConstructor) => {
      const v = Vault.fromRibbonSubgraph({
        ...vault,
        platform: 'ribbon',
        yieldFromPremium: apyData[vault.name],
      })
      newVaults.push(v)
    })
    setRibbonVaults(newVaults)
  }, [])

  const handleIdToVault = useCallback(
    (vaultIds: string[]) => {
      const vaults: Vault[] = []
      vaultIds.forEach((id) => {
        const v = allVaults.find((e) => e.id === id)
        if (!v) return
        vaults.push(v)
      })
      return vaults
    },
    [allVaults]
  )

  useEffect(() => {
    setAllVaults([...fontisVaults, ...ribbonVaults, ...stakeDAOVaults])
  }, [fontisVaults, ribbonVaults, stakeDAOVaults])

  useEffect(() => {
    handleFetchFontisVaults()
  }, [handleFetchFontisVaults])

  useEffect(() => {
    handleFetchRibbonVaults()
  }, [handleFetchRibbonVaults])
  
  useEffect(() => {
    handleFetchStakeDAOVaults()
  }, [handleFetchStakeDAOVaults])

  return (
    <VaultsContext.Provider
      value={{
        fontisVaults,
        ribbonVaults,
        stakeDAOVaults,
        onIdToVault: handleIdToVault,
        vaults: allVaults,
      }}
    >
      {children}
    </VaultsContext.Provider>
  )
}

export default VaultsProvider
