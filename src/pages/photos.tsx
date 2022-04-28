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

import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { InfoIcon, AtSignIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import fs from 'fs';
import path from 'path';
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
  shortString
} from "starknet";

// import { transformCallsToMulticallArrays } from "starknet/utils/transaction";

import stakingpoolabi from "./compiledcairo/stakingpool.json";
import ricksabi from "./compiledcairo/ricks.json";

export async function getStaticProps() {
  // const compiledDirectory = path.join(process.cwd(), 'src/compiledcairo');
  // const fullStakingPath = path.join(compiledDirectory, "StakingPool.json");

  // const fullRicksPath = path.join(compiledDirectory, "ricks.json");

  //  JSON.parse(JSON.stringify(request.results)); 
  // return { props: { stakingpool: fs.readFileSync("../../src/compiledcairo/StakingPool.json").toString("ascii"), ricks: fs.readFileSync(fullRicksPath).toString("ascii") } };

  return { props: { stakingpool: stakingpoolabi, ricks: ricksabi } };
}
interface PhotoProps {
  stakingpool: any;
  ricks: any;
}

export default function Photos(props: PhotoProps) {
  const router = useRouter();
  const [data, setData] = useState<IFractionalize>();
  const [pic, setPic] = useState<NFTData>();

  console.log("props  ", props);

  // let pic = null;
  // console.log("pic ", query);
  useEffect(() => {
    if (!!router.query.data)
      setPic(JSON.parse(router.query.data as string) as NFTData);
    console.log("pic  ", pic);
  }, [router.query]);

  const toast = useToast();

  // async function fractionalize(user: string) {
  //   const response = await axios.get("https://api-testnet.playoasisx.com/assets?owner_address=" + user);
  //   console.log(response);
  //   setPhotos(response.data);
  // }
  // const onRegistered = () => {
  // }
  async function onRegistered(fractionData: IFractionalize) {

    setData(fractionData);
    toast({ description: 'This might take 3-10 mins deploying to goerli test net' })
    const { stakingpool } = props.stakingpool;
    const stakingpoolresponse = await defaultProvider.deployContract({
      contract: JSON.parse(stakingpool)
    });

    // const stakingpoolresponse = await defaultProvider.deployContract({
    //   contract: JSON.parse(props.stakingpool, (key, value) => {
    //     if (typeof value === "string" && /^\d+n$/.test(value)) {
    //       return BigInt(value.substr(0, value.length - 1));
    //     }
    //     return value;
    //   },
    //   )
    // });

    console.log("Waiting for Tx to be Accepted on Starknet - stakingpool Deployment...");
    await defaultProvider.waitForTransaction(stakingpoolresponse.transaction_hash);

    // func constructor{syscall_ptr : felt*, pedersen_ptr : HashBuiltin*, range_check_ptr}(
    //   name : felt, symbol : felt, decimals : felt, _initial_supply : felt,
    //   _daily_inflation_rate : felt, _auction_length : felt, _auction_interval : felt,
    //   _min_bid_increase : felt, _staking_pool_contract : felt, _reward_contract : felt):


    // ricks_impl, abi = nre.deploy(
    //   "ricks", arguments=[f'{ricks}', f'{ricks}', f'{18}', f'{INITIAL_RICKS_SUPPLY}', f'{DAILY_INFLATION_RATE}', f'{AUCTION_LENGTH}', f'{AUCTION_INTERVAL}', f'{MIN_BID_INCREASE}', f'{stakingpool_impl}', f'{TEST_REWARD_TOKEN_ADDRESS}'], alias="ricks")

    console.log("staking pool address", (stakingpoolresponse.address))
    const callDatahash = stark.compileCalldata({
      name: shortString.encodeShortString("ricks"),
      symbol: shortString.encodeShortString("ricks"),
      decimals: '18',
      _initial_supply: '100',
      _daily_inflation_rate: '50',
      _auction_length: '10800',
      _auction_interval: '0',
      _min_bid_increase: '10',
      _staking_pool_contract: (stakingpoolresponse.address)?.toString() as string,
      _reward_contract: '0x07394cbe418daa16e42b87ba67372d4ab4a5df0b05c6e554d158458ce245bc10'
    });

    const ricks = props.ricks;

    const ricksresponse = await defaultProvider.deployContract({
      contract: JSON.parse(ricks),
      constructorCalldata: callDatahash
    });
    // const ricksresponse = await defaultProvider.deployContract({
    //   contract: JSON.parse(props.ricks, (key, value) => {
    //     if (typeof value === "string" && /^\d+n$/.test(value)) {
    //       return BigInt(value.substr(0, value.length - 1));
    //     }
    //     return value;
    //   }),
    //   constructorCalldata: callDatahash
    // });

    console.log("Waiting for Tx to be Accepted on Starknet - ricks Deployment...");
    await defaultProvider.waitForTransaction(ricksresponse.transaction_hash);

    toast.closeAll()

    const info = `StakingPool address is ${stakingpoolresponse.address?.toString()} \n Ricks address is ${(ricksresponse.address)?.toString()}`;
    console.log(info)
    toast({ description: info });

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
            src={(!!pic) ? pic.copy_image_url : '/vercel.svg'}
            width={300}
            height={300}
            loading="eager"
          />
        </Box>
      </Center>

      <FractionalizeForm onRegistered={onRegistered} nftdata={pic} />
    </Box >

  );
}

