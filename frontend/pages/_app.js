import "@rainbow-me/rainbowkit/styles.css";
import "react-toastify/dist/ReactToastify.css";

import {
  getDefaultWallets,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { ToastContainer } from "react-toastify";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { SidebarDrawerProvider } from "../contexts/SidebarDrawerContext";
import { ChakraProvider } from "@chakra-ui/react";
import { Roboto } from "@next/font/google";
import { sepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import MainLayout from "../layout/mainLayout";
import { theme } from "../styles/theme";

const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] });

const { chains, publicClient } = configureChains([sepolia], [publicProvider()]);

const { connectors } = getDefaultWallets({
  appName: "Toju",
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

// export { WagmiConfig, RainbowKitProvider };
function MyApp({ Component, pageProps }) {
  return (
    <>
      <style jsx global>
        {`
          :root {
            --font-roboto: ${roboto.style.fontFamily};
          }
        `}
      </style>
      <ChakraProvider theme={theme}>
        <ToastContainer theme="dark" />
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider
            modalSize="compact"
            theme={darkTheme({
              ...darkTheme.accentColors.green,
            })}
            initialChain={process.env.NEXT_PUBLIC_DEFAULT_CHAIN}
            chains={chains}
          >
            <SidebarDrawerProvider>
              <MainLayout>
                <Component {...pageProps} />
              </MainLayout>
            </SidebarDrawerProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </ChakraProvider>
    </>
  );
}

export default MyApp;
