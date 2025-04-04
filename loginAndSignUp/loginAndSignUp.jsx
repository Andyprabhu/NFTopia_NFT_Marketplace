import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";

// Firebase imports
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { auth } from "../pages/firebase";

import Style from "./loginAndSignUp.module.css";
import images from "../img";
import { Button } from "../components/componentsindex.js";

const LoginAndSignUp = () => {
  const [activeBtn, setActiveBtn] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  const socialImage = [
    {
      social: images.google,
      name: "Continue with Google",
    },
    {
      social: images.github,
      name: "Continue with Github",
    },
  ];

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        router.push("/");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/");
      }
    } catch (error) {
      alert(`Firebase Authentication Error: ${error.message}`);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (error) {
      alert(`Google Sign-in Error: ${error.message}`);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      router.push("/");
    } catch (error) {
      alert(`Github Sign-in Error: ${error.message}`);
    }
  };

  return (
    <div className={Style.user}>
      <div className={Style.user_box}>
        <div className={Style.user_box_social}>
          {socialImage.map((el, i) => (
            <div
              key={i + 1}
              onClick={() => {
                if (el.name === "Continue with Google") {
                  handleGoogleSignIn();
                } else if (el.name === "Continue with Github") {
                  handleGithubSignIn();
                } else {
                  setActiveBtn(i + 1);
                }
              }}
              className={`${Style.user_box_social_item} ${
                activeBtn === i + 1 ? Style.active : ""
              }`}
            >
              <Image
                src={el.social}
                alt={el.name}
                width={30}
                height={30}
                className={Style.user_box_social_item_img}
              />
              <p>
                <span>{el.name}</span>
              </p>
            </div>
          ))}
        </div>
        <p className={Style.user_box_or}>OR</p>

        <form onSubmit={handleSubmit} className={Style.user_box_input}>
          <div className={Style.user_box_input_box}>
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              placeholder="example@example.com"
              id="email"
              value={email}
              onChange={handleEmailChange}
            />
          </div>

          <div className={Style.user_box_input_box}>
            <label
              htmlFor="password"
              className={Style.user_box_input_box_label}
            >
              <p>Password</p>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>

          <Button
            btnName={isSignUp ? "Sign Up" : "Continue"}
            classStyle={Style.button}
            type="submit"
          />
        </form>

        <button
          type="button"
          className={Style.toggleButton}
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp
            ? "Already have an account? Sign In"
            : "Need an account? Sign Up"}
        </button>
      </div>
    </div>
  );
};

export default LoginAndSignUp;
