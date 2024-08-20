"use client";

import Container from "../components/Common/Container";
import ScrollUp from "../components/Common/ScrollUp";
import Features from "../components/Features/Features";
import Hero from "../components/Hero";
import Pricing from "../components/Pricing/Pricing";
import Testimonials from "../components/Testimonials/Testimonials";

export default function Home() {
  return (
    <Container>
      <ScrollUp />
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
    </Container>
  );
}
