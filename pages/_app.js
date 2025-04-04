import "../styles/globals.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { auth } from "../pages/firebase";

import { NavBar, Footer } from "../components/componentsindex";
import { NFTMarketplaceProvider } from "../Context/NFTMarketplaceContext";
import LoginAndSignUp from "../pages/login";

const MyApp = ({ Component, pageProps }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser && !loading && router.pathname !== "/login") {
      router.push("/login");
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <LoginAndSignUp />;
  }

  return (
    <div>
      <NFTMarketplaceProvider>
        <NavBar />
        <Component {...pageProps} />
        <Footer />
      </NFTMarketplaceProvider>
    </div>
  );
};

export default MyApp;
