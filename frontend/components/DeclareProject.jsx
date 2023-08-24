import React from "react";
import { Formik } from "formik";
import * as yup from "yup";
import { useRouter } from "next/router";
import { Flex, SimpleGrid, VStack, HStack, Button } from "@chakra-ui/react";
import { Input } from "../components/Form/Input";
import { parseEther } from "viem";

const DeclareSchema = yup.object().shape({
  coolDownInterval: yup
    .number()
    .positive("Cooldown Interval cannot be negative")
    .integer("Cooldown interval must be an integer")
    .min(1, "Cooldown interval must be greater than 1")
    .required("Cooldown interval is required"),
  maxTokenSoldCount: yup
    .number()
    .positive("Available tokens cannot be negative")
    .required("Available tokens is required"),
  stakeRate100: yup
    .number()
    .positive("Stake % cannot be negative")
    .min(0.01, "Stake % must be greater than 0.01")
    .max(100, "Stake % must be less than 100")
    .required("Stake % is required"),
  projectDescription: yup
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .required("Description is required"),
});

const DeclareProject = ({ setProject, setStage }) => {
  const router = useRouter();
  const handleDeclareSubmit = (values) => {
    setProject((project) => {
      return {
        ...project,
        ...values,
        maxTokenSoldCount: parseEther(String(values.maxTokenSoldCount)),
      };
    });
    setStage(1);
  };
  return (
    <Formik
      initialValues={{
        coolDownInterval: "",
        maxTokenSoldCount: "",
        projectDescription: "",
        stakeRate100: "",
      }}
      validationSchema={DeclareSchema}
      onSubmit={handleDeclareSubmit}
    >
      {({ handleSubmit, errors, touched }) => (
        <form onSubmit={handleSubmit}>
          <VStack spacing="8">
            <SimpleGrid minChildWidth="240px" spacing={["6", "8"]} w="100%">
              <Input
                name="projectDescription"
                label="Project Description"
                error={errors.projectDescription}
                touched={touched.projectDescription}
              />
            </SimpleGrid>

            <SimpleGrid minChildWidth="240px" spacing={["6", "8"]} w="100%">
              <Input
                name="coolDownInterval"
                label="Cooldown Interval"
                type="number"
                error={errors.coolDownInterval}
                touched={touched.coolDownInterval}
              />
              <Input
                name="maxTokenSoldCount"
                label="Available tokens"
                type="number"
                error={errors.maxTokenSoldCount}
                touched={touched.maxTokenSoldCount}
              />
            </SimpleGrid>

            <SimpleGrid minChildWidth="240px" spacing={["6", "8"]} w="100%">
              <Input
                name="stakeRate100"
                label="% Stake"
                type="number"
                error={errors.stakeRate100}
                touched={touched.stakeRate100}
              />
            </SimpleGrid>
          </VStack>
          <Flex mt="8" justify="flex-end">
            <HStack>
              <Button
                onClick={() => {
                  router.push("/projects");
                }}
                colorScheme="whiteAlpha"
              >
                Cancel
              </Button>
              <Button colorScheme="green" type="submit">
                Save
              </Button>
            </HStack>
          </Flex>
        </form>
      )}
    </Formik>
  );
};

export default DeclareProject;
