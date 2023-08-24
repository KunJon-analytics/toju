import { Field } from "formik";
import {
  FormLabel,
  FormControl,
  Input as ChakraInput,
  FormErrorMessage,
} from "@chakra-ui/react";

export const Input = ({ name, label, error = null, touched, ...rest }) => {
  return (
    <FormControl isInvalid={!!error && touched}>
      {!!label && <FormLabel htmlFor={name}>{label}</FormLabel>}
      <Field
        as={ChakraInput}
        name={name}
        id={name}
        focusBorderColor="green.500"
        bgColor="gray.900"
        variant="filled"
        _hover={{
          bgColor: "gray.900",
        }}
        size="lg"
        {...rest}
      />

      {!!error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};
