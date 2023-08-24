import { useAccount } from "wagmi";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";

export default function useConnected() {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toShow = useMemo(() => {
    return mounted && isConnected;
  }, [mounted, isConnected]);

  useEffect(() => {
    if (!isConnected) {
      router.push("/");
    }
  }, [toShow]);

  return { toShow };
}
