import { Box } from "@chakra-ui/react";
import { Header } from "../components/Header/index";
import Footer from "../components/Footer";

export default function MainLayout({ children }) {
  return (
    <Box>
      <Header />
      {children}
      <Footer />
    </Box>
  );
}
