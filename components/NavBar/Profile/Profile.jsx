import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  FaUserAlt,
  FaRegImage,
  FaUserEdit,
  FaSignOutAlt,
} from "react-icons/fa";
import { MdHelpCenter } from "react-icons/md";
import { TbDownload } from "react-icons/tb";
import Link from "next/link";
import { auth } from "../../../pages/firebase";
import { useRouter } from "next/router";

// INTERNAL IMPORT
import Style from "./Profile.module.css";
import images from "../../../img";

const Profile = ({ currentAccount = "" }) => {
  const [displayName, setDisplayName] = useState("Unnamed User");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setDisplayName(user.displayName || user.email || "User");
      } else {
        setDisplayName("Unnamed User");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push("/loginandsignup");
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  return (
    <div className={Style.profile}>
      <div className={Style.profile_account}>
        <Image
          src={images.user1 || "/default-profile.png"}
          alt="user profile"
          width={50}
          height={50}
          className={Style.profile_account_img}
        />

        <div className={Style.profile_account_info}>
          <p>{displayName}</p>
          <small>
            {currentAccount
              ? currentAccount.slice(0, 6) + "..." + currentAccount.slice(-4)
              : "No Account Connected"}
          </small>
        </div>
      </div>

      <div className={Style.profile_menu}>
        <div className={Style.profile_menu_one}>
          <div className={Style.profile_menu_one_item}>
            <FaUserAlt />
            <p>
              <Link href="/author">My Profile</Link>
            </p>
          </div>
          <div className={Style.profile_menu_one_item}>
            <FaRegImage />
            <p>
              <Link href="/author">My Items</Link>
            </p>
          </div>
          <div className={Style.profile_menu_one_item}>
            <FaUserEdit />
            <p>
              <Link href="/account">Edit Profile</Link>
            </p>
          </div>
        </div>

        <div className={Style.profile_menu_two}>
          <div className={Style.profile_menu_one_item}>
            <MdHelpCenter />
            <p>
              <Link href="/contactus">Help</Link>
            </p>
          </div>
          <div className={Style.profile_menu_one_item}>
            <TbDownload />
            <p>
              <Link href="/aboutus">About Us</Link>
            </p>
          </div>

          <div className={Style.profile_menu_one_item} onClick={handleLogout}>
            <FaSignOutAlt />
            <p>Logout</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
