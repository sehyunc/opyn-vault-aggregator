import React, { useCallback, useEffect, useState } from 'react'

import {
  FontisVaultConstructor,
  RibbonVaultConstructor,
  StakeDAOVaultConstructor,
} from 'models/types'
import { Vault } from 'models/Vault'

import {
  FONTIS_QUERY,
  FONTIS_URL,
  RIBBON_QUERY,
  RIBBON_URL,
  STAKEDAO_QUERY,
  STAKEDAO_URL,
} from './constants'
import VaultsContext from './VaultsContext'
import { ribbonAPYCalculation, getStakeDaoApy } from 'utils/helpers'

const VaultsProvider: React.FC = ({ children }) => {
  const [ribbonVaults, setRibbonVaults] = useState<Vault[]>([])
  const [fontisVaults, setFontisVaults] = useState<Vault[]>([])
  const [stakedaoVaults, setStakeDAOVaults] = useState<Vault[]>([])
  console.log('🚀 ~ stakedaoVaults', stakedaoVaults)
  const [allVaults, setAllVaults] = useState<Vault[]>([])

  const handleFetchStakeDAOVaults = useCallback(async () => {
    const { data } = await fetch(STAKEDAO_URL, {
      body: JSON.stringify({
        query: STAKEDAO_QUERY,
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then((res) => res.json())

    const apyData = getStakeDaoApy(data)
    const newVaults: Vault[] = []
    data.options.forEach((vault: StakeDAOVaultConstructor) => {
      const v = Vault.fromStakeDAOSubgraph({
        ...vault,
        platform: 'stakedao',
        apy: apyData[vault.id as any].apy as unknown as number,
      })
      newVaults.push(v)
    })
    setStakeDAOVaults(newVaults)
  }, [])

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
    // setAllVaults([...fontisVaults, ...ribbonVaults, ...stakedaoVaults])
    setAllVaults([...fontisVaults, ...ribbonVaults])
  }, [fontisVaults, ribbonVaults, stakedaoVaults])

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
        stakedaoVaults,
        onIdToVault: handleIdToVault,
        vaults: allVaults,
      }}
    >
      {children}
    </VaultsContext.Provider>
  )
}

export default VaultsProvider
