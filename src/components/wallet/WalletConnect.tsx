import { Button } from "@chakra-ui/react";
//import { useStarknet } from "@starknet-react/core";
import { getStarknet } from "get-starknet";
import { useEffect, useState } from "react";

const WalletConnect = () => {

  // const account = getStarknet().account.address;
  // const hasStarknet = getStarknet().isConnected;
  const [account, setAccount] = useState(getStarknet().account.address)
  useEffect(() => {
    setAccount(getStarknet().account.address)
  }, [getStarknet().account.address])

  async function enableArgentX() {
    // Check if wallet extension is installed and initialized.
    const starknet = getStarknet()
    // May throw when no extension is detected, otherwise shows a modal prompting the user to download Argent X.
    const [userWalletContractAddress] = await starknet.enable({ showModal: true })
    // checks that enable succeeded
    if (starknet.isConnected === false) {
      throw Error("starknet wallet not connected")
    }
  }

  // enableArgentX();

  return !getStarknet().account ? (
    !getStarknet().isConnected ? (
      <Button
        ml="4"
        textDecoration="none !important"
        outline="none !important"
        boxShadow="none !important"
      >
        <a href="https://github.com/argentlabs/argent-x">Get Argent-X</a>
      </Button>
    ) : (
      <Button
        ml="4"
        textDecoration="none !important"
        outline="none !important"
        boxShadow="none !important"
        onClick={() => {
          enableArgentX()
        }}
      >
        Connect Wallet
      </Button>
    )
  ) : (
    <Button
      ml="4"
      textDecoration="none !important"
      outline="none !important"
      boxShadow="none !important"
      // HACK: refresh to disconnect
      // TODO: actually disconnect when supported in starknet-react
      onClick={() => { window.location.reload(); }}
    >
      {getStarknet().account.address
        ? `${getStarknet().account.address.substring(0, 4)}...${getStarknet().account.address.substring(
          getStarknet().account.address.length - 4
        )}`
        : "No Account"}
    </Button>
  );
};

export default WalletConnect;
