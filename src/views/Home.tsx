// @ts-nocheck
"use client"

import React from "react";
import Hero from "../components/home/Hero";
import USPStrip from "../components/common/USPStrip";
import BestSellers from "../components/home/BestSellers";
import About from "../components/home/About";
import HowItWorks from "../components/home/HowItWorks";
import FindYourSoulPromo from "../components/home/FindYourSoulPromo";
import BuildYourPackagePromo from "../components/home/BuildYourPackagePromo";
import CuratedCollections from "../components/home/CuratedCollections";

export default function Home() {
  return (
    <>
      <Hero />
      <USPStrip />
      <CuratedCollections />
      <BestSellers />
      <About />
      <HowItWorks />
      <FindYourSoulPromo />
      <BuildYourPackagePromo />
    </>
  );
}
