"use client";

import { useState } from "react";
import { api } from "$/src/trpc/react";
import ScrollUp from "../components/Common/ScrollUp";
import Features from "../components/Features";
import Hero from "../components/Hero/hero";
import Pricing from "../components/Pricing";
import Testimonials from "../components/Testimonials";

export default function Home() {
  //define constants
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameToUpdate, setNameToUpdate] = useState("");
  const [emailToUpdate, setEmailToUpdate] = useState("");
  const [userId, setUserId] = useState("");
  const [userIdToUpdate, setUserIdToUpdate] = useState("");
  const [userIdToDelete, setUserIdToDelete] = useState("");

  //define functions
  const fetchAllUsers = api.user.getAll.useQuery();
  const fetchOneUser = api.user.getOne.useQuery({ id: userId });

  const createUserMutation = api.user.createUser.useMutation();
  const updateUserMutation = api.user.updateUser.useMutation();
  const deleteUserMutation = api.user.deleteUser.useMutation();

  //define handlers
  const handleCreateUser = async () => {
    try {
      await createUserMutation.mutateAsync({
        name: name,
        email: email,
      });
      setName("");
      setEmail("");
      fetchAllUsers.refetch().catch(() => {
        console.log("Error fetching all users");
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateUser = async () => {
    try {
      await updateUserMutation.mutateAsync({
        id: userIdToUpdate,
        name: nameToUpdate,
        email: emailToUpdate,
      });
      setNameToUpdate("");
      setEmailToUpdate("");
      setUserIdToUpdate("");
      fetchAllUsers.refetch().catch(() => {
        console.log("Error fetching all users");
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUserMutation.mutateAsync({
        id: userIdToDelete,
      });
      setUserIdToDelete("");
      fetchAllUsers.refetch().catch(() => {
        console.log("Error fetching all users");
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <ScrollUp />
      <Hero />
      <Features />
      <Testimonials />
      <Pricing />
    </>
  );
}
