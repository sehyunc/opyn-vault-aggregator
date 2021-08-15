import {KOVAN_FONTIS_PERP_VAULT, KOVAN_TWBTC_ADDRESS, KOVAN_TUSDCP_ETH_ADDRESS, KOVAN_TETHC_ADDRESS, TETHC_ADDRESS, TWBTC_ADDRESS, TUSDCP_ETH_ADDRESS, FONTIS_PERP_VAULT} from '../constants/constants'
export const getVaultAddress = (
  platform: string,
  vault: string,
  test: boolean = true
): string | undefined => {
  if (test) {
    switch (platform) {
      case "ribbon":
        switch (vault) {
          case "T-ETH-C":
            return KOVAN_TETHC_ADDRESS;
          case "T-WBTC-C":
            return KOVAN_TWBTC_ADDRESS;
          case "T-USDC-P-ETH":
            return KOVAN_TUSDCP_ETH_ADDRESS;
          default:
            return;
        }
      case "fontis":
        switch (vault) {
          case "PerpVault":
            return KOVAN_FONTIS_PERP_VAULT;
          default:
            return;
        }
      default:
        return;
    }
  }

  switch (platform) {
    case "ribbon":
      switch (vault) {
        case "T-ETH-C":
          return TETHC_ADDRESS;
        case "T-WBTC-C":
          return TWBTC_ADDRESS;
        case "T-USDC-P-ETH":
          return TUSDCP_ETH_ADDRESS;
        default:
          return;
      }
    case "fontis":
      switch (vault) {
        case "PerpVault":
          return FONTIS_PERP_VAULT;
        default:
          return;
      }
    default:
      return;
  }
};
