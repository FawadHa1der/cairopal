import React, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import {
    Box,
    Container,
    Text,
    Wrap,
    WrapItem,
    Input,
    IconButton,
    InputRightElement,
    InputGroup,
    useToast,
    Flex,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { Button } from "@chakra-ui/react";
import { useStarknet } from "@starknet-react/core";
import { useRouter } from "next/router";
import axios from "axios";
export interface NFTData {
    contract_address: string;
    name: string;
    description: string;
    token_id: string;
    copy_image_url: string;
    owner_address: string;
}

const Gallery = () => {
    const { account, hasStarknet, connectBrowserWallet } = useStarknet();

    const [photos, setPhotos] = useState<NFTData[]>();
    const [query, setQuery] = useState("");
    const toast = useToast();
    // const [nfts, setNFTS] = useState();
    useEffect(() => {
        async function getNFTS(user: string) {
            fetch("https://api-testnet.playoasisx.com/assets?owner_address=" + user)
                .then(res => res.json())
                .then(setPhotos)
            console.log(photos);
        }

        (!!account) ? getNFTS(account) : getNFTS('0x048bcf2ccba6f1610e7af4c3bbe5a1ee30db815647d8782e66eb18737e8e0c5f')
    }, [account, hasStarknet])

    // const handleSubmit = async (e) => {
    //     await e.preventDefault();
    //     if (query == "") {
    //         toast({
    //             title: "Error.",
    //             description: "Empty Search",
    //             status: "error",
    //             duration: 9000,
    //             isClosable: true,
    //             position: "top",
    //         });
    //     } else {
    //         const res = await getQueryPhotos(query);
    //         await setPhotos(res);
    //         await setQuery("");
    //     }
    // };

    return (
        <div>
            <Head>
                <title>Your NFTs, select an image to fractionalize</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Box overflow="hidden" bg="purple.100" minH="100vh">
                <Container>
                    <Text
                        color="pink.800"
                        fontWeight="semibold"
                        mb="1rem"
                        textAlign="center"
                        textDecoration="underline"
                        fontSize={["4xl", "4xl", "5xl", "5xl"]}
                    >
                        Your NFTs, select an image to fractionalize
                    </Text>
                    {/* <form onSubmit={handleSubmit}>
                        <InputGroup pb="1rem">
                            <Input
                                placeholder="Search for Apple"
                                variant="ghost"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />

                            <InputRightElement
                                children={
                                    <IconButton
                                        aria-label="Search"
                                        icon={<SearchIcon />}
                                        bg="pink.400"
                                        color="white"
                                        onClick={handleSubmit}
                                    />
                                }
                            />
                        </InputGroup>
                    </form> */}
                </Container>
                <Wrap px="1rem" spacing={4} justify="center">
                    {photos?.map((pic) => (
                        <WrapItem
                            key={pic.token_id}
                            boxShadow="base"
                            rounded="20px"
                            overflow="hidden"
                            bg="white"
                            lineHeight="0"
                            _hover={{ boxShadow: "dark-lg" }}
                        >
                            <Link href={{ pathname: `/photos/${pic.token_id}`, query: { data: JSON.stringify(pic) } }}>
                                <a>
                                    <Image
                                        src={pic.copy_image_url}
                                        height={200}
                                        width={200}
                                        alt={pic.copy_image_url}
                                    />
                                </a>
                            </Link>
                        </WrapItem>
                    ))}
                </Wrap>
                <Flex my="1rem" justify="center" align="center" direction="column">
                    <a target="_blank" href="https://www.pexels.com">
                    </a>
                    <a
                        href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Powered by
                        <Image
                            src="/vercel.svg"
                            width={283 / 4}
                            height={64 / 4}
                            alt="Vercel Logo"
                        />
                    </a>
                </Flex>
            </Box>
        </div>
    );
};

export default Gallery;


// export async function getServerSideProps() {
//     const data = await getCuratedPhotos();
//     return {
//         props: {
//             data,
//         },
//     };
// }
