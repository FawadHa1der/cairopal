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

import { getStarknet } from "@argent/get-starknet"


// import { transformCallsToMulticallArrays } from "starknet/utils/transaction";


export async function getStaticProps() {
  const compiledDirectory = path.join(process.cwd(), 'src/compiledcairo');
  const fullStakingPath = path.join(compiledDirectory, "StakingPool.json");

  const fullRicksPath = path.join(compiledDirectory, "ricks.json");
  const erc721Path = path.join(compiledDirectory, "erc721.json");
  const erc20Path = path.join(compiledDirectory, "erc20.json");

  //  JSON.parse(JSON.stringify(request.results)); 

  return {
    props: {
      stakingpool: fs.readFileSync(fullStakingPath).toString("ascii"),
      ricks: fs.readFileSync(fullRicksPath).toString("ascii"),
      erc721: fs.readFileSync(erc721Path).toString("ascii"),
      erc20: fs.readFileSync(erc20Path).toString("ascii")
    }
  };
}
interface PhotoProps {
  stakingpool: any;
  ricks: any;
  erc721: any;
  erc20: any
}


export const createContract = (address, ABI) => {
  return new Contract(ABI, address, getStarknet().provider);
};

export const callContract = async (contract, method, ...args) => {
  try {
    return await contract.call(method, args);
  } catch (ex) {
    return Promise.reject(ex);
  }
};

export const sendTransaction = async (contract, method, args = {}) => {
  try {
    const calldata = stark.compileCalldata(args);
    const transaction = {
      contractAddress: contract.address,
      entrypoint: method,
      calldata
    };
    return await getStarknet().account.execute(transaction);
  } catch (ex) {
    return Promise.reject(ex);
  }
};

export const waitForTransaction = async (transactionHash, requiredStatus, retryInterval = 5000) => {
  return new Promise((resolve, reject) => {
    let processing = false;
    const intervalId = setInterval(async () => {
      if (processing) return;
      const statusPromise = defaultProvider.getTransactionStatus(transactionHash);
      processing = true;
      try {
        const { tx_status } = await statusPromise;
        if (
          tx_status === requiredStatus ||
          (TransactionStatusStep[tx_status] > TransactionStatusStep[requiredStatus] &&
            !isRejected(tx_status))
        ) {
          clearInterval(intervalId);
          resolve(tx_status);
        } else if (isRejected(tx_status)) {
          clearInterval(intervalId);
          reject();
        } else {
          processing = false;
        }
      } catch (ex) {
        processing = false;
      }
    }, retryInterval);
  });
};

export default function Photos(props: PhotoProps) {
  const rewardToken = '0x07394cbe418daa16e42b87ba67372d4ab4a5df0b05c6e554d158458ce245bc10';

  const router = useRouter();
  const [data, setData] = useState<IFractionalize>();
  const [pic, setPic] = useState<NFTData>();

  const [stkAddress, setStkAddress] = useState<string>();
  const [ricksAddress, setRicksAddress] = useState<string>();



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
    console.log('fractionData  ', fractionData)
    toast({ description: 'This might take 3-10 mins deploying to goerli test net' })
    const { stakingpool } = props.stakingpool;
    const stakingpoolresponse = await getStarknet().provider.deployContract({
      contract: json.parse(props.stakingpool)
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
    await getStarknet().provider.waitForTransaction(stakingpoolresponse.transaction_hash);

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
      _initial_supply: fractionData.no_of_ricks,
      _daily_inflation_rate: fractionData.inflation,
      _auction_length: '10800',
      _auction_interval: '0',
      _min_bid_increase: '10',
      _staking_pool_contract: (stakingpoolresponse.address)?.toString() as string,
      _reward_contract: rewardToken
    });

    const rickscompiled = json.parse(props.ricks);

    const ricksresponse = await defaultProvider.deployContract({
      contract: rickscompiled,
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
    await getStarknet().provider.waitForTransaction(ricksresponse.transaction_hash);


    const info = `StakingPool address is ${stakingpoolresponse.address?.toString()} \n Ricks address is ${(ricksresponse.address)?.toString()}`;
    setStkAddress(stakingpoolresponse.address?.toString())
    setRicksAddress(ricksresponse.address?.toString())
    console.log(info)

    const ricks = new Contract(rickscompiled.abi, ricksresponse.address as string);
    console.log('pic.contract_address ', pic?.contract_address, 'pic.token_id ', pic?.token_id);

    const erc20compiled = json.parse(props.erc20);
    const erc721compiled = json.parse(props.erc721);

    const erc721 = new Contract(erc721compiled.abi, pic?.contract_address as string);
    const erc20 = new Contract(erc20compiled.abi, rewardToken);

    console.log('pic.contract_address ', pic?.contract_address, 'pic.token_id ', pic?.token_id);
    console.log(`Waiting for Tx to be Accepted on Starknet - Approval for ricks for the token...`);

    //toast.closeAll()
    toast({ description: 'Giving approval to ricks for the nft' });

    //sendTransaction(erc721, erc721.approve,)
    const { transaction_hash: approveTxHash } = getStarknet().account.execute(erc721.approve(
      ricksresponse.address, [0, pic?.token_id as string]
    ));

    // const { transaction_hash: approveTxHash } = await erc721.approve(
    //   ricksresponse.address, [0, pic?.token_id as string]
    // );

    //    toast.closeAll()
    toast({ description: 'Giving approval to ricks for the reward token' });
    const { transaction_hash: approveerc20TxHash } = await erc20.approve(
      ricksresponse.address, [0, '100000']
    );


    toast.closeAll()
    toast({ description: 'Activating ricks', duration: Infinity });

    const { transaction_hash: activateTxHash } = await ricks.activate(
      pic?.contract_address as string, pic?.token_id as string
    );

    console.log(`Waiting for Tx to be Accepted on Starknet - activating...`);
    await defaultProvider.waitForTransaction(activateTxHash);

    toast.closeAll()
    toast({ description: 'Start the auction', duration: Infinity });
    const { transaction_hash: startTxHash } = await ricks.start_auction(
      "10"
    );
    toast({ description: 'starting auction' });
    toast.closeAll()

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

