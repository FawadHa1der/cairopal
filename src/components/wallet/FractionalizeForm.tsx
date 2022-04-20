
import { useForm } from "react-hook-form";
import React from "react";
import { FormErrorMessage, FormLabel, FormControl, Input, Button } from "@chakra-ui/react";
import { number } from "starknet";
import { useRouter } from "next/router";

interface IFractionalize {
    no_of_ricks: number;
    inflation: number;
}

interface IFractionalizeFormProps {
    onRegistered: (data: IFractionalize) => void;
}

export default function FractionalizeForm({ onRegistered }: IFractionalizeFormProps) {
    const {
        handleSubmit, // handels the form submit event
        register, // ties the inputs to react-form
        formState: { errors, isSubmitting }, // gets errors and "loading" state
    } = useForm();


    const router = useRouter();
    const pic = router.query;

    return (
        <form onSubmit={handleSubmit(onRegistered)} noValidate>
            {/* noValidate will stop the browser validation, so we can write our own designs and logic */}
            <FormControl >
                <FormLabel >
                    Token ID {pic.token_id}
                    {/* the form label from chakra ui is tied to the input via the htmlFor attribute */}
                </FormLabel>
            </FormControl >
            <FormControl isInvalid={errors.no_of_ricks} >
                <FormLabel htmlFor="no_of_ricks">
                    No of Initial Ricks
                    {/* the form label from chakra ui is tied to the input via the htmlFor attribute */}
                </FormLabel>

                {/* you should use the save value for the id and the property name */}
                <Input
                    id="no_of_ricks"
                    placeholder="100"
                    {
                    ...register("no_of_ricks", {
                        required: "Don't forget the initial number of fractions or ricks",
                    }) /* this register function will take care of the react-form binding to the ui */
                    }
                ></Input>
                {/* react-form will calculate the errors on submit or on dirty state */}
                <FormErrorMessage>{errors.no_of_ricks && errors.no_of_ricks.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={errors.inflation}>
                <FormLabel required htmlFor="inflation">
                    Inflation rate (50 = 5%)
                </FormLabel>
                <Input
                    id="inflation"
                    placeholder="50"
                    {...register("inflation", {
                        required: "please enter the inflation rate?",
                    })}
                ></Input>
                <FormErrorMessage>{errors.inflation && errors.inflation.message}</FormErrorMessage>
            </FormControl>
            <Button mt={10} colorScheme="blue" isLoading={isSubmitting} type="submit">
                Fractionalize 🐱‍🏍
            </Button>
        </form>
    );
}
