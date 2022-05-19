import {
  Box,
  Heading,
  useBreakpointValue,
  useColorMode,
} from "@chakra-ui/react";
//import { useStarknet } from "@starknet-react/core";
import { getStarknet } from "get-starknet";
import { useEffect, useState } from "react";

const SomeText = () => {
  const [account, setAccount] = useState("")

  const enable = async () => {
    const [userWalletContractAddress] = await getStarknet().enable()
    if (getStarknet().isConnected === false) {
      //throw Error("starknet wallet not connected")
    }
    else {
      console.log('connected with ', getStarknet().account.address)
      setAccount(getStarknet().account.address)
    }
  }
  enable()
  const { colorMode } = useColorMode();
  const textSize = useBreakpointValue({
    base: "xs",
    sm: "md",
  });
  useEffect(() => {
    enable()
  }, [getStarknet().isConnected])

  return (
    <>
      <Heading as="h2" fontSize="3xl">
        Hello,{" "}
        {account
          ? `${account.substring(0, 4)}...${account.substring(
            account.length - 4
          )}`
          : "anon"}
      </Heading>

      {!account && (
        <Box
          backgroundColor={colorMode === "light" ? "gray.200" : "gray.500"}
          padding={4}
          marginTop={4}
          borderRadius={4}
        >
          <Box fontSize={textSize}>Connect your wallet to interact!</Box>
        </Box>
      )}
    </>
  );
};

export default SomeText;
