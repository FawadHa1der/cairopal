import { FractionalizeForm } from "components/wallet";
import { NFTData } from "components/wallet/NFTData";
import { useState } from "react";
import { IFractionalize } from "components/wallet/FractionalizeForm";
import React, { useEffect } from "react";

import {
  Box,
  Divider,
  Center,
  Text,
  Flex,
  Spacer,
  Button,
} from "@chakra-ui/react";
import { useToast } from '@chakra-ui/react'
import { utils } from "ethers"

import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { InfoIcon, AtSignIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import fs from 'fs';
import path from 'path';
import { getStarknet } from "get-starknet";

import {
  Contract,
  Account,
  defaultProvider,
  ec,
  encode,
  hash,
  json,
  number,
  stark,
  shortString,
  uint256,
  Abi,
  CompiledContract
} from "starknet";
import { sendTransaction } from "utils/blockchain/starknet";

import ricksompiledcontract from "../compiledcairo/RICKS.json";
import stakingpoolcompiledcontract from "../compiledcairo/StakingPool.json";
import erc20compiledcontract from "../compiledcairo/erc20.json";
import erc721compiledcontract from "../compiledcairo/erc721.json";


// import { transformCallsToMulticallArrays } from "starknet/utils/transaction";

interface PhotoProps {
  stakingpool: any;
  ricks: any;
  erc721: any;
  erc20: any
}

function getUint256CalldataFromBN(bn: number.BigNumberish) {
  return { type: "struct" as const, ...uint256.bnToUint256(bn) }
}

function parseInputAmountToUint256(input: string, decimals = 18) {
  return getUint256CalldataFromBN(utils.parseUnits(input, decimals).toString())
}


export default function Photos() {
  const rewardToken = '0x07394cbe418daa16e42b87ba67372d4ab4a5df0b05c6e554d158458ce245bc10';

  const router = useRouter();
  const [data, setData] = useState<IFractionalize>();
  const [pic, setPic] = useState<NFTData>();

  const [stkAddress, setStkAddress] = useState<string>();
  const [ricksAddress, setRicksAddress] = useState<string>();

  //console.log("props  ", props);

  // let pic = null;
  // console.log("pic ", query);
  useEffect(() => {
    if (!!router.query.data)
      setPic(JSON.parse(router.query.data as string) as NFTData);
    console.log("pic  ", pic);
  }, [router.query]);

  const toast = useToast();

  async function onRegistered(fractionData: IFractionalize) {

    setData(fractionData);
    console.log('fractionData  ', fractionData)
    toast({ description: 'This might take 3-10 mins deploying to goerli test net' })
    const stakingpoolresponse = await getStarknet().provider.deployContract({
      contract: stakingpoolcompiledcontract as CompiledContract
      //  contract: json.parse(props.stakingpool)
    });

    console.log("Waiting for Tx to be Accepted on Starknet - stakingpool Deployment...");
    await getStarknet().provider.waitForTransaction(stakingpoolresponse.transaction_hash);

    console.log("staking pool address", (stakingpoolresponse.address))
    const callDatahash = stark.compileCalldata({
      name: shortString.encodeShortString("ricks"),
      symbol: shortString.encodeShortString("ricks"),
      decimals: '18',
      _initial_supply: fractionData.no_of_ricks,
      _daily_inflation_rate: fractionData.inflation,
      _auction_length: '10800',
      _auction_interval: '0',
      _min_bid_increase: '10',
      _staking_pool_contract: (stakingpoolresponse.address)?.toString() as string,
      _reward_contract: rewardToken
    });

    //const rickscompiled = json.parse(props.ricks);

    const ricksresponse = await defaultProvider.deployContract({
      contract: ricksompiledcontract as CompiledContract,
      constructorCalldata: callDatahash
    });

    console.log("Waiting for Tx to be Accepted on Starknet - ricks Deployment...");
    await defaultProvider.waitForTransaction(ricksresponse.transaction_hash);

    const info = `StakingPool address is ${stakingpoolresponse.address?.toString()} \n Ricks address is ${(ricksresponse.address)?.toString()}`;
    setStkAddress(stakingpoolresponse.address?.toString())
    setRicksAddress(ricksresponse.address?.toString())
    console.log(info)

    const ricks = new Contract((ricksompiledcontract as CompiledContract).abi, ricksresponse.address as string);
    console.log('pic.contract_address ', pic?.contract_address, 'pic.token_id ', pic?.token_id);

    // const erc20compiled = json.parse(props.erc20);
    // const erc721compiled = json.parse(props.erc721);

    const erc721 = new Contract((erc721compiledcontract as CompiledContract).abi, pic?.contract_address as string);
    const erc20 = new Contract((erc20compiledcontract as CompiledContract).abi, rewardToken);

    console.log('pic.contract_address ', pic?.contract_address, 'pic.token_id ', pic?.token_id);
    console.log(`Waiting for Tx to be Accepted on Starknet - Approval for ricks for the token...`);

    toast({ description: 'Giving approval to ricks for the nft', duration: Infinity });
    const toAddress = ricksresponse?.address?.toString() as string
    const tokenId = pic?.token_id as string

    let transaction_response = await sendTransaction(erc721, 'approve', { to: toAddress, tokenId: parseInputAmountToUint256(tokenId) })
    console.log(`Waiting for erc721 approve Tx ${transaction_response.transaction_hash} to be Accepted `);
    await getStarknet().provider.waitForTransaction(transaction_response.transaction_hash);

    toast({ description: 'Giving approval to ricks for the reward token', duration: Infinity });
    transaction_response = await sendTransaction(erc20, 'approve', { spender: toAddress, amount: '100000' })
    console.log(`Waiting for erc20 approve Tx ${transaction_response.transaction_hash} to be Accepted `);
    await getStarknet().provider.waitForTransaction(transaction_response.transaction_hash);

    toast({ description: 'Activating ricks', duration: Infinity });
    transaction_response = await sendTransaction(ricks, 'activate', { _token: erc721.address, _token_id: pic?.token_id })
    console.log(`Waiting for ricks activating Tx ${transaction_response.transaction_hash} to be Accepted `);
    await getStarknet().provider.waitForTransaction(transaction_response.transaction_hash);

    toast({ description: 'Start the auction', duration: Infinity });
    transaction_response = await sendTransaction(ricks, 'start_auction', { bid: '100' })
    console.log(`Waiting for ricks start_auction ${transaction_response.transaction_hash} to be Accepted `);
    await getStarknet().provider.waitForTransaction(transaction_response.transaction_hash);

    toast({ description: 'Success in starting the auction', duration: Infinity });
  }

  return (
    <Box p="2rem" bg="gray.200" minH="100vh">
      <Head>
        <title> Image: {pic?.name}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Flex px="1rem" justify="center" align="center">
        <Text
          letterSpacing="wide"
          textDecoration="underline"
          as="h2"
          fontWeight="semibold"
          fontSize="xl"
        >
          <AtSignIcon />
          {pic?.description}
        </Text>
        <Spacer />
        <Box as="a" target="_blank" href={pic?.copy_image_url}>
          <InfoIcon focusable="true" boxSize="2rem" color="red.500" />{" "}
        </Box>{" "}
        <Spacer />
        <Link href="/" >
          <Button
            as="a"
            borderRadius="full"
            colorScheme="pink"
            fontSize="lg"
            size="lg"
            cursor="pointer"
          >
            🏠 Home
          </Button>
        </Link>
      </Flex>
      <Divider my="1rem" />

      <Center>
        <Box as="a" target="_blank" href={pic?.copy_image_url}>
          <Image
            src={(!!pic) ? (!!pic.copy_image_url) ? pic.copy_image_url : '/vercel.svg' : '/vercel.svg'}
            width={300}
            height={300}
            loading="eager"
          />
        </Box>
      </Center>

      <FractionalizeForm onRegistered={onRegistered} nftdata={pic} />

      <Text
        letterSpacing="wide"
        textDecoration="underline"
        as="h3"
        fontWeight="semibold"
        fontSize="l"
      >
        <Divider my="1rem" />

        Staking Pool Address {stkAddress}
        <Divider my="1rem" />

        Ricks Address {ricksAddress}
      </Text>

    </Box >

  );
}

