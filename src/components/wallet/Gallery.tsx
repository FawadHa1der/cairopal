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
import { getQueryPhotos } from "../../lib/api";
import { Button } from "@chakra-ui/react";
import { useStarknet } from "@starknet-react/core";
import { useRouter } from "next/router";
import axios from "axios";


const Gallery = () => {
    const { account, hasStarknet, connectBrowserWallet } = useStarknet();

    const [photos, setPhotos] = useState(null);
    const [query, setQuery] = useState("");
    const toast = useToast();
    // const [nfts, setNFTS] = useState();
    useEffect(() => {
        async function getNFTS(user: String) {
            const response = await axios.get("https://api-testnet.playoasisx.com/assets?owner_address=" + user);
            console.log(response);
            setPhotos(response.data);
        }

        getNFTS(account);
    }, [])

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
                <title> NextJS Image Gallery</title>
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
                        NextJS Image Gallery
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
                            <a>
                                <Image
                                    src={pic.copy_image_url}
                                    height={600}
                                    width={400}
                                    alt={pic.copy_image_url}
                                />
                            </a>
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
