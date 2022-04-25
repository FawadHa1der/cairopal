import { FractionalizeForm } from "components/wallet";
import { NFTData } from "components/wallet/NFTData";
import { useState } from "react";
import { IFractionalize } from "components/wallet/FractionalizeForm";

import {
  Box,
  Divider,
  Center,
  Text,
  Flex,
  Spacer,
  Button,
} from "@chakra-ui/react";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { InfoIcon, AtSignIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";


export default function Photos() {
  const router = useRouter();
  const [data, setData] = useState<IFractionalize>();
  const pic = JSON.parse(router.query.data as string) as NFTData;
  // async function fractionalize(user: string) {
  //   const response = await axios.get("https://api-testnet.playoasisx.com/assets?owner_address=" + user);
  //   console.log(response);
  //   setPhotos(response.data);
  // }
  // const onRegistered = () => {
  // }
  function onRegistered(fractionData: IFractionalize) {
    setData(fractionData);
    console.log("onRegistered called ", JSON.stringify(fractionData));
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
            src={(!!pic) ? pic.copy_image_url : 'https://cnn.com'}
            width={300}
            height={300}
            quality={50}
            priority
            loading="eager"
          />
        </Box>
      </Center>

      <FractionalizeForm onRegistered={onRegistered} nftdata={pic} />
    </Box >

  );
}

