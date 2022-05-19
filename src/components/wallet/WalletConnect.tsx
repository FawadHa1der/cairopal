import { Button } from "@chakra-ui/react";
//import { useStarknet } from "@starknet-react/core";
import { getStarknet } from "get-starknet";
import { useEffect, useState } from "react";

const WalletConnect = () => {
  // const starknet = getStarknet()

  // const account = getStarknet().account.address;
  // const hasStarknet = getStarknet().isConnected;
  const [argentAccount, setArgentAccount] = useState("")
  const enable = async () => {
    const [userWalletContractAddress] = await getStarknet().enable()
    if (getStarknet().isConnected === true) {
      console.log('connected with ', getStarknet().account.address)
      setArgentAccount(getStarknet().account.address)
    }
    else {
      // throw Error("starknet wallet not connected")
    }
  }

  // useEffect(() => {
  //   setArgentAccount(getStarknet().account.address)
  // }, [getStarknet().account.address])

  async function enableArgentX() {
    // Check if wallet extension is installed and initialized.
    console.log('trying t o connect')
    // May throw when no extension is detected, otherwise shows a modal prompting the user to download Argent X.
    const [userWalletContractAddress] = await getStarknet().enable({ showModal: true })
    // checks that enable succeeded
    if (getStarknet().isConnected === false) {
      //  throw Error("starknet wallet not connected")
    }
    else {
      console.log('show modal connected with ', getStarknet().account.address)
      setArgentAccount(getStarknet().account.address)

    }
  }

  //  enable()
  if (getStarknet().isConnected === false) {
    console.log('yep its not enabled')
  }
  else {
    console.log('yep its enabled now')
  }
  return (getStarknet().isConnected === false) ? (
    !!argentAccount ? (
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
      {argentAccount
        ? `${argentAccount.substring(0, 4)}...${argentAccount.substring(
          argentAccount.length - 4
        )}`
        : "No Account"}
    </Button>
  );
};

export default WalletConnect;
